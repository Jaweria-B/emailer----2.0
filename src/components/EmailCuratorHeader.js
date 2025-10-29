"use client"
import React from 'react';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EmailCuratorHeader = () => {
  const router = useRouter();

  return (
    <div className="text-center mb-12 pt-15">
      {/* Center Content */}
      <div className="flex items-center justify-center mb-6 cursor-pointer" onClick={() => router.push('/')}>
        <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30 hover:scale-105 transition-transform duration-300">
          <Mail className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
        Email<span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Curator</span>
      </h1>
      
      <p className="text-purple-100 text-xl max-w-2xl mx-auto leading-relaxed mb-6">
        Transform your thoughts into perfectly crafted emails with multiple AI providers
      </p>
    </div>
  );
};

export default EmailCuratorHeader;