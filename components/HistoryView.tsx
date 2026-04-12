'use client';

import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Package, 
  ChevronLeft, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Check, 
  FileText, 
  Layers 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CrystalCard, AppTextField } from './EliteUI';
import { Icon } from './Common';

import { HistoryItem } from '@/types';

interface HistoryViewProps {
  history: HistoryItem[];
  historySearch: string;
  setHistorySearch: (val: string) => void;
  historyFilter: string;
  setHistoryFilter: (val: string) => void;
  historySort: string;
  setHistorySort: (val: string) => void;
  deleteHistoryItem: (id: string) => void;
  restoreHistoryItem: (item: HistoryItem) => void;
  copyToClipboard: (text: string) => void;
  setActiveTab: (tab: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  historySearch,
  setHistorySearch,
  historyFilter,
  setHistoryFilter,
  historySort,
  setHistorySort,
  deleteHistoryItem,
  restoreHistoryItem,
  copyToClipboard,
  setActiveTab
}) => {
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [showCompare, setShowCompare] = React.useState(false);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getTimestamp = (val: HistoryItem['created_at']) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return new Date(val).getTime();
    if (val instanceof Date) return val.getTime();
    if (typeof val === 'object' && 'toMillis' in val && typeof val.toMillis === 'function') return val.toMillis();
    return new Date(val as string | number | Date).getTime();
  };

  const filteredHistory = history
    .filter(item => 
      (item.product_name?.toLowerCase().includes(historySearch.toLowerCase()) || 
       item.result?.toLowerCase().includes(historySearch.toLowerCase())) &&
      (historyFilter === 'all' || item.content_type === historyFilter)
    )
    .sort((a, b) => {
      if (historySort === 'newest') return getTimestamp(b.created_at) - getTimestamp(a.created_at);
      return getTimestamp(a.created_at) - getTimestamp(b.created_at);
    });

  const handleCopy = (id: string, text: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMockMetrics = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const conversionRate = (Math.abs(hash % 150) / 10 + 2).toFixed(1);
    const seoScore = Math.abs(hash % 40) + 60;
    return { conversionRate, seoScore };
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/100/10 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-500/20">
              <History className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">سجل المحتوى المولد</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">تصفح وأعد استخدام المحتوى الذي قمت بتوليده سابقاً</p>
            </div>
          </div>
          
          {selectedItems.length >= 2 && (
            <button 
              onClick={() => setShowCompare(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Layers className="w-5 h-5" />
              مقارنة واختبار A/B ({selectedItems.length})
            </button>
          )}
        </div>
        
        {/* Comparison Modal */}
        {showCompare && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">مقارنة واختبار A/B</h3>
                  <p className="text-slate-500 font-bold mt-1">قارن بين النسخ المختلفة لاختيار الأفضل أداءً</p>
                </div>
                <button 
                  onClick={() => setShowCompare(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedItems.map((id, index) => {
                  const item = history.find(h => h.id === id);
                  const metrics = getMockMetrics(id);
                  const variantName = String.fromCharCode(65 + index);
                  return item ? (
                    <div key={id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black text-lg">
                            {variantName}
                          </div>
                          <h4 className="font-black text-lg text-slate-900 line-clamp-1" title={item.product_name}>{item.product_name}</h4>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                          <div className="text-2xl font-black text-emerald-600">{metrics.conversionRate}%</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">معدل التحويل المتوقع</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                          <div className="text-2xl font-black text-blue-600">{metrics.seoScore}/100</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">نقاط SEO</div>
                        </div>
                      </div>

                      <div className="text-sm text-slate-600 leading-relaxed flex-1 bg-white p-5 rounded-2xl border border-slate-100 overflow-y-auto max-h-60 custom-scrollbar">
                        <ReactMarkdown>{item.result || ''}</ReactMarkdown>
                      </div>
                      
                      <button 
                        onClick={() => {
                          handleCopy(item.id, item.result || '');
                          setShowCompare(false);
                        }}
                        className="mt-6 w-full py-3.5 bg-white border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 font-black rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        اعتماد هذه النسخة
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full md:w-64">
              <AppTextField
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="بحث في السجل..."
                icon={Search}
                className="text-xs py-2.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-600 appearance-none cursor-pointer focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="all">الكل</option>
                  <option value="product">منتجات</option>
                  <option value="blog">مدونات</option>
                  <option value="category">فئات</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={historySort}
                  onChange={(e) => setHistorySort(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-600 appearance-none cursor-pointer focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="oldest">الأقدم أولاً</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                <History className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900">لا توجد نتائج مطابقة</p>
                <p className="text-sm font-bold text-slate-400">جرب تغيير كلمات البحث أو الفلاتر</p>
              </div>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <CrystalCard 
                key={item.id} 
                className={`overflow-hidden border-slate-100 hover:border-emerald-200 dark:border-emerald-800 hover:scale-[1.01] hover:bg-white/60 transition-all duration-300 group ${expandedItem === item.id ? 'ring-2 ring-emerald-500/20 bg-white/80 scale-[1.01]' : ''}`}
              >
                <div 
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                      <Icon 
                        icon={item.content_type === 'product' ? Package : item.content_type === 'blog' ? FileText : Layers} 
                        className="w-6 h-6 text-emerald-600 dark:text-emerald-400" 
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 mb-1">{item.product_name || 'منتج غير مسمى'}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                          {item.content_type === 'product' ? 'منتج' : item.content_type === 'blog' ? 'مدونة' : 'فئة'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(getTimestamp(item.created_at)).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item.id, item.result || '');
                        }}
                        className="p-2.5 bg-white text-slate-400 hover:bg-emerald-50 dark:bg-emerald-900/10 hover:text-emerald-700 dark:text-emerald-400 rounded-xl transition-all border border-slate-100 hover:border-emerald-100 dark:border-emerald-900 shadow-sm"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          restoreHistoryItem(item);
                          setActiveTab('generate');
                        }}
                        className="p-2.5 bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all border border-slate-100 hover:border-emerald-100 shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="p-2.5 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-slate-100 hover:border-rose-100 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ChevronLeft className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${expandedItem === item.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                
                  {expandedItem === item.id && (
                    <div
                      className="border-t border-slate-100 bg-slate-50/30"
                    >
                      <div className="p-8">
                        <div className="prose prose-slate prose-sm max-w-none font-bold text-slate-600 leading-relaxed">
                          <ReactMarkdown>{item.result}</ReactMarkdown>
                        </div>
                        
                        <div className="mt-8 flex sm:hidden items-center gap-3">
                          <button
                            onClick={() => handleCopy(item.id, item.result || '')}
                            className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-2"
                          >
                            {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            نسخ
                          </button>
                          <button
                            onClick={() => {
                              restoreHistoryItem(item);
                              setActiveTab('generate');
                            }}
                            className="flex-1 py-3 bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            استعادة
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </CrystalCard>
            ))
          )}
        </div>
      </div>
  );
};

export default HistoryView;
