import React from "react";
import { MessageSquare, FileText, Languages, ShieldCheck, Brain, Lock, Webhook, ServerCog, Database, Activity, MessageSquareCode, BarChart3 } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "LLM-powered Chat", desc: "Natural, contextual conversations powered by state-of-the-art language models." },
  { icon: FileText, title: "PDF Integration (100 files)", desc: "Connect and process up to 100 PDFs for knowledge-grounded responses." },
  { icon: Languages, title: "Multilingual Support", desc: "Serve users globally with accurate, localized dialogues." },
  { icon: ShieldCheck, title: "Enterprise Security", desc: "Robust controls, encryption, and compliance-ready architecture." },
  { icon: Brain, title: "AI Reasoning Engine", desc: "Advanced reasoning, tool-use, and retrieval for precise answers." },
  { icon: BarChart3, title: "Analytics & Insights", desc: "Conversation analytics, topic trends, CSAT and deflection metrics." },
  { icon: Lock, title: "SSO & RBAC", desc: "SAML/SSO, OAuth2, and granular roles with least-privilege access." },
  { icon: Webhook, title: "APIs & Webhooks", desc: "Integrate with your systems to trigger actions and sync data." },
  { icon: ServerCog, title: "On-Prem/Private Cloud", desc: "Flexible deployment options to meet compliance requirements." },
  { icon: Database, title: "Knowledge Graph", desc: "Structured enterprise knowledge for traceable, grounded answers." },
  { icon: MessageSquareCode, title: "Human-in-the-Loop", desc: "Seamless agent handoff and review workflows where needed." },
  { icon: Activity, title: "Audit Logs & Monitoring", desc: "Full observability, versioning, and SLAs for enterprises." },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20">
      <div className="relative text-center mb-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold">Capabilities that Scale with You</h2>
        <p className="text-muted-foreground mt-3">Purpose-built for large enterprises and mission-critical workflows.</p>
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full blur-3xl opacity-30" style={{ background: "linear-gradient(135deg,hsl(var(--brand-electric)/0.5),hsl(var(--brand-purple)/0.5))" }} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <article
            key={title}
            className="group relative rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] animate-enter"
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
