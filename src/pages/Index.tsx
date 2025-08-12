import React from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Features from "@/components/sections/Features";
import Stats from "@/components/sections/Stats";
import HowItWorks from "@/components/sections/HowItWorks";
import UseCases from "@/components/sections/UseCases";
import Integrations from "@/components/sections/Integrations";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import FooterCTA from "@/components/sections/FooterCTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <Hero />
        <Stats />
        <About />
        <Features />
        <HowItWorks />
        <UseCases />
        <Integrations />
        <Testimonials />
        <FAQ />
        <Contact />
        <FooterCTA />
      </div>
    </main>
  );
};

export default Index;
