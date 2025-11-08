"use client"
import React from 'react';
import { 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  Globe,
  Mail,
} from 'lucide-react';
import LinkButton from './linkButton';

const Footer = () => {
  return (
    <footer 
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--footer-bg-start) 0%, var(--footer-bg-via) 50%, var(--footer-bg-end) 100%)`
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* CTA Section */}
        <div 
          className="rounded-2xl p-8 sm:p-12 mb-12 text-center shadow-lg"
          style={{
            backgroundColor: 'var(--footer-cta-bg)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <h3 
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--footer-cta-text)' }}
            >
              Ready to Transform Your Email Workflow?
            </h3>
            <p 
              className="text-lg mb-8"
              style={{ color: 'var(--footer-cta-text-secondary)' }}
            >
              Join hundreds of professionals already using EmailCurator to craft perfect emails
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton
                href="https://uinfo.org/contact/"
                variant="primary"
                size="lg"
                external
                icon={<Mail className="h-5 w-5" />}
                iconRight={<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />}
                className="group"
              >
                Get In Touch
              </LinkButton>
              <LinkButton
                href="https://uinfo.org/"
                variant="outline"
                size="lg"
                external
                icon={<Globe className="h-5 w-5" />}
                iconRight={<ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />}
                className="group"
              >
                Explore Platform
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="border-t pt-8"
          style={{ borderColor: 'var(--footer-border)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div 
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm"
              style={{ color: 'var(--footer-text-muted)' }}
            >
              <span>© {new Date().getFullYear()} OpenPromote</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Powered by 
                <LinkButton
                  href="https://uinfo.org/"
                  variant="text"
                  external
                  className="font-medium mx-1"
                  style={{ color: 'var(--footer-text-secondary)' }}
                >
                  uinfo.org
                </LinkButton>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--footer-text-muted)' }}
              >
                <span>AI-Powered • Professional • Efficient</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;