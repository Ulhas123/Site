export type BlockType =
  | 'text'
  | 'dialogue'
  | 'system'
  | 'authorNote'
  | 'sceneBreak';

export interface BaseBlock {
  id: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  text: string;
}

export interface DialogueBlock extends BaseBlock {
  type: 'dialogue';
  speaker?: string;
  text: string;
}

export interface SystemBlock extends BaseBlock {
  type: 'system';
  title?: string;
  text?: string;
  lines?: string[];
}

export interface AuthorNoteBlock extends BaseBlock {
  type: 'authorNote';
  title?: string;
  text: string;
}

export interface SceneBreakBlock extends BaseBlock {
  type: 'sceneBreak';
  marker?: string;
}

export type Block =
  | TextBlock
  | DialogueBlock
  | SystemBlock
  | AuthorNoteBlock
  | SceneBreakBlock;

export interface Chapter {
  id: string;
  number: number;
  title: string;
  wordCount: number;
  publishedAt: string;
  translator: string;
  editor: string;
  blocks: Block[];
  authorThoughts?: string;
}

export type ChapterMeta = Omit<Chapter, 'blocks'>;

export interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover: string;
  chapters: ChapterMeta[];
}

export interface ParagraphComment {
  id: string;
  blockId: string;
  parentId?: string;
  user: string;
  avatarSeed: string;
  level: number;
  text: string;
  likes: number;
  createdAt: string;
  isSpoiler: boolean;
}
