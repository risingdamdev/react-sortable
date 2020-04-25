import { Page } from "playwright";

export const test = async (page: Page) => {
  await page.goto("");
};
