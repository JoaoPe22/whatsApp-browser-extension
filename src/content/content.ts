import type { ExtensionMessage } from "../shared/messages";

const DISPLAY_NAME_KEY = "displayName";
const ENABLED_KEY = "displayNameEnabled";

type DisplayNameState = {
  name: string;
  updatedAt: string;
};

type EnabledState = {
  enabled: boolean;
  updatedAt: string;
};

const isVisibleElement = (element: Element): boolean => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const getInputElements = (): HTMLDivElement[] => {
  const selectors = [
    "div[data-testid='conversation-compose-box-input']",
    "div[role='textbox'][contenteditable='true'][data-lexical-editor='true']",
    "div[role='textbox'][contenteditable='true']",
    "div[contenteditable='true'][data-tab]",
  ];

  const matches = new Set<HTMLDivElement>();
  const activeElement = document.activeElement;

  if (
    activeElement instanceof HTMLDivElement &&
    activeElement.isContentEditable
  ) {
    if (isVisibleElement(activeElement)) {
      matches.add(activeElement);
    }
  }

  for (const selector of selectors) {
    const elements = Array.from(
      document.querySelectorAll<HTMLDivElement>(selector),
    ).filter((element) => isVisibleElement(element));

    for (const element of elements) {
      matches.add(element);
    }
  }

  return Array.from(matches);
};

const getTextFromInput = (input: HTMLDivElement): string => {
  return input.innerText ?? "";
};

const insertText = (input: HTMLDivElement, value: string): void => {
  input.focus();
  const selection = window.getSelection();
  if (selection) {
    selection.selectAllChildren(input);
    selection.collapseToEnd();
  }

  if (document.queryCommandSupported?.("insertText")) {
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, value);
  } else {
    input.textContent = value;
  }

  input.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: value,
    }),
  );
};

const withPrefix = (prefix: string, value: string): string => {
  if (!prefix) {
    return value;
  }

  const normalizedPrefix = prefix.trim();
  const normalizedValue = value.trim();

  const firstLine = normalizedValue.split(/\r?\n/)[0];
  if (!normalizedValue || firstLine === normalizedPrefix) {
    return value;
  }

  return `${normalizedPrefix}\n${normalizedValue}`;
};

const applyPrefixToInput = (input: HTMLDivElement, prefix: string): boolean => {
  const currentValue = getTextFromInput(input);
  const nextValue = withPrefix(prefix, currentValue);

  if (nextValue !== currentValue) {
    insertText(input, nextValue);
    return true;
  }

  return false;
};

const onDisplayNameMessage = (payload: { name: string }): void => {
  currentDisplayName = payload.name;
};

const loadStoredDisplayName = async (): Promise<string> => {
  const stored = await new Promise<Record<string, unknown>>((resolve) => {
    chrome.storage.local.get(DISPLAY_NAME_KEY, (result) => {
      resolve(result);
    });
  });

  const value = stored[DISPLAY_NAME_KEY] as DisplayNameState | undefined;
  return value?.name ?? "";
};

const loadStoredEnabled = async (): Promise<boolean> => {
  const stored = await new Promise<Record<string, unknown>>((resolve) => {
    chrome.storage.local.get(ENABLED_KEY, (result) => {
      resolve(result);
    });
  });

  const value = stored[ENABLED_KEY] as EnabledState | undefined;
  return value?.enabled ?? true;
};

let currentDisplayName = "";
let isEnabled = true;

const sendPageInfo = async (): Promise<void> => {
  const message: ExtensionMessage = {
    type: "WA_PAGE_INFO",
    payload: {
      title: document.title,
      url: window.location.href,
    },
  };

  await new Promise<void>((resolve, reject) => {
    chrome.runtime.sendMessage(message, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
};

void sendPageInfo().catch(() => undefined);

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === "SET_DISPLAY_NAME") {
    onDisplayNameMessage(message.payload);
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }

  if (changes[DISPLAY_NAME_KEY]) {
    const nextValue = changes[DISPLAY_NAME_KEY].newValue as
      | DisplayNameState
      | undefined;
    currentDisplayName = nextValue?.name ?? "";
  }

  if (changes[ENABLED_KEY]) {
    const nextValue = changes[ENABLED_KEY].newValue as EnabledState | undefined;
    isEnabled = nextValue?.enabled ?? true;
  }
});

const shouldHandleEventTarget = (
  target: EventTarget | null,
): target is HTMLDivElement => {
  if (!(target instanceof HTMLDivElement)) {
    return false;
  }

  if (!target.isContentEditable) {
    return false;
  }

  if (!isVisibleElement(target)) {
    return false;
  }

  return true;
};

const getPrimaryInput = (): HTMLDivElement | null => {
  const activeElement = document.activeElement;

  if (
    activeElement instanceof HTMLDivElement &&
    activeElement.isContentEditable &&
    isVisibleElement(activeElement)
  ) {
    return activeElement;
  }

  const inputs = getInputElements();
  return inputs[0] ?? null;
};

let isSending = false;

const applyPrefixBeforeSend = (input: HTMLDivElement): void => {
  if (!currentDisplayName || !isEnabled) {
    return;
  }

  applyPrefixToInput(input, currentDisplayName);
};

document.addEventListener("keydown", (event) => {
  if (isSending) {
    return;
  }

  if (event.key !== "Enter") {
    return;
  }

  if (event.shiftKey || event.isComposing) {
    return;
  }

  if (!shouldHandleEventTarget(event.target)) {
    return;
  }

  isSending = true;
  applyPrefixBeforeSend(event.target);

  setTimeout(() => {
    isSending = false;
  }, 0);
});

document.addEventListener(
  "click",
  (event) => {
    if (isSending) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const sendButton = target.closest<HTMLButtonElement>(
      "button[data-testid='send'], button[aria-label='Send'], button[aria-label='Enviar']",
    );

    if (!sendButton) {
      return;
    }

    const input = getPrimaryInput();
    if (!input) {
      return;
    }

    isSending = true;
    applyPrefixBeforeSend(input);
    setTimeout(() => {
      isSending = false;
    }, 0);
  },
  true,
);

void Promise.all([loadStoredDisplayName(), loadStoredEnabled()]).then(
  ([name, enabled]) => {
    currentDisplayName = name;
    isEnabled = enabled;
  },
);
