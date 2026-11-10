/** Markiert Suchbegriffe im Text. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.join('|')})`, 'gi');
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-300/40 px-0.5 text-inherit dark:bg-amber-400/25">{part}</mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
