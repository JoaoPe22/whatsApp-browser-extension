import browser from "webextension-polyfill";
import type {
  ExtensionMessage,
  ExtensionMessageResponse,
} from "../shared/messages";
import {
  DISPLAY_NAME_KEY,
  ENABLED_KEY,
  LAST_PAGE_INFO_KEY,
  type EnabledState,
  type DisplayNameState,
  type LastPageInfo,
} from "../shared/storage";

const isExtensionMessage = (value: unknown): value is ExtensionMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { type?: string };

  return (
    candidate.type === "WA_PAGE_INFO" ||
    candidate.type === "POPUP_PING" ||
    candidate.type === "SET_DISPLAY_NAME" ||
    candidate.type === "GET_DISPLAY_NAME" ||
    candidate.type === "SET_ENABLED" ||
    candidate.type === "GET_ENABLED"
  );
};

const onMessage = async (
  message: ExtensionMessage,
): Promise<ExtensionMessageResponse> => {
  if (message.type === "WA_PAGE_INFO") {
    const pageInfo: LastPageInfo = {
      title: message.payload.title,
      url: message.payload.url,
      receivedAt: new Date().toISOString(),
    };

    await browser.storage.local.set({
      [LAST_PAGE_INFO_KEY]: pageInfo,
    });

    return {
      ok: true,
      message: "Page info stored",
      data: pageInfo,
    };
  }

  if (message.type === "POPUP_PING") {
    const stored = await browser.storage.local.get(LAST_PAGE_INFO_KEY);
    const pageInfo = stored[LAST_PAGE_INFO_KEY] as LastPageInfo | undefined;

    return {
      ok: true,
      message: pageInfo ? "Last page info found" : "No page info stored yet",
      data: pageInfo,
    };
  }

  if (message.type === "SET_DISPLAY_NAME") {
    const trimmedName = message.payload.name.trim();

    if (!trimmedName) {
      return {
        ok: false,
        message: "Display name cannot be empty",
      };
    }

    const displayName: DisplayNameState = {
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    };

    await browser.storage.local.set({
      [DISPLAY_NAME_KEY]: displayName,
    });

    return {
      ok: true,
      message: "Display name saved",
      data: displayName,
    };
  }

  if (message.type === "GET_DISPLAY_NAME") {
    const stored = await browser.storage.local.get(DISPLAY_NAME_KEY);
    const displayName = stored[DISPLAY_NAME_KEY] as
      | DisplayNameState
      | undefined;

    return {
      ok: true,
      message: displayName ? "Display name loaded" : "No display name saved",
      data: displayName,
    };
  }

  if (message.type === "SET_ENABLED") {
    const enabledState: EnabledState = {
      enabled: message.payload.enabled,
      updatedAt: new Date().toISOString(),
    };

    await browser.storage.local.set({
      [ENABLED_KEY]: enabledState,
    });

    return {
      ok: true,
      message: enabledState.enabled ? "Prefix enabled" : "Prefix disabled",
      data: enabledState,
    };
  }

  if (message.type === "GET_ENABLED") {
    const stored = await browser.storage.local.get(ENABLED_KEY);
    const enabledState = stored[ENABLED_KEY] as EnabledState | undefined;
    const isEnabled = enabledState?.enabled ?? true;

    return {
      ok: true,
      message: isEnabled ? "Prefix enabled" : "Prefix disabled",
      data: enabledState ?? { enabled: true },
    };
  }

  return {
    ok: false,
    message: "Unsupported message type",
  };
};

browser.runtime.onMessage.addListener((message: unknown) => {
  if (!isExtensionMessage(message)) {
    return Promise.resolve({
      ok: false,
      message: "Invalid message payload",
    });
  }

  return onMessage(message);
});
