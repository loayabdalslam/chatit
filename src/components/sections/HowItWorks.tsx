import React from "react";
import { Brain, FileText, PlugZap, LineChart } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const steps = [
  { icon: FileText, title: "Ingest", desc: "Securely connect PDFs and data sources to build your knowledge base." },
  { icon: Brain, title: "Understand", desc: "LLMs process and index content with enterprise-grade retrieval." },
  { icon: PlugZap, title: "Integrate", desc: "Connect to your stack to automate workflows and trigger actions." },
  { icon: LineChart, title: "Optimize", desc: "Track KPIs and continuously improve with analytics and feedback." },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold">How Chatit Works</h2>
        <p className="text-muted-foreground mt-3">From data to decisions — a streamlined, secure pipeline.</p>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(({ icon: Icon, title, desc }) => (
          <article key={title} className="relative rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-6 animate-enter">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-background/50">
              <Icon className="text-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </article>
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden">
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {steps.map(({ icon: Icon, title, desc }) => (
              <CarouselItem key={title} className="basis-[85%]">
                <article className="relative rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-6 animate-enter">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-background/50">
                    <Icon className="text-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-between mt-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default HowItWorks;
