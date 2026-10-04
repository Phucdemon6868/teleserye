import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { QuickDownloadCard } from './components/QuickDownloadCard';
import { TaskQueue } from './components/TaskQueue';
import { NewTaskModal } from './components/NewTaskModal';
import { PartDetailsModal } from './components/PartDetailsModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { FolderLocationModal } from './components/FolderLocationModal';
import { LogTerminal } from './components/LogTerminal';
import { DeobfuscatorTool } from './components/DeobfuscatorTool';
import { ModernPythonCode } from './components/ModernPythonCode';
import { SettingsView } from './components/SettingsView';
import { DownloadTask, AppSettings, LogEntry, PartInfo, TaskStatus } from './types';
import { SAMPLE_TASKS, INITIAL_SETTINGS, INITIAL_LOGS } from './data/sampleTasks';
import { formatBytes, formatSecondsToETA, sanitizeFileName } from './utils/deobfuscator';
import { FolderCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'queue' | 'deobfuscator' | 'python' | 'settings'>('queue');
  const [tasks, setTasks] = useState<DownloadTask[]>(SAMPLE_TASKS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  // Modal states
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [inspectedTask, setInspectedTask] = useState<DownloadTask | null>(null);
  const [previewTask, setPreviewTask] = useState<DownloadTask | null>(null);
  const [locationTask, setLocationTask] = useState<DownloadTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeLoopRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (
    level: LogEntry['level'], 
    message: string, 
    taskId?: string, 
    taskTitle?: string
  ) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
      level,
      message,
      taskId,
      taskTitle,
    };
    setLogs((prev) => [...prev.slice(-300), newLog]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Play audio chime using Web Audio API on completion
  const playCompletionChime = () => {
    if (!settings.soundNotification) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // AudioContext policy ignored if untouched
    }
  };

  // Add new tasks from modal
  const handleAddTasks = (
    urls: string[], 
    saveDir: string, 
    customName: string, 
    deleteParts: boolean
  ) => {
    const newTasks: DownloadTask[] = urls.map((url, index) => {
      // Extract tentative title from URL slug
      const slug = url.split('/').filter(Boolean).pop() || `Tap_Phim_${Date.now()}`;
      const displayTitle = customName 
        ? `${customName} #${index + 1}`
        : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const safeFolder = sanitizeFileName(displayTitle);
      const taskSaveDir = `${saveDir}\\${safeFolder}`;

      return {
        id: `task-${Date.now()}-${index}`,
        url,
        title: displayTitle,
        customName: customName || undefined,
        saveDir: taskSaveDir,
        status: 'idle',
        progress: 0,
        speed: '0 B/s',
        eta: '--:--',
        downloadedBytes: 0,
        totalBytes: 360000000,
        totalParts: 3,
        currentPart: 1,
        deletePartsAfterMerge: deleteParts,
        createdAt: new Date().toISOString(),
        parts: [
          {
            partNumber: 1,
            url: `${url}/1`,
            status: 'pending',
            progress: 0,
            downloadedBytes: 0,
            totalBytes: 120000000,
            speed: '0 B/s',
          },
          {
            partNumber: 2,
            url: `${url}/2`,
            status: 'pending',
            progress: 0,
            downloadedBytes: 0,
            totalBytes: 120000000,
            speed: '0 B/s',
          },
          {
            partNumber: 3,
            url: `${url}/3`,
            status: 'pending',
            progress: 0,
            downloadedBytes: 0,
            totalBytes: 120000000,
            speed: '0 B/s',
          },
        ],
      };
    });

    setTasks((prev) => [...newTasks, ...prev]);
    addLog('info', `Đã thêm ${newTasks.length} tác vụ mới vào hàng đợi.`);
    showToast(`Đã thêm ${newTasks.length} tác vụ vào hàng đợi.`);

    if (settings.autoStartOnAdd) {
      newTasks.forEach((t) => handleStartTask(t.id));
    }
  };

  // Start single task
  const handleStartTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          addLog('info', `Bắt đầu xử lý: ${t.title}`, t.id, t.title);
          return {
            ...t,
            status: 'fetching_parts',
            errorMessage: undefined,
          };
        }
        return t;
      })
    );
  };

  // Pause single task
  const handlePauseTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          addLog('warning', `Tạm dừng tác vụ: ${t.title}`, t.id, t.title);
          return {
            ...t,
            status: 'paused',
            speed: '0 B/s',
          };
        }
        return t;
      })
    );
  };

  // Retry task
  const handleRetryTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          addLog('info', `Khởi động lại tải: ${t.title}`, t.id, t.title);
          return {
            ...t,
            status: 'fetching_parts',
            progress: 0,
            downloadedBytes: 0,
            errorMessage: undefined,
            parts: t.parts.map((p) => ({ ...p, status: 'pending', progress: 0, downloadedBytes: 0 })),
          };
        }
        return t;
      })
    );
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    addLog('info', `Đã xóa tác vụ khỏi danh sách.`);
  };

  // Start all tasks
  const handleStartAll = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status === 'idle' || t.status === 'paused' || t.status === 'error') {
          return { ...t, status: 'fetching_parts' };
        }
        return t;
      })
    );
    addLog('info', 'Đã gửi lệnh bắt đầu cho toàn bộ hàng đợi.');
    showToast('Bắt đầu tải tất cả các tác vụ.');
  };

  // Stop all tasks
  const handleStopAll = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (['downloading', 'fetching_parts', 'converting_ts', 'merging'].includes(t.status)) {
          return { ...t, status: 'paused', speed: '0 B/s' };
        }
        return t;
      })
    );
    addLog('warning', 'Đã dừng tất cả các tác vụ đang chạy.');
    showToast('Đã dừng tất cả tác vụ.');
  };

  // Clear completed
  const handleClearCompleted = () => {
    const count = tasks.filter((t) => t.status === 'completed').length;
    setTasks((prev) => prev.filter((t) => t.status !== 'completed'));
    addLog('info', `Đã dọn dẹp ${count} tác vụ đã hoàn thành.`);
    showToast(`Đã dọn dẹp ${count} tác vụ.`);
  };

  // Open folder action
  const handleOpenFolder = (task: DownloadTask) => {
    const target = task.finalFilePath || task.saveDir;
    navigator.clipboard.writeText(target);
    setLocationTask(task);
    showToast(`📂 Vị trí file: ${target}`);
    addLog('info', `Xem vị trí thư mục: ${target}`, task.id, task.title);
  };

  // Direct browser download action
  const handleDownloadToBrowser = (task: DownloadTask) => {
    const streamUrl = task.parts.find((p) => p.videoUrl)?.videoUrl || 
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    const fileName = `${sanitizeFileName(task.customName || task.title)} - Full.mp4`;

    const a = document.createElement('a');
    a.href = streamUrl;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast(`⬇ Đang tải file "${fileName}" về máy tính. Kiểm tra thư mục Downloads (Ctrl + J)`);
    addLog('success', `Bắt đầu tải "${fileName}" về thư mục Downloads của máy tính.`, task.id, task.title);
  };

  // Background download simulation & progress loop
  useEffect(() => {
    activeLoopRef.current = setInterval(() => {
      setTasks((prevTasks: DownloadTask[]): DownloadTask[] => {
        let hasChanges = false;

        const updated: DownloadTask[] = prevTasks.map((task: DownloadTask): DownloadTask => {
          // If task is fetching parts
          if (task.status === 'fetching_parts') {
            hasChanges = true;
            addLog('packer', `Giải mã JavaScript P.A.C.K.E.R cho ${task.title} -> Tìm thấy ${task.totalParts} phần.`, task.id, task.title);
            return {
              ...task,
              status: 'downloading' as TaskStatus,
              currentPart: 1,
              parts: task.parts.map((p, idx) => ({
                ...p,
                status: (idx === 0 ? 'downloading' : 'pending') as PartInfo['status'],
                videoUrl: `https://stream-cdn.teleserye.su/hls/ep_${task.id}_part${p.partNumber}.mp4`,
                resolution: '1080p FHD',
              })),
            };
          }

          // If downloading
          if (task.status === 'downloading') {
            hasChanges = true;
            const currentPartIndex = task.parts.findIndex((p) => p.status === 'downloading');
            
            if (currentPartIndex >= 0) {
              const part = task.parts[currentPartIndex];
              const incrementBytes = Math.floor(Math.random() * 4500000 + 4000000); // 4 - 8.5 MB step
              const newDownloaded = Math.min(part.totalBytes, part.downloadedBytes + incrementBytes);
              const partProgress = Math.floor((newDownloaded / part.totalBytes) * 100);
              const isPartDone = newDownloaded >= part.totalBytes;

              const updatedParts: PartInfo[] = [...task.parts];
              updatedParts[currentPartIndex] = {
                ...part,
                downloadedBytes: newDownloaded,
                progress: partProgress,
                status: isPartDone ? 'completed' : 'downloading',
                speed: '7.8 MB/s',
              };

              // Check if next part exists
              let nextStatus: TaskStatus = task.status;
              let nextCurrentPart = task.currentPart;
              if (isPartDone) {
                if (currentPartIndex + 1 < task.parts.length) {
                  updatedParts[currentPartIndex + 1].status = 'downloading';
                  nextCurrentPart = currentPartIndex + 2;
                  addLog('ytdlp', `Hoàn tất tải Part ${currentPartIndex + 1}. Bắt đầu stream Part ${nextCurrentPart}...`, task.id, task.title);
                } else {
                  // All parts downloaded -> Start MPEG-TS conversion
                  nextStatus = 'converting_ts';
                  addLog('ffmpeg', `Đã tải xong toàn bộ ${task.parts.length} parts. Bắt đầu chuyển đổi MPEG-TS...`, task.id, task.title);
                }
              }

              // Overall task stats
              const totalDownloaded = updatedParts.reduce((acc, p) => acc + p.downloadedBytes, 0);
              const totalBytes = updatedParts.reduce((acc, p) => acc + p.totalBytes, 0);
              const overallProgress = Math.floor((totalDownloaded / totalBytes) * 100);
              const remainingBytes = totalBytes - totalDownloaded;
              const etaSeconds = Math.max(0, Math.floor(remainingBytes / 8000000));

              return {
                ...task,
                status: nextStatus,
                currentPart: nextCurrentPart,
                downloadedBytes: totalDownloaded,
                totalBytes,
                progress: overallProgress,
                speed: isPartDone ? '0 B/s' : '7.8 MB/s',
                eta: formatSecondsToETA(etaSeconds),
                parts: updatedParts,
              };
            }
          }

          // If converting to MPEG-TS
          if (task.status === 'converting_ts') {
            hasChanges = true;
            addLog('ffmpeg', `Đang tạo filelist.txt và ghép luồng: ffmpeg -f concat -safe 0 -c copy -bsf:a aac_adtstoasc`, task.id, task.title);
            return {
              ...task,
              status: 'merging' as TaskStatus,
              speed: 'FFmpeg lossless',
              eta: '00:03',
            };
          }

          // If merging
          if (task.status === 'merging') {
            hasChanges = true;
            const finalName = `${sanitizeFileName(task.title).replace(/Part 1/i, '')} - Full.mp4`;
            const finalPath = `${task.saveDir}\\${finalName}`;
            addLog('success', `✅ Gộp thành công -> ${finalName}. Đã dọn dẹp các file con.`, task.id, task.title);
            playCompletionChime();
            showToast(`🎉 Đã gộp thành công: ${finalName}`);

            return {
              ...task,
              status: 'completed' as TaskStatus,
              progress: 100,
              speed: '0 B/s',
              eta: '00:00',
              finalFilePath: finalPath,
              completedAt: new Date().toISOString(),
            };
          }

          return task;
        });

        return hasChanges ? updated : prevTasks;
      });
    }, 1200);

    return () => {
      if (activeLoopRef.current) clearInterval(activeLoopRef.current);
    };
  }, [settings.soundNotification]);

  // Aggregate stats
  const activeCount = tasks.filter((t) =>
    ['downloading', 'fetching_parts', 'converting_ts', 'merging'].includes(t.status)
  ).length;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalBytesDownloaded = tasks.reduce((acc, t) => acc + t.downloadedBytes, 0);
  const currentSpeed = activeCount > 0 ? `${(activeCount * 7.8).toFixed(1)} MB/s` : '0 B/s';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Navbar with 3-Zone contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
        activeCount={activeCount}
        totalSpeed={currentSpeed}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Floating toast notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Queue Manager & Terminal */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <StatsBar
              activeCount={activeCount}
              completedCount={completedCount}
              currentSpeed={currentSpeed}
              totalBytesDownloaded={totalBytesDownloaded}
            />

            {/* Quick On-Page Download Input Card */}
            <QuickDownloadCard
              onAddAndStartTasks={handleAddTasks}
              settings={settings}
              onOpenPythonTab={() => setActiveTab('python')}
            />

            {/* Task Table */}
            <TaskQueue
              tasks={tasks}
              onStartTask={handleStartTask}
              onPauseTask={handlePauseTask}
              onRetryTask={handleRetryTask}
              onDeleteTask={handleDeleteTask}
              onStartAll={handleStartAll}
              onStopAll={handleStopAll}
              onClearCompleted={handleClearCompleted}
              onOpenFolder={handleOpenFolder}
              onPreviewVideo={(t) => setPreviewTask(t)}
              onInspectParts={(t) => setInspectedTask(t)}
              onDownloadToBrowser={handleDownloadToBrowser}
            />

            {/* Live Terminal */}
            <LogTerminal
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          </div>
        )}

        {/* Tab 2: P.A.C.K.E.R Deobfuscator Tool */}
        {activeTab === 'deobfuscator' && <DeobfuscatorTool />}

        {/* Tab 3: Modern Python Code Exporter */}
        {activeTab === 'python' && <ModernPythonCode />}

        {/* Tab 4: System Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={(newSettings) => {
              setSettings(newSettings);
              showToast('Đã lưu cấu hình hệ thống.');
            }}
            onResetDefaults={() => {
              setSettings(INITIAL_SETTINGS);
              showToast('Đã đặt lại cấu hình mặc định.');
            }}
          />
        )}
      </main>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onAddTasks={handleAddTasks}
        settings={settings}
      />

      <PartDetailsModal
        task={inspectedTask}
        onClose={() => setInspectedTask(null)}
        onPreviewVideo={(t) => {
          setInspectedTask(null);
          setPreviewTask(t);
        }}
      />

      <VideoPlayerModal
        task={previewTask}
        onClose={() => setPreviewTask(null)}
      />

      <FolderLocationModal
        task={locationTask}
        onClose={() => setLocationTask(null)}
        onDownloadToBrowser={handleDownloadToBrowser}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Teleserye Stream Pro · Tối ưu hóa tải luồng đa phần & FFmpeg lossless concat</p>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>yt-dlp v2024.08+</span>
            <span>·</span>
            <span>FFmpeg 6.1+</span>
            <span>·</span>
            <span>Dean Edwards P.A.C.K.E.R</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
