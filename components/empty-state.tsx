"use client"

import { motion } from "framer-motion"
import { Sparkles, Search, Plus, Image, Video, Link } from "lucide-react"

interface EmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">未找到匹配的提示词</h3>
        <p className="text-muted-foreground max-w-sm mb-4">
          尝试调整搜索词或清除筛选条件
        </p>
        
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-4 w-4 rotate-45" />
          清除筛选
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary animate-pulse" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">开始管理你的提示词</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        拖拽图片、视频或链接到上方区域，AI 将自动提取并整理提示词
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground">
          <Image className="h-3.5 w-3.5" />
          图片识别
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground">
          <Video className="h-3.5 w-3.5" />
          视频分析
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground">
          <Link className="h-3.5 w-3.5" />
          链接提取
        </div>
      </div>
    </motion.div>
  )
}
