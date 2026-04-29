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
    }
  | {
      type: "SET_DISPLAY_NAME";
      payload: {
        name: string;
      };
    }
  | {
      type: "GET_DISPLAY_NAME";
    }
  | {
      type: "SET_ENABLED";
      payload: {
        enabled: boolean;
      };
    }
  | {
      type: "GET_ENABLED";
    };

type ExtensionMessageResponse = {
  ok: boolean;
  message: string;
  data?: Record<string, unknown>;
};

export type { ExtensionMessage, ExtensionMessageResponse };
