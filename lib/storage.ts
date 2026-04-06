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
  sourceFileData?: string // base64 for images
  sourceVideoData?: string // base64 for video thumbnail
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

// 保存数据
function saveData(data: StorageData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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

  create: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'useCount' | 'shareToken'>): Prompt => {
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
    saveData(data)
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
    saveData(data)
    return data.prompts[index]
  },

  delete: (id: string): boolean => {
    const data = getData()
    const index = data.prompts.findIndex(p => p.id === id)
    if (index === -1) return false
    data.prompts.splice(index, 1)
    saveData(data)
    return true
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

  create: (category: Omit<Category, 'id'>): Category => {
    const data = getData()
    const newCategory: Category = {
      ...category,
      id: generateId(),
    }
    data.categories.push(newCategory)
    saveData(data)
    return newCategory
  },

  update: (id: string, updates: Partial<Category>): Category | undefined => {
    const data = getData()
    const index = data.categories.findIndex(c => c.id === id)
    if (index === -1) return undefined
    data.categories[index] = { ...data.categories[index], ...updates }
    saveData(data)
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
    saveData(data)
    return true
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
        saveData(data)
        return true
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

// 生成视频缩略图
async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('无法创建 canvas context'))
      return
    }

    video.preload = 'metadata'
    video.crossOrigin = 'anonymous'
    
    video.onloadedmetadata = () => {
      // 在视频的 1/4 处截取缩略图
      video.currentTime = Math.min(video.duration * 0.25, 5)
    }
    
    video.onseeked = () => {
      // 设置 canvas 尺寸为视频尺寸（限制最大宽度）
      const maxWidth = 640
      const scale = Math.min(1, maxWidth / video.videoWidth)
      canvas.width = video.videoWidth * scale
      canvas.height = video.videoHeight * scale
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      try {
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnail)
      } catch (err) {
        reject(err)
      }
      
      // 清理
      URL.revokeObjectURL(video.src)
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('视频加载失败'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

// 将视频文件转为 base64
async function videoToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// AI 提取模拟
export const aiExtract = {
  fromImage: async (fileName: string, base64Data: string): Promise<{ title: string; content: string; tags: string[] }> => {
    // 模拟 AI 分析图片提取提示词
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      title: `从图片提取: ${fileName}`,
      content: ` masterpiece, best quality, highly detailed, 

// 这里是 AI 从图片分析出的提示词内容
// 实际使用时应接入 Claude/GPT-4 Vision API

positive prompt:
- subject: beautiful landscape
- style: digital art
- lighting: soft natural light
- colors: vibrant, saturated

negative prompt:
- blurry, low quality
- distorted, deformed`,
      tags: ['AI绘画', 'Midjourney', '图片提取']
    }
  },

  fromVideo: async (file: File): Promise<{ title: string; content: string; tags: string[]; thumbnail?: string; videoData?: string }> => {
    // 同时生成缩略图和获取视频数据
    const [thumbnail, videoData] = await Promise.all([
      generateVideoThumbnail(file).catch(() => undefined),
      videoToBase64(file)
    ])
    
    // 模拟 AI 分析
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      title: `从视频提取: ${file.name}`,
      content: `// 从视频提取的提示词

视频内容分析:
- 场景: 城市夜景
- 风格: 赛博朋克
- 色调: 霓虹蓝紫
- 氛围: 未来科技感

生成提示词:
Cyberpunk cityscape at night, neon lights reflecting on wet streets, towering skyscrapers with holographic advertisements, flying vehicles, dystopian atmosphere, highly detailed, cinematic lighting, 8k quality`,
      tags: ['视频分析', '赛博朋克', '场景描述'],
      thumbnail,
      videoData
    }
  },

  fromLink: async (url: string): Promise<{ title: string; content: string; tags: string[] }> => {
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

  fromText: async (text: string): Promise<{ title: string; content: string; tags: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 智能识别文本类型
    const isPrompt = text.includes('prompt') || text.includes('提示词') || text.length > 100
    
    return {
      title: isPrompt ? '识别的提示词' : '文本内容',
      content: text,
      tags: isPrompt ? ['已识别', '提示词'] : ['文本', '待整理']
    }
  }
}
