"use client"
import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import HomePage from '@/components/homepage/page/homepage';

export default function Home() {
  return (
    <PageWrapper showFooter={true}>
      <HomePage />
    </PageWrapper>
  );
}