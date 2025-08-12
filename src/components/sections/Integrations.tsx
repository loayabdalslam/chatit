import React from "react";
import { Link2, Cloud, Database, Share2, Shield, Folder, BookOpen, Plug } from "lucide-react";

const items = [
  { icon: Link2, name: "Slack" },
  { icon: Share2, name: "Microsoft Teams" },
  { icon: Database, name: "Salesforce" },
  { icon: Cloud, name: "ServiceNow" },
  { icon: Folder, name: "Google Drive" },
  { icon: Shield, name: "SharePoint" },
  { icon: BookOpen, name: "Confluence" },
  { icon: Plug, name: "Custom APIs" },
];

const Integrations: React.FC = () => {
  return (
    <section id="integrations" className="py-20">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold">Connect with Your Stack</h2>
        <p className="text-muted-foreground mt-3">Seamless integrations to orchestrate end-to-end workflows.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, name }) => (
          <div key={name} className="group relative rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-5 hover:-translate-y-1 transition-all animate-enter">
            <div className="relative flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background/50">
                <Icon className="text-foreground" />
              </div>
              <span className="font-medium">{name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Integrations;
