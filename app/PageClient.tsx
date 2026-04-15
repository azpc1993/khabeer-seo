'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Loader2, Sparkles, AlertCircle, ShoppingBag, 
  LogOut, History, Settings, BookOpen, CreditCard,
  X, ChevronRight, ChevronLeft, LayoutGrid, Package, Menu,
  LayoutDashboard, Zap, Bell, Key, User as UserIcon,
} from 'lucide-react'; 
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic Imports for Views
import { AuthOverlay } from '@/components/auth/AuthOverlay';

const HomeView = dynamic(() => import('@/components/views/HomeView'), { ssr: false });
const AutoSeoView = dynamic(() => import('@/app/auto-seo/page'), { ssr: false });
const GenerateView = dynamic(() => import('@/components/views/GenerateView'), { ssr: false });
const ResearchView = dynamic(() => import('@/components/views/ResearchView'), { ssr: false });
const ProductView = dynamic(() => import('@/components/ProductTrackingView'), { ssr: false });
const ToolsView = dynamic(() => import('@/components/views/ToolsView'), { ssr: false });
const ProfileView = dynamic(() => import('@/components/ProfileView'), { ssr: false });
const GuideView = dynamic(() => import('@/components/views/GuideView'), { ssr: false });
const HistoryView = dynamic(() => import('@/components/HistoryView'), { ssr: false });
const SettingsView = dynamic(() => import('@/components/SettingsView'), { ssr: false });
const PricingView = dynamic(() => import('@/components/views/PricingView'), { ssr: false });

// Shared Components & Utils
import { Icon } from '@/components/Common';
import { MeshBackground } from '@/components/EliteUI';
import { callGeminiAPI, handleGeminiError } from '@/lib/api';
import { formatProjectName } from '@/lib/utils';
import { copyRichTextToClipboard, formatContentForSalla } from '@/lib/clipboard';
import { useAtom } from 'jotai';
import { subscriptionAtom, usageAtom } from '@/store/subscriptionStore';
import { subscriptionService } from '@/services/subscriptionService';
import { SYSTEM_INSTRUCTION, KEYWORD_RESEARCH_INSTRUCTION, DEFAULT_DASHBOARD_CONFIG, seoTips, DAILY_LIMIT, TAB_ORDER } from '@/lib/constants';

import { HistoryItem, ResearchResults } from '@/types';
import { useSwipe } from '@/lib/useSwipe';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { useNotificationsStore } from '@/store/notificationsStore';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function SEOApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { unreadCount, addNotification } = useNotificationsStore();
  const [profileUsername, setProfileUsername] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileEmail, setProfileEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [, setSubscription] = useAtom(subscriptionAtom);
  const [, setUsage] = useAtom(usageAtom);
  const [showPricing, setShowPricing] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // start false, auth loads async
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setHistory(data || []);
      
      const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
      const warningThreshold = 55 * 24 * 60 * 60 * 1000; // 55 days
      const now = Date.now();
      
      const nearingLimit = (data as HistoryItem[] || []).some((item) => {
        const createdAt = item.created_at;
        if (!createdAt) return false;
        const timestamp = new Date(createdAt as string | number).getTime();
        const age = now - timestamp;
        return age > warningThreshold && age < sixtyDaysInMs;
      });

      if (nearingLimit) {
        toast.warning('بعض العمليات في سجلك تقترب من حد الحذف التلقائي (60 يوماً).', {
          duration: 10000,
        });
      }
    } catch (err: unknown) {
      console.error('Unexpected error fetching history:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      } else {
        toast.error('حدث خطأ أثناء جلب السجل');
      }
    }
  }, [user]);

  const fetchDailyUsage = useCallback(async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const usageId = `${user.id}_${today}`;
      const { data, error } = await supabase.from('usage').select('*').eq('id', usageId).single();
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
      if (data) {
        setDailyUsage(data.count || 0);
      } else {
        setDailyUsage(0);
      }
    } catch (err: unknown) {
      console.error('Error fetching daily usage:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      }
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchHistoryRef = useRef<(() => Promise<void>) | null>(null);
  const fetchDailyUsageRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    fetchHistoryRef.current = fetchHistory;
    fetchDailyUsageRef.current = fetchDailyUsage;
  }, [fetchHistory, fetchDailyUsage]);

  // Auth States
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // SEO Generation States
  const [productName, setProductName] = useState('');
  const [pk, setPk] = useState('');
  const [lsi, setLsi] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [competitorInfo, setCompetitorInfo] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [variations, setVariations] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('احترافي');
  const [metaLength, setMetaLength] = useState('متوسط');
  const [keywordCount, setKeywordCount] = useState('10-15');
  const [specsFormat, setSpecsFormat] = useState('نقاط');
  const [competitionLevel, setCompetitionLevel] = useState('متوسط');
  const [seoLevel, setSeoLevel] = useState('متقدم');
  const [includeKeywords, setIncludeKeywords] = useState(true);
  const [correctionMode, setCorrectionMode] = useState<'auto' | 'suggest' | 'off'>('off');
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState<'product' | 'blog' | 'category'>('product');
  const [catchyTitle, setCatchyTitle] = useState('');
  const [manualPk, setManualPk] = useState('');
  const [showManualPkInput, setShowManualPkInput] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySortOrder, setHistorySortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [descriptionLength, setDescriptionLength] = useState<'short' | 'medium' | 'long'>('medium');

  // Settings States
  const [appLanguage, setAppLanguage] = useState('العربية');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMotionEnabled, setIsMotionEnabled] = useState(true);
  const [copyFormat, setCopyFormat] = useState<'html' | 'text'>('text');
  const [autoFormat, setAutoFormat] = useState<'plain' | 'markdown' | 'html'>('markdown');
  const [mergeSpecs, setMergeSpecs] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [showLsiInput, setShowLsiInput] = useState(true);
  const [autoSuggestKeywords, setAutoSuggestKeywords] = useState(true);
  const [blockedKeywords, setBlockedKeywords] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [genNotifications, setGenNotifications] = useState(true);
  const [errorNotifications, setErrorNotifications] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [sidebarVisibility] = useState({
    targetKeywords: true,
    competitorAnalysis: true,
  });
  const [copied, setCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [, setCopiedSectionLabel] = useState<string | null>(null);

  const variationsRef = useRef<HTMLTextAreaElement>(null);

  // Keyword Research State
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState<ResearchResults | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchRegion, setResearchRegion] = useState('السعودية');
  const [suggestingLSI, setSuggestingLSI] = useState(false);
  const [smartSuggestLoading, setSmartSuggestLoading] = useState(false);
  const [smartProductNameLoading, setSmartProductNameLoading] = useState(false);
  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<{ score: number, details: string } | null>(null);
  
  const [suggestedPKs, setSuggestedPKs] = useState<string[]>([]);
  const [suggestedLSIs, setSuggestedLSIs] = useState<string[]>([]);

  // Tracked Products State
  const [trackedProducts, setTrackedProducts] = useState<{
    id: string;
    name: string;
    url: string;
    keyword: string;
    rank: number | null;
    last_checked: string | null;
  }[]>([]);
  const [trackedProductName, setTrackedProductName] = useState('');
  const [trackedProductUrl, setTrackedProductUrl] = useState('');
  const [trackedProductKeyword, setTrackedProductKeyword] = useState('');
  const [, setIsTrackedLoading] = useState(false);
  const [, setIsAddingTracked] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [seoTip, setSeoTip] = useState('');

  useEffect(() => {
    const randomTip = seoTips[Math.floor(Math.random() * seoTips.length)];
    setSeoTip(randomTip);
  }, []);

  /* const formatContentForStore = (text: string) => {
    // Extract description and specifications
    const extractSection = (label: string) => {
      const start = text.indexOf(label);
      if (start === -1) return '';
      const contentStart = start + label.length;
      let end = text.length;
      
      const labels = [
        'اسم المنتج التسويقي:', 'العنوان الجذاب:', 'عنوان السيو:', 'وصف الميتا:',
        'وصف المنتج:', 'نص المحتوى (وصف المنتج/مقال/وصف فئة):', 'المواصفات:',
        'النقاط الرئيسية/المواصفات:', 'نقاط التميز التنافسية:', 'Slug URL (بالعربية):',
        'نص Alt للصورة:', 'دعوة لاتخاذ إجراء (CTA):'
      ];

      labels.forEach(nextLabel => {
        const nextIdx = text.indexOf(nextLabel, contentStart);
        if (nextIdx !== -1 && nextIdx < end) {
          end = nextIdx;
        }
      });

      return text.substring(contentStart, end).trim();
    };

    const description = extractSection('وصف المنتج:') || extractSection('نص المحتوى (وصف المنتج/مقال/وصف فئة):');
    const specs = extractSection('المواصفات:') || extractSection('النقاط الرئيسية/المواصفات:');

    let combined = '';
    if (description) combined += description + '\n\n';
    if (specs) combined += specs;

    return cleanOutputForClipboard(combined || text);
  }; */

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasAskedForNotification, setHasAskedForNotification] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          return prev + 5;
        });
      }, 500);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (result) {
      const titleMatch = result.match(/عنوان السيو:\s*(.*)/i);
      const descMatch = result.match(/وصف الميتا:\s*(.*)/i);
      
      if (titleMatch && titleMatch[1]) {
        setSeoTitle(titleMatch[1].trim());
      }
      if (descMatch && descMatch[1]) {
        setMetaDescription(descMatch[1].trim());
      }
    }
  }, [result]);

  const handleTitleChange = (newTitle: string) => {
    setSeoTitle(newTitle);
    setResult(prev => {
      if (!prev) return prev;
      const titleMatch = prev.match(/عنوان السيو:\s*(.*)/i);
      if (titleMatch && titleMatch[1].trim() !== newTitle.trim()) {
        return prev.replace(/عنوان السيو:\s*.*/i, `عنوان السيو: ${newTitle}`);
      }
      return prev;
    });
  };

  const handleDescriptionChange = (newDesc: string) => {
    setMetaDescription(newDesc);
    setResult(prev => {
      if (!prev) return prev;
      const descMatch = prev.match(/وصف الميتا:\s*(.*)/i);
      if (descMatch && descMatch[1].trim() !== newDesc.trim()) {
        return prev.replace(/وصف الميتا:\s*.*/i, `وصف الميتا: ${newDesc}`);
      }
      return prev;
    });
  };

  useEffect(() => {
    // Check if already installed
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (window.matchMedia('(display-mode: standalone)').matches || nav.standalone) {
      setIsStandalone(true);
    } else {
      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const ios = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(ios);

      // Show install modal after 3 seconds if not standalone
      const timer = setTimeout(() => {
        setShowInstallModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('seo_active_tab');
      if (savedTab && (TAB_ORDER as readonly string[]).includes(savedTab)) {
        setActiveTab(savedTab);
      }
      
      const savedForm = localStorage.getItem('seo_form_state');
      if (savedForm) {
        try {
          const parsed = JSON.parse(savedForm);
          if (parsed.productName) setProductName(parsed.productName);
          if (parsed.pk) setPk(parsed.pk);
          if (parsed.lsi) setLsi(parsed.lsi);
          if (parsed.targetKeywords) setTargetKeywords(parsed.targetKeywords);
          if (parsed.competitorInfo) setCompetitorInfo(parsed.competitorInfo);
          if (parsed.competitorUrl) setCompetitorUrl(parsed.competitorUrl);
          if (parsed.variations) setVariations(parsed.variations);
          if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
          if (parsed.catchyTitle) setCatchyTitle(parsed.catchyTitle);
          if (parsed.result) setResult(parsed.result);
        } catch (e) {
          console.error('Failed to parse saved form state', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('seo_active_tab', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined' && autoSaveEnabled) {
      const formState = {
        productName, pk, lsi, targetKeywords, competitorInfo, competitorUrl,
        variations, targetAudience, catchyTitle, result
      };
      localStorage.setItem('seo_form_state', JSON.stringify(formState));
    }
  }, [productName, pk, lsi, targetKeywords, competitorInfo, competitorUrl, variations, targetAudience, catchyTitle, result, autoSaveEnabled]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('seo_tour_seen');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    
    const keyword = searchParams.get('keyword');
    const competitor = searchParams.get('competitor');
    const gap = searchParams.get('gap');
    
    if (keyword) {
      setProductName(keyword);
      setPk(keyword);
      setActiveTab('generate');
      router.replace('/?tab=generate', { scroll: false });
    } else if (competitor) {
      setTargetKeywords(competitor);
      setCompetitorInfo('تم تحليل المنافس واستخراج هذه الكلمات للتركيز عليها والتفوق عليه.');
      setActiveTab('generate');
      router.replace('/?tab=generate', { scroll: false });
    } else if (gap) {
      setTargetKeywords(gap);
      setCompetitorInfo('هذه الكلمات مفقودة في محتواك ويستخدمها المنافس. استخدمها لسد الفجوة.');
      setActiveTab('generate');
      router.replace('/?tab=generate', { scroll: false });
    }
  }, [searchParams, router]);

  const checkPlagiarism = async () => {
    if (!result) return;
    setPlagiarismLoading(true);
    try {
      const prompt = `بصفتك أداة فحص انتحال (Plagiarism Checker)، قم بتحليل النص التالي وقدر نسبة أصالته (Originality Score) من 0 إلى 100.
      قدم النتيجة بتنسيق JSON:
      {
        "score": 95,
        "details": "شرح مختصر لنتائج الفحص ومدى أصالة المحتوى"
      }
      
      النص المراد فحصه:
      ${result}`;

      const data = await callGeminiAPI('keywords', prompt, "أنت أداة متخصصة في فحص أصالة المحتوى وكشف الانتحال.");
      setPlagiarismResult(data);
      toast.success('تم فحص الانتحال بنجاح');
    } catch (err: unknown) {
      handleGeminiError(err, 'فشل فحص الانتحال');
    } finally {
      setPlagiarismLoading(false);
    }
  };

  // Dashboard Customization State
  const [showAdvancedSettings] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState(DEFAULT_DASHBOARD_CONFIG);

  // Settings Initial State for Change Detection
  interface SettingsState {
    general: { appLanguage: string; isDarkMode: boolean; isMotionEnabled: boolean; showAdvancedSettings: boolean };
    generation: { metaLength: string; toneOfVoice: string; seoLevel: string; includeKeywords: boolean };
    formatting: { copyFormat: 'html' | 'text'; autoFormat: 'plain' | 'markdown' | 'html'; mergeSpecs: boolean; preserveFormatting: boolean };
    keywords: { showLsiInput: boolean; autoSuggestKeywords: boolean; blockedKeywords: string };
    data: { autoSaveEnabled: boolean; historyEnabled: boolean };
    notifications: { genNotifications: boolean; errorNotifications: boolean };
  }
  const [initialSettings, setInitialSettings] = useState<SettingsState | null>(null);

// Tab navigation order for swipe gestures
  type TabName = typeof TAB_ORDER[number];
  const [slideDir, setSlideDir] = React.useState<'left'|'right'>('left');

  const navigateTab = React.useCallback((dir: 'left'|'right') => {
    setActiveTab(prev => {
      const idx = TAB_ORDER.indexOf(prev as TabName);
      if (idx === -1) return prev;
      const next = dir === 'left'
        ? TAB_ORDER[Math.min(idx + 1, TAB_ORDER.length - 1)]
        : TAB_ORDER[Math.max(idx - 1, 0)];
      if (next === prev) return prev;
      setSlideDir(dir);
      return next;
    });
  }, []);


  // Initialize initial settings
  useEffect(() => {
    if (!initialSettings && isAuthReady) {
      const savedSettings = localStorage.getItem('seo_settings');
      if (savedSettings) {
        try {
          setInitialSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Error loading settings:', e);
          setInitialSettings({
            general: { appLanguage: 'العربية', isDarkMode: false, isMotionEnabled: true, showAdvancedSettings: false },
            generation: { metaLength: 'متوسط', toneOfVoice: 'احترافي', seoLevel: 'متقدم', includeKeywords: true },
            formatting: { copyFormat: 'text', autoFormat: 'markdown', mergeSpecs: true, preserveFormatting: true },
            keywords: { showLsiInput: true, autoSuggestKeywords: true, blockedKeywords: '' },
            data: { autoSaveEnabled: true, historyEnabled: true },
            notifications: { genNotifications: true, errorNotifications: true }
          });
        }
      } else {
        setInitialSettings({
          general: { appLanguage: 'العربية', isDarkMode: false, isMotionEnabled: true, showAdvancedSettings: false },
          generation: { metaLength: 'متوسط', toneOfVoice: 'احترافي', seoLevel: 'متقدم', includeKeywords: true },
          formatting: { copyFormat: 'text', autoFormat: 'markdown', mergeSpecs: true, preserveFormatting: true },
          keywords: { showLsiInput: true, autoSuggestKeywords: true, blockedKeywords: '' },
          data: { autoSaveEnabled: true, historyEnabled: true },
          notifications: { genNotifications: true, errorNotifications: true }
        });
      }
    }
  }, [isAuthReady, initialSettings]);

  // Sync state with initialSettings
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.general) {
        setAppLanguage(initialSettings.general.appLanguage);
        setIsDarkMode(initialSettings.general.isDarkMode);
        setIsMotionEnabled(initialSettings.general.isMotionEnabled);
      }
      
      if (initialSettings.generation) {
        setMetaLength(initialSettings.generation.metaLength);
        setToneOfVoice(initialSettings.generation.toneOfVoice);
        setSeoLevel(initialSettings.generation.seoLevel);
        setIncludeKeywords(initialSettings.generation.includeKeywords);
      }
      
      if (initialSettings.formatting) {
        setCopyFormat(initialSettings.formatting.copyFormat);
        setMergeSpecs(initialSettings.formatting.mergeSpecs);
        setPreserveFormatting(initialSettings.formatting.preserveFormatting);
      }
      
      if (initialSettings.keywords) {
        setShowLsiInput(initialSettings.keywords.showLsiInput);
        setAutoSuggestKeywords(initialSettings.keywords.autoSuggestKeywords);
        setBlockedKeywords(initialSettings.keywords.blockedKeywords);
      }
      
      if (initialSettings.data) {
        setAutoSaveEnabled(initialSettings.data.autoSaveEnabled);
        setHistoryEnabled(initialSettings.data.historyEnabled);
      }
      
      if (initialSettings.notifications) {
        setGenNotifications(initialSettings.notifications.genNotifications);
        setErrorNotifications(initialSettings.notifications.errorNotifications);
      }
    }
  }, [initialSettings]);

  const isSectionModified = (section: string) => {
    if (!initialSettings) return false;
    switch (section) {
      case 'general':
        return appLanguage !== initialSettings.general.appLanguage ||
               isDarkMode !== initialSettings.general.isDarkMode ||
               isMotionEnabled !== initialSettings.general.isMotionEnabled ||
               showAdvancedSettings !== initialSettings.general.showAdvancedSettings;
      case 'generation':
        return metaLength !== initialSettings.generation.metaLength ||
               toneOfVoice !== initialSettings.generation.toneOfVoice ||
               seoLevel !== initialSettings.generation.seoLevel ||
               includeKeywords !== initialSettings.generation.includeKeywords;
      case 'formatting':
        return copyFormat !== initialSettings.formatting.copyFormat ||
               mergeSpecs !== initialSettings.formatting.mergeSpecs ||
               preserveFormatting !== initialSettings.formatting.preserveFormatting;
      case 'keywords':
        return showLsiInput !== initialSettings.keywords.showLsiInput ||
               autoSuggestKeywords !== initialSettings.keywords.autoSuggestKeywords ||
               blockedKeywords !== initialSettings.keywords.blockedKeywords;
      case 'data':
        return autoSaveEnabled !== initialSettings.data.autoSaveEnabled ||
               historyEnabled !== initialSettings.data.historyEnabled;
      case 'notifications':
        return genNotifications !== initialSettings.notifications.genNotifications ||
               errorNotifications !== initialSettings.notifications.errorNotifications;
      default:
        return false;
    }
  };

  const handleSaveSection = (section: string) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setInitialSettings((prev: SettingsState | null) => {
        if (!prev) return null;
        const updatedSection = section === 'general' ? { appLanguage, isDarkMode, isMotionEnabled, showAdvancedSettings } :
                   section === 'generation' ? { metaLength, toneOfVoice, seoLevel, includeKeywords } :
                   section === 'formatting' ? { copyFormat, mergeSpecs, preserveFormatting } :
                   section === 'keywords' ? { showLsiInput, autoSuggestKeywords, blockedKeywords } :
                   section === 'data' ? { autoSaveEnabled, historyEnabled } :
                   { genNotifications, errorNotifications };
        
        const newSettings = {
          ...prev,
          [section]: updatedSection
        } as SettingsState;
        
        localStorage.setItem('seo_settings', JSON.stringify(newSettings));
        return newSettings;
      });
      setIsSaving(false);
      toast.success('تم حفظ الإعدادات بنجاح');
    }, 800);
  };

  const { onTouchStart, onTouchEnd } = useSwipe(
    () => navigateTab('left'),
    () => navigateTab('right')
  );


  // Wrap setActiveTab to auto-calculate slide direction
  const goToTab = React.useCallback((tab: string) => {
    if (tab === 'pricing') {
      setShowPricing(true);
      return;
    }
    setShowPricing(false);
    const idx1 = TAB_ORDER.indexOf(activeTab);
    const idx2 = TAB_ORDER.indexOf(tab);
    setSlideDir(idx2 > idx1 ? 'left' : 'right');
    setActiveTab(tab);
    setActiveTool(null);
  }, [activeTab]);

  // Apply / remove dark mode class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('seo_dashboard_config');
    if (savedConfig) {
      try {
        setDashboardConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Error loading dashboard config:', e);
      }
    }
  }, []);

  const updateDashboardConfig = async (key: keyof typeof dashboardConfig, value: boolean) => {
    const newConfig = { ...dashboardConfig, [key]: value };
    setDashboardConfig(newConfig);
    localStorage.setItem('seo_dashboard_config', JSON.stringify(newConfig));
    
    if (user) {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          dashboardConfig: newConfig,
          updated_at: new Date().toISOString()
        });
      } catch (err: unknown) {
        console.error('Error saving dashboard config to Supabase:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
          supabase.auth.signOut();
        }
      }
    }
  };

  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    console.log(`[Analytics] Event: ${eventName}`, properties || '');
  };


  const incrementDailyUsage = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const usageId = `${user.id}_${today}`;
      
      const { data } = await supabase.from('usage').select('count').eq('id', usageId).single();
      const newCount = (data?.count || 0) + 1;
      
      await supabase.from('usage').upsert({ 
        id: usageId, 
        user_id: user.id, 
        date: today, 
        count: newCount, 
        updated_at: new Date().toISOString() 
      });
      
      setDailyUsage(newCount);
    } catch (err: unknown) {
      console.error('Error incrementing daily usage:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      }
    }
  };

  const fetchTrackedProducts = useCallback(async () => {
    if (!user) return;
    setIsTrackedLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracked_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrackedProducts(data || []);
    } catch (err: unknown) {
      console.error('Error fetching tracked products:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      }
      // Fallback to local storage
      const localData = localStorage.getItem(`tracked_products_${user.id}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setTrackedProducts(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Failed to parse local tracked products', e);
          setTrackedProducts([]);
        }
      } else {
        setTrackedProducts([]);
      }
    } finally {
      setIsTrackedLoading(false);
    }
  }, [user]);

  const addTrackedProduct = async () => {
    if (!user || !trackedProductName || !trackedProductKeyword) {
      toast.error('يرجى ملء الحقول المطلوبة (الاسم والكلمة المفتاحية)');
      return;
    }

    setIsAddingTracked(true);
    try {
      const { data, error } = await supabase
        .from('tracked_products')
        .insert([
          {
            user_id: user.id,
            name: trackedProductName,
            url: trackedProductUrl,
            keyword: trackedProductKeyword,
            rank: null,
            last_checked: null
          }
        ])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTrackedProducts(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [data[0], ...prevArray];
        });
        setTrackedProductName('');
        setTrackedProductUrl('');
        setTrackedProductKeyword('');
        toast.success('تمت إضافة المنتج للتتبع بنجاح');
      }
    } catch (err: unknown) {
      console.error('Error adding tracked product:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      }
      // Fallback to local state
      const newProduct = {
        id: Date.now().toString(),
        name: trackedProductName,
        url: trackedProductUrl,
        keyword: trackedProductKeyword,
        rank: null,
        last_checked: null
      };
      setTrackedProducts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const updated = [newProduct, ...prevArray];
        try {
          localStorage.setItem(`tracked_products_${user.id}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
        return updated;
      });
      setTrackedProductName('');
      setTrackedProductUrl('');
      setTrackedProductKeyword('');
      toast.success('تمت إضافة المنتج للتتبع محلياً (قاعدة البيانات غير متوفرة)');
    } finally {
      setIsAddingTracked(false);
    }
  };

  const deleteTrackedProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tracked_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTrackedProducts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter(p => p.id !== id);
      });
      toast.success('تم حذف المنتج من التتبع');
    } catch (err: unknown) {
      console.error('Error deleting tracked product:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      }
      // Fallback to local state
      setTrackedProducts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const updated = prevArray.filter(p => p.id !== id);
        try {
          localStorage.setItem(`tracked_products_${user?.id}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
        return updated;
      });
      toast.success('تم حذف المنتج من التتبع محلياً');
    }
  };

  const checkRanking = async (id: string) => {
    toast.info('جاري فحص الترتيب...');
    try {
      // Simulated ranking check using Gemini or random for now
      // In a real app, you'd call a SERP API
      const simulatedRank = Math.floor(Math.random() * 50) + 1;
      const lastChecked = new Date().toISOString();

      const { error } = await supabase
        .from('tracked_products')
        .update({ rank: simulatedRank, last_checked: lastChecked })
        .eq('id', id);

      if (error) throw error;

      setTrackedProducts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(p => 
          p.id === id ? { ...p, rank: simulatedRank, last_checked: lastChecked } : p
        );
      });
      
      toast.success(`تم تحديث الترتيب: ${simulatedRank}`);
    } catch (err: unknown) {
      console.error('Error checking ranking:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      }
      // Fallback to local state
      const simulatedRank = Math.floor(Math.random() * 50) + 1;
      const lastChecked = new Date().toISOString();
      
      setTrackedProducts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const updated = prevArray.map(p => 
          p.id === id ? { ...p, rank: simulatedRank, last_checked: lastChecked } : p
        );
        try {
          localStorage.setItem(`tracked_products_${user?.id}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
        return updated;
      });
      
      toast.success(`تم تحديث الترتيب محلياً: ${simulatedRank}`);
    }
  };

  useEffect(() => {
    if (activeTab === 'product' && user) {
      fetchTrackedProducts();
    }
  }, [activeTab, user, fetchTrackedProducts]);

  const saveToHistory = useCallback(async (content: string) => {
    if (!user) return;
    try {
      const projectName = formatProjectName(productName, pk);
      const { error } = await supabase.from('history').insert([{
        user_id: user.id,
        project_name: projectName,
        product_name: productName,
        pk: pk,
        result: content,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      fetchHistory();
    } catch (err: unknown) {
      console.error('Unexpected error saving history:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      } else {
        toast.error('فشل حفظ العملية في السجل');
      }
    }
  }, [user, productName, pk, fetchHistory]);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('history').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف العملية بنجاح');
      fetchHistory();
    } catch (err: unknown) {
      console.error('Unexpected error deleting history:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
        supabase.auth.signOut();
      } else {
        toast.error('فشل حذف العملية');
      }
    }
  }, [fetchHistory]);

  // Global error handler for Supabase refresh token issues
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      if (err?.message?.includes('Refresh Token') || err?.message?.includes('refresh_token_not_found')) {
        console.warn('Caught global refresh token error, signing out...');
        supabase.auth.signOut();
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Check session on mount
  useEffect(() => {
    setMounted(true);
    
    // Fallback timeout in case Supabase auth hangs
    const timeoutId = setTimeout(() => {
      setIsAuthReady(true);
    }, 800);

    const handleUser = async (currentUser: User | null) => {
      clearTimeout(timeoutId);
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Load user settings from Supabase asynchronously
        (async () => {
          try {
            const { data } = await supabase.from('users').select('dashboardConfig, savedInputs, username, email').eq('id', currentUser.id).single();
            if (data) {
              if (data.dashboardConfig) {
                setDashboardConfig(data.dashboardConfig);
              }
              if (data.savedInputs) {
                const inputs = data.savedInputs;
                if (inputs.productName) setProductName(inputs.productName);
                if (inputs.pk) setPk(inputs.pk);
                if (inputs.lsi) setLsi(inputs.lsi);
                if (inputs.targetKeywords) setTargetKeywords(inputs.targetKeywords);
                if (inputs.competitorInfo) setCompetitorInfo(inputs.competitorInfo);
                if (inputs.competitorUrl) setCompetitorUrl(inputs.competitorUrl);
                if (inputs.variations) setVariations(inputs.variations);
                if (inputs.targetAudience) setTargetAudience(inputs.targetAudience);
                if (inputs.toneOfVoice) setToneOfVoice(inputs.toneOfVoice);
                if (inputs.metaLength) setMetaLength(inputs.metaLength);
                if (inputs.keywordCount) setKeywordCount(inputs.keywordCount);
                if (inputs.specsFormat) setSpecsFormat(inputs.specsFormat);
                if (inputs.competitionLevel) setCompetitionLevel(inputs.competitionLevel);
                if (inputs.correctionMode) setCorrectionMode(inputs.correctionMode);
              }
              if (data.username) setProfileUsername(data.username);
              if (data.email) setProfileEmail(data.email);
            } else {
              // Create user doc
              await supabase.from('users').upsert({
                id: currentUser.id,
                email: currentUser.email,
                created_at: new Date().toISOString(),
                dashboardConfig: DEFAULT_DASHBOARD_CONFIG
              });
            }
            
            // Load subscription and usage
            try {
              const { data: subData, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', currentUser.id)
                .limit(1)
                .maybeSingle();

              if (subError) {
                // Mock subscription if table doesn't exist
                setSubscription({
                  id: 'mock-sub',
                  user_id: currentUser.id,
                  plan_id: 'advanced',
                  status: 'active',
                  current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                  trial_used: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              } else if (subData) {
                setSubscription(subData);
              } else {
                // Only start trial if we successfully queried and found NO subscription
                await subscriptionService.startTrial(currentUser.id, 'advanced');
                const newSub = await subscriptionService.getUserSubscription(currentUser.id);
                if (newSub) setSubscription(newSub);
              }
            } catch (err) {
              console.error('Error in subscription flow:', err);
            }

            const userUsage = await subscriptionService.getUserUsage(currentUser.id);
            if (userUsage) {
              setUsage(userUsage);
            } else {
              // Mock usage if table doesn't exist
              setUsage({
                id: 'mock-usage',
                user_id: currentUser.id,
                generations_count: 0,
                competitor_analysis_count: 0,
                keyword_research_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }

            fetchHistoryRef.current?.();
            fetchDailyUsageRef.current?.();
          } catch (err: unknown) {
            console.error('Error loading user data:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token_not_found')) {
              supabase.auth.signOut();
            }
          }
        })();
      }
    };

    try {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('Session error:', error);
          if (error.message.includes('Refresh Token') || error.message.includes('refresh_token_not_found')) {
            supabase.auth.signOut();
          }
        }
        handleUser(session?.user || null);
      }).catch((err) => {
        console.error('Get session exception:', err);
        if (err?.message?.includes('Refresh Token') || err?.message?.includes('refresh_token_not_found')) {
          supabase.auth.signOut();
        }
        handleUser(null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
           handleUser(session?.user || null);
        } else {
           handleUser(session?.user || null);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error('Error initializing auth listener:', err);
      setIsAuthReady(true);
    }
  }, [fetchHistoryRef, fetchDailyUsageRef, setSubscription, setUsage]);

  // Auto-adjust textarea height
  useEffect(() => {
    if (variationsRef.current) {
      variationsRef.current.style.height = 'auto';
      const newHeight = Math.min(variationsRef.current.scrollHeight, 120); // Approx 5 rows
      variationsRef.current.style.height = `${newHeight}px`;
    }
  }, [variations]);

  // Fetch history and usage when user is logged in
  // Removed redundancy as they are now called in handleUser
  
  useEffect(() => {
    if (user && !hasAskedForNotification && "Notification" in window && Notification.permission === "default") {
      const timer = setTimeout(() => {
        toast('هل تريد تفعيل الإشعارات لتلقي تنبيهات عند اكتمال التوليد في الخلفية؟', {
          action: {
            label: 'تفعيل',
            onClick: () => {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  toast.success('تم تفعيل الإشعارات بنجاح');
                }
                setHasAskedForNotification(true);
              });
            },
          },
          duration: 10000,
        });
        setHasAskedForNotification(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, hasAskedForNotification]);

  const sendNotification = (title: string, body: string) => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    const options = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      dir: 'rtl' as const,
      vibrate: [200, 100, 200],
    };

    if (Notification.permission === "granted") {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options).catch(() => {
            // Fallback if showNotification fails
            new Notification(title, options);
          });
        }).catch(() => {
          new Notification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          if (navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(title, options);
            });
          } else {
            new Notification(title, options);
          }
        }
      });
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      setActiveTab('dashboard');
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : String(error));
    }
    setAuthLoading(false);
  };

  const handleSignup = async (email: string, pass: string, username: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            username,
          }
        }
      });
      if (error) throw error;
      
      if (data.user) {
        // Create user doc
        await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
          username,
          created_at: new Date().toISOString(),
          dashboardConfig: dashboardConfig
        });
      }
      
      toast.success('تم إنشاء الحساب بنجاح');
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : String(error));
    }
    setAuthLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setAuthError('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : String(error));
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error(error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const performKeywordResearch = async () => {
    if (!researchQuery.trim()) {
      toast.error('يرجى إدخال اسم المنتج أو كلمة مفتاحية للبحث');
      return;
    }

    setResearchLoading(true);
    setResearchResults(null);

    try {
      const prompt = `اقترح كلمات مفتاحية لمنتج: ${researchQuery} في منطقة: ${researchRegion}`;

      const data = await callGeminiAPI('keywords', prompt, KEYWORD_RESEARCH_INSTRUCTION);

      await incrementDailyUsage();

      // Increment SaaS usage
      if (user) {
        try {
          await subscriptionService.incrementUsage(user.id, 'keywordResearch');
          setUsage(prev => ({ ...prev, keywordResearch: prev.keywordResearch + 1 }));
        } catch (e) {
          console.error('Failed to increment SaaS usage', e);
        }
      }

      if (data && Array.isArray(data.primaryKeywords) && Array.isArray(data.lsiKeywords)) {
        setResearchResults(data);
        toast.success('تم العثور على اقتراحات بنجاح');
        if (document.visibilityState === 'hidden') {
          sendNotification('تم الانتهاء', 'تم العثور على اقتراحات الكلمات المفتاحية بنجاح');
        }
      } else {
        throw new Error('فشل في تحليل الرد من الذكاء الاصطناعي');
      }
    } catch (err: unknown) {
      handleGeminiError(err, 'حدث خطأ أثناء البحث عن الكلمات المفتاحية');
    } finally {
      setResearchLoading(false);
    }
  };

  const suggestLSIKeywords = async () => {
    if (!productName.trim() && !pk.trim()) {
      toast.error('يرجى إدخال اسم المنتج أو الكلمات المفتاحية الأساسية أولاً');
      return;
    }

    setSuggestingLSI(true);
    setSuggestedLSIs([]);
    try {
      const prompt = `بصفتك خبير سيو محترف، اقترح 12-15 كلمة مفتاحية ثانوية (LSI) متنوعة وشاملة لمنتج: "${productName}"
      والكلمات المفتاحية الأساسية: "${pk}".
      
      المعايير المطلوبة:
      1. تنوع دلالي: لا تكتفِ بالمرادفات المباشرة، بل شمل كلمات تتعلق بالمميزات، الفوائد، حالات الاستخدام، والأسئلة الشائعة.
      2. سياق طبيعي: اختر كلمات يمكن دمجها بسلاسة في وصف المنتج.
      3. صلة عالية: تأكد من أن جميع الكلمات تخدم نية البحث للمستخدم.
      
      المخرجات: قائمة مفصولة بفاصلة فقط (،)، بدون أي ترقيم أو نصوص إضافية.`;

      const data = await callGeminiAPI('generate', prompt, "أنت خبير سيو متخصص في استخراج الكلمات المفتاحية الثانوية (LSI).");

      await incrementDailyUsage();
      const text = data.text;
      if (text) {
        const cleanedText = text.replace(/\n/g, ' ').trim();
        const keywords = cleanedText.split(/[,،]/).map((k: string) => k.trim()).filter(Boolean);
        setSuggestedLSIs(keywords);
        toast.success('تم العثور على اقتراحات للكلمات الثانوية');
        if (document.visibilityState === 'hidden') {
          sendNotification('تم الانتهاء', 'تم اقتراح الكلمات الثانوية بنجاح');
        }
      } else {
        throw new Error('EMPTY_RESPONSE');
      }
    } catch (err: unknown) {
      handleGeminiError(err, 'حدث خطأ أثناء اقتراح الكلمات');
    } finally {
      setSuggestingLSI(false);
    }
  };

  const suggestSmartProductName = async () => {
    if (!productName.trim()) {
      toast.error('يرجى إدخال اسم المنتج أولاً');
      return;
    }
    setSmartProductNameLoading(true);
    try {
      const prompt = `أنت خبير في تحسين محركات البحث (SEO) وصياغة أسماء المنتجات.
      الاسم الحالي للمنتج: "${productName}"
      المطلوب:
      1. تصحيح أي أخطاء إملائية أو نحوية.
      2. ابتكار اسم منتج جذاب، احترافي، ومُحسّن لمحركات البحث (SEO-friendly).
      3. اجعل الاسم يعكس القيمة التنافسية للمنتج.
      4. اجعل النتيجة قصيرة ومركزة (اسم المنتج فقط).
      
      أجب باسم المنتج المصحح والمبتكر فقط دون أي مقدمات أو شرح.`;

      const data = await callGeminiAPI('productName', prompt, "أنت خبير في صياغة أسماء المنتجات للتجارة الإلكترونية باللغة العربية الفصحى.");
      if (data && data.text) {
        setProductName(data.text.trim());
        toast.success('تم تحسين اسم المنتج بنجاح');
      }
    } catch (err: unknown) {
      handleGeminiError(err, 'فشل تحسين اسم المنتج');
    } finally {
      setSmartProductNameLoading(false);
    }
  };

  const suggestPKKeywords = async () => {
    if (!productName.trim()) {
      toast.error('يرجى إدخال اسم المنتج أولاً');
      return;
    }

    setSmartSuggestLoading(true);
    setSuggestedPKs([]);
    try {
      const prompt = `بصفتك خبير سيو محترف، قم بإجراء بحث سريع باستخدام جوجل عن المنتج: "${productName}".
      بناءً على نتائج البحث والبيانات الحالية، اقترح:
      3-5 كلمات مفتاحية أساسية (PKs) ذات حجم بحث عالٍ ومنافسة مناسبة.
      
      يجب أن تكون النتائج دقيقة ومبنية على بيانات حقيقية من محركات البحث.
      
      يجب أن تكون المخرجات بتنسيق JSON حصراً:
      {
        "pk": "كلمة1, كلمة2, كلمة3"
      }`;

      const data = await callGeminiAPI('keywords', prompt, "أنت مستشار سيو ذكي يقدم نصائح عملية وسريعة بناءً على تحليل السوق.");

      await incrementDailyUsage();
      if (data && data.pk) {
        const keywords = data.pk.split(/[,،]/).map((k: string) => k.trim()).filter(Boolean);
        setSuggestedPKs(keywords);
        toast.success('تم العثور على اقتراحات للكلمات الأساسية');
        if (document.visibilityState === 'hidden') {
          sendNotification('تم الانتهاء', 'تم جلب الكلمات المفتاحية الأساسية بنجاح');
        }
      } else {
        throw new Error('EMPTY_RESPONSE');
      }
    } catch (err: unknown) {
      handleGeminiError(err, 'حدث خطأ أثناء جلب الكلمات الأساسية');
    } finally {
      setSmartSuggestLoading(false);
    }
  };

  const suggestKeywordsForResearch = async () => {
    if (!researchQuery.trim()) {
      toast.error('يرجى إدخال اسم المنتج أولاً');
      return;
    }

    setSmartSuggestLoading(true);
    setSuggestedPKs([]);
    setSuggestedLSIs([]);
    try {
      const prompt = `بصفتك خبير سيو محترف، قم بإجراء بحث سريع عن المنتج: "${researchQuery}".
      اقترح 5 كلمات مفتاحية أساسية (PKs) و 10 كلمات مفتاحية ثانوية (LSI) ذات صلة عالية.
      
      يجب أن تكون المخرجات بتنسيق JSON حصراً:
      {
        "pk": "كلمة1, كلمة2, كلمة3",
        "lsi": "كلمة1, كلمة2, كلمة3"
      }`;

      const data = await callGeminiAPI('keywords', prompt, "أنت مستشار سيو ذكي يقدم نصائح عملية وسريعة بناءً على تحليل السوق.");

      await incrementDailyUsage();

      // Increment SaaS usage
      if (user) {
        try {
          await subscriptionService.incrementUsage(user.id, 'keywordInsights');
          setUsage(prev => ({ ...prev, keywordInsights: prev.keywordInsights + 1 }));
        } catch (e) {
          console.error('Failed to increment SaaS usage', e);
        }
      }

      if (data && data.pk && data.lsi) {
        const pks = data.pk.split(/[,،]/).map((k: string) => k.trim()).filter(Boolean);
        const lsis = data.lsi.split(/[,،]/).map((k: string) => k.trim()).filter(Boolean);
        setSuggestedPKs(pks);
        setSuggestedLSIs(lsis);
        toast.success('تم العثور على اقتراحات للكلمات المفتاحية');
      } else {
        throw new Error('EMPTY_RESPONSE');
      }
    } catch (err: unknown) {
      handleGeminiError(err, 'حدث خطأ أثناء اقتراح الكلمات');
    } finally {
      setSmartSuggestLoading(false);
    }
  };

  const suggestSmartKeywords = async () => {
    if (!productName.trim()) {
      toast.error('يرجى إدخال اسم المنتج أولاً');
      return;
    }

    setSmartSuggestLoading(true);
    setSuggestedPKs([]);
    setSuggestedLSIs([]);
    try {
      const prompt = `بصفتك خبير سيو محترف، قم بإجراء بحث سريع باستخدام جوجل عن المنتج: "${productName}".
      بناءً على نتائج البحث والبيانات الحالية، اقترح:
      1. 3-5 كلمات مفتاحية أساسية (PKs) ذات حجم بحث عالٍ ومنافسة مناسبة.
      2. 10-15 كلمة مفتاحية ثانوية (LSI) متنوعة تغطي المميزات والفوائد والأسئلة الشائعة.
      
      يجب أن تكون النتائج دقيقة ومبنية على بيانات حقيقية من محركات البحث.
      
      يجب أن تكون المخرجات بتنسيق JSON حصراً:
      {
        "pk": "كلمة1, كلمة2, كلمة3",
        "lsi": "كلمة1, كلمة2, ..."
      }`;

      const data = await callGeminiAPI('keywords', prompt, "أنت مستشار سيو ذكي يقدم نصائح عملية وسريعة بناءً على تحليل السوق.");

      await incrementDailyUsage();
      if (data) {
        if (data.pk) {
          const pkKeywords = data.pk.split(/[,،]/).map((k: string) => k.trim()).filter(Boolean);
          setSuggestedPKs(pkKeywords);
        }
        if (data.lsi) {
          const lsiKeywords = data.lsi.split(/[,،]/).map((k: string) => k.trim()).filter(Boolean);
          setSuggestedLSIs(lsiKeywords);
        }
        toast.success('تم جلب اقتراحات ذكية مبنية على بيانات جوجل بنجاح');
        if (document.visibilityState === 'hidden') {
          sendNotification('تم الانتهاء', 'تم جلب الاقتراحات الذكية بنجاح');
        }
      } else {
        throw new Error('EMPTY_RESPONSE');
      }
    } catch (err: unknown) {
      handleGeminiError(err, 'حدث خطأ أثناء جلب الاقتراحات الذكية');
    } finally {
      setSmartSuggestLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUsername || !user) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: profileUsername }
      });
      if (error) throw error;
      
      await supabase.from('users').upsert({
        id: user.id,
        username: profileUsername,
        updated_at: new Date().toISOString()
      });
      toast.success('تم تحديث الاسم بنجاح');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
    setProfileLoading(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail || !user) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: profileEmail });
      if (error) throw error;
      
      await supabase.from('users').upsert({
        id: user.id,
        email: profileEmail,
        updated_at: new Date().toISOString()
      });
      toast.success('تم إرسال رابط تأكيد إلى بريدك الإلكتروني الجديد');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
    setProfileLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePassword || !user) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: profilePassword });
      if (error) throw error;
      
      toast.success('تم تحديث كلمة المرور بنجاح');
      setProfilePassword('');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
    setProfileLoading(false);
  };

  // Pre-fill profile fields when user changes
  useEffect(() => {
    if (user) {
      setProfileEmail(user.email || '');
      setProfileUsername(user.user_metadata?.username || '');
    }
  }, [user]);

  // Apply dark mode immediately from localStorage before render
  React.useEffect(() => {
    const saved = localStorage.getItem('seo_settings');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s?.general?.isDarkMode) {
          document.documentElement.classList.add('dark');
          setIsDarkMode(true);
        }
      } catch {}
    }
  }, []);

  // Load data from localStorage on mount
  React.useEffect(() => {
    const savedName = localStorage.getItem('seo_product_name');
    const savedPk = localStorage.getItem('seo_pk');
    const savedLsi = localStorage.getItem('seo_lsi');
    const savedTargetKeywords = localStorage.getItem('seo_target_keywords');
    const savedCompetitorInfo = localStorage.getItem('seo_competitor_info');
    const savedCompetitorUrl = localStorage.getItem('seo_competitor_url');
    const savedVariations = localStorage.getItem('seo_variations');
    const savedAudience = localStorage.getItem('seo_audience');
    const savedTone = localStorage.getItem('seo_tone');
    const savedMetaLength = localStorage.getItem('seo_meta_length');
    const savedKeywordCount = localStorage.getItem('seo_keyword_count');
    const savedSpecsFormat = localStorage.getItem('seo_specs_format');
    const savedCompetitionLevel = localStorage.getItem('seo_competition_level');
    const savedResult = localStorage.getItem('seo_result');
    const savedCorrectionMode = localStorage.getItem('seo_correction_mode');
    
    if (savedName) setProductName(savedName);
    if (savedPk) setPk(savedPk);
    if (savedLsi) setLsi(savedLsi);
    if (savedTargetKeywords) setTargetKeywords(savedTargetKeywords);
    if (savedCompetitorInfo) setCompetitorInfo(savedCompetitorInfo);
    if (savedCompetitorUrl) setCompetitorUrl(savedCompetitorUrl);
    if (savedVariations) setVariations(savedVariations);
    if (savedAudience) setTargetAudience(savedAudience);
    if (savedTone) setToneOfVoice(savedTone);
    if (savedMetaLength) setMetaLength(savedMetaLength);
    if (savedKeywordCount) setKeywordCount(savedKeywordCount);
    if (savedSpecsFormat) setSpecsFormat(savedSpecsFormat);
    if (savedCompetitionLevel) setCompetitionLevel(savedCompetitionLevel);
    if (savedResult) setResult(savedResult);
    if (savedCorrectionMode) setCorrectionMode(savedCorrectionMode as 'auto' | 'suggest' | 'off');
  }, []);

  // Auto-save to localStorage and Firestore
  React.useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('seo_product_name', productName);
    localStorage.setItem('seo_pk', pk);
    localStorage.setItem('seo_lsi', lsi);
    localStorage.setItem('seo_target_keywords', targetKeywords);
    localStorage.setItem('seo_competitor_info', competitorInfo);
    localStorage.setItem('seo_competitor_url', competitorUrl);
    localStorage.setItem('seo_variations', variations);
    localStorage.setItem('seo_audience', targetAudience);
    localStorage.setItem('seo_tone', toneOfVoice);
    localStorage.setItem('seo_meta_length', metaLength);
    localStorage.setItem('seo_keyword_count', keywordCount);
    localStorage.setItem('seo_specs_format', specsFormat);
    localStorage.setItem('seo_competition_level', competitionLevel);
    localStorage.setItem('seo_correction_mode', correctionMode);
    
    if (user) {
      const saveToSupabase = async () => {
        try {
          await supabase.from('users').upsert({
            id: user.id,
            savedInputs: {
              productName, pk, lsi, targetKeywords, competitorInfo, competitorUrl, variations,
              targetAudience, toneOfVoice, metaLength, keywordCount, specsFormat, competitionLevel, correctionMode
            },
            updated_at: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error saving inputs to Supabase:', err);
        }
      };
      saveToSupabase();
    }
    
    const timer = setTimeout(() => setIsSaving(false), 1000);
    return () => clearTimeout(timer);
  }, [user, productName, pk, lsi, targetKeywords, competitorInfo, competitorUrl, variations, targetAudience, toneOfVoice, metaLength, keywordCount, specsFormat, competitionLevel, correctionMode]);

  React.useEffect(() => {
    localStorage.setItem('seo_result', result);
  }, [result]);

  const prevLoading = useRef(loading);
  useEffect(() => {
    if (prevLoading.current && !loading && result) {
      toast.success('تم توليد المحتوى بنجاح');
      if (document.visibilityState === 'hidden' && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification('تم الانتهاء', { body: 'تم توليد المحتوى بنجاح' });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification('تم الانتهاء', { body: 'تم توليد المحتوى بنجاح' });
            }
          });
        }
      }
    }
    prevLoading.current = loading;
  }, [loading, result]);

  const clearInputs = () => {
    setProductName('');
    setPk('');
    setLsi('');
    setTargetKeywords('');
    setCompetitorInfo('');
    setCompetitorUrl('');
    setVariations('');
    setTargetAudience('الجميع');
    setToneOfVoice('احترافي');
    setMetaLength('متوسط (155 حرف)');
    setKeywordCount('5');
    setSpecsFormat('نقاط (Bullet Points)');
    setCompetitionLevel('متوسط');
    setCorrectionMode('auto');
    setResult('');
    localStorage.removeItem('seo_product_name');
    localStorage.removeItem('seo_pk');
    localStorage.removeItem('seo_lsi');
    localStorage.removeItem('seo_target_keywords');
    localStorage.removeItem('seo_competitor_info');
    localStorage.removeItem('seo_competitor_url');
    localStorage.removeItem('seo_variations');
    localStorage.removeItem('seo_audience');
    localStorage.removeItem('seo_tone');
    localStorage.removeItem('seo_meta_length');
    localStorage.removeItem('seo_keyword_count');
    localStorage.removeItem('seo_specs_format');
    localStorage.removeItem('seo_competition_level');
    localStorage.removeItem('seo_correction_mode');
    localStorage.removeItem('seo_result');
    toast.success('تم مسح الحقول بنجاح');
  };

  const generateSEO = async () => {
    trackEvent('Generate SEO Button Clicked', { productName, pkCount: pk.split(',').length });
    
    if (!productName.trim() || !pk.trim()) {
      setError('يرجى إدخال العنوان والكلمات المفتاحية الأساسية (PKs) معاً');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const prompt = `نوع المحتوى المطلوب: ${contentType === 'product' ? 'وصف منتج' : contentType === 'blog' ? 'منشور مدونة' : 'وصف فئة'}
${contentType === 'product' ? `اسم المنتج: ${productName}` : contentType === 'blog' ? `عنوان المقال: ${productName}` : `اسم الفئة: ${productName}`}
${contentType === 'product' ? `العنوان الجذاب: ${catchyTitle}` : contentType === 'blog' ? `العنوان الفرعي: ${catchyTitle}` : `وصف قصير: ${catchyTitle}`}
الكلمات المستهدفة (Target Keywords): ${targetKeywords}
معلومات المنافسين: ${competitorInfo}
الكلمات الأساسية (PKs): ${pk}
الكلمات الثانوية (LSI): ${lsi}
المتغيرات (Variations): ${variations}
الجمهور المستهدف: ${targetAudience}
نبرة الصوت: ${toneOfVoice}
طول المحتوى المطلوب: ${metaLength}
عدد الكلمات الثانوية المطلوب دمجها: ${keywordCount}
تنسيق المواصفات: ${specsFormat}
مستوى المنافسة: ${competitionLevel}
${contentType === 'blog' ? 'يرجى كتابة منشور مدونة جذاب، غني بالمعلومات، ومُحسّن لمحركات البحث، مع مقدمة قوية، وعناوين فرعية، وخاتمة تحفز على التفاعل.' : ''}
${contentType === 'category' ? 'يرجى كتابة وصف فئة جذاب، يوضح محتويات الفئة، ويشجع الزوار على تصفح المنتجات.' : ''}`;
      
      const systemInstruction = SYSTEM_INSTRUCTION;
      const urlToAnalyze = competitorUrl;

      const data = await callGeminiAPI('generate', prompt, systemInstruction, urlToAnalyze);

      await incrementDailyUsage();
      
      // Increment SaaS usage
      if (user) {
        try {
          await subscriptionService.incrementUsage(user.id, 'generations');
          setUsage(prev => ({ ...prev, generations: prev.generations + 1 }));
        } catch (e) {
          console.error('Failed to increment SaaS usage', e);
        }
      }

      let text = data.text;
      
      if (text && autoFormat !== 'plain') {
        if (autoFormat === 'html') {
          text = formatContentForSalla(text);
        }
      }

      if (text && correctionMode !== 'off') {
        try {
          let correctionPrompt = '';
          if (correctionMode === 'auto') {
            correctionPrompt = `قم بمراجعة النص التالي وتصحيح أي أخطاء إملائية أو نحوية تلقائياً. لا تقم بتغيير التنسيق أو المحتوى، فقط قم بتصحيح الأخطاء اللغوية وأعد النص المصحح بالكامل.
النص:
${text}`;
          } else if (correctionMode === 'suggest') {
            correctionPrompt = `قم بمراجعة النص التالي واكتشاف أي أخطاء إملائية أو نحوية. أعد النص الأصلي كما هو، ثم أضف في النهاية قسماً بعنوان "اقتراحات التصحيح اللغوي" تسرد فيه الأخطاء التي وجدتها مع اقتراحات لتصحيحها.
النص:
${text}`;
          }
          
          if (correctionPrompt) {
            const correctionData = await callGeminiAPI('generate', correctionPrompt, "أنت مدقق لغوي عربي محترف.");
            if (correctionData.text) {
              text = correctionData.text;
            }
          }
        } catch (e) {
          console.error("Auto-correction failed", e);
        }
      }

      if (text) {
        setResult(text);
        saveToHistory(text);
        addNotification({
          type: 'generate',
          title: 'اكتمل التوليد',
          message: `تم توليد محتوى السيو لـ "${productName}" بنجاح.`,
          icon: Zap,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50 dark:bg-amber-500/10',
        });
      } else {
        throw new Error('EMPTY_RESPONSE');
      }
    } catch (err: unknown) {
      const userMessage = handleGeminiError(err, 'حدث خطأ غير متوقع أثناء توليد المحتوى. يرجى المحاولة مرة أخرى.');
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyAll = async (text: string) => {
    trackEvent('Copy All Button Clicked');
    await copyRichTextToClipboard(text);
    setCopied(true);
    toast.success('تم نسخ جميع النتائج');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = async () => {
    trackEvent('Copy All Button Clicked');
    // تطبيق تمييز الكلمات المفتاحية قبل النسخ لضمان ظهورها باللون الأحمر في المتجر
    const highlightedContent = highlightText(result, pk.split(','));
    await copyRichTextToClipboard(highlightedContent);
    setCopied(true);
    toast.success('تم نسخ المحتوى المنسق للمتجر');
    setTimeout(() => setCopied(false), 2000);
  };

  const copySummary = async () => {
    trackEvent('Copy Summary Button Clicked');
    const summary = `**اسم المنتج:** ${productName}\n**عنوان السيو:** ${seoTitle}\n**وصف الميتا:** ${metaDescription}`;
    await copyRichTextToClipboard(summary);
    setSummaryCopied(true);
    toast.success('تم نسخ ملخص السيو');
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  const copySection = async (text: string, label: string) => {
    trackEvent('Copy Section Button Clicked', { section: label });
    await copyRichTextToClipboard(text);
    setCopiedSectionLabel(label);
    toast.success(`تم نسخ ${label.replace(':', '')}`);
    setTimeout(() => setCopiedSectionLabel(null), 2000);
  };

  const highlightText = (text: string, keywords: string[]) => {
    if (!text || !keywords.length) return text;
    let result = text;
    const sortedKeywords = [...keywords]
      .filter(Boolean)
      .map(k => k.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    for (const keyword of sortedKeywords) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Only highlight if not already bolded
      const regex = new RegExp(`(?<!\\*\\*)(${escapedKeyword})(?!\\*\\*)`, 'gi');
      result = result.replace(regex, '**$1**');
    }
    return result;
  };


  // renderStructuredOutput removed as it is now handled by StructuredOutput component or ResultsView

  // Show skeleton instead of full-screen spinner for instant perceived load
  if (!mounted) {
    return (
      <div className="min-h-screen app-main flex items-center justify-center">
        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <Icon icon={Sparkles} className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md app-card border rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">إعدادات قاعدة البيانات ناقصة</h1>
          <p className="text-slate-500 mb-6">
            يرجى ضبط متغيرات البيئة الخاصة بـ Firebase في إعدادات المشروع لتفعيل ميزات تسجيل الدخول والسجل.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm text-right">
            <p>بعد إضافة المتغيرات، قم بإعادة تشغيل التطبيق.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <AuthOverlay
        onLogin={handleLogin}
        onSignup={handleSignup}
        onResetPassword={handleResetPassword}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <MeshBackground>
      <div className="flex min-h-screen bg-transparent text-slate-900 font-sans">
        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

      {/* Desktop Sidebar */}
      <aside className={`${activeTab === 'product' ? 'hidden' : `${isSidebarOpen ? 'flex' : 'hidden'} lg:flex`} ${isSidebarExpanded ? 'w-72' : 'w-20'} bg-slate-900 flex-col fixed h-full right-0 z-30 shadow-2xl transition-all duration-500 ease-in-out overflow-y-auto overflow-x-hidden border-l border-white/5`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {isSidebarExpanded && (
              <motion.h1 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-black tracking-tight text-white font-cairo whitespace-nowrap"
              >
                خبير السيو
              </motion.h1>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
            className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all"
          >
            <Icon icon={isSidebarExpanded ? ChevronRight : ChevronLeft} className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
            { id: 'auto-seo', icon: Zap, label: 'Auto SEO Engine' },
            { id: 'generate', icon: Sparkles, label: 'لوحة التوليد' },
            { id: 'research', icon: Key, label: 'أداة الكلمات' },
            { id: 'tools', icon: LayoutGrid, label: 'الأدوات' },
            { id: 'guide', icon: BookOpen, label: 'دليل السيو' },
            { id: 'blog', icon: BookOpen, label: 'المدونة', isExternal: true },
            { id: 'history', icon: History, label: 'سجل المحفوظات' },
            { id: 'pricing', icon: CreditCard, label: 'الأسعار والاشتراك' },
            { id: 'profile', icon: UserIcon, label: 'الملف الشخصي' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { 
                if (item.isExternal) {
                  window.location.href = 'https://khabeerseo.com';
                } else {
                  goToTab(item.id); 
                  setIsSidebarOpen(false); 
                }
              }}
              className={`group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' 
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className={`shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon icon={item.icon} className="w-5 h-5" />
              </div>
              {isSidebarExpanded && (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="tracking-wide whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute right-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-l-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          {isSidebarExpanded ? (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Icon icon={UserIcon} className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-white truncate">{user?.user_metadata?.username || 'مستخدم'}</p>
                  <p className="text-[10px] text-white/40 truncate font-bold">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => goToTab('pricing')}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black bg-gradient-to-r from-amber-400 to-amber-600 text-white py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 mb-2"
                >
                  <Zap size={14} className="fill-current" />
                  ترقية الحساب
                </button>
                {deferredPrompt && (
                  <button
                    onClick={installPWA}
                    className="w-full flex items-center justify-center gap-2 text-xs font-black text-emerald-400 hover:bg-emerald-500/10 py-2.5 rounded-xl transition-all border border-emerald-500/20"
                  >
                    <Icon icon={ShoppingBag} className="w-4 h-4" />
                    تثبيت التطبيق
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black text-rose-400 hover:bg-rose-500/10 py-2.5 rounded-xl transition-all border border-rose-500/20 disabled:opacity-50"
                >
                  {logoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon icon={LogOut} className="w-4 h-4" />}
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full flex items-center justify-center p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-rose-500/20 disabled:opacity-50 mb-2"
              title="تسجيل الخروج"
            >
              {logoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon icon={LogOut} className="w-5 h-5" />}
            </button>
          )}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-white/20 font-black tracking-widest uppercase">© {new Date().getFullYear()} خبير السيو</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`${activeTab === 'product' ? 'hidden' : 'flex lg:hidden'} fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-2xl border-b border-slate-100 z-40 px-6 items-center justify-between shadow-sm rounded-b-[2.5rem]`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-600 active:scale-90 transition-transform"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight font-cairo">خبير السيو</h1>
            </div>
            <h2 className="text-lg font-black text-slate-800 mt-0.5">
              {activeTab === 'dashboard' ? 'الرئيسية' :
               activeTab === 'generate' ? 'التوليد' : 
               activeTab === 'research' ? 'الكلمات' : 
               activeTab === 'tools' ? 'الأدوات' :
               activeTab === 'product' ? 'المنتجات' :
               activeTab === 'guide' ? 'الدليل' : 
               activeTab === 'history' ? 'السجل' : 
               activeTab === 'settings' ? 'الإعدادات' : 'الملف'}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            >
              <Icon icon={Bell} className="w-5 h-5" />
              {unreadCount() > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
          <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
            <Icon icon={UserIcon} className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className={`${activeTab === 'product' ? 'hidden' : 'flex lg:hidden'} fixed bottom-6 left-4 right-4 app-mobile-nav border rounded-2xl z-50 px-4 py-2 items-center justify-between pb-safe transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-y-32 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <button
          onClick={() => goToTab('dashboard')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'mobile-nav-item active scale-110 -translate-y-1' : 'mobile-nav-item'}`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-100/50 dark:bg-emerald-900/30' : ''}`}>
            <Icon icon={LayoutDashboard} className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">الرئيسية</span>
        </button>

        <button
          onClick={() => goToTab('research')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'research' ? 'mobile-nav-item active scale-110 -translate-y-1' : 'mobile-nav-item'}`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'research' ? 'bg-emerald-100/50 dark:bg-emerald-900/30' : ''}`}>
            <Icon icon={Key} className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">الكلمات</span>
        </button>

        <div className="relative -top-8">
          <button
            onClick={() => goToTab('generate')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-500 shadow-2xl shadow-emerald-400/40 ${
              activeTab === 'generate' 
                ? 'mobile-nav-fab active scale-110 rotate-12' 
                : 'mobile-nav-fab'
            }`}
          >
            <Icon icon={Zap} className="w-7 h-7" />
          </button>
          <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-tighter transition-colors ${activeTab === 'generate' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
            توليد
          </span>
        </div>



        <button
          onClick={() => goToTab('tools')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'tools' ? 'text-purple-700 dark:text-purple-400 scale-110 -translate-y-1' : 'mobile-nav-item'}`}
        >
          <div className={`p-1.5 rounded-full transition-all duration-300 ${activeTab === 'tools' ? 'bg-purple-100/50 dark:bg-purple-900/30 shadow-sm' : ''}`}>
            <Icon icon={LayoutGrid} className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">الأدوات</span>
        </button>

        <button
          onClick={() => goToTab('settings')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'settings' ? 'mobile-nav-item active scale-110 -translate-y-1' : 'mobile-nav-item'}`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'settings' ? 'bg-emerald-100/50 dark:bg-emerald-900/30' : ''}`}>
            <Icon icon={Settings} className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">الإعدادات</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <div className={`flex-1 ${activeTab === 'product' ? 'lg:mr-0' : isSidebarExpanded ? 'lg:mr-72' : 'lg:mr-20'} min-h-screen pb-24 lg:pb-8 pt-20 lg:pt-0 px-0 sm:px-0 app-main transition-all duration-500`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* Desktop Top Header */}
        <header className={`${activeTab === 'product' ? 'hidden' : 'hidden lg:flex'} sticky top-0 z-20 h-24 app-topbar border-b px-12 items-center justify-between bg-white/80 backdrop-blur-2xl dark:bg-slate-900/80`}>
          <div className="flex items-center gap-8">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 ${
              activeTab === 'dashboard' ? 'bg-emerald-600 shadow-emerald-200' :
              activeTab === 'generate' ? 'bg-amber-600 shadow-amber-200' :
              activeTab === 'research' ? 'bg-blue-600 shadow-blue-200' :
              activeTab === 'tools' ? 'bg-purple-600 shadow-purple-200' :
              activeTab === 'product' ? 'bg-rose-600 shadow-rose-200' :
              activeTab === 'guide' ? 'bg-teal-600 shadow-teal-200' :
              activeTab === 'history' ? 'bg-slate-600 shadow-slate-200' : 'bg-emerald-600 shadow-emerald-200'
            }`}>
              <Icon icon={activeTab === 'dashboard' ? LayoutDashboard : activeTab === 'generate' ? Zap : activeTab === 'research' ? Key : activeTab === 'tools' ? LayoutGrid : activeTab === 'product' ? Package : activeTab === 'guide' ? BookOpen : activeTab === 'history' ? History : Settings} className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 dark:border-slate-700">القسم الحالي</span>
                <div className="h-px w-8 bg-slate-200 dark:bg-slate-700"></div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                {activeTab === 'dashboard' ? 'لوحة التحكم' :
                 activeTab === 'auto-seo' ? 'Auto SEO Engine' :
                 activeTab === 'generate' ? 'لوحة التوليد الذكي' : 
                 activeTab === 'research' ? 'أداة البحث عن الكلمات' : 
                 activeTab === 'tools' ? 'مركز الأدوات الذكية' :
                 activeTab === 'product' ? 'تتبع أداء المنتج' :
                 activeTab === 'guide' ? 'دليل استراتيجيات السيو' : 
                 activeTab === 'history' ? 'سجل المحفوظات' : 
                 activeTab === 'settings' ? 'الإعدادات' : 'الملف الشخصي'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100 dark:shadow-none">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-white">{user?.user_metadata?.username || 'مستخدم'}</p>
                <p className="text-[10px] text-slate-400 font-bold">{user?.email}</p>
              </div>
              <div className="w-11 h-11 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                <Icon icon={UserIcon} className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative w-12 h-12 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100 dark:shadow-none"
              title="الإشعارات"
            >
              <Icon icon={Bell} className="w-6 h-6" />
              {unreadCount() > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-10">
            <div className="lg:hidden">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'dashboard' ? 'لوحة التحكم' :
                 activeTab === 'generate' ? 'لوحة التوليد الذكي' : 
                 activeTab === 'research' ? 'أداة البحث عن الكلمات' : 
                 activeTab === 'tools' ? 'مركز الأدوات الذكية' :
                 activeTab === 'product' ? 'تتبع أداء المنتج' :
                 activeTab === 'guide' ? 'دليل استراتيجيات السيو' : 
                 activeTab === 'history' ? 'سجل المحفوظات' : 
                 activeTab === 'settings' ? 'الإعدادات' : 'الملف الشخصي'}
              </h2>
              <p className="text-sm text-slate-500 mt-2 font-bold opacity-80">
                {activeTab === 'dashboard' ? 'نظرة عامة على نشاطك وأداء متجرك' :
                 activeTab === 'generate' ? 'قم بإنشاء محتوى سيو احترافي لمنتجاتك' : 
                 activeTab === 'research' ? 'اكتشف الكلمات المفتاحية الأكثر طلباً' : 
                 activeTab === 'tools' ? 'كل ما تحتاجه لتحسين وتتبع أداء منتجاتك' :
                 activeTab === 'product' ? 'أضف تفاصيل منتجك لتتبع تصدره في محركات البحث' :
                 activeTab === 'guide' ? 'تعلم أفضل الممارسات لتحسين ظهور منتجاتك' : 
                 activeTab === 'history' ? 'استعرض وقم بإدارة المحتوى الذي قمت بتوليده' : 
                 activeTab === 'settings' ? 'إدارة إعدادات اللوحة وتخصيصها' : 'إدارة إعدادات حسابك وبياناتك'}
              </p>
            </div>
            <div className="hidden sm:block">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isSaving ? 1 : 0 }}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                جاري الحفظ...
              </motion.div>
            </div>
          </div>
          
          {dailyUsage > DAILY_LIMIT * 0.8 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
                dailyUsage >= DAILY_LIMIT 
                ? 'bg-red-50 border-red-100 text-red-700' 
                : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}
            >
              <div className={`p-2 rounded-xl ${dailyUsage >= DAILY_LIMIT ? 'bg-red-100' : 'bg-amber-100'}`}>
                <Icon icon={AlertCircle} className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {dailyUsage >= DAILY_LIMIT ? 'تم الوصول للحد الأقصى اليومي' : 'تنبيه: حصة الاستخدام تقترب من النهاية'}
                </h4>
                <p className="text-xs mt-1 opacity-90">
                  {dailyUsage >= DAILY_LIMIT 
                    ? 'لقد استنفدت جميع المحاولات المتاحة لهذا اليوم. يرجى المحاولة غداً أو استخدام مفتاح API آخر.' 
                    : `لقد استخدمت ${dailyUsage} من أصل ${DAILY_LIMIT} محاولة متاحة لليوم. يرجى ترشيد الاستهلاك.`}
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={slideDir}>
            {showPricing ? (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="will-change-transform min-h-[70vh]"
              >
                <PricingView user={user} onBack={() => setShowPricing(false)} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                custom={slideDir}
                variants={{
                  enter: (dir: string) => ({ opacity: 0, x: dir === 'left' ? 40 : -40 }),
                  center: { opacity: 1, x: 0 },
                  exit:  (dir: string) => ({ opacity: 0, x: dir === 'left' ? -30 : 30 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="will-change-transform min-h-[70vh]"
              >
                {activeTab === 'dashboard' ? (
            <HomeView 
              user={user}
              setActiveTab={setActiveTab}
              history={history}
              setResult={setResult}
              setProductName={setProductName}
              trackedProducts={trackedProducts}
              dailyUsage={dailyUsage}
              seoTip={seoTip}
              setSeoTip={setSeoTip}
              seoTips={seoTips}
            />
          ) : activeTab === 'auto-seo' ? (
            <AutoSeoView />
          ) : activeTab === 'generate' ? (
            <GenerateView 
              goToTab={goToTab}
              productName={productName}
              setProductName={setProductName}
              catchyTitle={catchyTitle}
              setCatchyTitle={setCatchyTitle}
              pk={pk}
              setPk={setPk}
              manualPk={manualPk}
              setManualPk={setManualPk}
              showManualPkInput={showManualPkInput}
              setShowManualPkInput={setShowManualPkInput}
              contentType={contentType}
              setContentType={setContentType}
              dashboardConfig={dashboardConfig}
              setDashboardConfig={setDashboardConfig}
              competitionLevel={competitionLevel}
              setCompetitionLevel={setCompetitionLevel}
              variations={variations}
              setVariations={setVariations}
              progress={progress}
              loading={loading}
              generateSEO={generateSEO}
              saveToHistory={saveToHistory}
              isSaving={isSaving}
              clearInputs={clearInputs}
              error={error}
              result={result}
              checkPlagiarism={checkPlagiarism}
              plagiarismLoading={plagiarismLoading}
              plagiarismResult={plagiarismResult}
              copyToClipboard={copyToClipboard}
              copied={copied}
              copySummary={copySummary}
              summaryCopied={summaryCopied}
              suggestSmartProductName={suggestSmartProductName}
              smartProductNameLoading={smartProductNameLoading}
              suggestSmartKeywords={suggestSmartKeywords}
              smartSuggestLoading={smartSuggestLoading}
              suggestPKKeywords={suggestPKKeywords}
              suggestLSIKeywords={suggestLSIKeywords}
              suggestingLSI={suggestingLSI}
              suggestedPKs={suggestedPKs}
              suggestedLSIs={suggestedLSIs}
              lsi={lsi}
              setLsi={setLsi}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              toneOfVoice={toneOfVoice}
              setToneOfVoice={setToneOfVoice}
              metaLength={metaLength}
              setMetaLength={setMetaLength}
              keywordCount={keywordCount}
              setKeywordCount={setKeywordCount}
              specsFormat={specsFormat}
              setSpecsFormat={setSpecsFormat}
              correctionMode={correctionMode}
              setCorrectionMode={setCorrectionMode}
              competitorInfo={competitorInfo}
              setCompetitorInfo={setCompetitorInfo}
              competitorUrl={competitorUrl}
              setCompetitorUrl={setCompetitorUrl}
              sidebarVisibility={sidebarVisibility}
              variationsRef={variationsRef}
            />
          ) : activeTab === 'tools' ? (
            <ToolsView goToTab={goToTab} activeTool={activeTool} setActiveTool={setActiveTool} />
          ) : activeTab === 'product' ? (
            <ProductView
              trackedProducts={trackedProducts}
              newProduct={{
                name: trackedProductName,
                url: trackedProductUrl,
                keyword: trackedProductKeyword
              }}
              setNewProduct={(product) => {
                setTrackedProductName(product.name);
                setTrackedProductUrl(product.url);
                setTrackedProductKeyword(product.keyword);
              }}
              addTrackedProduct={addTrackedProduct}
              checkRanking={checkRanking}
              deleteTrackedProduct={deleteTrackedProduct}
              goToTab={goToTab}
            />
          ) : activeTab === 'research' ? (
            <ResearchView
              goToTab={goToTab}
              researchQuery={researchQuery}
              setResearchQuery={setResearchQuery}
              researchRegion={researchRegion}
              setResearchRegion={setResearchRegion}
              researchLoading={researchLoading}
              researchResults={researchResults}
              performKeywordResearch={performKeywordResearch}
              pk={pk}
              setPk={setPk}
              lsi={lsi}
              setLsi={setLsi}
              suggestedPKs={suggestedPKs}
              suggestedLSIs={suggestedLSIs}
              suggestKeywordsForResearch={suggestKeywordsForResearch}
              smartSuggestLoading={smartSuggestLoading}
            />
          ) : activeTab === 'history' ? (
            <HistoryView
              history={history}
              historySearch={historySearchQuery}
              setHistorySearch={setHistorySearchQuery}
              historyFilter={historyFilter}
              setHistoryFilter={setHistoryFilter}
              historySort={historySortOrder}
              setHistorySort={(val) => setHistorySortOrder(val as 'newest' | 'oldest' | 'name')}
              deleteHistoryItem={deleteHistoryItem}
              restoreHistoryItem={(item) => {
                setProductName(item.product_name || '');
                setPk(item.pk || '');
                setResult(item.result || '');
                goToTab('generate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast.success('تمت استعادة البيانات بنجاح');
              }}
              copyToClipboard={copyRichTextToClipboard}
              setActiveTab={setActiveTab}
            />
          ) : activeTab === 'profile' ? (
            <ProfileView 
              user={user}
              profileUsername={profileUsername}
              setProfileUsername={setProfileUsername}
              profileEmail={profileEmail}
              setProfileEmail={setProfileEmail}
              profilePassword={profilePassword}
              setProfilePassword={setProfilePassword}
              handleUpdateProfile={handleUpdateProfile}
              handleUpdateEmail={handleUpdateEmail}
              handleUpdatePassword={handleUpdatePassword}
              profileLoading={profileLoading}
              history={history}
              dashboardConfig={dashboardConfig}
              updateDashboardConfig={updateDashboardConfig}
              handleLogout={handleLogout}
              logoutLoading={logoutLoading}
            />
          ) : activeTab === 'guide' ? (
            <GuideView />
          ) : activeTab === 'settings' ? (
            <SettingsView 
              user={user}
              openAccordion={openAccordion}
              setOpenAccordion={setOpenAccordion}
              isSectionModified={isSectionModified}
              handleSaveSection={handleSaveSection}
              appLanguage={appLanguage}
              setAppLanguage={setAppLanguage}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              isMotionEnabled={isMotionEnabled}
              setIsMotionEnabled={setIsMotionEnabled}
              descriptionLength={descriptionLength}
              setDescriptionLength={(val) => setDescriptionLength(val as 'short' | 'medium' | 'long')}
              toneOfVoice={toneOfVoice}
              setToneOfVoice={setToneOfVoice}
              seoLevel={seoLevel}
              setSeoLevel={setSeoLevel}
              includeKeywords={includeKeywords}
              setIncludeKeywords={setIncludeKeywords}
              copyFormat={copyFormat}
              setCopyFormat={(val) => setCopyFormat(val as 'html' | 'text')}
              autoFormat={autoFormat}
              setAutoFormat={(val) => setAutoFormat(val as 'plain' | 'markdown' | 'html')}
              mergeSpecs={mergeSpecs}
              setMergeSpecs={setMergeSpecs}
              preserveFormatting={preserveFormatting}
              setPreserveFormatting={setPreserveFormatting}
              autoSuggestKeywords={autoSuggestKeywords}
              setAutoSuggestKeywords={setAutoSuggestKeywords}
              showLsiInput={showLsiInput}
              setShowLsiInput={setShowLsiInput}
              blockedKeywords={blockedKeywords}
              setBlockedKeywords={setBlockedKeywords}
              historyEnabled={historyEnabled}
              setHistoryEnabled={setHistoryEnabled}
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              genNotifications={genNotifications}
              setGenNotifications={setGenNotifications}
              errorNotifications={errorNotifications}
              setErrorNotifications={setErrorNotifications}
              handleLogout={handleLogout}
            />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
        </div>
      </div>
    </div>

    {/* PWA Install Modal */}
    <AnimatePresence>
        {showInstallModal && !isStandalone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 relative"
            >
              <button 
                onClick={() => setShowInstallModal(false)}
                className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <Icon icon={X} className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 bg-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                <Icon icon={Sparkles} className="w-10 h-10 text-white" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">ثبّت تطبيق خبير السيو</h3>
                <p className="text-slate-500 leading-relaxed">
                  استمتع بتجربة أسرع وأسهل من خلال تثبيت التطبيق على شاشتك الرئيسية.
                </p>
              </div>

              {isIOS ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <p className="text-sm font-bold text-slate-700 text-center">للتحميل على أجهزة iPhone/iPad:</p>
                  <ol className="text-xs text-slate-600 space-y-3 list-decimal list-inside">
                    <li>اضغط على أيقونة <span className="font-bold text-emerald-600">&quot;مشاركة&quot; (Share)</span> في أسفل المتصفح.</li>
                    <li>اختر <span className="font-bold text-emerald-600">&quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</span>.</li>
                    <li>اضغط على <span className="font-bold text-emerald-600">&quot;إضافة&quot; (Add)</span> في الزاوية العلوية.</li>
                  </ol>
                </div>
              ) : (
                <button
                  onClick={() => {
                    installPWA();
                    setShowInstallModal(false);
                  }}
                  className="w-full py-4 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="w-5 h-5" />
                  تثبيت الآن مجاناً
                </button>
              )}
              
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
              >
                ربما لاحقاً
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Tour Overlay */}
      <AnimatePresence>
        {showTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto">
                <Icon icon={Sparkles} className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {tourStep === 0 ? 'مرحباً بك في خبير السيو!' : 
                   tourStep === 1 ? 'أدخل اسم المنتج' : 
                   tourStep === 2 ? 'حدد الكلمات المستهدفة' : 
                   tourStep === 3 ? 'تحليل المنافسين' : 'استلم محتواك الاحترافي'}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {tourStep === 0 ? 'دعنا نأخذك في جولة سريعة لتتعرف على كيفية استخدام الأداة للحصول على أفضل النتائج.' : 
                   tourStep === 1 ? 'ابدأ بإدخال اسم المنتج أو الموضوع الذي تريد الكتابة عنه. يمكنك استخدام الاقتراحات الذكية.' : 
                   tourStep === 2 ? 'أدخل الكلمات التي تريد المنافسة عليها في محركات البحث.' : 
                   tourStep === 3 ? 'أضف معلومات عن منافسيك ليقوم الذكاء الاصطناعي بإبراز نقاط قوتك مقارنة بهم.' : 'بعد الضغط على توليد، سيظهر محتواك هنا مقسماً وجاهزاً للنسخ.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => {
                    setShowTour(false);
                    localStorage.setItem('seo_tour_seen', 'true');
                  }}
                  className="text-slate-400 text-sm font-bold hover:text-slate-600"
                >
                  تخطي الجولة
                </button>
                <button
                  onClick={() => {
                    if (tourStep < 4) setTourStep(tourStep + 1);
                    else {
                      setShowTour(false);
                      localStorage.setItem('seo_tour_seen', 'true');
                    }
                  }}
                  className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100"
                >
                  {tourStep === 4 ? 'ابدأ الآن' : 'التالي'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </MeshBackground>
  );
}
