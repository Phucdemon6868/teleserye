import React from 'react';
import { X, Layers, ExternalLink, Copy, Check, Play, HardDrive, FileVideo } from 'lucide-react';
import { DownloadTask } from '../types';
import { formatBytes } from '../utils/deobfuscator';

interface PartDetailsModalProps {
  task: DownloadTask | null;
  onClose: () => void;
  onPreviewVideo: (task: DownloadTask) => void;
}

export const PartDetailsModal: React.FC<PartDetailsModalProps> = ({
  task,
  onClose,
  onPreviewVideo,
}) => {
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  if (!task) return null;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100 truncate max-w-md">
                Chi tiết các phần: {task.title}
              </h2>
              <p className="text-xs text-neutral-400">
                Tổng cộng {task.totalParts} phần video · Pipeline ghép nối FFmpeg
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Metadata Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between items-center text-neutral-400">
              <span>Đường dẫn gốc:</span>
              <a
                href={task.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
              >
                {task.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Thư mục đích:</span>
              <span className="font-mono text-neutral-200">{task.saveDir}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Xóa part sau khi gộp:</span>
              <span className="text-neutral-200">{task.deletePartsAfterMerge ? 'Bật (Tiết kiệm ổ cứng)' : 'Tắt'}</span>
            </div>
            {task.finalFilePath && (
              <div className="flex justify-between items-center text-neutral-400 pt-1 border-t border-neutral-900">
                <span>File gộp cuối cùng:</span>
                <span className="font-mono text-emerald-400 font-semibold">{task.finalFilePath}</span>
              </div>
            )}
          </div>

          {/* Parts List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-neutral-300">
              Danh sách các tập con ({task.parts.length} phần)
            </h3>
            
            {task.parts.map((part) => (
              <div
                key={part.partNumber}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-2 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-neutral-800 text-neutral-200 font-mono text-xs font-bold flex items-center justify-center">
                      #{part.partNumber}
                    </span>
                    <span className="text-xs font-semibold text-neutral-100">
                      {part.title || `Phần ${part.partNumber}`}
                    </span>
                    {part.resolution && (
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                        {part.resolution}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                    <span className="text-neutral-400">
                      {formatBytes(part.downloadedBytes)} / {formatBytes(part.totalBytes)}
                    </span>
                    <span className="font-semibold text-neutral-200">
                      {part.progress}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      part.status === 'completed'
                        ? 'bg-emerald-500'
                        : part.status === 'downloading'
                        ? 'bg-blue-500'
                        : part.status === 'error'
                        ? 'bg-rose-500'
                        : 'bg-neutral-700'
                    }`}
                    style={{ width: `${part.progress}%` }}
                  />
                </div>

                {/* Stream URL & Tools */}
                {part.videoUrl && (
                  <div className="flex items-center justify-between text-[11px] pt-1 text-neutral-400">
                    <span className="font-mono truncate max-w-sm text-neutral-500" title={part.videoUrl}>
                      Stream: {part.videoUrl}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(part.videoUrl!)}
                        className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] flex items-center gap-1 transition-colors"
                      >
                        {copiedUrl === part.videoUrl ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy link stream</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Merge Pipeline Info */}
          <div className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-xs space-y-1 text-neutral-400">
            <p className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <FileVideo className="w-4 h-4 text-purple-400" />
              <span>Quy trình xử lý ghép nối FFmpeg không giảm chất lượng (Lossless Concat):</span>
            </p>
            <p className="text-[11px] font-mono text-neutral-500">
              1. Tải các file MP4 từng phần qua yt-dlp và HTTP stream <br />
              2. Chuyển đổi trung gian sang MPEG-TS: <span className="text-neutral-400">ffmpeg -i part.mp4 -c copy -bsf:v h264_mp4toannexb part.ts</span> <br />
              3. Gộp các file TS nối tiếp: <span className="text-neutral-400">ffmpeg -f concat -safe 0 -i filelist.txt -c copy -bsf:a aac_adtstoasc Full.mp4</span> <br />
              4. Dọn dẹp các file rác và temp_merge_files.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <button
            onClick={() => onPreviewVideo(task)}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Xem thử video</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
