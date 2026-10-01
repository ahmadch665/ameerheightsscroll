import React from 'react';

type BrandLogoProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', ...props }) => (
  <img
    src="/assets/ameer-heights-logo.png"
    alt="Ameer Heights Tower 10"
    className={`object-contain ${className}`}
    {...props}
  />
);