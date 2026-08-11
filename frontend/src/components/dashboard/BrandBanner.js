/**
 * The brand name over the visible band of the background image — the moment
 * the whole page is built around. Sized large so it reads as a title card
 * rather than a heading.
 */
export function BrandBanner({ brand, total }) {
  return (
    <div className="flex flex-col gap-3 pt-8 pb-12 sm:pt-16 sm:pb-20">
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
        {brand}
      </h1>
      <p className="text-sm text-fg-secondary">
        <span className="font-mono text-fg">{total}</span>{" "}
        {total === 1 ? "article" : "articles"} analyzed from the past week
      </p>
    </div>
  );
}
