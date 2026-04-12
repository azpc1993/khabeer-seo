import React from 'react';

interface Props {
  title: string;
  description: string;
  url: string;
  onTitleChange?: (newTitle: string) => void;
  onDescriptionChange?: (newDescription: string) => void;
}

export const GoogleSnippetPreview = ({ title, description, url, onTitleChange, onDescriptionChange }: Props) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 max-w-2xl group transition-all hover:border-emerald-200 dark:border-emerald-800 hover:shadow-2xl">
      <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <span className="truncate">{url}</span>
      </div>
      
      <h3 
        contentEditable={!!onTitleChange}
        onBlur={(e) => onTitleChange?.(e.currentTarget.innerText)}
        suppressContentEditableWarning={true}
        className={`text-xl text-blue-700 font-medium mb-2 leading-tight outline-none focus:bg-blue-50/50 rounded px-1 -mx-1 transition-colors ${onTitleChange ? 'cursor-text hover:underline' : 'cursor-pointer hover:underline'}`}
      >
        {title || 'أدخل عنوان السيو هنا...'}
      </h3>
      
      <p 
        contentEditable={!!onDescriptionChange}
        onBlur={(e) => onDescriptionChange?.(e.currentTarget.innerText)}
        suppressContentEditableWarning={true}
        className="text-sm text-slate-600 leading-relaxed outline-none focus:bg-slate-50 rounded px-1 -mx-1 transition-colors cursor-text"
      >
        {description || 'أدخل وصف الميتا هنا لجذب الزوار من محركات البحث...'}
      </p>
      
      {(onTitleChange || onDescriptionChange) && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">معاينة جوجل (قابلة للتعديل)</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSnippetPreview;
