"use client"
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Users, 
  Bot, 
  Send, 
  Play, 
  Pause, 
  BarChart3, 
  FileText, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  User,
  Building,
  LogOut,
  RefreshCw,
  Eye,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  UserCircle,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import UsageWidget from '@/components/UsageWidget';
import UpgradeModal from '@/components/UpgradeModal';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';

const BulkEmailAgent = ({ user, onLogout, isLoadingUser }) => {
  const router = useRouter();
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: ''
    },
    fromName: ''
  });

  // Sender Information State
  const [senderInfo, setSenderInfo] = useState({
    name: '',
    title: '',
    company: '',
    industry: '',
    bio: '',
    expertise: '',
    achievements: ''
  });
  
  // Agent Configuration State
  const [agentConfig, setAgentConfig] = useState({
    name: 'Academic Outreach Specialist',
    systemPrompt:`You are an AI-powered Academic Outreach Specialist with deep expertise in crafting personalized academic communications. You leverage advanced reasoning to understand complex academic hierarchies, research interests, and institutional cultures.

Your core capabilities:
- RESEARCH ANALYSIS: Analyze recipient's publications, research interests, and academic background
- INSTITUTIONAL INTELLIGENCE: Understand university cultures, department dynamics, and funding landscapes  
- PERSONALIZATION ENGINE: Create highly targeted content based on academic fit and shared interests
- PROFESSIONAL TONE MASTERY: Adapt communication style from formal to collaborative based on context

Key Instructions:
- Demonstrate genuine understanding of recipient's research through specific references
- Establish academic credibility by highlighting relevant sender qualifications/interests
- Show clear value proposition (research collaboration, skill alignment, mutual benefit)
- Use appropriate academic discourse while remaining approachable
- Include strategic follow-up suggestions based on academic timelines
- Never use generic templates or obvious AI-generated language

`,
    
    emailTemplate: `Write a personalized email using the following information:

RECIPIENT DETAILS:
{recipient_info}

SENDER DETAILS:
{sender_info}

Email Purpose: {email_purpose}
Call-to-Action: {call_to_action}

CRITICAL: If any information is not provided or empty, DO NOT use placeholder text like "[Your Name]", "[Company]", etc. Instead:
- Write the email in a general manner without mentioning missing information
- Focus on the information that IS available
- Make the email flow naturally without obvious gaps
- If sender name is missing, avoid using "I" statements that require a name
- If company is missing, don't mention company-specific details
- Adapt the tone and content based on available information only

Create an email that:
1. Addresses the recipient personally (if name is available)
2. Shows you've researched their background (using available recipient info)
3. Establishes sender credibility naturally (using available sender info)
4. Provides clear value proposition
5. Includes the specified call-to-action
6. Maintains professional tone
7. NEVER uses placeholder text or brackets for missing information
8. Flows naturally regardless of what information is missing

ADVANCED REASONING REQUIREMENTS:
1. Analyze the academic fit between sender and recipient
2. Identify specific research connections or collaboration opportunities
3. Determine appropriate level of formality based on academic hierarchy
4. Craft compelling narrative showing genuine research interest
5. Include strategic timing considerations for academic cycles

Generate a sophisticated academic email that:
- Opens with specific reference to recipient's recent work or interests
- Establishes sender's credibility and relevant background naturally
- Demonstrates clear research into recipient's academic profile
- Presents compelling value proposition for collaboration/connection
- Uses appropriate academic tone and terminology
- Includes respectful but clear call-to-action with next steps
- Shows understanding of academic timelines and constraints
- Never appears generic or AI-generated

Generate both subject line and email body. Make sure both are complete and professional without any placeholder text.`,
    
    emailPurpose: 'Professional outreach for partnership opportunities',
    callToAction: 'Schedule a brief 15-minute call to discuss potential collaboration',
    temperature: 0.7,
    maxTokens: 500
  });

  // Email Campaign State
  const [campaignState, setCampaignState] = useState({
    status: 'idle', // idle, processing, paused, completed, sending, sent
    processed: 0,
    total: 0,
    successful: 0,
    failed: 0,
    currentBatch: [],
    sendResults: []
  });

  // Field Mapping State
  const [fieldMapping, setFieldMapping] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
    industry: '',
    additional_info: ''
  });

  // Generated emails storage
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Configure, 3: Preview, 4: Send, 5: Results

  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    setIsLoadingSubscription(true);
    try {
      const response = await fetch('/api/subscriptions/current');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data.subscription);
        setUsageData(data.usage);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Check if user can start generation
  const canStartGeneration = () => {
    if (!user) return false;
    if (!usageData) return false;
    
    // Check if user has personalized email access
    if (usageData.personalized_email_limit === 0) {
      return false;
    }
    
    // Check if user has any remaining emails
    if (usageData.personalized_emails_remaining === 0) {
      return false;
    }
    
    return true;
  };


  // Handle CSV upload
  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const response = await fetch('/api/csv/parse', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCsvData(data.rows);
        setCsvHeaders(data.headers);
        // Reset generated emails when new CSV is uploaded
        setGeneratedEmails([]);
        setCampaignState({
          status: 'idle',
          processed: 0,
          total: 0,
          successful: 0,
          failed: 0,
          currentBatch: [],
          sendResults: []
        });
      } else {
        alert('Failed to parse CSV file');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      alert('Error uploading CSV file');
    }
  };

  // Generate single email
  const generateEmailForPerson = async (person) => {
    // Format recipient information
    const recipientInfo = Object.entries(person)
      .filter(([key, value]) => value && value.trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Format sender information
    const senderInfoFormatted = Object.entries(senderInfo)
      .filter(([key, value]) => value && value.trim())
      .map(([key, value]) => `${key.replace('_', ' ')}: ${value}`)
      .join('\n');

    const prompt = agentConfig.emailTemplate
      .replace('{recipient_info}', recipientInfo || 'No specific recipient information provided')
      .replace('{sender_info}', senderInfoFormatted || 'No specific sender information provided')
      .replace('{email_purpose}', agentConfig.emailPurpose)
      .replace('{call_to_action}', agentConfig.callToAction);

    try {
      const response = await fetch('/api/ai/generate-bulk-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: agentConfig.systemPrompt,
          userPrompt: prompt,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update usage data after successful generation
        await fetchSubscriptionData();
        
        return {
          person,
          email: data.email,
          subject: data.subject,
          status: 'generated',
          has_branding: data.has_branding
        };
      } else if (response.status === 403) {
        // Limit reached
        const errorData = await response.json();
        
        if (errorData.upgrade_required) {
          // Show upgrade modal
          setShowUpgradeModal(true);
        }
        
        return {
          person,
          email: null,
          subject: null,
          status: 'limit_reached',
          error: errorData.error
        };
      } else if (response.status === 401) {
        // Authentication required
        const errorData = await response.json();
        return {
          person,
          email: null,
          subject: null,
          status: 'auth_required',
          error: errorData.error
        };
      } else {
        throw new Error('Failed to generate email');
      }
    } catch (error) {
      console.error('Email generation error:', error);
      return {
        person,
        email: null,
        subject: null,
        status: 'failed',
        error: error.message
      };
    }
  };

  // Start bulk email generation
  const startBulkGeneration = async (regenerate = false) => {
    // Check if user can generate
    if (!canStartGeneration()) {
      if (!user) {
        alert('Please sign in to generate personalized emails');
        return;
      }
      if (usageData?.personalized_email_limit === 0) {
        setShowUpgradeModal(true);
        return;
      }
      if (usageData?.personalized_emails_remaining === 0) {
        setShowUpgradeModal(true);
        return;
      }
    }

    if (regenerate) {
      setGeneratedEmails([]);
    }

    setCampaignState({
      status: 'processing',
      processed: 0,
      total: csvData.length,
      successful: 0,
      failed: 0,
      currentBatch: [],
      sendResults: []
    });

    const batchSize = 5;
    const results = [];
    let limitReached = false;

    for (let i = 0; i < csvData.length; i += batchSize) {
      if (limitReached) break;

      const batch = csvData.slice(i, i + batchSize);
      
      const batchPromises = batch.map(generateEmailForPerson);
      const batchResults = await Promise.all(batchPromises);
      
      // Check if any result indicates limit reached
      const limitReachedInBatch = batchResults.some(r => r.status === 'limit_reached');
      if (limitReachedInBatch) {
        limitReached = true;
      }
      
      results.push(...batchResults);
      
      setCampaignState(prev => ({
        ...prev,
        processed: results.length,
        successful: results.filter(r => r.status === 'generated').length,
        failed: results.filter(r => r.status === 'failed' || r.status === 'limit_reached').length,
        currentBatch: batchResults
      }));

      // Stop if limit reached
      if (limitReached) {
        break;
      }

      // Add delay between batches to avoid rate limits
      if (i + batchSize < csvData.length && !limitReached) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setGeneratedEmails(results);
    setCampaignState(prev => ({ ...prev, status: 'completed' }));
    
    // Refresh subscription data to show updated usage
    await fetchSubscriptionData();
  };

  // Send emails
  const sendBulkEmails = async () => {
    const successfulEmails = generatedEmails.filter(email => email.status === 'generated');
    
    if (successfulEmails.length === 0) {
      alert('No emails to send');
      return;
    }

    // Validate SMTP configuration
    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      alert('Please configure your SMTP settings first');
      return;
    }

    // Show loading state and move to results step
    setCampaignState(prev => ({ 
      ...prev, 
      status: 'sending',
      processed: 0,
      successful: 0,
      failed: 0,
      sendResults: []
    }));

    setCurrentStep(5); // Move to results page

    try {
      const results = [];
      
      for (let i = 0; i < successfulEmails.length; i++) {
        const emailItem = successfulEmails[i];
        
        try {
          const response = await fetch('/api/send-emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              emails: [emailItem.person[fieldMapping.email]], // Send one at a time for personalization
              subject: emailItem.subject,
              body: emailItem.email,
              smtpConfig: smtpConfig
            }),
          });

          if (response.ok) {
            const result = await response.json();
            const sendResult = {
              email: emailItem.person[fieldMapping.email],
              name: emailItem.person[fieldMapping.name] || 'Unknown',
              success: true,
              timestamp: new Date().toISOString()
            };
            results.push(sendResult);
            
            // Update progress and results
            setCampaignState(prev => ({ 
              ...prev, 
              processed: i + 1,
              successful: prev.successful + 1,
              sendResults: [...prev.sendResults, sendResult]
            }));
          } else {
            const errorData = await response.json();
            const sendResult = {
              email: emailItem.person[fieldMapping.email],
              name: emailItem.person[fieldMapping.name] || 'Unknown',
              success: false,
              error: errorData.message,
              timestamp: new Date().toISOString()
            };
            results.push(sendResult);
            
            // Update progress and results
            setCampaignState(prev => ({ 
              ...prev, 
              processed: i + 1,
              failed: prev.failed + 1,
              sendResults: [...prev.sendResults, sendResult]
            }));
          }
        } catch (error) {
          const sendResult = {
            email: emailItem.person[fieldMapping.email],
            name: emailItem.person[fieldMapping.name] || 'Unknown',
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          };
          results.push(sendResult);
          
          // Update progress and results
          setCampaignState(prev => ({ 
            ...prev, 
            processed: i + 1,
            failed: prev.failed + 1,
            sendResults: [...prev.sendResults, sendResult]
          }));
        }

        // Add delay between sends to avoid rate limits
        if (i < successfulEmails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 second delay
        }
      }

      // Final update
      setCampaignState(prev => ({ 
        ...prev, 
        status: 'sent'
      }));
      
    } catch (error) {
      console.error('Bulk send error:', error);
      setCampaignState(prev => ({ ...prev, status: 'failed' }));
    }
  };
  
  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderUploadStep();
      case 2:
        return renderConfigureStep();
      case 3:
        return renderPreviewStep();
      case 4:
        return renderSendStep();
      case 5:
        return renderResultsStep();
      default:
        return renderUploadStep();
    }
  };

  // Add this function before your renderUploadStep function
  const downloadDummyData = () => {
    const dummyData = [
      {
        email: 'hi.jaweria@gmail.com',
        name: 'Dr. Jaweria Hassan',
        company: 'University of Punjab',
        role: 'Associate Professor of Computer Science',
        industry: 'Higher Education',
        additional_info: 'Specializes in artificial intelligence and machine learning applications in healthcare. Published 45+ peer-reviewed papers. Currently leading a $2.3M NSF grant on AI-driven diagnostic systems. PhD from Stanford University. Member of IEEE and ACM.'
      },
      {
        email: 'muhammadsaad2387@gmail.com',
        name: 'Prof. Muhammad Saad Ahmad',
        company: 'Lahore University of Management Sciences',
        role: 'Professor of Data Science',
        industry: 'Higher Education',
        additional_info: 'Expert in big data analytics and computational statistics. Department Head with 12 years of experience. Author of \'Modern Statistical Computing\' textbook. Runs the Data Science Research Lab with 15+ graduate students. PhD from MIT, former Google Research scientist.'
      },
      {
        email: 'jaweriab94@gmail.com',
        name: 'Dr. Jaweria Batool',
        company: 'Information Technology University',
        role: 'Assistant Professor of Software Engineering',
        industry: 'Higher Education',
        additional_info: 'Focuses on software architecture and distributed systems. Rising star with 20+ publications in top-tier conferences. Recipient of IEEE Early Career Award 2023. PhD from University of Toronto. Active in open-source community with 50K+ GitHub followers.'
      },
      {
        email: 'jaweriab.codes@gmail.com',
        name: 'Prof. Jaweria Butt',
        company: 'COMSATS University Islamabad',
        role: 'Professor of Cybersecurity',
        industry: 'Higher Education',
        additional_info: 'Leading researcher in network security and cryptography. 15+ years in academia and industry. Former security consultant for major banks. Director of Cybersecurity Research Center. PhD from Carnegie Mellon. Holds 8 patents in encryption technologies.'
      }
    ];

    // Convert to CSV format
    const headers = Object.keys(dummyData[0]);
    const csvContent = [
      headers.join(','),
      ...dummyData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dummy_contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Modified renderUploadStep function
  const renderUploadStep = () => (
    <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
        <Upload className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
        Upload Contact List
      </h2>

      {/* {user && usageData && subscriptionData && (
        <div className="mb-6">
          <UsageWidget 
            usage={usageData}
            subscription={subscriptionData}
            onUpgradeClick={() => router.push('/pricing')}
            context="personalized"
            totalToGenerate={csvData.length}
          />
        </div>
      )}
       */}
      <div className="space-y-6">
        <div 
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-opacity-70 transition-colors cursor-pointer"
          style={{ borderColor: 'var(--border-medium)' }}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-lg mb-2" style={{ color: 'var(--foreground)' }}>
              Upload your CSV file
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Include columns for email, name, company, role, and any additional info
            </p>
          </label>
        </div>

        {/* Download Dummy Data Button */}
        <div className="flex justify-center">
          <Button
            onClick={downloadDummyData}
            variant="ghost"
            icon={<Download className="h-5 w-5" />}
          >
            Download Sample CSV
          </Button>
        </div>

        {csvData.length > 0 && (
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--success-light)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--success)' }}>
              ✅ {csvData.length} contacts loaded
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--success)' }}>
              Headers: {csvHeaders.join(', ')}
            </p>
            
            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="primary"
                iconRight={<ArrowRight className="h-5 w-5" />}
              >
                Next: Configure Agent
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      {/* Sender Information */}
      <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <UserCircle className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          Sender Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Your Name
            </label>
            <input
              type="text"
              value={senderInfo.name}
              onChange={(e) => setSenderInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Job Title
            </label>
            <input
              type="text"
              value={senderInfo.title}
              onChange={(e) => setSenderInfo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="CEO, Marketing Director, etc."
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Company Name
            </label>
            <input
              type="text"
              value={senderInfo.company}
              onChange={(e) => setSenderInfo(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Your Company Ltd."
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Industry
            </label>
            <input
              type="text"
              value={senderInfo.industry}
              onChange={(e) => setSenderInfo(prev => ({ ...prev, industry: e.target.value }))}
              placeholder="Technology, Finance, Healthcare, etc."
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Brief Bio/Description
            </label>
            <textarea
              value={senderInfo.bio}
              onChange={(e) => setSenderInfo(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief description about yourself or your role..."
              rows={3}
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2 resize-none"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Key Expertise/Skills
            </label>
            <input
              type="text"
              value={senderInfo.expertise}
              onChange={(e) => setSenderInfo(prev => ({ ...prev, expertise: e.target.value }))}
              placeholder="AI, Digital Marketing, Product Development, etc."
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Key Achievements (Optional)
            </label>
            <input
              type="text"
              value={senderInfo.achievements}
              onChange={(e) => setSenderInfo(prev => ({ ...prev, achievements: e.target.value }))}
              placeholder="Awards, certifications, notable projects, etc."
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>
        </div>

        <div 
          className="mt-4 p-4 rounded-xl"
          style={{ 
            backgroundColor: 'var(--primary-lightest)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--primary-lighter)'
          }}
        >
          <p className="text-sm" style={{ color: 'var(--primary-active)' }}>
            💡 <strong>Note:</strong> All fields are optional. The AI will only use the information you provide and won't include placeholder text for empty fields.
          </p>
        </div>
      </div>

      {/* Field Mapping */}
      <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <Settings className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          Map CSV Fields (Recipient Info)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldMapping).map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                {field.replace('_', ' ').toUpperCase()}
                {field === 'email' && <span style={{ color: 'var(--error)' }}> *</span>}
              </label>
              <select
                value={fieldMapping[field]}
                onChange={(e) => setFieldMapping(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary-color)'
                }}
              >
                <option value="">Select column</option>
                {csvHeaders.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <Mail className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          Email Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              SMTP Host
            </label>
            <input
              type="text"
              value={smtpConfig.host}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
              placeholder="smtp.gmail.com"
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Port
            </label>
            <input
              type="number"
              value={smtpConfig.port}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              placeholder="587"
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Email Address <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="email"
              value={smtpConfig.auth.user}
              onChange={(e) => setSmtpConfig(prev => ({ 
                ...prev, 
                auth: { ...prev.auth, user: e.target.value }
              }))}
              placeholder="your-email@gmail.com"
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              App Password <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="password"
              value={smtpConfig.auth.pass}
              onChange={(e) => setSmtpConfig(prev => ({ 
                ...prev, 
                auth: { ...prev.auth, pass: e.target.value }
              }))}
              placeholder="App-specific password"
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              From Name
            </label>
            <input
              type="text"
              value={smtpConfig.fromName}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, fromName: e.target.value }))}
              placeholder="Your Company Name"
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>
        </div>

        <div 
          className="mt-4 p-4 rounded-xl"
          style={{ 
            backgroundColor: 'var(--primary-lightest)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--primary-lighter)'
          }}
        >
          <p className="text-sm" style={{ color: 'var(--primary-active)' }}>
            💡 <strong>For Gmail:</strong> Use your Gmail address and an App Password (not your regular password). 
            <br />Generate an App Password at: Google Account → Security → 2-Step Verification → App passwords
          </p>
        </div>
      </div>

      {/* Agent Configuration */}
      <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <Bot className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          Configure AI Agent
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Agent Name
            </label>
            <input
              type="text"
              value={agentConfig.name}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Email Purpose
            </label>
            <input
              type="text"
              value={agentConfig.emailPurpose}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, emailPurpose: e.target.value }))}
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Call-to-Action
            </label>
            <textarea
              value={agentConfig.callToAction}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, callToAction: e.target.value }))}
              rows={2}
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2 resize-none"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              System Prompt (Advanced)
            </label>
            <textarea
              value={agentConfig.systemPrompt}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={6}
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2 resize-none"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => setCurrentStep(1)}
            variant="ghost"
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep(3)}
            disabled={!fieldMapping.email || !smtpConfig.auth.user || !smtpConfig.auth.pass}
            variant="primary"
            className="flex-1"
            iconRight={<ArrowRight className="h-5 w-5" />}
          >
            Preview & Generate
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <Users className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          Campaign Preview
        </h2>
        
        {/* Sender & Recipient Info Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <UserCircle className="h-5 w-5" />
              Sender Information
            </h3>
            <div className="space-y-2 text-sm">
              {senderInfo.name && (
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">Name:</span> <span style={{ color: 'var(--foreground)' }}>{senderInfo.name}</span>
                </div>
              )}
              {senderInfo.title && (
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">Title:</span> <span style={{ color: 'var(--foreground)' }}>{senderInfo.title}</span>
                </div>
              )}
              {senderInfo.company && (
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">Company:</span> <span style={{ color: 'var(--foreground)' }}>{senderInfo.company}</span>
                </div>
              )}
              {senderInfo.industry && (
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">Industry:</span> <span style={{ color: 'var(--foreground)' }}>{senderInfo.industry}</span>
                </div>
              )}
              {!senderInfo.name && !senderInfo.title && !senderInfo.company && (
                <div className="italic" style={{ color: 'var(--text-tertiary)' }}>No sender information provided</div>
              )}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Users className="h-5 w-5" />
              Recipient Data Fields
            </h3>
            <div className="space-y-2 text-sm">
              {Object.entries(fieldMapping).map(([field, csvField]) => (
                csvField && (
                  <div key={field} style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium">{field.replace('_', ' ').toUpperCase()}:</span> 
                    <span style={{ color: 'var(--foreground)' }} className="ml-2">{csvField}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--primary-lightest)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>{csvData.length}</div>
            <div className="text-sm" style={{ color: 'var(--primary-active)' }}>Total Recipients</div>
          </div>
          <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--success-light)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--success)' }}>{campaignState.successful}</div>
            <div className="text-sm" style={{ color: 'var(--success)' }}>Generated</div>
          </div>
          <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--error-light)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--error)' }}>{campaignState.failed}</div>
            <div className="text-sm" style={{ color: 'var(--error)' }}>Failed</div>
          </div>
        </div>

        {/* Progress Bar */}
        {campaignState.status === 'processing' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              <span>Generating emails...</span>
              <span>{campaignState.processed} / {campaignState.total}</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--gray-200)' }}>
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(campaignState.processed / campaignState.total) * 100}%`,
                  backgroundColor: 'var(--primary-color)'
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Generated Emails Preview */}
        {generatedEmails.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Eye className="h-5 w-5" />
              Generated Emails Preview
            </h3>
            <div className="rounded-xl p-4 max-h-96 overflow-y-auto" style={{ backgroundColor: 'var(--background-secondary)' }}>
              <div className="space-y-4">
                {generatedEmails.map((emailItem, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          To: {emailItem.person[fieldMapping.email]}
                        </span>
                        {emailItem.person[fieldMapping.name] && (
                          <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                            ({emailItem.person[fieldMapping.name]})
                          </span>
                        )}
                      </div>
                      {emailItem.status === 'generated' ? (
                        <Check className="h-5 w-5" style={{ color: 'var(--success)' }} />
                      ) : (
                        <X className="h-5 w-5" style={{ color: 'var(--error)' }} />
                      )}
                    </div>
                    
                    {emailItem.status === 'generated' ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Subject: </span>
                          <span className="text-sm" style={{ color: 'var(--foreground)' }}>{emailItem.subject}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email Body:</span>
                          <div className="rounded-lg p-3 mt-2 max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--background-secondary)' }}>
                            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                              {emailItem.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm" style={{ color: 'var(--error)' }}>
                        Failed to generate: {emailItem.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setCurrentStep(2)}
            variant="ghost"
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Back to Configure
          </Button>
          
          {campaignState.status === 'idle' && (
            <Button
              onClick={() => startBulkGeneration(false)}
              disabled={!user}
              variant="primary"
              className="flex-1"
              icon={<Play className="h-5 w-5" />}
            >
              Start Generating Emails
            </Button>
          )}

          {campaignState.status === 'completed' && generatedEmails.length > 0 && (
            <div className="flex gap-4 flex-1">
              <Button
                onClick={() => startBulkGeneration(true)}
                variant="outline"
                icon={<RefreshCw className="h-5 w-5" />}
              >
                Regenerate All
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                variant="primary"
                className="flex-1"
                icon={<Send className="h-5 w-5" />}
              >
                Review & Send
              </Button>
            </div>
          )}
        </div>

        {!user && (
          <div 
            className="mt-4 p-4 rounded-xl text-center"
            style={{ 
              backgroundColor: 'var(--error-light)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--error)'
            }}
          >
            <p style={{ color: 'var(--error)' }}>
              ⚠️ Please sign in to generate and send bulk emails
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSendStep = () => (
    <div className="space-y-6">
      {/* Results Overview */}
      <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <Send className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          Ready to Send
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'var(--primary-lightest)', borderColor: 'var(--primary-lighter)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-color)' }}>{generatedEmails.length}</div>
            <div className="text-sm" style={{ color: 'var(--primary-active)' }}>Total Processed</div>
          </div>
          <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'var(--success-light)', borderColor: 'var(--success)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--success)' }}>
              {generatedEmails.filter(e => e.status === 'generated').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--success)' }}>Ready to Send</div>
          </div>
          <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'var(--error-light)', borderColor: 'var(--error)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--error)' }}>
              {generatedEmails.filter(e => e.status === 'failed').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--error)' }}>Failed Generation</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#f3e8ff' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: '#9333ea' }}>
              {Math.round((generatedEmails.filter(e => e.status === 'generated').length / generatedEmails.length) * 100)}%
            </div>
            <div className="text-sm" style={{ color: '#9333ea' }}>Success Rate</div>
          </div>
        </div>

        {/* Email List Preview */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Emails to be Sent</h3>
          <div className="max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {generatedEmails.filter(e => e.status === 'generated').map((emailItem, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                    <div>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {emailItem.person[fieldMapping.email]}
                      </span>
                      {emailItem.person[fieldMapping.name] && (
                        <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>
                          ({emailItem.person[fieldMapping.name]})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {emailItem.subject?.substring(0, 50)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SMTP Configuration Summary */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Email Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>From: </span>
              <span style={{ color: 'var(--foreground)' }}>{smtpConfig.fromName || smtpConfig.auth.user}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>SMTP: </span>
              <span style={{ color: 'var(--foreground)' }}>{smtpConfig.host}:{smtpConfig.port}</span>
            </div>
          </div>
        </div>

        {/* Send Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => setCurrentStep(3)}
            variant="ghost"
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Back to Preview
          </Button>
          
          <Button
            onClick={sendBulkEmails}
            disabled={generatedEmails.filter(e => e.status === 'generated').length === 0}
            variant="primary"
            className="flex-1"
            icon={<Send className="h-5 w-5" />}
          >
            Send {generatedEmails.filter(e => e.status === 'generated').length} Emails
          </Button>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      {/* Sending Progress */}
      <div className="bg-white rounded-2xl border shadow-lg p-8" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <BarChart3 className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          {campaignState.status === 'sending' ? 'Sending Emails...' : 'Campaign Results'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'var(--primary-lightest)', borderColor: 'var(--primary-lighter)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-color)' }}>{campaignState.processed}</div>
            <div className="text-sm" style={{ color: 'var(--primary-active)' }}>Processed</div>
          </div>
          <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'var(--success-light)', borderColor: 'var(--success)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--success)' }}>{campaignState.successful}</div>
            <div className="text-sm" style={{ color: 'var(--success)' }}>Sent Successfully</div>
          </div>
          <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'var(--error-light)', borderColor: 'var(--error)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--error)' }}>{campaignState.failed}</div>
            <div className="text-sm" style={{ color: 'var(--error)' }}>Failed</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#f3e8ff' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: '#9333ea' }}>
              {campaignState.processed > 0 ? Math.round((campaignState.successful / campaignState.processed) * 100) : 0}%
            </div>
            <div className="text-sm" style={{ color: '#9333ea' }}>Success Rate</div>
          </div>
        </div>

        {/* Progress Bar for Sending */}
        {campaignState.status === 'sending' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              <span>Sending emails...</span>
              <span>{campaignState.processed} / {generatedEmails.filter(e => e.status === 'generated').length}</span>
            </div>
            <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--gray-200)' }}>
              <div 
                className="h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(campaignState.processed / generatedEmails.filter(e => e.status === 'generated').length) * 100}%`,
                  backgroundColor: 'var(--success)'
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Detailed Results */}
        {campaignState.sendResults.length > 0 && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Detailed Results</h3>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {campaignState.sendResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between rounded-lg p-3 border"
                    style={{ 
                      backgroundColor: result.success ? 'var(--success-light)' : 'var(--error-light)',
                      borderColor: result.success ? 'var(--success)' : 'var(--error)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5" style={{ color: 'var(--success)' }} />
                      ) : (
                        <AlertCircle className="h-5 w-5" style={{ color: 'var(--error)' }} />
                      )}
                      <div>
                        <span className="font-medium" style={{ color: 'var(--foreground)' }}>{result.name}</span>
                        <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>({result.email})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ color: result.success ? 'var(--success)' : 'var(--error)' }}>
                        {result.success ? 'Sent' : 'Failed'}
                      </div>
                      {result.error && (
                        <div className="text-xs" style={{ color: 'var(--error)' }}>{result.error}</div>
                      )}
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {campaignState.status === 'sent' && (
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => {
                // Reset to start a new campaign
                setCurrentStep(1);
                setGeneratedEmails([]);
                setCampaignState({
                  status: 'idle',
                  processed: 0,
                  total: 0,
                  successful: 0,
                  failed: 0,
                  currentBatch: [],
                  sendResults: []
                });
              }}
              variant="primary"
              className="flex-1"
              icon={<Upload className="h-5 w-5" />}
            >
              Start New Campaign
            </Button>
            
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              icon={<Building className="h-5 w-5" />}
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  // Auth check
  if (!user && !isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-secondary)' }}>
        <div className="bg-white rounded-2xl border shadow-xl p-8 text-center max-w-md" style={{ borderColor: 'var(--border-light)' }}>
          <Bot className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Bulk Email Agent</h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Please sign in to access the bulk email generation system.</p>
          <Button
            onClick={() => router.push('/login')}
            variant="primary"
            className="w-full"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-3 shadow-md" style={{ backgroundColor: 'var(--primary-color)' }}>
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Bulk Email Agent
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                AI-powered personalized email campaigns
              </p>
            </div>
          </div>

          {/* User Profile */}

        </div>

        {/* Step Navigation */}
        <div className="bg-white rounded-2xl border p-4 mb-8 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Upload CSV', icon: Upload },
              { step: 2, label: 'Configure Agent', icon: Settings },
              { step: 3, label: 'Generate Emails', icon: Bot },
              { step: 4, label: 'Review & Send', icon: Send },
              { step: 5, label: 'Results', icon: BarChart3 }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                    currentStep >= step ? '' : ''
                  }`}
                  style={{
                    backgroundColor: currentStep >= step ? 'var(--primary-color)' : 'transparent',
                    color: currentStep >= step ? 'white' : 'var(--text-tertiary)'
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">{label}</span>
                </div>
                {step < 5 && <div className="w-6 h-px mx-1 hidden sm:block" style={{ backgroundColor: 'var(--border-light)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {renderStep()}
      </div>
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType="personalized"
        />
      )}
    </div>
  );
};

export default BulkEmailAgent;