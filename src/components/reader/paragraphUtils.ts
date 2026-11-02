/**
 * Splits paragraph text into a leading prefix and the last word.
 * This enables wrapping the last word and inline comment badge
 * together in a `whitespace-nowrap` span to avoid orphaned badges.
 */
export function splitParagraphLastWord(text: string): { prefix: string; lastWord: string } {
  const trimmed = text.trimEnd();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) {
    return { prefix: '', lastWord: trimmed };
  }
  return {
    prefix: trimmed.slice(0, lastSpace + 1),
    lastWord: trimmed.slice(lastSpace + 1),
  };
}
