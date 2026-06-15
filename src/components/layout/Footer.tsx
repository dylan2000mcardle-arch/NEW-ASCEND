export default function Footer() {
  return (
    <footer className="border-t border-glass-border py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <span className="font-mono text-sm font-bold tracking-[0.3em] text-foreground/30">
              <span className="text-cyan/50">A</span>SCND
            </span>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-foreground/20">
              Clinical Recovery Systems
            </p>
          </div>

          <div className="flex gap-8">
            {[
              { label: "Shop", href: "/shop" },
              { label: "Protocol", href: "/#protocol" },
              { label: "Research", href: "/#research" },
              { label: "Community", href: "/#community" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[10px] uppercase tracking-wider text-foreground/40 transition-colors hover:text-cyan"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="font-mono text-[10px] text-foreground/15">
            &copy; 2026 ASCND. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
