export function analyzeGap(targetKeywords, competitorKeywordsList) {
  const targetMap = Object.fromEntries(targetKeywords.map(k => [k.word, k.count]));

  const competitorFreq = {};
  for (const keys of competitorKeywordsList) {
    for (const { word, count } of keys) {
      competitorFreq[word] = competitorFreq[word] || { sources: 0, totalCount: 0 };
      competitorFreq[word].sources += 1;
      competitorFreq[word].totalCount += count;
    }
  }

  const missing = Object.entries(competitorFreq)
    .filter(([word]) => !(word in targetMap) && word.length >= 3)
    .sort((a, b) => b[1].sources - a[1].sources || b[1].totalCount - a[1].totalCount)
    .slice(0, 20)
    .map(([word, info]) => ({ word, sources: info.sources, totalCount: info.totalCount }));

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