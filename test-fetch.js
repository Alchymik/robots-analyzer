import { fetchText } from './fetchAndExtract.js';

const text = await fetchText('https://site-analyzer.ru/articles/robots-txt/');
console.log(text.slice(0, 500));