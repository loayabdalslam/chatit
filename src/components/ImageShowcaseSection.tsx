
import React from "react";

const ImageShowcaseSection = () => {
  return (
    <section className="w-full pt-0 pb-8 sm:pb-12 bg-white" id="showcase">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
            Intelligent Conversations, Endless Possibilities
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Our advanced AI chatbot platform is designed to revolutionize how businesses 
            communicate and engage with customers across the MENA region.
          </p>
        </div>
        
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant mx-auto max-w-4xl animate-on-scroll">
          <div className="w-full">
            <img 
              src="/lovable-uploads/c3d5522b-6886-4b75-8ffc-d020016bb9c2.png" 
              alt="Advanced AI chatbot interface with modern design" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="bg-white p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-display font-semibold mb-3 sm:mb-4">Advanced AI Language Models</h3>
            <p className="text-gray-700 text-sm sm:text-base">
              Powered by cutting-edge natural language processing and machine learning, our AI chatbots 
              seamlessly integrate into enterprise workflows across the MENA region, providing 
              intelligent assistance and transforming customer experiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcaseSection;
