"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Wand2,
  MoreHorizontal,
  Eye,
  Filter,
  Settings,
  LayoutGrid,
  List,
  X,
  Play
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
import { EmptyState } from "@/components/empty-state"
import { DropZone } from "@/components/drop-zone"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
}

export default function Home() {
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const processFile = async (file: File) => {
    setIsProcessing(true)
    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          const result = await aiExtract.fromImage(file.name, base64)
          const created = promptApi.create({
            title: result.title, 
            content: result.content, 
            sourceType: 'IMAGE',
            sourceFileName: file.name, 
            sourceFileData: result.imageData || base64, 
            tags: result.tags, 
            isPublic: false,
          })
          if (created) {
            toast.success(`已提取图片: ${file.name}`)
            loadData()
          } else {
            toast.error(`存储失败: ${file.name}，可能超出存储空间限制`)
          }
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        const toastId = toast.info("正在处理视频，请稍候...", { duration: 60000 })
        try {
          const result = await aiExtract.fromVideo(file)
          toast.dismiss(toastId)
          
          // 检查是否有数据可以保存
          if (!result.thumbnail && !result.videoData) {
            toast.error(`视频处理失败: ${file.name}，无法生成预览`)
            return
          }
          
          const created = promptApi.create({
            title: result.title, 
            content: result.content, 
            sourceType: 'VIDEO',
            sourceFileName: file.name, 
            sourceFileData: result.videoData,
            sourceVideoData: result.thumbnail,
            tags: result.tags, 
            isPublic: false,
          })
          
          if (created) {
            if (result.videoData) {
              toast.success(`已提取视频: ${file.name}`)
            } else {
              toast.success(`已提取视频缩略图: ${file.name} (视频过大仅保存缩略图)`)
            }
            loadData()
          } else {
            toast.error(`存储失败: ${file.name}，可能超出存储空间限制`)
          }
        } catch (videoError) {
          toast.dismiss(toastId)
          console.error('视频处理失败:', videoError)
          toast.error(`视频处理失败: ${file.name}，请检查视频格式或尝试其他视频`)
        }
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        const result = await aiExtract.fromText(text)
        const created = promptApi.create({
          title: result.title, 
          content: result.content, 
          sourceType: 'TEXT',
          sourceFileName: file.name, 
          tags: result.tags, 
          isPublic: false,
        })
        if (created) {
          toast.success(`已导入文本: ${file.name}`)
          loadData()
        } else {
          toast.error(`存储失败: ${file.name}`)
        }
      } else {
        toast.error(`不支持的文件类型: ${file.type || file.name}`)
      }
    } catch (error) {
      console.error('处理失败:', error)
      toast.error(`处理失败: ${file.name}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const processUrl = async (url: string) => {
    setIsProcessing(true)
    try {
      const result = await aiExtract.fromLink(url)
      const created = promptApi.create({
        title: result.title, 
        content: result.content, 
        sourceType: 'LINK',
        sourceUrl: url, 
        tags: result.tags, 
        isPublic: false,
      })
      if (created) {
        toast.success(`已提取链接`)
        loadData()
      } else {
        toast.error(`存储失败`)
      }
    } catch (error) {
      toast.error(`链接提取失败`)
    } finally {
      setIsProcessing(false)
    }
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

  const clearSearch = () => {
    setSearchQuery("")
    setSelectedCategory(null)
  }

  // 获取预览图（图片或视频缩略图）
  const getPreviewData = (prompt: Prompt) => {
    if (prompt.sourceType === 'IMAGE' && prompt.sourceFileData) {
      return { type: 'image' as const, data: prompt.sourceFileData }
    }
    if (prompt.sourceType === 'VIDEO' && prompt.sourceVideoData) {
      return { type: 'video' as const, data: prompt.sourceVideoData }
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Wand2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground tracking-tight">Prompt Manager</h1>
                <p className="text-xs text-muted-foreground">AI 提示词管理</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索提示词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('import-file')?.click()}
                className="hidden sm:flex">
                <Upload className="h-4 w-4 mr-2" />导入
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}
                className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />导出
              </Button>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <a href="https://github.com/ljm-920914/prompt-manager" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon">
                  <GitHubIcon className="h-5 w-5" />
                </Button>
              </a>
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Drop Zone */}
      <div className="container mx-auto px-4 py-6">
        <DropZone 
          onFileSelect={processFile}
          onUrlProcess={processUrl}
          isProcessing={isProcessing}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20 space-y-2">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">分类</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                  onClick={() => setIsCategoryManagerOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <button onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${selectedCategory === null 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>
                  <span className="flex items-center gap-2.5">
                    <Folder className="h-4 w-4" />
                    全部提示词
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                    {getCategoryCount()}
                  </span>
                </button>
                
                {categories.map((category) => (
                  <button key={category.id} onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedCategory === category.id 
                        ? "" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    style={selectedCategory === category.id ? {
                      backgroundColor: `${category.color}15`,
                      color: category.color
                    } : {}}>
                    <span className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {getCategoryCount(category.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fixed inset-0 z-40 lg:hidden"
              >
                <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">分类</span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                      onClick={() => setIsCategoryManagerOpen(true)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <button onClick={() => { setSelectedCategory(null); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${selectedCategory === null 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}>
                      <span className="flex items-center gap-2.5">
                        <Folder className="h-4 w-4" />
                        全部提示词
                      </span>
                      <span className="text-xs">{getCategoryCount()}</span>
                    </button>
                    {categories.map((category) => (
                      <button key={category.id} 
                        onClick={() => { setSelectedCategory(category.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${selectedCategory === category.id 
                            ? "" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        style={selectedCategory === category.id ? {
                          backgroundColor: `${category.color}15`,
                          color: category.color
                        } : {}}>
                        <span className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </span>
                        <span className="text-xs">{getCategoryCount(category.id)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompts Grid */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '全部提示词'}
                </h2>
                <span className="text-sm text-muted-foreground">({prompts.length})</span>
                {(searchQuery || selectedCategory) && (
                  <button 
                    onClick={clearSearch}
                    className="text-xs text-primary hover:underline ml-2"
                  >
                    清除筛选
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {prompts.length === 0 && !isLoading ? (
                <EmptyState 
                  hasFilters={!!searchQuery || !!selectedCategory}
                  onClearFilters={clearSearch}
                />
              ) : (
                <motion.div 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="visible"
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-3"
                  }
                >
                  {prompts.map((prompt) => {
                    const category = getCategoryById(prompt.categoryId)
                    const preview = getPreviewData(prompt)
                    return (
                      <motion.div 
                        key={prompt.id} 
                        variants={itemVariants} 
                        layout 
                        className="group"
                      >
                        <div onClick={() => handleOpenDetail(prompt)}
                          className={`relative bg-card rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-border hover:border-primary/30
                            ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : ''}
                          `}
                        >
                          {/* Preview for grid view */}
                          {viewMode === 'grid' && preview && (
                            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                              {preview.type === 'image' ? (
                                <img src={preview.data} alt={prompt.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              ) : (
                                <>
                                  <img src={preview.data} alt={prompt.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                                      <Play className="h-5 w-5 text-white ml-0.5" />
                                    </div>
                                  </div>
                                </>
                              )}
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                              {/* Source type badge */}
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-xs text-white/90 flex items-center gap-1">
                                  {preview.type === 'video' ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                                  {preview.type === 'video' ? '视频' : '图片'}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className={`${viewMode === 'grid' ? 'p-4' : 'flex-1 min-w-0'}`}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {viewMode === 'list' && (
                                  <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                                    {getSourceIcon(prompt.sourceType)}
                                  </div>
                                )}
                                
                                <h3 className="font-medium text-foreground truncate">{prompt.title}</h3>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" 
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt.content, prompt.id); }}>
                                    <Copy className="h-4 w-4 mr-2" />复制
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeletePrompt(prompt.id); }}
                                    className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {viewMode === 'grid' && category && (
                              <div className="mb-3">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${category.color}15`,
                                    color: category.color,
                                  }}
                                >
                                  {category.name}
                                </span>
                              </div>
                            )}
                            
                            <p className={`text-sm text-muted-foreground bg-muted/50 rounded-lg
                              ${viewMode === 'grid' ? 'p-3 line-clamp-2' : 'p-2 line-clamp-1 flex-1'}
                            `}
                            >
                              {prompt.content}
                            </p>
                            
                            <div className={`flex items-center justify-between mt-3 pt-3 border-t border-border
                              ${viewMode === 'list' ? 'border-0 pt-0 mt-2' : ''}
                            `}
                            >
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />{prompt.viewCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Copy className="h-3.5 w-3.5" />{prompt.useCount}
                                </span>
                              </div>
                              {viewMode === 'list' && category && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${category.color}15`,
                                    color: category.color,
                                  }}
                                >
                                  {category.name}
                                </span>
                              )}
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
