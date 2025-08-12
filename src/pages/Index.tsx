import React from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Features from "@/components/sections/Features";
import Contact from "@/components/sections/Contact";
import FooterCTA from "@/components/sections/FooterCTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <Hero />
        <About />
        <Features />
        <Contact />
        <FooterCTA />
      </div>
    </main>
  );
};

export default Index;
