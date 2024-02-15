import express from "express";
import { chromium } from "playwright";
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

app.post("/check-a11y", async (req, res) => {
  const { url, incomplete, inapplicable } = req.body; // Extract URL from request body
  console.log(url);

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  try {
    const browser = await chromium.launch();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(url);

    const results = await new AxeBuilder({ page }).analyze();
    await browser.close();

    // Filter results to return only violations
    const violations = results.violations.map((v) => createViolation(v));

    const incompleteRules =
      incomplete && results.incomplete.map((v) => createViolation(v));
    const inapplicableRules =
      inapplicable && results.inapplicable.map((v) => createViolation(v));

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

const createViolation = (v: any) => ({
  id: v.id,
  impact: v.impact,
  description: v.description,
  nodes: v.nodes.map((node: any) => node.html),
});
