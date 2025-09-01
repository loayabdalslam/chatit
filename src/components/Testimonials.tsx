
import React, { useRef } from "react";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  gradient: string;
  backgroundImage?: string;
}

const testimonials: TestimonialProps[] = [{
  content: "ChatIt's Arabic language models transformed our customer service. We saw 40% improvement in customer satisfaction with culturally appropriate responses.",
  author: "Ahmed Hassan",
  role: "CTO, Egyptian Banking Corp",
  gradient: "from-blue-700 via-indigo-800 to-purple-900",
  backgroundImage: "/background-section1.png"
}, {
  content: "The fine-tuned models understand our business terminology perfectly. ChatIt delivered enterprise-grade AI solutions that actually work for our region.",
  author: "Fatima Al-Mansouri",
  role: "Director of Digital Innovation, UAE Retail Group",
  gradient: "from-indigo-900 via-purple-800 to-orange-500",
  backgroundImage: "/background-section2.png"
}, {
  content: "Working with ChatIt's team has been exceptional. Their deep understanding of Arabic dialects and cultural nuances made all the difference for our chatbot deployment.",
  author: "Omar Khalil",
  role: "Head of Technology, Saudi Healthcare Solutions",
  gradient: "from-purple-800 via-pink-700 to-red-500",
  backgroundImage: "/background-section3.png"
}, {
  content: "As a government organization, we needed AI solutions that understand Egyptian Arabic perfectly. ChatIt delivered beyond our expectations with their specialized models.",
  author: "Dr. Nour El-Din",
  role: "Digital Transformation Lead, Ministry of Education Egypt",
  gradient: "from-orange-600 via-red-500 to-purple-600",
  backgroundImage: "/background-section1.png"
}];

const TestimonialCard = ({
  content,
  backgroundImage = "/background-section1.png"
}: Pick<TestimonialProps, 'content' | 'backgroundImage'>) => {
  return <div className="bg-cover bg-center rounded-lg p-8 h-full flex flex-col justify-between text-white transform transition-transform duration-300 hover:-translate-y-2 relative overflow-hidden" style={{
    backgroundImage: `url('${backgroundImage}')`
  }}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white z-10"></div>
      
      <div className="relative z-0">
        <p className="text-xl mb-8 font-medium leading-relaxed pr-20">{`"${content}"`}</p>
        <div>
          <h4 className="font-semibold text-xl">ChatIt User</h4>
        </div>
      </div>
    </div>;
};

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return <section className="py-12 bg-white relative" id="testimonials" ref={sectionRef}> {/* Reduced from py-20 */}
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="flex items-center gap-4 mb-6">
          <div className="pulse-chip">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">04</span>
            <span>Testimonials</span>
          </div>
        </div>
        
        <h2 className="text-5xl font-display font-bold mb-12 text-left">What others say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => <TestimonialCard key={index} content={testimonial.content} backgroundImage={testimonial.backgroundImage} />)}
        </div>
      </div>
    </section>;
};

export default Testimonials;
