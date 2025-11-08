import React from 'react';

/**
 * Reusable Button Component
 * 
 * @param {Object} props
 * @param {'ghost' | 'primary' | 'outline'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disabled state
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 */
const Button = ({ 
  variant = 'ghost', 
  size = 'md', 
  children, 
  icon, 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const variantClasses = {
    ghost: 'btn-ghost',
    primary: 'btn-primary',
    outline: 'btn-outline',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      type={type}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;