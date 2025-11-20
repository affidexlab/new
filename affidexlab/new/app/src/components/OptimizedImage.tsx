import { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  lazy?: boolean;
}

export function OptimizedImage({ src, alt, lazy = true, className, ...props }: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      className={className}
      {...props}
    />
  );
}
