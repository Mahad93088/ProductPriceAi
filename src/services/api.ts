import { AuthResponse, FullListing, GenerationResults, Profile, Subscription, Template, Usage } from '../types';

const TOKEN_KEY = 'productpilot_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    err.limitReached = data.limitReached;
    err.usage = data.usage;
    throw err;
  }

  return data as T;
}

export const api = {
  // Auth
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async demoLogin(): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/demo', {
      method: 'POST',
    });
    setStoredToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
    }
  },

  async forgotPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  async getMe(): Promise<{ user: any; profile: Profile; subscription: Subscription; usage: Usage }> {
    return request('/api/auth/me');
  },

  async updateProfile(updates: Partial<Profile>): Promise<{ profile: Profile }> {
    return request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return request('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    const res = await request<{ success: boolean }>('/api/auth/account', {
      method: 'DELETE',
    });
    setStoredToken(null);
    return res;
  },

  // AI Generation
  async generateListing(payload: {
    productName: string;
    category?: string;
    brand?: string;
    price?: string;
    features?: string;
    targetAudience?: string;
    tone: string;
    language: string;
    platform: string;
    imageData?: { mimeType: string; base64: string };
  }): Promise<{ listing: FullListing; usage: Usage }> {
    return request('/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async regenerateSection(payload: {
    sectionKey: keyof GenerationResults;
    listingId?: string;
    productContext: any;
    currentResults: GenerationResults;
  }): Promise<{ sectionKey: string; newValue: any }> {
    return request('/api/regenerate-section', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Listings & History
  async getListings(params?: { search?: string; platform?: string; language?: string }): Promise<{ listings: FullListing[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.platform) query.set('platform', params.platform);
    if (params?.language) query.set('language', params.language);
    const qs = query.toString();
    return request(`/api/listings${qs ? `?${qs}` : ''}`);
  },

  async getListing(id: string): Promise<{ listing: FullListing }> {
    return request(`/api/listings/${id}`);
  },

  async updateListing(id: string, results: Partial<GenerationResults>): Promise<{ listing: FullListing }> {
    return request(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ results }),
    });
  },

  async deleteListing(id: string): Promise<{ success: boolean }> {
    return request(`/api/listings/${id}`, {
      method: 'DELETE',
    });
  },

  // Templates
  async getTemplates(): Promise<{ templates: Template[] }> {
    return request('/api/templates');
  },

  // Usage & Subscription
  async getUsage(): Promise<{ usage: Usage; subscription: Subscription }> {
    return request('/api/usage');
  },

  async upgradePlan(plan: string, billingCycle: 'monthly' | 'yearly'): Promise<{ subscription: Subscription; usage: Usage }> {
    return request('/api/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan, billingCycle }),
    });
  },
};
