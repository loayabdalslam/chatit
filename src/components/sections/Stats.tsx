import React from "react";
import { Globe2, ShieldCheck, Files, Activity } from "lucide-react";

const stats = [
  { label: "Uptime", value: "99.99%", icon: Activity },
  { label: "Languages", value: "30+", icon: Globe2 },
  { label: "PDFs per bot", value: "100", icon: Files },
  { label: "Enterprise Clients", value: "200+", icon: ShieldCheck },
];

const Stats: React.FC = () => {
  return (
    <section id="stats" className="relative py-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-10 top-0 h-48 w-48 rounded-full blur-3xl opacity-30" style={{ background: "linear-gradient(135deg,hsl(var(--brand-electric)/0.4),hsl(var(--brand-purple)/0.3))" }} />
        <div className="absolute right-10 bottom-0 h-56 w-56 rounded-full blur-3xl opacity-20" style={{ background: "linear-gradient(135deg,hsl(var(--brand-purple)/0.4),hsl(var(--brand-electric)/0.3))" }} />
      </div>

      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold">Proven at Enterprise Scale</h2>
        <p className="text-muted-foreground mt-3">Reliable, global, and ready for mission-critical operations.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="relative rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-6 text-center animate-enter hover:shadow-[var(--shadow-elegant)] transition-shadow">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-background/50">
              <Icon className="text-foreground" />
            </div>
            <div className="mt-4 text-3xl font-semibold bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,hsl(var(--brand-electric)),hsl(var(--brand-purple)))" }}>
              {value}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Stats;
