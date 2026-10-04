import React, { useState } from 'react';
import { X, Folder, Copy, Check, Download, ExternalLink, HardDrive, Compass } from 'lucide-react';
import { DownloadTask } from '../types';

interface FolderLocationModalProps {
  task: DownloadTask | null;
  onClose: () => void;
  onDownloadToBrowser: (task: DownloadTask) => void;
}

export const FolderLocationModal: React.FC<FolderLocationModalProps> = ({
  task,
  onClose,
  onDownloadToBrowser,
}) => {
  const [copied, setCopied] = useState(false);

  if (!task) return null;

  const targetPath = task.finalFilePath || task.saveDir;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100">
                Vị trí lưu trữ tệp video
              </h2>
              <p className="text-xs text-neutral-400 truncate max-w-xs">
                {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Path Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Đường dẫn tệp trên ổ đĩa máy tính:
            </label>
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-3">
              <span className="font-mono text-xs text-neutral-200 break-all select-all flex-1">
                {targetPath}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          {/* Guide description */}
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 text-xs space-y-2.5 text-neutral-300">
            <div className="flex items-start gap-2">
              <Compass className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-100">Cách tìm và mở tệp:</p>
                <p className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                  1. <strong>Nếu bạn dùng trình duyệt:</strong> Nhấn nút xanh <em>&quot;Lưu về máy (.mp4)&quot;</em> bên dưới để tải trực tiếp file về thư mục <strong>Downloads</strong> của máy tính (hoặc bấm phím tắt <kbd className="font-mono bg-neutral-800 px-1 py-0.5 rounded text-neutral-200">Ctrl + J</kbd> để mở danh sách tải).
                </p>
                <p className="text-neutral-400 text-[11px] mt-1 leading-relaxed">
                  2. <strong>Nếu chạy script Python trên máy tính:</strong> Mở File Explorer trên Windows (phím tắt <kbd className="font-mono bg-neutral-800 px-1 py-0.5 rounded text-neutral-200">Windows + E</kbd>), dán đường dẫn đã sao chép ở trên vào thanh địa chỉ để vào ngay thư mục chứa video.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <button
            onClick={() => {
              onDownloadToBrowser(task);
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Lưu file .mp4 về máy ngay</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
