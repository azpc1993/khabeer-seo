'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, History, Loader2, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationLog {
  id: string;
  pageUrl: string;
  action: string;
  timestamp: string;
  reason: string;
}

export const AutoSeoEngine: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [level, setLevel] = useState<'normal' | 'professional' | 'competitor'>('professional');
  const [logs, setLogs] = useState<OptimizationLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock logs
  useEffect(() => {
    setLogs([
      { id: '1', pageUrl: '/seo', action: 'تحديث العنوان و Meta Description', timestamp: '2026-04-11 10:00', reason: 'انخفاض CTR' },
      { id: '2', pageUrl: '/content', action: 'إضافة قسم FAQ', timestamp: '2026-04-10 15:30', reason: 'غياب المحتوى التنافسي' },
    ]);
  }, []);

  const toggleEngine = () => {
    setIsEnabled(!isEnabled);
    toast.success(isEnabled ? 'تم إيقاف محرك السيو التلقائي' : 'تم تفعيل محرك السيو التلقائي');
  };

  const runManualCheck = () => {
    setIsProcessing(true);
    toast.info('جاري فحص الصفحات...');
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('تم فحص الصفحات وإجراء التحسينات اللازمة');
      setLogs(prev => [{
        id: Date.now().toString(),
        pageUrl: '/salla-seo',
        action: 'تحسين المحتوى وإضافة Schema',
        timestamp: new Date().toLocaleString('ar-SA'),
        reason: 'تراجع الترتيب'
      }, ...prev]);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Auto SEO Engine</h1>
          <p className="text-slate-500 font-medium">نظام التحسين التلقائي للمحتوى</p>
        </div>
        <button 
          onClick={runManualCheck}
          disabled={isProcessing || !isEnabled}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} 
          فحص يدوي الآن
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${isEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">حالة المحرك</h3>
              <p className="text-sm text-slate-500">{isEnabled ? 'المحرك يعمل حالياً' : 'المحرك متوقف'}</p>
            </div>
          </div>
          <button 
            onClick={toggleEngine}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${isEnabled ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {isEnabled ? 'إيقاف المحرك' : 'تفعيل المحرك'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">مستوى التحسين</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value as 'normal' | 'professional' | 'competitor')}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
            >
              <option value="normal">عادي</option>
              <option value="professional">احترافي</option>
              <option value="competitor">منافس قوي</option>
            </select>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <input 
              type="checkbox" 
              checked={autoApply} 
              onChange={() => setAutoApply(!autoApply)}
              className="w-5 h-5 accent-emerald-600"
            />
            <label className="text-sm font-bold text-slate-700">تطبيق التحسينات تلقائياً (Auto Apply)</label>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <History size={20} className="text-slate-400" />
          <h3 className="font-black text-slate-900">سجل العمليات</h3>
        </div>
        <table className="w-full text-right">
          <thead>
            <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50">
              <th className="p-4">الرابط</th>
              <th className="p-4">الإجراء</th>
              <th className="p-4">السبب</th>
              <th className="p-4">التوقيت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="text-sm font-bold text-slate-700">
                <td className="p-4 text-indigo-600">{log.pageUrl}</td>
                <td className="p-4">{log.action}</td>
                <td className="p-4 text-slate-500">{log.reason}</td>
                <td className="p-4 text-slate-400">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
