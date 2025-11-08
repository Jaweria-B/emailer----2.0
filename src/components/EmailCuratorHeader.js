"use client"
import React from 'react';
import { Mail, Sparkles } from 'lucide-react';

const EmailCuratorHeader = () => {
  const handleLogoClick = () => {
    // Router navigation would be handled in actual Next.js app
    console.log('Navigate to home');
  };

  return (
    <div className="relative w-full">      
      <div className="relative text-center px-6 py-10">
        {/* Logo/Icon */}
        <div 
          className="flex items-center justify-center mb-8 cursor-pointer group"
          onClick={handleLogoClick}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Mail className="h-10 w-10 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Email
          </span>
          <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
            Curator
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8 font-light">
          Transform your thoughts into perfectly crafted emails
          {/* <span className="block mt-2 text-lg text-gray-500">
            Powered by multiple AI providers for the best results
          </span> */}
        </p>
      </div>
    </div>
  );
};

export default EmailCuratorHeader;