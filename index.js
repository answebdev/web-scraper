const PORT = 8000;
const axios = require('axios');
const express = require('express');
const cheerio = require('cheerio');
const app = express();
const cors = require('cors');

app.use(cors());

const url = 'https://www.theguardian.com/uk';

app.get('/', function (req, res) {
  res.json('This is my web scraper');
});

app.get('/results', (req, res) => {
  axios(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const articles = [];

      // 1. Target ONLY links inside the main content area
      $('main a, #maincontent a, div[role="main"] a').each(function () {
        const $link = $(this);
        const href = $link.attr('href');

        if (!href) return;

        // Clone the link to safely clean its inner HTML
        const $linkClone = $link.clone();

        // 2. Remove kicker elements, category badges, and screen-reader elements
        $linkClone
          .find(
            '[data-component="kicker"], .fc-item__kicker, [class*="kicker"]'
          )
          .remove();
        $linkClone.find('.visually-hidden, [aria-hidden="true"]').remove();

        // Extract raw text and collapse multiple spaces/newlines
        let title = $linkClone.text().replace(/\s+/g, ' ').trim();

        // 3. Strip residual leading kickers/section names if they got merged into the text
        title = title.replace(
          /^(UK economy|US news|UK news|World news|Television|Culture|Sport|Business|Opinion|Live)\s*/i,
          ''
        );

        // 4. Filter criteria for valid headline titles
        const isValidTitle =
          title.length > 15 &&
          !title.startsWith('View all') &&
          !title.startsWith('Skip to');

        if (isValidTitle) {
          // Prevent duplicates
          const exists = articles.some((item) => item.url === href);
          if (!exists) {
            articles.push({ title, url: href });
          }
        }
      });

      console.log(articles);
      console.log(`Total scraped articles: ${articles.length}`);

      res.json(articles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
