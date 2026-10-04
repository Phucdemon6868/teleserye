export type TaskStatus = 
  | 'idle' 
  | 'fetching_parts' 
  | 'downloading' 
  | 'converting_ts' 
  | 'merging' 
  | 'completed' 
  | 'error' 
  | 'paused';

export interface PartInfo {
  partNumber: number;
  url: string;
  videoUrl?: string;
  title?: string;
  status: 'pending' | 'resolving' | 'downloading' | 'converting' | 'completed' | 'error';
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  speed: string; // e.g. "4.2 MB/s"
  resolution?: string; // e.g. "1080p", "720p"
  error?: string;
}

export interface DownloadTask {
  id: string;
  url: string;
  title: string;
  customName?: string;
  saveDir: string;
  status: TaskStatus;
  progress: number; // 0 to 100 overall
  speed: string;
  eta: string;
  downloadedBytes: number;
  totalBytes: number;
  totalParts: number;
  currentPart: number;
  parts: PartInfo[];
  deletePartsAfterMerge: boolean;
  finalFilePath?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  isSimulated?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'packer' | 'ytdlp' | 'ffmpeg' | 'success' | 'warning' | 'error';
  taskId?: string;
  taskTitle?: string;
  message: string;
}

export interface AppSettings {
  defaultSaveDir: string;
  deletePartsAfterMerge: boolean;
  maxConcurrentTasks: number;
  autoStartOnAdd: boolean;
  ffmpegPath: string;
  videoQuality: 'highest' | '1080p' | '720p' | '480p';
  theme: 'dark' | 'light';
  soundNotification: boolean;
}
