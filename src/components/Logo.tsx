import React from 'react';
import { PawPrint as Paw } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'text';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'full' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className="flex items-center gap-2">
      {(variant === 'full' || variant === 'icon') && <Paw 
        size={iconSizes[size]} 
        className="text-primary-500" 
        fill="currentColor" 
        strokeWidth={1.5} 
      />}
      {(variant === 'full' || variant === 'text') && (
        <span className={`font-display font-bold ${sizeClasses[size]}`}>
          <span className="text-primary-500">RRSA</span>
          <span className="text-gray-800">INDIA</span>
        </span>
      )}
    </div>
  );
};

export default Logo;