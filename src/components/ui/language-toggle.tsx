'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from 'next-intl';

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname
    const segments = pathname.split('/');
    const currentLocaleIndex = segments.findIndex(segment => segment === locale);
    
    if (currentLocaleIndex !== -1) {
      segments[currentLocaleIndex] = newLocale;
    } else {
      // If locale is not in the path, prepend it
      segments.unshift(newLocale);
    }
    
    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale('ko')}>
          <span className={locale === 'ko' ? 'font-semibold' : ''}>한국어</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('en')}>
          <span className={locale === 'en' ? 'font-semibold' : ''}>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}