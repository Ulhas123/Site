import React from 'react';
import { AlertTriangle, BookMarked, CheckCircle2, HelpCircle, Lightbulb, ShieldCheck, Terminal } from 'lucide-react';
import type { CalloutBlock, CalloutVariant } from '../../types/novel';
import { InlineText } from './InlineText';

interface CalloutRendererProps {
  block: CalloutBlock;
}

const variantConfig: Record<
  CalloutVariant,
  {
    icon: React.ElementType;
    badge: string;
    borderClass: string;
    bgClass: string;
    accentClass: string;
  }
> = {
  anchor: {
    icon: Lightbulb,
    badge: 'SYSTEM INTUITION & MENTAL ANCHOR',
    borderClass: 'border-l-4 border-accent',
    bgClass: 'bg-accent/5',
    accentClass: 'text-accent',
  },
  club: {
    icon: HelpCircle,
    badge: 'CLUB SENIOR Q&A & TECHNICAL DEFENSE',
    borderClass: 'border-l-4 border-system',
    bgClass: 'bg-system/10',
    accentClass: 'text-system',
  },
  pitfall: {
    icon: AlertTriangle,
    badge: 'COMMON PITFALL & DEBUGGING ADVICE',
    borderClass: 'border-l-4 border-amber-500',
    bgClass: 'bg-amber-500/10',
    accentClass: 'text-amber-500',
  },
  project: {
    icon: Terminal,
    badge: 'PORTFOLIO PROJECT',
    borderClass: 'border-2 border-line',
    bgClass: 'bg-raised',
    accentClass: 'text-ink',
  },
  definition: {
    icon: BookMarked,
    badge: 'FORMAL DEFINITION',
    borderClass: 'border-l-4 border-system',
    bgClass: 'bg-system/5',
    accentClass: 'text-system',
  },
  theorem: {
    icon: ShieldCheck,
    badge: 'THEOREM',
    borderClass: 'border-l-4 border-indigo-500',
    bgClass: 'bg-indigo-500/10',
    accentClass: 'text-indigo-500',
  },
  proof: {
    icon: CheckCircle2,
    badge: 'PROOF',
    borderClass: 'border-l-2 border-line',
    bgClass: 'bg-transparent',
    accentClass: 'text-muted',
  },
  remark: {
    icon: Lightbulb,
    badge: 'REMARK',
    borderClass: 'border-l-4 border-line',
    bgClass: 'bg-raised/60',
    accentClass: 'text-muted',
  },
  standard: {
    icon: ShieldCheck,
    badge: 'ENGINEERING STANDARD',
    borderClass: 'border-l-4 border-accent',
    bgClass: 'bg-accent/5',
    accentClass: 'text-accent',
  },
  principle: {
    icon: BookMarked,
    badge: 'CORE PRINCIPLE',
    borderClass: 'border-l-4 border-system',
    bgClass: 'bg-system/10',
    accentClass: 'text-system',
  },
  system: {
    icon: Terminal,
    badge: 'SYSTEM',
    borderClass: 'border-l-4 border-system',
    bgClass: 'bg-system/10',
    accentClass: 'text-system',
  },
};

export const CalloutRenderer: React.FC<CalloutRendererProps> = ({ block }) => {
  const cfg = variantConfig[block.variant] || variantConfig.anchor;
  const Icon = cfg.icon;
  const headerText = block.title || cfg.badge;

  return (
    <aside
      aria-label={headerText}
      className={`my-5 p-4 sm:p-5 rounded-r-xl ${cfg.borderClass} ${cfg.bgClass} break-inside-avoid [break-inside:avoid]`}
    >
      <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-line select-none">
        <Icon className={`w-4 h-4 shrink-0 ${cfg.accentClass}`} aria-hidden="true" />
        <span className={`text-xs font-bold tracking-wider uppercase ${cfg.accentClass}`}>
          {headerText}
        </span>
        {block.subtitle && (
          <span className="text-xs italic text-muted ml-auto font-sans">
            {block.subtitle}
          </span>
        )}
      </div>

      {block.text && (
        <div className="font-sans text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
          <InlineText text={block.text} />
        </div>
      )}

      {block.lines && block.lines.length > 0 && (
        <ul className="space-y-1.5 text-xs sm:text-sm text-ink list-none p-0 m-0 mt-2">
          {block.lines.map((line, idx) => (
            <li key={idx} className="leading-relaxed">
              <InlineText text={line} />
            </li>
          ))}
        </ul>
      )}

      {block.variant === 'proof' && (
        <div className="flex justify-end text-sm text-muted mt-2 font-mono select-none" aria-hidden="true">
          &#x25A0;
        </div>
      )}
    </aside>
  );
};
