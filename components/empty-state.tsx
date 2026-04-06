"use client"

import { motion } from "framer-motion"
import { Sparkles, Search, Plus } from "lucide-react"

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
        <div className="h-16 w-16 rounded-2xl bg-[#15151c] flex items-center justify-center mb-4 border border-[#272730]">
          <Search className="h-8 w-8 text-[#6b6b7b]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">未找到匹配的提示词</h3>
        <p className="text-[#6b6b7b] max-w-sm mb-4">
          尝试调整搜索词或清除筛选条件
        </p>
        
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10b981]/10 text-[#10b981] text-sm font-medium hover:bg-[#10b981]/20 transition-colors"
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
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#10b981]/20 to-[#6366f1]/20 flex items-center justify-center border border-[#272730]">
          <Sparkles className="h-10 w-10 text-[#10b981]" />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#10b981] animate-pulse" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">开始管理你的提示词</h3>
      <p className="text-[#6b6b7b] max-w-sm mb-6">
        拖拽图片、视频或链接到上方区域，AI 将自动提取并整理提示词
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#15151c] border border-[#272730] text-[#6b6b7b]">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          图片识别
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#15151c] border border-[#272730] text-[#6b6b7b]">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          视频分析
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#15151c] border border-[#272730] text-[#6b6b7b]">
          <span className="w-2 h-2 rounded-full bg-[#f472b6]" />
          链接提取
        </div>
      </div>
    </motion.div>
  )
}
