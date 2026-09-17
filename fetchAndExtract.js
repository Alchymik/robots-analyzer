import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export async function fetchText(url) {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': UA },
    timeout: 20000,
  });

  const $ = cheerio.load(html);

  $('script, style, noscript, iframe, nav, footer, header, aside, .menu, .sidebar, .comments').remove();

  const selectors = ['article', 'main', '.post', '.content', '.article'];
  let text = '';
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) {
      const t = el.text().replace(/\s+/g, ' ').trim();
      if (t.length > 500) { text = t; break; }
    }
  }
  if (!text) text = $('body').text().replace(/\s+/g, ' ').trim();
  return text;
}