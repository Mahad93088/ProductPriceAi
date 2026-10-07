import React from 'react';
import { Menu, Moon, Sun, Zap, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NavItemKey } from './Sidebar';

interface HeaderProps {
  currentTab: NavItemKey;
  onOpenMobileSidebar: () => void;
  onOpenUpgrade: () => void;
}

const TAB_TITLES: Record<NavItemKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Seller Dashboard', subtitle: 'Overview of your listings, credit usage, and quick actions.' },
  create: { title: 'AI Listing Generator', subtitle: 'Generate optimized e-commerce product titles, descriptions, and ads.' },
  history: { title: 'Listing History', subtitle: 'Access, search, filter, and edit previously generated listings.' },
  templates: { title: 'Listing Templates', subtitle: 'Pre-configured seller templates for Shopify, Amazon, Etsy, and social channels.' },
  usage: { title: 'Credit & Usage', subtitle: 'Track your monthly AI generation volume and remaining credits.' },
  billing: { title: 'Subscription & Billing', subtitle: 'Manage your plan tier, billing cycle, and credit limits.' },
  settings: { title: 'Account Settings', subtitle: 'Customize your default language, tone, platform, and preferences.' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenUpgrade,
}) => {
  const { user, profile, usage, subscription } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const tabInfo = TAB_TITLES[currentTab] || { title: 'Dashboard', subtitle: '' };
  const used = usage?.currentPeriodGenerations || 0;
  const limit = usage?.monthlyLimit || 5;
  const remaining = Math.max(0, limit - used);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tabInfo.title}
          </h1>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
            {tabInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Credits remaining pill */}
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition group shadow-sm"
        >
          {subscription?.plan === 'pro' || subscription?.plan === 'business' ? (
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-slate-700 dark:text-slate-300">
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{remaining}</span> credits left
          </span>
          <span className="hidden sm:inline text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-600 text-white shadow-xs">
            Upgrade
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Avatar */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {(profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
