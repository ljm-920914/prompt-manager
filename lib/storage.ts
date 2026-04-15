// 纯前端存储 - 使用 localStorage
const STORAGE_KEY = 'prompt-manager-data-v2'

export interface Prompt {
  id: string
  title: string
  content: string
  description?: string
  sourceType: 'TEXT' | 'LINK' | 'IMAGE' | 'VIDEO'
  sourceUrl?: string
  sourceFileName?: string
  sourceFileData?: string // base64 for images and videos (limited size)
  sourceVideoData?: string // base64 for video thumbnail (small size)
  categoryId?: string
  tags: string[]
  isPublic: boolean
  shareToken?: string
  viewCount: number
  useCount: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  order: number
}

interface StorageData {
  prompts: Prompt[]
  categories: Category[]
}

// 初始化默认数据
const defaultData: StorageData = {
  prompts: [],
  categories: [
    { id: 'cat-1', name: 'AI绘画', description: 'Midjourney/Stable Diffusion 提示词', color: '#8b5cf6', order: 0 },
    { id: 'cat-2', name: 'ChatGPT', description: 'ChatGPT/Claude 对话提示词', color: '#3b82f6', order: 1 },
    { id: 'cat-3', name: '文案写作', description: '营销文案、文章生成', color: '#22c55e', order: 2 },
    { id: 'cat-4', name: '代码开发', description: '编程辅助提示词', color: '#f59e0b', order: 3 },
    { id: 'cat-5', name: '视频创作', description: '视频脚本、分镜提示词', color: '#ef4444', order: 4 },
  ]
}

// 获取存储数据
function getData(): StorageData {
  if (typeof window === 'undefined') return defaultData
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
    return defaultData
  }
  return { ...defaultData, ...JSON.parse(data) }
}

// 保存数据（带错误处理）
function saveData(data: StorageData): boolean {
  if (typeof window === 'undefined') return false
  try {
    const json = JSON.stringify(data)
    // 检查数据大小（localStorage 通常限制 5-10MB）
    const sizeInMB = new Blob([json]).size / 1024 / 1024
    if (sizeInMB > 4.5) {
      console.warn(`数据大小 ${sizeInMB.toFixed(2)}MB 接近存储限制`)
      return false
    }
    localStorage.setItem(STORAGE_KEY, json)
    return true
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      console.error('存储空间不足，请删除一些提示词')
    }
    return false
  }
}

// 生成ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 生成分享Token
function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Prompt API
export const promptApi = {
  getAll: (filters?: { categoryId?: string; search?: string; tag?: string }): Prompt[] => {
    const data = getData()
    let prompts = data.prompts

    if (filters?.categoryId) {
      prompts = prompts.filter(p => p.categoryId === filters.categoryId)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      prompts = prompts.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.content.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      )
    }

    if (filters?.tag) {
      prompts = prompts.filter(p => p.tags.includes(filters.tag!))
    }

    return prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getById: (id: string): Prompt | undefined => {
    const data = getData()
    return data.prompts.find(p => p.id === id)
  },

  getByShareToken: (token: string): Prompt | undefined => {
    const data = getData()
    return data.prompts.find(p => p.shareToken === token && p.isPublic)
  },

  create: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'useCount' | 'shareToken'>): Prompt | null => {
    const data = getData()
    const newPrompt: Prompt = {
      ...prompt,
      id: generateId(),
      shareToken: prompt.isPublic ? generateShareToken() : undefined,
      viewCount: 0,
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.prompts.push(newPrompt)

    if (!saveData(data)) {
      return null
    }
    return newPrompt
  },

  update: (id: string, updates: Partial<Prompt>): Prompt | undefined => {
    const data = getData()
    const index = data.prompts.findIndex(p => p.id === id)
    if (index === -1) return undefined

    const oldPrompt = data.prompts[index]

    let shareToken = oldPrompt.shareToken
    if (updates.isPublic !== undefined) {
      if (updates.isPublic && !oldPrompt.isPublic) {
        shareToken = generateShareToken()
      } else if (!updates.isPublic && oldPrompt.isPublic) {
        shareToken = undefined
      }
    }

    data.prompts[index] = {
      ...oldPrompt,
      ...updates,
      shareToken,
      updatedAt: new Date().toISOString(),
    }

    if (!saveData(data)) {
      return undefined
    }
    return data.prompts[index]
  },

  delete: (id: string): boolean => {
    const data = getData()
    const index = data.prompts.findIndex(p => p.id === id)
    if (index === -1) return false
    data.prompts.splice(index, 1)
    return saveData(data)
  },

  incrementView: (id: string) => {
    const data = getData()
    const prompt = data.prompts.find(p => p.id === id)
    if (prompt) {
      prompt.viewCount++
      saveData(data)
    }
  },

  incrementUse: (id: string) => {
    const data = getData()
    const prompt = data.prompts.find(p => p.id === id)
    if (prompt) {
      prompt.useCount++
      saveData(data)
    }
  },
}

// Category API
export const categoryApi = {
  getAll: (): Category[] => {
    const data = getData()
    return data.categories.sort((a, b) => a.order - b.order)
  },

  getById: (id: string): Category | undefined => {
    const data = getData()
    return data.categories.find(c => c.id === id)
  },

  create: (category: Omit<Category, 'id'>): Category | null => {
    const data = getData()
    const newCategory: Category = {
      ...category,
      id: generateId(),
    }
    data.categories.push(newCategory)
    if (!saveData(data)) {
      return null
    }
    return newCategory
  },

  update: (id: string, updates: Partial<Category>): Category | undefined => {
    const data = getData()
    const index = data.categories.findIndex(c => c.id === id)
    if (index === -1) return undefined
    data.categories[index] = { ...data.categories[index], ...updates }
    if (!saveData(data)) {
      return undefined
    }
    return data.categories[index]
  },

  delete: (id: string): boolean => {
    const data = getData()
    const index = data.categories.findIndex(c => c.id === id)
    if (index === -1) return false
    data.categories.splice(index, 1)
    data.prompts.forEach(p => {
      if (p.categoryId === id) {
        p.categoryId = undefined
      }
    })
    return saveData(data)
  },
}

// 导出/导入
export const backupApi = {
  export: (): string => {
    const data = getData()
    return JSON.stringify(data, null, 2)
  },

  import: (json: string): boolean => {
    try {
      const data = JSON.parse(json)
      if (data.prompts && data.categories) {
        return saveData(data)
      }
      return false
    } catch {
      return false
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

// ============================================================
// 素材预览工具函数（供 DropZone 等组件直接调用）
// ============================================================

/** 从 File 对象生成缩略图，返回 base64 JPEG（失败返回 null） */
export async function generateThumbnailFromFile(file: File): Promise<string | null> {
  if (file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string ?? null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  if (file.type.startsWith('video/')) {
    return generateVideoThumbnail(file)
  }

  return null
}

// 生成视频缩略图
async function generateVideoThumbnail(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      resolve(null)
      return
    }

    video.style.position = 'fixed'
    video.style.left = '-9999px'
    video.style.top = '-9999px'
    video.style.opacity = '0'
    video.style.pointerEvents = 'none'
    video.style.width = '1px'
    video.style.height = '1px'
    document.body.appendChild(video)

    const objectUrl = URL.createObjectURL(file)
    let settled = false

    const cleanup = () => {
      try { URL.revokeObjectURL(objectUrl) } catch {}
      try { video.pause() } catch {}
      try { video.remove() } catch {}
    }

    const settle = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      try { fn() } finally { cleanup() }
    }

    const timeout = setTimeout(() => settle(() => resolve(null)), 20000)

    video.addEventListener('loadedmetadata', () => {
      // 限制缩略图最大宽度 480px，质量 0.7
      const maxW = 480
      const scale = video.videoWidth > 0 ? Math.min(1, maxW / video.videoWidth) : 1
      canvas.width = Math.floor(video.videoWidth * scale) || maxW
      canvas.height = Math.floor(video.videoHeight * scale) || Math.floor(maxW * 9 / 16)

      // 尝试跳到 10% 位置（通常有内容）
      if (isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.min(video.duration * 0.1, 5)
      } else {
        // 立即截第一帧
        settle(() => captureFrame())
      }
    }, { once: true })

    video.addEventListener('seeked', () => settle(() => captureFrame()), { once: true })

    video.addEventListener('error', () => {
      settle(() => resolve(null))
    }, { once: true })

    const captureFrame = () => {
      try {
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      } catch {
        resolve(null)
      }
    }

    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.src = objectUrl
    video.load()
  })
}

// ============================================================
// AI 提取逻辑（模拟版本，可替换为真实 API）
// ============================================================
export const aiExtract = {
  fromImage: async (fileName: string, base64Data: string): Promise<{
    title: string
    content: string
    tags: string[]
    imageData?: string
  }> => {
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      title: `图片提取: ${fileName}`,
      content: ` masterpiece, best quality, highly detailed,

// 这里应接入 Claude/GPT-4 Vision API 进行真实分析

positive prompt:
- subject: beautiful landscape
- style: digital art
- lighting: soft natural light
- colors: vibrant, saturated

negative prompt:
- blurry, low quality
- distorted, deformed`,
      tags: ['AI绘画', 'Midjourney', '图片提取'],
      imageData: base64Data
    }
  },

  fromVideo: async (file: File): Promise<{
    title: string
    content: string
    tags: string[]
    thumbnail?: string
    videoData?: string
  }> => {
    // 先生成缩略图（必须成功，否则整个流程失败）
    let thumbnail: string | null = null
    try {
      thumbnail = await generateVideoThumbnail(file)
    } catch (thumbError) {
      console.warn('视频缩略图生成失败:', thumbError)
    }

    if (!thumbnail) {
      throw new Error(`视频 "${file.name}" 无法生成缩略图，可能格式不支持或文件损坏`)
    }

    // 视频文件 base64：仅保存 5MB 以内的，否则只存缩略图
    const MAX_VIDEO_SIZE = 5 * 1024 * 1024
    let videoData: string | undefined

    if (file.size <= MAX_VIDEO_SIZE) {
      try {
        videoData = await new Promise<string | undefined>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => resolve(undefined)
          reader.readAsDataURL(file)
        })
      } catch {
        videoData = undefined
      }
    } else {
      console.warn(`视频 ${(file.size / 1024 / 1024).toFixed(1)}MB > 5MB，仅保存缩略图`)
    }

    // 模拟 AI 分析延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      title: `视频提取: ${file.name}`,
      content: `// 从视频提取的提示词

视频内容分析:
- 场景: 城市夜景
- 风格: 赛博朋克
- 色调: 霓虹蓝紫
- 氛围: 未来科技感

生成提示词:
Cyberpunk cityscape at night, neon lights reflecting on wet streets, towering skyscrapers with holographic advertisements, flying vehicles, dystopian atmosphere, highly detailed, cinematic lighting, 8k quality`,
      tags: ['视频分析', '赛博朋克', '场景描述'],
      thumbnail: thumbnail ?? undefined,
      videoData
    }
  },

  fromLink: async (url: string): Promise<{
    title: string
    content: string
    tags: string[]
  }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const domain = new URL(url).hostname
      return {
        title: `从 ${domain} 提取`,
        content: `// 从网页链接提取的提示词
// 来源: ${url}

提取内容:
这是一个示例提取结果。实际使用时应通过后端服务抓取网页内容，然后使用 AI 分析提取提示词。

你可以手动编辑这个内容，或者重新提取。`,
        tags: ['网页提取', '链接导入']
      }
    } catch {
      return {
        title: '链接提取失败',
        content: '无法解析该链接，请检查链接格式是否正确。',
        tags: ['提取失败']
      }
    }
  },

  fromText: async (text: string): Promise<{
    title: string
    content: string
    tags: string[]
  }> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const isPrompt = text.includes('prompt') || text.includes('提示词') || text.length > 100

    return {
      title: isPrompt ? '识别的提示词' : '文本内容',
      content: text,
      tags: isPrompt ? ['已识别', '提示词'] : ['文本', '待整理']
    }
  }
}
