import React from 'react';
import Link from 'next/link';

/**
 * Reusable Link Component
 * Handles both internal Next.js navigation and external links
 * 
 * @param {Object} props
 * @param {string} props.href - Link destination
 * @param {React.ReactNode} props.children - Link content
 * @param {'ghost' | 'primary' | 'outline' | 'text'} props.variant - Link style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Link size
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {React.ReactNode} props.iconRight - Optional icon element on right
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.external - Whether link is external (opens in new tab)
 * @param {boolean} props.disabled - Disabled state
 * @param {Function} props.onClick - Click handler
 */
const LinkButton = ({ 
  href = '#',
  children, 
  variant = 'text', 
  size = 'md', 
  icon, 
  iconRight,
  className = '', 
  external = false,
  disabled = false,
  onClick,
  ...props 
}) => {
  // Check if link is external
  const isExternal = external || href.startsWith('http') || href.startsWith('//');
  
  const variantClasses = {
    ghost: 'btn-ghost',
    primary: 'btn-primary',
    outline: 'btn-outline',
    text: 'link-text',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  // Base classes - use btn class for button-like links, otherwise just inline-flex
  const baseClasses = variant === 'text' 
    ? `inline-flex items-center gap-2 transition-colors duration-200 ${className}`
    : `btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const finalClassName = disabled ? `${baseClasses} opacity-50 cursor-not-allowed pointer-events-none` : baseClasses;

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </>
  );

  // Handle click
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  // External link
  if (isExternal) {
    return (
      <a
        href={href}
        className={finalClassName}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  // Internal Next.js link
  return (
    <Link
      href={href}
      className={finalClassName}
      onClick={handleClick}
      {...props}
    >
      {content}
    </Link>
  );
};

export default LinkButton;