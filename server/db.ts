import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseSchema, User, Profile, Subscription, Usage, Template, Generation, GenerationResults, PlanType, FullListing } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const PLAN_LIMITS: Record<PlanType, number> = {
  free: 5,
  starter: 100,
  pro: 500,
  business: 2000,
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-shopify-store',
    title: 'Shopify Premium Product Page',
    description: 'High-conversion DTC layout with brand narrative, feature-benefit translation, and clean SEO meta tags.',
    category: 'DTC Brand Store',
    platform: 'shopify',
    language: 'english',
    tone: 'luxury',
    promptHints: 'Elevate brand positioning, highlight premium craftsmanship and customer lifestyle transformation.',
    sampleProduct: {
      name: 'Artisan Full-Grain Leather Minimalist Wallet',
      category: 'Men Accessories',
      brand: 'Aethel Leather',
      price: '$48.00',
      features: 'Holds 8-10 cards + folded bills, RFID blocking protection, handcrafted vegetable-tanned leather, lifetime stitch warranty',
      targetAudience: 'Discerning professionals seeking minimalist everyday carry elegance',
    },
    icon: 'Store',
  },
  {
    id: 'tpl-amazon-listing',
    title: 'Amazon Best-Seller & A+ Listing',
    description: 'Optimized for Amazon A9 search ranking with high-volume keywords, scannable bullet points, and Buy Box optimization.',
    category: 'Global Marketplace',
    platform: 'amazon',
    language: 'english',
    tone: 'persuasive',
    promptHints: 'Keyword-stuffed compliant title, benefit-driven 5 bullet points, technical specifications, and prime appeal.',
    sampleProduct: {
      name: 'Active Noise Cancelling Wireless Over-Ear Headphones',
      category: 'Audio & Electronics',
      brand: 'AuraSound',
      price: '$89.99',
      features: 'Hybrid 40dB ANC, 65h battery life, Hi-Res audio certified with 40mm drivers, multi-point Bluetooth 5.4, ultra-plush memory foam',
      targetAudience: 'Frequent flyers, remote workers, students looking for distraction-free focus',
    },
    icon: 'ShoppingBag',
  },
  {
    id: 'tpl-etsy-handcrafted',
    title: 'Etsy Handmade & Craft Listing',
    description: 'Aesthetic, sensory storytelling designed for Etsy buyers, gift seekers, and algorithmic tag matching.',
    category: 'Artisan & Handmade',
    platform: 'etsy',
    language: 'english',
    tone: 'friendly',
    promptHints: 'Emphasize handmade care, sustainable materials, artisan story, gifting appeal, and 13 search tags.',
    sampleProduct: {
      name: 'Hand-Poured Amber & Sandalwood Soy Candle',
      category: 'Home Decor & Fragrance',
      brand: 'NordicBotanica',
      price: '$28.00',
      features: '100% natural soy wax, crackling wooden wick, 50-hour clean burn, amber apothecary glass jar, phthalate-free essential oils',
      targetAudience: 'Mindful home decorators, candle collectors, eco-conscious gift buyers',
    },
    icon: 'Sparkles',
  },
  {
    id: 'tpl-ebay-listing',
    title: 'eBay High-Velocity Listing',
    description: 'Direct, condition-focused listing structure optimized for quick sales, trusted seller clarity, and international shipping.',
    category: 'Marketplace Deals',
    platform: 'ebay',
    language: 'english',
    tone: 'professional',
    promptHints: 'Accurate model details, clear compatibility matrix, fast global shipping emphasis, return policy guarantee.',
    sampleProduct: {
      name: 'Mechanical Ergonomic Gaming Keyboard RGB Hot-Swappable',
      category: 'Computer Peripherals',
      brand: 'KeyVortex',
      price: '$59.95',
      features: 'Pre-lubed linear switches, PBT double-shot keycaps, south-facing RGB, detachable braided USB-C cable, sound-dampening foam',
      targetAudience: 'Gamers, coders, keyboard enthusiasts seeking premium typing feel',
    },
    icon: 'Boxes',
  },
  {
    id: 'tpl-woocommerce-store',
    title: 'WooCommerce Storefront Listing',
    description: 'Flexible, SEO-rich product copy structured for independent WordPress commerce stores.',
    category: 'Independent E-Commerce',
    platform: 'woocommerce',
    language: 'english',
    tone: 'professional',
    promptHints: 'Search-engine friendly headings, bulleted technical specs, schema-ready metadata, and clear customer guarantees.',
    sampleProduct: {
      name: 'Organic Cold-Pressed Moroccan Argan Oil 100ml',
      category: 'Clean Beauty & Skin',
      brand: 'Argania Botanics',
      price: '$34.00',
      features: '100% pure certified organic, rich in Vitamin E and essential fatty acids, deep hydration for hair & skin, cruelty-free, glass dropper',
      targetAudience: 'Clean beauty enthusiasts and individuals seeking natural hydration solutions',
    },
    icon: 'Store',
  },
  {
    id: 'tpl-instagram-post',
    title: 'Instagram Post & Reel Caption',
    description: 'Scroll-stopping hook, aesthetic formatting, emotional hook, and viral e-commerce hashtags.',
    category: 'Social Commerce',
    platform: 'instagram',
    language: 'english',
    tone: 'friendly',
    promptHints: 'Catchy 1st line hook, bulleted emoji benefits, clear call to action (Link in bio / DM to order), and tailored hashtag stack.',
    sampleProduct: {
      name: 'Ceramic Cloud Matcha & Coffee Mug',
      category: 'Home & Kitchen Aesthetics',
      brand: 'AuraLiving',
      price: '$26.00',
      features: 'Hand-glazed matte finish, ergonomic cloud handle, microwave & dishwasher safe, 350ml capacity',
      targetAudience: 'Matcha lovers, morning routine creators, cozy desk aesthetic fans',
    },
    icon: 'Instagram',
  },
  {
    id: 'tpl-facebook-ad',
    title: 'Facebook Marketplace & Meta Ad Copy',
    description: 'Problem-agitate-solve ad copywriting geared for high CTR and social commerce conversions.',
    category: 'Paid Advertising',
    platform: 'facebook',
    language: 'english',
    tone: 'persuasive',
    promptHints: 'Punchy headline, relatable customer pain point, clear solution showcase, social proof trigger, limited stock urgency.',
    sampleProduct: {
      name: 'Orthopedic Memory Foam Lumbar Support Pillow',
      category: 'Ergonomics & Health',
      brand: 'SpineEase',
      price: '$34.99',
      features: 'High density slow-rebound foam, breathable mesh cover, dual adjustable straps for office chair or car seat, promotes posture alignment',
      targetAudience: 'Desk workers, software developers, drivers suffering from lower back stiffness',
    },
    icon: 'Share2',
  },
  {
    id: 'tpl-whatsapp-broadcast',
    title: 'WhatsApp Catalog & Direct Message',
    description: 'Compact, skimmable chat format with key specs, instant order CTA, and polite seller tone.',
    category: 'Direct Messaging',
    platform: 'whatsapp',
    language: 'english',
    tone: 'friendly',
    promptHints: 'Greeting, short highlight, clear pricing with bundle discount, easy WhatsApp reply CTA, payment options.',
    sampleProduct: {
      name: 'Organic Rosemary & Biotin Hair Growth Serum 50ml',
      category: 'Beauty & Hair Care',
      brand: 'PureBotanics',
      price: '$24.99',
      features: '100% natural cold pressed oils, reduces hair fall in 3 weeks, stimulates dormant follicles, non-greasy formula',
      targetAudience: 'Individuals seeking natural botanical hair health solutions',
    },
    icon: 'MessageCircle',
  },
  {
    id: 'tpl-general-ecommerce',
    title: 'General E-Commerce Omnichannel Listing',
    description: 'Balanced, multi-platform structure ready for copy-pasting to any international store or marketplace.',
    category: 'Multichannel',
    platform: 'general',
    language: 'english',
    tone: 'professional',
    promptHints: 'Clear standard structure: optimized title, executive summary, comprehensive specs, SEO keywords, and warranty.',
    sampleProduct: {
      name: 'Smart WiFi Indoor Security Camera 2K 360°',
      category: 'Smart Home & Security',
      brand: 'GuardEye',
      price: '$39.99',
      features: '2K Ultra HD resolution, AI human detection, night vision up to 30ft, two-way audio talk, cloud & micro SD storage support',
      targetAudience: 'Home owners, pet parents, parents with toddlers looking for peace of mind',
    },
    icon: 'Boxes',
  },
];

class Database {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          // Ensure default templates are present
          if (!parsed.templates || parsed.templates.length === 0) {
            parsed.templates = DEFAULT_TEMPLATES;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read db file, initializing fresh:', e);
    }
    const initial = this.createInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    }
  }

  public save() {
    this.saveDirect(this.db);
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'pilot_salt_2026').digest('hex');
  }

  private createInitialData(): DatabaseSchema {
    const demoUserId = 'usr-demo-pilot';
    const demoPasswordHash = this.hashPassword('demo1234');

    const demoUser: User = {
      id: demoUserId,
      email: 'seller@productpilot.ai',
      passwordHash: demoPasswordHash,
      createdAt: new Date().toISOString(),
    };

    const demoProfile: Profile = {
      userId: demoUserId,
      name: 'Emma Laurent (Global Seller)',
      defaultLanguage: 'english',
      defaultTone: 'persuasive',
      defaultPlatform: 'shopify',
      theme: 'dark',
      updatedAt: new Date().toISOString(),
    };

    const demoSubscription: Subscription = {
      id: 'sub-demo-pro',
      userId: demoUserId,
      plan: 'pro',
      status: 'active',
      billingCycle: 'monthly',
      startedAt: new Date().toISOString(),
      renewalsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const demoUsage: Usage = {
      id: 'usg-demo-1',
      userId: demoUserId,
      currentPeriodGenerations: 24,
      monthlyLimit: 500,
      resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const sampleGenId = 'gen-demo-1';
    const sampleGen: Generation = {
      id: sampleGenId,
      userId: demoUserId,
      productName: 'TWS Wireless Gaming Earbuds Pro 60ms Ultra Low Latency',
      brand: 'VoltAudio',
      category: 'Electronics & Audio',
      price: '$49.99',
      features: '60ms low latency gaming mode, ENC quad mic noise reduction, RGB glowing charging case, 35h total playtime, Bluetooth 5.4',
      targetAudience: 'Mobile gamers and high-fidelity audio streamers across Europe & US',
      tone: 'persuasive',
      language: 'english',
      platform: 'shopify',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    };

    const sampleResults: GenerationResults = {
      id: 'res-demo-1',
      generationId: sampleGenId,
      userId: demoUserId,
      productTitle: 'VoltAudio TWS Gaming Earbuds Pro (60ms Ultra-Low Latency) | ENC Quad-Mic, Cyberpunk RGB Case & 35H Battery - Wireless Earphones with 2-Year International Warranty',
      shortDescription: 'Level up your gameplay with VoltAudio Gaming Earbuds featuring zero-lag 60ms latency, punchy titanium dynamic bass, and ENC dual-mic noise isolation for crystal-clear team communication.',
      fullDescription: 'Experience tournament-grade audio immersion with the VoltAudio TWS Gaming Earbuds Pro. Engineered specifically for competitive mobile and PC gamers, these earbuds feature a dedicated 60ms Ultra-Low Latency Gaming Mode that synchronizes every footstep, reload, and sound effect with millisecond precision.\n\nEquipped with custom-tuned 10mm titanium composite drivers, they deliver punchy sub-bass without sacrificing crisp mids and sparkling highs. The ergonomic in-ear contour ensures comfortable all-day wear during marathon sessions, while environmental noise cancellation filters out 90% of background ambient sound during live squad chats.\n\nThe futuristic Cyberpunk glowing charging case provides up to 35 hours of total playtime, with fast USB-C top-up delivering 2 hours of listening on just a 10-minute charge. Fully IPX5 splash resistant and certified for worldwide shipping.',
      keyFeatures: [
        '⚡ 60ms Ultra-Low Latency: Instant audio-visual synchronization designed for competitive esports.',
        '🎙️ Quad-Mic ENC Noise Cancellation: Filters 90% of ambient background noise for studio-clear team chat.',
        '🔋 35 Hours Extended Playtime: 7 hours single charge + 28 hours reserve from the rapid magnetic case.',
        '🎵 10mm Titanium Bass Drivers: Rich acoustic separation, wide soundstage, and responsive low-end punch.',
        '💧 IPX5 Water & Sweat Resistance: Built for workout endurance, daily transit, and all-weather commutes.',
        '📱 Universal Compatibility: Seamless instant pairing with iOS, Android, macOS, and Windows PC.',
        '🛡️ 2-Year Global Warranty: Backed by 30-day money-back guarantee and worldwide tracked delivery.'
      ],
      seoKeywords: [
        'wireless gaming earbuds',
        'low latency bluetooth earphones',
        'enc noise cancelling earbuds',
        'tws bluetooth 5.4 headphones',
        'best gaming earbuds under 50',
        'esports wireless earphones',
        'rgb gaming headset'
      ],
      metaDescription: 'Shop VoltAudio TWS Gaming Earbuds Pro. 60ms ultra-low latency, quad-mic ENC noise reduction, 35h battery life & RGB case. Fast global tracked shipping.',
      socialMediaCaption: '🔥 Gamers, stop lagging behind! Experience zero audio delay with the all-new VoltAudio Pro 60ms Ultra-Low Latency Earbuds. 🎧🎮\n\n⚡ 60ms Gaming Sync\n🎙️ Studio Quad-Mic ENC\n✨ Cyberpunk Glowing RGB Case\n🔋 35-Hour Battery Life\n\n📦 Free worldwide shipping this week! Tap the link in bio to claim your 20% launch discount today. #GamingSetup #GamerLife #TechGear #WirelessEarbuds #VoltAudio',
      advertisementCopy: 'Dominate every match with zero-delay audio. The VoltAudio Pro delivers tournament-grade 60ms low latency, quad-mic team clarity, and 35h battery. Claim 20% OFF today with free international delivery!',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    };

    return {
      users: [demoUser],
      profiles: [demoProfile],
      subscriptions: [demoSubscription],
      usages: [demoUsage],
      templates: DEFAULT_TEMPLATES,
      generations: [sampleGen],
      generation_results: [sampleResults],
      tokens: [],
    };
  }

  // --- Auth & Users ---
  public register(email: string, passwordPlain: string, name: string): { user: User; profile: Profile; token: string; subscription: Subscription; usage: Usage } {
    const existing = this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const userId = 'usr-' + crypto.randomUUID();
    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash: this.hashPassword(passwordPlain),
      createdAt: new Date().toISOString(),
    };

    const newProfile: Profile = {
      userId,
      name: name || email.split('@')[0],
      defaultLanguage: 'english',
      defaultTone: 'professional',
      defaultPlatform: 'shopify',
      theme: 'dark',
      updatedAt: new Date().toISOString(),
    };

    const newSub: Subscription = {
      id: 'sub-' + crypto.randomUUID(),
      userId,
      plan: 'free',
      status: 'active',
      billingCycle: 'monthly',
      startedAt: new Date().toISOString(),
      renewalsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const newUsage: Usage = {
      id: 'usg-' + crypto.randomUUID(),
      userId,
      currentPeriodGenerations: 0,
      monthlyLimit: PLAN_LIMITS['free'],
      resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.db.users.push(newUser);
    this.db.profiles.push(newProfile);
    this.db.subscriptions.push(newSub);
    this.db.usages.push(newUsage);

    const token = this.createSession(userId);
    this.save();

    return { user: newUser, profile: newProfile, token, subscription: newSub, usage: newUsage };
  }

  public login(email: string, passwordPlain: string): { user: User; profile: Profile; token: string; subscription: Subscription; usage: Usage } {
    const user = this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const hash = this.hashPassword(passwordPlain);
    if (user.passwordHash !== hash) {
      throw new Error('Invalid email or password.');
    }

    const profile = this.getProfile(user.id);
    const subscription = this.getSubscription(user.id);
    const usage = this.getUsage(user.id);
    const token = this.createSession(user.id);
    this.save();

    return { user, profile, token, subscription, usage };
  }

  public resetPassword(email: string, newPasswordPlain: string): boolean {
    const user = this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No account found with this email.');
    }
    user.passwordHash = this.hashPassword(newPasswordPlain);
    this.save();
    return true;
  }

  public createSession(userId: string): string {
    const token = 'tok_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    this.db.tokens.push({ token, userId, expiresAt });
    // Cleanup old tokens
    const now = new Date().toISOString();
    this.db.tokens = this.db.tokens.filter((t) => t.expiresAt > now);
    return token;
  }

  public getUserByToken(token: string): { user: User; profile: Profile; subscription: Subscription; usage: Usage } | null {
    if (!token) return null;
    const session = this.db.tokens.find((t) => t.token === token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.db.tokens = this.db.tokens.filter((t) => t.token !== token);
      this.save();
      return null;
    }

    const user = this.db.users.find((u) => u.id === session.userId);
    if (!user) return null;

    const profile = this.getProfile(user.id);
    const subscription = this.getSubscription(user.id);
    const usage = this.getUsage(user.id);

    return { user, profile, subscription, usage };
  }

  public logout(token: string) {
    this.db.tokens = this.db.tokens.filter((t) => t.token !== token);
    this.save();
  }

  public getProfile(userId: string): Profile {
    let profile = this.db.profiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = {
        userId,
        name: 'Seller',
        defaultLanguage: 'english',
        defaultTone: 'professional',
        defaultPlatform: 'shopify',
        theme: 'dark',
        updatedAt: new Date().toISOString(),
      };
      this.db.profiles.push(profile);
      this.save();
    }
    return profile;
  }

  public updateProfile(userId: string, updates: Partial<Profile>): Profile {
    const profile = this.getProfile(userId);
    Object.assign(profile, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return profile;
  }

  public updatePassword(userId: string, currentPlain: string, newPlain: string) {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');
    if (user.passwordHash !== this.hashPassword(currentPlain)) {
      throw new Error('Current password is incorrect.');
    }
    user.passwordHash = this.hashPassword(newPlain);
    this.save();
  }

  public deleteAccount(userId: string) {
    this.db.users = this.db.users.filter((u) => u.id !== userId);
    this.db.profiles = this.db.profiles.filter((p) => p.userId !== userId);
    this.db.subscriptions = this.db.subscriptions.filter((s) => s.userId !== userId);
    this.db.usages = this.db.usages.filter((u) => u.userId !== userId);
    this.db.generations = this.db.generations.filter((g) => g.userId !== userId);
    this.db.generation_results = this.db.generation_results.filter((r) => r.userId !== userId);
    this.db.tokens = this.db.tokens.filter((t) => t.userId !== userId);
    this.save();
  }

  // --- Subscriptions & Usage ---
  public getSubscription(userId: string): Subscription {
    let sub = this.db.subscriptions.find((s) => s.userId === userId);
    if (!sub) {
      sub = {
        id: 'sub-' + crypto.randomUUID(),
        userId,
        plan: 'free',
        status: 'active',
        billingCycle: 'monthly',
        startedAt: new Date().toISOString(),
        renewalsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      this.db.subscriptions.push(sub);
      this.save();
    }
    return sub;
  }

  public updateSubscription(userId: string, newPlan: PlanType, billingCycle: 'monthly' | 'yearly' = 'monthly'): { subscription: Subscription; usage: Usage } {
    const sub = this.getSubscription(userId);
    sub.plan = newPlan;
    sub.billingCycle = billingCycle;
    sub.renewalsAt = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

    const usage = this.getUsage(userId);
    usage.monthlyLimit = PLAN_LIMITS[newPlan];

    this.save();
    return { subscription: sub, usage };
  }

  public getUsage(userId: string): Usage {
    let usage = this.db.usages.find((u) => u.userId === userId);
    const sub = this.getSubscription(userId);
    const targetLimit = PLAN_LIMITS[sub.plan] || 5;

    if (!usage) {
      usage = {
        id: 'usg-' + crypto.randomUUID(),
        userId,
        currentPeriodGenerations: 0,
        monthlyLimit: targetLimit,
        resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      this.db.usages.push(usage);
      this.save();
    } else {
      // Sync plan limit in case updated
      usage.monthlyLimit = targetLimit;
    }
    return usage;
  }

  public canGenerate(userId: string): boolean {
    const usage = this.getUsage(userId);
    return usage.currentPeriodGenerations < usage.monthlyLimit;
  }

  public incrementUsage(userId: string): Usage {
    const usage = this.getUsage(userId);
    usage.currentPeriodGenerations += 1;
    this.save();
    return usage;
  }

  // --- Templates ---
  public getTemplates(): Template[] {
    return this.db.templates || DEFAULT_TEMPLATES;
  }

  // --- Generations & Results (History) ---
  public saveGeneration(
    userId: string,
    input: Omit<Generation, 'id' | 'userId' | 'createdAt'>,
    resultsData: Omit<GenerationResults, 'id' | 'generationId' | 'userId' | 'createdAt' | 'updatedAt'>
  ): FullListing {
    const genId = 'gen-' + crypto.randomUUID();
    const resId = 'res-' + crypto.randomUUID();
    const now = new Date().toISOString();

    const gen: Generation = {
      ...input,
      id: genId,
      userId,
      createdAt: now,
    };

    const results: GenerationResults = {
      ...resultsData,
      id: resId,
      generationId: genId,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    this.db.generations.unshift(gen);
    this.db.generation_results.unshift(results);
    this.save();

    return { ...gen, results };
  }

  public getListings(
    userId: string,
    filters?: { search?: string; platform?: string; language?: string }
  ): FullListing[] {
    const userGens = this.db.generations.filter((g) => g.userId === userId);
    let full = userGens.map((gen) => {
      const res = this.db.generation_results.find((r) => r.generationId === gen.id) || {
        id: 'res-unknown',
        generationId: gen.id,
        userId: gen.userId,
        productTitle: gen.productName,
        shortDescription: '',
        fullDescription: '',
        keyFeatures: [],
        seoKeywords: [],
        metaDescription: '',
        socialMediaCaption: '',
        advertisementCopy: '',
        createdAt: gen.createdAt,
        updatedAt: gen.createdAt,
      };
      return { ...gen, results: res };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      full = full.filter(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.results.productTitle.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (filters?.platform && filters.platform !== 'all') {
      full = full.filter((item) => item.platform === filters.platform);
    }

    if (filters?.language && filters.language !== 'all') {
      full = full.filter((item) => item.language === filters.language);
    }

    return full;
  }

  public getListingById(userId: string, id: string): FullListing | null {
    const gen = this.db.generations.find((g) => g.id === id && g.userId === userId);
    if (!gen) return null;
    const res = this.db.generation_results.find((r) => r.generationId === gen.id);
    if (!res) return null;
    return { ...gen, results: res };
  }

  public updateListingResults(
    userId: string,
    generationId: string,
    updates: Partial<GenerationResults>
  ): FullListing | null {
    const gen = this.db.generations.find((g) => g.id === generationId && g.userId === userId);
    if (!gen) return null;
    const res = this.db.generation_results.find((r) => r.generationId === generationId && r.userId === userId);
    if (!res) return null;

    Object.assign(res, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return { ...gen, results: res };
  }

  public deleteListing(userId: string, generationId: string): boolean {
    const initialLen = this.db.generations.length;
    this.db.generations = this.db.generations.filter((g) => !(g.id === generationId && g.userId === userId));
    this.db.generation_results = this.db.generation_results.filter((r) => !(r.generationId === generationId && r.userId === userId));
    const deleted = this.db.generations.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }
}

export const db = new Database();
export { PLAN_LIMITS };
