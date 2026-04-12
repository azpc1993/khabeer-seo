'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, BarChart2, ShoppingBag, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useIntegrationsStore } from '@/store/integrationsStore';

export const IntegrationsPanel = () => {
  const { gsc, ga4, salla, setGscState, setGa4State, setSallaState } = useIntegrationsStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loadingGsc, setLoadingGsc] = useState(false);
  const [loadingGa4, setLoadingGa4] = useState(false);
  const [loadingSalla, setLoadingSalla] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const integration = searchParams.get('integration');
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clean up URL
      router.replace('/settings');
      return;
    }

    if (success === 'true') {
      if (integration === 'gsc') {
        fetchGscSites();
      } else if (integration === 'ga4') {
        fetchGa4Properties();
      } else if (integration === 'salla') {
        fetchSallaData();
      }
      // Clean up URL
      router.replace('/settings');
    }
  }, [searchParams, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGscSites = async () => {
    setLoadingGsc(true);
    try {
      const res = await fetch('/api/integrations/gsc/sites');
      const data = await res.json();
      if (data.success) {
        setGscState({ connected: true, sites: data.sites, lastSync: new Date().toISOString() });
      } else {
        throw new Error(data.error || 'Failed to fetch sites');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoadingGsc(false);
    }
  };

  const fetchGa4Properties = async () => {
    setLoadingGa4(true);
    try {
      const res = await fetch('/api/integrations/ga4/properties');
      const data = await res.json();
      if (data.success) {
        setGa4State({ connected: true, properties: data.properties, lastSync: new Date().toISOString() });
      } else {
        throw new Error(data.error || 'Failed to fetch properties');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoadingGa4(false);
    }
  };

  const fetchSallaData = async () => {
    setLoadingSalla(true);
    try {
      const res = await fetch('/api/integrations/salla/data');
      const data = await res.json();
      if (data.success) {
        setSallaState({ 
          connected: true, 
          storeName: data.storeName, 
          productsCount: data.productsCount, 
          ordersCount: data.ordersCount,
          lastSync: new Date().toISOString() 
        });
      } else {
        throw new Error(data.error || 'Failed to fetch Salla data');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoadingSalla(false);
    }
  };

  const handleConnectGsc = async () => {
    setLoadingGsc(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations/gsc/connect', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to connect');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLoadingGsc(false);
    }
  };

  const handleConnectGa4 = async () => {
    setLoadingGa4(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations/ga4/connect', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to connect');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLoadingGa4(false);
    }
  };

  const handleConnectSalla = async () => {
    setLoadingSalla(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations/salla/connect', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to connect');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLoadingSalla(false);
    }
  };

  const fetchGscData = async (siteUrl: string) => {
    setLoadingGsc(true);
    try {
      const res = await fetch(`/api/integrations/gsc/data?siteUrl=${encodeURIComponent(siteUrl)}`);
      const data = await res.json();
      if (data.success) {
        setGscState({ selectedSite: siteUrl, metrics: data.metrics, lastSync: new Date().toISOString() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGsc(false);
    }
  };

  const fetchGa4Data = async (propertyId: string) => {
    setLoadingGa4(true);
    try {
      const res = await fetch(`/api/integrations/ga4/data?propertyId=${encodeURIComponent(propertyId)}`);
      const data = await res.json();
      if (data.success) {
        setGa4State({ selectedProperty: propertyId, metrics: data.metrics, lastSync: new Date().toISOString() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGa4(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GSC Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Google Search Console</h3>
              <p className="text-xs text-slate-500 font-bold">تحليل الكلمات والصفحات الفعلية</p>
            </div>
          </div>

          {!gsc.connected ? (
            <button 
              onClick={handleConnectGsc}
              disabled={loadingGsc}
              className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loadingGsc ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ربط الحساب'}
            </button>
          ) : (
            <div className="mt-4 space-y-4 flex-1">
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 className="w-4 h-4" />
                متصل
              </div>
              
              {gsc.sites.length > 0 && (
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-purple-500"
                  value={gsc.selectedSite || ''}
                  onChange={(e) => fetchGscData(e.target.value)}
                >
                  <option value="" disabled>اختر الموقع</option>
                  {gsc.sites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              )}

              {gsc.metrics && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold">النقرات</p>
                    <p className="text-lg font-black text-slate-900">{gsc.metrics.clicks}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold">الظهور</p>
                    <p className="text-lg font-black text-slate-900">{gsc.metrics.impressions}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold">CTR</p>
                    <p className="text-lg font-black text-slate-900">{gsc.metrics.ctr}%</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold">الترتيب</p>
                    <p className="text-lg font-black text-slate-900">{gsc.metrics.position}</p>
                  </div>
                </div>
              )}

              {gsc.lastSync && (
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-auto pt-4">
                  <RefreshCw className="w-3 h-3" />
                  آخر مزامنة: {new Date(gsc.lastSync).toLocaleString('ar-SA')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* GA4 Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Google Analytics</h3>
              <p className="text-xs text-slate-500 font-bold">تحليل زيارات المستخدمين</p>
            </div>
          </div>

          {!ga4.connected ? (
            <button 
              onClick={handleConnectGa4}
              disabled={loadingGa4}
              className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loadingGa4 ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ربط الحساب'}
            </button>
          ) : (
            <div className="mt-4 space-y-4 flex-1">
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 className="w-4 h-4" />
                متصل
              </div>
              
              {ga4.properties.length > 0 && (
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-purple-500"
                  value={ga4.selectedProperty || ''}
                  onChange={(e) => fetchGa4Data(e.target.value)}
                >
                  <option value="" disabled>اختر Property</option>
                  {ga4.properties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.name}</option>
                  ))}
                </select>
              )}

              {ga4.metrics && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold">المستخدمين</p>
                    <p className="text-lg font-black text-slate-900">{ga4.metrics.users}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold">الجلسات</p>
                    <p className="text-lg font-black text-slate-900">{ga4.metrics.sessions}</p>
                  </div>
                </div>
              )}

              {ga4.lastSync && (
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-auto pt-4">
                  <RefreshCw className="w-3 h-3" />
                  آخر مزامنة: {new Date(ga4.lastSync).toLocaleString('ar-SA')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Salla Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900">منصة سلة</h3>
              <p className="text-xs text-slate-500 font-bold">تحليل المنتجات والأداء</p>
            </div>
          </div>

          {!salla.connected ? (
            <button 
              onClick={handleConnectSalla}
              disabled={loadingSalla}
              className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loadingSalla ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ربط المتجر'}
            </button>
          ) : (
            <div className="mt-4 space-y-4 flex-1">
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 className="w-4 h-4" />
                متصل
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-bold">اسم المتجر</p>
                  <p className="text-sm font-black text-slate-900">{salla.storeName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 font-bold">المنتجات</p>
                    <p className="text-lg font-black text-slate-900">{salla.productsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">الطلبات</p>
                    <p className="text-lg font-black text-slate-900">{salla.ordersCount}</p>
                  </div>
                </div>
              </div>

              {salla.lastSync && (
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-auto pt-4">
                  <RefreshCw className="w-3 h-3" />
                  آخر مزامنة: {new Date(salla.lastSync).toLocaleString('ar-SA')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
