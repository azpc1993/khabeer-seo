'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  ChevronDown, 
  History, 
  Plus, 
  Package, 
  Calendar, 
  Tag, 
  RefreshCw, 
  Copy, 
  Trash2 
} from 'lucide-react'
import { SoftSolidCard } from '@/components/EliteUI'
import { HistoryItem } from '@/types'
import { toast } from 'sonner'

interface HistoryViewProps {
  history: HistoryItem[]
  historySearchQuery: string
  setHistorySearchQuery: (query: string) => void
  historySortOrder: 'newest' | 'oldest' | 'name'
  setHistorySortOrder: (order: 'newest' | 'oldest' | 'name') => void
  setActiveTab: (tab: string) => void
  setProductName: (name: string) => void
  setPk: (pk: string) => void
  setResult: (result: string) => void
  deleteHistoryItem: (id: string) => void
  copyRichTextToClipboard: (text: string) => Promise<void>
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  historySearchQuery,
  setHistorySearchQuery,
  historySortOrder,
  setHistorySortOrder,
  setActiveTab,
  setProductName,
  setPk,
  setResult,
  deleteHistoryItem,
  copyRichTextToClipboard
}) => {
  const filteredHistory = history
    .filter(item => {
      const searchLower = historySearchQuery.toLowerCase();
      return (
        (item.product_name || '').toLowerCase().includes(searchLower) ||
        (item.pk || '').toLowerCase().includes(searchLower) ||
        (item.result || '').toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const getTime = (item: HistoryItem) => {
        const ca = item.created_at;
        if (!ca) return 0;
        return (ca as { toMillis?: () => number }).toMillis 
          ? (ca as { toMillis: () => number }).toMillis() 
          : new Date(ca as string | number).getTime();
      };
      if (historySortOrder === 'newest') return getTime(b) - getTime(a);
      if (historySortOrder === 'oldest') return getTime(a) - getTime(b);
      if (historySortOrder === 'name') return (a.product_name || '').localeCompare(b.product_name || '');
      return 0;
    });

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Search and Filter Header */}
      <SoftSolidCard className="p-4 border-none shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في السجل (اسم المنتج، الكلمات المفتاحية...)"
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 md:flex-none">
              <select
                value={historySortOrder}
                onChange={(e) => setHistorySortOrder(e.target.value as 'newest' | 'oldest' | 'name')}
                className="w-full md:w-48 px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black text-slate-700 text-sm appearance-none cursor-pointer"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
                <option value="name">حسب الاسم (أ-ي)</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </SoftSolidCard>

      {history.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-20 text-center border border-white/20 shadow-xl">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-50 text-indigo-200 mb-8 relative">
            <History className="w-12 h-12" />
            <div className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
              <Plus className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">سجل المخرجات فارغ</h3>
          <p className="text-slate-500 max-w-md mx-auto font-bold leading-relaxed">ابدأ بتوليد محتوى السيو الاحترافي لمنتجاتك، وسيتم حفظ جميع النتائج هنا تلقائياً للرجوع إليها في أي وقت.</p>
          <button 
            onClick={() => setActiveTab('generate')}
            className="mt-8 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
          >
            ابدأ التوليد الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHistory.length === 0 && historySearchQuery ? (
            <div className="md:col-span-2 bg-white/50 backdrop-blur-sm rounded-3xl p-20 text-center border border-white/20 shadow-xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 text-slate-300 mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">لا توجد نتائج مطابقة</h3>
              <p className="text-slate-500 font-bold">حاول تغيير كلمات البحث أو مسح الفلتر للعثور على ما تبحث عنه.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group"
              >
                <SoftSolidCard className="h-full flex flex-col border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                            <Package className="w-4 h-4 text-indigo-500" />
                          </div>
                          <h4 className="font-black text-slate-900 truncate text-base leading-tight">
                            {item.product_name || 'منتج بدون اسم'}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {(() => {
                              const ca = item.created_at;
                              if (!ca) return 'تاريخ غير معروف';
                              const date = (ca as { toMillis?: () => number }).toMillis 
                                ? new Date((ca as { toMillis: () => number }).toMillis()) 
                                : new Date(ca as string | number);
                              return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
                            })()}
                          </span>
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            محتوى سيو
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setProductName(item.product_name || '');
                            setPk(item.pk || '');
                            setResult(item.result || '');
                            setActiveTab('generate');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            toast.success('تمت استعادة البيانات بنجاح');
                          }}
                          className="p-2.5 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-slate-100 active:scale-90"
                          title="استعادة"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await copyRichTextToClipboard(item.result || '');
                              toast.success('تم نسخ المحتوى بنجاح');
                            } catch {
                              toast.error('فشل النسخ');
                            }
                          }}
                          className="p-2.5 text-emerald-600 bg-white hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm border border-slate-100 active:scale-90"
                          title="نسخ"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-2.5 text-rose-500 bg-white hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-slate-100 active:scale-90"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content Preview */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1 line-clamp-4 text-xs font-bold text-slate-500 leading-relaxed mb-4">
                      {item.result ? item.result.substring(0, 300) + '...' : 'لا يوجد محتوى متاح'}
                    </div>
                    
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">جاهز للاستخدام</span>
                      </div>
                      <button 
                        onClick={() => {
                          setResult(item.result || '');
                          setActiveTab('generate');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-1.5 group/btn"
                      >
                        عرض التفاصيل
                        <Plus className="w-3 h-3 group-hover/btn:rotate-90 transition-transform" />
                      </button>
                    </div>
                  </div>
                </SoftSolidCard>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  )
}
