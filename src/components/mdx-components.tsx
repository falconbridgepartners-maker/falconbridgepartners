import Link from 'next/link';
import type { ComponentProps } from 'react';

export const mdxComponents = {
  a: ({ href = '', children, ...rest }: ComponentProps<'a'>) => {
    if (href.startsWith('/')) {
      return (
        <Link href={href} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
};
