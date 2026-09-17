const HINTS = {
  // директивы
  'host': 'раздел про директиву host (устаревшая, но конкуренты её упоминают)',
  'crawl-delay': 'раздел про crawl-delay — управление нагрузкой',
  'clean-param': 'раздел про Clean-param — склейка URL с параметрами',
  'sitemap': 'расширенный раздел про Sitemap: примеры, структура, частые ошибки',
  'url': 'примеры URL в robots.txt: wildcards, паттерны, регулярки',
  'noindex': 'директиву noindex',
  // CMS
  'bitrix': 'пример robots.txt под Bitrix',
  'wp-': 'пример robots.txt под WordPress',
  'wp-content': 'пример для папки /wp-content/',
  // типы контента
  'image': 'блок про закрытие изображений от индексации',
  'video': 'блок про закрытие видео от индексации',
  'css': 'блок про закрытие CSS/JS файлов',
  'upload': 'блок про /upload/ и пользовательский контент',
  // маркетинг
  'utm': 'блок про закрытие UTM-меток',
  'cookie': 'блок про cookie и их закрытие',
  'персональных': 'блок про защиту персональных данных через robots.txt',
  'продвижение': 'блок про SEO-продвижение через robots.txt',
  // служебное
  'search': 'блок про закрытие страниц поиска',
  'admin': 'блок про закрытие админ-панелей',
  'карта': 'блок про карту сайта',
  'карту': 'блок про карту сайта',
  'правило': 'примеры правил robots.txt',
  'доступ': 'управление доступом роботов',
  'количество': 'ограничения по количеству запросов',
  'контент': 'управление контентом через robots.txt',
  'сайтов': 'примеры для разных типов сайтов',
  'нагрузку': 'снижение нагрузки на сервер',
  'title': 'влияние title через robots.txt',
};

function humanize(word) {
  return HINTS[word] || `тему «${word}»`;
}

// мусор из навигации сайта — не выводим в рекомендации
const NOISE = new Set(['siteanalyzer', 'forum', 'настройки', 'wp-content']);

export function buildRecommendations({ gap, targetLabel }) {
  const recs = [];

  // 1. Добавить — то, чего нет у вас, но есть у конкурентов
  for (const m of gap.missing.slice(0, 8)) {
    const src = m.labels?.length
      ? m.labels.join(', ')
      : `у ${m.sources} конкурентов`;
    recs.push({
      type: 'add',
      label: 'Добавить',
      text: `Добавьте ${humanize(m.word)} — есть у ${src}`,
    });
  }

  // 2. Усилить — то, что у вас есть, но меньше, чем у конкурентов
  for (const w of gap.weak) {
    recs.push({
      type: 'boost',
      label: 'Усилить',
      text: `Усильте «${w.word}»: у вас ${w.mine} упоминаний, у конкурентов в среднем ${w.avgCompetitor}`,
    });
  }

  // 3. Сохранить — ваши уникальные темы (без мусора)
  const goodUnique = gap.unique.filter(u => !NOISE.has(u));
  if (goodUnique.length) {
    recs.push({
      type: 'keep',
      label: 'Сохранить',
      text: `Ваши уникальные темы — сохраните и усильте: ${goodUnique.join(', ')}`,
    });
  }

  return recs;
}