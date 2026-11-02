import type { ChapterMeta, Novel } from '../types/novel';
import { chapter01 } from './chapters/ch01';

const generateCoverSvgUri = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="50%" stop-color="#12182c"/>
      <stop offset="100%" stop-color="#05070e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="900" fill="url(#bg)"/>
  <circle cx="300" cy="380" r="260" fill="url(#glow)"/>
  <rect x="24" y="24" width="552" height="852" fill="none" stroke="#38bdf8" stroke-opacity="0.3" stroke-width="2" rx="8"/>
  <circle cx="300" cy="360" r="140" fill="none" stroke="url(#accent)" stroke-width="3" stroke-dasharray="8 6"/>
  <polygon points="300,260 380,410 220,410" fill="none" stroke="#818cf8" stroke-width="2" stroke-opacity="0.7"/>
  <circle cx="300" cy="360" r="16" fill="#38bdf8"/>
  <text x="300" y="110" font-family="system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="6" fill="#94a3b8" text-anchor="middle">LITRPG &bull; SYSTEM FANTASY</text>
  <text x="300" y="580" font-family="system-ui, sans-serif" font-size="38" font-weight="900" letter-spacing="4" fill="#f8fafc" text-anchor="middle">THE SHATTERED</text>
  <text x="300" y="635" font-family="system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="6" fill="url(#accent)" text-anchor="middle">REACH</text>
  <text x="300" y="680" font-family="system-ui, sans-serif" font-size="15" font-weight="500" letter-spacing="3" fill="#64748b" text-anchor="middle">BOOK ONE: CALAMITY'S ANCHOR</text>
  <line x1="200" y1="715" x2="400" y2="715" stroke="#334155" stroke-width="1"/>
  <text x="300" y="760" font-family="system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="#cbd5e1" text-anchor="middle">V. C. STERLING</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CHAPTER_TITLES = [
  'The Iron Meridian', 'Whispers in the Mire', 'Rift Surge Awakening',
  'Echoes of the High Spire', 'The Hollow Merchant', 'Shattered Obsidian',
  'Tears of the Aegis', 'The Vector Crucible', 'Bramble and Bone',
  'Grave of the First Outworlder', 'Runes of the Silent Citadel', 'Trial of the Astral Gate',
  'The Crimson Precipice', 'Shadow over the Reach', 'The Calamity Core',
];

const generateChapters = (): ChapterMeta[] => {
  const chapters: ChapterMeta[] = [];
  const baseTime = new Date('2026-01-01T12:00:00.000Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // Chapter 1: Real mock chapter matching ch01
  chapters.push({
    id: chapter01.id,
    number: chapter01.number,
    title: chapter01.title,
    wordCount: chapter01.wordCount,
    publishedAt: chapter01.publishedAt,
    translator: chapter01.translator,
    editor: chapter01.editor,
    isLocked: chapter01.isLocked,
    cost: chapter01.cost,
    authorThoughts: chapter01.authorThoughts,
  });

  // Chapter 2: Real mock chapter metadata
  chapters.push({
    id: 'chapter-2',
    number: 2,
    title: 'Chapter 2: The Whispering Canopy',
    wordCount: 1450,
    publishedAt: new Date(baseTime + dayMs).toISOString(),
    translator: 'AetherTranslations',
    editor: 'RuneEditor',
    isLocked: false,
    cost: { coins: 0 },
    authorThoughts: 'Valen tests his limits in the wilderness.',
  });

  // Chapter 3: Real mock chapter metadata
  chapters.push({
    id: 'chapter-3',
    number: 3,
    title: 'Chapter 3: Shards of the Past',
    wordCount: 1520,
    publishedAt: new Date(baseTime + 2 * dayMs).toISOString(),
    translator: 'AetherTranslations',
    editor: 'RuneEditor',
    isLocked: false,
    cost: { coins: 0 },
    authorThoughts: 'The lore deepens as Valen discovers ancient ruins.',
  });

  // Chapter 4: Unlocked preview chapter
  chapters.push({
    id: 'chapter-4',
    number: 4,
    title: 'Chapter 4: The Hollow Outpost',
    wordCount: 1610,
    publishedAt: new Date(baseTime + 3 * dayMs).toISOString(),
    translator: 'AetherTranslations',
    editor: 'RuneEditor',
    isLocked: false,
    cost: { coins: 0 },
  });

  // Chapters 5 to 1200: Locked chapters to stress the TOC
  for (let i = 5; i <= 1200; i++) {
    const titleBase = CHAPTER_TITLES[(i - 5) % CHAPTER_TITLES.length];
    const cycle = Math.floor((i - 5) / CHAPTER_TITLES.length) + 1;
    const title = cycle > 1 ? `Chapter ${i}: ${titleBase} Part ${cycle}` : `Chapter ${i}: ${titleBase}`;
    const wordCount = 1400 + ((i * 37) % 800);
    const publishedAt = new Date(baseTime + (i - 1) * dayMs).toISOString();
    const cost = i % 3 === 0 ? { fastPass: 1 } : { coins: 15 };

    chapters.push({
      id: `chapter-${i}`,
      number: i,
      title,
      wordCount,
      publishedAt,
      translator: 'AetherTranslations',
      editor: 'RuneEditor',
      isLocked: true,
      cost,
    });
  }

  return chapters;
};

export const defaultNovel: Novel = {
  id: 'shattered-reach',
  title: 'The Shattered Reach',
  author: 'V. C. Sterling',
  synopsis:
    'Transported through a dying rift into the shattered borderlands of a broken empire, Valen Cross awakens with a defective interface and an anomalous perception trait. In a world governed by merciless system tiers and faction wars, survival isn’t given—it must be calculated.',
  cover: generateCoverSvgUri(),
  chapters: generateChapters(),
};
