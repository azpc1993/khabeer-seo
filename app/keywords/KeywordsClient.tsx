'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKeywords } from '@/context/KeywordsContext';
import { PrimaryKeywordCard } from '@/components/keywords/PrimaryKeywordCard';
import { Search, Send, AlertCircle } from 'lucide-react';
import { searchKeywords, KeywordSearchResponse } from '@/services/keywordsService';
import { useNotificationsStore } from '@/store/notificationsStore';

type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export default function KeywordsClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const { selectedKeywords, addKeyword } = useKeywords();
  const router = useRouter();
  const { addNotification } = useNotificationsStore();

  const [results, setResults] = useState<KeywordSearchResponse | null>(null);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setStatus('loading');
    setError(null);
    setResults(null);

    try {
      const data = await searchKeywords(searchTerm);
      
      if (data.pks.length === 0 && data.lsi.length === 0) {
        setStatus('empty');
      } else {
        setResults(data);
        setStatus('success');
        addNotification({
          type: 'search',
          title: 'نتائج البحث جاهزة',
          message: `اكتمل تحليل الكلمات المفتاحية لـ "${searchTerm}".`,
          icon: Search,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-500/10',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pb-32">
      {/* Search Input */}
      <div className="relative mb-8">
        <input 
          type="text" 
          placeholder="أدخل الكلمة المفتاحية..."
          className="w-full p-4 pr-12 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Search className="absolute right-4 top-4 text-gray-400" />
      </div>

      {status === 'loading' && (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 p-6 rounded-2xl text-red-600 flex items-center gap-3">
          <AlertCircle />
          <p>{error}</p>
        </div>
      )}

      {status === 'empty' && (
        <div className="text-center text-gray-500 py-10">
          <p>لا توجد نتائج لهذه الكلمة.</p>
        </div>
      )}

      {status === 'success' && results && (
        <>
          {/* PKs Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-indigo-600">✦</span> الكلمات المفتاحية الأساسية (PKs)
            </h2>
            {results.pks.map((pk, i) => (
              <PrimaryKeywordCard key={i} {...pk} onAdd={() => addKeyword(pk.keyword)} />
            ))}
          </section>

          {/* LSI Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">الكلمات الثانوية (LSI)</h2>
            <div className="flex flex-wrap gap-2">
              {results.lsi.map((keyword, i) => (
                <div key={i} className="bg-white border border-gray-100 px-4 py-2 rounded-full flex gap-3 items-center shadow-sm">
                  <span className="text-sm">{keyword}</span>
                  <button onClick={() => addKeyword(keyword)} className="text-indigo-600 font-bold">+</button>
                </div>
              ))}
            </div>
          </section>

          {/* Search Intent Card */}
          <div className="bg-[#0f172a] text-white p-6 rounded-3xl mb-8">
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
               <span>📢</span> نية البحث
             </h3>
             <p className="text-gray-300 text-sm leading-relaxed">{results.intent}</p>
          </div>
        </>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-2xl mx-auto">
        <button 
          disabled={selectedKeywords.length === 0}
          onClick={() => router.push('/generate')}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition
            ${selectedKeywords.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          الذهاب للوحة التوليد ({selectedKeywords.length})
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
