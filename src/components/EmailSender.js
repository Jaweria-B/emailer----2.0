import React, { useState, useEffect } from 'react';
import { Send, Plus, X, Mail, Users, Settings, ArrowLeft, Check, AlertCircle, Upload, Download, FileText, Eye, EyeOff, User, Server } from 'lucide-react';

const EmailSender = ({ subject, body, onBack, onEmailSent }) => {
  const [emailList, setEmailList] = useState(['']);
  const [emailConfig, setEmailConfig] = useState({
    subject: subject || 'Collaboration Opportunity',
    greetingTemplate: 'Dear Sir/Madam,'
  });
  const [showQuickGuide, setShowQuickGuide] = useState(false);
  
  const [smtpConfig, setSmtpConfig] = useState({
    fromEmail: '',
    fromPassword: '',
    provider: 'gmail',
    customProvider: '',
    port: 587,
    method: 'TLS',
    useCustom: false
  });
  
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState([]);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [bulkEmailText, setBulkEmailText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [extractedEmails, setExtractedEmails] = useState([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [importMethod, setImportMethod] = useState('text');
  const [fileProcessing, setFileProcessing] = useState(false);
  const [showAllEmails, setShowAllEmails] = useState(false);

  const smtpProviders = {
    gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
    outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
    yahoo: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
    hostinger: { host: 'smtp.hostinger.com', port: 465, secure: true },
    godaddy: { host: 'smtpout.secureserver.net', port: 465, secure: true },
    custom: { host: '', port: 587, secure: false }
  };

  useEffect(() => {
    if (subject) {
      setEmailConfig(prev => ({ ...prev, subject }));
    }
  }, [subject]);

  const getPersonalizedEmailBody = () => {
    if (!body) return '';
    
    const greetingPatterns = [
      /^Dear[^,\n]*[,\n]/gim,
      /^Hello[^,\n]*[,\n]/gim,
      /^Hi[^,\n]*[,\n]/gim,
      /^Good morning[^,\n]*[,\n]/gim,
      /^Good afternoon[^,\n]*[,\n]/gim,
      /^Good evening[^,\n]*[,\n]/gim,
      /^Greetings[^,\n]*[,\n]/gim,
      /\[Recipient Name\]/gi,
      /\[Name\]/gi,
      /\[RECIPIENT\]/gi
    ];

    let personalizedBody = body;
    let greetingReplaced = false;
    
    greetingPatterns.forEach(pattern => {
      if (personalizedBody.match(pattern)) {
        personalizedBody = personalizedBody.replace(pattern, emailConfig.greetingTemplate + '\n\n');
        greetingReplaced = true;
      }
    });

    if (!greetingReplaced) {
      const lines = personalizedBody.split('\n');
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.match(/^(dear|hello|hi|greetings|good morning|good afternoon|good evening)/i)) {
          lines[0] = emailConfig.greetingTemplate;
          personalizedBody = lines.join('');
        }
      }
    }

    return personalizedBody;
  };

  const addEmailField = () => {
    setEmailList([...emailList, '']);
  };

  const removeEmailField = (index) => {
    const newList = emailList.filter((_, i) => i !== index);
    setEmailList(newList.length === 0 ? [''] : newList);
  };

  const updateEmail = (index, value) => {
    const newList = [...emailList];
    newList[index] = value;
    setEmailList(newList);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const extractEmailsFromText = (text) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = text.match(emailRegex) || [];
    return [...new Set(foundEmails.filter(email => validateEmail(email)))];
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const emails = [];
    
    lines.forEach(line => {
      const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      cells.forEach(cell => {
        const extractedEmails = extractEmailsFromText(cell);
        emails.push(...extractedEmails);
      });
    });
    
    return [...new Set(emails)];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileProcessing(true);

    try {
      let emails = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        emails = parseCSV(text);
      }
      else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        emails = extractEmailsFromText(text);
      }
      else {
        const text = await file.text();
        emails = extractEmailsFromText(text);
      }

      setExtractedEmails(emails);
      if (emails.length > 0) {
        setShowEmailPreview(true);
      } else {
        alert('No valid email addresses found in the file.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setFileProcessing(false);
      event.target.value = '';
    }
  };

  const processBulkEmails = () => {
    let emails = [];
    
    if (importMethod === 'text') {
      emails = bulkEmailText
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && validateEmail(email));
    } else {
      emails = extractedEmails;
    }
    
    setEmailList(emails.length > 0 ? emails : ['']);
    setBulkEmailText('');
    setExtractedEmails([]);
    setShowBulkImport(false);
    setShowEmailPreview(false);
    setImportMethod('text');
  };

  const closeBulkImport = () => {
    setBulkEmailText('');
    setExtractedEmails([]);
    setShowBulkImport(false);
    setShowEmailPreview(false);
    setImportMethod('text');
  };

  const handleProviderChange = (provider) => {
    const providerConfig = smtpProviders[provider];
    setSmtpConfig(prev => ({
      ...prev,
      provider,
      port: providerConfig.port,
      method: providerConfig.secure ? 'SSL' : 'TLS',
      useCustom: provider === 'custom'
    }));
  };

  const sendEmails = async () => {
    const validEmails = emailList.filter(email => email && validateEmail(email));
    
    if (validEmails.length === 0) {
      alert('Please enter at least one valid email address');
      return;
    }

    if (!body) {
      alert('No email content to send. Please generate an email first.');
      return;
    }

    if (!smtpConfig.fromEmail || !smtpConfig.fromPassword) {
      alert('Please configure your SMTP settings first.');
      return;
    }

    setSending(true);
    setSendResults([]);

    try {
      const personalizedBody = getPersonalizedEmailBody();
      
      const smtpSettings = {
        host: smtpConfig.useCustom ? smtpConfig.customProvider : smtpProviders[smtpConfig.provider].host,
        port: smtpConfig.port,
        secure: smtpConfig.method === 'SSL',
        auth: {
          user: smtpConfig.fromEmail,
          pass: smtpConfig.fromPassword
        }
      };
      
      // Simulated send for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = validEmails.map(email => ({
        email: email,
        success: true,
        error: null
      }));
      
      setSendResults(results);
      
      if (onEmailSent) {
        onEmailSent(true);
      }
      
    } catch (error) {
      console.error('Error sending emails:', error);
      const errorResults = validEmails.map(email => ({
        email: email,
        success: false,
        error: error.message || 'Failed to send email'
      }));
      setSendResults(errorResults);
      
      if (onEmailSent) {
        onEmailSent(false);
      }
    } finally {
      setSending(false);
    }
  };

  const exportEmailList = () => {
    const validEmails = emailList.filter(email => email && validateEmail(email));
    const dataStr = validEmails.join('\n');
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'email-list.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const validEmailCount = emailList.filter(email => email && validateEmail(email)).length;
  const displayedEmails = showAllEmails ? emailList : emailList.slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Email Generator</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Send Your Emails
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Configure recipients and send your perfectly crafted email to multiple contacts at once
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Recipients Section */}
          <div className="bg-[color:var(--primary-color)] rounded-2xl border border-gray-200 shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                Recipients ({validEmailCount})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
                <button
                  onClick={exportEmailList}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Email Preview Modal */}
            {showEmailPreview && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Extracted Emails ({extractedEmails.length})</h3>
                    <button
                      onClick={() => setShowEmailPreview(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mb-4">
                    <div className="grid gap-2">
                      {extractedEmails.map((email, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg px-3 py-2 text-gray-700 text-sm">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={processBulkEmails}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors font-medium"
                    >
                      Import {extractedEmails.length} Emails
                    </button>
                    <button
                      onClick={() => setShowEmailPreview(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Import Modal */}
            {showBulkImport && !showEmailPreview && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Bulk Import Emails</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setImportMethod('text')}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors font-medium ${
                        importMethod === 'text' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Text Input
                    </button>
                    <button
                      onClick={() => setImportMethod('file')}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors font-medium ${
                        importMethod === 'file' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      File Upload
                    </button>
                  </div>

                  {importMethod === 'text' ? (
                    <textarea
                      value={bulkEmailText}
                      onChange={(e) => setBulkEmailText(e.target.value)}
                      placeholder="Enter email addresses, one per line&#10;example@email.com&#10;another@email.com"
                      rows={8}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-4"
                    />
                  ) : (
                    <div className="mb-4">
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Upload a file containing email addresses
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          Supported formats: CSV, TXT, Excel (.xlsx, .xls)
                        </p>
                        <input
                          type="file"
                          accept=".csv,.txt,.xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          disabled={fileProcessing}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-hover transition-colors font-medium ${
                            fileProcessing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {fileProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Choose File
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    {importMethod === 'text' && (
                      <button
                        onClick={processBulkEmails}
                        disabled={!bulkEmailText.trim()}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Import Emails
                      </button>
                    )}
                    <button
                      onClick={closeBulkImport}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayedEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="Enter email address"
                    className={`flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      email && !validateEmail(email) 
                        ? 'border-red-300 focus:ring-red-300' 
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => removeEmailField(index)}
                    className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {emailList.length > 5 && (
              <button
                onClick={() => setShowAllEmails(!showAllEmails)}
                className="w-full mt-3 bg-gray-50 text-gray-700 py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                {showAllEmails ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Show Less ({emailList.length - 5} more hidden)
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show All ({emailList.length - 5} more emails)
                  </>
                )}
              </button>
            )}

            <button
              onClick={addEmailField}
              className="w-full mt-4 bg-gray-50 text-gray-700 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Email Address
            </button>

            {/* Email Configuration */}
            <div className="mt-6">
              <button
                onClick={() => setShowEmailConfig(!showEmailConfig)}
                className="w-full bg-gray-50 text-gray-700 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Mail className="h-4 w-4" />
                Email Configuration
              </button>

              {showEmailConfig && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={emailConfig.subject}
                      onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
                      placeholder="Enter email subject"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Greeting Template
                    </label>
                    <input
                      type="text"
                      value={emailConfig.greetingTemplate}
                      onChange={(e) => setEmailConfig({...emailConfig, greetingTemplate: e.target.value})}
                      placeholder="e.g., Dear Sir/Madam, Hello [Name], Hi there, etc."
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="mt-2 text-gray-500 text-xs">
                      This greeting will replace the opening line of your email
                    </div>
                    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-500 text-xs mb-1">Recipients will be addressed as:</div>
                      <div className="text-gray-900 text-sm font-medium">{emailConfig.greetingTemplate}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SMTP Configuration */}
            <div className="mt-6">
              <button
                onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                className="w-full bg-gray-50 text-gray-700 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Server className="h-4 w-4" />
                SMTP Server Settings
              </button>

              {showSmtpConfig && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Email Provider
                    </label>
                    <select
                      value={smtpConfig.provider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="gmail">Gmail</option>
                      <option value="outlook">Outlook/Hotmail</option>
                      <option value="yahoo">Yahoo Mail</option>
                      <option value="hostinger">Hostinger</option>
                      <option value="godaddy">GoDaddy</option>
                      <option value="custom">Custom SMTP</option>
                    </select>
                  </div>

                  {smtpConfig.useCustom && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Custom SMTP Host
                      </label>
                      <input
                        type="text"
                        value={smtpConfig.customProvider}
                        onChange={(e) => setSmtpConfig({...smtpConfig, customProvider: e.target.value})}
                        placeholder="smtp.example.com"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        value={smtpConfig.port}
                        onChange={(e) => setSmtpConfig({...smtpConfig, port: parseInt(e.target.value)})}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Security Method
                      </label>
                      <select
                        value={smtpConfig.method}
                        onChange={(e) => setSmtpConfig({...smtpConfig, method: e.target.value})}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="TLS">TLS (STARTTLS)</option>
                        <option value="SSL">SSL/TLS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={smtpConfig.fromEmail}
                      onChange={(e) => setSmtpConfig({...smtpConfig, fromEmail: e.target.value})}
                      placeholder="your.email@example.com"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      App Password / SMTP Password
                    </label>
                    <input
                      type="password"
                      value={smtpConfig.fromPassword}
                      onChange={(e) => setSmtpConfig({...smtpConfig, fromPassword: e.target.value})}
                      placeholder="Enter your app password"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="mt-2 text-gray-500 text-xs">
                      For Gmail: Use App Password. For custom SMTP: Use your email password or SMTP credentials.
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-gray-500 text-xs mb-2">Current SMTP Configuration:</div>
                    <div className="text-gray-700 text-sm space-y-1">
                      <div><span className="font-medium">Host:</span> {smtpConfig.useCustom ? smtpConfig.customProvider : smtpProviders[smtpConfig.provider].host}</div>
                      <div><span className="font-medium">Port:</span> {smtpConfig.port}</div>
                      <div><span className="font-medium">Security:</span> {smtpConfig.method}</div>
                      <div><span className="font-medium">Email:</span> {smtpConfig.fromEmail || 'Not configured'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              variant="outline"
              onClick={sendEmails}
              disabled={sending || validEmailCount === 0 || !smtpConfig.fromEmail || !smtpConfig.fromPassword}
              className="w-full mt-6 bg-[color:var(--background-secondary)] hover:bg-[color:var(--background-tertiary)] font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending to {validEmailCount} recipients...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send to {validEmailCount} recipients
                </>
              )}
            </button>

            {(!smtpConfig.fromEmail || !smtpConfig.fromPassword) && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Please configure your SMTP settings to send emails
                </div>
              </div>
            )}
          </div>

          {/* Email Preview & Results */}
          <div className="bg-[color:var(--primary-color)] rounded-2xl border border-gray-200 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              Email Preview & Results
            </h2>

            {/* Email Preview */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 font-medium">Subject:</div>
                <div className="text-gray-900 font-medium">{emailConfig.subject}</div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="text-gray-500 text-sm mb-2 font-medium">Email Body (with personalized greeting):</div>
                <div className="text-gray-700 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {getPersonalizedEmailBody() || 'No email content available. Please generate an email first.'}
                </div>
              </div>
            </div>

            {/* Send Results */}
            {sendResults.length > 0 && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="text-gray-900 font-semibold mb-4">Send Results:</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sendResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      {result.success ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div className="flex-1">
                        <div className="text-gray-900 text-sm font-medium">
                          {result.email || 'Unknown recipient'}
                        </div>
                        <div className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? 'Sent successfully' : result.error}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSender;