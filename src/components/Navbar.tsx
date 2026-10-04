import React from 'react';
import { Plus, Download, Terminal, Settings, Code, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'queue' | 'deobfuscator' | 'python' | 'settings';
  setActiveTab: (tab: 'queue' | 'deobfuscator' | 'python' | 'settings') => void;
  onOpenNewTaskModal: () => void;
  activeCount: number;
  totalSpeed: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTaskModal,
  activeCount,
  totalSpeed,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100 tracking-tight leading-tight">
              Teleserye Stream Pro
            </h1>
            <p className="text-xs text-neutral-400">
              Trình tải & gộp video đa phần
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Hàng đợi tải</span>
            {activeCount > 0 && (
              <span className="text-[10px] font-mono tabular-nums text-blue-400 ml-0.5">
                ({activeCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deobfuscator')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'deobfuscator'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Giải mã P.A.C.K.E.R</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'python'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code Python Hiện Đại</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cấu hình</span>
          </button>
        </nav>

        {/* Zone 3: Primary action & Network telemetry */}
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 tabular-nums">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{totalSpeed}</span>
            </div>
          )}

          <button
            onClick={onOpenNewTaskModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors rounded-lg flex items-center gap-2 shadow-sm shadow-blue-600/30 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm liên kết</span>
          </button>
        </div>
      </div>
    </header>
  );
};
