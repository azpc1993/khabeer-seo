'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Package, Globe, Target, TrendingUp, BarChart3, RefreshCcw, Trash2, ExternalLink,
  Lightbulb, CheckCircle, AlertCircle, ArrowUpRight, ChevronDown, ArrowRight
} from 'lucide-react';
import { CrystalCard, SoftSolidCard, ModernField, PrimaryButton } from "@/components/EliteUI";
import { Icon } from "@/components/Common";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import type { TrackedProduct } from '@/types';

interface NewProduct {
  name: string;
  url: string;
  keyword: string;
}

export interface ProductTrackingViewProps {
  trackedProducts: TrackedProduct[];
  newProduct: NewProduct;
  setNewProduct: (product: NewProduct) => void;
  addTrackedProduct: () => void;
  checkRanking: (id: string) => void;
  deleteTrackedProduct: (id: string) => void;
  goToTab?: (tab: string) => void;
}

const ProductTrackingView = ({
  trackedProducts,
  newProduct,
  setNewProduct,
  addTrackedProduct,
  checkRanking,
  deleteTrackedProduct,
  goToTab
}: ProductTrackingViewProps) => {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedProductId === id) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(id);
    }
  };

  return (
    <motion.div
      key="product"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {goToTab && (
        <button 
          onClick={() => goToTab('tools')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-black text-sm uppercase tracking-widest"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للأدوات
        </button>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Product Form */}
        <div className="lg:col-span-1">
          <CrystalCard className="p-8 border-none shadow-xl sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <Icon icon={Plus} className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">تتبع منتج جديد</h4>
            </div>

            <div className="space-y-6">
              <ModernField 
                label="اسم المنتج"
                placeholder="مثال: آيفون 15 برو"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                icon={Package}
                className="!bg-slate-50/50 border-slate-100"
              />
              <ModernField 
                label="رابط المنتج"
                placeholder="https://yourstore.com/product"
                value={newProduct.url}
                onChange={(e) => setNewProduct({...newProduct, url: e.target.value})}
                icon={Globe}
                className="!bg-slate-50/50 border-slate-100"
              />
              <ModernField 
                label="الكلمة المفتاحية المستهدفة"
                placeholder="مثال: ايفون 15 برو ماكس"
                value={newProduct.keyword}
                onChange={(e) => setNewProduct({...newProduct, keyword: e.target.value})}
                icon={Target}
                className="!bg-slate-50/50 border-slate-100"
              />
              
              <PrimaryButton 
                onClick={addTrackedProduct}
                disabled={!newProduct.name || !newProduct.url || !newProduct.keyword}
                className="w-full py-4 text-base"
                icon={Plus}
                label="إضافة للمتابعة"
              />
            </div>
          </CrystalCard>
        </div>

        {/* Tracked Products List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <SoftSolidCard className="p-5 border-none shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي المنتجات</p>
              <p className="text-2xl font-black text-slate-900">{trackedProducts.length}</p>
            </SoftSolidCard>
            <SoftSolidCard className="p-5 border-none shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">متوسط الترتيب</p>
              <p className="text-2xl font-black text-emerald-600">
                {trackedProducts.length > 0 
                  ? Math.round(trackedProducts.reduce((acc, curr) => acc + (curr.rank || 0), 0) / trackedProducts.length)
                  : 0}
              </p>
            </SoftSolidCard>
            <SoftSolidCard className="hidden sm:block p-5 border-none shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">تحسن الأداء</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">+12%</p>
            </SoftSolidCard>
          </div>

          {/* All Tracked Products Performance Overview */}
          <CrystalCard className="p-6 border-none shadow-sm bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden mb-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2 mb-1">
                  <Icon icon={TrendingUp} className="w-6 h-6 text-indigo-200" />
                  أداء جميع المنتجات المتتبعة
                </h3>
                <p className="text-indigo-100 text-sm font-medium">
                  نظرة عامة على تحسن الترتيب لجميع المنتجات في محركات البحث
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                <div>
                  <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">متوسط التحسن</p>
                  <div className="flex items-center gap-1.5 text-2xl font-black text-emerald-400">
                    <Icon icon={TrendingUp} className="w-5 h-5" />
                    <span>+12.5%</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-white/20 mx-2" />
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">الاتجاه العام</p>
                    <div className="flex items-center gap-1.5 text-lg font-black text-white">
                      إيجابي
                    </div>
                  </div>
                  <div className="w-24 h-10">
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                      <path 
                        d="M0,35 C15,35 25,25 40,28 C55,31 65,15 80,18 C90,20 95,5 100,5" 
                        fill="none" 
                        stroke="#34d399" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </CrystalCard>

          {/* List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {trackedProducts.length > 0 ? (
                trackedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group"
                  >
                    <SoftSolidCard className="p-5 border-none shadow-sm hover:shadow-md transition-all duration-300">
                      <div 
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" 
                        onClick={() => toggleExpand(product.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <Icon icon={Package} className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{product.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                <Icon icon={Target} className="w-3 h-3" />
                                {product.keyword}
                              </span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <a 
                                href={product.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-widest"
                              >
                                <Icon icon={ExternalLink} className="w-3 h-3" />
                                عرض الرابط
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الترتيب الحالي</p>
                            <div className="flex items-center justify-center gap-2">
                              <span className={`text-2xl font-black ${product.rank !== null && product.rank <= 3 ? 'text-emerald-600' : product.rank !== null && product.rank <= 10 ? 'text-amber-600' : 'text-slate-400'}`}>
                                #{product.rank || '--'}
                              </span>
                              {product.rank !== null && (
                                <div className="p-1 bg-emerald-50 text-emerald-500 rounded-md">
                                  <Icon icon={TrendingUp} className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); checkRanking(product.id); }}
                              className="p-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:bg-emerald-900/20 transition-all active:scale-95"
                              title="تحديث الترتيب"
                            >
                              <Icon icon={RefreshCcw} className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteTrackedProduct(product.id); }}
                              className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all active:scale-95"
                              title="حذف"
                            >
                              <Icon icon={Trash2} className="w-4 h-4" />
                            </button>
                            <div className={`p-2 rounded-full transition-transform duration-300 ${expandedProductId === product.id ? 'rotate-180 bg-slate-100' : 'bg-transparent'}`}>
                              <Icon icon={ChevronDown} className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details Section */}
                      <AnimatePresence>
                        {expandedProductId === product.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 mt-6 border-t border-slate-100">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Chart Area */}
                                <div className="lg:col-span-2 space-y-6">
                                  <CrystalCard className="p-6 border-none shadow-sm bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-6">
                                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Icon icon={TrendingUp} className="w-5 h-5 text-emerald-600" />
                                        تاريخ الترتيب (آخر 30 يوم)
                                      </h3>
                                    </div>
                                    <div className="h-64 w-full" dir="ltr">
                                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                        Chart Placeholder
                                      </div>
                                    </div>
                                  </CrystalCard>

                                  <CrystalCard className="p-6 border-none shadow-sm bg-slate-50/50">
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                      <Icon icon={BarChart3} className="w-5 h-5 text-blue-600" />
                                      تحليل المنافسة للكلمة المفتاحية
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="p-4 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 mb-1">حجم البحث الشهري</p>
                                        <p className="text-xl font-black text-slate-900">12.5K</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 mb-1">صعوبة الكلمة (KD)</p>
                                        <p className="text-xl font-black text-amber-600">45/100</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 mb-1">نسبة النقر (CTR)</p>
                                        <p className="text-xl font-black text-emerald-600">3.2%</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 mb-1">نية البحث</p>
                                        <p className="text-xl font-black text-blue-600">شرائية</p>
                                      </div>
                                    </div>
                                  </CrystalCard>
                                </div>

                                {/* Sidebar Area */}
                                <div className="space-y-6">
                                  <CrystalCard className="p-6 border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                      <Icon icon={Lightbulb} className="w-5 h-5 text-amber-500" />
                                      اقتراحات التحسين
                                    </h3>
                                    <ul className="space-y-4">
                                      <li className="flex gap-3">
                                        <Icon icon={AlertCircle} className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-bold text-slate-900">كثافة الكلمة المفتاحية منخفضة</p>
                                          <p className="text-xs text-slate-600 mt-1">حاول إضافة &quot;{product.keyword}&quot; مرة أخرى في وصف المنتج بشكل طبيعي.</p>
                                        </div>
                                      </li>
                                      <li className="flex gap-3">
                                        <Icon icon={CheckCircle} className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-bold text-slate-900">عنوان السيو ممتاز</p>
                                          <p className="text-xs text-slate-600 mt-1">طول العنوان مناسب ويحتوي على الكلمة المفتاحية في البداية.</p>
                                        </div>
                                      </li>
                                      <li className="flex gap-3">
                                        <Icon icon={AlertCircle} className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-bold text-slate-900">الصورة تفتقر إلى النص البديل (Alt Text)</p>
                                          <p className="text-xs text-slate-600 mt-1">أضف نصاً بديلاً للصورة الرئيسية يحتوي على الكلمة المفتاحية.</p>
                                        </div>
                                      </li>
                                    </ul>
                                    <PrimaryButton 
                                      label="إعادة توليد الوصف المحسن"
                                      icon={RefreshCcw}
                                      className="w-full mt-6 py-3 text-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        alert('سيتم توجيهك لصفحة التوليد مع بيانات هذا المنتج قريباً.');
                                      }}
                                    />
                                  </CrystalCard>

                                  <CrystalCard className="p-6 border-none shadow-sm bg-slate-50/50">
                                    <h3 className="text-lg font-black text-slate-900 mb-4">كلمات مفتاحية مقترحة (LSI)</h3>
                                    <div className="flex flex-wrap gap-2">
                                      {['سعر ' + product.name, 'مواصفات ' + product.keyword, 'شراء اونلاين', 'عروض', 'تقييم'].map((tag, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100 shadow-sm">
                                          {tag}
                                          <Icon icon={ArrowUpRight} className="w-3 h-3" />
                                        </span>
                                      ))}
                                    </div>
                                  </CrystalCard>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </SoftSolidCard>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon icon={BarChart3} className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">لا يوجد منتجات متابعة</h3>
                  <p className="text-sm text-slate-500 font-bold">أضف منتجاتك لمتابعة ترتيبها في محركات البحث بشكل يومي.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductTrackingView;
