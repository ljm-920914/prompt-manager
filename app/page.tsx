"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Link, 
  Image, 
  Video, 
  FileText, 
  Folder,
  Copy,
  Trash2,
  Download,
  Upload,
  Sparkles,
  MoreHorizontal,
  Loader2,
  Wand2,
  Eye,
  ChevronRight,
  Filter,
  Settings,
  Gamepad2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { promptApi, categoryApi, backupApi, aiExtract, type Prompt, type Category } from "@/lib/storage"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubIcon } from "@/components/github-icon"
import { PromptDetailDialog } from "@/components/prompt-detail-dialog"
import { CategoryManager } from "@/components/category-manager"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

// Gaming neon colors
const NEON_COLORS = {
  cyan: "#00d4aa",
  purple: "#7c3aed", 
  pink: "#f472b6",
  amber: "#fbbf24",
  blue: "#3b82f6"
}

export default function Home() {
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)

  const loadData = useCallback(() => {
    const allLoadedPrompts = promptApi.getAll()
    setAllPrompts(allLoadedPrompts)
    const filteredPrompts = promptApi.getAll({ 
      categoryId: selectedCategory || undefined,
      search: searchQuery || undefined 
    })
    setPrompts(filteredPrompts)
    const loadedCategories = categoryApi.getAll()
    setCategories(loadedCategories)
    setIsLoading(false)
  }, [selectedCategory, searchQuery])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateCategory = (category: Omit<Category, "id">) => {
    categoryApi.create(category)
    loadData()
  }

  const handleDeleteCategory = (id: string) => {
    categoryApi.delete(id)
    loadData()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
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
        item.getAsString((str) => { if (str.startsWith('http')) urls.push(str) })
      }
    }

    for (const file of files) await processFile(file)
    for (const url of urls) await processUrl(url)
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          const result = await aiExtract.fromImage(file.name, base64)
          promptApi.create({
            title: result.title, content: result.content, sourceType: 'IMAGE',
            sourceFileName: file.name, sourceFileData: base64, tags: result.tags, isPublic: false,
          })
          toast.success(`已提取图片: ${file.name}`)
          loadData()
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        const result = await aiExtract.fromVideo(file.name)
        promptApi.create({
          title: result.title, content: result.content, sourceType: 'VIDEO',
          sourceFileName: file.name, tags: result.tags, isPublic: false,
        })
        toast.success(`已提取视频: ${file.name}`)
        loadData()
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        const result = await aiExtract.fromText(text)
        promptApi.create({
          title: result.title, content: result.content, sourceType: 'TEXT',
          sourceFileName: file.name, tags: result.tags, isPublic: false,
        })
        toast.success(`已导入文本: ${file.name}`)
        loadData()
      } else {
        toast.error(`不支持的文件类型: ${file.type || file.name}`)
      }
    } catch (error) {
      toast.error(`处理失败: ${file.name}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const processUrl = async (url: string) => {
    setIsProcessing(true)
    try {
      const result = await aiExtract.fromLink(url)
      promptApi.create({
        title: result.title, content: result.content, sourceType: 'LINK',
        sourceUrl: url, tags: result.tags, isPublic: false,
      })
      toast.success(`已提取链接`)
      loadData()
    } catch (error) {
      toast.error(`链接提取失败`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) await processFile(file)
    e.target.value = ''
  }

  const handleDeletePrompt = (id: string) => {
    if (!confirm("确定要删除这个提示词吗？")) return
    if (promptApi.delete(id)) {
      toast.success("删除成功")
      loadData()
    }
  }

  const handleCopyPrompt = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    promptApi.incrementUse(id)
    toast.success("已复制到剪贴板")
    loadData()
  }
  
  const handleUpdatePrompt = (id: string, updates: Partial<Prompt>) => {
    promptApi.update(id, updates)
    loadData()
    if (selectedPrompt && selectedPrompt.id === id) {
      setSelectedPrompt({ ...selectedPrompt, ...updates })
    }
  }
  
  const handleOpenDetail = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    promptApi.incrementView(prompt.id)
    setIsDetailOpen(true)
    loadData()
  }

  const handleExport = () => {
    const data = backupApi.export()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("导出成功")
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (backupApi.import(content)) {
        toast.success("导入成功")
        loadData()
      } else {
        toast.error("导入失败，文件格式错误")
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "LINK": return <Link className="h-4 w-4" />
      case "IMAGE": return <Image className="h-4 w-4" />
      case "VIDEO": return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryById = (id?: string) => categories.find(c => c.id === id)
  const getCategoryCount = (categoryId?: string) => {
    if (!categoryId) return allPrompts.length
    return allPrompts.filter(p => p.categoryId === categoryId).length
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0ff]">
      {/* Header with neon glow */}
      <header className="border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50"
        style={{ boxShadow: '0 4px 30px rgba(0, 212, 170, 0.1)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#7c3aed] flex items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(0, 212, 170, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)' }}>
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-white"
                  style={{ textShadow: '0 0 10px rgba(0, 212, 170, 0.5)' }}>
                  PROMPT MANAGER
                </h1>
                <p className="text-xs text-[#6b6b8a]">AI 提示词管理工具</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b8a] group-focus-within:text-[#00d4aa] transition-colors" />
                <Input
                  placeholder="搜索提示词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#12121a] border-[#2a2a3a] text-[#e0e0ff] placeholder:text-[#6b6b8a] focus:border-[#00d4aa] focus:ring-[#00d4aa]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('import-file')?.click()}
                className="text-[#6b6b8a] hover:text-[#00d4aa] hover:bg-[#00d4aa]/10">
                <Upload className="h-4 w-4 mr-2" />导入
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}
                className="text-[#6b6b8a] hover:text-[#00d4aa] hover:bg-[#00d4aa]/10">
                <Download className="h-4 w-4 mr-2" />导出
              </Button>
              <ThemeToggle />
              <a href="https://github.com/ljm-920914/prompt-manager" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-[#6b6b8a] hover:text-[#f472b6]">
                  <GitHubIcon className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Drop Zone with neon border */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative rounded-2xl p-12 text-center cursor-pointer overflow-hidden transition-all duration-300
            ${isDragging 
              ? 'scale-[1.02]' 
              : ''
            }
          `}
          style={{
            background: 'linear-gradient(135deg, #12121a, #0f0f16)',
            border: isDragging ? '2px solid #00d4aa' : '2px dashed #2a2a3a',
            boxShadow: isDragging ? '0 0 30px rgba(0, 212, 170, 0.3), inset 0 0 30px rgba(0, 212, 170, 0.1)' : 'none'
          }}
        >
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.txt,.md" onChange={handleFileSelect} className="hidden" />
          
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)' }} />
          
          {isProcessing ? (
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-[#00d4aa]" />
                <div className="absolute inset-0 blur-xl bg-[#00d4aa]/50 rounded-full" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">AI 正在分析素材...</p>
                <p className="text-sm text-[#6b6b8a]">自动识别类型并提取提示词</p>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.1 }} className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00d4aa20, #00d4aa10)', border: '1px solid #00d4aa40' }}>
                  <Image className="h-7 w-7 text-[#00d4aa]" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed20, #7c3aed10)', border: '1px solid #7c3aed40' }}>
                  <Video className="h-7 w-7 text-[#7c3aed]" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f472b620, #f472b610)', border: '1px solid #f472b640' }}>
                  <Link className="h-7 w-7 text-[#f472b6]" />
                </motion.div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(0, 212, 170, 0.3)' }}>
                  {isDragging ? '松开即可导入' : '拖拽素材到这里'}
                </p>
                <p className="text-[#6b6b8a] mt-2">支持图片、视频、链接、文本文件 · 自动识别提取提示词</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30">JPG</span>
                <span className="px-2 py-1 rounded bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/30">PNG</span>
                <span className="px-2 py-1 rounded bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/30">MP4</span>
                <span className="px-2 py-1 rounded bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/30">Web链接</span>
                <span className="px-2 py-1 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30">TXT</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#6b6b8a]" />
                  <span className="text-sm font-medium text-[#6b6b8a]">筛选</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-[#6b6b8a] hover:text-[#00d4aa]"
                  onClick={() => setIsCategoryManagerOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <button onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${selectedCategory === null 
                      ? "text-white" 
                      : "text-[#6b6b8a] hover:text-white hover:bg-[#1e1e2e]"
                    }`}
                  style={selectedCategory === null ? {
                    background: 'linear-gradient(135deg, #00d4aa20, #7c3aed20)',
                    border: '1px solid #00d4aa50',
                    boxShadow: '0 0 20px rgba(0, 212, 170, 0.2)'
                  } : {}}>
                  <span className="flex items-center gap-3">
                    <Folder className="h-4 w-4" />
                    全部提示词
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e1e2e] text-[#6b6b8a]">
                    {getCategoryCount()}
                  </span>
                </button>
                
                {categories.map((category) => (
                  <button key={category.id} onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${selectedCategory === category.id 
                        ? "text-white" 
                        : "text-[#6b6b8a] hover:text-white hover:bg-[#1e1e2e]"
                      }`}
                    style={selectedCategory === category.id ? {
                      background: `${category.color}20`,
                      border: `1px solid ${category.color}50`,
                      boxShadow: `0 0 20px ${category.color}30`
                    } : {}}>
                    <span className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e1e2e] text-[#6b6b8a]">
                      {getCategoryCount(category.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Prompts Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '全部提示词'}
                <span className="ml-2 text-sm font-normal text-[#6b6b8a]">({prompts.length})</span>
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {prompts.length === 0 && !isLoading ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-[#12121a] flex items-center justify-center mb-4"
                    style={{ border: '1px solid #2a2a3a' }}>
                    <Sparkles className="h-10 w-10 text-[#6b6b8a]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">暂无提示词</h3>
                  <p className="text-[#6b6b8a] max-w-sm">拖拽图片、视频或链接到上方区域，自动提取提示词</p>
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {prompts.map((prompt) => {
                    const category = getCategoryById(prompt.categoryId)
                    return (
                      <motion.div key={prompt.id} variants={itemVariants} layout whileHover={{ y: -4 }} className="group">
                        <div onClick={() => handleOpenDetail(prompt)}
                          className="relative bg-[#12121a] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl"
                          style={{
                            border: '1px solid #2a2a3a',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                          }}>
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ boxShadow: 'inset 0 0 30px rgba(0, 212, 170, 0.1)' }} />
                          
                          {prompt.sourceFileData && prompt.sourceType === 'IMAGE' && (
                            <div className="relative aspect-video overflow-hidden bg-[#0a0a0f]">
                              <img src={prompt.sourceFileData} alt={prompt.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
                            </div>
                          )}
                          
                          <div className="p-5 relative">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1.5 rounded-lg bg-[#1e1e2e] text-[#6b6b8a]">
                                  {getSourceIcon(prompt.sourceType)}
                                </div>
                                <h3 className="font-bold text-white truncate">{prompt.title}</h3>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" 
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#6b6b8a] hover:text-white hover:bg-[#1e1e2e]">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#1a1a25] border-[#2a2a3a]">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt.content, prompt.id); }}
                                    className="text-[#e0e0ff] hover:bg-[#00d4aa]/10 hover:text-[#00d4aa]">
                                    <Copy className="h-4 w-4 mr-2" />复制
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeletePrompt(prompt.id); }}
                                    className="text-[#ef4444] hover:bg-[#ef4444]/10">
                                    <Trash2 className="h-4 w-4 mr-2" />删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {category && (
                              <div className="mb-3">
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{
                                    backgroundColor: `${category.color}15`,
                                    color: category.color,
                                    border: `1px solid ${category.color}30`
                                  }}>
                                  {category.name}
                                </span>
                              </div>
                            )}
                            
                            <p className="text-sm text-[#6b6b8a] line-clamp-3 font-mono bg-[#0a0a0f] p-3 rounded-lg border border-[#2a2a3a]">
                              {prompt.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2a2a3a]">
                              <div className="flex items-center gap-4 text-xs text-[#6b6b8a]">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />{prompt.viewCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Copy className="h-3.5 w-3.5" />{prompt.useCount}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" 
                                className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-[#00d4aa] hover:bg-[#00d4aa]/10">
                                查看详情<ChevronRight className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      
      <PromptDetailDialog prompt={selectedPrompt} categories={categories} open={isDetailOpen}
        onOpenChange={setIsDetailOpen} onUpdate={handleUpdatePrompt} />
      <CategoryManager categories={categories} open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen} onCreate={handleCreateCategory} onDelete={handleDeleteCategory} />
    </div>
  )
}
