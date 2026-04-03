'use client'

import { useState } from 'react'
import { Copy, Check, Star, Trash2, Edit2, ExternalLink } from 'lucide-react'
import { Prompt, usePromptStore } from '@/store/promptStore'

interface PromptCardProps {
  prompt: Prompt
  onEdit: (prompt: Prompt) => void
}

export default function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleFavorite = usePromptStore((state) => state.toggleFavorite)
  const deletePrompt = usePromptStore((state) => state.deletePrompt)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这个提示词吗？')) {
      await deletePrompt(prompt.id)
    }
  }

  const getSourceIcon = () => {
    switch (prompt.sourceType) {
      case 'link': return '🔗'
      case 'image': return '🖼️'
      case 'video': return '🎬'
      default: return '📝'
    }
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getSourceIcon()}</span>
              <h3 className="font-semibold text-gray-900 truncate">{prompt.title}</h3>
            </div>
            {prompt.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{prompt.description}</p>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(prompt.id)}
            className={`p-2 rounded-lg transition-colors ${
              prompt.isFavorite
                ? 'text-yellow-500 bg-yellow-50'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
          >
            <Star className={`w-5 h-5 ${prompt.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {prompt.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Category */}
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
            {prompt.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <div
          className={`bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap ${
            isExpanded ? '' : 'line-clamp-4'
          }`}
        >
          {prompt.content}
        </div>
        {prompt.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? '收起' : '展开更多'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              copied
                ? 'text-green-700 bg-green-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制
              </>
            )}
          </button>
          
          <button
            onClick={() => onEdit(prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </button>
          
          {prompt.source && (
            <a
              href={prompt.source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              来源
            </a>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
