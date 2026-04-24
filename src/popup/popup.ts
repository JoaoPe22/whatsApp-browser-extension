import browser from "webextension-polyfill";
import type {
  ExtensionMessage,
  ExtensionMessageResponse,
} from "../shared/messages";

const checkButton = document.querySelector<HTMLButtonElement>("#check-button");
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

const sendPing = async (): Promise<void> => {
  const message: ExtensionMessage = {
    type: "POPUP_PING",
  };

  try {
    setStatus("Checking background response...");
    const response = (await browser.runtime.sendMessage(
      message,
    )) as ExtensionMessageResponse;

    setStatus(response.message);
    setOutput(response.data ?? { info: "No stored page info yet" });
  } catch (error) {
    setStatus("Failed to contact extension background");
    setOutput({ error: String(error) });
  }
};

if (checkButton) {
  checkButton.addEventListener("click", () => {
    void sendPing();
  });
}

void sendPing();
