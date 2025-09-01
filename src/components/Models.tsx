import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const Models = () => {
  return (
    <section className="py-12 bg-white relative" id="models">
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="flex items-center gap-4 mb-6">
          <div className="pulse-chip">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">05</span>
            <span>Models</span>
          </div>
        </div>
        
        <h2 className="text-5xl font-display font-bold mb-12 text-left">Our AI Models</h2>
        
        <div className="max-w-6xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <div className="p-6 border border-gray-200 rounded-lg h-64 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">Model 1 - Coming Soon</p>
                </div>
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <div className="p-6 border border-gray-200 rounded-lg h-64 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">Model 2 - Coming Soon</p>
                </div>
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <div className="p-6 border border-gray-200 rounded-lg h-64 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">Model 3 - Coming Soon</p>
                </div>
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <div className="p-6 border border-gray-200 rounded-lg h-64 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">Model 4 - Coming Soon</p>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Models;