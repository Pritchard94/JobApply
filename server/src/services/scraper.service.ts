import puppeteer, { Browser } from "puppeteer";
import { logger } from "../utils/logger.js";

export class ScraperService {
  private browser: Browser | null = null;

  private async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    return this.browser;
  }

  /**
   * Simple job details scraper (can be expanded for specific sites)
   */
  async getJobDetails(url: string) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      
      // Basic extraction - this is highly dependent on the site
      const details = await page.evaluate(() => {
        return {
          title: document.querySelector("h1")?.innerText,
          company: document.querySelector(".company")?.textContent || document.querySelector('[class*="company"]')?.textContent,
          description: document.body.innerText.slice(0, 5000), // Cap it
        };
      });

      return details;
    } catch (error) {
      logger.error({ err: error }, "Scraping error:");
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Automate a form submission (Stub for specific sites)
   */
  async autoSubmitForm(url: string, userData: any) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      
      // Site specific logic would go here
      // For now, we just return that it's not implemented for generic sites
      logger.info(`Auto-submit not fully implemented for generic URL: ${url}`);
      return false;
    } catch (error) {
      logger.error({ err: error }, "Auto-submit error:");
      return false;
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const scraperService = new ScraperService();
