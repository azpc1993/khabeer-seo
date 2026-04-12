'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Package, 
  Globe, 
  Search, 
  TrendingUp, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { CrystalCard, AppTextField, PrimaryButton } from '../EliteUI';
import { Tooltip } from '../Common';
import type { TrackedProduct } from '@/types';

interface ProductViewProps {
  trackedProductName: string;
  setTrackedProductName: (val: string) => void;
  trackedProductUrl: string;
  setTrackedProductUrl: (val: string) => void;
  trackedProductKeyword: string;
  setTrackedProductKeyword: (val: string) => void;
  addTrackedProduct: () => void;
  isAddingTracked: boolean;
  trackedProducts: TrackedProduct[];
  updateProductRank: (id: string, rank: number) => void;
  deleteTrackedProduct: (id: string) => void;
  isTrackedLoading: boolean;
  checkRanking: (id: string) => void;
}

const ProductView: React.FC<ProductViewProps> = ({
  trackedProductName,
  setTrackedProductName,
  trackedProductUrl,
  setTrackedProductUrl,
  trackedProductKeyword,
  setTrackedProductKeyword,
  addTrackedProduct,
  isAddingTracked,
  trackedProducts,
  updateProductRank,
  deleteTrackedProduct,
  isTrackedLoading,
  checkRanking
}) => {
  return (
    <motion.div
      key="product"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-500/20">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">تتبع ترتيب المنتجات</h2>
            <p className="text-sm font-bold text-slate-400 mt-1">راقب أداء منتجاتك في نتائج البحث بسهولة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="trackedProductName" className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">اسم المنتج</label>
            <AppTextField
              id="trackedProductName"
              value={trackedProductName}
              onChange={(e) => setTrackedProductName(e.target.value)}
              placeholder="مثال: ساعة ذكية"
              icon={Package}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="trackedProductUrl" className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">رابط المنتج</label>
            <AppTextField
              id="trackedProductUrl"
              value={trackedProductUrl}
              onChange={(e) => setTrackedProductUrl(e.target.value)}
              placeholder="https://salla.sa/product"
              icon={Globe}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="trackedProductKeyword" className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">الكلمة المفتاحية</label>
            <AppTextField
              id="trackedProductKeyword"
              value={trackedProductKeyword}
              onChange={(e) => setTrackedProductKeyword(e.target.value)}
              placeholder="مثال: أفضل ساعة ذكية"
              icon={Search}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <PrimaryButton
            onClick={addTrackedProduct}
            loading={isAddingTracked}
            className="px-8 py-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>إضافة للمتابعة</span>
            </div>
          </PrimaryButton>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isTrackedLoading ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold">جاري تحميل المنتجات...</p>
          </div>
        ) : trackedProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
              <Target className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900">لا توجد منتجات متتبعة</p>
              <p className="text-sm font-bold text-slate-400">ابدأ بإضافة منتجك الأول لمراقبته</p>
            </div>
          </div>
        ) : (
          trackedProducts.map((product) => (
            <CrystalCard key={product.id} className="p-6 group hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors border border-slate-100 group-hover:border-indigo-100">
                    <TrendingUp className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 truncate max-w-[150px]">{product.name}</h4>
                    <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{product.keyword}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${
                    product.rank && product.rank <= 10 
                      ? 'bg-emerald-500 text-white shadow-emerald-100' 
                      : 'bg-slate-900 text-white shadow-slate-100'
                  }`}>
                    #{product.rank || '-'}
                  </div>
                  <Tooltip text="فتح الرابط">
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all border border-slate-100 hover:border-indigo-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <AppTextField
                      type="number"
                      placeholder="تحديث الترتيب..."
                      className="text-xs py-2.5"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateProductRank(product.id, parseInt(e.currentTarget.value));
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <button 
                    onClick={() => checkRanking(product.id)}
                    className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 active:scale-95"
                    title="تحديث الترتيب"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTrackedProduct(product.id)}
                    className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all border border-rose-100 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 px-1">
                  <AlertCircle className="w-3 h-3 text-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    آخر تحديث: {new Date(product.updated_at || product.created_at || new Date()).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </CrystalCard>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ProductView;
