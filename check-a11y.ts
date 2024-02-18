import { chromium } from "playwright";
import { PlaywrightCrawler, Dataset } from "crawlee";
import AxeBuilder from "@axe-core/playwright";

const crawler = new PlaywrightCrawler({
  // Use the requestHandler to process each of the crawled pages.
  async requestHandler({ request, page, enqueueLinks, log }) {
    const title = await page.title();
    log.info(`Title of ${request.loadedUrl} is '${title}'`);

    // Save results as JSON to ./storage/datasets/default
    // await Dataset.pushData({ title, url: request.loadedUrl });

    // Extract links from the current page
    // and add them to the crawling queue.
    await enqueueLinks();
  },
  // Uncomment this option to see the browser window.
  // headless: false,
});

const links: string[] = [];

export const checkA11y = async (url: string) => {
  if (!url) {
    console.log("Please provide a URL");
  }

  //   await crawler.run([url]);
  //   //   } catch (error) {
  //   //     console.error(error);
  //   //     console.log({ error: "Error processing crawl" });
  //   //   }

  //   let violations: any[] = [];
  //   let incompleteRules: any[] = [];
  //   let inapplicableRules: any[] = [];

  //   return links;
  //   try {
  //     const browser = await chromium.launch();
  //     const ctx = await browser.newContext();

  //     const promises = links.map(async (link) => {
  //       const page = await ctx.newPage();
  //       await page.goto(link);
  //       const results = await new AxeBuilder({ page }).analyze();
  //       const vs = results.violations.map((v) => createViolation(v, link));
  //       const ir = results.incomplete.map((v) => createViolation(v, link));
  //       const inr = results.inapplicable.map((v) => createViolation(v, link));

  //       violations.push(vs.reduce(groupByLink, {}));
  //       incompleteRules.push(ir.reduce(groupByLink, {}));
  //       inapplicableRules.push(inr.reduce(groupByLink, {}));
  //     });

  //     await Promise.all(promises);
  //     console.log(violations);

  //     // await page.goto(url);

  //     // const results = await new AxeBuilder({ page }).analyze();
  //     await browser.close();
  //   } catch (error) {
  //     console.error(error);
  //     console.log({ error: "Error processing accessibility check" });
  //   }
};

const createViolation = (v: any, url: string) => ({
  id: v.id,
  impact: v.impact,
  description: v.description,
  link: url,
  nodes: v.nodes.map((node: any) => node.html),
});

const groupByLink = (acc: any, curr: any) => {
  const url = curr.link;
  if (!acc[url]) {
    acc[url] = [];
  }
  acc[url].push(curr);
  return acc;
};
