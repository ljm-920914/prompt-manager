// ============================================================
// 升级版存储层：IndexedDB（支持大文件）+ GitHub Gist 云同步
// ============================================================

const DB_NAME = 'prompt-manager-db'
const DB_VERSION = 1
const STORE_PROMPTS = 'prompts'
const STORE_CATEGORIES = 'categories'
const STORE_META = 'meta'

export interface Prompt {
  id: string
  title: string
  content: string
  description?: string
  sourceType: 'TEXT' | 'LINK' | 'IMAGE' | 'VIDEO'
  sourceUrl?: string
  sourceFileName?: string
  sourceFileData?: string // base64 (images + small videos)
  sourceVideoData?: string // base64 thumbnail
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

interface SyncMeta {
  gistId?: string
  gistUrl?: string
  lastSync?: string
  syncToken?: string // GitHub PAT
}

// 默认分类
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'AI绘画', description: 'Midjourney/Stable Diffusion 提示词', color: '#8b5cf6', order: 0 },
  { id: 'cat-2', name: 'ChatGPT', description: 'ChatGPT/Claude 对话提示词', color: '#3b82f6', order: 1 },
  { id: 'cat-3', name: '文案写作', description: '营销文案、文章生成', color: '#22c55e', order: 2 },
  { id: 'cat-4', name: '代码开发', description: '编程辅助提示词', color: '#f59e0b', order: 3 },
  { id: 'cat-5', name: '视频创作', description: '视频脚本、分镜提示词', color: '#ef4444', order: 4 },
]

// ============================================================
// IndexedDB 操作
// ============================================================

let _db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_PROMPTS)) {
        const ps = db.createObjectStore(STORE_PROMPTS, { keyPath: 'id' })
        ps.createIndex('categoryId', 'categoryId', { unique: false })
        ps.createIndex('createdAt', 'createdAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
      }
    }

    request.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }

    request.onerror = () => reject(request.error)
  })
}

function dbGet<T>(store: string): Promise<T[]> {
  return openDB().then(db =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly')
      const req = tx.objectStore(store).getAll()
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error)
    })
  )
}

function dbPut(store: string, item: any): Promise<void> {
  return openDB().then(db =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).put(item)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  )
}

function dbDelete(store: string, id: string): Promise<void> {
  return openDB().then(db =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  )
}

function dbClear(store: string): Promise<void> {
  return openDB().then(db =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  )
}

function dbGetOne<T>(store: string, id: string): Promise<T | undefined> {
  return openDB().then(db =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly')
      const req = tx.objectStore(store).get(id)
      req.onsuccess = () => resolve(req.result as T | undefined)
      req.onerror = () => reject(req.error)
    })
  )
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// ============================================================
// Meta 存储（云同步配置）
// ============================================================

async function getMeta(): Promise<Record<string, any>> {
  try {
    const all = await dbGet<{ key: string; value: any }>(STORE_META)
    const result: Record<string, any> = {}
    for (const item of all) result[item.key] = item.value
    return result
  } catch { return {} }
}

async function setMeta(key: string, value: any): Promise<void> {
  await dbPut(STORE_META, { key, value })
}

// ============================================================
// Prompt API（IndexedDB）
// ============================================================

export const promptApi = {
  getAll: (filters?: { categoryId?: string; search?: string; tag?: string }): Prompt[] => {
    // 同步版本：从 localStorage 兜底（IndexedDB 需要异步初始化）
    const raw = localStorage.getItem('prompt-manager-async-v1')
    if (!raw) return []
    const data: StorageData = JSON.parse(raw)
    let prompts = data.prompts || []
    if (filters?.categoryId) prompts = prompts.filter(p => p.categoryId === filters.categoryId)
    if (filters?.search) {
      const s = filters.search.toLowerCase()
      prompts = prompts.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.content.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s)
      )
    }
    if (filters?.tag) prompts = prompts.filter(p => p.tags.includes(filters.tag!))
    return prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getById: (id: string): Promise<Prompt | undefined> =>
    dbGetOne<Prompt>(STORE_PROMPTS, id),

  getByShareToken: async (token: string): Promise<Prompt | undefined> => {
    const prompts = await dbGet<Prompt>(STORE_PROMPTS)
    return prompts.find(p => p.shareToken === token && p.isPublic)
  },

  create: async (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'useCount' | 'shareToken'>): Promise<Prompt | null> => {
    try {
      const newPrompt: Prompt = {
        ...prompt,
        id: generateId(),
        shareToken: prompt.isPublic ? generateShareToken() : undefined,
        viewCount: 0,
        useCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await dbPut(STORE_PROMPTS, newPrompt)
      await _syncLocalCache()
      return newPrompt
    } catch (e) {
      console.error('创建提示词失败:', e)
      return null
    }
  },

  update: async (id: string, updates: Partial<Prompt>): Promise<Prompt | undefined> => {
    try {
      const old = await dbGetOne<Prompt>(STORE_PROMPTS, id)
      if (!old) return undefined
      let shareToken = old.shareToken
      if (updates.isPublic !== undefined) {
        if (updates.isPublic && !old.isPublic) shareToken = generateShareToken()
        else if (!updates.isPublic && old.isPublic) shareToken = undefined
      }
      const updated: Prompt = { ...old, ...updates, shareToken, updatedAt: new Date().toISOString() }
      await dbPut(STORE_PROMPTS, updated)
      await _syncLocalCache()
      return updated
    } catch (e) {
      console.error('更新提示词失败:', e)
      return undefined
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await dbDelete(STORE_PROMPTS, id)
      await _syncLocalCache()
      return true
    } catch (e) {
      console.error('删除提示词失败:', e)
      return false
    }
  },

  incrementView: async (id: string) => {
    const p = await dbGetOne<Prompt>(STORE_PROMPTS, id)
    if (p) { p.viewCount++; await dbPut(STORE_PROMPTS, p) }
  },

  incrementUse: async (id: string) => {
    const p = await dbGetOne<Prompt>(STORE_PROMPTS, id)
    if (p) { p.useCount++; await dbPut(STORE_PROMPTS, p) }
  },
}

// ============================================================
// Category API（IndexedDB）
// ============================================================

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      const cats = await dbGet<Category>(STORE_CATEGORIES)
      if (cats.length === 0) {
        // 初始化默认分类
        for (const c of DEFAULT_CATEGORIES) await dbPut(STORE_CATEGORIES, c)
        return DEFAULT_CATEGORIES
      }
      return cats.sort((a, b) => a.order - b.order)
    } catch { return DEFAULT_CATEGORIES }
  },

  getById: (id: string): Promise<Category | undefined> =>
    dbGetOne<Category>(STORE_CATEGORIES, id),

  create: async (cat: Omit<Category, 'id'>): Promise<Category | null> => {
    try {
      const newCat: Category = { ...cat, id: generateId() }
      await dbPut(STORE_CATEGORIES, newCat)
      return newCat
    } catch { return null }
  },

  update: async (id: string, updates: Partial<Category>): Promise<Category | undefined> => {
    try {
      const old = await dbGetOne<Category>(STORE_CATEGORIES, id)
      if (!old) return undefined
      const updated = { ...old, ...updates }
      await dbPut(STORE_CATEGORIES, updated)
      return updated
    } catch { return undefined }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      // 把该分类下的提示词移出分类
      const prompts = await dbGet<Prompt>(STORE_PROMPTS)
      for (const p of prompts) {
        if (p.categoryId === id) {
          p.categoryId = undefined
          await dbPut(STORE_PROMPTS, p)
        }
      }
      await dbDelete(STORE_CATEGORIES, id)
      return true
    } catch { return false }
  },
}

// ============================================================
// 本地缓存（供同步版本的 getAll 快速读取）
// ============================================================

async function _syncLocalCache(): Promise<void> {
  try {
    const prompts = await dbGet<Prompt>(STORE_PROMPTS)
    const categories = await dbGet<Category>(STORE_CATEGORIES)
    localStorage.setItem('prompt-manager-async-v1', JSON.stringify({ prompts, categories }))
  } catch (e) {
    console.warn('同步本地缓存失败:', e)
  }
}

export async function loadAllData(): Promise<StorageData> {
  try {
    const prompts = await dbGet<Prompt>(STORE_PROMPTS)
    const categories = await dbGet<Category>(STORE_CATEGORIES)
    await _syncLocalCache()
    return { prompts: prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), categories }
  } catch (e) {
    console.error('加载数据失败:', e)
    return { prompts: [], categories: DEFAULT_CATEGORIES }
  }
}

// ============================================================
// GitHub Gist 云同步
// ============================================================

export const syncApi = {
  /** 获取同步状态 */
  getStatus: async (): Promise<{ connected: boolean; lastSync?: string; gistUrl?: string }> => {
    const meta = await getMeta()
    return {
      connected: !!(meta.syncToken),
      lastSync: meta.lastSync,
      gistUrl: meta.gistUrl,
    }
  },

  /** 连接 GitHub（保存 PAT） */
  connect: async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 验证 token 是否有效
      const r = await fetch('https://api.github.com/gists', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        return { success: false, error: err.message || 'Token 无效，请检查是否正确' }
      }
      await setMeta('syncToken', token)
      return { success: true }
    } catch (e) {
      return { success: false, error: '网络错误，请检查网络后重试' }
    }
  },

  /** 断开连接 */
  disconnect: async (): Promise<void> => {
    await setMeta('syncToken', undefined)
    await setMeta('gistId', undefined)
    await setMeta('gistUrl', undefined)
    await setMeta('lastSync', undefined)
  },

  /** 推送到 Gist */
  push: async (): Promise<{ success: boolean; error?: string; url?: string }> => {
    const meta = await getMeta()
    const token = meta.syncToken
    if (!token) return { success: false, error: '未连接 GitHub，请先连接' }

    try {
      const prompts = await dbGet<Prompt>(STORE_PROMPTS)
      const categories = await dbGet<Category>(STORE_CATEGORIES)
      const data = JSON.stringify({ prompts, categories, exportedAt: new Date().toISOString(), version: '1.0' }, null, 2)

      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }
      const gistId = meta.gistId

      let r: Response
      if (gistId) {
        // 更新已有 Gist
        r = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            description: 'Prompt Manager 数据备份 (自动)',
            files: { 'prompt-manager-backup.json': { content: data } }
          })
        })
      } else {
        // 创建新 Gist
        r = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            description: 'Prompt Manager 数据备份 (自动)',
            public: false,
            files: { 'prompt-manager-backup.json': { content: data } }
          })
        })
      }

      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        return { success: false, error: err.message || '推送失败' }
      }

      const gist = await r.json()
      await setMeta('gistId', gist.id)
      await setMeta('gistUrl', gist.html_url)
      await setMeta('lastSync', new Date().toISOString())
      return { success: true, url: gist.html_url }
    } catch (e) {
      return { success: false, error: '网络错误' }
    }
  },

  /** 从 Gist 拉取数据 */
  pull: async (): Promise<{ success: boolean; error?: string; count?: number }> => {
    const meta = await getMeta()
    const token = meta.syncToken
    const gistId = meta.gistId
    if (!token || !gistId) return { success: false, error: '未连接 GitHub' }

    try {
      const r = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      })
      if (!r.ok) return { success: false, error: '拉取失败，Token 可能已失效' }

      const gist = await r.json()
      const file = gist.files['prompt-manager-backup.json']
      if (!file) return { success: false, error: 'Gist 中没有找到备份文件' }

      const data: StorageData = JSON.parse(file.content)
      if (!data.prompts || !data.categories) {
        return { success: false, error: '备份文件格式错误' }
      }

      // 合并数据（新数据优先，保留本地新创建的）
      const localPrompts = await dbGet<Prompt>(STORE_PROMPTS)
      const localIds = new Set(localPrompts.map(p => p.id))
      const remoteIds = new Set(data.prompts.map(p => p.id))

      // 拉取远程新增的（本地没有的）
      let added = 0
      for (const p of data.prompts) {
        if (!localIds.has(p.id)) { await dbPut(STORE_PROMPTS, p); added++ }
      }
      for (const c of data.categories) {
        if (!localIds.has(c.id)) await dbPut(STORE_CATEGORIES, c)
      }
      // 简单策略：更新已存在的（以远程为准）
      for (const p of data.prompts) {
        if (localIds.has(p.id)) await dbPut(STORE_PROMPTS, p)
      }
      for (const c of data.categories) {
        await dbPut(STORE_CATEGORIES, c)
      }

      await setMeta('lastSync', new Date().toISOString())
      await _syncLocalCache()
      return { success: true, count: data.prompts.length }
    } catch (e) {
      return { success: false, error: '网络错误' }
    }
  },
}

// ============================================================
// 导出/导入
// ============================================================

export const backupApi = {
  export: async (): Promise<string> => {
    const prompts = await dbGet<Prompt>(STORE_PROMPTS)
    const categories = await dbGet<Category>(STORE_CATEGORIES)
    return JSON.stringify({ prompts, categories, exportedAt: new Date().toISOString() }, null, 2)
  },

  import: async (json: string): Promise<boolean> => {
    try {
      const data: StorageData = JSON.parse(json)
      if (!data.prompts || !data.categories) return false
      await dbClear(STORE_PROMPTS)
      await dbClear(STORE_CATEGORIES)
      for (const p of data.prompts) await dbPut(STORE_PROMPTS, p)
      for (const c of data.categories) await dbPut(STORE_CATEGORIES, c)
      await _syncLocalCache()
      return true
    } catch { return false }
  },

  clear: async () => {
    await dbClear(STORE_PROMPTS)
    await dbClear(STORE_CATEGORIES)
    localStorage.removeItem('prompt-manager-async-v1')
  }
}

// ============================================================
// 素材预览工具
// ============================================================

/** 从 File 生成缩略图 base64（失败返回 null） */
export async function generateThumbnailFromFile(file: File): Promise<string | null> {
  if (file.type.startsWith('image/')) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve((e.target?.result as string) ?? null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }
  if (file.type.startsWith('video/')) return _generateVideoThumbnail(file)
  return null
}

async function _generateVideoThumbnail(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) { resolve(null); return }

    video.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;width:1px;height:1px'
    document.body.appendChild(video)

    const objectUrl = URL.createObjectURL(file)
    let settled = false
    const cleanup = () => { try { URL.revokeObjectURL(objectUrl) } catch {}; try { video.pause() } catch {}; try { video.remove() } catch {} }
    const settle = (fn: () => void) => { if (settled) return; settled = true; clearTimeout(timeout); cleanup(); try { fn() } catch {} }

    const timeout = setTimeout(() => settle(() => resolve(null)), 20000)

    const captureFrame = () => {
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }

    video.addEventListener('loadedmetadata', () => {
      const maxW = 480
      canvas.width = Math.floor(Math.min(video.videoWidth || maxW, maxW))
      canvas.height = Math.floor((canvas.width / (video.videoWidth || 16)) * (video.videoHeight || 9))
      if (isFinite(video.duration) && video.duration > 0) video.currentTime = Math.min(video.duration * 0.1, 5)
      else settle(() => captureFrame())
    }, { once: true })

    video.addEventListener('seeked', () => settle(() => captureFrame()), { once: true })
    video.addEventListener('error', () => settle(() => resolve(null)), { once: true })

    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.src = objectUrl
    video.load()
  })
}

// ============================================================
// AI 提取（模拟版本）
// ============================================================

export const aiExtract = {
  fromImage: async (fileName: string, base64Data: string) => {
    await new Promise(r => setTimeout(r, 1500))
    return {
      title: `图片提取: ${fileName}`,
      content: `// 从图片提取的提示词\n\npositive prompt:\n- subject, style, lighting, colors\n\nnegative prompt:\n- blurry, low quality`,
      tags: ['AI绘画', '图片提取'],
      imageData: base64Data
    }
  },

  fromVideo: async (file: File) => {
    let thumbnail: string | null = null
    try { thumbnail = await _generateVideoThumbnail(file) } catch {}

    if (!thumbnail) throw new Error(`视频 "${file.name}" 无法生成缩略图`)

    const MAX_VIDEO = 20 * 1024 * 1024 // IndexedDB 支持 20MB 视频
    let videoData: string | undefined

    if (file.size <= MAX_VIDEO) {
      try {
        videoData = await new Promise<string | undefined>(resolve => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string)
          reader.onerror = () => resolve(undefined)
          reader.readAsDataURL(file)
        })
      } catch { videoData = undefined }
    } else {
      console.warn(`视频 ${(file.size / 1024 / 1024).toFixed(1)}MB > 20MB，仅保存缩略图`)
    }

    await new Promise(r => setTimeout(r, 800))

    return {
      title: `视频提取: ${file.name}`,
      content: `// 从视频提取的提示词\n\n场景、风格、色调、氛围分析结果`,
      tags: ['视频分析'],
      thumbnail: thumbnail ?? undefined,
      videoData
    }
  },

  fromLink: async (url: string) => {
    await new Promise(r => setTimeout(r, 1000))
    try {
      const domain = new URL(url).hostname
      return { title: `从 ${domain} 提取`, content: `// 来源: ${url}\n\n提取内容...`, tags: ['网页提取'] }
    } catch {
      return { title: '链接提取失败', content: '无法解析该链接', tags: ['提取失败'] }
    }
  },

  fromText: async (text: string) => {
    await new Promise(r => setTimeout(r, 500))
    const isPrompt = text.includes('prompt') || text.includes('提示词') || text.length > 100
    return { title: isPrompt ? '识别的提示词' : '文本内容', content: text, tags: isPrompt ? ['已识别'] : ['文本'] }
  }
}
