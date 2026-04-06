"use client"

import { useState, useEffect } from "react"
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
import { Copy, ExternalLink, Eye, CopyCheck, Edit2, Check, X, Trash2, Image as ImageIcon, Link, FileText, Video } from "lucide-react"
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

  useEffect(() => {
    if (!open) {
      setIsEditingContent(false)
      setIsEditingTitle(false)
      setActiveTab("content")
    }
  }, [open])

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
    if (!id) return "#6b6b7b"
    return categories.find((c) => c.id === id)?.color || "#6b6b7b"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-[#15151c] border-[#272730]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#272730]">
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
                    className="text-lg font-semibold h-10 bg-[#0c0c12] border-[#272730]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitleEdit()
                      if (e.key === 'Escape') setIsEditingTitle(false)
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={saveTitleEdit} className="text-[#10b981]">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-[#6b6b7b]">
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
                  <DialogTitle className="text-lg font-semibold text-white truncate">
                    {prompt.title}
                  </DialogTitle>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-[#6b6b7b] hover:text-white"
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
                  backgroundColor: getCategoryColor(prompt.categoryId) + "20",
                  color: getCategoryColor(prompt.categoryId),
                }}
              >
                {getCategoryName(prompt.categoryId)}
              </span>
              <span className="text-xs text-[#6b6b7b] flex items-center gap-1">
                {getSourceIcon(prompt.sourceType)}
                {prompt.sourceType === 'LINK' ? '链接' : 
                 prompt.sourceType === 'IMAGE' ? '图片' : 
                 prompt.sourceType === 'VIDEO' ? '视频' : '文本'}
              </span>
              <span className="text-xs text-[#6b6b7b] flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {prompt.viewCount} 次浏览
              </span>
              <span className="text-xs text-[#6b6b7b]">
                {formatDate(prompt.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              className="border-[#272730] bg-[#1e1e28] hover:bg-[#272730] text-white"
            >
              {copied ? (
                <CopyCheck className="h-4 w-4 mr-2 text-[#10b981]" />
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
              <label className="text-sm font-medium text-[#6b6b7b]">分类</label>
              <Select
                value={prompt.categoryId || "none"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="bg-[#0c0c12] border-[#272730] text-white">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-[#272730]">
                  <SelectItem value="none" className="text-white">未分类</SelectItem>
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

            {/* Content tabs */}
            {prompt.sourceFileData && prompt.sourceType === "IMAGE" && (
              <div className="flex gap-2 border-b border-[#272730]">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === "content"
                      ? "text-[#10b981] border-[#10b981]"
                      : "text-[#6b6b7b] border-transparent hover:text-white"
                  }`}
                >
                  提示词内容
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === "preview"
                      ? "text-[#10b981] border-[#10b981]"
                      : "text-[#6b6b7b] border-transparent hover:text-white"
                  }`}
                >
                  原图预览
                </button>
              </div>
            )}

            {/* Content area */}
            <AnimatePresence mode="wait">
              {activeTab === "preview" && prompt.sourceFileData ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl overflow-hidden border border-[#272730]"
                >
                  <img
                    src={prompt.sourceFileData}
                    alt={prompt.title}
                    className="w-full max-h-[400px] object-contain bg-[#0c0c12]"
                  />
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
                    <label className="text-sm font-medium text-[#6b6b7b]">提示词内容</label>
                    {!isEditingContent && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={startEditingContent}
                        className="h-7 text-[#6b6b7b] hover:text-white"
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
                        className="min-h-[300px] font-mono text-sm bg-[#0c0c12] border-[#272730] text-white resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditingContent(false)}
                          className="border-[#272730]"
                        >
                          取消
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={saveContentEdit}
                          className="bg-[#10b981] text-[#0c0c12] hover:bg-[#10b981]/90"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0c0c12] rounded-xl border border-[#272730] overflow-hidden">
                      <pre className="p-4 whitespace-pre-wrap font-mono text-sm text-[#e8e8f0] max-h-[400px] overflow-y-auto">
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
                <label className="text-sm font-medium text-[#6b6b7b]">来源链接</label>
                <a
                  href={prompt.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#0c0c12] border border-[#272730] text-sm text-[#10b981] hover:bg-[#10b981]/5 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">{prompt.sourceUrl}</span>
                </a>
              </div>
            )}

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6b6b7b]">标签</label>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-lg bg-[#1e1e28] text-xs text-[#6b6b7b] border border-[#272730]"
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
