"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  Link, 
  Image, 
  Video, 
  FileText, 
  Loader2, 
  Check,
  X,
  CornerDownLeft
} from "lucide-react"
import { toast } from "sonner"
import { promptApi, categoryApi, aiExtract, type Prompt, type Category } from "@/lib/storage"

interface QuickInputProps {
  onSaved: () => void
}

// 检测内容类型
function detectContentType(input: string): 'TEXT' | 'LINK' | 'IMAGE_URL' | 'VIDEO_URL' {
  const trimmed = input.trim()
  
  // 检测图片URL
  if (/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(trimmed)) {
    return 'IMAGE_URL'
  }
  
  // 检测视频URL
  if (/^https?:\/\/.*\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return 'VIDEO_URL'
  }
  
  // 检测普通链接
  if (/^https?:\/\//i.test(trimmed)) {
    return 'LINK'
  }
  
  return 'TEXT'
}

// 从URL获取文件名
function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop()
    return filename || 'unknown'
  } catch {
    return 'unknown'
  }
}

export function QuickInput({ onSaved }: QuickInputProps) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [detectedType, setDetectedType] = useState<'TEXT' | 'LINK' | 'IMAGE_URL' | 'VIDEO_URL'>('TEXT')
  const [showSuccess, setShowSuccess] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  // 检测输入类型
  useEffect(() => {
    setDetectedType(detectContentType(input))
  }, [input])

  // 处理粘贴事件
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 处理粘贴的图片
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          await processImageFile(file)
        }
        return
      }
    }
  }, [])

  // 处理图片文件
  const processImageFile = async (file: File) => {
    setIsProcessing(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const result = await aiExtract.fromImage(file.name, base64)
        
        // 自动分类
        const categoryId = await autoCategorize(result.content, result.tags)
        
        const created = promptApi.create({
          title: result.title,
          content: result.content,
          sourceType: 'IMAGE',
          sourceFileName: file.name,
          sourceFileData: result.imageData || base64,
          tags: result.tags,
          categoryId,
          isPublic: false,
        })
        
        if (created) {
          showSuccessToast('图片已保存')
          onSaved()
        } else {
          toast.error('存储失败，可能超出空间限制')
        }
        setIsProcessing(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('处理图片失败')
      setIsProcessing(false)
    }
  }

  // 自动分类
  const autoCategorize = async (content: string, tags: string[]): Promise<string | undefined> => {
    const categories = categoryApi.getAll()
    if (categories.length === 0) return undefined
    
    const contentLower = content.toLowerCase()
    const tagsLower = tags.map(t => t.toLowerCase())
    
    // 分类关键词映射
    const categoryKeywords: Record<string, string[]> = {
      'AI绘画': ['midjourney', 'stable diffusion', 'sd', 'dalle', '绘画', '画图', 'image', 'art', 'illustration', 'portrait', 'landscape'],
      'ChatGPT': ['chatgpt', 'gpt', 'claude', '对话', 'chat', 'conversation', '问答'],
      '文案写作': ['文案', '写作', '文章', '营销', 'copywriting', 'writing', 'blog', 'content'],
      '代码开发': ['代码', '编程', 'programming', 'code', 'developer', 'python', 'javascript', 'react', 'vue'],
      '视频创作': ['视频', 'video', 'script', '分镜', 'storyboard', 'film', 'movie'],
    }
    
    // 匹配分数
    const scores = categories.map(cat => {
      const keywords = categoryKeywords[cat.name] || []
      let score = 0
      
      keywords.forEach(keyword => {
        if (contentLower.includes(keyword)) score += 2
        if (tagsLower.some(t => t.includes(keyword))) score += 3
      })
      
      return { category: cat, score }
    })
    
    scores.sort((a, b) => b.score - a.score)
    
    // 返回得分最高的分类（需要超过阈值）
    if (scores[0]?.score >= 2) {
      return scores[0].category.id
    }
    
    return undefined
  }

  // 处理输入内容
  const processInput = async () => {
    if (!input.trim() || isProcessing) return
    
    setIsProcessing(true)
    
    try {
      const type = detectContentType(input.trim())
      let result: { title: string; content: string; tags: string[] }
      let sourceType: Prompt['sourceType']
      let sourceUrl: string | undefined
      let sourceFileName: string | undefined
      
      switch (type) {
        case 'IMAGE_URL':
          result = await aiExtract.fromImage(getFileNameFromUrl(input.trim()), input.trim())
          sourceType = 'IMAGE'
          sourceUrl = input.trim()
          sourceFileName = getFileNameFromUrl(input.trim())
          break
          
        case 'VIDEO_URL':
          result = await aiExtract.fromVideoUrl(input.trim())
          sourceType = 'VIDEO'
          sourceUrl = input.trim()
          sourceFileName = getFileNameFromUrl(input.trim())
          break
          
        case 'LINK':
          result = await aiExtract.fromLink(input.trim())
          sourceType = 'LINK'
          sourceUrl = input.trim()
          break
          
        case 'TEXT':
        default:
          result = await aiExtract.fromText(input.trim())
          sourceType = 'TEXT'
          break
      }
      
      // 自动分类
      const categoryId = await autoCategorize(result.content, result.tags)
      
      const created = promptApi.create({
        title: result.title,
        content: result.content,
        sourceType,
        sourceUrl,
        sourceFileName,
        tags: result.tags,
        categoryId,
        isPublic: false,
      })
      
      if (created) {
        showSuccessToast('提示词已保存')
        setInput('')
        onSaved()
      } else {
        toast.error('存储失败')
      }
    } catch (error) {
      toast.error('处理失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  // 显示成功提示
  const showSuccessToast = (message: string) => {
    setShowSuccess(true)
    toast.success(message)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  // 处理失焦
  const handleBlur = (e: React.FocusEvent) => {
    // 检查是否点击了容器内的其他元素
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return
    }
    setIsFocused(false)
    if (input.trim()) {
      processInput()
    }
  }

  // 处理按键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      processInput()
    }
    if (e.key === 'Escape') {
      setInput('')
      textareaRef.current?.blur()
    }
  }

  // 获取类型图标
  const getTypeIcon = () => {
    switch (detectedType) {
      case 'IMAGE_URL': return <Image className="h-4 w-4" />
      case 'VIDEO_URL': return <Video className="h-4 w-4" />
      case 'LINK': return <Link className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  // 获取类型标签
  const getTypeLabel = () => {
    switch (detectedType) {
      case 'IMAGE_URL': return '图片链接'
      case 'VIDEO_URL': return '视频链接'
      case 'LINK': return '网页链接'
      default: return '文本'
    }
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isFocused ? 'bg-background/80 backdrop-blur-xl' : ''
      }`}
    >
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div 
          className={`relative rounded-2xl border-2 transition-all duration-300 ${
            isFocused 
              ? 'border-primary bg-card shadow-2xl shadow-primary/10' 
              : 'border-border bg-card/50 hover:border-primary/30 hover:bg-card'
          }`}
        >
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">快速记录</span>
              <span className="text-xs text-muted-foreground">粘贴即保存</span>
            </div>
            <div className="flex items-center gap-2">
              {/* 类型指示器 */}
              <AnimatePresence mode="wait">
                {input && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground"
                  >
                    {getTypeIcon()}
                    {getTypeLabel()}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 快捷键提示 */}
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Enter 保存 · Esc 取消
              </span>
            </div>
          </div>

          {/* 输入区域 */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder="粘贴提示词、链接、图片... 按 Enter 自动保存"
              className="w-full px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[60px] max-h-[200px]"
              rows={1}
              disabled={isProcessing}
            />

            {/* 处理中状态 */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-b-2xl"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">AI 分析中...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 成功状态 */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm rounded-b-2xl"
                >
                  <div className="flex items-center gap-2 text-green-500">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">已保存</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>支持:</span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted">
                <FileText className="h-3 w-3" /> 文本
              </span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted">
                <Link className="h-3 w-3" /> 链接
              </span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted">
                <Image className="h-3 w-3" /> 图片
              </span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted">
                <Video className="h-3 w-3" /> 视频
              </span>
            </div>

            <div className="flex items-center gap-2">
              {input && (
                <button
                  onClick={() => setInput('')}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={processInput}
                disabled={!input.trim() || isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
