import type { ExtensionMessage } from "../shared/messages";

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
