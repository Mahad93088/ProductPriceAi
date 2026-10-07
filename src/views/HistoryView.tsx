import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShoppingBag,
  Store,
  Instagram,
  Share2,
  MessageCircle,
  Boxes,
  Copy,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Download,
  Check,
  Languages,
} from 'lucide-react';
import { FullListing } from '../types';
import { api } from '../services/api';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface HistoryViewProps {
  listings: FullListing[];
  onOpenListing: (listing: FullListing) => void;
  onListingDeleted: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  listings,
  onOpenListing,
  onListingDeleted,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.productName.toLowerCase().includes(q) ||
        item.results?.productTitle?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);

      const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
      const matchesLanguage = languageFilter === 'all' || item.language === languageFilter;

      return matchesSearch && matchesPlatform && matchesLanguage;
    });
  }, [listings, search, platformFilter, languageFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.deleteListing(deleteId);
      onListingDeleted(deleteId);
      onShowToast('Listing deleted from history.', 'info');
      setDeleteId(null);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete listing.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyListing = async (item: FullListing) => {
    const text = `Title: ${item.results?.productTitle || item.productName}\n\nDescription: ${item.results?.fullDescription || ''}\n\nKeywords: ${item.results?.seoKeywords?.join(', ') || ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      onShowToast('Listing summary copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleExportAll = () => {
    if (filteredListings.length === 0) return;
    const jsonStr = JSON.stringify(filteredListings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productpilot-listings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported listings as JSON.', 'success');
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Listing History ({filteredListings.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access and manage all previously generated product kits
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportAll}
            disabled={filteredListings.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered ({filteredListings.length})</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search Input (6 cols) */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, title, brand or category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Platform Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Platforms</option>
              <option value="shopify">Shopify</option>
              <option value="amazon">Amazon</option>
              <option value="etsy">Etsy</option>
              <option value="ebay">eBay</option>
              <option value="woocommerce">WooCommerce</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Language Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Languages</option>
              <option value="english">English (Global)</option>
              <option value="english_us">English (US)</option>
              <option value="english_uk">English (UK / EU)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings List */}
      {filteredListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Boxes className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            No listings found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {search || platformFilter !== 'all' || languageFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'You have not created any listings yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredListings.map((item) => {
            const isCopied = copiedId === item.id;
            const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Item Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getPlatformIcon(item.platform)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.platform}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {item.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-1.5">
                    {item.results?.productTitle || item.productName}
                  </h3>

                  {/* Preview summary */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {item.results?.shortDescription || item.results?.fullDescription || item.features}
                  </p>
                </div>

                {/* Footer Actions: Open, Copy, Delete */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {item.price ? item.price : item.brand || 'No price set'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyListing(item)}
                      title="Copy Summary"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      title="Delete Listing"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenListing(item)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1 ml-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Kit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteId !== null}
        title="Delete Listing"
        message="Are you sure you want to permanently delete this generated listing? This action cannot be undone."
        confirmLabel="Delete Listing"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
