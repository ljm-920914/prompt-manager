"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Image, Video, Link, FileText, Loader2, Upload, X, CheckCircle2, AlertCircle, Eye
} from "lucide-react"
import { generateThumbnailFromFile } from "@/lib/storage"

interface DropZoneProps {
  onFileSelect: (file: File) => void
  onUrlProcess: (url: string) => void
  isProcessing: boolean
}

// 导入后待处理队列项
interface PendingItem {
  id: string
  file: File
  thumbnail: string | null
  status: "pending" | "processing" | "done" | "error"
  errorMsg?: string
}

const FILE_TYPES = [
  { icon: Image, label: "JPG" },
  { icon: Image, label: "PNG" },
  { icon: Video, label: "MP4" },
  { icon: Link, label: "链接" },
  { icon: FileText, label: "TXT" },
]

export function DropZone({ onFileSelect, onUrlProcess, isProcessing }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 队列完成后自动清空
  const allDone = pendingItems.length > 0 && pendingItems.every(
    i => i.status === "done" || i.status === "error"
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // 只有真正离开 drop zone 才取消，防止子元素冒泡
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom
    ) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const items = e.dataTransfer.items
    const files: File[] = []
    const urls: string[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) files.push(file)
      } else if (item.kind === 'string' && item.type === 'text/uri-list') {
        item.getAsString((str) => {
          str.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim()
            if (trimmed.startsWith('http')) urls.push(trimmed)
          })
        })
      }
    }

    for (const url of urls) await onUrlProcess(url)
    await handleFilesAccepted(files)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilesAccepted = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    // 构建待处理项（立即生成缩略图）
    const newItems: PendingItem[] = await Promise.all(
      files.map(async (file) => {
        const thumbnail = await generateThumbnailFromFile(file)
        return {
          id: Math.random().toString(36).slice(2),
          file,
          thumbnail,
          status: "pending" as const,
        }
      })
    )

    setPendingItems(prev => [...prev, ...newItems])

    // 依次处理
    for (const item of newItems) {
      // 标记为处理中
      setPendingItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, status: "processing" } : i)
      )

      try {
        await onFileSelect(item.file)
        setPendingItems(prev =>
          prev.map(i => i.id === item.id ? { ...i, status: "done" } : i)
        )
      } catch {
        setPendingItems(prev =>
          prev.map(i => i.id === item.id ? { ...i, status: "error", errorMsg: "处理失败" } : i)
        )
      }
    }
  }, [onFileSelect]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    handleFilesAccepted(Array.from(files))
    e.target.value = ''
  }, [handleFilesAccepted])

  const handleUrlSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    await onUrlProcess(urlInput.trim())
    setUrlInput("")
    setShowUrlInput(false)
  }, [urlInput, onUrlProcess])

  const removePending = (id: string) => {
    setPendingItems(prev => prev.filter(i => i.id !== id))
  }

  const clearDone = () => {
    setPendingItems(prev => prev.filter(i => i.status !== "done" && i.status !== "error"))
  }

  const hasPending = pendingItems.some(i => i.status === "pending" || i.status === "processing")

  return (
    <div className="space-y-3">
      {/* 待处理预览区 */}
      <AnimatePresence>
        {pendingItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {hasPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {hasPending
                    ? `正在处理 ${pendingItems.filter(i => i.status === "processing").length} / ${pendingItems.length} 个文件...`
                    : `已处理 ${pendingItems.filter(i => i.status === "done").length} 个`}
                  {pendingItems.some(i => i.status === "error") && (
                    <span className="text-destructive ml-2">
                      ，{pendingItems.filter(i => i.status === "error").length} 个失败
                    </span>
                  )}
                </span>
              </div>
              {!hasPending && (
                <button
                  onClick={clearDone}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  清除
                </button>
              )}
            </div>

            {/* 预览网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <AnimatePresence>
                {pendingItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group rounded-xl overflow-hidden bg-muted border border-border aspect-video"
                  >
                    {/* 缩略图 */}
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.file.type.startsWith('video/') ? (
                          <Video className="h-8 w-8 text-muted-foreground" />
                        ) : item.file.type.startsWith('image/') ? (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    )}

                    {/* 覆盖层 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* 状态指示 */}
                    <div className="absolute top-2 left-2">
                      {item.status === "processing" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          处理中
                        </div>
                      )}
                      {item.status === "done" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-600/80 backdrop-blur-sm text-white text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          完成
                        </div>
                      )}
                      {item.status === "error" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/80 backdrop-blur-sm text-white text-xs">
                          <AlertCircle className="h-3 w-3" />
                          失败
                        </div>
                      )}
                    </div>

                    {/* 文件名 */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs truncate font-medium leading-tight">
                        {item.file.name}
                      </p>
                      <p className="text-white/60 text-[10px]">
                        {item.file.type.startsWith('video/')
                          ? '视频'
                          : item.file.type.startsWith('image/')
                          ? '图片'
                          : '文件'}
                        &nbsp;·&nbsp;
                        {item.file.type.startsWith('video/')
                          ? formatSize(item.file.size)
                          : ''}
                      </p>
                    </div>

                    {/* 移除按钮 */}
                    <button
                      onClick={() => removePending(item.id)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>

                    {/* 视频播放图标 */}
                    {item.file.type.startsWith('video/') && item.thumbnail && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <Video className="h-5 w-5 text-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主 Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !showUrlInput && !isProcessing && fileInputRef.current?.click()}
        className={`
          relative rounded-2xl p-8 md:p-12 text-center cursor-pointer overflow-hidden
          bg-muted/30 border-2 border-dashed border-border transition-all duration-300
          ${isDragging
            ? 'scale-[1.01] border-primary bg-primary/5'
            : isProcessing
            ? 'opacity-60 cursor-wait'
            : 'hover:border-primary/50 hover:bg-muted/50 cursor-pointer'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.txt,.md"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="text-lg font-medium text-foreground">AI 正在分析...</p>
              <p className="text-sm text-muted-foreground mt-1">自动识别并提取提示词</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {/* 文件类型图标 */}
            <div className="flex items-center gap-2 md:gap-3">
              {FILE_TYPES.map((type, index) => (
                <motion.div
                  key={type.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center bg-muted border border-border/50"
                >
                  <type.icon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                </motion.div>
              ))}
            </div>

            <div>
              <p className="text-xl md:text-2xl font-semibold text-foreground">
                {isDragging ? '松开即可导入' : '拖拽文件到这里'}
              </p>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                支持图片、视频、链接、文本文件 · 自动识别提取提示词
              </p>
            </div>

            {/* 分隔线 */}
            <div className="flex items-center gap-3 w-full max-w-xs">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">或</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm font-medium hover:bg-accent hover:border-primary/30 transition-all duration-200"
              >
                <Upload className="h-4 w-4" />
                选择文件
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowUrlInput(true)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200"
              >
                <Link className="h-4 w-4" />
                粘贴链接
              </motion.button>
            </div>

            {/* 素材预览说明 */}
            {pendingItems.length === 0 && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                丢入素材后可即时预览，快速确认效果预期
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* URL Input Modal */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUrlInput(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl p-6 border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">粘贴链接</h3>
                <button
                  onClick={() => setShowUrlInput(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUrlSubmit}>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground font-medium hover:bg-accent transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!urlInput.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    提取
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
