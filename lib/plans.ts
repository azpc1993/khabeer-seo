// lib/plans.ts
import { Plan } from '@/types/subscription';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'المجانية',
    price: { monthly: 0, yearly: 0 },
    description: 'مثالية لتجربة الأدوات الأساسية والبدء في تحسين السيو.',
    features: [
      '5 تحليلات سيو شهرياً',
      '3 عمليات توليد محتوى',
      'حفظ حتى 5 منتجات',
      'سجل محدود (10 عناصر)',
      'أدوات السيو الأساسية'
    ],
    limits: {
      analysesPerMonth: 5,
      generationsPerMonth: 3,
      savedProductsLimit: 5,
      historyLimit: 10,
      features: {
        autoSeo: false,
        contentGap: false,
        dashboard: true,
        faq: false,
        keywordInsights: false,
        competitorAnalysis: false,
        advancedExport: false
      }
    }
  },
  {
    id: 'basic',
    name: 'الأساسية',
    price: { monthly: 29, yearly: 290 },
    description: 'لأصحاب المتاجر الناشئة الذين يحتاجون لنمو مستمر.',
    features: [
      '50 تحليل سيو شهرياً',
      '30 عملية توليد محتوى',
      'حفظ حتى 50 منتج',
      'سجل حتى 100 عنصر',
      'Keyword Insights',
      'FAQ Generator'
    ],
    limits: {
      analysesPerMonth: 50,
      generationsPerMonth: 30,
      savedProductsLimit: 50,
      historyLimit: 100,
      features: {
        autoSeo: false,
        contentGap: false,
        dashboard: true,
        faq: true,
        keywordInsights: true,
        competitorAnalysis: false,
        advancedExport: false
      }
    }
  },
  {
    id: 'pro',
    name: 'الاحترافية',
    price: { monthly: 79, yearly: 790 },
    description: 'الحل المتكامل للمحترفين والوكالات لزيادة المبيعات.',
    isRecommended: true,
    features: [
      'تحليلات غير محدودة',
      '200 عملية توليد محتوى',
      'حفظ منتجات غير محدود',
      'سجل كامل',
      'Auto SEO Engine',
      'Content Gap Analyzer',
      'Competitor Analysis',
      'تصدير متقدم'
    ],
    limits: {
      analysesPerMonth: 9999,
      generationsPerMonth: 200,
      savedProductsLimit: 9999,
      historyLimit: 9999,
      features: {
        autoSeo: true,
        contentGap: true,
        dashboard: true,
        faq: true,
        keywordInsights: true,
        competitorAnalysis: true,
        advancedExport: true
      }
    }
  },
  {
    id: 'advanced',
    name: 'المتقدمة',
    price: { monthly: 149, yearly: 1490 },
    description: 'للشركات الكبيرة التي تتطلب أقصى أداء وذكاء اصطناعي.',
    features: [
      'كل شيء في الاحترافية',
      'توليد محتوى غير محدود',
      'دعم فني ذو أولوية',
      'وصول مبكر للميزات الجديدة',
      'تقارير مخصصة'
    ],
    limits: {
      analysesPerMonth: 9999,
      generationsPerMonth: 9999,
      savedProductsLimit: 9999,
      historyLimit: 9999,
      features: {
        autoSeo: true,
        contentGap: true,
        dashboard: true,
        faq: true,
        keywordInsights: true,
        competitorAnalysis: true,
        advancedExport: true
      }
    }
  }
];

export const getPlanById = (id: string) => PLANS.find(p => p.id === id) || PLANS[0];
