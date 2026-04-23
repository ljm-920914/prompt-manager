"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Video, 
  Image, 
  Layout,
  Download,
  CheckCircle,
  ExternalLink,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { promptApi, categoryApi, type Prompt, type Category } from "@/lib/storage"

interface YouMindPrompt {
  id: string
  title: string
  content: string
  tags: string[]
  imageUrl: string
}

interface YouMindData {
  video: YouMindPrompt[]
  image: YouMindPrompt[]
  ui: YouMindPrompt[]
}

const youmindData: YouMindData = {
  video: [
    {
      id: "sd-001",
      title: "Seedance 2.0：15秒电影感日式浪漫短片",
      content: `一个高度详细的15秒多场景提示，专为Seedance 2.0设计，旨在生成一部电影级的、超现实的日本高中纯爱短片。

场景设置：
- 空教室、温暖的金色阳光、浮动的尘埃
- 摄像机运动：微妙的手持感
- 角色一致性：无变形/漂移
- 微表情：同步的呼吸/嘴唇动作

音效：
- 蝉鸣、笔尖划过纸张的声音
- 低频心跳声、轻柔的钢琴声

故事情节：
聚焦于一个正在书写的女孩和一个偷偷观察她的男孩之间强烈、笨拙而又亲密的紧张情感，最终以一次害羞的对峙收尾。`,
      tags: ["Seedance", "视频创作", "日式", "浪漫", "电影感", "15秒"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/7f63ad253175a9ad1dac53de490efac8/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-002",
      title: "好莱坞高级定制奇幻视频提示",
      content: `一个为Seedance 2.0设计的详细多场景视频生成提示，旨在创作一部好莱坞高级定制奇幻电影。

技术规格：
- 分辨率：8K
- 渲染引擎：Unreal Engine 5
- 时长：15秒

视觉元素：
- 身着液态青花瓷的模特
- 青花瓷碎裂成水墨燕子
- 最终形成3D流体水墨漩涡

三个独特的摄像机/动作序列，展现东方美学与好莱坞特效的融合。`,
      tags: ["Seedance", "视频创作", "好莱坞", "奇幻", "8K", "水墨", "青花瓷"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/e066fab457509bc6809ea212ae5d6a51/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-003",
      title: "现代乡村美学治愈系短片视频提示词",
      content: `一个详细的三镜头提示，用于Seedance 2.0生成一部现代乡村美学风格的治愈系电影短片。

风格设定：
- 电影商业广告风格
- 4K/8K分辨率
- 超微距拍摄
- 自然光、ASMR音效

场景：
一个享有花园景色的现代开放式厨房

人物：
一位穿着亚麻服装的专注创作者

三个场景动作：
1. 采摘新鲜番茄
2. 精准切割食材
3. 安静地享用美食`,
      tags: ["Seedance", "视频创作", "乡村美学", "治愈系", "美食", "ASMR"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/ce508b28e505ffce07247e2ab036d6f1/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-004",
      title: "《鬼灭之刃》真人战斗提示词",
      content: `一个为Seedance 2.0设计的详细、高能量视频提示，用于生成一个15秒的《鬼灭之刃》风格战斗真人改编片段。

战斗设定：
- 水之呼吸 vs. 雷之呼吸
- 好莱坞真人漫画改编风格
- 黑暗武士美学
- 4K分辨率、极致快速剪辑
- 粒子光效

场景：
夜晚迷雾森林

三个镜头描绘：
1. 角色的动作序列
2. 能力提升特效
3. 最终冲突高潮`,
      tags: ["Seedance", "视频创作", "鬼灭之刃", "战斗", "动漫改编", "特效"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/870c9907c5740c3d98ed2d62328ca83b/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-005",
      title: "Seedance 2.0：80岁说唱歌手MV",
      content: `一个详细的15秒提示，用于Seedance 2.0生成一个16:9横屏街头说唱音乐视频（MV），主角是一位80岁的老奶奶。

风格设定：
- 霓虹紫/蓝冷色调
- 爆炸性氛围

人物形象：
- 银发造型
- 皮夹克、嘻哈配饰

场景分解：
- 0-3秒：开场亮相
- 3-7秒：说唱表演
- 7-11秒：舞蹈动作
- 11-15秒：高潮/结尾

拍摄技巧：
低角度、360度旋转、快速剪辑

声音设计：
Trap电子音乐、重型808鼓`,
      tags: ["Seedance", "视频创作", "说唱", "MV", "街头", "反差萌"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/e011d2666b5ee19d5b9f8b9837b974c2/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-006",
      title: "电影级街头赛车场景提示词",
      content: `一份使用Seedance 2.0生成电影级夜间街头赛车场景的详细提示词。

视觉风格：
灵感源自《速度与激情》

技术规格：
- 运镜方式：动态跟拍、漂移镜头
- 镜头时序：0-12秒
- 环境细节：霓虹灯、雨夜路面反光

场景元素：
- 改装跑车
- 城市夜景背景
- 速度线特效
- 引擎轰鸣音效`,
      tags: ["Seedance", "视频创作", "赛车", "街头", "速度与激情", "夜景"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/3a7fb0a6d706b9f568479bb720ce1ad4/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-007",
      title: "机甲崩塌与驾驶员逃生",
      content: `一段充满戏剧性的视频序列，展示了一台巨型人形机甲在战斗中崩塌，驾驶员试图从损毁的结构中绝望逃生。

视觉元素：
- 巨型人形机甲
- 战斗损毁效果
- 火花、烟雾、碎片
- 紧急逃生舱

情感张力：
- 绝望与希望并存
- 时间紧迫感
- 人机情感连接`,
      tags: ["Seedance", "视频创作", "机甲", "科幻", "战斗", "逃生"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/872f606ecb64ea01cc8ed1f2da292679/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-008",
      title: "80年代业余风格的法拉利舞蹈视频",
      content: `一个创意提示词，旨在模拟20世纪80年代低画质的手持拍摄风格。

拍摄设定：
- 设备：VHS摄像机效果
- 画质：低分辨率、颗粒感
- 色彩：复古调色

内容：
在法拉利跑车上表演的爪哇舞
拍摄视角：车内第一人称

氛围：
复古、怀旧、业余纪录片风格`,
      tags: ["Seedance", "视频创作", "80年代", "复古", "法拉利", "舞蹈"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/197d97c52ef22d68a18b2ce8f064170a/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-009",
      title: "宇宙能量球爆炸提示词",
      content: `一个为Seedance 2.0设计的强力第一人称视角视频提示词。

核心场景：
一个宇宙能量球在山谷中失稳并释放能量的过程。

视觉效果：
- 能量球发光、脉动
- 能量波纹扩散
- 冲击波效果
- 粒子特效

拍摄角度：
第一人称视角，增强沉浸感`,
      tags: ["Seedance", "视频创作", "宇宙", "能量", "爆炸", "特效"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/5c1c309582cbdcccc1f43012866d9278/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-010",
      title: "哈利法塔从日落到夜晚的游览之旅",
      content: `一个关于哈利法塔的电影级建筑游览提示词。

镜头设计：
包含15个从日落过渡到夜晚的快速镜头

时间线：
- 日落时分：金色阳光照射
- 黄昏时刻：天空渐变色彩
- 夜晚：城市灯光璀璨

拍摄角度：
- 航拍俯瞰
- 仰拍展现高度
- 细节特写`,
      tags: ["Seedance", "视频创作", "建筑", "迪拜", "哈利法塔", "延时"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/a4d7f51e450d9202d77a368d92cd5881/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-011",
      title: "熔岩地带ATV特技",
      content: `一个高动作感的电影级提示词。

场景设定：
夜晚的火山地带

动作设计：
一名沙漠赛车手驾驶ATV飞跃熔岩河

视觉元素：
- 熔岩流动效果
- 火花四溅
- 烟雾弥漫
- 极限运动张力`,
      tags: ["Seedance", "视频创作", "特技", "ATV", "火山", "极限运动"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/02c6dd364eaf1364e0b0458d5fc1a846/thumbnails/thumbnail.jpg"
    },
    {
      id: "sd-012",
      title: "悬索桥坍塌电影级追逐戏",
      content: `一段高强度的电影级序列。

核心场景：
在坍塌的悬索桥上进行的追逐戏

镜头切换：
- 航拍视角
- 低位跟拍
- 动态切换

特效元素：
- 桥梁断裂
- 碎片坠落
- 紧张追逐氛围`,
      tags: ["Seedance", "视频创作", "追逐", "桥梁", "坍塌", "动作片"],
      imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/ea91ca4287a00af4f268b6634c56e46e/thumbnails/thumbnail.jpg"
    }
  ],
  
  image: [
    {
      id: "gi-001",
      title: "VR头显爆炸视图海报",
      content: `生成一张高科技VR头显爆炸视图，包含详细的组件标注和宣传文案。

类型：产品爆炸视图海报
主题：VR头显
风格：简洁的高科技3D渲染，摄影棚灯光，发光装饰
背景：柔和的紫蓝色渐变

布局：
- 中心：VR头显的垂直堆叠爆炸视图，展示9层不同内部组件
- 左侧标注：Snapdragon XR2 Gen 2芯片、可调节IPD机构、精密头带设计
- 右侧标注：前面板、追踪摄像头、Pancake透镜、高性能电池、面部接口
- 底部：品牌标语和产品介绍`,
      tags: ["GPT Image 2", "AI绘画", "产品海报", "爆炸视图", "VR", "科技"],
      imageUrl: "https://cms-assets.youmind.com/media/1776658772018_lukyfw_HGSUfldbIAEiMWZ-300x450.jpg"
    },
    {
      id: "gi-002",
      title: "手绘城市美食地图",
      content: `生成一张手绘水彩风格的旅游地图，包含编号的当地特色美食、地标建筑及图例。

风格：复古羊皮纸上的水彩墨水手绘插画
标题：成都吃货暴走地图
吉祥物：戴着墨镜并竖起大拇指的卡通红辣椒
边框装饰：绿叶与红辣椒藤蔓

地图元素：
- 地标建筑（6个）：人民公园、文殊院、IFS、339电视塔、宽窄巷子、东郊记忆
- 美食地点（12个）：麻婆豆腐、红油水饺、冷锅串串、三大炮、蛋烘糕、九宫格火锅等
- 图例：美食地点、地标景点、公园绿地、河流湖泊、主要道路
- 中心装饰：坐着吃竹子的大熊猫`,
      tags: ["GPT Image 2", "AI绘画", "手绘", "地图", "美食", "旅游"],
      imageUrl: "https://cms-assets.youmind.com/media/1776662673014_nf0taw_HGRMNDybsAAGG88-300x300.jpg"
    },
    {
      id: "gi-003",
      title: "混合风格的桃太郎讲解Slides",
      content: `创建一个讲解型Slides（ponchi-e diagram），主题为Momotaro（桃太郎）。

风格融合：
- Irasutoya插图的简约温馨美学
- 日本政府Slides的高信息密度特征

内容结构：
- 桃太郎的故事背景
- 主要角色介绍（桃太郎、猴子、狗、雉鸡、鬼）
- 故事情节发展
- 文化寓意解析

视觉特点：
- 柔和的配色方案
- 可爱的角色插画
- 清晰的信息层级
- 高密度的内容布局`,
      tags: ["GPT Image 2", "AI绘画", "Slides", "日式", "教育", "信息图"],
      imageUrl: "https://cms-assets.youmind.com/media/1776699414289_t6mebs_HGQQxukbUAA_qc0-300x200.jpg"
    },
    {
      id: "gi-004",
      title: "动漫武术对决",
      content: `生成一个动态的动漫风格动作场景，展示两个角色在传统道场中伴随元素光环进行战斗。

场景设定：
- 传统木质道场内部
- 上方悬挂"武術会"招牌
- 飞扬的尘土、破碎的木质地板

角色1：
- 黑色高丸子头配红色丝带
- 白色中式上衣配红色流苏
- 红色宽松长裤
- 红色能量斩击环绕

角色2：
- 浅紫色双丸子头
- 深绿色连衣裙配金色刺绣
- 蓝色水流状能量轨迹

特效：发光的彩色粒子、戏剧性低角度光影`,
      tags: ["GPT Image 2", "AI绘画", "动漫", "武术", "战斗", "能量特效"],
      imageUrl: "https://cms-assets.youmind.com/media/1776756799880_c8u8w7_HGUKjjaasAAvVRa-300x240.jpg"
    },
    {
      id: "gi-005",
      title: "动漫角色品牌形象与周边项目",
      content: `生成包含动漫角色的综合品牌设计项目，涵盖产品包装、社交媒体样机和周边商品布局。

主题色彩：柔粉色与白色
图案元素：樱花与粉色爱心

角色设定：
- 棕色短波波头动漫少女
- 粉色眼睛
- 白色连帽衫
- 温柔微笑

品牌物料：
- 页眉横幅：主Logo、副Logo、樱花图案、角色肖像
- 产品包装：心形透明窗口包装盒、糖果包装纸
- 宣传海报：角色肖像、糖果碗、开业信息
- 社交媒体样机：头像、账号名、关注按钮
- 周边商品：T恤、马克杯、徽章、钥匙扣、糖果`,
      tags: ["GPT Image 2", "AI绘画", "品牌设计", "周边", "动漫", "粉色系"],
      imageUrl: "https://cms-assets.youmind.com/media/1776668143480_6f023y_HGURZgJbkAE_Kwh-300x450.jpg"
    },
    {
      id: "gi-006",
      title: "3D石阶演化信息图",
      content: `将平面的演化时间轴转化为逼真的3D石阶信息图，包含精细的生物渲染图和结构化的侧边栏。

主题：人类演化
风格：复古纹理羊皮纸、逼真的纹理石块、照片级真实3D渲染

布局结构：
- 左侧边栏：L0-L7演化阶段（单细胞生命到智人纪元）
- 右上角：获得的功能/失去的功能图例
- 底部中心：演化关键里程碑时间轴
- 中心：蜿蜒的石阶，25个编号台阶展示特定生物

重要节点：
第7阶-水母、第9阶-菊石、第10阶-三叶虫、第24阶-直立行走的人类、第25阶-未来演化概念`,
      tags: ["GPT Image 2", "AI绘画", "3D", "信息图", "演化", "教育"],
      imageUrl: "https://cms-assets.youmind.com/media/1776661968404_8a5flm_HGQc_KOaMAA2vt0-300x533.jpg"
    },
    {
      id: "gi-007",
      title: "4格日式数字广告横幅网格",
      content: `生成一个2x2网格，包含旅游、护肤、美食和在线教育四个不同主题的日式数字广告横幅。

左上-旅游：
- 情侣在白沙滩牵手
- 碧蓝海水和明亮蓝天
- 红色木槿花装饰
- 价格：39,800日元起

右上-护肤：
- 年轻女性特写，水润透亮肌肤
- 粉色渐变背景，动态水花效果
- 初回限定78%OFF
- 金色圆形徽章：毛孔护理、高保湿、弹性光泽

左下-美食：
- 五分熟牛排滋滋作响
- 深色背景，烟雾和余烬光芒
- 特价：4,980日元（原价8,980日元）
- A4 A5等级认证

右下-在线教育：
- 年轻男子书桌前学习
- 明亮室内光线
- 受讲者数10万人突破
- 受讲料20%OFF`,
      tags: ["GPT Image 2", "AI绘画", "广告", "日式", "网格", "营销"],
      imageUrl: "https://cms-assets.youmind.com/media/1776668128332_d2wtbo_HGQDh30bMAARz9E-300x300.jpg"
    }
  ],
  
  ui: [
    {
      id: "ui-001",
      title: "电商直播UI样机",
      content: `生成逼真的社交媒体直播界面，叠加在人物肖像之上，包含可自定义的聊天消息、礼物弹窗和商品购买卡片。

主播信息区：
- 头像、名称、本场点赞数
- 全站排名徽章
- 观众统计：顶部观众头像和观看人数

互动区域：
- 礼物飘屏：小心心x1314、火箭x666
- 聊天消息区：7条模拟弹幕评论
- 系统消息：用户等级和加入提醒

商品卡片：
- 热卖标签x1888
- 产品图片和价格
- 红色抢购按钮
- 浮动爱心动画

底部功能栏：
输入框、表情、更多选项、购物车、礼物、分享`,
      tags: ["GPT Image 2", "UI设计", "直播", "电商", "样机", "界面"],
      imageUrl: "https://cms-assets.youmind.com/media/1776699445498_ga2ry5_HGO7H0DWkAApdKK-300x329.jpg"
    },
    {
      id: "ui-002",
      title: "浅色模式UI设计系统项目",
      content: `生成一套全面的UI设计系统演示，包含色彩方案、排版、组件以及具有未来感、虹彩美学的响应式模型。

主题：光学科学与光折射
整体美学：干净白色背景、浅色模式、未来感、高级感、虹彩渐变点缀

设计系统内容：
- 色彩：5个纯色色块（白、雪色、板岩色、边框色、黑色）
- 棱镜渐变：长水平渐变条配5个十六进制代码
- 排版：大号'Aa'字体，4种字重展示
- 图标：12个极简线条风格图标（2x6网格）
- 按钮：8个按钮（主要、次要、文本、图标各2个状态）
- 导航：桌面端和移动端导航设计
- 组件：卡片、输入框、进度条、标签页、开关、数据可视化
- 网页模型：桌面浏览器展示
- 移动应用：智能手机界面`,
      tags: ["GPT Image 2", "UI设计", "设计系统", "浅色模式", "虹彩", "组件库"],
      imageUrl: "https://cms-assets.youmind.com/media/1776662580618_05iol2_HGRFgOra8AA9klJ-300x450.jpg"
    },
    {
      id: "ui-003",
      title: "深色模式病毒式营销案例研究落地页",
      content: `一个全面的深色主题UI原型，用于营销案例研究，包含数据可视化、时间轴和3D插图。

主题：深色模式、现代科技感、霓虹紫与蓝色发光点缀、玻璃拟态风格

页面结构：
1. Hero区：案例研究标题、核心数据（1000万+浏览量、18.7%互动率、3200+转化、72小时执行周期）
2. 策略拆解：3步垂直时间轴（策略制定、内容制作、分发放大）
3. 效果评估：左侧统计卡片、右侧图表（7天趋势折线图、平台分布横向柱状图）
4. 成功关键：3张卡片横向排列（情感钩子、内容结构、分发策略）
5. 社会证明：品牌Logo墙（SHEIN、SHOPLINE等）+客户评价
6. CTA区：输入框+行动按钮+3D火箭插图`,
      tags: ["GPT Image 2", "UI设计", "落地页", "深色模式", "营销", "数据可视化"],
      imageUrl: "https://cms-assets.youmind.com/media/1776697094626_4w646d_HGE06OebMAAQxNG-300x632.jpg"
    }
  ]
}

export default function YouMindPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const cats = await categoryApi.getAll()
    setCategories(cats)
  }

  const getOrCreateCategory = async (name: string, color: string) => {
    let category = categories.find(c => c.name === name)
    if (!category) {
      const newCat = await categoryApi.create({
        name,
        description: `${name}提示词`,
        color,
        order: categories.length
      })
      if (newCat) {
        category = newCat
        setCategories([...categories, newCat])
      }
    }
    return category
  }

  const importPrompt = async (prompt: YouMindPrompt, categoryName: string, categoryColor: string) => {
    const category = await getOrCreateCategory(categoryName, categoryColor)
    
    const created = await promptApi.create({
      title: prompt.title,
      content: prompt.content,
      sourceType: 'TEXT',
      sourceUrl: `https://youmind.com/${categoryName === '视频创作' ? 'seedance-2-0-prompts' : 'gpt-image-2-prompts'}`,
      categoryId: category?.id,
      tags: prompt.tags,
      isPublic: false,
    })

    return created
  }

  const importAll = async () => {
    setIsImporting(true)
    setImportedCount(0)
    let count = 0

    // Import video prompts
    for (const prompt of youmindData.video) {
      const exists = await checkExists(prompt.title)
      if (!exists) {
        await importPrompt(prompt, '视频创作', '#ef4444')
        count++
        setImportedCount(count)
      }
    }

    // Import image prompts
    for (const prompt of youmindData.image) {
      const exists = await checkExists(prompt.title)
      if (!exists) {
        await importPrompt(prompt, 'AI绘画', '#8b5cf6')
        count++
        setImportedCount(count)
      }
    }

    // Import UI prompts
    for (const prompt of youmindData.ui) {
      const exists = await checkExists(prompt.title)
      if (!exists) {
        await importPrompt(prompt, 'UI设计', '#3b82f6')
        count++
        setImportedCount(count)
      }
    }

    setIsImporting(false)
    toast.success(`成功导入 ${count} 个提示词！`)
  }

  const checkExists = async (title: string) => {
    const allPrompts = promptApi.getAll()
    return allPrompts.some(p => p.title === title)
  }

  const totalCount = youmindData.video.length + youmindData.image.length + youmindData.ui.length

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">YouMind 精选提示词</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">导入 YouMind 提示词</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            从 youmind.com 抓取的精选提示词，包含 Seedance 2.0 视频提示词和 GPT Image 2 图像提示词
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 text-center"
          >
            <Video className="h-8 w-8 mx-auto mb-3 text-red-500" />
            <div className="text-3xl font-bold">{youmindData.video.length}</div>
            <div className="text-sm text-muted-foreground">视频创作</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 text-center"
          >
            <Image className="h-8 w-8 mx-auto mb-3 text-purple-500" />
            <div className="text-3xl font-bold">{youmindData.image.length}</div>
            <div className="text-sm text-muted-foreground">AI绘画</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6 text-center"
          >
            <Layout className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <div className="text-3xl font-bold">{youmindData.ui.length}</div>
            <div className="text-sm text-muted-foreground">UI设计</div>
          </motion.div>
        </div>

        {/* Import Button */}
        <div className="text-center mb-12">
          <Button 
            size="lg" 
            onClick={importAll}
            disabled={isImporting}
            className="px-8"
          >
            {isImporting ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                导入中... ({importedCount}/{totalCount})
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                一键导入全部 ({totalCount}个)
              </>
            )}
          </Button>
          
          <a 
            href="https://youmind.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-4 text-sm text-muted-foreground hover:text-primary inline-flex items-center"
          >
            访问 YouMind
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>

        {/* Prompts Grid */}
        <div className="space-y-8">
          {/* Video Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Video className="h-6 w-6 text-red-500" />
              视频创作 ({youmindData.video.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youmindData.video.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} category="视频创作" />
              ))}
            </div>
          </section>

          {/* Image Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Image className="h-6 w-6 text-purple-500" />
              AI绘画 ({youmindData.image.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youmindData.image.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} category="AI绘画" />
              ))}
            </div>
          </section>

          {/* UI Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Layout className="h-6 w-6 text-blue-500" />
              UI设计 ({youmindData.ui.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youmindData.ui.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} category="UI设计" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function PromptCard({ prompt, category }: { prompt: YouMindPrompt; category: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
    >
      <div className="aspect-video bg-muted relative">
        <img 
          src={prompt.imageUrl} 
          alt={prompt.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-2">{category}</div>
        <h3 className="font-semibold mb-2 line-clamp-2">{prompt.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {prompt.content.substring(0, 100)}...
        </p>
        <div className="flex flex-wrap gap-1">
          {prompt.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
