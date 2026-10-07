import React, { useEffect, useState } from 'react';
import {
  FileText,
  ShoppingBag,
  Store,
  Instagram,
  Share2,
  MessageCircle,
  Boxes,
  ArrowRight,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';
import { Template } from '../types';
import { api } from '../services/api';

interface TemplatesViewProps {
  onSelectTemplate: (template: Template) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onSelectTemplate,
  onShowToast,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await api.getTemplates();
        setTemplates(res.templates);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const getTemplateIcon = (platform: string) => {
    switch (platform) {
      case 'shopify':
        return <Store className="w-6 h-6 text-emerald-500" />;
      case 'amazon':
        return <ShoppingBag className="w-6 h-6 text-amber-500" />;
      case 'etsy':
        return <Sparkles className="w-6 h-6 text-orange-500" />;
      case 'ebay':
        return <Boxes className="w-6 h-6 text-blue-500" />;
      case 'woocommerce':
        return <Store className="w-6 h-6 text-purple-500" />;
      case 'instagram':
        return <Instagram className="w-6 h-6 text-pink-500" />;
      case 'facebook':
        return <Share2 className="w-6 h-6 text-sky-500" />;
      case 'whatsapp':
        return <MessageCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Boxes className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>High-Conversion Presets</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            E-Commerce Listing Templates
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Choose a verified framework tailored to your marketplace or social storefront. Selecting a template pre-fills recommended tone, language, and structural specs.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/90 p-6 shadow-xs hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getTemplateIcon(tpl.platform)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    {tpl.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {tpl.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Platform: {tpl.platform}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Tone: {tpl.tone}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Lang: {tpl.language}
                  </span>
                </div>

                {/* Sample hint */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 mb-5">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Includes sample:
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {tpl.sampleProduct.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(tpl);
                  onShowToast(`Loaded "${tpl.title}" template into listing builder!`, 'success');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white transition flex items-center justify-center gap-1.5 group-hover:bg-indigo-600 group-hover:text-white shadow-xs"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
