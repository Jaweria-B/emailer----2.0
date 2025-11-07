"use client"
import React, { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import EmailGeneration from '@/components/email-generation/EmailGeneration';
import AnimatedEmailStats from '@/components/AnimatedEmailStats';
import EmailCuratorHeader from '@/components/EmailCuratorHeader';
import { AI_PROVIDERS } from '@/lib/ai-config';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

const EmailWriter = () => {
  const { user, isLoadingUser, handleLogout } = useAuthContext();
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS.GEMINI);
  const [apiKeys, setApiKeys] = useState({
    [AI_PROVIDERS.QWEN]: '',
    [AI_PROVIDERS.OPENAI]: '',
    [AI_PROVIDERS.DEEPSEEK]: '',
    [AI_PROVIDERS.GEMINI]: ''
  });

  const handleApiKeyChange = (provider, apiKey) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: apiKey
    }));
  };

  return (
    <PageWrapper>
      <EmailCuratorHeader />
      <AnimatedEmailStats />
      {/* <div className="flex justify-center mb-8">
        <button
          onClick={() => router.push('/personalized-emails')}
          className="group bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-500 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-lg flex items-center gap-3 text-lg cursor-pointer"
        >
          <Users className="h-6 w-6 group-hover:animate-pulse" />
          <span>Send Personalized Emails</span>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </button>
      </div> */}
      <EmailGeneration user={user} isLoadingUser={isLoadingUser} onLogout={handleLogout}/>
    </PageWrapper>
  );
};

export default EmailWriter;