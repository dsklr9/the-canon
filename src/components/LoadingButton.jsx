import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingButton = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'default',
  className = '',
  icon = null,
  loadingText = null,
  ...props
}) => {
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-white/10 text-white',
    outline: 'border-2 border-purple-600 hover:bg-purple-600/20 text-purple-400'
  };

  const sizes = {
    small: 'px-3 py-1 text-sm',
    default: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        transition-all duration-200
        flex items-center justify-center gap-2
        font-medium
        relative
        overflow-hidden
      `}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className={`animate-spin ${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      )}
      
      {/* Icon */}
      {!loading && icon && (
        <span className="flex items-center">
          {icon}
        </span>
      )}
      
      {/* Button text */}
      <span className={loading && loadingText ? 'sr-only' : ''}>
        {children}
      </span>
      
      {/* Loading text (optional) */}
      {loading && loadingText && (
        <span>{loadingText}</span>
      )}
    </button>
  );
};

export default LoadingButton;