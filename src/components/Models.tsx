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
                <a 
                  href="https://huggingface.co/chatitcloud/UZI1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-6 border border-orange-200 rounded-lg h-64 bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <div className="mb-4 p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <img 
                        src="data:image/png;base64,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" 
                        alt="Hugging Face" 
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-center">UZI1 Model</h3>
                    <p className="text-sm text-white/90 text-center">Advanced AI Language Model</p>
                    <div className="mt-3 text-xs text-white/80 flex items-center">
                      <span>View on Hugging Face</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <a 
                  href="https://huggingface.co/chatitcloud/MP5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-6 border border-blue-200 rounded-lg h-64 bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <div className="mb-4 p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <img 
                        src="data:image/png;base64,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" 
                        alt="Hugging Face" 
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-center">MP5 Model</h3>
                    <p className="text-sm text-white/90 text-center">Advanced AI Language Model</p>
                    <div className="mt-3 text-xs text-white/80 flex items-center">
                      <span>View on Hugging Face</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <a 
                  href="https://huggingface.co/chatitcloud/Beretta92" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-6 border border-purple-200 rounded-lg h-64 bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <div className="mb-4 p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <img 
                        src="data:image/png;base64,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" 
                        alt="Hugging Face" 
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Beretta92 Model</h3>
                    <p className="text-sm text-white/90 text-center">Advanced AI Language Model</p>
                    <div className="mt-3 text-xs text-white/80 flex items-center">
                      <span>View on Hugging Face</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
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