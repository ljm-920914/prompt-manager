"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search, Link, Image, Video, FileText, Folder,
  Copy, Trash2, Download, Upload, Wand2,
  MoreHorizontal, Eye, Filter, Settings,
  LayoutGrid, List, X, Play, RefreshCw, Cloud, CloudOff, CheckCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { promptApi, categoryApi, backupApi, syncApi, loadAllData, type Prompt, type Category } from "@/lib/storage"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubIcon } from "@/components/github-icon"
import { PromptDetailDialog } from "@/components/prompt-detail-dialog"
import { CategoryManager } from "@/components/category-manager"
import { EmptyState } from "@/components/empty-state"
import { DropZone } from "@/components/drop-zone"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const APP_VERSION = "1.2.0"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 500, damping: 30 } }
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
  const [syncStatus, setSyncStatus] = useState<{ connected: boolean; lastSync?: string; gistUrl?: string }>({ connected: false })
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [syncToken, setSyncToken] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const loadData = useCallback(async () => {
    const [promptsData, catsData] = await Promise.all([
      loadAllData(),
      categoryApi.getAll()
    ])
    setAllPrompts(promptsData.prompts)
    const filtered = promptsData.prompts.filter(p => {
      if (selectedCategory && p.categoryId !== selectedCategory) return false
      if (searchQuery) {
        const s = searchQuery.toLowerCase()
        if (!p.title.toLowerCase().includes(s) && !p.content.toLowerCase().includes(s) && !p.description?.toLowerCase().includes(s)) return false
      }
      return true
    })
    setPrompts(filtered)
    setCategories(catsData)
    setIsLoading(false)
  }, [selectedCategory, searchQuery])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    syncApi.getStatus().then(setSyncStatus)
  }, [])

  const handleCreateCategory = async (cat: Omit<Category, 'id'>) => {
    await categoryApi.create(cat)
    loadData()
  }

  const handleDeleteCategory = async (id: string) => {
    await categoryApi.delete(id)
    loadData()
  }

  const processFile = async (file: File) => {
    try {
      if (file.type.startsWith('image/')) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        const result = await (await import("@/lib/storage")).aiExtract.fromImage(file.name, base64)
        const created = await promptApi.create({
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
          toast.error(`存储失败: ${file.name}，存储空间可能不足`)
        }
      } else if (file.type.startsWith('video/')) {
        const result = await (await import("@/lib/storage")).aiExtract.fromVideo(file)
        const created = await promptApi.create({
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
          if (result.videoData) toast.success(`已提取视频: ${file.name}`)
          else toast.warning(`视频较大，已保存缩略图: ${file.name}`)
          loadData()
        } else {
          toast.error(`存储失败: ${file.name}，存储空间可能不足`)
        }
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        const result = await (await import("@/lib/storage")).aiExtract.fromText(text)
        const created = await promptApi.create({
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
    } catch (error: any) {
      console.error('处理失败:', error)
      toast.error(`处理失败: ${error?.message || file.name}`)
    }
  }

  const processUrl = async (url: string) => {
    try {
      const result = await (await import("@/lib/storage")).aiExtract.fromLink(url)
      const created = await promptApi.create({
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
    } catch {
      toast.error(`链接提取失败`)
    }
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("确定要删除这个提示词吗？")) return
    await promptApi.delete(id)
    toast.success("删除成功")
    loadData()
  }

  const handleCopyPrompt = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    promptApi.incrementUse(id)
    toast.success("已复制到剪贴板")
    loadData()
  }

  const handleUpdatePrompt = async (id: string, updates: Partial<Prompt>) => {
    await promptApi.update(id, updates)
    loadData()
    if (selectedPrompt && selectedPrompt.id === id) {
      const updated = await promptApi.getById(id)
      if (updated) setSelectedPrompt(updated)
    }
  }

  const handleOpenDetail = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    promptApi.incrementView(prompt.id)
    setIsDetailOpen(true)
  }

  const handleExport = async () => {
    const data = await backupApi.export()
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
    reader.onload = async (event) => {
      const content = event.target?.result as string
      if (await backupApi.import(content)) {
        toast.success("导入成功")
        loadData()
      } else {
        toast.error("导入失败，文件格式错误")
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleSync = async () => {
    setIsSyncing(true)
    const result = await syncApi.push()
    setIsSyncing(false)
    if (result.success) {
      toast.success(`已同步到云端 ${result.url ? `\n${result.url}` : ''}`)
      syncApi.getStatus().then(setSyncStatus)
    } else {
      toast.error(`同步失败: ${result.error}`)
    }
  }

  const handlePull = async () => {
    setIsSyncing(true)
    const result = await syncApi.pull()
    setIsSyncing(false)
    if (result.success) {
      toast.success(`已从云端拉取 ${result.count} 条提示词`)
      loadData()
      syncApi.getStatus().then(setSyncStatus)
    } else {
      toast.error(`拉取失败: ${result.error}`)
    }
  }

  const handleConnect = async () => {
    if (!syncToken.trim()) {
      toast.error("请输入 GitHub Token")
      return
    }
    setIsConnecting(true)
    const result = await syncApi.connect(syncToken.trim())
    setIsConnecting(false)
    if (result.success) {
      toast.success("GitHub 连接成功！")
      setIsSyncModalOpen(false)
      setSyncToken("")
      syncApi.getStatus().then(setSyncStatus)
      // 首次连接，自动推送一次
      handleSync()
    } else {
      toast.error(result.error || "连接失败")
    }
  }

  const handleDisconnect = async () => {
    await syncApi.disconnect()
    setSyncStatus({ connected: false })
    toast.success("已断开 GitHub 同步")
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

  const getPreviewData = (prompt: Prompt) => {
    if (prompt.sourceType === 'IMAGE' && prompt.sourceFileData) return { type: 'image' as const, data: prompt.sourceFileData }
    if (prompt.sourceType === 'VIDEO' && prompt.sourceVideoData) return { type: 'video' as const, data: prompt.sourceVideoData }
    return null
  }

  const formatLastSync = (iso?: string) => {
    if (!iso) return '从未同步'
    try {
      const d = new Date(iso)
      const now = Date.now()
      const diff = now - d.getTime()
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      return d.toLocaleDateString('zh-CN')
    } catch { return '未知' }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Wand2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground tracking-tight">Prompt Manager</h1>
                <p className="text-xs text-muted-foreground">AI 提示词管理</p>
              </div>
            </div>

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
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="hidden sm:flex">
                <Upload className="h-4 w-4 mr-2" />导入
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport} className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />导出
              </Button>
              {/* 云同步按钮 */}
              {syncStatus.connected ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSync}
                    disabled={isSyncing}
                    title={`云同步 ${formatLastSync(syncStatus.lastSync)}`}
                    className="text-green-500 hover:text-green-600"
                  >
                    {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsSyncModalOpen(true)} title="云同步设置">
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsSyncModalOpen(true)} className="hidden sm:flex gap-1">
                  <CloudOff className="h-4 w-4" />云同步
                </Button>
              )}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <a href="https://github.com/ljm-920914/prompt-manager" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon">
                  <GitHubIcon className="h-5 w-5" />
                </Button>
              </a>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground cursor-help" title={"版本 " + APP_VERSION}>
                v{APP_VERSION}
              </Badge>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 云同步 Modal */}
      <Dialog open={isSyncModalOpen} onOpenChange={setIsSyncModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{syncStatus.connected ? "云同步设置" : "连接 GitHub 云同步"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {syncStatus.connected ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">已连接 GitHub</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  上次同步: {formatLastSync(syncStatus.lastSync)}
                </p>
                {syncStatus.gistUrl && (
                  <a href={syncStatus.gistUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">
                    查看 Gist: {syncStatus.gistUrl}
                  </a>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSync} disabled={isSyncing} className="flex-1">
                    <Cloud className="h-4 w-4 mr-2" />推送本地数据
                  </Button>
                  <Button onClick={handlePull} disabled={isSyncing} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />从云端拉取
                  </Button>
                </div>
                <Button onClick={handleDisconnect} variant="ghost" className="w-full text-red-500 hover:text-red-600">
                  断开连接
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  使用 GitHub Personal Access Token 将数据同步到 Gist，换电脑也能看到你的提示词。
                </p>
                <div>
                  <label className="text-sm font-medium mb-1 block">GitHub Token</label>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={syncToken}
                    onChange={e => setSyncToken(e.target.value)}
                  />
                </div>
                <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                  {isConnecting ? "连接中..." : "连接并同步"}
                </Button>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">如何生成 GitHub Token？</summary>
                  <div className="mt-2 space-y-1">
                    <p>1. 打开 <a href="https://github.com/settings/tokens/new" target="_blank" className="text-blue-500 hover:underline">github.com/settings/tokens/new</a></p>
                    <p>2. Note 随便填，如 "prompt-manager"</p>
                    <p>3. Expiration 选 30 days 或更长</p>
                    <p>4. 勾选 <strong>repo</strong> (完整仓库访问)</p>
                    <p>5. 点 Generate token，复制粘贴到这里</p>
                  </div>
                </details>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            <div className="sticky top-[88px] space-y-1">
              <button
                onClick={clearSearch}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Folder className="h-4 w-4 inline mr-2" />
                全部提示词
                <span className="ml-auto text-xs opacity-60">{getCategoryCount(undefined)}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                  <span className="ml-auto text-xs opacity-60">{getCategoryCount(cat.id)}</span>
                </button>
              ))}
              <div className="pt-3 border-t border-border mt-3">
                <button onClick={() => setIsCategoryManagerOpen(true)} className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                  <Settings className="h-4 w-4 inline mr-2" />管理分类
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
                <motion.aside
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="fixed left-0 top-0 bottom-0 w-56 bg-background z-50 p-4 shadow-xl lg:hidden overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">分类</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-muted rounded">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <button onClick={() => { clearSearch(); setIsMobileMenuOpen(false) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}>
                      全部提示词 ({getCategoryCount(undefined)})
                    </button>
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}>
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                        {cat.name} ({getCategoryCount(cat.id)})
                      </button>
                    ))}
                    <div className="pt-3 border-t border-border mt-3">
                      <button onClick={() => setIsCategoryManagerOpen(true)} className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
                        <Settings className="h-4 w-4 inline mr-2" />管理分类
                      </button>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? '加载中...' : `${prompts.length} 条提示词`}
                {searchQuery && ` · 搜索: "${searchQuery}"`}
                {selectedCategory && ` · ${getCategoryById(selectedCategory)?.name || ''}`}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <EmptyState viewMode={viewMode} onImport={() => document.getElementById('import-file')?.click()} />
            ) : viewMode === 'grid' ? (
              <motion.div variants={containerVariants} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {prompts.map(prompt => {
                  const preview = getPreviewData(prompt)
                  return (
                    <motion.div key={prompt.id} variants={itemVariants}>
                      <div className="group relative rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                        onClick={() => handleOpenDetail(prompt)}>
                        {preview ? (
                          preview.type === 'image' ? (
                            <div className="relative aspect-video overflow-hidden">
                              <img src={preview.data} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="relative aspect-video overflow-hidden bg-black/80">
                              <img src={preview.data} alt="" className="w-full h-full object-contain" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                                  <Play className="h-5 w-5 text-white fill-white" />
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            {getSourceIcon(prompt.sourceType)}
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm line-clamp-1">{prompt.title}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              {getSourceIcon(prompt.sourceType)}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                  <button className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCopyPrompt(prompt.content, prompt.id)}>
                                    <Copy className="h-4 w-4 mr-2" />复制
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenDetail(prompt)}>
                                    <Eye className="h-4 w-4 mr-2" />查看详情
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeletePrompt(prompt.id)} className="text-red-500">
                                    <Trash2 className="h-4 w-4 mr-2" />删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prompt.content}</p>
                          {prompt.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {prompt.tags.slice(0,3).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
                {prompts.map(prompt => (
                  <motion.div key={prompt.id} variants={itemVariants}>
                    <div className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => handleOpenDetail(prompt)}>
                      <div className="shrink-0">
                        {getSourceIcon(prompt.sourceType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{prompt.title}</h3>
                          {prompt.isPublic && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600">已公开</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{prompt.content}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); handleCopyPrompt(prompt.content, prompt.id) }}
                          className="p-2 hover:bg-muted rounded-lg"><Copy className="h-4 w-4" /></button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <button className="p-2 hover:bg-muted rounded-lg"><MoreHorizontal className="h-4 w-4" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetail(prompt)}><Eye className="h-4 w-4 mr-2" />查看详情</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePrompt(prompt.id)} className="text-red-500"><Trash2 className="h-4 w-4 mr-2" />删除</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedPrompt && (
        <PromptDetailDialog
          prompt={selectedPrompt}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          categories={categories}
          onUpdate={handleUpdatePrompt}
          onCopy={handleCopyPrompt}
          onDelete={handleDeletePrompt}
        />
      )}

      {/* Category Manager */}
      <CategoryManager
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        categories={categories}
        onCreate={handleCreateCategory}
        onUpdate={categoryApi.update}
        onDelete={handleDeleteCategory}
      />
    </div>
  )
}
