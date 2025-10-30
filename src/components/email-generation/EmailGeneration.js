"use client"
import React, { useState, useEffect } from 'react';
import { Send, Copy, Mail, Settings, Sparkles, User, Building, MessageSquare, Clock, Heart, Briefcase, Shield, Smile, LogOut, UserPlus, LogIn, Users } from 'lucide-react';
import { createPrompt } from '@/lib/ai-services';
import { AI_PROVIDERS, AI_PROVIDER_INFO } from '@/lib/ai-config';
import ProviderSelector from '@/components/ProviderSelector';
import EmailSender from '@/components/EmailSender';
import Footer from '@/components/Footer';
import EmailGenerationFeedback from '@/components/EmailGenerationFeedback';
import EmailSenderFeedback from '@/components/EmailSenderFeedback';
import FloatingGenerationGuide from '@/components/GenerationGuide';
import EmailOpener from '@/components/EmailOpener';
import UsageWidget from '@/components/UsageWidget';
import UpgradeModal from '@/components/UpgradeModal';
import { useRouter } from 'next/navigation';

const EmailGeneration = ({ user, onLogout, isLoadingUser }) => {
    const router = useRouter();
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [usageData, setUsageData] = useState(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    
    const [formData, setFormData] = useState({
        rawThoughts: '',
        tone: 'professional',
        recipient: '',
        senderName: '',
        subject: '',
        context: '',
        replyingTo: '',
        priority: 'normal',
        relationship: 'professional',
        purpose: 'general',
        length: 'medium'
    });
    
    const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS.GEMINI);
    
    const [generatedEmail, setGeneratedEmail] = useState({
        subject: '',
        body: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showEmailSender, setShowEmailSender] = useState(false);
    const [showGenerationFeedback, setShowGenerationFeedback] = useState(false);
    const [showSenderFeedback, setShowSenderFeedback] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [hasFreeEmail, setHasFreeEmail] = useState(true);
    const [isCheckingFreeEmail, setIsCheckingFreeEmail] = useState(true);

    // Check free email status on mount and when user changes
    useEffect(() => {
        if (user) {
            // For authenticated users, fetch subscription data
            fetchSubscriptionData();
            setIsCheckingFreeEmail(false);
        } else {
            // For anonymous users, check free email status
            const checkFreeEmail = async () => {
                setIsCheckingFreeEmail(true);
                try {
                    const response = await fetch('/api/check-free-email');
                    if (response.ok) {
                        const data = await response.json();
                        setHasFreeEmail(data.hasFreeEmail);
                    }
                } catch (error) {
                    console.error('Failed to check free email status:', error);
                } finally {
                    setIsCheckingFreeEmail(false);
                }
            };

            checkFreeEmail();
        }
    }, [user]);
    const tones = [
        { value: 'professional', label: 'Professional', icon: Briefcase },
        { value: 'friendly', label: 'Friendly', icon: Smile },
        { value: 'formal', label: 'Formal', icon: Shield },
        { value: 'warm', label: 'Warm', icon: Heart },
        { value: 'concise', label: 'Concise', icon: Clock },
        { value: 'enthusiastic', label: 'Enthusiastic', icon: Sparkles }
    ];

    const priorities = [
        { value: 'low', label: 'Low Priority' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High Priority' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const relationships = [
        { value: 'professional', label: 'Professional Colleague' },
        { value: 'client', label: 'Client/Customer' },
        { value: 'manager', label: 'Manager/Boss' },
        { value: 'friend', label: 'Friend' },
        { value: 'unknown', label: 'First Contact' }
    ];

    const purposes = [
        { value: 'general', label: 'General Communication' },
        { value: 'request', label: 'Making a Request' },
        { value: 'follow-up', label: 'Follow-up' },
        { value: 'thank-you', label: 'Thank You' },
        { value: 'apology', label: 'Apology' },
        { value: 'invitation', label: 'Invitation' },
        { value: 'complaint', label: 'Complaint/Issue' },
        { value: 'proposal', label: 'Proposal/Pitch' }
    ];

    const lengths = [
        { value: 'short', label: 'Short (1-2 paragraphs)' },
        { value: 'medium', label: 'Medium (3-4 paragraphs)' },
        { value: 'long', label: 'Long (5+ paragraphs)' }
    ];

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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleProviderChange = (provider) => {
        setSelectedProvider(provider);
    };

    const generateEmail = async () => {
        if (!formData.rawThoughts.trim()) {
            alert('Please enter your thoughts about what you want to say');
            return;
        }

        setIsLoading(true);
        
        try {
            const prompt = createPrompt(formData);
            const response = await fetch('/api/generate-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider: selectedProvider,
                prompt: prompt
            })
            });

            if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 403) {
                // Check if it's a subscription limit issue
                if (errorData.upgrade_required) {
                setShowUpgradeModal(true);
                return;
                }
                
                // Handle anonymous user (free email used)
                setHasFreeEmail(false);
                
                if (confirm(errorData.error + ' Would you like to sign in now?')) {
                router.push('/login');
                }
            } else {
                throw new Error(errorData.error || 'Failed to generate email');
            }
            return;
            }

            const result = await response.json();
            setGeneratedEmail(result);
            
            // If user is not logged in, they just used their free email
            if (!user) {
            setHasFreeEmail(false);
            } else {
            // Refresh subscription data to show updated usage
            await fetchSubscriptionData();
            }
            
            // Save activity to database only for authenticated users
            if (user) {
            await saveEmailActivity(result);
            }
            
            setTimeout(() => {
            setShowGenerationFeedback(true);
            }, 1500);
        } catch (error) {
            console.error('Error generating email:', error);
            alert(`Error generating email: ${error.message}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
        };

    const copyToClipboard = async () => {
        try {
            const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
            await navigator.clipboard.writeText(fullEmail);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const openEmailSender = () => {
        if (!generatedEmail.subject || !generatedEmail.body) {
            alert('Please generate an email first before sending');
            return;
        }
        setShowEmailSender(true);
    };

    const saveEmailActivity = async (emailData) => {
        try {
            await fetch('/api/email-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: emailData.subject,
                    body: emailData.body,
                    recipient: formData.recipient,
                    tone: formData.tone,
                    ai_provider: selectedProvider,
                    purpose: formData.purpose,
                    priority: formData.priority,
                    status: 'generated'
                }),
            });
        } catch (error) {
            console.error('Failed to save email activity:', error);
        }
    };

    const handleGenerationFeedback = async (feedbackData) => {
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'email_generation',
                    feedback: feedbackData,
                    ai_provider: selectedProvider,
                    user_id: user?.id
                }),
            });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        }
    };

    const handleSenderFeedback = async (feedbackData) => {
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'email_sender',
                    feedback: feedbackData,
                    email_sent: emailSent,
                    user_id: user?.id
                }),
            });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        }
    };

    if (showEmailSender) {
        return (
            <>
                <EmailSender 
                    subject={generatedEmail.subject}
                    body={generatedEmail.body}
                    onBack={() => setShowEmailSender(false)}
                    onEmailSent={(success) => {
                        setEmailSent(success);
                        setTimeout(() => {
                            setShowSenderFeedback(true);
                        }, 1000);
                    }}
                />
                {showSenderFeedback && (
                    <EmailSenderFeedback
                        onClose={() => setShowSenderFeedback(false)}
                        emailSent={emailSent}
                        onSubmit={handleSenderFeedback}
                    />
                )}
            </>
        );
    }

    return (
        <div>
            {user && usageData && subscriptionData && (
            <div className="mb-8">
                <UsageWidget 
                    usage={usageData}
                    subscription={subscriptionData}
                    onUpgradeClick={() => router.push('/pricing')}
                    context="simple"
                />
            </div>
            )}
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <MessageSquare className="h-6 w-6" />
                        Email Details
                    </h2>
                    
                    <div className="space-y-6">
                        {/* Free Trial Status Banner - Only show for non-authenticated users */}
                        {!user && !isCheckingFreeEmail && (
                            hasFreeEmail ? (
                                <div className="rounded-xl p-4 border bg-green-500/20 border-green-400/30 text-green-200">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="font-semibold">
                                            Free email generation available
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1">
                                        Try our AI email generator - no sign up required!
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl p-4 border bg-red-500/20 border-red-400/30 text-red-200">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <span className="font-semibold">
                                            Free email limit reached
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1">
                                        Please{' '}
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="underline font-semibold hover:text-red-100"
                                        >
                                            sign in
                                        </button>
                                        {' '}to continue generating emails.
                                    </p>
                                </div>
                            )
                        )}

                        {/* Raw Thoughts */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                What do you want to say? *
                            </label>
                            <textarea
                                value={formData.rawThoughts}
                                onChange={(e) => handleInputChange('rawThoughts', e.target.value)}
                                placeholder="e.g., Need to follow up on the project deadline, want to sound professional but not pushy..."
                                rows={4}
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                                disabled={!user && !hasFreeEmail}
                            />
                        </div>

                        {/* Recipient */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                <User className="h-4 w-4 inline mr-1" />
                                Recipient
                            </label>
                            <input
                                type="text"
                                value={formData.recipient}
                                onChange={(e) => handleInputChange('recipient', e.target.value)}
                                placeholder="e.g., John Smith, Sarah from Marketing"
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                                disabled={!user && !hasFreeEmail}
                            />
                        </div>

                        {/* Subject Context */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                Subject Context
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                placeholder="e.g., Project update, Meeting request, Follow-up"
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                                disabled={!user && !hasFreeEmail}
                            />
                        </div>

                        {/* Sender Name */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                <User className="h-4 w-4 inline mr-1" />
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={formData.senderName}
                                onChange={(e) => handleInputChange('senderName', e.target.value)}
                                placeholder="e.g., John Doe, Sarah Johnson"
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                                disabled={!user && !hasFreeEmail}
                            />
                        </div>

                        {/* Tone Selection */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                Tone
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {tones.map((tone) => {
                                    const IconComponent = tone.icon;
                                    return (
                                        <button
                                            key={tone.value}
                                            onClick={() => handleInputChange('tone', tone.value)}
                                            disabled={!user && !hasFreeEmail}
                                            className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                                                formData.tone === tone.value
                                                    ? 'bg-purple-500/50 border-purple-300 text-white'
                                                    : 'bg-white/10 border-white/20 text-purple-100 hover:bg-white/20'
                                            } ${(!user && !hasFreeEmail) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <IconComponent className="h-4 w-4" />
                                            <span className="text-sm font-medium">{tone.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Relationship */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                Relationship with Recipient
                            </label>
                            <select
                                value={formData.relationship}
                                onChange={(e) => handleInputChange('relationship', e.target.value)}
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                                disabled={!user && !hasFreeEmail}
                            >
                                {relationships.map((rel) => (
                                    <option key={rel.value} value={rel.value} className="bg-purple-800">
                                        {rel.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Purpose */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                Email Purpose
                            </label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                                disabled={!user && !hasFreeEmail}
                            >
                                {purposes.map((purpose) => (
                                    <option key={purpose.value} value={purpose.value} className="bg-purple-800">
                                        {purpose.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority and Length */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-purple-100 text-sm font-medium mb-3">
                                    Priority
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                    className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                                    disabled={!user && !hasFreeEmail}
                                >
                                    {priorities.map((priority) => (
                                        <option key={priority.value} value={priority.value} className="bg-purple-800">
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-purple-100 text-sm font-medium mb-3">
                                    Length
                                </label>
                                <select
                                    value={formData.length}
                                    onChange={(e) => handleInputChange('length', e.target.value)}
                                    className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                                    disabled={!user && !hasFreeEmail}
                                >
                                    {lengths.map((length) => (
                                        <option key={length.value} value={length.value} className="bg-purple-800">
                                            {length.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Additional Context */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                Additional Context
                            </label>
                            <textarea
                                value={formData.context}
                                onChange={(e) => handleInputChange('context', e.target.value)}
                                placeholder="Any additional context, background information, or specific requirements..."
                                rows={3}
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                                disabled={!user && !hasFreeEmail}
                            />
                        </div>

                        {/* Replying To (Optional) */}
                        <div>
                            <label className="block text-purple-100 text-sm font-medium mb-3">
                                Replying to this email (optional)
                            </label>
                            <textarea
                                value={formData.replyingTo}
                                onChange={(e) => handleInputChange('replyingTo', e.target.value)}
                                placeholder="Paste the email you're replying to here..."
                                rows={4}
                                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                                disabled={!user && !hasFreeEmail}
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateEmail}
                            disabled={isLoading || (!user && !hasFreeEmail)}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Crafting with {AI_PROVIDER_INFO[selectedProvider].name}...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    {user
                                        ? `Generate Email with ${AI_PROVIDER_INFO[selectedProvider].name}`
                                        : hasFreeEmail
                                        ? `Try Free Generation with ${AI_PROVIDER_INFO[selectedProvider].name}`
                                        : 'Sign In to Generate Email'
                                    }
                                </>
                            )}
                        </button>

                        {/* Optional: Sign in prompt below button for non-authenticated users without free email */}
                        {!user && !hasFreeEmail && (
                            <p className="text-center text-sm text-purple-200">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="underline hover:text-white font-medium"
                                >
                                    Sign in
                                </button>
                                {' '}or{' '}
                                <button
                                    onClick={() => router.push('/signup')}
                                    className="underline hover:text-white font-medium"
                                >
                                    create an account
                                </button>
                                {' '}to continue generating emails
                            </p>
                        )}
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-6 lg:p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                            Generated Email
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                            {(generatedEmail.subject || generatedEmail.body) && (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 text-sm sm:text-base min-w-0 ${
                                            copySuccess
                                                ? 'bg-green-500/50 text-green-100'
                                                : 'bg-white/20 hover:bg-white/30 text-white'
                                        }`}
                                    >
                                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="xs:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                    <button
                                        onClick={openEmailSender}
                                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300 text-sm sm:text-base min-w-0"
                                    >
                                        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="xs:inline">Send Email</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6 min-h-[300px] sm:min-h-[400px]">
                        {generatedEmail.subject || generatedEmail.body ? (
                            <div className="text-white space-y-3 sm:space-y-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-purple-200 mb-2">Subject:</h3>
                                    <div className="bg-white/10 rounded-lg p-2 sm:p-3 border border-white/20 break-words">
                                        <p className="text-sm sm:text-base leading-relaxed">{generatedEmail.subject}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-purple-200 mb-2">Email Body:</h3>
                                    <div className="bg-white/10 rounded-lg p-2 sm:p-3 border border-white/20 overflow-hidden">
                                        <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere">
                                            {generatedEmail.body}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <EmailOpener
                                        subject={generatedEmail.subject}
                                        body={generatedEmail.body}
                                        recipient={formData.recipient}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-purple-200 px-4">
                                <div className="text-center max-w-sm">
                                    <Mail className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                                    <p className="text-base sm:text-lg mb-2">Your generated email will appear here</p>
                                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                                        {user 
                                            ? "Fill in the details and click 'Generate Email'"
                                            : hasFreeEmail 
                                            ? "Fill in the details and try your free generation"
                                            : "Sign in to generate professional emails"
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center my-12">
                <p className="text-purple-200 text-sm">
                    Powered by {AI_PROVIDER_INFO[selectedProvider].name} • 
                    Professional AI email generation service
                </p>
                <p className="text-purple-300 text-xs mt-2">
                    Multi-AI email generation with professional quality results
                </p>
            </div>
            
            {showGenerationFeedback && (
                <EmailGenerationFeedback
                    onClose={() => setShowGenerationFeedback(false)}
                    emailData={generatedEmail}
                    provider={selectedProvider}
                    onSubmit={handleGenerationFeedback}
                />
            )}
            {/* <FloatingGenerationGuide /> */}
            {/* Upgrade Modal */}
            {showUpgradeModal && (
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitType="simple"
            />
            )}
        </div>
    )
};

export default EmailGeneration;
