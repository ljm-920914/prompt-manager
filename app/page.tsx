"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Github
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { promptApi, categoryApi, backupApi, aiExtract, type Prompt, type Category } from "@/lib/storage"

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

    // Process files
    for (const file of files) {
      await processFile(file)
    }

    // Process URLs
    for (const url of urls) {
      await processUrl(url)
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    
    try {
      if (file.type.startsWith('image/')) {
        // Process image
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          const result = await aiExtract.fromImage(file.name, base64)
          
          const newPrompt = promptApi.create({
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
        // Process video
        const result = await aiExtract.fromVideo(file.name)
        
        const newPrompt = promptApi.create({
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
        // Process text file
        const text = await file.text()
        const result = await aiExtract.fromText(text)
        
        const newPrompt = promptApi.create({
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
      
      const newPrompt = promptApi.create({
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
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Prompt Manager</h1>
              <Badge variant="outline" className="ml-2 text-xs">v2.0</Badge>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索提示词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="h-4 w-4 mr-1" />
                导入
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                导出
              </Button>
              <a 
                href="https://github.com/ljm-920914/prompt-manager" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Drop Zone */}
      <div className="container mx-auto px-4 py-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50'
            }
            ${isProcessing ? 'pointer-events-none opacity-70' : ''}
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
          
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div>
                <p className="font-medium">AI 正在分析...</p>
                <p className="text-sm text-muted-foreground">自动识别素材类型并提取提示词</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Link className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <p className="font-medium text-lg">
                  {isDragging ? '松开即可导入' : '拖拽素材到这里'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  支持图片、视频、链接、文本文件 · 自动识别提取提示词
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-muted rounded">JPG</span>
                <span className="px-2 py-1 bg-muted rounded">PNG</span>
                <span className="px-2 py-1 bg-muted rounded">MP4</span>
                <span className="px-2 py-1 bg-muted rounded">Web链接</span>
                <span className="px-2 py-1 bg-muted rounded">TXT</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  分类
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === null 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>全部</span>
                      <Badge variant={selectedCategory === null ? "secondary" : "outline"}>
                        {prompts.length}
                      </Badge>
                    </button>
                    
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <Badge variant={selectedCategory === category.id ? "secondary" : "outline"}>
                          {prompts.filter(p => p.categoryId === category.id).length}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Prompts Grid */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="grid">网格</TabsTrigger>
                  <TabsTrigger value="list">列表</TabsTrigger>
                </TabsList>
                <span className="text-sm text-muted-foreground">
                  共 {prompts.length} 个提示词
                </span>
              </div>

              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prompts.map((prompt) => {
                    const category = getCategoryById(prompt.categoryId)
                    return (
                      <Card key={prompt.id} className="group overflow-hidden">
                        {prompt.sourceFileData && prompt.sourceType === 'IMAGE' && (
                          <div className="h-32 bg-muted overflow-hidden">
                            <img 
                              src={prompt.sourceFileData} 
                              alt={prompt.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getSourceIcon(prompt.sourceType)}
                              <CardTitle className="text-base font-medium line-clamp-1">
                                {prompt.title}
                              </CardTitle>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCopyPrompt(prompt.content, prompt.id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  复制
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeletePrompt(prompt.id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {category && (
                              <Badge 
                                style={{ backgroundColor: category.color + "20", color: category.color, borderColor: category.color }}
                                variant="outline"
                                className="text-xs"
                              >
                                {category.name}
                              </Badge>
                            )}
                            {prompt.sourceType === 'LINK' && prompt.sourceUrl && (
                              <Badge variant="secondary" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                链接
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3 font-mono text-xs bg-muted p-2 rounded">
                            {prompt.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {prompt.viewCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <Copy className="h-3 w-3" />
                                {prompt.useCount}
                              </span>
                            </div>
                            
                            <div className="flex gap-1">
                              {prompt.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{prompt.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <Card>
                  <div className="divide-y">
                    {prompts.map((prompt) => {
                      const category = getCategoryById(prompt.categoryId)
                      return (
                        <div key={prompt.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getSourceIcon(prompt.sourceType)}
                              <span className="font-medium truncate">{prompt.title}</span>
                              {category && (
                                <Badge 
                                  style={{ backgroundColor: category.color + "20", color: category.color }}
                                  variant="outline"
                                  className="text-xs shrink-0"
                                >
                                  {category.name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate font-mono text-xs">
                              {prompt.content.substring(0, 100)}...
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCopyPrompt(prompt.content, prompt.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeletePrompt(prompt.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {prompts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">暂无提示词</h3>
                <p className="text-muted-foreground mb-4">
                  拖拽图片、视频或链接到上方区域，自动提取提示词
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
