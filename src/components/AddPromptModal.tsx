'use client'

import { useState } from 'react'
import { X, Link, Image, Video, FileText, Loader2, Sparkles } from 'lucide-react'
import { usePromptStore } from '@/store/promptStore'

interface AddPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

type InputType = 'text' | 'link' | 'image' | 'video'

export default function AddPromptModal({ isOpen, onClose }: AddPromptModalProps) {
  const [activeTab, setActiveTab] = useState<InputType>('text')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const addPrompt = usePromptStore((state) => state.addPrompt)
  const fetchCategories = usePromptStore((state) => state.fetchCategories)

  const tabs = [
    { id: 'text' as InputType, label: '文本', icon: FileText },
    { id: 'link' as InputType, label: '链接', icon: Link },
    { id: 'image' as InputType, label: '图片', icon: Image },
    { id: 'video' as InputType, label: '视频', icon: Video },
  ]

  const handleExtract = async () => {
    if (!content && !url) return
    
    setIsExtracting(true)
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          content,
          url: activeTab === 'link' ? url : undefined
        })
      })
      const data = await res.json()
      setExtractedData(data)
    } catch (error) {
      console.error('提取失败:', error)
    }
    setIsExtracting(false)
  }

  const handleSave = async () => {
    if (!extractedData) return
    
    await addPrompt({
      title: extractedData.title,
      content: extractedData.content,
      description: extractedData.description,
      source: activeTab === 'link' ? url : null,
      sourceType: activeTab,
      category: extractedData.suggestedCategory,
      tags: extractedData.suggestedTags,
      isFavorite: false
    })
    
    fetchCategories()
    handleClose()
  }

  const handleClose = () => {
    setContent('')
    setUrl('')
    setExtractedData(null)
    setActiveTab('text')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">添加提示词</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setExtractedData(null)
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!extractedData ? (
            <div className="space-y-4">
              {activeTab === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    链接地址
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'text' ? '提示词内容' : 
                   activeTab === 'link' ? '页面内容（可选）' :
                   activeTab === 'image' ? '图片描述或OCR结果' : '视频字幕或描述'}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    activeTab === 'text' ? '粘贴或输入提示词内容...' :
                    activeTab === 'link' ? '如果自动抓取失败，可以手动粘贴内容...' :
                    activeTab === 'image' ? '描述图片内容或粘贴OCR结果...' :
                    '粘贴视频字幕或描述内容...'
                  }
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={handleExtract}
                disabled={(!content && !url) || isExtracting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在提取...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    智能提取
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">提取成功！请确认信息</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                <input
                  type="text"
                  value={extractedData.title}
                  onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <input
                  type="text"
                  value={extractedData.suggestedCategory}
                  onChange={(e) => setExtractedData({ ...extractedData, suggestedCategory: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <div className="flex flex-wrap gap-2">
                  {extractedData.suggestedTags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <textarea
                  value={extractedData.content}
                  onChange={(e) => setExtractedData({ ...extractedData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {extractedData && (
          <div className="flex gap-3 p-6 border-t">
            <button
              onClick={() => setExtractedData(null)}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              重新提取
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              保存提示词
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
