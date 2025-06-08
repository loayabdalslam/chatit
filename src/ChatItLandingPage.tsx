  import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Mail,
  MessageSquare,
  CheckCircle,
  Star,
  Plus,
  ArrowUpRight,
  Brain,
  Zap,
  Shield,
  BarChart,
  ChevronDown,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Logo Components
const DiscordIcon = () => (
  <svg viewBox="0 0 256 199" width="48" height="48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" fill="currentColor"/>
  </svg>
);

const SlackIcon = () => (
  <svg width="48" height="48" viewBox="0 0 2447.6 2452.5" xmlns="http://www.w3.org/2000/svg">
    <g clipRule="evenodd" fillRule="evenodd">
      <path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="currentColor"/>
    </g>
  </svg>
);

const StripeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="20" viewBox="0 0 512 214">
    <path fill="currentColor" d="M512 110.08c0-36.409-17.636-65.138-51.342-65.138c-33.85 0-54.33 28.73-54.33 64.854c0 42.808 24.179 64.426 58.88 64.426c16.925 0 29.725-3.84 39.396-9.244v-28.445c-9.67 4.836-20.764 7.823-34.844 7.823c-13.796 0-26.027-4.836-27.591-21.618h69.547c0-1.85.284-9.245.284-12.658m-70.258-13.511c0-16.071 9.814-22.756 18.774-22.756c8.675 0 17.92 6.685 17.92 22.756z"/>
  </svg>
);

const VercelIcon = () => (
  <svg viewBox="0 0 256 222" width="48" height="38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <path fill="currentColor" d="m128 0 128 221.705H0z"/>
  </svg>
);

const GoogleDriveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="42" viewBox="0 0 87.3 78">
    <path fill="currentColor" d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z"/>
    <path fill="currentColor" d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h27.5z"/>
  </svg>
);

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

interface ChatItLandingPageProps {
  onGetStarted: () => void;
  onSignUp?: () => void;
}

export function ChatItLandingPage({ onGetStarted, onSignUp }: ChatItLandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  // Real-time stats hook
  const stats = useQuery(api.landing.getLandingStats) || {
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    satisfactionScore: 0,
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

  // Pricing plans data
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      popular: false,
      features: [
        "Up to 100 messages/month",
        "1 chatbot",
        "Basic analytics",
        "Email support",
        "Standard integrations"
      ]
    },
    {
      name: "Pro",
      price: "$29",
      description: "Best for growing businesses",
      popular: true,
      features: [
        "Up to 10,000 messages/month",
        "5 chatbots",
        "Advanced analytics",
        "Priority support",
        "All integrations",
        "Custom branding",
        "API access"
      ]
    },
    {
      name: "Business",
      price: "$99",
      description: "For established companies",
      popular: false,
      features: [
        "Up to 50,000 messages/month",
        "25 chatbots",
        "Advanced analytics & reports",
        "Phone & chat support",
        "All integrations",
        "White-label solution",
        "Advanced API access",
        "Custom training"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      popular: false,
      features: [
        "Unlimited messages",
        "Unlimited chatbots",
        "Enterprise analytics",
        "Dedicated account manager",
        "Custom integrations",
        "On-premise deployment",
        "SLA guarantee",
        "Advanced security"
      ]
    }
  ];

  // FAQ items data
  const faqItems = [
    {
      question: "How does ChatIt work?",
      answer: "ChatIt uses advanced AI to create intelligent chatbots that can understand and respond to customer queries naturally. Simply create your chatbot, customize its responses, and embed it on your website."
    },
    {
      question: "Can I customize the chatbot's appearance?",
      answer: "Yes! ChatIt offers extensive customization options including colors, fonts, positions, welcome messages, and more to match your brand perfectly."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer email support for all plans, priority support for Pro users, and phone & chat support for Business and Enterprise customers. Our team is here to help you succeed."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Our Free plan allows you to get started with up to 100 messages per month. You can upgrade anytime as your needs grow."
    },
    {
      question: "How do referrals work?",
      answer: "Earn 20% commission on every successful referral! When someone signs up using your referral code and subscribes to a paid plan, you'll receive 20% of their monthly subscription fee."
    },
    {
      question: "Can I integrate ChatIt with my existing tools?",
      answer: "Absolutely! ChatIt integrates with popular platforms like Discord, Slack, Stripe, and many others. API access is available for custom integrations."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur ${
          scrollY > 50 ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black"
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-2xl font-bold">CHATIT</span>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-sm font-medium hover:text-gray-600 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-gray-600 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium hover:text-gray-600 transition-colors">FAQ</a>
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={onSignUp || onGetStarted}
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Get Started
            </button>
          </div>
          
          <button className="md:hidden" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-white md:hidden"
        >
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <span className="text-2xl font-bold">CHATIT</span>
            <button onClick={toggleMenu}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="container mx-auto px-4 py-8 flex flex-col gap-6">
            <a href="#features" className="text-lg font-medium" onClick={toggleMenu}>Features</a>
            <a href="#pricing" className="text-lg font-medium" onClick={toggleMenu}>Pricing</a>
            <a href="#faq" className="text-lg font-medium" onClick={toggleMenu}>FAQ</a>
                         <div className="flex flex-col gap-3 mt-6">
               <button 
                 onClick={onGetStarted}
                 className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md"
               >
                 Log In
               </button>
               <button 
                 onClick={onSignUp || onGetStarted}
                 className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md"
               >
                 Get Started
               </button>
             </div>
          </nav>
        </motion.div>
      )}

      <main>
        {/* Hero Section */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                AI-Powered Customer Support
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Update your<br />
                <span className="relative">
                  customer
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute bottom-2 left-0 h-2 bg-black"
                  />
                </span><br />
                experience
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Transform your business with intelligent AI chatbots that understand, engage, and resolve customer issues 24/7. 
                Built for modern businesses that demand excellence.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button 
                  onClick={onSignUp || onGetStarted}
                  className="px-8 py-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="px-8 py-4 border border-gray-300 font-medium rounded-md hover:bg-gray-50 transition-colors">
                  Watch Demo
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Real-time Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by thousands worldwide</h2>
              <p className="text-xl text-gray-600">Join our growing community of satisfied customers</p>
            </motion.div>
            
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <motion.div
                variants={fadeIn}
                className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200"
              >
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm font-medium">Active Users</div>
              </motion.div>
              
              <motion.div
                variants={fadeIn}
                className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200"
              >
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                  {stats.totalConversations.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm font-medium">Conversations</div>
              </motion.div>
              
              <motion.div
                variants={fadeIn}
                className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200"
              >
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                  {stats.totalMessages.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm font-medium">Messages Sent</div>
              </motion.div>
              
              <motion.div
                variants={fadeIn}
                className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200"
              >
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                  {stats.satisfactionScore}%
                </div>
                <div className="text-gray-600 text-sm font-medium">Satisfaction Rate</div>
              </motion.div>
            </motion.div>
          </div>
        </section>

  
        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                ChatIt provides you with powerful AI, clean integrations, and an architecture that scales from 0 to millions.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose a plan that's right for you</h2>
              <p className="text-xl text-gray-600">Start free, scale as you grow</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
            >
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className={`relative p-6 bg-white rounded-lg border-2 ${
                    plan.popular ? "border-black" : "border-gray-200"
                  } hover:shadow-lg transition-shadow`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-1">{plan.price}</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-black mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onGetStarted}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      plan.popular
                        ? "bg-black text-white hover:bg-gray-800"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Get Started
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mt-16 p-6 bg-white rounded-lg border border-gray-200 max-w-2xl mx-auto"
            >
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <p className="text-gray-600 mb-2">
                <strong>InstaPay:</strong> 01211268396
              </p>
              <p className="text-sm text-gray-500">
                After payment, upload your screenshot and we'll verify it within 24 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently asked questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know about ChatIt</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-3xl mx-auto space-y-4"
            >
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === item.question ? null : item.question)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">{item.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        openFAQ === item.question ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFAQ === item.question && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600">{item.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-black text-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto px-4 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your customer experience?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using ChatIt to provide exceptional customer support.
            </p>
            <button 
              onClick={onSignUp || onGetStarted}
              className="px-8 py-4 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
            </button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">CHATIT</span>
            </div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ChatIt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}