'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4" dir="rtl">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-none p-8 text-center border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              لقد واجهنا مشكلة أثناء تحميل هذه الصفحة. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-50 dark:bg-emerald-900/100 dark:hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            >
              <RefreshCcw className="w-5 h-5" />
              تحديث الصفحة
            </button>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="mt-6 text-left bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-auto text-xs text-slate-800 dark:text-slate-300 font-mono" dir="ltr">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
