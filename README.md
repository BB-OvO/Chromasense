<div align="center">
  <h1>
    <img src="https://raw.githubusercontent.com/BB-OvO/Chromasense/main/logo.svg" 
         width="36" 
         alt="Chromasense logo" 
         style="vertical-align: middle; margin-right: 8px;" />
    Chromasense
  </h1>
  <p><strong>图片色彩提取与配色参考工具</strong></p>
  <p>
    <a href="https://chromasense-3pp.pages.dev/">🔗 在线体验</a>
  </p>
</div>
<img width="1380" height="686" alt="image" src="https://github.com/user-attachments/assets/3f8bc057-2b53-4c6c-b0b9-d40643594994" />


<!-- 在这里放置 Hero 截图 -->
<!-- ![Chromasense 主界面](assets/hero.png) -->

## ✨ 功能特性

*   **Median Cut 色彩量化** — 在 RGB 空间中迭代切分，从图片中精确提取主色
*   **智能配色预览** — 自动将提取色分配为导航/Hero/卡片/CTA 等角色，渲染真实 UI 组件
*   **色彩简化预览** — 每个像素映射到最近的提取色，直观验证色板还原度
*   **灵活排序** — 按占比、色相、明度三种维度排列色板
*   **CSS 变量导出** — 一键复制 `:root` 变量，附色名与占比注释，直接可用
*   **多种输入方式** — 拖拽上传、点击选择、`Ctrl+V` 粘贴剪贴板图片
*   **纯前端运行** — 所有计算在浏览器本地完成，不上传任何数据
<img width="1357" height="902" alt="image" src="https://github.com/user-attachments/assets/03ea315c-0bf5-4b76-b0ff-623b735ee4ec" />

<img width="1310" height="510" alt="image" src="https://github.com/user-attachments/assets/29e8bc15-5fc4-402e-9f93-c749771e9cf6" />


## 🚀 快速开始

<!-- 在这里放置功能演示 GIF -->
<!-- ![功能演示](assets/demo.gif) -->

1.  打开 [在线地址](https://chromasense-3pp.pages.dev/)
2.  **拖入** 或 **粘贴** (Ctrl+V) 一张你喜欢的图片
3.  等待色板生成
4.  点击复制 CSS 变量，粘贴到你的项目中即可使用

<details>
<summary>📂 本地运行</summary>

如果你希望在本地使用或开发：

1.  克隆本仓库到本地
2.  直接在浏览器中打开 `index.html` 文件

</details>
<img width="1907" height="968" alt="image" src="https://github.com/user-attachments/assets/8f404e60-7064-4514-9089-d34b53b437d8" />


## 🎯 使用场景

<!-- 在这里放置 CSS 导出功能特写截图 -->
<!-- ![CSS 变量导出](assets/css-export.png) -->

### 日常设计参考
*   从摄影作品、插画、海报中快速提取色板，作为设计项目的起始配色；
*   验证配色方案是否真实反映参考图的色彩倾向。

### AI 编程时的配色约束

用 Cursor、Claude、ChatGPT 等 AI 写 UI 时，常见问题是“配色不够好看”——结构布局可能很规范，但颜色组合往往缺乏协调感。你可以用 Chromasense 配合下面这套提示词，把配色主权牢牢握在自己手里：

1. 找一张你觉得配色好看的参考图；
2. 用 Chromasense 提取 8–12 色的色板，并一键复制 CSS 变量；
3. 将以下提示词与 CSS 变量一起发送给 AI：

> **🔗 可复制的 Prompt 模板：**
>
> ```
> 请严格使用以下 CSS 变量作为页面唯一色彩来源。你需要参考其占比，还原这套色板的设计意图：
> - 高占比色：定调整体氛围。请大面积用在背景、卡片底色、非重点区域上，营造视觉基调。
> - 低占比色：引导视觉焦点。请小面积用在按钮、重要标题、图标、强调信息上，作为视觉点缀。
> 
> 应用原则：保持原色板的主次关系与和谐感，而非只堆砌主色。所有颜色应穿插使用，营造层次。禁止使用任何未定义的色值。
> 
> [在此处粘贴从 Chromasense 复制的 :root CSS 变量]
> ```

这样 AI 就会严格在你给的色板内设计页面，彻底告别“玄学配色”。

## 🛠️ 技术栈

*   **前端:** HTML
*   **色彩量化:** Median Cut 算法（纯前端实现）
*   **部署:** [Cloudflare Pages](https://pages.cloudflare.com/)

## 📄 开源协议

本项目基于 [Apache License 2.0](LICENSE) 开源。你可以自由使用、修改和分发，但需保留版权声明、说明修改内容，并随附许可证副本。

---

<div align="center">
  <p>如果这个项目对你有帮助，欢迎给个 ⭐ Star 支持一下！</p>
</div>
