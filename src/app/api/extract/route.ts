import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, content, url } = body

  try {
    // 这里可以接入 AI API 进行内容提取
    // 目前先用简单的模拟逻辑
    let extracted = {
      title: '',
      content: '',
      description: '',
      suggestedTags: [] as string[],
      suggestedCategory: '未分类'
    }

    if (type === 'text') {
      // 直接文本，尝试提取标题（第一行）
      const lines = content.trim().split('\n')
      extracted.title = lines[0].slice(0, 50) || '未命名提示词'
      extracted.content = content
      extracted.description = lines.slice(1, 3).join(' ').slice(0, 100)
      
      // 简单的关键词提取
      const keywords = ['角色', '专家', '助手', '翻译', '写作', '代码', '分析', '总结']
      extracted.suggestedTags = keywords.filter(k => content.includes(k))
      if (extracted.suggestedTags.length === 0) {
        extracted.suggestedTags = ['通用']
      }
    } else if (type === 'link') {
      extracted.title = '来自链接的提示词'
      extracted.content = `来源: ${url}\n\n${content || '需要进一步处理链接内容'}`
      extracted.suggestedTags = ['链接']
    } else if (type === 'image') {
      extracted.title = '来自图片的提示词'
      extracted.content = content || '需要 OCR 提取图片中的文字'
      extracted.suggestedTags = ['图片']
    } else if (type === 'video') {
      extracted.title = '来自视频的提示词'
      extracted.content = content || '需要提取视频字幕或描述'
      extracted.suggestedTags = ['视频']
    }

    // 根据内容智能分类
    const contentLower = extracted.content.toLowerCase()
    if (contentLower.includes('代码') || contentLower.includes('program') || contentLower.includes('function')) {
      extracted.suggestedCategory = '编程开发'
    } else if (contentLower.includes('写作') || contentLower.includes('write') || contentLower.includes('文章')) {
      extracted.suggestedCategory = '写作创作'
    } else if (contentLower.includes('翻译') || contentLower.includes('translate')) {
      extracted.suggestedCategory = '翻译'
    } else if (contentLower.includes('分析') || contentLower.includes('analysis')) {
      extracted.suggestedCategory = '数据分析'
    }

    return NextResponse.json(extracted)
  } catch (error) {
    return NextResponse.json(
      { error: '提取失败' },
      { status: 500 }
    )
  }
}
