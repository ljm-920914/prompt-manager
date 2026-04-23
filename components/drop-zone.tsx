"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Image, Video, Link, FileText, Loader2, Upload, X } from "lucide-react"

interface DropZoneProps {
  onFileSelect: (file: File) => void
  onUrlProcess: (url: string) => void
  isProcessing: boolean
}

const FILE_TYPES = [
  { icon: Image, label: "JPG", color: "hsl(var(--primary))" },
  { icon: Image, label: "PNG", color: "hsl(var(--primary))" },
  { icon: Video, label: "MP4", color: "hsl(var(--primary))" },
  { icon: Link, label: "链接", color: "hsl(var(--primary))" },
  { icon: FileText, label: "TXT", color: "hsl(var(--primary))" },
]

export function DropZone({ onFileSelect, onUrlProcess, isProcessing }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
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
          if (str.startsWith('http')) urls.push(str) 
        })
      }
    }

    for (const file of files) await onFileSelect(file)
    for (const url of urls) await onUrlProcess(url)
  }, [onFileSelect, onUrlProcess])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) await onFileSelect(file)
    e.target.value = ''
  }, [onFileSelect])

  const handleUrlSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    await onUrlProcess(urlInput.trim())
    setUrlInput("")
    setShowUrlInput(false)
  }, [urlInput, onUrlProcess])

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !showUrlInput && fileInputRef.current?.click()}
        className={`
          relative rounded-2xl p-8 md:p-12 text-center cursor-pointer overflow-hidden 
          bg-muted/30 border-2 border-dashed border-border transition-all duration-300
          ${isDragging ? 'scale-[1.01] border-primary bg-primary/5' : 'hover:border-primary/50 hover:bg-muted/50'}
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
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">AI 正在分析...</p>
              <p className="text-sm text-muted-foreground mt-1">自动识别并提取提示词</p>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-5">
            {/* File type icons */}
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

            {/* Or divider */}
            <div className="flex items-center gap-3 w-full max-w-xs">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">或</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Action buttons */}
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
