import express from 'express';
import { runAnalysis } from './analyze.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.post('/api/analyze', async (req, res) => {
  try {
    const { query, target, competitors } = req.body;

    if (!query || !target || !Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({ error: 'Нужны query, target и хотя бы один competitor' });
    }

    const result = await runAnalysis({ query, target, competitors });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Ошибка анализа' });
  }
});

const PORT = process.env.PORT || 3001; 
app.listen(PORT, '0.0.0.0', () => {  
  console.log(`Открой http://localhost:${PORT}`);
});