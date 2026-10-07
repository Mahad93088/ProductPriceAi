import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  Crown,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavItemKey =
  | 'dashboard'
  | 'create'
  | 'history'
  | 'templates'
  | 'usage'
  | 'billing'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenUpgrade: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenUpgrade,
}) => {
  const { user, profile, subscription, usage, logout } = useAuth();

  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'create' as NavItemKey, label: 'Create Listing', icon: PlusCircle, badge: 'New' },
    { key: 'history' as NavItemKey, label: 'History', icon: History },
    { key: 'templates' as NavItemKey, label: 'Templates', icon: FileText },
    { key: 'usage' as NavItemKey, label: 'Usage', icon: BarChart3 },
    { key: 'billing' as NavItemKey, label: 'Billing', icon: CreditCard },
    { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings },
  ];

  const used = usage?.currentPeriodGenerations || 0;
  const limit = usage?.monthlyLimit || 5;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                ProductPilot <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                E-Commerce Copy Engine
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Usage & Plan Widget */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {subscription?.plan === 'pro' || subscription?.plan === 'business' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                )}
                <span className="capitalize">{subscription?.plan || 'Free'} Plan</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {used} / {limit}
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-2.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <button
              type="button"
              onClick={onOpenUpgrade}
              className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center justify-center gap-1 border border-indigo-200/50 dark:border-indigo-800/50"
            >
              <span>{subscription?.plan === 'business' ? 'Manage Quota' : 'Upgrade Plan'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-sm">
                {(profile?.name || user?.email || 'S')[0]}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.name || 'Seller'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
