import express from "express";
import { chromium } from "playwright";
import { PlaywrightCrawler, Dataset } from "crawlee";
import AxeBuilder from "@axe-core/playwright";

export interface Violation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  nodes: string[];
}

export interface CheckA11yResponse {
  url: string;
  violations: Violation[];
  incomplete: Violation[];
  inapplicable: Violation[];
}

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

app.post("/crawl", async (req, res) => {
  const { url } = req.body; // Extract URL from request body

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  const links: string[] = [];

  try {
    const crawler = new PlaywrightCrawler({
      // Use the requestHandler to process each of the crawled pages.
      async requestHandler({ request, page, enqueueLinks, log }) {
        const title = await page.title();
        // Save results as JSON to ./storage/datasets/default
        await Dataset.pushData({ title, url: request.loadedUrl });

        links.push(request.loadedUrl ?? "");

        // Extract links from the current page
        // and add them to the crawling queue.
        await enqueueLinks();
      },
      // Uncomment this option to see the browser window.
      headless: false,
    });

    await crawler.run([url]);
    res.json({ links });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error processing crawl" });
  }
});

const groupByLink = (acc: any, curr: any) => {
  const url = curr.link;
  if (!acc[url]) {
    acc[url] = [];
  }
  acc[url].push(curr);
  return acc;
};

app.post("/check-a11y", async (req, res) => {
  const body = req.body;
  const url = body.url;
  console.log(url);

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }
  const links: string[] = [];
  try {
    const crawler = new PlaywrightCrawler({
      // Use the requestHandler to process each of the crawled pages.
      async requestHandler({ request, page, enqueueLinks, log }) {
        links.push(request.loadedUrl ?? "");

        await enqueueLinks();
      },
    });

    await crawler.run([url]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error processing crawl" });
  }

  let violations: any[] = [];
  let incompleteRules: any[] = [];
  let inapplicableRules: any[] = [];

  try {
    const browser = await chromium.launch();
    const ctx = await browser.newContext();

    const promises = links.map(async (link) => {
      const page = await ctx.newPage();
      await page.goto(link);
      const results = await new AxeBuilder({ page }).analyze();
      const vs = results.violations.map((v) => createViolation(v, link));
      const ir = results.incomplete.map((v) => createViolation(v, link));
      const inr = results.inapplicable.map((v) => createViolation(v, link));

      violations.push(vs.reduce(groupByLink, {}));
      incompleteRules.push(ir.reduce(groupByLink, {}));
      inapplicableRules.push(inr.reduce(groupByLink, {}));
    });

    await Promise.all(promises);

    await browser.close();
    res.json({ url, violations, incompleteRules, inapplicableRules });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error processing accessibility check" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Accessibility checker running at http://localhost:${port}`);
});

const createViolation = (v: any, url: string) => ({
  id: v.id,
  impact: v.impact,
  description: v.description,
  link: url,
  nodes: v.nodes.map((node: any) => node.html),
});
