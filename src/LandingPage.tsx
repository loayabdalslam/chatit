import { useState } from "react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Chatbots",
      description: "Create intelligent chatbots that understand and respond naturally to your customers."
    },
    {
      icon: "⚡",
      title: "Easy Integration",
      description: "Add your chatbot to any website with just a few lines of code."
    },
    {
      icon: "📊",
      title: "Analytics & Insights",
      description: "Track conversations, analyze sentiment, and improve your chatbot's performance."
    },
    {
      icon: "🎨",
      title: "Customizable Design",
      description: "Match your brand with customizable colors, fonts, and styling options."
    },
    {
      icon: "📱",
      title: "Mobile Responsive",
      description: "Your chatbot works perfectly on desktop, tablet, and mobile devices."
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "Chatit.cloud helped us reduce customer support tickets by 60% while improving customer satisfaction.",
      avatar: "👩‍💼"
    },
    {
      name: "Mike Chen",
      role: "CEO",
      company: "StartupXYZ",
      content: "The easiest chatbot platform I've ever used. We were up and running in minutes, not hours.",
      avatar: "👨‍💻"
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success",
      company: "E-commerce Plus",
      content: "Our conversion rate increased by 25% after implementing Chatit.cloud on our website.",
      avatar: "👩‍🎯"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Chatit.cloud</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Intelligent
              <span className="text-blue-600"> Chatbots</span>
              <br />
              in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create AI-powered chatbots that engage your customers, answer questions, and drive conversions. 
              No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Start Building for Free
              </button>
              <div className="flex items-center text-gray-600">
                <span className="text-sm">✓ No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that make creating and managing chatbots simple and effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by thousands of businesses
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about Chatit.cloud
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your customer experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Chatit.cloud to engage customers and drive growth.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Chatit.cloud</h3>
            <p className="text-gray-400 mb-6">
              The easiest way to create intelligent chatbots for your business.
            </p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <span>© 2024 Chatit.cloud. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
