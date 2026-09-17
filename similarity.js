import { pipeline, env } from '@xenova/transformers';

env.cacheDir = '/tmp';

let extractor;

export async function getEmbedding(text) {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 2000);

  const out = await extractor(clean, { pooling: 'mean', normalize: true });
  return out.data;
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;   // векторы уже нормализованы в getEmbedding
}