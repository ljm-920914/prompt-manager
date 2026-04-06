"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, ExternalLink, Eye, CopyCheck, Edit2, Check, X, Image as ImageIcon, Link, FileText, Video, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"
import type { Prompt, Category } from "@/lib/storage"

interface PromptDetailDialogProps {
  prompt: Prompt | null
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, updates: Partial<Prompt>) => void
}

export function PromptDetailDialog({
  prompt,
  categories,
  open,
  onOpenChange,
  onUpdate,
}: PromptDetailDialogProps) {
  const [copied, setCopied] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [editedTitle, setEditedTitle] = useState("")
  const [activeTab, setActiveTab] = useState<"content" | "preview">("content")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!open) {
      setIsEditingContent(false)
      setIsEditingTitle(false)
      setActiveTab("content")
      setIsPlaying(false)
    }
  }, [open])

  // 当切换到预览标签时，重置视频状态
  useEffect(() => {
    if (activeTab !== "preview") {
      setIsPlaying(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [activeTab])

  if (!prompt) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    toast.success("已复制到剪贴板")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCategoryChange = (categoryId: string) => {
    onUpdate(prompt.id, { categoryId: categoryId === "none" ? undefined : categoryId })
    toast.success("分类已更新")
  }

  const startEditingContent = () => {
    setEditedContent(prompt.content)
    setIsEditingContent(true)
  }

  const saveContentEdit = () => {
    onUpdate(prompt.id, { content: editedContent })
    setIsEditingContent(false)
    toast.success("内容已更新")
  }

  const startEditingTitle = () => {
    setEditedTitle(prompt.title)
    setIsEditingTitle(true)
  }

  const saveTitleEdit = () => {
    if (editedTitle.trim()) {
      onUpdate(prompt.id, { title: editedTitle.trim() })
      setIsEditingTitle(false)
      toast.success("标题已更新")
    }
  }

  const getCategoryName = (id?: string) => {
    if (!id) return "未分类"
    return categories.find((c) => c.id === id)?.name || "未分类"
  }

  const getCategoryColor = (id?: string) => {
    if (!id) return "#6b7280"
    return categories.find((c) => c.id === id)?.color || "#6b7280"
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "LINK": return <Link className="h-4 w-4" />
      case "IMAGE": return <ImageIcon className="h-4 w-4" />
      case "VIDEO": return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // 判断是否有预览内容
  const hasPreview = prompt.sourceType === 'IMAGE' && prompt.sourceFileData || 
                     prompt.sourceType === 'VIDEO' && (prompt.sourceVideoData || prompt.sourceFileData)

  // 获取视频源
  const getVideoSource = () => {
    // 优先使用 sourceFileData（完整的视频数据）
    if (prompt.sourceFileData && prompt.sourceFileData.startsWith('data:video')) {
      return prompt.sourceFileData
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-card border-border">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
          <div className="flex-1 min-w-0 pr-4">
            {/* Title */}
            <AnimatePresence mode="wait">
              {isEditingTitle ? (
                <motion.div 
                  key="editing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-lg font-semibold h-10 bg-background border-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitleEdit()
                      if (e.key === 'Escape') setIsEditingTitle(false)
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={saveTitleEdit} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 group"
                >
                  <DialogTitle className="text-lg font-semibold text-foreground truncate cursor-pointer" onClick={startEditingTitle}>
                    {prompt.title}
                  </DialogTitle>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={startEditingTitle}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span 
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: getCategoryColor(prompt.categoryId) + "15",
                  color: getCategoryColor(prompt.categoryId),
                }}
              >
                {getCategoryName(prompt.categoryId)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {getSourceIcon(prompt.sourceType)}
                {prompt.sourceType === 'LINK' ? '链接' : 
                 prompt.sourceType === 'IMAGE' ? '图片' : 
                 prompt.sourceType === 'VIDEO' ? '视频' : '文本'}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {prompt.viewCount} 次浏览
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(prompt.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              className="border-border hover:bg-accent"
            >
              {copied ? (
                <CopyCheck className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              复制
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Category selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">分类</label>
              <Select
                value={prompt.categoryId || "none"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content tabs - only show if has preview */}
            {hasPreview && (
              <div className="flex gap-2 border-b border-border">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === "content"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  提示词内容
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === "preview"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  素材预览
                </button>
              </div>
            )}

            {/* Content area */}
            <AnimatePresence mode="wait">
              {activeTab === "preview" && hasPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl overflow-hidden border border-border bg-background"
                >
                  {prompt.sourceType === 'VIDEO' ? (
                    <div className="relative">
                      {getVideoSource() ? (
                        <>
                          <video
                            ref={videoRef}
                            src={getVideoSource()!}
                            className="w-full max-h-[400px] object-contain"
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            muted={isMuted}
                          />
                          {/* Video controls overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={togglePlay}
                                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                              >
                                {isPlaying ? (
                                  <Pause className="h-5 w-5 text-white" />
                                ) : (
                                  <Play className="h-5 w-5 text-white ml-0.5" />
                                )}
                              </button>
                              <span className="text-xs text-white/80 flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                视频预览
                              </span>
                            </div>
                            <button
                              onClick={toggleMute}
                              className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                              {isMuted ? (
                                <VolumeX className="h-4 w-4 text-white" />
                              ) : (
                                <Volume2 className="h-4 w-4 text-white" />
                              )}
                            </button>
                          </div>
                        </>
                      ) : prompt.sourceVideoData ? (
                        // 只有缩略图，显示缩略图和提示
                        <div className="relative">
                          <img
                            src={prompt.sourceVideoData}
                            alt={prompt.title}
                            className="w-full max-h-[400px] object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="text-center">
                              <Video className="h-12 w-12 text-white/60 mx-auto mb-2" />
                              <p className="text-sm text-white/80">视频预览（仅缩略图）</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                          <Video className="h-12 w-12 mb-2" />
                          <p>视频预览不可用</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={prompt.sourceFileData}
                      alt={prompt.title}
                      className="w-full max-h-[400px] object-contain"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">提示词内容</label>
                    {!isEditingContent && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={startEditingContent}
                        className="h-7 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        编辑
                      </Button>
                    )}
                  </div>
                  
                  {isEditingContent ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[300px] font-mono text-sm bg-background border-input resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditingContent(false)}
                        >
                          取消
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={saveContentEdit}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-xl border border-border overflow-hidden">
                      <pre className="p-4 whitespace-pre-wrap font-mono text-sm text-foreground max-h-[400px] overflow-y-auto">
                        {prompt.content}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Source URL */}
            {prompt.sourceUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">来源链接</label>
                <a
                  href={prompt.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border text-sm text-primary hover:bg-accent transition-colors"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">{prompt.sourceUrl}</span>
                </a>
              </div>
            )}

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">标签</label>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground border border-border hover:border-primary/30 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
