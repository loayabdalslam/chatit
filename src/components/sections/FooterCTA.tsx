import React from "react";
import { Button } from "@/components/ui/button";

const FooterCTA: React.FC = () => {
  return (
    <footer className="py-16">
      <div className="rounded-2xl border border-border/60 bg-[linear-gradient(135deg,hsl(var(--brand-electric)/0.12),hsl(var(--brand-purple)/0.12))] p-10 text-center">
        <h3 className="text-2xl md:text-3xl font-semibold">Ready to transform your customer experience?</h3>
        <p className="text-muted-foreground mt-3">Request a tailored demo and see Chatit in action for your organization.</p>
        <div className="mt-6">
          <Button asChild variant="hero" size="lg">
            <a href="#contact">Request a Demo</a>
          </Button>
        </div>
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Chatit. All rights reserved.</p>
    </footer>
  );
};

export default FooterCTA;
