"use client"
import React, { useState, useEffect } from 'react';
import { User, Building, LogOut, UserPlus, LogIn, Mail, DollarSign, Menu, X, ChevronDown, Waypoints  } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from './button';
import LinkButton from './linkButton';

const Header = ({ user, onLogout, isLoadingUser }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfile && !event.target.closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  return (
    <>
      {/* Fixed Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b' 
            : 'bg-white border-b'
        }`}
        style={{
          borderColor: 'var(--header-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand - Left Side */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => router.push('/')}
            >
              {/* Logo Icon */}
              <div 
                className="rounded-lg p-2 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Waypoints  className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Brand Name */}
              <span 
                className="text-xl font-semibold tracking-tight"
                style={{ color: 'var(--header-text)' }}
              >
                Open Promote
              </span>
            </div>

            {/* Desktop Navigation - Right Side */}
            <nav className="hidden md:flex items-center gap-2">
              
              {/* Pricing Link */}
              <LinkButton
                href='/#pricing'
                variant="ghost"
                onClick={() => router.push('/pricing')}
                icon={<DollarSign className="h-4 w-4" />}
              >
                Pricing
              </LinkButton>

              {/* Divider */}
              <div 
                className="h-6 w-px mx-2"
                style={{ backgroundColor: 'var(--border-light)' }}
              />

              {/* User Authentication Section */}
              {!isLoadingUser && user ? (
                <div className="relative profile-dropdown">
                  <Button
                    variant="outline"
                    onClick={() => setShowProfile(!showProfile)}
                    icon={<User className="h-4 w-4" />}
                    className="gap-1"
                  >
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {/* Profile Dropdown */}
                  {showProfile && (
                    <div 
                      className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg border overflow-hidden"
                      style={{
                        backgroundColor: 'var(--dropdown-bg)',
                        borderColor: 'var(--dropdown-border)',
                        boxShadow: 'var(--dropdown-shadow)',
                      }}
                    >
                      {/* User Info */}
                      <div 
                        className="px-4 py-3 border-b"
                        style={{ borderColor: 'var(--border-light)' }}
                      >
                        <p 
                          className="font-semibold text-sm"
                          style={{ color: 'var(--header-text)' }}
                        >
                          {user.name}
                        </p>
                        <p 
                          className="text-sm mt-0.5"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {user.email}
                        </p>
                        {user.company && (
                          <p 
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {user.company}
                          </p>
                        )}
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push('/dashboard');
                            setShowProfile(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                          style={{ 
                            color: 'var(--header-text)',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dropdown-item-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Building className="h-4 w-4" />
                          Dashboard
                        </button>
                        
                        <button
                          onClick={() => {
                            onLogout();
                            setShowProfile(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                          style={{ 
                            color: 'var(--error)',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dropdown-item-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : !isLoadingUser ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/login')}
                    icon={<LogIn className="h-4 w-4" />}
                  >
                    Sign In
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={() => router.push('/register')}
                    icon={<UserPlus className="h-4 w-4" />}
                  >
                    Get Started
                  </Button>
                </div>
              ) : null}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                icon={showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                className="p-2"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div 
            className="md:hidden border-t"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <div className="px-4 py-3 space-y-2">
              
              {/* Pricing */}
              <LinkButton
              href='/#pricing'
                onClick={() => {
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                style={{ color: 'var(--header-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-ghost-hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <DollarSign className="h-4 w-4" />
                Pricing
              </LinkButton>

              {/* Divider */}
              <div 
                className="h-px my-2"
                style={{ backgroundColor: 'var(--border-light)' }}
              />

              {!isLoadingUser && user ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-2">
                    <p 
                      className="font-semibold text-sm"
                      style={{ color: 'var(--header-text)' }}
                    >
                      {user.name}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {user.email}
                    </p>
                  </div>
                  
                  {/* Dashboard */}
                  <button
                    onClick={() => {
                      router.push('/dashboard');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--header-text)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-ghost-hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Building className="h-4 w-4" />
                    Dashboard
                  </button>
                  
                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      onLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--error)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-ghost-hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : !isLoadingUser ? (
                <>
                  {/* Sign In */}
                  <button
                    onClick={() => {
                      router.push('/login');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--header-text)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-ghost-hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                  
                  {/* Get Started */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        router.push('/register');
                        setShowMobileMenu(false);
                      }}
                      icon={<UserPlus className="h-4 w-4" />}
                      className="w-full justify-center"
                    >
                      Get Started
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Header;