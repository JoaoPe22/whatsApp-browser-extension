import browser from "webextension-polyfill";
import type {
  ExtensionMessage,
  ExtensionMessageResponse,
} from "../shared/messages";
import { LAST_PAGE_INFO_KEY, type LastPageInfo } from "../shared/storage";

const isExtensionMessage = (value: unknown): value is ExtensionMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { type?: string };

  return candidate.type === "WA_PAGE_INFO" || candidate.type === "POPUP_PING";
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
