import React, { useState } from 'react';
import { Check, Sparkles, X, Zap, Shield, Crown } from 'lucide-react';
import { PlanType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
  highlightPlan?: PlanType;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  highlightPlan = 'pro',
}) => {
  const { subscription, updateSubscriptionState } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      limit: 5,
      description: 'Ideal for trying out AI generation on a few listings.',
      features: [
        '5 AI generations / month',
        'Basic listing builder',
        'International English copy',
        'Standard processing speed',
        'Copy to clipboard',
      ],
      icon: Sparkles,
      popular: false,
    },
    {
      id: 'starter' as PlanType,
      name: 'Starter',
      priceMonthly: 9,
      priceYearly: 7,
      limit: 100,
      description: 'Perfect for active marketplace sellers and small boutique stores.',
      features: [
        '100 AI generations / month',
        'Shopify & Amazon SEO titles',
        'Product image analysis',
        'US, UK & Global English formats',
        'History export & re-editing',
      ],
      icon: Zap,
      popular: false,
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro',
      priceMonthly: 19,
      priceYearly: 15,
      limit: 500,
      description: 'Best value for serious e-commerce brands & agency operators.',
      features: [
        '500 AI generations / month',
        'Priority high-speed Gemini AI engine',
        'Full image multimodal vision analysis',
        'All platform templates included',
        'Social media hooks & Facebook ad copies',
        'Single-card instant regeneration',
      ],
      icon: Crown,
      popular: true,
    },
    {
      id: 'business' as PlanType,
      name: 'Business',
      priceMonthly: 49,
      priceYearly: 39,
      limit: 2000,
      description: 'Built for high-volume catalogs, wholesale sellers & multi-store brands.',
      features: [
        '2,000 AI generations / month',
        'Bulk generation speed boost',
        'Unlimited history & templates',
        'Dedicated server queue',
        'Priority seller support 24/7',
        'Custom tone presets',
      ],
      icon: Shield,
      popular: false,
    },
  ];

  const handleSelectPlan = async (planId: PlanType) => {
    if (subscription?.plan === planId) {
      onClose();
      return;
    }

    setIsUpdating(planId);
    try {
      const result = await api.upgradePlan(planId, billingCycle);
      updateSubscriptionState(result.subscription, result.usage);
      onSuccess?.(`Plan successfully changed to ${planId.toUpperCase()}! Your credit limit is now ${result.usage.monthlyLimit}.`);
      onClose();
    } catch (err: any) {
      console.error('Failed to change plan:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl p-6 md:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Flexible Plans for Every Seller
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Scale Your Product Listings With AI
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Upgrade your quota to generate hundreds of high-converting listings on Shopify, Amazon, Etsy, and social media.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mt-5 border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yearly Billing
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = subscription?.plan === p.id;
            const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
            const Icon = p.icon;

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                  p.popular
                    ? 'border-indigo-500 dark:border-indigo-500 shadow-xl shadow-indigo-500/10 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-md">
                    Recommended
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <Icon className="w-4 h-4 text-indigo-500" />
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {p.description}
                  </p>

                  <div className="mt-4 mb-5">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      / month
                    </span>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {p.limit.toLocaleString()} generations/month
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 mb-6">
                    {p.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(p.id)}
                  disabled={isCurrent || isUpdating !== null}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                      : p.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                  } ${isUpdating === p.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isUpdating === p.id ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : null}
                  {isCurrent ? 'Active Plan' : isUpdating === p.id ? 'Updating...' : `Choose ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          🔒 Secure SSL checkout simulation. Upgrade or downgrade anytime with instant credit allocation.
        </p>
      </div>
    </div>
  );
};
