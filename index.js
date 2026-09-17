import fs from 'fs';
import { runAnalysis } from './analyze.js';

const config = JSON.parse(fs.readFileSync('./urls.json', 'utf8'));

const result = await runAnalysis(config);

console.log('\n=== Вердикт ===');
console.log(`${result.verdict.title} — ${result.verdict.text}`);

console.log('\n=== Рекомендации ===');
result.recommendations.forEach(r => {
  console.log(`[${r.label}] ${r.text}`);
});

console.log('\n=== Матрица сходства ===');
for (const m of result.matrix) {
  console.log(`${m.from} ↔ ${m.to}: ${m.similarity}%`);
}

console.log('\n=== Чего нет у вас ===');
console.log(result.gap.missing.map(m => `${m.word} (у ${m.sources})`).join('\n'));

console.log('\n=== Где слабее ===');
console.log(result.gap.weak.map(w => `${w.word}: у вас ${w.mine}, у конкурентов ${w.avgCompetitor}`).join('\n'));

fs.writeFileSync('report.json', JSON.stringify(result, null, 2), 'utf8');
console.log('\nПолный отчёт: report.json');