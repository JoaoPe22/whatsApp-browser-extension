type ExtensionMessage =
  | {
      type: "WA_PAGE_INFO";
      payload: {
        title: string;
        url: string;
      };
    }
  | {
      type: "POPUP_PING";
    };

type ExtensionMessageResponse = {
  ok: boolean;
  message: string;
  data?: Record<string, unknown>;
};

export type { ExtensionMessage, ExtensionMessageResponse };
