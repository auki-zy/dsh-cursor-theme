/**
 * dsh-cursor-theme client i18n dictionaries (zh / en).
 * Registered via the locale service in apply(); keys used by the settings
 * section UI.
 */

export const zh = {
  nav: '光标主题',
  subtitle: '为 DSH 的每种鼠标状态自定义图案',
  enabled: '启用自定义光标',
  enabledHint: '关闭后所有光标恢复系统默认',
  states: '鼠标状态',
  themes: '预设主题',
  themeDownload: '下载该主题的 ZIP 图片包',
  themeHint: '点击主题一键应用；点 ⤓ 下载对应 ZIP 图片包（可分享或导入）。',
  defaultBadge: '默认',
  stateDefault: '默认',
  statePointer: '点击（链接与按钮）',
  stateText: '文本（输入框）',
  stateWait: '等待（忙碌）',
  stateHelp: '帮助',
  stateNotAllowed: '禁止操作',
  stateGrab: '抓取（拖拽把手）',
  stateGrabbing: '抓取中（正在拖拽）',
  stateProgress: '进行中（可交互）',
  stateCell: '表格单元格',
  stateCopy: '复制',
  stateMove: '移动',
  stateResizeEw: '水平调整大小',
  stateResizeNs: '垂直调整大小',
  edit: '编辑',
  remove: '移除',
  upload: '上传图案',
  uploadHint: 'PNG（推荐）或 CUR，不超过 128×128',
  builtin: '内置素材',
  builtinFor: '当前状态可选素材',
  removeImage: '移除图案',
  hotspot: '热区（点击点）',
  hotspotX: 'X',
  hotspotY: 'Y',
  size: '尺寸',
  preview: '预览',
  previewHint: '把鼠标移到图案上查看效果',
  fallback: '兜底光标',
  a11yNote: '提示：图案加载失败时会自动回退到系统光标（永不隐藏），建议选择与界面背景对比明显的素材。',
  resetAll: '恢复系统默认',
  resetAllHint: '清空全部状态配置',
  sysTitle: '应用到系统',
  sysWinHint: 'Windows：一键将当前主题写入系统光标方案，Explorer 与所有应用立即生效；部分状态（复制/单元格等）无系统光标对应，会被跳过。',
  sysMacHint: 'macOS：通过 Swift 覆盖层应用系统光标（基于私有 API，实验性）——需先授予辅助功能权限；开启后点「应用到系统」，用「停止」还原。',
  sysUnsupported: '当前系统暂不支持系统级光标应用。',
  sysApply: '应用到系统',
  sysWorking: '应用中…',
  sysApplied: '已应用',
  sysRestored: '已停止并还原系统光标',
  sysFailed: '系统应用失败',
  sysEmpty: '请先配置至少一个鼠标状态',
  sysMacOpenSettings: '打开辅助功能设置',
  sysMacGranted: '已获得辅助功能权限',
  sysMacUngranted: '辅助功能权限未开启——点击上方按钮打开设置并授权。',
  sysMacStop: '停止',
  sysMacRunning: '系统光标覆盖中',
  exportImport: '图片包',
  export: '导出',
  import: '导入',
  importFailed: '导入失败',
  packHintTitle: '图片包格式与 AI 生成',
  packHint: '图片包是一个 ZIP：每种状态的图案是一张透明 PNG，另附 manifest.json 描述文件名、热区与尺寸。先点「导出」把当前配置存为模板，用图像工具或 AI 修改后「导入」即可。',
  packCopy: '复制 AI 提示词',
  packCopied: '已复制',
  packAiPrompt: `你是鼠标光标主题设计师。请生成一套 14 种状态的鼠标光标图案并打包成 ZIP：

1. 每张图案是透明背景 PNG，尺寸 32×32（最大 128×128）。
2. 必须包含以下 14 个状态文件（文件名固定）：
   default（默认箭头） pointer（点击） text（文本） wait（等待） help（帮助）
   not-allowed（禁止） grab（抓取） grabbing（抓取中） progress（进行中）
   cell（单元格） copy（复制） move（移动） resize-ew（水平缩放） resize-ns（垂直缩放）
3. 热区：箭头类在左上角尖端 (1,1)，其余在中心 (16,16)。
4. 同目录提供 manifest.json，内容如下（theme-name 换成你的主题名）：
{
  "schema": 1,
  "name": "theme-name",
  "version": "1.0.0",
  "enabled": true,
  "defaultSize": 32,
  "states": {
    "default":     { "file": "default.png",     "hotspot": { "x": 1,  "y": 1  }, "size": 32 },
    "pointer":     { "file": "pointer.png",     "hotspot": { "x": 1,  "y": 1  }, "size": 32 },
    "text":        { "file": "text.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "wait":        { "file": "wait.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "help":        { "file": "help.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "not-allowed": { "file": "not-allowed.png", "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "grab":        { "file": "grab.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "grabbing":    { "file": "grabbing.png",    "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "progress":    { "file": "progress.png",    "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "cell":        { "file": "cell.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "copy":        { "file": "copy.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "move":        { "file": "move.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "resize-ew":   { "file": "resize-ew.png",   "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "resize-ns":   { "file": "resize-ns.png",   "hotspot": { "x": 16, "y": 16 }, "size": 32 }
  }
}
5. 视觉风格：{在这里描述你的风格，例如「圆润 Q 版、毛玻璃质感、主色 #5a7dff、深蓝描边」}

最后打包成 ZIP 交付，我会在 DSH 设置 → 光标主题 → 图片包 → 导入使用。`,
  resetState: '重置此状态',
  unsupported: '当前宿主不支持光标主题设置',
  noConfig: '暂无配置',
}

export const en: Record<string, string> = {
  nav: 'Cursor Theme',
  subtitle: 'Customize the cursor for every mouse state in DSH',
  enabled: 'Enable custom cursors',
  enabledHint: 'When off, all cursors return to the system default',
  states: 'Mouse states',
  themes: 'Preset themes',
  themeDownload: 'Download this theme as a ZIP image pack',
  themeHint: 'Click a theme to apply it; click ⤓ to download the matching ZIP image pack (shareable / importable).',
  defaultBadge: 'Default',
  stateDefault: 'Default',
  statePointer: 'Pointer (links & buttons)',
  stateText: 'Text (inputs)',
  stateWait: 'Wait (busy)',
  stateHelp: 'Help',
  stateNotAllowed: 'Not allowed',
  stateGrab: 'Grab (drag handle)',
  stateGrabbing: 'Grabbing (dragging)',
  stateProgress: 'Progress (interactive)',
  stateCell: 'Cell (table)',
  stateCopy: 'Copy',
  stateMove: 'Move',
  stateResizeEw: 'Resize east-west',
  stateResizeNs: 'Resize north-south',
  edit: 'Edit',
  remove: 'Remove',
  upload: 'Upload image',
  uploadHint: 'PNG (recommended) or CUR, max 128×128',
  builtin: 'Built-in assets',
  builtinFor: 'Assets for this state',
  removeImage: 'Remove image',
  hotspot: 'Hotspot (click point)',
  hotspotX: 'X',
  hotspotY: 'Y',
  size: 'Size',
  preview: 'Preview',
  previewHint: 'Hover the shapes to see the effect',
  fallback: 'Fallback cursor',
  a11yNote: 'Tip: if an image fails to load the cursor falls back to the system default (never hidden). Prefer assets with good contrast against the UI background.',
  resetAll: 'Restore system default',
  resetAllHint: 'Clear every state override',
  sysTitle: 'Apply to system',
  sysWinHint: 'Windows: one click writes the current theme into the system cursor scheme — Explorer and every app pick it up immediately; states without a system cursor (copy/cell, etc.) are skipped.',
  sysMacHint: 'macOS: applies system cursors via a Swift overlay (private API, experimental) — grant Accessibility first, then Apply; Stop reverts.',
  sysUnsupported: 'System-level cursors are not supported on this OS.',
  sysApply: 'Apply to system',
  sysWorking: 'Applying…',
  sysApplied: 'Applied',
  sysRestored: 'Stopped and reverted system cursors',
  sysFailed: 'System apply failed',
  sysEmpty: 'Configure at least one mouse state first',
  sysMacOpenSettings: 'Open Accessibility settings',
  sysMacGranted: 'Accessibility permission granted',
  sysMacUngranted: 'Accessibility permission not granted — open the settings above and allow it.',
  sysMacStop: 'Stop',
  sysMacRunning: 'System cursor overlay active',
  exportImport: 'Image pack',
  export: 'Export',
  import: 'Import',
  importFailed: 'Import failed',
  packHintTitle: 'Image pack format & AI generation',
  packHint: 'An image pack is a ZIP: one transparent PNG per state plus a manifest.json describing file names, hotspots and sizes. Export your current config as a template, edit it with any image tool or AI, then import it back.',
  packCopy: 'Copy AI prompt',
  packCopied: 'Copied',
  packAiPrompt: `You are a mouse cursor theme designer. Generate a set of 14 mouse cursor images and package them into a ZIP:

1. Each image is a transparent-background PNG, 32×32 (max 128×128).
2. Must include these 14 state files (fixed file names):
   default (arrow) pointer (click) text (text) wait (busy) help (help)
   not-allowed (forbidden) grab (grab) grabbing (grabbing) progress (progress)
   cell (table cell) copy (copy) move (move) resize-ew (resize east-west) resize-ns (resize north-south)
3. Hotspot: arrow-style images at the top-left tip (1,1); everything else centered (16,16).
4. Provide manifest.json in the same directory (replace theme-name with your theme name):
{
  "schema": 1,
  "name": "theme-name",
  "version": "1.0.0",
  "enabled": true,
  "defaultSize": 32,
  "states": {
    "default":     { "file": "default.png",     "hotspot": { "x": 1,  "y": 1  }, "size": 32 },
    "pointer":     { "file": "pointer.png",     "hotspot": { "x": 1,  "y": 1  }, "size": 32 },
    "text":        { "file": "text.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "wait":        { "file": "wait.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "help":        { "file": "help.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "not-allowed": { "file": "not-allowed.png", "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "grab":        { "file": "grab.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "grabbing":    { "file": "grabbing.png",    "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "progress":    { "file": "progress.png",    "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "cell":        { "file": "cell.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "copy":        { "file": "copy.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "move":        { "file": "move.png",        "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "resize-ew":   { "file": "resize-ew.png",   "hotspot": { "x": 16, "y": 16 }, "size": 32 },
    "resize-ns":   { "file": "resize-ns.png",   "hotspot": { "x": 16, "y": 16 }, "size": 32 }
  }
}
5. Visual style: {describe your style here, e.g. "rounded chibi style, frosted glass, primary #5a7dff, dark blue outline"}

Deliver as a ZIP; I will import it in DSH Settings → Cursor Theme → Image pack.`,
  resetState: 'Reset this state',
  unsupported: 'This host does not support cursor theme settings',
  noConfig: 'No configuration yet',
}
