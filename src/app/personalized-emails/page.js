"use client"
import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useAuthContext } from '@/providers/AuthProvider';
import BulkEmailAgent from '@/components/personalized-email-sender/PersonalizedEmailsAgent';
import EmailCuratorHeader from '@/components/EmailCuratorHeader';

const PersonalizedEmails = () => {
  const { user, isLoadingUser, handleLogout } = useAuthContext();

  return (
    <PageWrapper showFooter={true} className="container mx-auto px-4 py-8">
      <EmailCuratorHeader />
      <BulkEmailAgent user={user} isLoadingUser={isLoadingUser} onLogout={handleLogout} />
    </PageWrapper>
  );
};

export default PersonalizedEmails;