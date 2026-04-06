"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  ExternalLink,
  Eye,
  X,
  ChevronRight,
  Filter
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Drop zone state
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Detail dialog state
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const loadData = useCallback(() => {
    const loadedPrompts = promptApi.getAll({ 
      categoryId: selectedCategory || undefined,
      search: searchQuery || undefined 
    })
    const loadedCategories = categoryApi.getAll()
    setPrompts(loadedPrompts)
    setCategories(loadedCategories)
    setIsLoading(false)
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Drag and drop handlers
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
        item.getAsString((str) => {
          if (str.startsWith('http')) urls.push(str)
        })
      }
    }

    for (const file of files) {
      await processFile(file)
    }

    for (const url of urls) {
      await processUrl(url)
    }
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
            title: result.title,
            content: result.content,
            sourceType: 'IMAGE',
            sourceFileName: file.name,
            sourceFileData: base64,
            tags: result.tags,
            isPublic: false,
          })
          
          toast.success(`已提取图片: ${file.name}`)
          loadData()
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        const result = await aiExtract.fromVideo(file.name)
        
        promptApi.create({
          title: result.title,
          content: result.content,
          sourceType: 'VIDEO',
          sourceFileName: file.name,
          tags: result.tags,
          isPublic: false,
        })
        
        toast.success(`已提取视频: ${file.name}`)
        loadData()
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        const result = await aiExtract.fromText(text)
        
        promptApi.create({
          title: result.title,
          content: result.content,
          sourceType: 'TEXT',
          sourceFileName: file.name,
          tags: result.tags,
          isPublic: false,
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
        title: result.title,
        content: result.content,
        sourceType: 'LINK',
        sourceUrl: url,
        tags: result.tags,
        isPublic: false,
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

    for (const file of Array.from(files)) {
      await processFile(file)
    }
    
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Wand2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Prompt Manager</h1>
                <p className="text-xs text-muted-foreground">AI 提示词管理工具</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="搜索提示词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <ThemeToggle />
              <a 
                href="https://github.com/ljm-920914/prompt-manager" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon">
                  <GitHubIcon className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Drop Zone */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative rounded-2xl p-12 text-center cursor-pointer overflow-hidden
            transition-all duration-300
            ${isDragging 
              ? 'bg-primary/10 border-2 border-primary scale-[1.02]' 
              : 'bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40'
            }
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
          
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          
          {isProcessing ? (
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
              </div>
              <div>
                <p className="text-lg font-medium">AI 正在分析素材...</p>
                <p className="text-sm text-muted-foreground">自动识别类型并提取提示词</p>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center"
                >
                  <Image className="h-7 w-7 text-primary" />
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center"
                >
                  <Video className="h-7 w-7 text-secondary" />
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center"
                >
                  <Link className="h-7 w-7 text-accent" />
                </motion.div>
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {isDragging ? '松开即可导入' : '拖拽素材到这里'}
                </p>
                <p className="text-muted-foreground mt-2">
                  支持图片、视频、链接、文本文件 · 自动识别提取提示词
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="font-normal">JPG</Badge>
                <Badge variant="secondary" className="font-normal">PNG</Badge>
                <Badge variant="secondary" className="font-normal">MP4</Badge>
                <Badge variant="secondary" className="font-normal">Web链接</Badge>
                <Badge variant="secondary" className="font-normal">TXT</Badge>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 px-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">筛选</span>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${selectedCategory === null 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Folder className="h-4 w-4" />
                    全部提示词
                  </span>
                  <Badge variant={selectedCategory === null ? "secondary" : "outline"} className="text-xs">
                    {prompts.length}
                  </Badge>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${selectedCategory === category.id 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: selectedCategory === category.id ? 'currentColor' : category.color }}
                      />
                      {category.name}
                    </span>
                    <Badge variant={selectedCategory === category.id ? "secondary" : "outline"} className="text-xs">
                      {prompts.filter(p => p.categoryId === category.id).length}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Prompts Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name 
                  : '全部提示词'
                }
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({prompts.length})
                </span>
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {prompts.length === 0 && !isLoading ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">暂无提示词</h3>
                  <p className="text-muted-foreground max-w-sm">
                    拖拽图片、视频或链接到上方区域，自动提取提示词
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {prompts.map((prompt) => {
                    const category = getCategoryById(prompt.categoryId)
                    return (
                      <motion.div
                        key={prompt.id}
                        variants={itemVariants}
                        layout
                        whileHover={{ y: -4 }}
                        className="group"
                      >
                        <div 
                          className="relative bg-card rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
                          onClick={() => handleOpenDetail(prompt)}
                        >
                          {/* Image Preview */}
                          {prompt.sourceFileData && prompt.sourceType === 'IMAGE' && (
                            <div className="relative aspect-video overflow-hidden bg-muted">
                              <img 
                                src={prompt.sourceFileData} 
                                alt={prompt.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1.5 rounded-lg bg-muted">
                                  {getSourceIcon(prompt.sourceType)}
                                </div>
                                <h3 className="font-semibold truncate">{prompt.title}</h3>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt.content, prompt.id); }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    复制
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeletePrompt(prompt.id); }} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {/* Category & Tags */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {category && (
                                <Badge 
                                  style={{ 
                                    backgroundColor: category.color + "15", 
                                    color: category.color,
                                    borderColor: category.color + "30"
                                  }}
                                  variant="outline"
                                  className="text-xs font-medium"
                                >
                                  {category.name}
                                </Badge>
                              )}
                              {prompt.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs font-normal">
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs font-normal">
                                  +{prompt.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Preview */}
                            <p className="text-sm text-muted-foreground line-clamp-3 font-mono bg-muted/50 p-3 rounded-lg">
                              {prompt.content}
                            </p>
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  {prompt.viewCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Copy className="h-3.5 w-3.5" />
                                  {prompt.useCount}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                查看详情
                                <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
      
      {/* Detail Dialog */}
      <PromptDetailDialog
        prompt={selectedPrompt}
        categories={categories}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={handleUpdatePrompt}
      />
    </div>
  )
}