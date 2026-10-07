import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';

import { LandingPage } from './views/LandingPage';
import { DashboardView } from './views/DashboardView';
import { CreateListingView } from './views/CreateListingView';
import { HistoryView } from './views/HistoryView';
import { TemplatesView } from './views/TemplatesView';
import { UsageBillingView } from './views/UsageBillingView';
import { SettingsView } from './views/SettingsView';

import { FullListing, PlanType, Template } from './types';
import { api } from './services/api';

function AppContent() {
  const { isAuthenticated, isLoading, demoLogin } = useAuth();

  // Navigation & view state
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeHighlightPlan, setUpgradeHighlightPlan] = useState<PlanType>('pro');

  // Listings data
  const [listings, setListings] = useState<FullListing[]>([]);
  const [editingListing, setEditingListing] = useState<FullListing | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch listings on login
  const fetchListings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getListings();
      setListings(res.listings || []);
    } catch (err) {
      console.warn('Could not fetch listings:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handlers
  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenDemo = async () => {
    try {
      await demoLogin();
      showToast('Welcome to ProductPilot AI Demo Mode!', 'success');
      setCurrentTab('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    }
  };

  const handleOpenUpgrade = (plan?: PlanType) => {
    if (plan) setUpgradeHighlightPlan(plan);
    setUpgradeModalOpen(true);
  };

  const handleListingSaved = (saved: FullListing) => {
    setListings((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === saved.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleListingDeleted = (deletedId: string) => {
    setListings((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleViewListing = (listing: FullListing) => {
    setEditingListing(listing);
    setCurrentTab('create');
  };

  const handleSelectTemplate = (template: Template) => {
    const syntheticListing: FullListing = {
      id: '',
      userId: '',
      productName: template.sampleProduct.name,
      category: template.sampleProduct.category,
      brand: template.sampleProduct.brand,
      price: template.sampleProduct.price,
      features: template.sampleProduct.features,
      targetAudience: template.sampleProduct.targetAudience,
      tone: template.tone,
      language: template.language,
      platform: template.platform,
      createdAt: new Date().toISOString(),
      results: {
        productTitle: '',
        shortDescription: '',
        fullDescription: '',
        keyFeatures: [],
        seoKeywords: [],
        metaDescription: '',
        socialMediaCaption: '',
        advertisementCopy: '',
      },
    };
    setEditingListing(syntheticListing);
    setCurrentTab('create');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse text-white font-bold">
            P
          </div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Loading ProductPilot AI...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated: Show Landing Page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onOpenDemo={handleOpenDemo}
          onNavigateToDashboard={() => setCurrentTab('dashboard')}
        />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={() => {
            showToast('Successfully logged in!', 'success');
            setCurrentTab('dashboard');
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Authenticated: Show Seller Dashboard Workspace
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'create' && currentTab !== 'create') {
            // keep editingListing or start fresh if user clicks nav directly
          }
          setCurrentTab(tab);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenUpgrade={() => handleOpenUpgrade()}
      />

      {/* Main Workspace Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenUpgrade={() => handleOpenUpgrade()}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              listings={listings}
              onNavigateToCreate={(templateData) => {
                if (templateData) setEditingListing(templateData);
                else setEditingListing(null);
                setCurrentTab('create');
              }}
              onNavigateToHistory={() => setCurrentTab('history')}
              onNavigateToTemplates={() => setCurrentTab('templates')}
              onOpenUpgrade={() => handleOpenUpgrade()}
              onViewListing={handleViewListing}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'create' && (
            <CreateListingView
              initialListing={editingListing}
              onListingSaved={handleListingSaved}
              onOpenUpgrade={() => handleOpenUpgrade()}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              listings={listings}
              onOpenListing={handleViewListing}
              onListingDeleted={handleListingDeleted}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesView
              onSelectTemplate={handleSelectTemplate}
              onShowToast={showToast}
            />
          )}

          {(currentTab === 'usage' || currentTab === 'billing') && (
            <UsageBillingView
              onOpenUpgrade={handleOpenUpgrade}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Modals & Toasts */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
        highlightPlan={upgradeHighlightPlan}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
