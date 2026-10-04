import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  FolderOpen, 
  Eye, 
  ListFilter, 
  ExternalLink,
  Layers,
  FileCheck2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Download
} from 'lucide-react';
import { DownloadTask } from '../types';
import { formatBytes } from '../utils/deobfuscator';

interface TaskQueueProps {
  tasks: DownloadTask[];
  onStartTask: (taskId: string) => void;
  onPauseTask: (taskId: string) => void;
  onRetryTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStartAll: () => void;
  onStopAll: () => void;
  onClearCompleted: () => void;
  onOpenFolder: (task: DownloadTask) => void;
  onPreviewVideo: (task: DownloadTask) => void;
  onInspectParts: (task: DownloadTask) => void;
  onDownloadToBrowser: (task: DownloadTask) => void;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({
  tasks,
  onStartTask,
  onPauseTask,
  onRetryTask,
  onDeleteTask,
  onStartAll,
  onStopAll,
  onClearCompleted,
  onOpenFolder,
  onPreviewVideo,
  onInspectParts,
  onDownloadToBrowser,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'waiting'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.url.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'active') {
      return ['fetching_parts', 'downloading', 'converting_ts', 'merging'].includes(task.status);
    }
    if (filter === 'completed') {
      return task.status === 'completed';
    }
    if (filter === 'waiting') {
      return task.status === 'idle' || task.status === 'paused' || task.status === 'error';
    }
    return true;
  });

  const getStatusBadge = (task: DownloadTask) => {
    switch (task.status) {
      case 'idle':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
            <span>Sẵn sàng</span>
          </span>
        );
      case 'fetching_parts':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-sky-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Đang tìm & giải mã JS...</span>
          </span>
        );
      case 'downloading':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Đang tải Phần {task.currentPart}/{task.totalParts}</span>
          </span>
        );
      case 'converting_ts':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Chuyển sang MPEG-TS...</span>
          </span>
        );
      case 'merging':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-purple-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>FFmpeg đang gộp file...</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hoàn thành & Đã gộp</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Tạm dừng</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{task.errorMessage || 'Lỗi xử lý'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
      {/* Top Filter and Controls Bar */}
      <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm theo tên phim hoặc URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 w-64"
          />

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Tất cả ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'active'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Đang chạy
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'completed'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Đã xong
            </button>
            <button
              onClick={() => setFilter('waiting')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'waiting'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Chờ/Tạm dừng
            </button>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartAll}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Bắt đầu tất cả</span>
          </button>
          <button
            onClick={onStopAll}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Dừng tất cả</span>
          </button>
          <button
            onClick={onClearCompleted}
            className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Dọn mục đã xong
          </button>
        </div>
      </div>

      {/* Task Table */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto text-neutral-500 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-neutral-300">Không có tác vụ nào</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Không tìm thấy tác vụ khớp với từ khóa tìm kiếm.'
              : 'Dán liên kết trang phim Teleserye vào ô bên trên để bắt đầu tải.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 tracking-wider">
                <th className="py-3 px-4">TÊN PHIM & LIÊN KẾT</th>
                <th className="py-3 px-4">CÁC PHẦN (PARTS)</th>
                <th className="py-3 px-4">TIẾN TRÌNH & DUNG LƯỢNG</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {filteredTasks.map((task) => {
                const isActive = ['downloading', 'fetching_parts', 'converting_ts', 'merging'].includes(task.status);
                const isCompleted = task.status === 'completed';

                return (
                  <tr key={task.id} className="hover:bg-neutral-800/40 transition-colors">
                    {/* Column 1: Title and link info */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-100 text-sm truncate" title={task.title}>
                          {task.title || 'Đang nhận diện tiêu đề...'}
                        </span>
                        <div className="flex items-center gap-2 text-neutral-400 text-[11px] mt-1">
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-400 truncate max-w-[220px] flex items-center gap-1"
                          >
                            <span>{task.url}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate" title={task.saveDir}>
                          {task.saveDir}
                        </span>
                      </div>
                    </td>

                    {/* Column 2: Parts breakdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.parts.length > 0 ? (
                            task.parts.map((p) => {
                              let bg = 'bg-neutral-800 text-neutral-400';
                              if (p.status === 'completed') bg = 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50';
                              else if (p.status === 'downloading') bg = 'bg-blue-950/60 text-blue-300 border border-blue-800/50 animate-pulse';
                              else if (p.status === 'converting') bg = 'bg-purple-950/60 text-purple-300 border border-purple-800/50';
                              else if (p.status === 'error') bg = 'bg-rose-950/60 text-rose-300 border border-rose-800/50';

                              return (
                                <button
                                  key={p.partNumber}
                                  onClick={() => onInspectParts(task)}
                                  title={`Phần ${p.partNumber}: ${p.progress}% (${p.status})`}
                                  className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded transition-transform hover:scale-105 ${bg}`}
                                >
                                  P{p.partNumber}
                                  {p.status === 'downloading' && ` · ${p.progress}%`}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-neutral-500 text-[11px] italic">
                              Đang quét số phần...
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onInspectParts(task)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 text-left flex items-center gap-1 mt-0.5"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Chi tiết luồng</span>
                        </button>
                      </div>
                    </td>

                    {/* Column 3: Progress & Speed */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                          <span className="text-neutral-200 font-semibold">{task.progress}%</span>
                          <span className="text-neutral-400">
                            {formatBytes(task.downloadedBytes)} / {formatBytes(task.totalBytes)}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : task.status === 'error'
                                ? 'bg-rose-500'
                                : 'bg-gradient-to-r from-blue-600 to-sky-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
                          />
                        </div>

                        {/* Speed & ETA */}
                        {isActive && (
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 tabular-nums">
                            <span>Tốc độ: {task.speed}</span>
                            <span>ETA: {task.eta}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Status badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(task)}
                    </td>

                    {/* Column 5: Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                        {/* Direct Browser Download Button if completed */}
                        {isCompleted && (
                          <button
                            onClick={() => onDownloadToBrowser(task)}
                            title="Tải file video .mp4 trực tiếp về máy tính của bạn"
                            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Lưu về máy (.mp4)</span>
                          </button>
                        )}

                        {/* Open folder button */}
                        <button
                          onClick={() => onOpenFolder(task)}
                          title="Xem vị trí lưu file & đường dẫn thư mục"
                          className="px-2 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden xl:inline text-[11px]">Vị trí file</span>
                        </button>

                        {/* Video preview button */}
                        <button
                          onClick={() => onPreviewVideo(task)}
                          title="Xem thử video"
                          className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Pause / Resume */}
                        {isActive ? (
                          <button
                            onClick={() => onPauseTask(task.id)}
                            title="Tạm dừng"
                            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : task.status === 'completed' ? (
                          <button
                            onClick={() => onRetryTask(task.id)}
                            title="Tải lại từ đầu"
                            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onStartTask(task.id)}
                            title="Bắt đầu tải"
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          title="Xóa tác vụ"
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
