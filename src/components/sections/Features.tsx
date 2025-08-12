import React from "react";
import { MessageSquare, FileText, Languages, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "LLM-powered Chat",
    desc: "Natural, contextual conversations powered by state-of-the-art language models.",
  },
  {
    icon: FileText,
    title: "PDF Integration (100 files)",
    desc: "Connect and process up to 100 PDFs for knowledge-grounded responses.",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    desc: "Serve users globally with accurate, localized dialogues.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "Robust controls, encryption, and compliance-ready architecture.",
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold">Capabilities that Scale with You</h2>
        <p className="text-muted-foreground mt-3">Purpose-built for large enterprises and mission-critical workflows.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <article
            key={title}
            className="group relative rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-6 hover:translate-y-[-2px] transition-transform duration-200"
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, hsl(var(--brand-electric)/0.12), hsl(var(--brand-purple)/0.12))" }} />
            <div className="relative">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-background/50">
                <Icon className="text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Features;
