const LAST_PAGE_INFO_KEY = "lastWhatsAppPageInfo";
const DISPLAY_NAME_KEY = "displayName";
const ENABLED_KEY = "displayNameEnabled";

type LastPageInfo = {
  title: string;
  url: string;
  receivedAt: string;
};

type DisplayNameState = {
  name: string;
  updatedAt: string;
};

type EnabledState = {
  enabled: boolean;
  updatedAt: string;
};

export { DISPLAY_NAME_KEY, ENABLED_KEY, LAST_PAGE_INFO_KEY };
export type { DisplayNameState, EnabledState, LastPageInfo };
