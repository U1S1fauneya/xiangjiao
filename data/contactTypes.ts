export type ContactDiscoveryStatus = "found" | "not_found" | "invalid" | "blocked" | "error";

export type ContactItem = {
  value: string;
  sourceUrl: string;
  sourceTitle?: string;
};

export type ContactPageItem = {
  title: string;
  url: string;
};

export type ContactDiscoveryResponse = {
  status: ContactDiscoveryStatus;
  message: string;
  sourceUrl: string;
  checkedUrls: string[];
  emails: ContactItem[];
  phones: ContactItem[];
  contactPages: ContactPageItem[];
};
