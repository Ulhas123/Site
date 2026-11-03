export type BlockType =
  | 'text'
  | 'dialogue'
  | 'system'
  | 'authorNote'
  | 'sceneBreak'
  | 'heading'
  | 'callout'
  | 'diagram'
  | 'code'
  | 'math'
  | 'table';

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

export type CalloutVariant =
  | 'anchor'
  | 'club'
  | 'pitfall'
  | 'project'
  | 'definition'
  | 'theorem'
  | 'proof'
  | 'remark'
  | 'standard'
  | 'principle'
  | 'system';

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: CalloutVariant;
  title?: string;
  subtitle?: string;
  text?: string;
  lines?: string[];
}

export interface DiagramBlock extends BaseBlock {
  type: 'diagram';
  src: string;
  caption?: string;
  alt?: string;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language: string;
  code: string;
  caption?: string;
  filename?: string;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 2 | 3 | 4;
  text: string;
  slug?: string;
}

export interface MathBlock extends BaseBlock {
  type: 'math';
  latex: string;
  mathml?: string;
  display?: boolean;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers?: string[];
  rows: string[][];
  caption?: string;
}

export type Block =
  | TextBlock
  | DialogueBlock
  | SystemBlock
  | AuthorNoteBlock
  | SceneBreakBlock
  | CalloutBlock
  | DiagramBlock
  | CodeBlock
  | HeadingBlock
  | MathBlock
  | TableBlock;

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
  category?: 'novel' | 'study';
  pdfUrl?: string;
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
