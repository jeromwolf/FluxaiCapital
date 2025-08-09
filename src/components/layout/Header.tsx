'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, TrendingUp, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useTranslations } from 'next-intl';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations();

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard' },
    { name: t('nav.portfolio'), href: '/portfolio' },
    { name: t('nav.backtest'), href: '/backtest' },
    { name: t('nav.reports'), href: '/reports' },
    { name: t('nav.stocks'), href: '/stocks' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">FLUX AI Capital</span>
            <span className="sm:hidden">FLUX</span>
          </Link>

          <div className="hidden md:flex md:gap-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar className="hidden md:block w-64" />
          <LanguageToggle />
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || t('common.user')}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    {t('settings.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">{t('nav.settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-3 py-2 text-base font-medium',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t px-3 pt-4">
              {session ? (
                <div className="space-y-2">
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium">{session.user.name || t('common.user')}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/settings">
                      <User className="mr-2 h-4 w-4" />
                      {t('settings.profile')}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">
                    <User className="mr-2 h-4 w-4" />
                    {t('auth.login')}
                  </Link>
                </Button>
              )}
            </div>
            <div className="border-t px-3 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('settings.theme')}</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
