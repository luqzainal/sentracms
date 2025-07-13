import React from 'react';
import logoImage from '../../assets/AiChatbot (13).png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'custom';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-32 h-24', // Adjusted for a wider logo
    xlarge: 'w-48 h-32', // Adjusted for a wider logo
    custom: '' // No predefined size for custom class
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