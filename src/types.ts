export type PlanType = 'free' | 'starter' | 'pro' | 'business';
export type PlatformType = 'shopify' | 'amazon' | 'etsy' | 'ebay' | 'woocommerce' | 'instagram' | 'facebook' | 'whatsapp' | 'general';
export type ToneType = 'professional' | 'friendly' | 'luxury' | 'persuasive' | 'simple';
export type LanguageType = 'english' | 'english_uk' | 'english_us';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  name: string;
  defaultLanguage: LanguageType;
  defaultTone: ToneType;
  defaultPlatform: PlatformType;
  theme: 'light' | 'dark' | 'system';
  avatar?: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due';
  billingCycle: 'monthly' | 'yearly';
  startedAt: string;
  renewalsAt: string;
}

export interface Usage {
  id: string;
  userId: string;
  currentPeriodGenerations: number;
  monthlyLimit: number;
  resetsAt: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: PlatformType;
  language: LanguageType;
  tone: ToneType;
  promptHints: string;
  sampleProduct: {
    name: string;
    category: string;
    brand: string;
    price: string;
    features: string;
    targetAudience: string;
  };
  icon: string;
}

export interface Generation {
  id: string;
  userId: string;
  productName: string;
  brand: string;
  category: string;
  price: string;
  features: string;
  targetAudience: string;
  tone: ToneType;
  language: LanguageType;
  platform: PlatformType;
  imageUrl?: string;
  imageAnalyzed?: boolean;
  createdAt: string;
}

export interface GenerationResults {
  id?: string;
  generationId?: string;
  userId?: string;
  productTitle: string;
  shortDescription: string;
  fullDescription: string;
  keyFeatures: string[];
  seoKeywords: string[];
  metaDescription: string;
  socialMediaCaption: string;
  advertisementCopy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FullListing extends Generation {
  results: GenerationResults;
}

export interface AuthResponse {
  user: User;
  profile: Profile;
  token: string;
  subscription: Subscription;
  usage: Usage;
}
