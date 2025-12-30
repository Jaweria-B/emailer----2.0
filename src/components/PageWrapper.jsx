"use client"
import Header from './Header';
import Footer from './Footer';
import { useAuthContext } from '@/providers/AuthProvider';

const PageWrapper = ({ children, showFooter = true, className = "container mx-auto px-4 py-8" }) => {
  const { user, isLoadingUser, handleLogout } = useAuthContext();

  return (
    <>
      <div className={className}>
        <Header user={user} isLoadingUser={isLoadingUser} onLogout={handleLogout} />
        {children}
      </div>
      {showFooter && <Footer />}
    </>
  );
};

export default PageWrapper;