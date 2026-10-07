import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  Crown,
  Shield,
  Sparkles,
  Check,
  Calendar,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PlanType } from '../types';

interface UsageBillingViewProps {
  onOpenUpgrade: (plan?: PlanType) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const UsageBillingView: React.FC<UsageBillingViewProps> = ({
  onOpenUpgrade,
  onShowToast,
}) => {
  const { subscription, usage } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const used = usage?.currentPeriodGenerations || 0;
  const limit = usage?.monthlyLimit || 5;
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, Math.round((used / limit) * 100));

  const renewalDate = subscription?.renewalsAt
    ? new Date(subscription.renewalsAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'In 30 days';

  const planTiers = [
    {
      id: 'free' as PlanType,
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      limit: 5,
      desc: 'Test out basic features on a few products',
      features: ['5 generations / mo', 'Shopify & Amazon format', 'International English', 'Copy to clipboard'],
      popular: false,
    },
    {
      id: 'starter' as PlanType,
      name: 'Starter',
      monthlyPrice: 9,
      yearlyPrice: 7,
      limit: 100,
      desc: 'For regular marketplace sellers listing weekly',
      features: ['100 generations / mo', 'Vision image analysis', 'SEO keyword kit', 'History export'],
      popular: false,
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro',
      monthlyPrice: 19,
      yearlyPrice: 15,
      limit: 500,
      desc: 'Top choice for high-growth brands & digital stores',
      features: ['500 generations / mo', 'Gemini 3.8 Flash engine', 'Single card regeneration', 'Ad copy & social captions', 'Priority queue'],
      popular: true,
    },
    {
      id: 'business' as PlanType,
      name: 'Business',
      monthlyPrice: 49,
      yearlyPrice: 39,
      limit: 2000,
      desc: 'Full catalog automation for wholesale & agencies',
      features: ['2,000 generations / mo', 'Bulk speed boost', 'Dedicated server queue', '24/7 Priority support'],
      popular: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Current Subscription Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Active Subscription
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                Status: {subscription?.status || 'Active'}
              </span>
            </div>
            <h2 className="text-2xl font-black capitalize text-slate-900 dark:text-white">
              {subscription?.plan || 'Free'} Plan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Billed {subscription?.billingCycle || 'monthly'} &bull; Renews on {renewalDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenUpgrade()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Change / Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Usage Progress Meter */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monthly AI Generations Quota
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Each listing kit (with title, descriptions, keywords, social & ads) consumes 1 credit.
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {used} / {limit}
              </span>
              <span className="text-xs text-slate-400 ml-1">({pct}%)</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden my-3">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pct >= 90 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{remaining} credits remaining this cycle</span>
            <span>Resets on {renewalDate}</span>
          </div>

          {remaining <= 1 && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You are almost out of generations. Upgrade to keep launching products without interruption.</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenUpgrade('pro')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shrink-0 transition"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Available Plans Comparison */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Available Subscription Tiers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any tier to adjust your monthly generation capacity
            </p>
          </div>

          {/* Billing Switcher */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {planTiers.map((p) => {
            const isCurrent = subscription?.plan === p.id;
            const price = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;

            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                  p.popular
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 bg-gradient-to-b from-indigo-50/40 to-white dark:from-indigo-950/30 dark:to-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-md">
                    Recommended
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                    {p.desc}
                  </p>

                  <div className="mt-4 mb-5">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400"> / month</span>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {p.limit.toLocaleString()} generations/month
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 mb-6">
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
                  onClick={() => onOpenUpgrade(p.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                      : p.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : `Switch to ${p.name}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Billing History */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Billing History & Invoices
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Receipts and payment history for your subscription
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {[
            { id: 'INV-2026-001', date: 'Oct 01, 2026', amount: subscription?.plan === 'pro' ? '$19.00' : '$0.00', status: 'Paid' },
            { id: 'INV-2026-000', date: 'Sep 01, 2026', amount: '$0.00', status: 'Paid' },
          ].map((inv) => (
            <div key={inv.id} className="py-3.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{inv.id}</span>
                <span className="text-slate-400 ml-2">&bull; {inv.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800 dark:text-slate-200">{inv.amount}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 font-semibold">
                  {inv.status}
                </span>
                <button
                  type="button"
                  onClick={() => onShowToast(`Invoice ${inv.id} receipt downloaded.`, 'success')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Download receipt"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
