import React from 'react';
import {
  Sparkles,
  PlusCircle,
  Zap,
  Crown,
  History,
  FileText,
  ArrowRight,
  Copy,
  ExternalLink,
  ShoppingBag,
  Store,
  Instagram,
  Share2,
  MessageCircle,
  Boxes,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FullListing } from '../types';

interface DashboardViewProps {
  listings: FullListing[];
  onNavigateToCreate: (templateData?: any) => void;
  onNavigateToHistory: () => void;
  onNavigateToTemplates: () => void;
  onOpenUpgrade: () => void;
  onViewListing: (listing: FullListing) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  listings,
  onNavigateToCreate,
  onNavigateToHistory,
  onNavigateToTemplates,
  onOpenUpgrade,
  onViewListing,
  onShowToast,
}) => {
  const { profile, usage, subscription } = useAuth();

  const used = usage?.currentPeriodGenerations || 0;
  const limit = usage?.monthlyLimit || 5;
  const remaining = Math.max(0, limit - used);
  const totalGenerations = listings.length;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  const recentListings = listings.slice(0, 5);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'shopify': return <Store className="w-4 h-4 text-emerald-500" />;
      case 'amazon': return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'etsy': return <Sparkles className="w-4 h-4 text-orange-500" />;
      case 'ebay': return <Boxes className="w-4 h-4 text-blue-500" />;
      case 'woocommerce': return <Store className="w-4 h-4 text-purple-500" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'facebook': return <Share2 className="w-4 h-4 text-sky-500" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-500" />;
      default: return <Boxes className="w-4 h-4 text-purple-500" />;
    }
  };

  const handleCopyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      onShowToast('Product title copied to clipboard!', 'success');
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white overflow-hidden shadow-xl border border-indigo-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 backdrop-blur-xs mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome, {profile?.name || 'Seller'}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Ready to generate high-converting listings?
          </h2>
          <p className="text-xs md:text-sm text-indigo-200 mt-2 leading-relaxed">
            Create optimized titles, descriptions, feature bullet points, and social copy in seconds for Shopify, Amazon, Etsy, and global marketplaces.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToCreate()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition shadow-lg flex items-center gap-2 group"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600 group-hover:rotate-90 transition-transform" />
              <span>Create New Listing</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToTemplates}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Browse Seller Templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Generations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Generated</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalGenerations}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">All-time listings kit</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
        </div>

        {/* Generations Remaining */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Generations Remaining</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {remaining}
            </h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
              out of {limit} monthly limit
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Current Plan */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Plan</p>
            <div className="flex items-center gap-1.5 mt-1">
              <h3 className="text-2xl font-black capitalize text-slate-900 dark:text-white">
                {subscription?.plan || 'Free'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                Active
              </span>
            </div>
            <button
              onClick={onOpenUpgrade}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
            >
              Change tier &rarr;
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
        </div>

        {/* Usage Progress Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Usage</p>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden my-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pct >= 90 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {used} used &bull; resets next billing cycle
          </p>
        </div>
      </div>

      {/* Recent Listings Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Listings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your latest generated product kits and descriptions
            </p>
          </div>

          <button
            onClick={onNavigateToHistory}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            <span>View All ({listings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentListings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No product listings yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Enter your first product details to generate titles, descriptions, and SEO keywords.
            </p>
            <button
              type="button"
              onClick={() => onNavigateToCreate()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Generate First Listing
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentListings.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getPlatformIcon(item.platform)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.platform}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {item.language}
                      </span>
                      {item.price && (
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {item.price}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.results?.productTitle || item.productName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.results?.shortDescription || item.features}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleCopyTitle(item.results?.productTitle || item.productName)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Copy Title"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewListing(item)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1.5"
                  >
                    <span>Open Kit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
