"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, ExternalLink, Eye, CopyCheck } from "lucide-react"
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
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")

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

  const startEditing = () => {
    setEditedContent(prompt.content)
    setIsEditing(true)
  }

  const saveEdit = () => {
    onUpdate(prompt.id, { content: editedContent })
    setIsEditing(false)
    toast.success("内容已更新")
  }

  const getCategoryName = (id?: string) => {
    if (!id) return "未分类"
    return categories.find((c) => c.id === id)?.name || "未分类"
  }

  const getCategoryColor = (id?: string) => {
    if (!id) return "#64748b"
    return categories.find((c) => c.id === id)?.color || "#64748b"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl mb-2">{prompt.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: getCategoryColor(prompt.categoryId) + "20",
                    color: getCategoryColor(prompt.categoryId),
                    borderColor: getCategoryColor(prompt.categoryId),
                  }}
                  variant="outline"
                >
                  {getCategoryName(prompt.categoryId)}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {prompt.viewCount} 次浏览
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <CopyCheck className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                复制
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 分类选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">分类</label>
            <Select
              value={prompt.categoryId || "none"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
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

          {/* 提示词内容 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">提示词内容</label>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  编辑
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    取消
                  </Button>
                  <Button size="sm" onClick={saveEdit}>
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {prompt.content}
                </pre>
              </div>
            )}
          </div>

          {/* 标签 */}
          {prompt.tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">标签</label>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 来源信息 */}
          {prompt.sourceUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">来源</label>
              <a
                href={prompt.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {prompt.sourceUrl}
              </a>
            </div>
          )}

          {/* 预览图 */}
          {prompt.sourceFileData && prompt.sourceType === "IMAGE" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">原图</label>
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={prompt.sourceFileData}
                  alt={prompt.title}
                  className="w-full max-h-[400px] object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
