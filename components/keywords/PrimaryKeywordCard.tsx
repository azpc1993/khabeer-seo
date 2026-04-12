import { Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface PKProps {
  keyword: string;
  volume: string;
  cpc: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  trend: 'up' | 'stable' | 'down';
  onAdd: () => void;
}

export const PrimaryKeywordCard = ({ keyword, volume, cpc, difficulty, trend, onAdd }: PKProps) => {
  const trendLabel = { up: '↗ صاعد', stable: '→ مستقر', down: '↘ هابط' }[trend];
  const trendColor = { up: 'text-green-500', stable: 'text-orange-500', down: 'text-red-500' }[trend];
  const diffColor = { Easy: 'text-green-500', Medium: 'text-orange-500', Hard: 'text-red-500' }[difficulty];
  
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{keyword}</h3>
        <div className="flex gap-2">
          <button onClick={() => {
            navigator.clipboard.writeText(keyword);
            toast.success(`تم نسخ الكلمة: ${keyword}`);
          }} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Copy size={18}/></button>
          <button onClick={onAdd} className="flex items-center gap-1 bg-gray-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition">
            <Plus size={16}/> إضافة
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-gray-50 p-2 rounded-xl">
          <p className="text-[10px] text-gray-500">مرات الظهور</p>
          <p className="font-bold text-sm">{volume}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-xl">
          <p className="text-[10px] text-gray-500">سعر النقرة</p>
          <p className="font-bold text-sm">{cpc}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-xl">
          <p className="text-[10px] text-gray-500">الصعوبة</p>
          <p className={`font-bold text-sm ${diffColor}`}>{difficulty}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-xl">
          <p className="text-[10px] text-gray-500">الاتجاه</p>
          <p className={`font-bold text-sm ${trendColor}`}>
            {trendLabel}
          </p>
        </div>
      </div>
    </div>
  );
};
