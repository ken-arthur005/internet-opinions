/** Photographer attribution — required by the Unsplash API guidelines. */
export function UnsplashCredit({ background }) {
  if (!background?.credit) return null;

  const { name, link, unsplashLink } = background.credit;

  return (
    <p className="text-xs text-fg-muted">
      Photo by{" "}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-line-accent underline-offset-2 transition-colors hover:text-fg-secondary"
      >
        {name}
      </a>{" "}
      on{" "}
      <a
        href={unsplashLink}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-line-accent underline-offset-2 transition-colors hover:text-fg-secondary"
      >
        Unsplash
      </a>
    </p>
  );
}
