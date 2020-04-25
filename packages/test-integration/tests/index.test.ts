import { chromium } from "playwright";
import ParcelBundler from "parcel-bundler";
import { fixtures } from "../src/index";

async function parcel() {
  const bundle = new ParcelBundler("", {});
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });

  const page = await browser.newPage();

  const [a] = fixtures;
  const url = "localhost:1234/";
  const asd = url + a.name;
  console.log(asd);
  await page.goto(asd);
  await page.waitFor(1000);
  await browser.close();
}

main();
