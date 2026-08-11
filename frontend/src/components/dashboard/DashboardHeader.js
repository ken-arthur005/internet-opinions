import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function DashboardHeader({ brand, onBack }) {
  return (
    <header className="flex items-center justify-between gap-4 py-6">
      <span className="font-display text-lg font-semibold text-fg">
        Internet Opinions
      </span>

      <span className="hidden font-display text-lg text-fg-secondary sm:block">
        {brand}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-pill border border-line bg-card/70 px-3 py-2 text-sm text-fg-secondary backdrop-blur-[12px] transition-colors duration-200 hover:border-line-accent hover:text-fg"
        >
          ← Search again
        </button>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
