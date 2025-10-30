import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Mic, 
  Zap, 
  ArrowRight, 
  ExternalLink,
  Twitter,
  MessageSquare,
  Workflow,
  Sparkles,
  Star,
  Globe,
  Mail,
  Linkedin,
  ChevronRight,
  Cpu,
  BrainCircuit,
  Rocket
} from 'lucide-react';

const Footer = () => {
  const [hoveredService, setHoveredService] = useState(null);
  const [floatingElements, setFloatingElements] = useState([]);

  // Create floating animation elements
  useEffect(() => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setFloatingElements(elements);
  }, []);

  const services = [
    {
      id: 'twitter-bot',
      title: 'Twitter Bot',
      description: 'Intelligent social media automation',
      icon: Twitter,
      gradient: 'from-blue-400 to-cyan-600',
      features: ['Auto-posting', 'Engagement tracking', 'Content optimization'],
    },
    {
      id: 'voice-assistant',
      title: 'AI Voice Assistant',
      description: 'Natural conversation AI companion',
      icon: Mic,
      gradient: 'from-purple-400 to-pink-600',
      features: ['Voice recognition', 'Natural responses', 'Multi-language'],
    },
    {
      id: 'ai-automation',
      title: 'AI Automation',
      description: 'Streamline workflows with intelligence',
      icon: Zap,
      gradient: 'from-orange-400 to-red-600',
      features: ['Process automation', 'Smart triggers', 'Custom workflows'],
    },
    {
      id: 'ai-solutions',
      title: 'Custom AI Solutions',
      description: 'Tailored AI for your unique needs',
      icon: BrainCircuit,
      gradient: 'from-green-400 to-emerald-600',
      features: ['Custom models', 'API integration', 'Scalable solutions'],
    },
  ];

  const stats = [
    { label: 'AI Models Deployed', value: '50+', icon: Cpu },
    { label: 'Happy Clients', value: '200+', icon: Star },
    { label: 'Automations Created', value: '50+', icon: Workflow },
    { label: 'Hours Saved Daily', value: '10K+', icon: Rocket },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Automate Your Workflow?
            </h3>
            <p className="text-purple-200 text-lg mb-6">
              Join hundreds of businesses already leveraging AI to save time and increase productivity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://uinfo.org/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Get In Touch
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              <a
                href="https://uinfo.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 border border-white/30"
              >
                <Globe className="h-5 w-5" />
                Explore Platform
                <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-purple-300">
              <span>© {new Date().getFullYear()} AI Solutions Platform</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Powered by 
                <a 
                  href="https://uinfo.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-200 font-medium hover:text-white transition-colors duration-300 mx-1"
                >
                  uinfo.org
                </a>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <Sparkles className="h-4 w-4" />
                <span>Intelligent • Automated • Efficient</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;