import browser from "webextension-polyfill";
import type {
  ExtensionMessage,
  ExtensionMessageResponse,
} from "../shared/messages";

const saveButton = document.querySelector<HTMLButtonElement>("#save-button");
const displayNameInput =
  document.querySelector<HTMLInputElement>("#display-name");
const enabledToggle =
  document.querySelector<HTMLInputElement>("#enabled-toggle");
const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const outputElement = document.querySelector<HTMLPreElement>("#output");

const setStatus = (status: string): void => {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = status;
};

const setOutput = (value: unknown): void => {
  if (!outputElement) {
    return;
  }

  outputElement.textContent = JSON.stringify(value, null, 2);
};

const loadDisplayName = async (): Promise<void> => {
  const message: ExtensionMessage = {
    type: "GET_DISPLAY_NAME",
  };

  try {
    const response = (await browser.runtime.sendMessage(
      message,
    )) as ExtensionMessageResponse;
    const data = response.data as { name?: string } | undefined;

    if (displayNameInput && data?.name) {
      displayNameInput.value = data.name;
    }

    setStatus(response.message);
    setOutput(response.data ?? { info: "No stored name yet" });
  } catch (error) {
    setStatus("Failed to load display name");
    setOutput({ error: String(error) });
  }
};

const loadEnabledState = async (): Promise<void> => {
  const message: ExtensionMessage = {
    type: "GET_ENABLED",
  };

  try {
    const response = (await browser.runtime.sendMessage(
      message,
    )) as ExtensionMessageResponse;
    const data = response.data as { enabled?: boolean } | undefined;

    if (enabledToggle) {
      enabledToggle.checked = data?.enabled ?? true;
    }
  } catch (error) {
    setStatus("Failed to load enabled state");
    setOutput({ error: String(error) });
  }
};

const saveDisplayName = async (): Promise<void> => {
  if (!displayNameInput) {
    return;
  }

  const message: ExtensionMessage = {
    type: "SET_DISPLAY_NAME",
    payload: {
      name: displayNameInput.value,
    },
  };

  try {
    setStatus("Saving name...");
    const response = (await browser.runtime.sendMessage(
      message,
    )) as ExtensionMessageResponse;

    setStatus(response.message);
    setOutput(response.data ?? { info: "No response data" });
  } catch (error) {
    setStatus("Failed to save display name");
    setOutput({ error: String(error) });
  }
};

const saveEnabledState = async (enabled: boolean): Promise<void> => {
  const message: ExtensionMessage = {
    type: "SET_ENABLED",
    payload: {
      enabled,
    },
  };

  try {
    const response = (await browser.runtime.sendMessage(
      message,
    )) as ExtensionMessageResponse;
    setStatus(response.message);
    setOutput(response.data ?? { info: "No response data" });
  } catch (error) {
    setStatus("Failed to save enabled state");
    setOutput({ error: String(error) });
  }
};

if (saveButton) {
  saveButton.addEventListener("click", () => {
    void saveDisplayName();
  });
}

if (enabledToggle) {
  enabledToggle.addEventListener("change", () => {
    void saveEnabledState(enabledToggle.checked);
  });
}

void loadDisplayName();
void loadEnabledState();
