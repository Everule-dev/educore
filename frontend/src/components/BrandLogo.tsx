import React, { useState, useEffect } from 'react';

interface BrandLogoProps {
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  isParchment?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * Theme-aware BrandLogo Component
 * - Light theme: Uses original /educore-logo.png untouched (green & dark navy blue/black).
 * - Dark theme: Dynamically renders /educore-logo-dark.png (blue & black colors converted to crisp white).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  alt = 'EDUCORE - Verify · Trust · Empower',
  style,
  className = '',
  isParchment = false,
  theme,
}) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (theme) return theme;
    if (typeof document !== 'undefined') {
      const docTheme = document.documentElement.getAttribute('data-theme');
      if (docTheme === 'light' || docTheme === 'dark') return docTheme;
      const saved = localStorage.getItem('educore_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
      return;
    }

    if (typeof document === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          setCurrentTheme(newTheme === 'light' ? 'light' : 'dark');
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, [theme]);

  const logoSrc = !isParchment && currentTheme === 'dark' ? '/educore-logo-dark.png' : '/educore-logo.png';

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`educore-brand-logo ${isParchment ? 'certificate-parchment-logo' : ''} ${className}`}
      style={style}
    />
  );
};

export default BrandLogo;
