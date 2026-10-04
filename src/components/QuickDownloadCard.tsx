import React, { useState } from 'react';
import { Download, Sparkles, Folder, Play, CheckCircle2, FileText, Info } from 'lucide-react';
import { AppSettings } from '../types';

interface QuickDownloadCardProps {
  onAddAndStartTasks: (urls: string[], saveDir: string, customName: string, deleteParts: boolean) => void;
  settings: AppSettings;
  onOpenPythonTab: () => void;
}

export const QuickDownloadCard: React.FC<QuickDownloadCardProps> = ({
  onAddAndStartTasks,
  settings,
  onOpenPythonTab,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [saveDir, setSaveDir] = useState(settings.defaultSaveDir);
  const [customName, setCustomName] = useState('');
  const [deleteParts, setDeleteParts] = useState(settings.deletePartsAfterMerge);
  const [error, setError] = useState('');

  const parsedUrls = urlInput
    .split('\n')
    .map((u) => u.trim())
    .filter((u) => u.length > 0);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedUrls.length === 0) {
      setError('Vui lòng dán ít nhất 1 link phim để tải.');
      return;
    }
    setError('');
    onAddAndStartTasks(parsedUrls, saveDir, customName, deleteParts);
    setUrlInput('');
    setCustomName('');
  };

  const handlePasteSamples = () => {
    const samples = [
      'https://www.teleserye.su/fpj-batang-quiapo-episode-515',
      'https://www.teleserye.su/can-t-buy-me-love-full-episode-120',
    ].join('\n');
    setUrlInput(samples);
    setError('');
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Title & Help Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" />
            <span>Khu vực nhập link tải phim & xử lý FFmpeg</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dán link tập phim Teleserye bên dưới để tự động giải mã JS, tải từng phần và gộp thành 1 video hoàn chỉnh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPythonTab}
            className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-950/50 px-2.5 py-1.5 rounded-lg border border-blue-800/60 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tải file Python .py về máy</span>
          </button>
        </div>
      </div>

      {/* Info Callout: Where does the download go? */}
      <div className="bg-blue-950/40 border border-blue-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-200">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-100">
            📍 File tải xong sẽ lưu ở đâu?
          </p>
          <p className="text-[11px] text-blue-200/90 leading-relaxed">
            • <strong>Trên trình duyệt web này:</strong> Khi tác vụ gộp xong, bạn nhấn nút xanh <span className="bg-emerald-800/60 px-1.5 py-0.5 rounded text-emerald-200 font-medium">⬇ Tải về máy (.mp4)</span> trong bảng để lưu trực tiếp vào thư mục <strong>Downloads</strong> của máy tính (hoặc mở bằng phím tắt <kbd className="font-mono bg-blue-900/80 px-1 py-0.5 rounded">Ctrl + J</kbd>).
            <br />
            • <strong>Chạy bằng Python trên PC:</strong> Khi chạy file script Python ở tab &quot;Code Python Hiện Đại&quot;, video sẽ tự động tải và gộp trực tiếp vào thư mục ổ đĩa bạn chọn bên dưới (ví dụ: <code className="font-mono text-blue-300">D:\Downloads\Teleserye</code>).
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleStart} className="space-y-3">
        {error && (
          <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800 px-3 py-1.5 rounded-lg">
            {error}
          </p>
        )}

        {/* URL Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-neutral-200">
              Dán các link phim vào đây (mỗi link một dòng):
            </label>
            <button
              type="button"
              onClick={handlePasteSamples}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium text-[11px]"
            >
              <Sparkles className="w-3 h-3" />
              <span>Dán link mẫu để thử nghiệm</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (error) setError('');
            }}
            placeholder="https://www.teleserye.su/phim-tap-1&#10;https://www.teleserye.su/phim-tap-2"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 font-mono placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Target Directory */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-300">
              Thư mục lưu video trên máy
            </label>
            <div className="relative">
              <Folder className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={saveDir}
                onChange={(e) => setSaveDir(e.target.value)}
                placeholder="D:\Downloads\Teleserye"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Custom Name */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-300">
              Tên file tùy chỉnh (Tùy chọn)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Để trống sẽ tự lấy tên phim"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Button & Checkbox */}
          <div className="flex flex-col justify-end gap-1.5">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>BẮT ĐẦU TẢI NGAY {parsedUrls.length > 0 ? `(${parsedUrls.length} link)` : ''}</span>
            </button>
          </div>
        </div>

        {/* Delete parts toggle */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={deleteParts}
              onChange={(e) => setDeleteParts(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-950 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Tự động dọn dẹp các part tạm thời sau khi FFmpeg gộp thành file Full</span>
          </label>

          <span className="font-mono text-neutral-500">
            {parsedUrls.length} đường dẫn sẵn sàng
          </span>
        </div>
      </form>
    </div>
  );
};
