import React, { memo } from 'react';
import { useUI } from '../../store/useUI';
import type { Block } from '../../types/novel';
import { CalloutRenderer } from './CalloutRenderer';
import { CodeRenderer } from './CodeRenderer';

interface BlockRendererProps {
  block: Block;
  className?: string;
  isPaginated?: boolean;
}

const BlockRendererComponent: React.FC<BlockRendererProps> = ({
  block,
  className = '',
  isPaginated = false,
}) => {
  const activeBlockId = useUI((state) => state.activeBlockId);
  const isActive = activeBlockId === block.id;

  const baseClasses =
    'mb-[var(--reader-gap)] [text-wrap:pretty] [overflow-wrap:anywhere] selection:bg-accent/20 selection:text-ink';

  const isSelectable = block.type !== 'sceneBreak' && block.type !== 'heading';

  const handleBlockClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-interactive]')) {
      return;
    }
    useUI.getState().setActiveBlockId(block.id);
  };

  const renderContent = () => {
    switch (block.type) {
      case 'text': {
        return (
          <p className="font-[family-name:var(--reader-font)] text-[length:var(--reader-size)] leading-[var(--reader-leading)] text-ink">
            {block.text}
          </p>
        );
      }

      case 'heading': {
        const HeadingTag = block.level === 2 ? 'h2' : block.level === 3 ? 'h3' : 'h4';
        const sizeClasses =
          block.level === 2
            ? 'text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 border-b border-line pb-2'
            : block.level === 3
              ? 'text-lg sm:text-xl font-semibold tracking-tight mt-6 mb-3'
              : 'text-base sm:text-lg font-medium mt-4 mb-2';

        return (
          <HeadingTag id={block.slug} className={`text-ink ${sizeClasses} select-none`}>
            {block.text}
          </HeadingTag>
        );
      }

      case 'callout':
        return <CalloutRenderer block={block} />;

      case 'code':
        return <CodeRenderer block={block} />;

      case 'diagram':
        return (
          <figure className="my-6 flex flex-col items-center justify-center p-3 sm:p-4 bg-raised/40 border border-line rounded-xl break-inside-avoid [break-inside:avoid]">
            <img
              src={block.src}
              alt={block.alt || block.caption || 'Technical Diagram'}
              loading="lazy"
              className="max-w-full h-auto rounded-lg shadow-xs"
            />
            {block.caption && (
              <figcaption className="text-xs text-muted mt-2.5 text-center font-sans italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'math':
        return (
          <div
            className="my-5 py-3 px-4 bg-raised/30 border border-line/60 rounded-xl overflow-x-auto text-center text-ink flex items-center justify-center break-inside-avoid [break-inside:avoid]"
            aria-label="Mathematical formula"
          >
            {block.mathml ? (
              <div
                className="text-base sm:text-lg inline-block"
                dangerouslySetInnerHTML={{ __html: block.mathml }}
              />
            ) : (
              <code className="font-mono text-sm sm:text-base text-accent">
                {block.latex}
              </code>
            )}
          </div>
        );

      case 'table':
        return (
          <div className="my-6 overflow-x-auto border border-line rounded-xl break-inside-avoid [break-inside:avoid]">
            <table className="w-full text-left text-xs sm:text-sm text-ink border-collapse">
              {block.headers && (
                <thead className="bg-raised border-b border-line">
                  <tr>
                    {block.headers.map((h, idx) => (
                      <th key={idx} className="px-4 py-2.5 font-semibold text-ink">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-line bg-page">
                {block.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-raised/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {block.caption && (
              <div className="px-4 py-2 border-t border-line text-xs italic text-muted text-center">
                {block.caption}
              </div>
            )}
          </div>
        );

      case 'dialogue': {
        return (
          <div className="space-y-1">
            {block.speaker && (
              <span className="block text-xs font-semibold uppercase tracking-wider text-accent select-none">
                {block.speaker}
              </span>
            )}
            <p
              className={`font-[family-name:var(--reader-font)] text-[length:var(--reader-size)] leading-[var(--reader-leading)] text-ink italic ${
                block.speaker ? 'pl-3 border-l-2 border-line' : ''
              }`}
            >
              {block.text}
            </p>
          </div>
        );
      }

      case 'system': {
        return (
          <aside
            aria-label={block.title || 'System Notification'}
            className="font-mono bg-system/10 border border-system/40 rounded-lg p-4 sm:p-5 shadow-[0_0_15px_rgba(59,102,245,0.15)] my-2 break-inside-avoid [break-inside:avoid]"
          >
            {block.title && (
              <div className="text-system font-bold text-xs sm:text-sm tracking-wide border-b border-system/25 pb-2 mb-2.5 uppercase">
                {block.title}
              </div>
            )}
            {block.lines && block.lines.length > 0 && (
              <ul className="space-y-1 text-xs sm:text-sm text-system/90 list-none p-0 m-0">
                {block.lines.map((line, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            )}
            {block.text && (
              <p className="text-xs sm:text-sm text-ink/90 mt-2 font-mono leading-relaxed">
                {block.text}
              </p>
            )}
          </aside>
        );
      }

      case 'authorNote': {
        return (
          <section
            aria-label="Author Note"
            className="bg-raised border border-line rounded-lg p-4 sm:p-5 text-sm my-4 break-inside-avoid [break-inside:avoid]"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 select-none">
              {block.title || 'Author Note'}
            </div>
            <p className="font-sans italic text-sm sm:text-base text-ink/90 leading-relaxed m-0">
              {block.text}
            </p>
          </section>
        );
      }

      case 'sceneBreak':
        return (
          <div
            role="separator"
            aria-label="Scene Break"
            className="py-6 flex items-center justify-center gap-4 text-muted select-none break-inside-avoid [break-inside:avoid]"
          >
            <span className="h-px w-12 bg-line" aria-hidden="true" />
            <span className="text-xs font-mono tracking-widest text-muted">
              {block.marker || '* * *'}
            </span>
            <span className="h-px w-12 bg-line" aria-hidden="true" />
          </div>
        );

      default:
        return null;
    }
  };

  const activeStyleClasses = isSelectable
    ? isActive
      ? 'border-l-2 border-accent bg-accent/5 pl-3 -ml-3 py-1 rounded-r-md'
      : 'border-l-2 border-transparent pl-3 -ml-3 py-1'
    : '';

  return (
    <div
      data-block-id={block.id}
      onClick={isSelectable ? handleBlockClick : undefined}
      style={
        isPaginated
          ? undefined
          : {
              contentVisibility: 'auto',
              containIntrinsicSize: 'auto 60px',
            }
      }
      className={`group relative transition-colors duration-150 motion-reduce:transition-none ${baseClasses} ${activeStyleClasses} ${className}`}
    >
      {renderContent()}
    </div>
  );
};

export const BlockRenderer = memo(BlockRendererComponent);
