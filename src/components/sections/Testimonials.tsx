import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
  {
    quote:
      "Chatit reduced our average handle time by 38% while maintaining enterprise compliance.",
    author: "VP Support, Fortune 500 Retail",
  },
  {
    quote:
      "We connected 80+ PDFs and launched in 3 weeks — deflection is now above 60%.",
    author: "Head of CX, Global SaaS",
  },
  {
    quote:
      "The analytics give us unprecedented visibility. Our execs love the dashboards.",
    author: "Operations Director, Financial Services",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-semibold">Trusted by Leading Enterprises</h2>
        <p className="text-muted-foreground mt-3">Real outcomes from real deployments.</p>
      </div>

      <Carousel opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {testimonials.map((t, idx) => (
            <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
              <Card className="border border-border/60 bg-background/30 backdrop-blur-md animate-enter">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed">“{t.quote}”</p>
                  <p className="mt-4 text-xs text-muted-foreground">{t.author}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-between mt-4">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  );
};

export default Testimonials;
