import type { Chapter } from '../../types/novel';

export const chapter02: Chapter = {
  id: 'chapter-2',
  number: 2,
  title: 'Chapter 2: The Whispering Canopy',
  wordCount: 1450,
  publishedAt: '2026-01-02T12:00:00.000Z',
  translator: 'AetherTranslations',
  editor: 'RuneEditor',
  authorThoughts: 'Valen explores the jagged forest canopy and encounters an unusual rift construct.',
  blocks: [
    {
      id: 'ch02-b01',
      type: 'text',
      text: 'The needle-trees of the Whispering Canopy rose like petrified lances, their black bark weeping drops of crystalline amber that smelled of cedar and burnt copper.',
    },
    {
      id: 'ch02-b02',
      type: 'text',
      text: 'Valen moved in low bounds, staying parallel to the dry bed of an ancient canal. With each step, his newly logged [Anomalous Perception] pinged faint purple eddies in the air—micro-eddies where gravity hung unnaturally heavy.',
    },
    {
      id: 'ch02-b03',
      type: 'dialogue',
      speaker: 'Valen Cross',
      text: '“If I step into one of those gravitational troughs, my sprint speed drops to zero. Good to know the HUD gives advance notice.”',
    },
    {
      id: 'ch02-b04',
      type: 'system',
      title: '[ SYSTEM ALERT: ENVIRONMENTAL ANOMALY ]',
      lines: [
        'Zone: Whispering Canopy (Sub-stratum: Low Aether)',
        'Ambient Hazard: Gravitational Shear (Intensity 1.2G - 3.4G)',
        'Recommendation: Follow ley-current pathways to maintain kinetic velocity.',
      ],
      text: 'Perception trait bonus active: +5% pathfinding efficiency.',
    },
    {
      id: 'ch02-b05',
      type: 'text',
      text: 'A guttural hiss snapped his focus forward. Twenty yards ahead, perched atop an overturned pillar, crouched a carapace-plated stalker the size of a mountain wolf.',
    },
    {
      id: 'ch02-b06',
      type: 'dialogue',
      speaker: 'Valen Cross',
      text: '“Chitin Hound. Tier 1 scavenger. High initial burst, weak dorsal joints.”',
    },
    {
      id: 'ch02-b07',
      type: 'text',
      text: 'The beast sprang. But to Valen’s eyes, the vector trail painted itself before the leap even reached apex. A bright cyan arc curved down toward his chest.',
    },
    {
      id: 'ch02-b08',
      type: 'text',
      text: 'He ducked under the jagged trajectory, pivoting hard on his right heel. As the beast lunged past, Valen drove the notched hunting dagger straight through the articulated plate behind its skull.',
    },
    {
      id: 'ch02-b09',
      type: 'system',
      title: '[ COMBAT LOG: KILL CONFIRMED ]',
      lines: [
        'Target: Riftstalker Larva (Level 2)',
        'Damage Dealt: 64 (Critical Vector Strike)',
        'EXP Gained: +45 [45 / 100 EXP]',
        'Loot: Fragmented Chitin Core (Common)',
      ],
      text: 'Level progress recorded. Health remains at 100%.',
    },
    {
      id: 'ch02-b10',
      type: 'sceneBreak',
      marker: '* * *',
    },
    {
      id: 'ch02-b11',
      type: 'text',
      text: 'Dusk settled across the canopy, bathing the floating aqueducts overhead in shades of bruised amethyst. The ruined fortress was visible now, its silhouette carved like an iron crown against the ridge.',
    },
    {
      id: 'ch02-b12',
      type: 'dialogue',
      speaker: 'Valen Cross',
      text: '“Halfway there. If the rift pulse stays quiet for another two hours, I might actually make it before nightfall.”',
    },
    {
      id: 'ch02-b13',
      type: 'authorNote',
      title: 'Author Note',
      text: 'Valen’s tactical mindset is starting to pay off! Next chapter: ancient archives and the first major system discovery.',
    },
  ],
};
