import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { CodeBlock } from '../../types/novel';

interface CodeRendererProps {
  block: CodeBlock;
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-5 rounded-xl border border-line bg-raised overflow-hidden break-inside-avoid [break-inside:avoid] text-ink">
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-page/50 text-xs font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="uppercase font-semibold tracking-wider text-accent">
            {block.language || 'code'}
          </span>
          {block.filename && (
            <span className="text-muted font-sans text-xs">
              {block.filename}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied code to clipboard' : 'Copy code to clipboard'}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-muted hover:text-ink hover:bg-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span className="text-accent text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed selection:bg-accent/30">
        <pre className="m-0 font-[family-name:var(--font-jetbrains-mono)] whitespace-pre">
          <code>{block.code}</code>
        </pre>
      </div>

      {block.caption && (
        <div className="px-4 py-2 border-t border-line text-xs italic text-muted text-center font-sans">
          {block.caption}
        </div>
      )}
    </div>
  );
};
