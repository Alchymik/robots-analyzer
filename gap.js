export function analyzeGap(targetKeywords, competitorKeywordsList, competitorLabels = []) {
  const targetMap = Object.fromEntries(targetKeywords.map(k => [k.word, k.count]));

  const competitorFreq = {};
  competitorKeywordsList.forEach((keys, idx) => {
    const label = competitorLabels[idx] || `Конкурент ${idx + 1}`;
    for (const { word, count } of keys) {
      if (!competitorFreq[word]) {
        competitorFreq[word] = { sources: 0, totalCount: 0, labels: [] };
      }
      competitorFreq[word].sources += 1;
      competitorFreq[word].totalCount += count;
      competitorFreq[word].labels.push(label);
    }
  });

  const missing = Object.entries(competitorFreq)
    .filter(([word]) => !(word in targetMap) && word.length >= 3)
    .sort((a, b) => b[1].sources - a[1].sources || b[1].totalCount - a[1].totalCount)
    .slice(0, 20)
    .map(([word, info]) => ({
      word,
      sources: info.sources,
      totalCount: info.totalCount,
      labels: info.labels,
    }));

  const missingWords = new Set(missing.map(m => m.word));

  const weak = Object.entries(competitorFreq)
    .filter(([word, info]) => {
      if (missingWords.has(word)) return false;
      const avg = info.totalCount / info.sources;
      const mine = targetMap[word] || 0;
      return mine > 0 && avg >= 5 && mine * 2 < avg;
    })
    .sort((a, b) => (b[1].totalCount / b[1].sources) - (a[1].totalCount / a[1].sources))
    .slice(0, 15)
    .map(([word, info]) => ({
      word,
      mine: targetMap[word] || 0,
      avgCompetitor: Math.round(info.totalCount / info.sources),
    }));

  const unique = targetKeywords
    .filter(k => !(k.word in competitorFreq) && k.word.length >= 3)
    .map(k => k.word);

  return { missing, weak, unique };
}