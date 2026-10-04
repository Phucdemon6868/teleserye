import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Copy, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { LogEntry } from '../types';

interface LogTerminalProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs, onClearLogs }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'packer' | 'ytdlp' | 'ffmpeg' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isExpanded]);

  const filteredLogs = logs.filter((log) => {
    if (logFilter !== 'all' && log.level !== logFilter) {
      return false;
    }
    if (searchTerm) {
      return (
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.taskTitle && log.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.taskTitle ? `(${l.taskTitle}) ` : ''}${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'packer':
        return <span className="text-cyan-400 font-semibold">[PACKER]</span>;
      case 'ytdlp':
        return <span className="text-blue-400 font-semibold">[yt-dlp]</span>;
      case 'ffmpeg':
        return <span className="text-purple-400 font-semibold">[FFMPEG]</span>;
      case 'success':
        return <span className="text-emerald-400 font-semibold">[SUCCESS]</span>;
      case 'error':
        return <span className="text-rose-400 font-semibold">[ERROR]</span>;
      default:
        return <span className="text-neutral-500">[INFO]</span>;
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg mt-6">
      {/* Terminal Title Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between cursor-pointer select-none hover:bg-neutral-950 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-200">
            Nhật ký thực thi hệ thống & FFmpeg ({logs.length})
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            {logs.length > 0 ? `Bản ghi mới nhất: ${logs[logs.length - 1].timestamp}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopyLogs}
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
            title="Sao chép toàn bộ nhật ký"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
            title="Xóa nhật ký"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Terminal Console */}
      {isExpanded && (
        <div className="p-3 bg-neutral-950">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-neutral-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[11px]">Lọc theo:</span>
              {(['all', 'packer', 'ytdlp', 'ffmpeg', 'error'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    logFilter === filter
                      ? 'bg-neutral-800 text-neutral-100 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3 h-3 text-neutral-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Tìm trong log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-md pl-7 pr-2.5 py-1 text-[11px] text-neutral-200 focus:outline-none focus:border-blue-500 font-mono w-44"
              />
            </div>
          </div>

          {/* Logs Output List */}
          <div 
            ref={logContainerRef}
            className="h-60 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1.5 text-neutral-300 pr-2"
          >
            {filteredLogs.length === 0 ? (
              <p className="text-neutral-600 italic py-4 text-center">
                Chưa có bản ghi nhật ký nào.
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 hover:bg-neutral-900/50 p-0.5 rounded">
                  <span className="text-neutral-600 select-none shrink-0 tabular-nums">
                    [{log.timestamp}]
                  </span>
                  <span className="shrink-0">{getLevelBadge(log.level)}</span>
                  {log.taskTitle && (
                    <span className="text-blue-400/80 shrink-0 max-w-[140px] truncate" title={log.taskTitle}>
                      [{log.taskTitle}]
                    </span>
                  )}
                  <span className="text-neutral-300 break-all select-text">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
