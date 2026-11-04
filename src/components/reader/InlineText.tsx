import React from 'react';

interface InlineTextProps {
  text?: string;
  className?: string;
}

const TOKEN_REGEX = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

export const InlineText: React.FC<InlineTextProps> = ({ text = '', className }) => {
  if (!text) return null;

  // Fast path if text has no inline markdown markers
  if (!text.includes('`') && !text.includes('*')) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(TOKEN_REGEX);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code
              key={index}
              className="font-mono text-xs px-1.5 py-0.5 rounded bg-raised border border-line text-accent select-text font-semibold mx-0.5"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={index} className="font-bold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <em key={index} className="italic text-ink/90">
              {part.slice(1, -1)}
            </em>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
