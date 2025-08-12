import React from "react";
import heroImg from "@/assets/chatit-hero.png";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const Hero: React.FC = () => {
  const glowRef = React.useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!glowRef.current) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.setProperty("--x", `${x}px`);
    glowRef.current.style.setProperty("--y", `${y}px`);
  };

  return (
    <header className="relative overflow-hidden">
      <nav className="flex items-center justify-between py-6">
        <Logo />
        <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Request demo</a>
      </nav>

      <section
        onMouseMove={onMouseMove}
        className="relative mt-6 rounded-2xl border border-border/60 bg-gradient-to-b from-background to-background/40 overflow-hidden"
        aria-label="Hero"
      >
        {/* Interactive glow */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px circle at var(--x) var(--y), hsl(var(--brand-electric) / 0.18), transparent 40%), radial-gradient(700px circle at calc(var(--x) + 120px) calc(var(--y) + 80px), hsl(var(--brand-purple) / 0.12), transparent 45%)",
          }}
        />

        <div className="relative grid lg:grid-cols-2 gap-10 items-center p-8 md:p-12">
          <div className="space-y-6 animate-enter">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Empowering Conversations with AI Brilliance
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Chatit delivers enterprise-grade, LLM-powered chatbots that integrate with up to 100 PDFs to automate workflows securely and at scale.
            </p>
            <div className="flex items-center gap-4">
              <Button asChild variant="hero" size="lg">
                <a href="#contact">Get Started</a>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl overflow-hidden border border-border/60 bg-card/10 backdrop-blur-sm shadow-[var(--shadow-glow)]">
              <img
                src={heroImg}
                alt="Futuristic AI chatbot illustration with electric blue and neon purple accents"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>
    </header>
  );
};

export default Hero;
