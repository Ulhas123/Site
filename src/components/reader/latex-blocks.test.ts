import { describe, expect, it } from 'vitest';
import type {
  CalloutBlock,
  CodeBlock,
  DiagramBlock,
  HeadingBlock,
  MathBlock,
  TableBlock,
} from '../../types/novel';

describe('LaTeX Educational Blocks Specification & Integrity', () => {
  it('validates CalloutBlock structure with pedagogical variants', () => {
    const anchorBox: CalloutBlock = {
      id: 'ch01_b01',
      type: 'callout',
      variant: 'anchor',
      title: 'SYSTEM INTUITION & MENTAL ANCHOR',
      text: 'WSL2 executes a real Linux kernel inside Hyper-V.',
    };
    expect(anchorBox.type).toBe('callout');
    expect(anchorBox.variant).toBe('anchor');
    expect(anchorBox.title).toContain('SYSTEM INTUITION');

    const pitfallBox: CalloutBlock = {
      id: 'ch01_b02',
      type: 'callout',
      variant: 'pitfall',
      title: 'COMMON PITFALL',
      text: 'Do not clone Git repos inside /mnt/c/.',
    };
    expect(pitfallBox.variant).toBe('pitfall');
  });

  it('validates DiagramBlock with vector SVG source', () => {
    const diagram: DiagramBlock = {
      id: 'ch01_fig01',
      type: 'diagram',
      src: '/novels/ai-and-ds-engineering-handbook/figures/fig_1_1.svg',
      caption: 'User Space versus Kernel Space separation in Linux.',
      alt: 'User Space versus Kernel Space',
    };
    expect(diagram.type).toBe('diagram');
    expect(diagram.src).toMatch(/\.svg$/);
    expect(diagram.caption).toBeTruthy();
  });

  it('validates CodeBlock with language and caption', () => {
    const code: CodeBlock = {
      id: 'ch01_code01',
      type: 'code',
      language: 'bash',
      code: 'ls -la\npwd',
      caption: 'Core Filesystem Navigation',
    };
    expect(code.type).toBe('code');
    expect(code.language).toBe('bash');
    expect(code.code).toContain('pwd');
  });

  it('validates HeadingBlock hierarchy and slug', () => {
    const heading: HeadingBlock = {
      id: 'ch01_h01',
      type: 'heading',
      level: 2,
      text: 'Operating System Architecture',
      slug: 'operating-system-architecture',
    };
    expect(heading.type).toBe('heading');
    expect(heading.level).toBe(2);
    expect(heading.slug).toBe('operating-system-architecture');
  });

  it('validates MathBlock with latex and mathml', () => {
    const math: MathBlock = {
      id: 'ch01_m01',
      type: 'math',
      latex: '|\\langle \\mathbf{u}, \\mathbf{v} \\rangle| \\le \\|\\mathbf{u}\\| \\|\\mathbf{v}\\|',
      mathml: '<math display="block"><mrow><mo>|</mo></mrow></math>',
      display: true,
    };
    expect(math.type).toBe('math');
    expect(math.display).toBe(true);
    expect(math.mathml).toContain('<math');
  });

  it('validates TableBlock with headers and rows', () => {
    const table: TableBlock = {
      id: 'ch01_t01',
      type: 'table',
      headers: ['Feature', 'WSL1', 'WSL2'],
      rows: [
        ['Architecture', 'Syscall Translation', 'Real Linux Kernel VM'],
        ['File I/O', 'Moderate', 'Native ext4 speeds'],
      ],
      caption: 'WSL1 vs WSL2 Comparison',
    };
    expect(table.type).toBe('table');
    expect(table.headers).toHaveLength(3);
    expect(table.rows).toHaveLength(2);
  });
});
