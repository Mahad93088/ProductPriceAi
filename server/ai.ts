import { GoogleGenAI, Type } from '@google/genai';
import { LanguageType, PlatformType, ToneType } from './types.js';

interface GenerateInput {
  productName: string;
  category: string;
  brand: string;
  price: string;
  features: string;
  targetAudience: string;
  tone: ToneType;
  language: LanguageType;
  platform: PlatformType;
  imageData?: {
    mimeType: string;
    base64: string;
  };
}

export interface GeneratedContentOutput {
  productTitle: string;
  shortDescription: string;
  fullDescription: string;
  keyFeatures: string[];
  seoKeywords: string[];
  metaDescription: string;
  socialMediaCaption: string;
  advertisementCopy: string;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const ECOMMERCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productTitle: {
      type: Type.STRING,
      description: 'A compelling, high-converting product title optimized for the chosen platform and search algorithm.',
    },
    shortDescription: {
      type: Type.STRING,
      description: 'A punchy, concise summary (2-3 sentences) capturing core value proposition.',
    },
    fullDescription: {
      type: Type.STRING,
      description: 'A professional, persuasive, comprehensive product description with structured paragraphs and emotional appeal.',
    },
    keyFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '5 to 8 bullet points highlighting key specifications, benefits, and differentiators with appropriate emojis.',
    },
    seoKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '7 to 10 high-intent search keywords and long-tail e-commerce terms.',
    },
    metaDescription: {
      type: Type.STRING,
      description: 'An SEO-friendly meta description under 160 characters designed to maximize search click-through rate.',
    },
    socialMediaCaption: {
      type: Type.STRING,
      description: 'Ready-to-post engaging social media caption with a hook, spacing, emojis, strong CTA, and relevant hashtags.',
    },
    advertisementCopy: {
      type: Type.STRING,
      description: 'Short, high-converting promotional ad copy focusing on problem-solving, benefits, and urgent call-to-action.',
    },
  },
  required: [
    'productTitle',
    'shortDescription',
    'fullDescription',
    'keyFeatures',
    'seoKeywords',
    'metaDescription',
    'socialMediaCaption',
    'advertisementCopy',
  ],
};

export async function generateProductContent(input: GenerateInput): Promise<GeneratedContentOutput> {
  const ai = getGeminiClient();

  const platformGuides: Record<PlatformType, string> = {
    shopify: 'Platform: Shopify DTC Brand Store. Clean, modern, brand-centric voice. Emphasize craftsmanship, lifestyle transformation, clear benefits, premium feel, and streamlined checkout.',
    amazon: 'Platform: Amazon Marketplace. High-converting A9 search optimized title with primary keywords, brand name, and model. Deliver 5 scannable bullet points emphasizing key technical specs, customer problem resolution, and Prime satisfaction.',
    etsy: 'Platform: Etsy Artisan Marketplace. Warm, authentic, story-driven tone emphasizing artisanal craft, curated materials, sustainable quality, and unique gifting appeal.',
    ebay: 'Platform: eBay Global Marketplace. Direct, accurate, and trustworthy. Highlight exact specifications, model compatibility, fast dispatch, and buyer protection.',
    woocommerce: 'Platform: WooCommerce Store. SEO-friendly headings, detailed technical specifications, structured feature tables, and independent brand authority.',
    instagram: 'Platform: Instagram & Reels. Visual, conversational, hook-heavy. Use compelling first lines, clean emoji-spaced formatting, strong urgency, DM/link-in-bio call-to-actions, and top viral e-commerce hashtags.',
    facebook: 'Platform: Facebook Marketplace & Meta Ads. Problem-agitate-solve angle, community trust, direct pricing clarity, practical utility, and clear inquiries CTA.',
    whatsapp: 'Platform: WhatsApp Business & Catalog. Compact, easily skimmable text format, bulleted benefits, bundle/deal framing, and direct "Reply to order now" CTA.',
    general: 'Platform: Omnichannel E-commerce. Versatile, professional, balanced between search engines and customer conversion across international markets.',
  };

  const languageGuides: Record<LanguageType, string> = {
    english: 'Language: Standard International English. Clear, polished, globally neutral, and universally understood by shoppers worldwide.',
    english_us: 'Language: American English (US). Fast-paced, dynamic, action-oriented with standard US spelling (e.g., color, optimize) and relatable lifestyle idioms.',
    english_uk: 'Language: British / European English (UK). Refined, sophisticated, understated authority with standard UK spelling (e.g., colour, optimise) and international European appeal.',
  };

  const toneGuides: Record<ToneType, string> = {
    professional: 'Tone: Authoritative, polished, trust-inspiring, clear, and objective.',
    friendly: 'Tone: Warm, approachable, enthusiastic, conversational, and welcoming.',
    luxury: 'Tone: Sophisticated, exclusive, premium vocabulary, understated elegance, high-end positioning.',
    persuasive: 'Tone: High-converting, urgency-driven, direct-response marketing style with strong psychological hooks.',
    simple: 'Tone: Plain language, straightforward, zero fluff, easy to understand for any shopper.',
  };

  const promptText = `
You are ProductPilot AI, the world-class e-commerce copywriting and product listing intelligence engine.
Generate a complete, high-converting product listing kit based on the following input:

Product Name: ${input.productName}
Brand: ${input.brand || 'Unbranded / Independent'}
Category: ${input.category || 'General Merchandise'}
Price: ${input.price || 'Market Competitive'}
Key Features Provided: ${input.features || 'Standard commercial grade features'}
Target Audience: ${input.targetAudience || 'General online shoppers'}

${platformGuides[input.platform]}
${languageGuides[input.language]}
${toneGuides[input.tone]}

${
  input.imageData
    ? 'IMPORTANT IMAGE ANALYSIS: A real product photo has been attached. Carefully examine the visible product: identify colors, design materials, form factor, build quality, finish, visible buttons/ports, packaging, texture, and aesthetic style. Incorporate these genuine visual observations into the title, descriptions, and features. DO NOT invent unverified internal electronic specs (e.g., exact battery mAh or microchip model) if not clearly visible or not provided in the features input.'
    : ''
}

Ensure every single output field in the JSON matches the target platform, tone, and language specifications.
`;

  if (ai) {
    try {
      const contentsParts: any[] = [];

      if (input.imageData?.base64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = input.imageData.base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        contentsParts.push({
          inlineData: {
            mimeType: input.imageData.mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      contentsParts.push({
        text: promptText,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: contentsParts },
        config: {
          systemInstruction:
            'You are an expert e-commerce catalog specialist and master copywriter for top brands on Shopify, Amazon, Etsy, eBay, and WooCommerce. Deliver exceptionally structured, accurate, and persuasive content in professional English.',
          responseMimeType: 'application/json',
          responseSchema: ECOMMERCE_SCHEMA,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text) as GeneratedContentOutput;
        if (parsed.productTitle && parsed.fullDescription) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Gemini generation error, falling back to smart engine:', err);
    }
  }

  // Fallback intelligent generator if Gemini key not set or network failure
  return fallbackGenerate(input);
}

export async function regenerateSingleSection(
  sectionKey: keyof GeneratedContentOutput,
  input: GenerateInput,
  currentResults: GeneratedContentOutput
): Promise<any> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
You are ProductPilot AI. Regenerate ONLY the field "${sectionKey}" for the following product:
Product Name: ${input.productName}
Brand: ${input.brand}
Category: ${input.category}
Price: ${input.price}
Features: ${input.features}
Target Audience: ${input.targetAudience}
Platform: ${input.platform}
Tone: ${input.tone}
Language: ${input.language}

Provide a fresh, creative, and higher-converting version different from this previous version:
${JSON.stringify(currentResults[sectionKey])}

Return valid JSON with exactly one key: "${sectionKey}".
`;

      const schemaForField: any = {
        type: Type.OBJECT,
        properties: {
          [sectionKey]: (ECOMMERCE_SCHEMA.properties as any)[sectionKey],
        },
        required: [sectionKey],
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schemaForField,
          temperature: 0.85,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed[sectionKey]) {
          return parsed[sectionKey];
        }
      }
    } catch (err) {
      console.error('Error regenerating section:', err);
    }
  }

  // Fallback variation
  const fresh = fallbackGenerate(input);
  return fresh[sectionKey];
}

function fallbackGenerate(input: GenerateInput): GeneratedContentOutput {
  const brandPrefix = input.brand ? `${input.brand} ` : '';

  let title = '';
  if (input.platform === 'amazon') {
    title = `${brandPrefix}${input.productName} - High-Performance ${input.category || 'Gear'} with Premium Ergonomics | 2-Year Warranty`;
  } else if (input.platform === 'shopify') {
    title = `${brandPrefix}${input.productName} | The Everyday Edition`;
  } else if (input.platform === 'etsy') {
    title = `Handcrafted ${brandPrefix}${input.productName} - Artisan Designed ${input.category || 'Collection'}`;
  } else if (input.platform === 'ebay') {
    title = `${brandPrefix}${input.productName} - Authentic Quality Brand New In Box (Free Fast Shipping)`;
  } else if (input.platform === 'instagram') {
    title = `✨ The All-New ${brandPrefix}${input.productName}`;
  } else {
    title = `${brandPrefix}${input.productName} - Premium Quality (${input.category || 'Best Seller'})`;
  }

  const shortDesc = `Elevate your lifestyle with the ${brandPrefix}${input.productName}. Thoughtfully crafted with high-grade materials to deliver exceptional daily performance, sleek aesthetics, and long-term durability.`;

  const fullDesc = `Introducing the ${brandPrefix}${input.productName} — the smart choice for discerning customers who refuse to compromise on quality.\n\nEngineered with precision and premium craftsmanship, this ${input.category || 'product'} solves common everyday frustrations by delivering seamless reliability and intuitive ease of use. Every curve, finish, and detail has been refined to provide maximum comfort and endurance.\n\nIdeal for ${input.targetAudience || 'daily shoppers'}, it effortlessly blends modern utility with effortless style. Experience the difference today with complete customer satisfaction guarantee.`;

  const keyFeatures = [
    `💎 Premium Build Quality: Crafted with high-grade durable materials designed for long-lasting performance.`,
    `⚡ Intuitive & User-Friendly: Ergonomically crafted for seamless daily operation without steep learning curves.`,
    `🛡️ Quality Tested & Certified: Rigorously inspected to ensure zero defects and peak reliability.`,
    `🎁 Modern Aesthetics: Sleek, compact footprint that looks stunning in any modern environment.`,
    `🚚 Fast Tracked Dispatch: Secure protective packaging with prompt delivery straight to your doorstep.`,
    `💯 100% Satisfaction Guarantee: Backed by 30-day money-back guarantee and dedicated customer support.`,
  ];

  const seoKeywords = [
    input.productName.toLowerCase(),
    `${input.brand || 'buy'} ${input.productName}`.toLowerCase(),
    `${input.category || 'online'} deals`.toLowerCase(),
    `best ${input.productName} 2026`.toLowerCase(),
    `${input.platform} shopping`.toLowerCase(),
    `high quality ${input.category || 'product'}`.toLowerCase(),
    `affordable ${input.productName}`.toLowerCase(),
  ];

  const metaDesc = `Buy ${brandPrefix}${input.productName} online at the best price. High quality, durable design & fast tracked delivery. Order now!`;

  const socialMedia = `🔥 Elevate your routine with the all-new ${brandPrefix}${input.productName}!\n\n✨ Why you'll love it:\n• Ultra-durable build & premium finish\n• Effortless daily convenience\n• Best value for your money\n\n${input.price ? `🏷️ Price: ${input.price}\n` : ''}📦 Limited stock available! Tap the link in bio or message us directly to order now. 🚀\n\n#OnlineShopping #${input.category ? input.category.replace(/\s+/g, '') : 'BestDeals'} #ProductPilot #Trending`;

  const adCopy = `Looking for the perfect ${input.productName}? Don't settle for less. Get premium quality, trusted reliability, and fast shipping today. Special launch discount active now — tap shop now before stock sells out!`;

  return {
    productTitle: title,
    shortDescription: shortDesc,
    fullDescription: fullDesc,
    keyFeatures,
    seoKeywords,
    metaDescription: metaDesc,
    socialMediaCaption: socialMedia,
    advertisementCopy: adCopy,
  };
}
