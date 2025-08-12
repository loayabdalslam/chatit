import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-20">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold">Frequently Asked Questions</h2>
        <p className="text-muted-foreground mt-3">Everything you need to know about Chatit.</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem value="item-1" className="rounded-xl border border-border/60 bg-background/30 backdrop-blur-md px-4">
            <AccordionTrigger>How do you handle security and compliance?</AccordionTrigger>
            <AccordionContent>
              We support SSO/SAML, RBAC, encryption in transit and at rest, audit logs, and flexible deployment options including private cloud.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="rounded-xl border border-border/60 bg-background/30 backdrop-blur-md px-4">
            <AccordionTrigger>Can Chatit connect to our existing systems?</AccordionTrigger>
            <AccordionContent>
              Yes. We offer APIs and webhooks and integrate with tools like Slack, Teams, ServiceNow, Salesforce, Google Drive, SharePoint, and more.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="rounded-xl border border-border/60 bg-background/30 backdrop-blur-md px-4">
            <AccordionTrigger>How many PDFs can we use?</AccordionTrigger>
            <AccordionContent>
              Up to 100 PDFs per bot by default, with options for higher limits depending on your plan and architecture.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
