import type { ParagraphComment } from '../types/novel';

export const commentsByBlockId: Record<string, ParagraphComment[]> = {
  'ch01-b03': [
    { id: 'c03-01', blockId: 'ch01-b03', user: 'IsekaiVeteran', avatarSeed: 'iv4', level: 14, text: 'Classic lab explosion opening. Reliable as ever!', likes: 18, createdAt: '2026-01-01T12:15:00.000Z', isSpoiler: false },
    { id: 'c03-02', blockId: 'ch01-b03', user: 'CoffeeWizard', avatarSeed: 'cw9', level: 8, text: 'At least it wasn’t Truck-kun this time.', likes: 31, createdAt: '2026-01-01T12:20:00.000Z', isSpoiler: false },
    { id: 'c03-03', blockId: 'ch01-b03', parentId: 'c03-02', user: 'TruckDriver99', avatarSeed: 'td2', level: 19, text: 'Hey, Truck-kun was on scheduled vacation today.', likes: 52, createdAt: '2026-01-01T12:28:00.000Z', isSpoiler: false },
  ],
  'ch01-b05': [
    { id: 'c05-01', blockId: 'ch01-b05', user: 'Grimblade', avatarSeed: 'gb7', level: 22, text: 'Shoot first, ask questions never. Typical border scouts.', likes: 9, createdAt: '2026-01-01T12:35:00.000Z', isSpoiler: false },
    { id: 'c05-02', blockId: 'ch01-b05', user: 'RuneLover', avatarSeed: 'rl3', level: 11, text: 'The boiled leather armor detail is very atmospheric.', likes: 4, createdAt: '2026-01-01T12:40:00.000Z', isSpoiler: false },
  ],
  'ch01-b09': [
    { id: 'c09-01', blockId: 'ch01-b09', user: 'StatMaxxer', avatarSeed: 'sm1', level: 45, text: 'STR 10 and INT 14? Battlemage build confirmed!', likes: 88, createdAt: '2026-01-01T12:45:00.000Z', isSpoiler: false },
    { id: 'c09-02', blockId: 'ch01-b09', parentId: 'c09-01', user: 'TheoryCrafter', avatarSeed: 'tc5', level: 50, text: 'With Anomalous Perception, INT + AGI hybrid will scale insane.', likes: 34, createdAt: '2026-01-01T12:48:00.000Z', isSpoiler: false },
    { id: 'c09-03', blockId: 'ch01-b09', user: 'PureMage', avatarSeed: 'pm6', level: 33, text: 'MP 85 at level 1 is above average for an unawakened outworlder.', likes: 19, createdAt: '2026-01-01T12:50:00.000Z', isSpoiler: false },
    { id: 'c09-04', blockId: 'ch01-b09', parentId: 'c09-03', user: 'LoreKeeper', avatarSeed: 'lk2', level: 61, text: 'Notice Earth-7 designation. Multiverse setting hint!', likes: 42, createdAt: '2026-01-01T12:55:00.000Z', isSpoiler: false },
    { id: 'c09-05', blockId: 'ch01-b09', parentId: 'c09-03', user: 'PureMage', avatarSeed: 'pm6', level: 33, text: 'Good catch, hope we see other Earth variants later.', likes: 12, createdAt: '2026-01-01T13:02:00.000Z', isSpoiler: false },
    { id: 'c09-06', blockId: 'ch01-b09', user: 'DungeonDiver', avatarSeed: 'dd8', level: 27, text: 'The status window formatting is so clean.', likes: 15, createdAt: '2026-01-01T13:05:00.000Z', isSpoiler: false },
    { id: 'c09-07', blockId: 'ch01-b09', user: 'RiftSpoilerKing', avatarSeed: 'sk9', level: 75, text: 'Careful in later arcs: Earth-7 was intentionally collapsed by the council to fuel the Calamity Anchor.', likes: 7, createdAt: '2026-01-01T13:10:00.000Z', isSpoiler: true },
    { id: 'c09-08', blockId: 'ch01-b09', user: 'ShadowStep', avatarSeed: 'ss3', level: 16, text: 'Luck 9 is basically inviting misfortune every third chapter lol.', likes: 63, createdAt: '2026-01-01T13:15:00.000Z', isSpoiler: false },
    { id: 'c09-09', blockId: 'ch01-b09', user: 'TankMain', avatarSeed: 'tm4', level: 39, text: 'VIT 11 will need urgent investment if he keeps taking crossbow bolts.', likes: 21, createdAt: '2026-01-01T13:20:00.000Z', isSpoiler: false },
    { id: 'c09-10', blockId: 'ch01-b09', user: 'PixelKnight', avatarSeed: 'pk1', level: 12, text: 'Rank F passive trait that detects kinetic vectors? Basically spider-sense.', likes: 47, createdAt: '2026-01-01T13:25:00.000Z', isSpoiler: false },
    { id: 'c09-11', blockId: 'ch01-b09', user: 'GamerGeek', avatarSeed: 'gg2', level: 20, text: 'Love the blue color aesthetic implied by sapphire glyphs.', likes: 8, createdAt: '2026-01-01T13:30:00.000Z', isSpoiler: false },
  ],
  'ch01-b11': [
    { id: 'c11-01', blockId: 'ch01-b11', user: 'TechNerd', avatarSeed: 'tn5', level: 29, text: '“Latency is absolute zero” — spoken like a true engineer protagonist.', likes: 95, createdAt: '2026-01-01T13:32:00.000Z', isSpoiler: false },
    { id: 'c11-02', blockId: 'ch01-b11', user: 'PingMaster', avatarSeed: 'pm8', level: 35, text: 'Bro measured server ping before checking if he had pants on.', likes: 114, createdAt: '2026-01-01T13:35:00.000Z', isSpoiler: false },
    { id: 'c11-03', blockId: 'ch01-b11', parentId: 'c11-02', user: 'TechNerd', avatarSeed: 'tn5', level: 29, text: 'Priorities! 0ms ping is heaven for any gamer.', likes: 44, createdAt: '2026-01-01T13:40:00.000Z', isSpoiler: false },
    { id: 'c11-04', blockId: 'ch01-b11', user: 'GigaChad', avatarSeed: 'gc7', level: 52, text: 'Already liking Valen. Observant and logical.', likes: 38, createdAt: '2026-01-01T13:45:00.000Z', isSpoiler: false },
    { id: 'c11-05', blockId: 'ch01-b11', parentId: 'c11-04', user: 'ReaderOne', avatarSeed: 'ro4', level: 18, text: 'Same! No whiny monologue, straight to deduction.', likes: 23, createdAt: '2026-01-01T13:48:00.000Z', isSpoiler: false },
    { id: 'c11-06', blockId: 'ch01-b11', user: 'NovelDevourer', avatarSeed: 'nd9', level: 41, text: 'Finally an MC who analyzes the HUD interface scientifically.', likes: 19, createdAt: '2026-01-01T13:50:00.000Z', isSpoiler: false },
    { id: 'c11-07', blockId: 'ch01-b11', user: 'ZeroLag', avatarSeed: 'zl1', level: 15, text: 'Wish my broadband had absolute zero latency.', likes: 58, createdAt: '2026-01-01T13:52:00.000Z', isSpoiler: false },
    { id: 'c11-08', blockId: 'ch01-b11', user: 'EchoChamber', avatarSeed: 'ec3', level: 23, text: 'The fact that it tracks with eye movement smoothly sells the realism.', likes: 11, createdAt: '2026-01-01T13:55:00.000Z', isSpoiler: false },
    { id: 'c11-09', blockId: 'ch01-b11', user: 'WebNovelAddict', avatarSeed: 'wa6', level: 30, text: 'Great line pacing here.', likes: 14, createdAt: '2026-01-01T14:00:00.000Z', isSpoiler: false },
    { id: 'c11-10', blockId: 'ch01-b11', user: 'FrostByte', avatarSeed: 'fb2', level: 48, text: '10/10 opening dialogue.', likes: 25, createdAt: '2026-01-01T14:05:00.000Z', isSpoiler: false },
  ],
  'ch01-b16': [
    { id: 'c16-01', blockId: 'ch01-b16', user: 'CombatAnalyst', avatarSeed: 'ca1', level: 37, text: 'Pre-cognition vector lines! That is such a satisfying visual.', likes: 40, createdAt: '2026-01-01T14:10:00.000Z', isSpoiler: false },
    { id: 'c16-02', blockId: 'ch01-b16', user: 'RedFox', avatarSeed: 'rf5', level: 19, text: 'Even with low physical stats, vector prediction makes him lethal.', likes: 27, createdAt: '2026-01-01T14:14:00.000Z', isSpoiler: false },
    { id: 'c16-03', blockId: 'ch01-b16', user: 'FutureSeer', avatarSeed: 'fs8', level: 66, text: 'Wait until chapter 85 when this trait evolves to predict magic trajectory spells!', likes: 15, createdAt: '2026-01-01T14:18:00.000Z', isSpoiler: true },
    { id: 'c16-04', blockId: 'ch01-b16', parentId: 'c16-01', user: 'BowMaster', avatarSeed: 'bm3', level: 25, text: 'Archers in shambles against this guy.', likes: 33, createdAt: '2026-01-01T14:22:00.000Z', isSpoiler: false },
  ],
  'ch01-b18': [
    { id: 'c18-01', blockId: 'ch01-b18', user: 'AdrenalineJunkie', avatarSeed: 'aj4', level: 21, text: 'Narrow dodge! My heart actually skipped a beat.', likes: 16, createdAt: '2026-01-01T14:25:00.000Z', isSpoiler: false },
    { id: 'c18-02', blockId: 'ch01-b18', user: 'SparkHunter', avatarSeed: 'sh2', level: 13, text: 'Iron quarrel sparks on stone—vivid sound design in text.', likes: 8, createdAt: '2026-01-01T14:30:00.000Z', isSpoiler: false },
    { id: 'c18-03', blockId: 'ch01-b18', user: 'IronShield', avatarSeed: 'is9', level: 32, text: 'Close call. If he hesitated half a second he was done.', likes: 12, createdAt: '2026-01-01T14:35:00.000Z', isSpoiler: false },
  ],
  'ch01-b24': [
    { id: 'c24-01', blockId: 'ch01-b24', user: 'WorldBuilder', avatarSeed: 'wb7', level: 44, text: 'Floating island crags and cyclopean aqueducts? Sign me up.', likes: 29, createdAt: '2026-01-01T14:40:00.000Z', isSpoiler: false },
    { id: 'c24-02', blockId: 'ch01-b24', user: 'SkyArchitect', avatarSeed: 'sa3', level: 38, text: 'The scale of this setting is massive. Can’t wait for map art.', likes: 17, createdAt: '2026-01-01T14:45:00.000Z', isSpoiler: false },
  ],
};

export const allComments: ParagraphComment[] = Object.values(commentsByBlockId).flat();
