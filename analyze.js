import { fetchText } from './fetchAndExtract.js';
import { getEmbedding, cosineSimilarity } from './similarity.js';
import { extractKeywords } from './keywords.js';
import { analyzeGap } from './gap.js';

function getVerdict(matrix, targetLabel) {
  const rows = matrix.filter(m => m.from === targetLabel || m.to === targetLabel);
  if (!rows.length) return null;

  const avg = rows.reduce((s, m) => s + m.similarity, 0) / rows.length;
  const max = Math.max(...rows.map(m => m.similarity));

  if (avg >= 85) return {
    level: 'danger',
    title: 'Зона исключения',
    text: `Среднее сходство с конкурентами — ${avg.toFixed(1)}%. Вы покрываете тот же спрос, что и топ, но ваши отличия точечные. Google, скорее всего, не увидит достаточной причины ранжировать вас выше. Смотрите «Уникальные темы» — стоит усилить именно их.`,
    avg: Math.round(avg * 10) / 10,
    max,
  };
  if (avg >= 70) return {
    level: 'warning',
    title: 'Частичное пересечение',
    text: `Среднее сходство — ${avg.toFixed(1)}%. Вы близки к топу, но есть место для уникальных блоков. Смотрите раздел «Чего нет у вас».`,
    avg: Math.round(avg * 10) / 10,
    max,
  };
  return {
    level: 'ok',
    title: 'Хорошая дифференциация',
    text: `Среднее сходство — ${avg.toFixed(1)}%. Ваша страница существенно отличается от конкурентов.`,
    avg: Math.round(avg * 10) / 10,
    max,
  };
}

export async function runAnalysis({ query, target, competitors }) {
  const urls = [target, ...competitors];
  const labels = [
    'Ваша страница',
    ...competitors.map((u, i) => {
      try { return new URL(u).hostname.replace('www.', ''); }
      catch { return `Конкурент ${i + 1}`; }
    }),
  ];

  const texts = [];
  for (const url of urls) {
    texts.push(await fetchText(url));
  }

  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await getEmbedding(text));
  }

  const matrix = [];
  for (let i = 0; i < urls.length; i++) {
    for (let j = i + 1; j < urls.length; j++) {
      matrix.push({
        from: labels[i],
        to: labels[j],
        similarity: Math.round(cosineSimilarity(embeddings[i], embeddings[j]) * 1000) / 10,
      });
    }
  }

  const allKeywords = texts.map(t => extractKeywords(t));
  const targetKeywords = allKeywords[0];
  const competitorKeywordsList = allKeywords.slice(1);
  const { missing, weak, unique } = analyzeGap(targetKeywords, competitorKeywordsList);

  const verdict = getVerdict(matrix, labels[0]);

  return {
    query,
    urls,
    labels,
    verdict,
    matrix,
    keywords: labels.map((label, i) => ({ label, words: allKeywords[i] })),
    gap: { missing, weak, unique },
  };
}