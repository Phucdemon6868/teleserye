import React, { useState } from 'react';
import { X, Folder, Plus, Sparkles, AlertCircle, HardDrive, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (urls: string[], saveDir: string, customName: string, deleteParts: boolean) => void;
  settings: AppSettings;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTasks,
  settings,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [saveDir, setSaveDir] = useState(settings.defaultSaveDir);
  const [customName, setCustomName] = useState('');
  const [deleteParts, setDeleteParts] = useState(settings.deletePartsAfterMerge);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parsedUrls = urlInput
    .split('\n')
    .map((u) => u.trim())
    .filter((u) => u.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedUrls.length === 0) {
      setError('Vui lòng nhập ít nhất một đường dẫn liên kết.');
      return;
    }
    if (!saveDir.trim()) {
      setError('Vui lòng chỉ định thư mục lưu trữ.');
      return;
    }

    onAddTasks(parsedUrls, saveDir.trim(), customName.trim(), deleteParts);
    setUrlInput('');
    setCustomName('');
    setError('');
    onClose();
  };

  const handlePasteSamples = () => {
    const samples = [
      'https://www.teleserye.su/fpj-batang-quiapo-episode-515',
      'https://www.teleserye.su/incognito-action-series-ep-42',
      'https://www.teleserye.su/pamilya-sagrado-part-full-33',
    ].join('\n');
    setUrlInput(samples);
    setError('');
  };

  const pathPresets = [
    'D:\\Downloads\\Teleserye',
    'C:\\Users\\Public\\Videos',
    'E:\\Movies\\Series',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100">
                Thêm tác vụ tải video mới
              </h2>
              <p className="text-xs text-neutral-400">
                Hỗ trợ xử lý hàng loạt link tập phim đa phần
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-neutral-200">
                Danh sách liên kết phim (mỗi link một dòng)
              </label>
              <button
                type="button"
                onClick={handlePasteSamples}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Dán link mẫu</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (error) setError('');
              }}
              placeholder={`https://www.teleserye.su/phim-tap-1\nhttps://www.teleserye.su/phim-tap-2`}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 font-mono placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
            />
            <div className="flex justify-between items-center text-[11px] text-neutral-500 font-mono">
              <span>Đã nhập: {parsedUrls.length} liên kết</span>
              <span>Tự động nhận diện số phần (Part 1, 2, 3...)</span>
            </div>
          </div>

          {/* Save Directory */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-200">
              Thư mục lưu trữ video
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Folder className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={saveDir}
                  onChange={(e) => setSaveDir(e.target.value)}
                  placeholder="D:\Downloads\Teleserye"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick path preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-neutral-500">Đường dẫn nhanh:</span>
              {pathPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setSaveDir(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                    saveDir === preset
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-600/40'
                      : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Video Name & Subfolder rule */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-200">
              Tên file tùy chỉnh (Tùy chọn)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Để trống sẽ tự động đặt tên theo tiêu đề phim và tạo thư mục con"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-neutral-500">
              Ví dụ định dạng file ra: <span className="font-mono text-neutral-400">{customName || '{Tên_Phim}'} - Full.mp4</span>
            </p>
          </div>

          {/* Checkbox Options */}
          <div className="pt-2 border-t border-neutral-800">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={deleteParts}
                onChange={(e) => setDeleteParts(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Tự động xóa các file Part (.mp4 và .ts tạm) sau khi FFmpeg gộp thành công</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm {parsedUrls.length > 0 ? `(${parsedUrls.length})` : ''} tác vụ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
