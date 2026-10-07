import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { generateProductContent, regenerateSingleSection } from './server/ai.js';
import { PlanType } from './server/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // Helper auth extractor middleware
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const session = db.getUserByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    (req as any).user = session.user;
    (req as any).profile = session.profile;
    (req as any).subscription = session.subscription;
    (req as any).usage = session.usage;
    (req as any).token = token;
    next();
  };

  // Optional auth
  const optionalAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const session = db.getUserByToken(token);
      if (session) {
        (req as any).user = session.user;
        (req as any).profile = session.profile;
        (req as any).subscription = session.subscription;
        (req as any).usage = session.usage;
        (req as any).token = token;
      }
    }
    next();
  };

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const result = db.register(email, password, name);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const result = db.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Login failed' });
    }
  });

  // Quick 1-click Demo Account Login for instant evaluation
  app.post('/api/auth/demo', (req, res) => {
    try {
      const result = db.login('seller@productpilot.ai', 'demo1234');
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Demo login failed' });
    }
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      db.resetPassword(email, newPassword);
      res.json({ success: true, message: 'Password has been updated successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Password reset failed' });
    }
  });

  app.post('/api/auth/logout', authenticate, (req: any, res) => {
    db.logout(req.token);
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    res.json({
      user: req.user,
      profile: req.profile,
      subscription: req.subscription,
      usage: req.usage,
    });
  });

  app.put('/api/auth/profile', authenticate, (req: any, res) => {
    try {
      const updated = db.updateProfile(req.user.id, req.body);
      res.json({ profile: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Could not update profile' });
    }
  });

  app.put('/api/auth/password', authenticate, (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      db.updatePassword(req.user.id, currentPassword, newPassword);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to change password' });
    }
  });

  app.delete('/api/auth/account', authenticate, (req: any, res) => {
    try {
      db.deleteAccount(req.user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to delete account' });
    }
  });

  // --- AI GENERATION ENDPOINTS ---
  app.post('/api/generate', authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const canGen = db.canGenerate(userId);

      if (!canGen) {
        const usage = db.getUsage(userId);
        return res.status(403).json({
          error: 'Generation limit reached for your current plan.',
          limitReached: true,
          usage,
        });
      }

      const {
        productName,
        category,
        brand,
        price,
        features,
        targetAudience,
        tone,
        language,
        platform,
        imageData,
      } = req.body;

      if (!productName || !productName.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
      }

      // Generate via server-side Gemini
      const generated = await generateProductContent({
        productName: productName.trim(),
        category: category || 'General Merchandise',
        brand: brand || '',
        price: price || '',
        features: features || '',
        targetAudience: targetAudience || '',
        tone: tone || 'professional',
        language: language || 'english',
        platform: platform || 'general',
        imageData,
      });

      // Increment usage count in DB
      const updatedUsage = db.incrementUsage(userId);

      // Save to database
      const savedListing = db.saveGeneration(
        userId,
        {
          productName: productName.trim(),
          brand: brand || '',
          category: category || '',
          price: price || '',
          features: features || '',
          targetAudience: targetAudience || '',
          tone: tone || 'professional',
          language: language || 'english',
          platform: platform || 'general',
          imageUrl: imageData ? 'uploaded-image' : undefined,
          imageAnalyzed: !!imageData,
        },
        generated
      );

      res.json({
        listing: savedListing,
        usage: updatedUsage,
      });
    } catch (err: any) {
      console.error('Generation failure:', err);
      res.status(500).json({ error: err.message || 'Generation failed' });
    }
  });

  // Regenerate only a single card section (e.g. social caption or title)
  app.post('/api/regenerate-section', authenticate, async (req: any, res) => {
    try {
      const { sectionKey, listingId, productContext, currentResults } = req.body;
      if (!sectionKey) {
        return res.status(400).json({ error: 'sectionKey is required' });
      }

      const freshValue = await regenerateSingleSection(
        sectionKey,
        productContext,
        currentResults
      );

      // If listingId provided, update DB
      if (listingId) {
        db.updateListingResults(req.user.id, listingId, {
          [sectionKey]: freshValue,
        });
      }

      res.json({
        sectionKey,
        newValue: freshValue,
      });
    } catch (err: any) {
      console.error('Section regeneration failed:', err);
      res.status(500).json({ error: err.message || 'Failed to regenerate section' });
    }
  });

  // --- HISTORY & LISTINGS ---
  app.get('/api/listings', authenticate, (req: any, res) => {
    try {
      const { search, platform, language } = req.query;
      const listings = db.getListings(req.user.id, {
        search: typeof search === 'string' ? search : undefined,
        platform: typeof platform === 'string' ? platform : undefined,
        language: typeof language === 'string' ? language : undefined,
      });
      res.json({ listings });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Could not fetch listings' });
    }
  });

  app.get('/api/listings/:id', authenticate, (req: any, res) => {
    const listing = db.getListingById(req.user.id, req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ listing });
  });

  app.put('/api/listings/:id', authenticate, (req: any, res) => {
    try {
      const updated = db.updateListingResults(req.user.id, req.params.id, req.body.results);
      if (!updated) {
        return res.status(404).json({ error: 'Listing not found or unauthorized' });
      }
      res.json({ listing: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update listing' });
    }
  });

  app.delete('/api/listings/:id', authenticate, (req: any, res) => {
    try {
      const ok = db.deleteListing(req.user.id, req.params.id);
      if (!ok) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Could not delete listing' });
    }
  });

  // --- TEMPLATES ---
  app.get('/api/templates', (req, res) => {
    res.json({ templates: db.getTemplates() });
  });

  // --- USAGE & BILLING ---
  app.get('/api/usage', authenticate, (req: any, res) => {
    const usage = db.getUsage(req.user.id);
    const subscription = db.getSubscription(req.user.id);
    res.json({ usage, subscription });
  });

  app.post('/api/subscription/upgrade', authenticate, (req: any, res) => {
    try {
      const { plan, billingCycle } = req.body as { plan: PlanType; billingCycle?: 'monthly' | 'yearly' };
      if (!['free', 'starter', 'pro', 'business'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan selected' });
      }
      const updated = db.updateSubscription(req.user.id, plan, billingCycle || 'monthly');
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to change plan' });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProductPilot AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
