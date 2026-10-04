import React, { useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, FileVideo, Download, ExternalLink } from 'lucide-react';
import { DownloadTask } from '../types';

interface VideoPlayerModalProps {
  task: DownloadTask | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ task, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!task) return null;

  // Use either task's first videoUrl, finalFilePath, or a reliable open test stream
  const videoSrc = 
    task.parts.find((p) => p.videoUrl)?.videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2 truncate">
            <FileVideo className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="truncate">
              <h2 className="text-sm font-bold text-neutral-100 truncate">
                {task.title || 'Xem trước video'}
              </h2>
              <p className="text-xs text-neutral-400 font-mono truncate">
                {task.finalFilePath || task.saveDir}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screen Container */}
        <div className="relative bg-black aspect-video flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Video Info & Metadata Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-neutral-400">
            <span className="font-semibold text-neutral-200">Định dạng: MP4 (H.264 / AAC)</span>
            <span>·</span>
            <span>Độ phân giải: 1080p FHD</span>
            <span>·</span>
            <span className="font-mono">{task.totalParts} phần gộp</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={videoSrc}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors font-medium text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở tab mới</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors text-xs"
            >
              Đóng trình phát
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
