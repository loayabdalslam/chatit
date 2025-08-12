import React from "react";
import { MessageCircle, Headset, Building2, FileSearch } from "lucide-react";

const cases = [
  {
    icon: MessageCircle,
    title: "Customer Support Automation",
    desc: "Deflect tickets and resolve issues instantly across chat and email.",
  },
  {
    icon: FileSearch,
    title: "Knowledge Base Q&A",
    desc: "Answer complex questions grounded in your internal PDFs and docs.",
  },
  {
    icon: Headset,
    title: "Agent Assist",
    desc: "Surface suggested replies, summaries, and relevant context in real time.",
  },
  {
    icon: Building2,
    title: "Internal Ops Bots",
    desc: "HR, IT, and Finance assistants that streamline routine workflows.",
  },
];

const UseCases: React.FC = () => {
  return (
    <section id="use-cases" className="py-20">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold">High-Impact Enterprise Use Cases</h2>
        <p className="text-muted-foreground mt-3">Deploy AI where it matters most to your organization.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cases.map(({ icon: Icon, title, desc }) => (
          <article key={title} className="group relative rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-6 transition-all duration-200 hover:-translate-y-1 animate-enter">
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

export default UseCases;
