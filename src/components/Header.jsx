"use client"
import React, { useState } from 'react';
import { User, Building, LogOut, UserPlus, LogIn, Share2, DollarSign, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header = ({ user, onLogout, isLoadingUser }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  return (
    <div className="max-w-lg">
        {/* Company Logo - Left Side */}
        <div className="fixed top-6 left-6 xl:left-12 z-50">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                OpenPromote
              </h2>
              <p className="text-xs text-purple-200 -mt-1 hidden sm:block">Automate. Engage. Grow.</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation - Right Side */}
        <div className="fixed top-6 right-6 xl:right-12 z-50 hidden lg:flex items-center gap-3">
          {/* Pricing Button */}
          <button
            onClick={() => router.push('/pricing')}
            className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Pricing
          </button>

          {/* User Profile or Auth Buttons */}
          {!isLoadingUser && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 shadow-2xl">
                  <div className="text-white space-y-3">
                    <div className="border-b border-white/20 pb-3">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-purple-200">{user.email}</p>
                      {user.company && <p className="text-xs text-purple-300">{user.company}</p>}
                      {user.job_title && <p className="text-xs text-purple-300">{user.job_title}</p>}
                    </div>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Building className="h-4 w-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-red-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !isLoadingUser ? (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/login')}
                className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Register
              </button>
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Button - Right Side */}
        <div className="fixed top-6 right-6 xl:right-12 z-50 lg:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="fixed top-20 right-6 xl:right-12 z-40 lg:hidden w-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 shadow-2xl">
            <div className="text-white space-y-3">
              {/* Pricing */}
              <button
                onClick={() => {
                  router.push('/pricing');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Pricing
              </button>

              {!isLoadingUser && user ? (
                <>
                  <div className="border-t border-white/20 pt-3">
                    <p className="font-semibold px-3 mb-2">{user.name}</p>
                    <p className="text-sm text-purple-200 px-3 mb-2">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      router.push('/dashboard');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : !isLoadingUser ? (
                <>
                  <button
                    onClick={() => {
                      router.push('/login');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      router.push('/register');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
    </div> 
  );
};

export default Header;