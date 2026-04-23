// 从 youmind.com 抓取的 Seedance 2.0 提示词数据
const youmindPrompts = [
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/7f63ad253175a9ad1dac53de490efac8/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/e066fab457509bc6809ea212ae5d6a51/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/ce508b28e505ffce07247e2ab036d6f1/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/870c9907c5740c3d98ed2d62328ca83b/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/e011d2666b5ee19d5b9f8b9837b974c2/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/3a7fb0a6d706b9f568479bb720ce1ad4/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/872f606ecb64ea01cc8ed1f2da292679/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/197d97c52ef22d68a18b2ce8f064170a/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/5c1c309582cbdcccc1f43012866d9278/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/a4d7f51e450d9202d77a368d92cd5881/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/02c6dd364eaf1364e0b0458d5fc1a846/thumbnails/thumbnail.jpg"
  },
  {
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
    category: "视频创作",
    imageUrl: "https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/ea91ca4287a00af4f268b6634c56e46e/thumbnails/thumbnail.jpg"
  }
];

// 导出数据供使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { youmindPrompts };
}
