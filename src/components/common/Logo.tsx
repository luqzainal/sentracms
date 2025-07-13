import React from 'react';
import logoImage from '../../assets/AiChatbot (15).png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <img 
      src={logoImage} 
      alt="Sentra CMS Logo"
      className={`${sizeClasses[size]} object-contain ${className || ''}`}
    />
  );
};

export default Logo; 