import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  X,
  RotateCw,
  Copy,
  Check,
  Save,
  ShoppingBag,
  Store,
  Instagram,
  Share2,
  MessageCircle,
  Boxes,
  Languages,
  Eye,
  Sliders,
  AlertCircle,
  Zap,
  ArrowRight,
  FileCheck,
  FileText,
  Bookmark,
  Share,
} from 'lucide-react';
import { CardOutput } from '../components/CardOutput';
import { FullListing, GenerationResults, LanguageType, PlatformType, ToneType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CreateListingViewProps {
  initialListing?: FullListing | null;
  onListingSaved: (listing: FullListing) => void;
  onOpenUpgrade: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreateListingView: React.FC<CreateListingViewProps> = ({
  initialListing,
  onListingSaved,
  onOpenUpgrade,
  onShowToast,
}) => {
  const { profile, usage, updateUsageState } = useAuth();

  // Form states
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [language, setLanguage] = useState<LanguageType>('english');
  const [platform, setPlatform] = useState<PlatformType>('shopify');

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generation & Results states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRegeneratingKey, setActiveRegeneratingKey] = useState<string | null>(null);
  const [currentListing, setCurrentListing] = useState<FullListing | null>(null);
  const [results, setResults] = useState<GenerationResults | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Initialize from props or default profile settings
  useEffect(() => {
    if (initialListing) {
      setProductName(initialListing.productName || '');
      setCategory(initialListing.category || '');
      setBrand(initialListing.brand || '');
      setPrice(initialListing.price || '');
      setFeatures(initialListing.features || '');
      setTargetAudience(initialListing.targetAudience || '');
      setTone(initialListing.tone || 'professional');
      setLanguage(initialListing.language || 'english');
      setPlatform(initialListing.platform || 'shopify');
      setCurrentListing(initialListing);
      setResults(initialListing.results);
    } else if (profile) {
      if (profile.defaultLanguage) setLanguage(profile.defaultLanguage);
      if (profile.defaultTone) setTone(profile.defaultTone);
      if (profile.defaultPlatform) setPlatform(profile.defaultPlatform);
    }
  }, [initialListing, profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        onShowToast('Image file too large (max 15MB)', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async (isRegenerateAll = false) => {
    if (!productName.trim()) {
      onShowToast('Please enter a product name.', 'error');
      return;
    }

    const canGenerate = (usage?.currentPeriodGenerations || 0) < (usage?.monthlyLimit || 5);
    if (!canGenerate) {
      onShowToast('Generation limit reached for this month. Upgrade to continue.', 'error');
      onOpenUpgrade();
      return;
    }

    setIsGenerating(true);

    try {
      let imageDataPayload: { mimeType: string; base64: string } | undefined;
      if (imagePreview) {
        const mimeMatch = imagePreview.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        imageDataPayload = {
          mimeType,
          base64: imagePreview,
        };
      }

      const res = await api.generateListing({
        productName: productName.trim(),
        category,
        brand,
        price,
        features,
        targetAudience,
        tone,
        language,
        platform,
        imageData: imageDataPayload,
      });

      setCurrentListing(res.listing);
      setResults(res.listing.results);
      updateUsageState(res.usage);
      onListingSaved(res.listing);
      onShowToast(
        isRegenerateAll
          ? 'Generated fresh listing kit!'
          : 'AI listing kit generated and saved to history!',
        'success'
      );
    } catch (err: any) {
      if (err.limitReached) {
        onShowToast('Monthly generation limit reached. Please upgrade your plan.', 'error');
        onOpenUpgrade();
      } else {
        onShowToast(err.message || 'Failed to generate listing. Please try again.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardSave = async (fieldKey: string, newValue: string | string[]) => {
    if (!results) return;

    const updatedResults = {
      ...results,
      [fieldKey]: newValue,
    };
    setResults(updatedResults);

    if (currentListing?.id) {
      try {
        const updated = await api.updateListing(currentListing.id, updatedResults);
        setCurrentListing(updated.listing);
        onListingSaved(updated.listing);
        onShowToast('Changes saved to listing.', 'success');
      } catch (err) {
        console.error('Failed to sync edit:', err);
      }
    }
  };

  const handleCardRegenerate = async (fieldKey: string) => {
    if (!results) return;
    setActiveRegeneratingKey(fieldKey);

    try {
      const res = await api.regenerateSection({
        sectionKey: fieldKey as keyof GenerationResults,
        listingId: currentListing?.id,
        productContext: {
          productName,
          category,
          brand,
          price,
          features,
          targetAudience,
          tone,
          language,
          platform,
        },
        currentResults: results,
      });

      const updatedResults = {
        ...results,
        [fieldKey]: res.newValue,
      };
      setResults(updatedResults);
      if (currentListing) {
        onListingSaved({ ...currentListing, results: updatedResults });
      }
      onShowToast(`Regenerated ${fieldKey} successfully!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to regenerate section.', 'error');
    } finally {
      setActiveRegeneratingKey(null);
    }
  };

  const handleCopyAll = async () => {
    if (!results) return;

    const fullContent = `
=== PRODUCT TITLE ===
${results.productTitle}

=== SHORT DESCRIPTION ===
${results.shortDescription}

=== FULL DESCRIPTION ===
${results.fullDescription}

=== KEY FEATURES ===
${results.keyFeatures.map((f) => `• ${f}`).join('\n')}

=== SEO KEYWORDS ===
${results.seoKeywords.join(', ')}

=== META DESCRIPTION ===
${results.metaDescription}

=== SOCIAL MEDIA CAPTION ===
${results.socialMediaCaption}

=== ADVERTISEMENT COPY ===
${results.advertisementCopy}
`.trim();

    try {
      await navigator.clipboard.writeText(fullContent);
      setCopiedAll(true);
      onShowToast('Copied complete listing kit to clipboard!', 'success');
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      // fallback
    }
  };

  const platforms: { id: PlatformType; name: string; icon: any; color: string }[] = [
    { id: 'shopify', name: 'Shopify', icon: Store, color: 'text-emerald-500' },
    { id: 'amazon', name: 'Amazon', icon: ShoppingBag, color: 'text-amber-500' },
    { id: 'etsy', name: 'Etsy', icon: Sparkles, color: 'text-orange-500' },
    { id: 'ebay', name: 'eBay', icon: Boxes, color: 'text-blue-500' },
    { id: 'woocommerce', name: 'WooCommerce', icon: Store, color: 'text-purple-500' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: Share2, color: 'text-sky-500' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
    { id: 'general', name: 'General', icon: Boxes, color: 'text-indigo-500' },
  ];

  const tones: { id: ToneType; name: string; desc: string }[] = [
    { id: 'professional', name: 'Professional', desc: 'Trustworthy & authoritative' },
    { id: 'persuasive', name: 'Persuasive', desc: 'High urgency direct-response' },
    { id: 'friendly', name: 'Friendly', desc: 'Warm & relatable conversational' },
    { id: 'luxury', name: 'Luxury', desc: 'Sophisticated & premium appeal' },
    { id: 'simple', name: 'Simple', desc: 'Clear, plain and concise' },
  ];

  return (
    <div className="animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Product Details
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your product information and preferences
              </p>
            </div>

            {/* Platform selector mini pill */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {platform}
            </span>
          </div>

          {/* Platform Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Target Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {platforms.map((p) => {
                const Icon = p.icon;
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${p.color}`} />
                    <span className="text-xs truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setProductName('Wireless Bluetooth 5.4 Earbuds with LED Display');
                  setCategory('Electronics & Audio');
                  setBrand('AuraSound');
                  setPrice('$49.99');
                  setFeatures('35h battery life, touch controls, IPX5 waterproof, deep dynamic bass, Type-C quick charging, low latency gaming mode');
                  setTargetAudience('Mobile gamers, commuters, and daily audio listeners in Europe & US');
                }}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Insert Sample
              </button>
            </div>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Wireless Bluetooth 5.4 Earbuds"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Audio, Fashion"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. AuraSound"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Price & Target Audience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Price / Offer
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. $49.99 or €39.00"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Students, Gamers"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Product Features */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Key Product Features / Specs
            </label>
            <textarea
              rows={3}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g. 35h battery life, IPX5 waterproof, deep bass, noise cancellation, type-C charging..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Language Output
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'english' as LanguageType, label: 'English (Global)', desc: 'Standard Neutral' },
                { id: 'english_us' as LanguageType, label: 'English (US)', desc: 'American Idioms' },
                { id: 'english_uk' as LanguageType, label: 'English (UK / EU)', desc: 'British & European' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    language === lang.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{lang.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{lang.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Brand Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`p-2 rounded-xl border text-left transition ${
                    tone === t.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Product Image Upload with Preview (Requirement 8) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                Product Image (Optional Vision Analysis)
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="text-[11px] text-rose-500 font-semibold hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>

            {imagePreview ? (
              <div className="relative rounded-2xl border border-indigo-200 dark:border-indigo-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 p-2 flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Image Attached for Vision AI
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Colors, materials, form factor & build will be detected.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/20 p-5 text-center cursor-pointer transition group"
              >
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mx-auto mb-1.5 transition-colors" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload product photo
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG or WEBP (Max 15MB) &bull; AI vision analyzes visible details
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Prominent Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className={`w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2 group ${
              isGenerating ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing & Generating with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Generate With AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Output Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Output Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Generated Marketing Kit
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {results ? 'All 8 outputs generated. Edit inline or copy each card.' : 'Fill the form and hit Generate to see output.'}
              </p>
            </div>

            {results && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied Kit' : 'Copy All'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1.5 border border-indigo-200/60 dark:border-indigo-800/60"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Generate All Again</span>
                </button>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {isGenerating && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/6" />
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && !results && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No listing generated yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                Enter your product details on the left, optionally upload an image, and click <strong>Generate With AI</strong> to generate your title, descriptions, SEO keywords, social post, and ad copy.
              </p>
            </div>
          )}

          {/* Output Cards */}
          {!isGenerating && results && (
            <div className="space-y-4">
              {/* 1. Product Title */}
              <CardOutput
                title="Product Title"
                fieldKey="productTitle"
                value={results.productTitle}
                description="Optimized for search engine algorithm and buyer relevance"
                badge={platform.toUpperCase()}
                characterLimit={160}
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'productTitle'}
              />

              {/* 2. Short Description */}
              <CardOutput
                title="Short Description"
                fieldKey="shortDescription"
                value={results.shortDescription}
                description="Quick 2-3 sentence overview for mobile cards & previews"
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'shortDescription'}
              />

              {/* 3. Full Description */}
              <CardOutput
                title="Full Description"
                fieldKey="fullDescription"
                value={results.fullDescription}
                description="Comprehensive commercial description with storytelling & specs"
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'fullDescription'}
              />

              {/* 4. Key Features */}
              <CardOutput
                title="Key Features & Specifications"
                fieldKey="keyFeatures"
                value={results.keyFeatures}
                description="5 to 8 bullet points highlighting specifications & buyer benefits"
                isList={true}
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'keyFeatures'}
              />

              {/* 5. SEO Keywords */}
              <CardOutput
                title="SEO Keywords & Search Tags"
                fieldKey="seoKeywords"
                value={results.seoKeywords}
                description="High-intent search terms to paste into your marketplace backend"
                isList={true}
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'seoKeywords'}
              />

              {/* 6. Meta Description */}
              <CardOutput
                title="Meta Description"
                fieldKey="metaDescription"
                value={results.metaDescription}
                description="Search engine snippet designed to increase Google search CTR"
                characterLimit={160}
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'metaDescription'}
              />

              {/* 7. Social Media Caption */}
              <CardOutput
                title="Social Media Caption"
                fieldKey="socialMediaCaption"
                value={results.socialMediaCaption}
                description="Ready-to-publish Instagram, Facebook, and TikTok caption with emojis & hashtags"
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'socialMediaCaption'}
              />

              {/* 8. Advertisement Copy */}
              <CardOutput
                title="Advertisement Copy"
                fieldKey="advertisementCopy"
                value={results.advertisementCopy}
                description="Direct-response ad copy for Facebook Marketplace and Meta Ads"
                onSave={handleCardSave}
                onRegenerate={handleCardRegenerate}
                isRegenerating={activeRegeneratingKey === 'advertisementCopy'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
