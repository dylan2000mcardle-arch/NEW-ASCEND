const FAQS: { q: string; a: string }[] = [
  {
    q: "Is mouth tape safe to sleep with?",
    a: "For most healthy adults who breathe comfortably through their nose, gentle mouth taping is low-risk. Start with a single short session, and remove it any time it feels uncomfortable. If you have sleep apnea, heavy nasal congestion, or a respiratory condition, talk to your doctor before using it.",
  },
  {
    q: "How do I use the full stack?",
    a: "It's an overnight routine. Before bed: pop in the nose tape to open your airway, apply the mouth tape, and slip on the blackout mask. Wear the height insoles during the day, and use the Face Framer as directed. Nothing here is complicated — it slots into your normal night.",
  },
  {
    q: "When will I notice a difference?",
    a: "Sleep quality is usually the first thing people feel — often within the first few nights of blocking light and breathing through the nose. Anything structural is gradual and varies person to person. We don't promise overnight transformations; we give you tools that stack over time.",
  },
  {
    q: "What does shipping cost?",
    a: "Shipping is free. Once your order is dispatched you'll get a tracking link by email so you can follow it the whole way.",
  },
  {
    q: "What if it's not for me?",
    a: "You're covered by a 30-day guarantee. If it isn't working for you, reach out and we'll sort it. For hygiene reasons, unused and unopened items are easiest to return.",
  },
  {
    q: "Which products do I actually need?",
    a: "Take the 30-second quiz and we'll recommend a stack based on your goals — sharper jawline, deeper sleep, or added height. Prefer everything? The Full Stack bundles all five systems into one.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="relative scroll-mt-20 py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 0%, rgba(0,243,255,0.05) 0%, rgba(1,1,1,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
            Before You Start
          </p>
          <h2 className="font-mono text-4xl font-bold text-white md:text-5xl">
            Common <span className="text-glow-cyan text-cyan">Questions</span>
          </h2>
        </div>

        <ul className="flex flex-col gap-3">
          {FAQS.map(({ q, a }) => (
            <li key={q}>
              <details className="group rounded-xl border border-glass-border bg-white/[0.02] px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-mono text-sm font-bold uppercase tracking-wide text-white outline-none focus-visible:text-cyan">
                  {q}
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="h-5 w-5 shrink-0 text-cyan transition-transform duration-200 group-open:rotate-45"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="pb-5 pr-9 text-sm leading-relaxed text-foreground/65">
                  {a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
