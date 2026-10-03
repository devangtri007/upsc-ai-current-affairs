export type NewsSource = {
  name: string;
  type: "newspaper" | "government";
  feedUrl: string;
  active: boolean;
};

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: "Press Information Bureau",
    type: "government",
    feedUrl:
      "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=48",
    active: true,
  },

  {
    name: "Indian Express - UPSC Current Affairs",
    type: "newspaper",
    feedUrl:
      "https://indianexpress.com/section/upsc-current-affairs/feed/",
    active: true,
  },
];