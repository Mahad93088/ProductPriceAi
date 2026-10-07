import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Copy,
  ChevronDown,
  ShoppingBag,
  Store,
  Instagram,
  Share2,
  MessageCircle,
  Boxes,
  Languages,
  Eye,
  Layers,
  Crown,
  Shield,
  HelpCircle,
  FileCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import { PlanType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenDemo: () => void;
  onNavigateToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenDemo,
  onNavigateToDashboard,
}) => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const features = [
    {
      title: 'AI Product Titles',
      description: 'Search-optimized titles stuffed with high-ranking keywords tailored for Amazon A9 algorithms, Etsy tags, and Shopify Google feeds.',
      icon: Sparkles,
      color: 'from-amber-500/20 to-orange-500/20 text-orange-500',
    },
    {
      title: 'Product Descriptions',
      description: 'Compelling long-form storytelling and short punchy summaries that explain benefits clearly and eliminate shopper doubt.',
      icon: FileCheck,
      color: 'from-blue-500/20 to-indigo-500/20 text-indigo-500',
    },
    {
      title: 'SEO Keywords',
      description: 'High-intent buyer search tags, competitor terms, and long-tail query sets ready to paste directly into your seller center.',
      icon: Boxes,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-500',
    },
    {
      title: 'Social Media Captions',
      description: 'Engaging Instagram, Facebook, and TikTok hooks with aesthetic spacing, emojis, and hashtags that drive clicks.',
      icon: Instagram,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-500',
    },
    {
      title: 'High-Converting Ad Copy',
      description: 'Direct-response advertising scripts engineered to lower CPA and drive conversions on Facebook Marketplace and Meta Ads.',
      icon: Share2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500',
    },
    {
      title: 'Global Multi-Market Copy',
      description: 'Flawless international English copywriting tailored for US, UK, European, and worldwide online retail marketplaces.',
      icon: Languages,
      color: 'from-green-500/20 to-emerald-500/20 text-green-500',
    },
    {
      title: 'Product Image Analysis',
      description: 'Upload a product photo and our multimodal Gemini AI identifies colors, textures, finishes, and design details automatically.',
      icon: Eye,
      color: 'from-sky-500/20 to-blue-500/20 text-sky-500',
    },
    {
      title: 'Bulk & Pre-Made Templates',
      description: 'Reusable listing presets for Shopify, Amazon, Etsy, eBay, and social commerce to launch faster.',
      icon: Layers,
      color: 'from-violet-500/20 to-indigo-500/20 text-violet-500',
    },
  ];

  const pricingPlans = [
    {
      id: 'free' as PlanType,
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      limit: 5,
      description: 'Try the AI generator on your next listings.',
      features: ['5 AI generations / month', 'Shopify & Amazon format', 'Standard speed', 'Copy to clipboard'],
      popular: false,
    },
    {
      id: 'starter' as PlanType,
      name: 'Starter',
      priceMonthly: 9,
      priceYearly: 7,
      limit: 100,
      description: 'For active marketplace sellers launching products weekly.',
      features: ['100 AI generations / month', 'Vision image analysis', 'Amazon SEO keywords', 'Multi-platform templates', 'Saved history & exports'],
      popular: false,
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro',
      priceMonthly: 19,
      priceYearly: 15,
      limit: 500,
      description: 'Our most popular plan for fast-growing brands & agencies.',
      features: [
        '500 AI generations / month',
        'Gemini 3.8 Flash high-speed AI',
        'Single-card instant regeneration',
        'Full platform templates',
        'Ad copy & social captions',
        'Priority queue processing',
      ],
      popular: true,
    },
    {
      id: 'business' as PlanType,
      name: 'Business',
      priceMonthly: 49,
      priceYearly: 39,
      limit: 2000,
      description: 'For wholesale catalogs and high-volume e-commerce brands.',
      features: [
        '2,000 AI generations / month',
        'Bulk generation speed boost',
        'Dedicated server queue',
        'Unlimited listing history',
        'Custom brand tone presets',
        '24/7 Priority seller support',
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'How does ProductPilot AI optimize listings for Amazon and Shopify?',
      a: 'ProductPilot AI analyzes Amazon A9 ranking factors—including keyword placement in titles, high-converting 5-bullet specifications, and customer problem-solving hooks. For Shopify, it crafts brand storytelling and SEO meta tags to maximize Google Organic search and paid advertising CTR.',
    },
    {
      q: 'Can I generate listings for European and international markets?',
      a: 'Yes! You can tailor your content in International English, UK/European English, or US English, ensuring appropriate vocabulary, spelling, and cultural tone for shoppers across the UK, Europe, North America, and global hubs.',
    },
    {
      q: 'How does the product image analysis feature work?',
      a: 'You can upload an image of your product alongside your basic details. Our multimodal vision AI analyzes the visible color, texture, shape, packaging, and build quality, incorporating these real visual observations into the listing copy without hallucinating unobserved internal specs.',
    },
    {
      q: 'Can I edit the generated listings before copying them?',
      a: 'Absolutely. Every output card (Title, Short Description, Full Description, Key Features, SEO Keywords, Meta Description, Social Caption, Ad Copy) has an instant Edit button. You can also regenerate any single card individually if you want a fresh angle.',
    },
    {
      q: 'Can I cancel or upgrade my subscription at any time?',
      a: 'Yes, you can upgrade, downgrade, or cancel anytime from the Billing dashboard. When you upgrade, your new generation limit is credited immediately.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                ProductPilot <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">How It Works</a>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Features</a>
            <a href="#platforms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Platforms</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onNavigateToDashboard}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Create Better Product Listings <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">With AI</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Generate product titles, descriptions, SEO keywords, social captions, and ad copy in seconds. Turn products into powerful listings with AI.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2 group"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition text-center"
            >
              See How It Works
            </a>
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Instant Demo Mode</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>5 Free Generations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Shopify & Amazon Optimized</span>
            </div>
          </div>

          {/* Interactive Preview Mockup Card */}
          <div className="mt-14 relative max-w-4xl mx-auto rounded-3xl p-3 md:p-4 bg-slate-900/5 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden text-left shadow-lg">
              {/* Fake browser bar */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">productpilot.ai/live-demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    AI Ready (Shopify & Amazon Optimized)
                  </span>
                </div>
              </div>

              {/* Sample output mockup */}
              <div className="p-6 md:p-8 space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Product Title
                  </span>
                  <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    VoltAudio TWS Gaming Earbuds Pro (60ms Ultra-Low Latency) | ENC Quad-Mic, RGB Case & 35H Battery - Wireless Earphones with 2-Year Global Warranty
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Product Description & Highlights
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      Experience tournament-grade audio immersion with dedicated 60ms low latency synchronization, punchy titanium dynamic bass, and quad-mic environmental noise cancellation.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      ⚡ 60ms Ultra-low latency &bull; 🎙️ Quad-mic ENC &bull; 📦 Free tracked worldwide shipping
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      SEO Keywords & Social Caption
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">#gamingearbuds</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">#amazonfinds</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">#techgadgets</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">#bluetooth54</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      🔥 Ready-to-post Instagram and TikTok caption with emojis and CTA included.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              How ProductPilot AI Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              Go from a rough product idea to an omnichannel marketing kit in less than 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mb-5 shadow-lg shadow-indigo-600/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Enter Product Information
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Provide your product name, category, price, and basic features. Optionally upload a product photo so our multimodal AI can analyze real visual details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-extrabold text-lg flex items-center justify-center mb-5 shadow-lg shadow-purple-600/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Let AI Generate The Content
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Gemini 3.8 Flash crafts high-converting titles, descriptions, keyword arrays, social posts, and ad copies tuned specifically to your chosen platform and tone.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white font-extrabold text-lg flex items-center justify-center mb-5 shadow-lg shadow-pink-600/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Copy, Edit, and Publish
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review generated cards, make quick inline edits, regenerate individual sections on the fly, or 1-click copy directly into your store or seller center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Engineered For Conversions
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              Everything An E-Commerce Seller Needs
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              Generate every marketing asset required to list, rank, and sell products online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Platforms Showcase */}
      <section id="platforms" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            Supported Selling Channels & International Marketplaces
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: 'Shopify', desc: 'DTC Brand Stores', icon: Store, color: 'text-emerald-500' },
              { name: 'Amazon', desc: 'A9 Search & Buy Box', icon: ShoppingBag, color: 'text-amber-500' },
              { name: 'Etsy', desc: 'Handmade & Crafts', icon: Sparkles, color: 'text-orange-500' },
              { name: 'eBay', desc: 'Global Marketplace', icon: Boxes, color: 'text-blue-500' },
              { name: 'WooCommerce', desc: 'WordPress Stores', icon: Store, color: 'text-purple-500' },
              { name: 'Instagram', desc: 'Reels & Commerce', icon: Instagram, color: 'text-pink-500' },
              { name: 'Facebook', desc: 'Meta Ads & Posts', icon: Share2, color: 'text-sky-500' },
              { name: 'WhatsApp', desc: 'Catalog & Messaging', icon: MessageCircle, color: 'text-green-500' },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                  <Icon className={`w-5 h-5 mx-auto mb-1.5 ${p.color}`} />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Transparent Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              Choose The Plan That Fits Your Store
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              Start with 5 free generations, upgrade whenever your inventory scales.
            </p>

            {/* Monthly / Yearly Switcher */}
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mt-6 border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Yearly
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => {
              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                    plan.popular
                      ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-md">
                      Recommended
                    </span>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>

                    <div className="mt-4 mb-5">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        / month
                      </span>
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {plan.limit.toLocaleString()} generations/month
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 mb-6">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                        : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                    }`}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Questions & Answers
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-900/60"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  ProductPilot AI
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                Turn products into powerful listings with AI. Automated e-commerce copywriting for Shopify, Amazon, Etsy, eBay, and social commerce.
              </p>
              <div className="text-[11px] text-slate-400">
                &copy; {new Date().getFullYear()} ProductPilot AI. All rights reserved.
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-3">Product</p>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-indigo-600 transition">AI Title Generator</a></li>
                <li><a href="#features" className="hover:text-indigo-600 transition">Amazon SEO Engine</a></li>
                <li><a href="#features" className="hover:text-indigo-600 transition">Etsy Tag Optimizer</a></li>
                <li><a href="#features" className="hover:text-indigo-600 transition">Image Vision Analysis</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-3">Platforms</p>
              <ul className="space-y-2">
                <li><a href="#platforms" className="hover:text-indigo-600 transition">Shopify DTC</a></li>
                <li><a href="#platforms" className="hover:text-indigo-600 transition">Amazon Marketplace</a></li>
                <li><a href="#platforms" className="hover:text-indigo-600 transition">Etsy Handmade</a></li>
                <li><a href="#platforms" className="hover:text-indigo-600 transition">WooCommerce Stores</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-3">Legal & Support</p>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setLegalModal('privacy')} className="hover:text-indigo-600 transition text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setLegalModal('terms')} className="hover:text-indigo-600 transition text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <a href="#faq" className="hover:text-indigo-600 transition">
                    Help & FAQ
                  </a>
                </li>
                <li>
                  <a href="mailto:support@productpilot.ai" className="hover:text-indigo-600 transition">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setLegalModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
              <p>
                Welcome to ProductPilot AI. Your privacy and trust are paramount. We process product descriptions, images, and marketing content solely to generate high-converting e-commerce listings for your store.
              </p>
              <p>
                <strong>Data Protection:</strong> Product information and uploaded photos are processed securely through Google Gemini server APIs without being shared with unauthorized third parties.
              </p>
              <p>
                <strong>Usage Rights:</strong> You own all commercial rights to the marketing copy and listings generated through your account on Shopify, Amazon, Etsy, Meta, or any third-party platform.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
