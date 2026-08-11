/**
 * The DESIGN.md card recipe, in one place.
 *
 * The background is deliberately translucent (/70) rather than the opaque
 * --bg-card the spec names. DESIGN.md asks for backdrop-blur on cards, but
 * blur behind an opaque fill is invisible — and the reference images clearly
 * show the photograph through the cards. Same token, partial alpha, so the
 * frosted-glass effect is real.
 */
export function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`rounded-card border border-line bg-card/70 backdrop-blur-[12px] transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
