import React from 'react';
import { ArrowDownCircle, CheckCircle2, HardDrive, Zap } from 'lucide-react';
import { formatBytes } from '../utils/deobfuscator';

interface StatsBarProps {
  activeCount: number;
  completedCount: number;
  currentSpeed: string;
  totalBytesDownloaded: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  activeCount,
  completedCount,
  currentSpeed,
  totalBytesDownloaded,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400 font-medium">Tác vụ đang tải</p>
          <p className="text-xl font-bold text-neutral-100 font-mono tabular-nums mt-1">
            {activeCount}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
          <ArrowDownCircle className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400 font-medium">Đã hoàn thành & Gộp</p>
          <p className="text-xl font-bold text-neutral-100 font-mono tabular-nums mt-1">
            {completedCount}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400 font-medium">Tốc độ thời gian thực</p>
          <p className="text-xl font-bold text-neutral-100 font-mono tabular-nums mt-1">
            {currentSpeed}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400 font-medium">Dữ liệu đã xử lý</p>
          <p className="text-xl font-bold text-neutral-100 font-mono tabular-nums mt-1">
            {formatBytes(totalBytesDownloaded)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
          <HardDrive className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
