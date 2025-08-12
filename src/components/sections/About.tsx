import React from "react";

const About: React.FC = () => {
  return (
    <section id="about" className="py-20">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold">About Chatit</h2>
          <p className="text-muted-foreground text-lg">
            Founded in 2024, Chatit specializes in advanced digital chatbot solutions for large enterprises and organizations. Our platform harnesses large language models (LLMs) to deliver intelligent, secure, and scalable conversational experiences.
          </p>
          <p className="text-muted-foreground">
            From customer support automation to knowledge retrieval, Chatit integrates with your existing systems and up to 100 PDF documents to streamline operations and drive business value.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/40 backdrop-blur-md p-8">
          <ul className="grid sm:grid-cols-2 gap-6">
            <li>
              <p className="text-sm text-muted-foreground">Founded</p>
              <p className="text-foreground text-xl font-semibold">2024</p>
            </li>
            <li>
              <p className="text-sm text-muted-foreground">Focus</p>
              <p className="text-foreground text-xl font-semibold">Enterprise AI</p>
            </li>
            <li>
              <p className="text-sm text-muted-foreground">Integrations</p>
              <p className="text-foreground text-xl font-semibold">PDFs, APIs</p>
            </li>
            <li>
              <p className="text-sm text-muted-foreground">Security</p>
              <p className="text-foreground text-xl font-semibold">Compliance-ready</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
