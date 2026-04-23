(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,56563,e=>{"use strict";let t="prompts",a="categories",r="meta",s=[{id:"cat-1",name:"AI绘画",description:"Midjourney/Stable Diffusion 提示词",color:"#8b5cf6",order:0},{id:"cat-2",name:"ChatGPT",description:"ChatGPT/Claude 对话提示词",color:"#3b82f6",order:1},{id:"cat-3",name:"文案写作",description:"营销文案、文章生成",color:"#22c55e",order:2},{id:"cat-4",name:"代码开发",description:"编程辅助提示词",color:"#f59e0b",order:3},{id:"cat-5",name:"视频创作",description:"视频脚本、分镜提示词",color:"#ef4444",order:4}],i=null;function n(){return i?Promise.resolve(i):new Promise((e,s)=>{let n=indexedDB.open("prompt-manager-db",1);n.onupgradeneeded=e=>{let s=e.target.result;if(!s.objectStoreNames.contains(t)){let e=s.createObjectStore(t,{keyPath:"id"});e.createIndex("categoryId","categoryId",{unique:!1}),e.createIndex("createdAt","createdAt",{unique:!1})}s.objectStoreNames.contains(a)||s.createObjectStore(a,{keyPath:"id"}),s.objectStoreNames.contains(r)||s.createObjectStore(r,{keyPath:"key"})},n.onsuccess=t=>{e(i=t.target.result)},n.onerror=()=>s(n.error)})}function o(e){return n().then(t=>new Promise((a,r)=>{let s=t.transaction(e,"readonly").objectStore(e).getAll();s.onsuccess=()=>a(s.result),s.onerror=()=>r(s.error)}))}function c(e,t){return n().then(a=>new Promise((r,s)=>{let i=a.transaction(e,"readwrite");i.objectStore(e).put(t),i.oncomplete=()=>r(),i.onerror=()=>s(i.error)}))}function l(e,t){return n().then(a=>new Promise((r,s)=>{let i=a.transaction(e,"readwrite");i.objectStore(e).delete(t),i.oncomplete=()=>r(),i.onerror=()=>s(i.error)}))}function d(e){return n().then(t=>new Promise((a,r)=>{let s=t.transaction(e,"readwrite");s.objectStore(e).clear(),s.oncomplete=()=>a(),s.onerror=()=>r(s.error)}))}function m(e,t){return n().then(a=>new Promise((r,s)=>{let i=a.transaction(e,"readonly").objectStore(e).get(t);i.onsuccess=()=>r(i.result),i.onerror=()=>s(i.error)}))}function u(){return Date.now().toString(36)+Math.random().toString(36).substring(2)}function g(){return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)}async function p(){try{let e=await o(r),t={};for(let a of e)t[a.key]=a.value;return t}catch{return{}}}async function h(e,t){await c(r,{key:e,value:t})}async function f(){try{let e=await o(t),r=await o(a);localStorage.setItem("prompt-manager-async-v1",JSON.stringify({prompts:e,categories:r}))}catch(e){console.warn("同步本地缓存失败:",e)}}async function y(){try{if(await n(),!localStorage.getItem("prompt-manager-migrated-v2")){let e=localStorage.getItem("prompt-manager-data-v2");if(e)try{let r=JSON.parse(e);if(r.prompts?.length||r.categories?.length){for(let e of(console.log(`[迁移] 从旧存储导入 ${r.prompts?.length||0} 条提示词`),r.prompts||[]))await c(t,e);for(let e of r.categories||[])await c(a,e)}localStorage.setItem("prompt-manager-migrated-v2","1")}catch(e){console.warn("[迁移] 旧数据迁移失败:",e)}}let e=await o(t),r=await o(a);if(0===r.length){for(let e of s)await c(a,e);return await f(),{prompts:e.sort((e,t)=>new Date(t.createdAt).getTime()-new Date(e.createdAt).getTime()),categories:s}}return await f(),{prompts:e.sort((e,t)=>new Date(t.createdAt).getTime()-new Date(e.createdAt).getTime()),categories:r}}catch(e){return console.error("加载数据失败:",e),{prompts:[],categories:s}}}let b="ljm-920914",w="prompt-manager",x=".prompt-manager/backup.json";async function j(e){return new Promise(t=>{let a=document.createElement("video"),r=document.createElement("canvas"),s=r.getContext("2d");if(!s)return void t(null);a.style.cssText="position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;width:1px;height:1px",document.body.appendChild(a);let i=URL.createObjectURL(e),n=!1,o=e=>{if(!n){n=!0,clearTimeout(c);try{URL.revokeObjectURL(i)}catch{}try{a.pause()}catch{}try{a.remove()}catch{}try{e()}catch{}}},c=setTimeout(()=>o(()=>t(null)),2e4),l=()=>{s.fillStyle="#1a1a1a",s.fillRect(0,0,r.width,r.height),s.drawImage(a,0,0,r.width,r.height),t(r.toDataURL("image/jpeg",.7))};a.addEventListener("loadedmetadata",()=>{r.width=Math.floor(Math.min(a.videoWidth||480,480)),r.height=Math.floor(r.width/(a.videoWidth||16)*(a.videoHeight||9)),isFinite(a.duration)&&a.duration>0?a.currentTime=Math.min(.1*a.duration,5):o(()=>l())},{once:!0}),a.addEventListener("seeked",()=>o(()=>l()),{once:!0}),a.addEventListener("error",()=>o(()=>t(null)),{once:!0}),a.muted=!0,a.playsInline=!0,a.preload="metadata",a.src=i,a.load()})}e.s(["aiExtract",0,{fromImage:async(e,t)=>(await new Promise(e=>setTimeout(e,1500)),{title:`图片提取: ${e}`,content:`// 从图片提取的提示词

positive prompt:
- subject, style, lighting, colors

negative prompt:
- blurry, low quality`,tags:["AI绘画","图片提取"],imageData:t}),fromVideo:async e=>{let t,a=null;try{a=await j(e)}catch{}if(!a)throw Error(`视频 "${e.name}" 无法生成缩略图`);if(e.size<=0x1400000)try{t=await new Promise(t=>{let a=new FileReader;a.onload=e=>t(e.target?.result),a.onerror=()=>t(void 0),a.readAsDataURL(e)})}catch{t=void 0}else console.warn(`视频 ${(e.size/1024/1024).toFixed(1)}MB > 20MB，仅保存缩略图`);return await new Promise(e=>setTimeout(e,800)),{title:`视频提取: ${e.name}`,content:`// 从视频提取的提示词

场景、风格、色调、氛围分析结果`,tags:["视频分析"],thumbnail:a??void 0,videoData:t}},fromVideoUrl:async e=>{await new Promise(e=>setTimeout(e,1e3));let t=e.split("/").pop()||"video";return{title:`视频链接: ${t}`,content:`// 从视频链接提取的提示词
// 来源: ${e}

视频内容分析:
- 场景: 动态场景
- 风格: 待分析
- 色调: 待分析
- 氛围: 待分析

生成提示词:
[基于视频内容生成的提示词将显示在这里]

注意: 实际使用时需要后端服务下载并分析视频内容。`,tags:["视频链接","视频分析","待处理"]}},fromLink:async e=>{await new Promise(e=>setTimeout(e,1e3));try{let t=new URL(e).hostname;return{title:`从 ${t} 提取`,content:`// 来源: ${e}

提取内容...`,tags:["网页提取"]}}catch{return{title:"链接提取失败",content:"无法解析该链接",tags:["提取失败"]}}},fromText:async e=>{await new Promise(e=>setTimeout(e,500));let t=[/masterpiece|best quality|highly detailed/i,/prompt|提示词|咒语/i,/positive|negative/i,/style:|artist:|by\s+\w+/i,/\d+\s*(k|px|pixel)/i].some(t=>t.test(e))||e.length>100,a="识别的提示词";if(e.includes("\n")){let t=e.split("\n")[0].trim();t.length>5&&t.length<50&&(a=t)}let r=[];return/midjourney|mj|niji/i.test(e)&&r.push("Midjourney"),/stable.diffusion|sd|sdxl/i.test(e)&&r.push("Stable Diffusion"),/dalle|dall.e/i.test(e)&&r.push("DALL-E"),/chatgpt|gpt|claude/i.test(e)&&r.push("ChatGPT"),/portrait|character|person/i.test(e)&&r.push("人物"),/landscape|scenery|nature/i.test(e)&&r.push("风景"),/anime|manga|cartoon/i.test(e)&&r.push("动漫"),/realistic|photo|photography/i.test(e)&&r.push("写实"),0===r.length&&r.push(t?"提示词":"文本"),{title:a,content:e,tags:r}}},"backupApi",0,{export:async()=>JSON.stringify({prompts:await o(t),categories:await o(a),exportedAt:new Date().toISOString()},null,2),import:async e=>{try{let r=JSON.parse(e);if(!r.prompts||!r.categories)return!1;for(let e of(await d(t),await d(a),r.prompts))await c(t,e);for(let e of r.categories)await c(a,e);return await f(),!0}catch{return!1}},clear:async()=>{await d(t),await d(a),localStorage.removeItem("prompt-manager-async-v1")}},"categoryApi",0,{getAll:async()=>{try{let e=await o(a);if(0===e.length){for(let e of s)await c(a,e);return s}return e.sort((e,t)=>e.order-t.order)}catch{return s}},getById:e=>m(a,e),create:async e=>{try{let t={...e,id:u()};return await c(a,t),t}catch{return null}},update:async(e,t)=>{try{let r=await m(a,e);if(!r)return;let s={...r,...t};return await c(a,s),s}catch{return}},delete:async e=>{try{for(let a of(await o(t)))a.categoryId===e&&(a.categoryId=void 0,await c(t,a));return await l(a,e),!0}catch{return!1}}},"loadAllData",0,y,"promptApi",0,{getAll:e=>{let t=localStorage.getItem("prompt-manager-async-v1");if(!t)return[];let a=JSON.parse(t).prompts||[];if(e?.categoryId&&(a=a.filter(t=>t.categoryId===e.categoryId)),e?.search){let t=e.search.toLowerCase();a=a.filter(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t)||e.description?.toLowerCase().includes(t))}return e?.tag&&(a=a.filter(t=>t.tags.includes(e.tag))),a.sort((e,t)=>new Date(t.createdAt).getTime()-new Date(e.createdAt).getTime())},getById:e=>m(t,e),getByShareToken:async e=>(await o(t)).find(t=>t.shareToken===e&&t.isPublic),create:async e=>{try{let a={...e,id:u(),shareToken:e.isPublic?g():void 0,viewCount:0,useCount:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return await c(t,a),await f(),a}catch(e){return console.error("创建提示词失败:",e),null}},update:async(e,a)=>{try{let r=await m(t,e);if(!r)return;let s=r.shareToken;void 0!==a.isPublic&&(a.isPublic&&!r.isPublic?s=g():!a.isPublic&&r.isPublic&&(s=void 0));let i={...r,...a,shareToken:s,updatedAt:new Date().toISOString()};return await c(t,i),await f(),i}catch(e){console.error("更新提示词失败:",e);return}},delete:async e=>{try{return await l(t,e),await f(),!0}catch(e){return console.error("删除提示词失败:",e),!1}},incrementView:async e=>{let a=await m(t,e);a&&(a.viewCount++,await c(t,a))},incrementUse:async e=>{let a=await m(t,e);a&&(a.useCount++,await c(t,a))}},"syncApi",0,{getStatus:async()=>{let e=await p();return{connected:!!e.syncToken,lastSync:e.lastSync,gistUrl:e.syncUrl}},connect:async e=>{try{let t=await fetch(`https://api.github.com/repos/${b}/${w}`,{headers:{Authorization:`Bearer ${e}`,Accept:"application/vnd.github.v3+json"}});if(!t.ok){if(404===t.status)return{success:!1,error:`仓库 ${b}/${w} 不存在`};if(401===t.status)return{success:!1,error:"Token 无效或已过期，请重新生成"};if(403===t.status)return{success:!1,error:"Token 权限不足，请确认有 repo 权限"};let e=await t.json().catch(()=>({}));return{success:!1,error:`连接失败(${t.status}): ${e.message||"未知错误"}`}}return await h("syncToken",e),await h("syncUrl",`https://github.com/${b}/${w}/blob/main/${x}`),{success:!0}}catch(e){return{success:!1,error:"网络错误，浏览器无法访问 GitHub，请检查网络"}}},disconnect:async()=>{await h("syncToken",void 0),await h("syncUrl",void 0),await h("lastSync",void 0)},push:async()=>{let e=await p(),r=e.syncToken;if(!r)return{success:!1,error:"未连接 GitHub，请先连接"};try{let s,i=await o(t),n=await o(a),c=JSON.stringify({prompts:i,categories:n,exportedAt:new Date().toISOString(),version:"1.0"},null,2),l={Authorization:`Bearer ${r}`,Accept:"application/vnd.github.v3+json","Content-Type":"application/json"},d=`https://api.github.com/repos/${b}/${w}/contents/${x}`;try{let e=await fetch(d,{headers:l});e.ok&&(s=(await e.json()).sha)}catch{}let m={message:"Prompt Manager: 备份数据",content:btoa(unescape(encodeURIComponent(c)))};s&&(m.sha=s);let u=await fetch(d,{method:"PUT",headers:l,body:JSON.stringify(m)});if(!u.ok){let e=await u.json().catch(()=>({}));if(401===u.status)return{success:!1,error:"Token 已失效，请重新连接"};if(403===u.status)return{success:!1,error:"权限不足，请确认 Token 有 repo 权限"};if(404===u.status)return{success:!1,error:"仓库不存在，请确认用户名和仓库名正确"};return{success:!1,error:`推送失败(${u.status}): ${e.message||u.statusText}`}}return await h("lastSync",new Date().toISOString()),{success:!0,url:e.syncUrl}}catch(e){return{success:!1,error:`网络错误: ${e instanceof Error?e.message:String(e)}`}}},pull:async()=>{let e=(await p()).syncToken;if(!e)return{success:!1,error:"未连接 GitHub"};try{let r=`https://api.github.com/repos/${b}/${w}/contents/${x}`,s=await fetch(r,{headers:{Authorization:`Bearer ${e}`,Accept:"application/vnd.github.v3+json"}});if(!s.ok){if(404===s.status)return{success:!1,error:"仓库中没有找到备份文件，请先推送一次"};return{success:!1,error:`拉取失败(${s.status})，Token 可能已失效`}}let i=await s.json(),n=decodeURIComponent(escape(atob(i.content))),o=JSON.parse(n);if(!o.prompts||!o.categories)return{success:!1,error:"备份文件格式错误"};for(let e of o.categories)await c(a,e);for(let e of o.prompts)await c(t,e);return await h("lastSync",new Date().toISOString()),await f(),{success:!0,count:o.prompts.length}}catch(e){return{success:!1,error:`网络错误: ${e instanceof Error?e.message:String(e)}`}}}}])},64267,e=>{"use strict";var t=e.i(43476),a=e.i(71645),r=e.i(46932),s=e.i(67881),i=e.i(78716),n=e.i(73708);let o=(0,e.i(75254).default)("panels-top-left",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M9 21V9",key:"1oto5p"}]]);var c=e.i(40160),l=e.i(69638),d=e.i(78917),m=e.i(83086),u=e.i(46696),g=e.i(56563);let p={video:[{id:"sd-001",title:"Seedance 2.0：15秒电影感日式浪漫短片",content:`一个高度详细的15秒多场景提示，专为Seedance 2.0设计，旨在生成一部电影级的、超现实的日本高中纯爱短片。

场景设置：
- 空教室、温暖的金色阳光、浮动的尘埃
- 摄像机运动：微妙的手持感
- 角色一致性：无变形/漂移
- 微表情：同步的呼吸/嘴唇动作

音效：
- 蝉鸣、笔尖划过纸张的声音
- 低频心跳声、轻柔的钢琴声

故事情节：
聚焦于一个正在书写的女孩和一个偷偷观察她的男孩之间强烈、笨拙而又亲密的紧张情感，最终以一次害羞的对峙收尾。`,tags:["Seedance","视频创作","日式","浪漫","电影感","15秒"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/7f63ad253175a9ad1dac53de490efac8/thumbnails/thumbnail.jpg"},{id:"sd-002",title:"好莱坞高级定制奇幻视频提示",content:`一个为Seedance 2.0设计的详细多场景视频生成提示，旨在创作一部好莱坞高级定制奇幻电影。

技术规格：
- 分辨率：8K
- 渲染引擎：Unreal Engine 5
- 时长：15秒

视觉元素：
- 身着液态青花瓷的模特
- 青花瓷碎裂成水墨燕子
- 最终形成3D流体水墨漩涡

三个独特的摄像机/动作序列，展现东方美学与好莱坞特效的融合。`,tags:["Seedance","视频创作","好莱坞","奇幻","8K","水墨","青花瓷"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/e066fab457509bc6809ea212ae5d6a51/thumbnails/thumbnail.jpg"},{id:"sd-003",title:"现代乡村美学治愈系短片视频提示词",content:`一个详细的三镜头提示，用于Seedance 2.0生成一部现代乡村美学风格的治愈系电影短片。

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
3. 安静地享用美食`,tags:["Seedance","视频创作","乡村美学","治愈系","美食","ASMR"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/ce508b28e505ffce07247e2ab036d6f1/thumbnails/thumbnail.jpg"},{id:"sd-004",title:"《鬼灭之刃》真人战斗提示词",content:`一个为Seedance 2.0设计的详细、高能量视频提示，用于生成一个15秒的《鬼灭之刃》风格战斗真人改编片段。

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
3. 最终冲突高潮`,tags:["Seedance","视频创作","鬼灭之刃","战斗","动漫改编","特效"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/870c9907c5740c3d98ed2d62328ca83b/thumbnails/thumbnail.jpg"},{id:"sd-005",title:"Seedance 2.0：80岁说唱歌手MV",content:`一个详细的15秒提示，用于Seedance 2.0生成一个16:9横屏街头说唱音乐视频（MV），主角是一位80岁的老奶奶。

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
Trap电子音乐、重型808鼓`,tags:["Seedance","视频创作","说唱","MV","街头","反差萌"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/e011d2666b5ee19d5b9f8b9837b974c2/thumbnails/thumbnail.jpg"},{id:"sd-006",title:"电影级街头赛车场景提示词",content:`一份使用Seedance 2.0生成电影级夜间街头赛车场景的详细提示词。

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
- 引擎轰鸣音效`,tags:["Seedance","视频创作","赛车","街头","速度与激情","夜景"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/3a7fb0a6d706b9f568479bb720ce1ad4/thumbnails/thumbnail.jpg"},{id:"sd-007",title:"机甲崩塌与驾驶员逃生",content:`一段充满戏剧性的视频序列，展示了一台巨型人形机甲在战斗中崩塌，驾驶员试图从损毁的结构中绝望逃生。

视觉元素：
- 巨型人形机甲
- 战斗损毁效果
- 火花、烟雾、碎片
- 紧急逃生舱

情感张力：
- 绝望与希望并存
- 时间紧迫感
- 人机情感连接`,tags:["Seedance","视频创作","机甲","科幻","战斗","逃生"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/872f606ecb64ea01cc8ed1f2da292679/thumbnails/thumbnail.jpg"},{id:"sd-008",title:"80年代业余风格的法拉利舞蹈视频",content:`一个创意提示词，旨在模拟20世纪80年代低画质的手持拍摄风格。

拍摄设定：
- 设备：VHS摄像机效果
- 画质：低分辨率、颗粒感
- 色彩：复古调色

内容：
在法拉利跑车上表演的爪哇舞
拍摄视角：车内第一人称

氛围：
复古、怀旧、业余纪录片风格`,tags:["Seedance","视频创作","80年代","复古","法拉利","舞蹈"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/197d97c52ef22d68a18b2ce8f064170a/thumbnails/thumbnail.jpg"},{id:"sd-009",title:"宇宙能量球爆炸提示词",content:`一个为Seedance 2.0设计的强力第一人称视角视频提示词。

核心场景：
一个宇宙能量球在山谷中失稳并释放能量的过程。

视觉效果：
- 能量球发光、脉动
- 能量波纹扩散
- 冲击波效果
- 粒子特效

拍摄角度：
第一人称视角，增强沉浸感`,tags:["Seedance","视频创作","宇宙","能量","爆炸","特效"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/5c1c309582cbdcccc1f43012866d9278/thumbnails/thumbnail.jpg"},{id:"sd-010",title:"哈利法塔从日落到夜晚的游览之旅",content:`一个关于哈利法塔的电影级建筑游览提示词。

镜头设计：
包含15个从日落过渡到夜晚的快速镜头

时间线：
- 日落时分：金色阳光照射
- 黄昏时刻：天空渐变色彩
- 夜晚：城市灯光璀璨

拍摄角度：
- 航拍俯瞰
- 仰拍展现高度
- 细节特写`,tags:["Seedance","视频创作","建筑","迪拜","哈利法塔","延时"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/a4d7f51e450d9202d77a368d92cd5881/thumbnails/thumbnail.jpg"},{id:"sd-011",title:"熔岩地带ATV特技",content:`一个高动作感的电影级提示词。

场景设定：
夜晚的火山地带

动作设计：
一名沙漠赛车手驾驶ATV飞跃熔岩河

视觉元素：
- 熔岩流动效果
- 火花四溅
- 烟雾弥漫
- 极限运动张力`,tags:["Seedance","视频创作","特技","ATV","火山","极限运动"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/02c6dd364eaf1364e0b0458d5fc1a846/thumbnails/thumbnail.jpg"},{id:"sd-012",title:"悬索桥坍塌电影级追逐戏",content:`一段高强度的电影级序列。

核心场景：
在坍塌的悬索桥上进行的追逐戏

镜头切换：
- 航拍视角
- 低位跟拍
- 动态切换

特效元素：
- 桥梁断裂
- 碎片坠落
- 紧张追逐氛围`,tags:["Seedance","视频创作","追逐","桥梁","坍塌","动作片"],imageUrl:"https://customer-qs6wnyfuv0gcybzj.cloudflarestream.com/ea91ca4287a00af4f268b6634c56e46e/thumbnails/thumbnail.jpg"}],image:[{id:"gi-001",title:"VR头显爆炸视图海报",content:`生成一张高科技VR头显爆炸视图，包含详细的组件标注和宣传文案。

类型：产品爆炸视图海报
主题：VR头显
风格：简洁的高科技3D渲染，摄影棚灯光，发光装饰
背景：柔和的紫蓝色渐变

布局：
- 中心：VR头显的垂直堆叠爆炸视图，展示9层不同内部组件
- 左侧标注：Snapdragon XR2 Gen 2芯片、可调节IPD机构、精密头带设计
- 右侧标注：前面板、追踪摄像头、Pancake透镜、高性能电池、面部接口
- 底部：品牌标语和产品介绍`,tags:["GPT Image 2","AI绘画","产品海报","爆炸视图","VR","科技"],imageUrl:"https://cms-assets.youmind.com/media/1776658772018_lukyfw_HGSUfldbIAEiMWZ-300x450.jpg"},{id:"gi-002",title:"手绘城市美食地图",content:`生成一张手绘水彩风格的旅游地图，包含编号的当地特色美食、地标建筑及图例。

风格：复古羊皮纸上的水彩墨水手绘插画
标题：成都吃货暴走地图
吉祥物：戴着墨镜并竖起大拇指的卡通红辣椒
边框装饰：绿叶与红辣椒藤蔓

地图元素：
- 地标建筑（6个）：人民公园、文殊院、IFS、339电视塔、宽窄巷子、东郊记忆
- 美食地点（12个）：麻婆豆腐、红油水饺、冷锅串串、三大炮、蛋烘糕、九宫格火锅等
- 图例：美食地点、地标景点、公园绿地、河流湖泊、主要道路
- 中心装饰：坐着吃竹子的大熊猫`,tags:["GPT Image 2","AI绘画","手绘","地图","美食","旅游"],imageUrl:"https://cms-assets.youmind.com/media/1776662673014_nf0taw_HGRMNDybsAAGG88-300x300.jpg"},{id:"gi-003",title:"混合风格的桃太郎讲解Slides",content:`创建一个讲解型Slides（ponchi-e diagram），主题为Momotaro（桃太郎）。

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
- 高密度的内容布局`,tags:["GPT Image 2","AI绘画","Slides","日式","教育","信息图"],imageUrl:"https://cms-assets.youmind.com/media/1776699414289_t6mebs_HGQQxukbUAA_qc0-300x200.jpg"},{id:"gi-004",title:"动漫武术对决",content:`生成一个动态的动漫风格动作场景，展示两个角色在传统道场中伴随元素光环进行战斗。

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

特效：发光的彩色粒子、戏剧性低角度光影`,tags:["GPT Image 2","AI绘画","动漫","武术","战斗","能量特效"],imageUrl:"https://cms-assets.youmind.com/media/1776756799880_c8u8w7_HGUKjjaasAAvVRa-300x240.jpg"},{id:"gi-005",title:"动漫角色品牌形象与周边项目",content:`生成包含动漫角色的综合品牌设计项目，涵盖产品包装、社交媒体样机和周边商品布局。

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
- 周边商品：T恤、马克杯、徽章、钥匙扣、糖果`,tags:["GPT Image 2","AI绘画","品牌设计","周边","动漫","粉色系"],imageUrl:"https://cms-assets.youmind.com/media/1776668143480_6f023y_HGURZgJbkAE_Kwh-300x450.jpg"},{id:"gi-006",title:"3D石阶演化信息图",content:`将平面的演化时间轴转化为逼真的3D石阶信息图，包含精细的生物渲染图和结构化的侧边栏。

主题：人类演化
风格：复古纹理羊皮纸、逼真的纹理石块、照片级真实3D渲染

布局结构：
- 左侧边栏：L0-L7演化阶段（单细胞生命到智人纪元）
- 右上角：获得的功能/失去的功能图例
- 底部中心：演化关键里程碑时间轴
- 中心：蜿蜒的石阶，25个编号台阶展示特定生物

重要节点：
第7阶-水母、第9阶-菊石、第10阶-三叶虫、第24阶-直立行走的人类、第25阶-未来演化概念`,tags:["GPT Image 2","AI绘画","3D","信息图","演化","教育"],imageUrl:"https://cms-assets.youmind.com/media/1776661968404_8a5flm_HGQc_KOaMAA2vt0-300x533.jpg"},{id:"gi-007",title:"4格日式数字广告横幅网格",content:`生成一个2x2网格，包含旅游、护肤、美食和在线教育四个不同主题的日式数字广告横幅。

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
- 受讲料20%OFF`,tags:["GPT Image 2","AI绘画","广告","日式","网格","营销"],imageUrl:"https://cms-assets.youmind.com/media/1776668128332_d2wtbo_HGQDh30bMAARz9E-300x300.jpg"}],ui:[{id:"ui-001",title:"电商直播UI样机",content:`生成逼真的社交媒体直播界面，叠加在人物肖像之上，包含可自定义的聊天消息、礼物弹窗和商品购买卡片。

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
输入框、表情、更多选项、购物车、礼物、分享`,tags:["GPT Image 2","UI设计","直播","电商","样机","界面"],imageUrl:"https://cms-assets.youmind.com/media/1776699445498_ga2ry5_HGO7H0DWkAApdKK-300x329.jpg"},{id:"ui-002",title:"浅色模式UI设计系统项目",content:`生成一套全面的UI设计系统演示，包含色彩方案、排版、组件以及具有未来感、虹彩美学的响应式模型。

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
- 移动应用：智能手机界面`,tags:["GPT Image 2","UI设计","设计系统","浅色模式","虹彩","组件库"],imageUrl:"https://cms-assets.youmind.com/media/1776662580618_05iol2_HGRFgOra8AA9klJ-300x450.jpg"},{id:"ui-003",title:"深色模式病毒式营销案例研究落地页",content:`一个全面的深色主题UI原型，用于营销案例研究，包含数据可视化、时间轴和3D插图。

主题：深色模式、现代科技感、霓虹紫与蓝色发光点缀、玻璃拟态风格

页面结构：
1. Hero区：案例研究标题、核心数据（1000万+浏览量、18.7%互动率、3200+转化、72小时执行周期）
2. 策略拆解：3步垂直时间轴（策略制定、内容制作、分发放大）
3. 效果评估：左侧统计卡片、右侧图表（7天趋势折线图、平台分布横向柱状图）
4. 成功关键：3张卡片横向排列（情感钩子、内容结构、分发策略）
5. 社会证明：品牌Logo墙（SHEIN、SHOPLINE等）+客户评价
6. CTA区：输入框+行动按钮+3D火箭插图`,tags:["GPT Image 2","UI设计","落地页","深色模式","营销","数据可视化"],imageUrl:"https://cms-assets.youmind.com/media/1776697094626_4w646d_HGE06OebMAAQxNG-300x632.jpg"}]};function h({prompt:e,category:a}){return(0,t.jsxs)(r.motion.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},className:"bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all",children:[(0,t.jsx)("div",{className:"aspect-video bg-muted relative",children:(0,t.jsx)("img",{src:e.imageUrl,alt:e.title,className:"w-full h-full object-cover",onError:e=>{e.target.style.display="none"}})}),(0,t.jsxs)("div",{className:"p-4",children:[(0,t.jsx)("div",{className:"text-xs text-muted-foreground mb-2",children:a}),(0,t.jsx)("h3",{className:"font-semibold mb-2 line-clamp-2",children:e.title}),(0,t.jsxs)("p",{className:"text-sm text-muted-foreground line-clamp-3 mb-3",children:[e.content.substring(0,100),"..."]}),(0,t.jsx)("div",{className:"flex flex-wrap gap-1",children:e.tags.slice(0,3).map((e,a)=>(0,t.jsx)("span",{className:"text-xs px-2 py-1 rounded-full bg-muted",children:e},a))})]})]})}e.s(["default",0,function(){let[e,f]=(0,a.useState)([]),[y,b]=(0,a.useState)(!1),[w,x]=(0,a.useState)(0);(0,a.useEffect)(()=>{j()},[]);let j=async()=>{f(await g.categoryApi.getAll())},v=async(t,a)=>{let r=e.find(e=>e.name===t);if(!r){let s=await g.categoryApi.create({name:t,description:`${t}提示词`,color:a,order:e.length});s&&(r=s,f([...e,s]))}return r},S=async(e,t,a)=>{let r=await v(t,a);return await g.promptApi.create({title:e.title,content:e.content,sourceType:"TEXT",sourceUrl:`https://youmind.com/${"视频创作"===t?"seedance-2-0-prompts":"gpt-image-2-prompts"}`,categoryId:r?.id,tags:e.tags,isPublic:!1})},A=async()=>{b(!0),x(0);let e=0;for(let t of p.video)await I(t.title)||(await S(t,"视频创作","#ef4444"),x(++e));for(let t of p.image)await I(t.title)||(await S(t,"AI绘画","#8b5cf6"),x(++e));for(let t of p.ui)await I(t.title)||(await S(t,"UI设计","#3b82f6"),x(++e));b(!1),u.toast.success(`成功导入 ${e} 个提示词！`)},I=async e=>g.promptApi.getAll().some(t=>t.title===e),N=p.video.length+p.image.length+p.ui.length;return(0,t.jsx)("div",{className:"min-h-screen bg-background text-foreground p-8",children:(0,t.jsxs)("div",{className:"max-w-6xl mx-auto",children:[(0,t.jsxs)("div",{className:"text-center mb-12",children:[(0,t.jsxs)("div",{className:"inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4",children:[(0,t.jsx)(m.Sparkles,{className:"h-4 w-4"}),(0,t.jsx)("span",{className:"text-sm font-medium",children:"YouMind 精选提示词"})]}),(0,t.jsx)("h1",{className:"text-4xl font-bold mb-4",children:"导入 YouMind 提示词"}),(0,t.jsx)("p",{className:"text-muted-foreground max-w-2xl mx-auto",children:"从 youmind.com 抓取的精选提示词，包含 Seedance 2.0 视频提示词和 GPT Image 2 图像提示词"})]}),(0,t.jsxs)("div",{className:"grid grid-cols-3 gap-6 mb-12",children:[(0,t.jsxs)(r.motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},className:"bg-card border border-border rounded-xl p-6 text-center",children:[(0,t.jsx)(i.Video,{className:"h-8 w-8 mx-auto mb-3 text-red-500"}),(0,t.jsx)("div",{className:"text-3xl font-bold",children:p.video.length}),(0,t.jsx)("div",{className:"text-sm text-muted-foreground",children:"视频创作"})]}),(0,t.jsxs)(r.motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.1},className:"bg-card border border-border rounded-xl p-6 text-center",children:[(0,t.jsx)(n.Image,{className:"h-8 w-8 mx-auto mb-3 text-purple-500"}),(0,t.jsx)("div",{className:"text-3xl font-bold",children:p.image.length}),(0,t.jsx)("div",{className:"text-sm text-muted-foreground",children:"AI绘画"})]}),(0,t.jsxs)(r.motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.2},className:"bg-card border border-border rounded-xl p-6 text-center",children:[(0,t.jsx)(o,{className:"h-8 w-8 mx-auto mb-3 text-blue-500"}),(0,t.jsx)("div",{className:"text-3xl font-bold",children:p.ui.length}),(0,t.jsx)("div",{className:"text-sm text-muted-foreground",children:"UI设计"})]})]}),(0,t.jsxs)("div",{className:"text-center mb-12",children:[(0,t.jsx)(s.Button,{size:"lg",onClick:A,disabled:y,className:"px-8",children:y?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(l.CheckCircle,{className:"h-4 w-4 mr-2 animate-spin"}),"导入中... (",w,"/",N,")"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c.Download,{className:"h-4 w-4 mr-2"}),"一键导入全部 (",N,"个)"]})}),(0,t.jsxs)("a",{href:"https://youmind.com",target:"_blank",rel:"noopener noreferrer",className:"ml-4 text-sm text-muted-foreground hover:text-primary inline-flex items-center",children:["访问 YouMind",(0,t.jsx)(d.ExternalLink,{className:"h-3 w-3 ml-1"})]})]}),(0,t.jsxs)("div",{className:"space-y-8",children:[(0,t.jsxs)("section",{children:[(0,t.jsxs)("h2",{className:"text-2xl font-bold mb-4 flex items-center gap-2",children:[(0,t.jsx)(i.Video,{className:"h-6 w-6 text-red-500"}),"视频创作 (",p.video.length,")"]}),(0,t.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:p.video.map(e=>(0,t.jsx)(h,{prompt:e,category:"视频创作"},e.id))})]}),(0,t.jsxs)("section",{children:[(0,t.jsxs)("h2",{className:"text-2xl font-bold mb-4 flex items-center gap-2",children:[(0,t.jsx)(n.Image,{className:"h-6 w-6 text-purple-500"}),"AI绘画 (",p.image.length,")"]}),(0,t.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:p.image.map(e=>(0,t.jsx)(h,{prompt:e,category:"AI绘画"},e.id))})]}),(0,t.jsxs)("section",{children:[(0,t.jsxs)("h2",{className:"text-2xl font-bold mb-4 flex items-center gap-2",children:[(0,t.jsx)(o,{className:"h-6 w-6 text-blue-500"}),"UI设计 (",p.ui.length,")"]}),(0,t.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:p.ui.map(e=>(0,t.jsx)(h,{prompt:e,category:"UI设计"},e.id))})]})]})]})})}],64267)}]);