import { chromium } from "playwright";
import download from "download";

const config = { baseURL: "https://en.wikipedia.org/" };

const browser = await chromium.launch();
const page = await browser.newPage(config);
await page.goto("https://en.wikipedia.org/wiki/Rider–Waite_tarot_deck");

await page.waitForSelector("#Major_Arcana");

const imagePageLinks = await page.evaluate(() => {
  const img = document.querySelectorAll("ul.gallery div.thumb a.image");
  return [...img].map((i) => i.getAttribute("href"));
});

const imageLinks = [];
for await (const link of imagePageLinks) {
  await page.goto(link);
  await page.waitForSelector(
    "#mw-content-text div.fullImageLink#file a:not([class])"
  );
  const imageLink = await page
    .locator("#mw-content-text div.fullImageLink#file a:not([class])")
    .getAttribute("href");

  imageLinks.push(`https:${imageLink}`);
}

for await (const link of imageLinks) {
  const filename = ["minor", link.split("/").pop().toLowerCase()]
    .join("_")
    .replace("minor_rws_tarot", "major")
    .replace("pents", "pentacles")
    .replace("minor_thelovers.jpg", "major_06_lovers.jpg")
    .replace("minor_tarot_nine_of_wands.jpg", "minor_wands09.jpg")
    .replace(/(\d{2})\.jpg$/, "_$1.jpg")
    .replace(/_(\d{2})_.*\.jpg$/, "_$1.jpg");

  console.log(link, filename);

  await download(link, "imgs", { filename });
}

browser.close();
