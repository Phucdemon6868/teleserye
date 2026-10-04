import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Folder, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100">
              Cấu hình hệ thống & Quy trình FFmpeg
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Thiết lập thư mục lưu trữ, giới hạn luồng tải và tối ưu hóa chuyển đổi video
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6 shadow-lg">
        {/* Storage */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-400" />
            <span>Thư mục lưu trữ mặc định</span>
          </h3>
          <div>
            <input
              type="text"
              value={formData.defaultSaveDir}
              onChange={(e) => setFormData({ ...formData, defaultSaveDir: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Các phim tải về sẽ tự động tạo thư mục con theo tên phim bên trong thư mục này.
            </p>
          </div>
        </div>

        {/* FFmpeg & Clean up */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>Tối ưu hóa ổ cứng & Ghép nối</span>
          </h3>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.deletePartsAfterMerge}
                onChange={(e) => setFormData({ ...formData, deletePartsAfterMerge: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-blue-600 focus:ring-0"
              />
              <span>Tự động xóa các file con Part .mp4 sau khi FFmpeg gộp thành file Full</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.soundNotification}
                onChange={(e) => setFormData({ ...formData, soundNotification: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-blue-600 focus:ring-0"
              />
              <span>Phát âm báo khi hoàn tất tất cả tác vụ trong hàng đợi</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Đường dẫn tệp thực thi FFmpeg (PATH)
            </label>
            <input
              type="text"
              value={formData.ffmpegPath}
              onChange={(e) => setFormData({ ...formData, ffmpegPath: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Nếu FFmpeg đã được thêm vào biến môi trường hệ thống (System PATH), giữ nguyên là &apos;ffmpeg&apos;.
            </p>
          </div>
        </div>

        {/* Concurrency and Quality */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Hiệu năng & Luồng tải</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Số tác vụ tải song song tối đa
              </label>
              <select
                value={formData.maxConcurrentTasks}
                onChange={(e) => setFormData({ ...formData, maxConcurrentTasks: parseInt(e.target.value, 10) })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value={1}>1 tác vụ (Tiết kiệm băng thông)</option>
                <option value={2}>2 tác vụ song song</option>
                <option value={3}>3 tác vụ song song (Khuyến nghị)</option>
                <option value={4}>4 tác vụ song song</option>
                <option value={6}>6 tác vụ (Mạng tốc độ cao)</option>
                <option value={8}>8 tác vụ cực đại</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Ưu tiên chất lượng video
              </label>
              <select
                value={formData.videoQuality}
                onChange={(e) => setFormData({ ...formData, videoQuality: e.target.value as any })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="highest">Cao nhất (Tự động chọn 1080p/4K nếu có)</option>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD (Tải nhanh)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã lưu thành công!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu cấu hình</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
