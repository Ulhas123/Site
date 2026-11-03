import React, { memo } from 'react';
import { useUI } from '../../store/useUI';
import type { Block } from '../../types/novel';

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

  const isSelectable = block.type !== 'sceneBreak';

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
