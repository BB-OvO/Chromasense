/* ========================================
   工具函数模块
   包含颜色转换、对比度计算、颜色命名等基础功能
   ======================================== */

/**
 * RGB 转 HEX 十六进制颜色
 * @param {number} r - 红色值 0-255
 * @param {number} g - 绿色值 0-255
 * @param {number} b - 蓝色值 0-255
 * @returns {string} HEX 颜色字符串，如 "#FF5733"
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
/**
 * RGB 转 HSL（色相、饱和度、明度）
 * @returns {Array} [h, s, l] 色相 0-360, 饱和度 0-100, 明度 0-100
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
/**
 * HSL 转 RGB
 * @param {number} h - 色相 0-360
 * @param {number} s - 饱和度 0-100
 * @param {number} l - 明度 0-100
 * @returns {Array} [r, g, b] RGB 值 0-255
 */
function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
/**
 * 计算颜色的相对亮度（WCAG 标准）
 * 用于判断文字应该用深色还是浅色
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
/**
 * 根据背景色计算对比色（深色或浅色文字）
 * @returns {string} 适合的文字颜色
 */
function contrastColor(r, g, b) {
  return getLuminance(r, g, b) > 0.35 ? '#1a1a1a' : '#f5f5f5';
}
/**
 * 根据 HSL 值生成中文颜色名称
 * 基于色相环和饱和度、明度进行近似命名
 * @returns {string} 中文颜色名，如"深蓝色"、"浅绿色"
 */
function getColorName(h, s, l) {
  if (l < 8) return '黑色';
  if (l > 94 && s < 10) return '白色';
  if (s < 10) { if (l < 25) return '深灰色'; if (l < 55) return '灰色'; return '浅灰色'; }
  let hue = '';
  if (h < 12 || h >= 348) hue = '红';
  else if (h < 38) hue = '橙';
  else if (h < 62) hue = '黄';
  else if (h < 80) hue = '黄绿';
  else if (h < 155) hue = '绿';
  else if (h < 195) hue = '青';
  else if (h < 260) hue = '蓝';
  else if (h < 295) hue = '紫';
  else hue = '品红';
  let prefix = '';
  if (l < 28) prefix = '暗';
  else if (l < 45) prefix = '深';
  else if (l > 78) prefix = '浅';
  else if (l > 62) prefix = '淡';
  return prefix + hue + '色';
}
/**
 * 计算颜色鲜艳度（饱和度与明度的综合指标）
 * 值越高颜色越鲜艳，用于排序和筛选
 */
function vibrancy(h, s, l) { return s * (1 - Math.abs(l - 50) / 50); }

/**
 * HTML 转义，防止 XSS 攻击
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 显示 Toast 通知提示
 * @param {string} msg - 提示消息内容
 */
function showToast(msg) {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="fas fa-check-circle"></i>${escapeHtml(msg)}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(`已复制 ${text}`)).catch(() => showToast('复制失败，请手动复制'));
  } else {
    showToast('当前浏览器不支持自动复制，请手动选择文本复制');
  }
}

/* ========================================
   色彩空间转换 - RGB <-> Lab
   Lab 是感知均匀的色彩空间，更接近人眼感知
   ======================================== */
function rgbToXyz(r, g, b) {
  r = r / 255; g = g / 255; b = b / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  r *= 100; g *= 100; b *= 100;
  return [
    r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    r * 0.2126729 + g * 0.7151522 + b * 0.0721750,
    r * 0.0193339 + g * 0.1191920 + b * 0.9503041
  ];
}
function xyzToLab(x, y, z) {
  const D65 = [95.047, 100.0, 108.883];
  const f = t => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + 16/116;
  const fx = f(x / D65[0]), fy = f(y / D65[1]), fz = f(z / D65[2]);
  return [(116 * fy) - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function rgbToLab(r, g, b) {
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}
function labToXyz(l, a, b) {
  const D65 = [95.047, 100.0, 108.883];
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const f = t => {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16/116) / 7.787;
  };
  return [D65[0] * f(fx), D65[1] * f(fy), D65[2] * f(fz)];
}
function xyzToRgb(x, y, z) {
  x /= 100; y /= 100; z /= 100;
  let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
  const f = t => t > 0.0031308 ? 1.055 * Math.pow(t, 1/2.4) - 0.055 : 12.92 * t;
  return [Math.round(Math.max(0, Math.min(255, f(r) * 255))),
          Math.round(Math.max(0, Math.min(255, f(g) * 255))),
          Math.round(Math.max(0, Math.min(255, f(b) * 255)))];
}
function labToRgb(l, a, b) {
  const [x, y, z] = labToXyz(l, a, b);
  return xyzToRgb(x, y, z);
}
function deltaE(lab1, lab2) {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL*dL + da*da + db*db);
}

/* ========================================
   改进的 Median Cut 色彩量化算法
   使用 Lab 感知色彩空间，更接近人眼感知
   支持小面积色彩保留和颜色去重
   ======================================== */
class MedianCut {
  constructor(pixels, maxColors) {
    this.pixels = pixels;
    this.maxColors = maxColors;
    this.labCache = new Map();
  }
  _getLab(pixel) {
    const key = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];
    if (!this.labCache.has(key)) {
      this.labCache.set(key, rgbToLab(pixel[0], pixel[1], pixel[2]));
    }
    return this.labCache.get(key);
  }
  quantize() {
    if (this.pixels.length === 0) return [];
    const boxes = [{ pixels: this.pixels.slice(), lab: this.pixels.map(p => this._getLab(p)) }];
    while (boxes.length < this.maxColors) {
      let bestIdx = -1, bestVolume = -1;
      for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].pixels.length < 2) continue;
        const vol = this._volume(boxes[i].lab);
        if (vol > bestVolume) { bestVolume = vol; bestIdx = i; }
      }
      if (bestIdx === -1 || bestVolume <= 0) break;
      const box = boxes[bestIdx];
      const splitInfo = this._findBestSplit(box);
      const { left, right, leftLab, rightLab } = this._splitBox(box, splitInfo.channel, splitInfo.threshold);
      boxes.splice(bestIdx, 1, { pixels: left, lab: leftLab }, { pixels: right, lab: rightLab });
    }
    const results = boxes.map(box => this._weightedAverage(box));
    return this._deduplicateColors(results);
  }
  _volume(labArr) {
    let minL=100, maxL=0, minA=128, maxA=-128, minB=128, maxB=-128;
    for (const lab of labArr) {
      if (lab[0] < minL) minL = lab[0]; if (lab[0] > maxL) maxL = lab[0];
      if (lab[1] < minA) minA = lab[1]; if (lab[1] > maxA) maxA = lab[1];
      if (lab[2] < minB) minB = lab[2]; if (lab[2] > maxB) maxB = lab[2];
    }
    return (maxL - minL) * 1.5 + (maxA - minA) + (maxB - minB);
  }
  _findBestSplit(box) {
    const channels = [0, 1, 2];
    let bestChannel = 0, bestThreshold = 0, bestSpread = -1;
    for (const ch of channels) {
      const values = box.lab.map(l => l[ch]).sort((a, b) => a - b);
      const spread = values[values.length - 1] - values[0];
      if (spread > bestSpread) {
        bestSpread = spread;
        bestChannel = ch;
        const mid = Math.floor(values.length / 2);
        bestThreshold = values[mid];
      }
    }
    return { channel: bestChannel, threshold: bestThreshold };
  }
  _splitBox(box, channel, threshold) {
    const left = [], right = [], leftLab = [], rightLab = [];
    for (let i = 0; i < box.pixels.length; i++) {
      if (box.lab[i][channel] <= threshold) {
        left.push(box.pixels[i]);
        leftLab.push(box.lab[i]);
      } else {
        right.push(box.pixels[i]);
        rightLab.push(box.lab[i]);
      }
    }
    if (left.length === 0 || right.length === 0) {
      const mid = Math.floor(box.pixels.length / 2);
      return {
        left: box.pixels.slice(0, mid),
        right: box.pixels.slice(mid),
        leftLab: box.lab.slice(0, mid),
        rightLab: box.lab.slice(mid)
      };
    }
    return { left, right, leftLab, rightLab };
  }
  _weightedAverage(box) {
    let sumL=0, sumA=0, sumB=0, sumWeight=0;
    const weights = [];
    for (let i = 0; i < box.pixels.length; i++) {
      const lab = box.lab[i];
      const chroma = Math.sqrt(lab[1]*lab[1] + lab[2]*lab[2]);
      const weight = 1 + chroma * 0.02;
      weights.push(weight);
      sumL += lab[0] * weight;
      sumA += lab[1] * weight;
      sumB += lab[2] * weight;
      sumWeight += weight;
    }
    const avgL = sumL / sumWeight, avgA = sumA / sumWeight, avgB = sumB / sumWeight;
    const [r, g, b] = labToRgb(avgL, avgA, avgB);
    return [r, g, b, box.pixels.length];
  }
  _deduplicateColors(colors) {
    if (colors.length <= 1) return colors;
    const threshold = 8;
    const result = [];
    const used = new Set();
    for (let i = 0; i < colors.length; i++) {
      if (used.has(i)) continue;
      const lab1 = rgbToLab(colors[i][0], colors[i][1], colors[i][2]);
      let merged = [colors[i]];
      for (let j = i + 1; j < colors.length; j++) {
        if (used.has(j)) continue;
        const lab2 = rgbToLab(colors[j][0], colors[j][1], colors[j][2]);
        if (deltaE(lab1, lab2) < threshold) {
          merged.push(colors[j]);
          used.add(j);
        }
      }
      const total = merged.reduce((s, c) => s + c[3], 0);
      const avgR = Math.round(merged.reduce((s, c) => s + c[0] * c[3], 0) / total);
      const avgG = Math.round(merged.reduce((s, c) => s + c[1] * c[3], 0) / total);
      const avgB = Math.round(merged.reduce((s, c) => s + c[2] * c[3], 0) / total);
      result.push([avgR, avgG, avgB, total]);
    }
    return result.sort((a, b) => b[3] - a[3]);
  }
}

/* ========================================
   应用状态管理
   存储当前图片、像素数据和提取的颜色
   ======================================== */
const state = { image: null, originalPixels: [], colors: [], totalSampled: 0 };
let colorCache = new Map();

function clearState() {
  state.image = null;
  state.originalPixels = [];
  state.colors = [];
  state.totalSampled = 0;
  colorCache.clear();
}

function handleImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('请上传有效的图片文件（支持 JPG、PNG、WEBP、BMP、GIF）');
    return;
  }
  const reader = new FileReader();
  reader.onerror = () => showToast('文件读取失败，请重试');
  reader.onload = (e) => {
    try {
      const img = new Image();
      img.onerror = () => showToast('图片加载失败，请检查图片格式');
      img.onload = () => {
        try {
          state.image = img;
          colorCache.clear();
          samplePixels(img);
          extractAndRender();
          document.getElementById('uploadSection').style.display = 'none';
          document.getElementById('resultSection').classList.add('active');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          showToast('图片处理失败：' + err.message);
        }
      };
      img.src = e.target.result;
    } catch (err) {
      showToast('文件解析失败，请重试');
    }
  };
  reader.readAsDataURL(file);
}

/**
 * 智能像素采样
 * 根据图片尺寸动态调整采样分辨率
 * 使用网格采样 + 随机采样结合，保留小面积色彩
 */
function samplePixels(img) {
  let w = img.naturalWidth, h = img.naturalHeight;
  const originalArea = w * h;
  let targetSamples;
  if (originalArea > 500000) targetSamples = 25000;
  else if (originalArea > 200000) targetSamples = 15000;
  else if (originalArea > 50000) targetSamples = 8000;
  else targetSamples = Math.max(3000, Math.min(5000, originalArea));
  const scale = Math.sqrt(targetSamples / originalArea);
  const sampleW = Math.max(100, Math.min(300, Math.round(w * scale)));
  const sampleH = Math.max(100, Math.min(300, Math.round(h * scale)));
  const canvas = document.getElementById('sampleCanvas');
  if (!canvas) throw new Error('采样画布不存在');
  canvas.width = sampleW; canvas.height = sampleH;
  let ctx;
  try {
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  } catch (e) {
    ctx = canvas.getContext('2d');
  }
  if (!ctx) throw new Error('无法创建 Canvas 上下文');
  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
  const data = imageData.data;
  const pixels = [];
  const colorBuckets = new Map();
  const bucketSize = 32;
  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const i = (y * sampleW + x) * 4;
      if (data[i + 3] >= 128) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        pixels.push([r, g, b]);
        const br = Math.floor(r / bucketSize);
        const bg = Math.floor(g / bucketSize);
        const bb = Math.floor(b / bucketSize);
        const key = `${br},${bg},${bb}`;
        if (!colorBuckets.has(key)) colorBuckets.set(key, []);
        colorBuckets.get(key).push([r, g, b]);
      }
    }
  }
  const enhancedPixels = [...pixels];
  const minBucketSize = Math.max(3, Math.floor(pixels.length * 0.001));
  for (const [key, bucket] of colorBuckets) {
    if (bucket.length >= minBucketSize && bucket.length <= pixels.length * 0.05) {
      const repeatFactor = Math.min(3, Math.ceil(pixels.length * 0.02 / bucket.length));
      for (let i = 0; i < repeatFactor - 1; i++) {
        enhancedPixels.push(...bucket);
      }
    }
  }
  state.originalPixels = enhancedPixels;
  state.totalSampled = pixels.length;
}

/**
 * 提取颜色并渲染所有结果
 * 主流程：量化 -> 计算占比 -> 排序 -> 渲染各个组件
 */
function extractAndRender() {
  const count = parseInt(document.getElementById('countSlider').value);
  const mc = new MedianCut(state.originalPixels, count);
  const raw = mc.quantize();
  const totalPixels = raw.reduce((s, c) => s + c[3], 0);
  state.colors = new Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    const [r, g, b, cnt] = raw[i];
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    state.colors[i] = {
      r, g, b, hex, hsl, count: cnt,
      percentage: Math.round(cnt / totalPixels * 1000) / 10,
      name: getColorName(hsl[0], hsl[1], hsl[2]),
      lum: getLuminance(r, g, b),
      vibrancy: vibrancy(hsl[0], hsl[1], hsl[2]),
    };
  }
  sortAndRender();
  renderOriginalImage();
  renderSimplifiedImage();
  renderPreview();
  renderExport();
}

/**
 * 根据用户选择的排序方式对颜色进行排序
 * 支持按占比、色相、明度三种排序
 */
function sortAndRender() {
  const mode = document.getElementById('sortSelect').value;
  const sorted = state.colors.slice();
  if (mode === 'pct') sorted.sort((a, b) => b.percentage - a.percentage);
  else if (mode === 'hue') sorted.sort((a, b) => a.hsl[0] - b.hsl[0]);
  else sorted.sort((a, b) => b.lum - a.lum);
  state.colors = sorted;
  renderStrip();
  renderColorList();
}

/**
 * 渲染原图到显示画布
 * 限制最大宽度 600px，保持宽高比
 */
function renderOriginalImage() {
  const canvas = document.getElementById('displayCanvas');
  const img = state.image;
  const maxW = 600;
  let w = img.naturalWidth, h = img.naturalHeight;
  if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  const meta = document.getElementById('imageMeta');
  meta.innerHTML = `<span>${img.naturalWidth} × ${img.naturalHeight} px</span><span>采样 ${state.totalSampled.toLocaleString()} 像素</span><span>提取 ${state.colors.length} 色</span>`;
}

/**
 * 渲染色彩简化版本
 * 将图片中每个像素替换为最接近的提取颜色
 * 实现色彩量化后的视觉效果预览
 */
function renderSimplifiedImage() {
  const canvas = document.getElementById('simplifyCanvas');
  if (!canvas) return;
  const img = state.image;
  if (!img) return;
  const maxW = 600;
  let w = img.naturalWidth, h = img.naturalHeight;
  if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
  canvas.width = w; canvas.height = h;
  let ctx;
  try {
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  } catch (e) {
    ctx = canvas.getContext('2d');
  }
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const colors = state.colors;
  if (!colors || colors.length === 0) return;
  const colorCount = colors.length;
  const cacheLimit = 65536;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] < 128) continue;
    const pr = data[i], pg = data[i+1], pb = data[i+2];
    const key = (pr << 16) | (pg << 8) | pb;
    let best;
    if (colorCache.has(key)) {
      best = colorCache.get(key);
    } else {
      let minDist = Infinity;
      best = colors[0];
      for (let j = 0; j < colorCount; j++) {
        const c = colors[j];
        const dr = pr - c.r, dg = pg - c.g, db = pb - c.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) { minDist = dist; best = c; }
      }
      if (colorCache.size < cacheLimit) colorCache.set(key, best);
    }
    data[i] = best.r; data[i+1] = best.g; data[i+2] = best.b;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * 渲染颜色条带
 * 按颜色占比分配宽度，点击可复制色值
 */
function renderStrip() {
  const strip = document.getElementById('colorStrip');
  const frag = document.createDocumentFragment();
  state.colors.forEach(c => {
    const div = document.createElement('div');
    div.style.flex = c.percentage;
    div.style.background = c.hex;
    div.title = `${c.hex} (${c.percentage}%)`;
    div.addEventListener('click', () => copyText(c.hex));
    frag.appendChild(div);
  });
  strip.innerHTML = '';
  strip.appendChild(frag);
}

/**
 * 渲染颜色列表卡片
 * 显示色块、HEX、RGB、HSL、中文名、占比等信息
 * 带入场动画效果
 */
function renderColorList() {
  const list = document.getElementById('colorList');
  const frag = document.createDocumentFragment();
  state.colors.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'color-card color-card-enter';
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      <div class="color-swatch" style="background:${c.hex}"></div>
      <div class="color-info">
        <div class="color-hex">${c.hex.toUpperCase()}</div>
        <div class="color-name">${c.name}</div>
        <div class="color-detail">RGB(${c.r}, ${c.g}, ${c.b}) · HSL(${c.hsl[0]}°, ${c.hsl[1]}%, ${c.hsl[2]}%)</div>
      </div>
      <div class="color-pct-wrap">
        <div class="color-pct-bar"><div class="color-pct-bar-fill" style="width:${c.percentage}%;background:${c.hex}"></div></div>
        <span class="color-pct-num">${c.percentage}%</span>
      </div>`;
    card.addEventListener('click', () => copyText(c.hex.toUpperCase()));
    frag.appendChild(card);
  });
  list.innerHTML = '';
  list.appendChild(frag);
}

/* === 精致配色预览 === */
/**
 * 渲染配色预览 UI
 * 使用提取的颜色生成一个完整的网页预览
 * 包含导航、Hero、指标、特性卡片、CTA、页脚
 */
function renderPreview() {
  const colors = state.colors;
  if (colors.length < 3) return;

  const byLum = colors.slice().sort((a, b) => a.lum - b.lum);
  const byVib = colors.slice().sort((a, b) => b.vibrancy - a.vibrancy);
  const byPct = colors.slice().sort((a, b) => b.percentage - a.percentage);

  const darkest = byLum[0];
  const lightest = byLum[byLum.length - 1];
  const accent = byVib[0];
  const nearDark = byLum.length > 1 ? byLum[1] : darkest;
  const midColors = colors.slice().sort((a, b) => Math.abs(a.lum - 0.5) - Math.abs(b.lum - 0.5));

  const heroBg = byPct[0];
  const heroBg2 = byPct.length > 1 ? byPct[1] : byPct[0];
  const heroText = contrastColor(
    Math.round((heroBg.r + heroBg2.r) / 2),
    Math.round((heroBg.g + heroBg2.g) / 2),
    Math.round((heroBg.b + heroBg2.b) / 2)
  );
  const accentText = contrastColor(accent.r, accent.g, accent.b);
  const navText = contrastColor(darkest.r, darkest.g, darkest.b);

  const featureIcons = midColors.slice(0, 3);
  while (featureIcons.length < 3) featureIcons.push(colors[featureIcons.length % colors.length]);

  const featureCardBg = lightest.lum > 0.85 ? '#f8f8f8' : lightest.hex;
  const featureText = contrastColor(
    ...(() => {
      if (featureCardBg.startsWith('#')) {
        const v = parseInt(featureCardBg.slice(1), 16);
        return [(v>>16)&255, (v>>8)&255, v&255];
      }
      return [245,245,245];
    })()
  );

  const featColors = colors.filter(c => c.lum > 0.12 && c.lum < 0.88).slice(0, 3);
  while (featColors.length < 3) featColors.push(colors[featColors.length % colors.length]);

  const metricsBg = nearDark.hex;
  const metricsText = contrastColor(nearDark.r, nearDark.g, nearDark.b);

  const ctaBg = accent.hex;
  const ctaText = accentText;

  const imgSrc = state.image.src;

  const frame = document.getElementById('previewFrame');
  frame.innerHTML = `
    <div class="pv-wrap">
      <!-- 导航 -->
      <div class="pv-nav" style="background:${darkest.hex};color:${navText}">
        <span class="pv-nav-brand">Atelier</span>
        <div class="pv-nav-links">
          <span style="color:${navText}">作品</span>
          <span style="color:${navText}">服务</span>
          <span style="color:${navText}">关于</span>
          <span style="color:${navText}">日志</span>
        </div>
        <span class="pv-nav-cta" style="background:${accent.hex};color:${accentText}">联系我们</span>
      </div>

      <!-- Hero -->
      <div class="pv-hero" style="background:linear-gradient(135deg,${heroBg.hex},${heroBg2.hex});color:${heroText}">
        <div class="pv-hero-deco" style="background:${accent.hex}"></div>
        <div class="pv-hero-deco2" style="background:${heroText}"></div>
        <div class="pv-hero-text">
          <span class="pv-hero-tag" style="color:${heroText};border-color:${heroText}40">EST. 2026</span>
          <h2>在光线与材质之间，寻找空间的灵魂</h2>
          <p>我们相信好的设计源于对色彩、质感与比例的深层理解。每一处细节都在讲述一个关于克制与表达的故事。</p>
          <div class="pv-hero-btns">
            <span class="pv-btn-primary" style="background:${accent.hex};color:${accentText}">探索项目</span>
            <span class="pv-btn-outline" style="color:${heroText};border-color:${heroText}30">了解更多</span>
          </div>
        </div>
        <div class="pv-hero-img" style="background-image:url('${imgSrc}')"></div>
      </div>

      <!-- 指标 -->
      <div class="pv-metrics" style="background:${metricsBg};color:${metricsText}">
        <div class="pv-metric">
          <div class="pv-metric-num">260+</div>
          <div class="pv-metric-label">完成项目</div>
        </div>
        <div class="pv-metric">
          <div class="pv-metric-num">18</div>
          <div class="pv-metric-label">设计大奖</div>
        </div>
        <div class="pv-metric">
          <div class="pv-metric-num">12yr</div>
          <div class="pv-metric-label">行业经验</div>
        </div>
      </div>

      <!-- 特性卡片 -->
      <div class="pv-features" style="background:${featureCardBg};color:${featureText}">
        ${featColors.map((c, i) => {
          const txt = contrastColor(c.r, c.g, c.b);
          const iconBg = c.hex;
          const iconTxt = contrastColor(c.r, c.g, c.b);
          return `
            <div class="pv-feature" style="color:${featureText}">
              <div class="pv-feature-icon" style="background:${iconBg};color:${iconTxt}">
                <i class="fas ${['fa-drafting-compass','fa-palette','fa-layer-group'][i]}"></i>
              </div>
              <h4>${['空间叙事设计','视觉识别系统','全链路交付'][i]}</h4>
              <p>${['将品牌故事转化为可感知的空间体验，通过材质与光影编排，构建有记忆点的沉浸式场所。','从标志到完整视觉语言，构建具有文化深度与时代精神的品牌形象体系。','从概念构思到最终落地，提供从策略到执行的全流程专业服务。'][i]}</p>
            </div>`;
        }).join('')}
      </div>

      <!-- CTA -->
      <div class="pv-cta-bar" style="background:${ctaBg};color:${ctaText}">
        <div class="pv-cta-bar-text">
          <h4>准备开始你的项目？</h4>
          <p>与我们聊聊，让好的设计自然发生</p>
        </div>
        <span class="pv-cta-bar-btn" style="background:${ctaText};color:${ctaBg}">预约咨询</span>
      </div>

      <!-- 页脚 -->
      <div class="pv-footer" style="background:${darkest.hex};color:${navText}">
        <span>&copy; 2026 Atelier. All rights reserved.</span>
        <span>用心设计每一个细节</span>
      </div>
    </div>
  `;
}

/**
 * 渲染 CSS 导出代码
 * 生成 :root 变量格式，包含色值、色名、占比注释
 * 方便用户直接复制到项目中使用
 */
function renderExport() {
  const code = document.getElementById('exportCode');
  let css = ':root {\n';
  const colors = state.colors;
  for (let i = 0; i < colors.length; i++) {
    const c = colors[i];
    const label = c.name.replace('色', '');
    css += `  --color-${i + 1}: ${c.hex.toUpperCase()}; /* ${label} ${c.percentage}% */\n`;
  }
  css += '}';
  code.textContent = css;
}

/* ========================================
   事件绑定模块
   处理用户交互：图片切换、拖拽上传、点击上传、粘贴、控件变化等
   ======================================== */

/**
 * 图片标签切换事件
 * 在"原图"和"色彩简化"视图之间切换
 */
document.querySelectorAll('.image-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.image-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const displayCanvas = document.getElementById('displayCanvas');
    const ctx = displayCanvas.getContext('2d');
    if (tab.dataset.tab === 'original') {
      const img = state.image;
      const maxW = 600;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      displayCanvas.width = w; displayCanvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      const src = document.getElementById('simplifyCanvas');
      displayCanvas.width = src.width; displayCanvas.height = src.height;
      ctx.drawImage(src, 0, 0);
    }
  });
});

/* 上传区域交互 */
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

/**
 * 点击上传区域触发文件选择
 * 支持键盘 Enter 和空格键触发
 */
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });

/**
 * 文件选择变化时处理图片
 */
fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleImage(e.target.files[0]); });

/**
 * 拖拽上传 - 鼠标悬停时高亮
 */
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });

/**
 * 拖拽上传 - 鼠标离开时取消高亮
 */
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));

/**
 * 拖拽上传 - 释放文件时处理图片
 */
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault(); uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0]; if (file) handleImage(file);
});

/**
 * 粘贴剪贴板图片
 * 支持 Ctrl+V 粘贴截图或复制的图片
 */
document.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items; if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) { e.preventDefault(); handleImage(item.getAsFile()); break; }
  }
});

/**
 * 工具栏控件 - 提取数量滑块
 * input 事件实时更新显示数字，change 事件触发重新提取
 */
const countSlider = document.getElementById('countSlider');
const countDisplay = document.getElementById('countDisplay');
countSlider.addEventListener('input', () => { countDisplay.textContent = countSlider.value; });
countSlider.addEventListener('change', () => { if (state.originalPixels.length > 0) extractAndRender(); });

/**
 * 排序方式变化时重新排序
 */
document.getElementById('sortSelect').addEventListener('change', () => { if (state.colors.length > 0) sortAndRender(); });

/**
 * 生成配色卡按钮
 * 将提取的颜色渲染成一张可下载的图片卡片
 * 支持桌面端模态框和移动端简易弹窗两种展示方式
 */
document.getElementById('generatePaletteBtn').addEventListener('click', () => {
  if (!state.colors || state.colors.length === 0) {
    showToast('请先上传图片并提取色板');
    return;
  }

  const isMobile = window.innerWidth <= 600;

  /**
   * 绘制配色卡到 Canvas 并返回 DataURL
   * 包含标题、色条、颜色卡片（色块、HEX、中文名、占比）
   */
  function drawPaletteCard() {
    const dpr = isMobile ? 1 : 2;
    const width = isMobile ? 480 : 800;
    const colors = state.colors;
    const cols = isMobile ? Math.min(colors.length, 3) : Math.min(colors.length, 5);
    const rows = Math.ceil(colors.length / cols);
    const cardHeight = isMobile ? 75 : 100;
    const stripHeight = isMobile ? 50 : 80;
    const headerHeight = isMobile ? 70 : 65;
    const padding = isMobile ? 30 : 50;
    const height = isMobile ? (headerHeight + stripHeight + rows * cardHeight + padding) : 500;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 绘制背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // 绘制标题
    ctx.fillStyle = '#4f6479';
    ctx.font = `bold ${isMobile ? 22 : 28}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('Chromasense 配色卡', isMobile ? 20 : 40, isMobile ? 45 : 55);

    // 绘制顶部色条
    const stripY = headerHeight;
    const stripWidth = width - (isMobile ? 40 : 80);
    const colorWidth = stripWidth / colors.length;

    colors.forEach((color, index) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect((isMobile ? 20 : 40) + index * colorWidth, stripY, colorWidth, stripHeight);
    });

    // 绘制颜色卡片网格
    const cardWidth = (width - (isMobile ? 40 : 80)) / cols;
    const startY = stripY + stripHeight + (isMobile ? 20 : 50);

    colors.forEach((color, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = (isMobile ? 20 : 40) + col * cardWidth;
      const y = startY + row * cardHeight;
      const swatchSize = isMobile ? 36 : 50;

      // 色块
      ctx.fillStyle = color.hex;
      ctx.fillRect(x, y, swatchSize, swatchSize);

      // HEX 值
      ctx.fillStyle = '#4f6479';
      ctx.font = `bold ${isMobile ? 14 : 14}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(color.hex.toUpperCase(), x + swatchSize + 8, y + (isMobile ? 18 : 22));

      // 中文名
      ctx.fillStyle = '#614226';
      ctx.font = `${isMobile ? 13 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(color.name, x + swatchSize + 8, y + (isMobile ? 36 : 42));

      // 占比
      ctx.fillStyle = '#a3b4c4';
      ctx.font = `${isMobile ? 12 : 11}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(`占比 ${color.percentage}%`, x + swatchSize + 8, y + (isMobile ? 52 : 60));
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * 移动端简易弹窗
   * 使用内联样式，避免依赖 CSS 类
   */
  if (isMobile) {
    const overlay = document.createElement('div');
    overlay.id = 'mobilePaletteOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:12px;padding:16px;width:100%;max-width:360px;box-sizing:border-box;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;';
    const title = document.createElement('span');
    title.textContent = '配色卡预览';
    title.style.cssText = 'font-weight:700;font-size:16px;color:#614226;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'width:32px;height:32px;border-radius:50%;border:none;background:#f0f0f0;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;';
    header.appendChild(title);
    header.appendChild(closeBtn);

    const previewBox = document.createElement('div');
    previewBox.style.cssText = 'background:#f8f9fa;border-radius:8px;padding:8px;margin-bottom:12px;min-height:150px;display:flex;align-items:center;justify-content:center;';
    const loadingText = document.createElement('span');
    loadingText.textContent = '生成中...';
    loadingText.style.cssText = 'color:#888;font-size:14px;';
    previewBox.appendChild(loadingText);

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '关闭';
    cancelBtn.style.cssText = 'flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:14px;';
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '下载配色卡';
    downloadBtn.style.cssText = 'flex:1;padding:10px;border:none;border-radius:6px;background:#614226;color:#fff;cursor:pointer;font-size:14px;';
    actions.appendChild(cancelBtn);
    actions.appendChild(downloadBtn);

    modal.appendChild(header);
    modal.appendChild(previewBox);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let dataUrl = null;

    const closeModal = () => {
      const el = document.getElementById('mobilePaletteOverlay');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    downloadBtn.addEventListener('click', () => {
      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `chromasense-palette-${Date.now()}.png`;
        a.click();
      }
    });

    setTimeout(() => {
      try {
        dataUrl = drawPaletteCard();
        previewBox.innerHTML = '';
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = '配色卡';
        img.style.cssText = 'width:100%;height:auto;border-radius:4px;display:block;';
        previewBox.appendChild(img);
      } catch (err) {
        previewBox.innerHTML = '<span style="color:#c00;font-size:14px;">生成失败，请重试</span>';
      }
    }, 50);
  } else {
    /**
     * 桌面端模态框
     * 使用 CSS 类样式，支持更丰富的交互效果
     */
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'palette-modal-overlay';
    
    const modalContent = `
      <div class="palette-modal">
        <div class="palette-modal-header">
          <span class="palette-modal-title">配色卡预览</span>
          <button class="palette-modal-close" id="paletteModalClose">&times;</button>
        </div>
        <div class="palette-modal-preview">
          <img id="palettePreviewImg" alt="配色卡" style="width:100%;height:auto;border-radius:8px;">
        </div>
        <div class="palette-modal-actions">
          <button class="palette-modal-btn secondary" id="paletteModalCancel">关闭</button>
          <button class="palette-modal-btn primary" id="paletteModalDownload">
            <i class="fas fa-download"></i> 下载配色卡
          </button>
        </div>
      </div>
    `;
    
    modalOverlay.innerHTML = modalContent;
    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      try {
        if (modalOverlay && modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      } catch (e) {}
    };

    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) closeModal();
    };
    
    document.getElementById('paletteModalClose').onclick = closeModal;
    document.getElementById('paletteModalCancel').onclick = closeModal;

    let dataUrl = null;
    
    setTimeout(() => {
      dataUrl = drawPaletteCard();
      const img = document.getElementById('palettePreviewImg');
      if (img) img.src = dataUrl;
    }, 10);
    
    document.getElementById('paletteModalDownload').onclick = () => {
      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `chromasense-palette-${Date.now()}.png`;
        a.click();
      }
    };
  }
});

/**
 * 重新上传按钮
 * 清除状态，返回上传页面
 */
document.getElementById('reuploadBtn').addEventListener('click', () => {
  document.getElementById('resultSection').classList.remove('active');
  document.getElementById('uploadSection').style.display = '';
  fileInput.value = '';
  clearState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/**
 * 复制导出代码按钮
 * 将生成的 CSS 变量代码复制到剪贴板
 */
document.getElementById('exportCopyBtn').addEventListener('click', () => {
  copyText(document.getElementById('exportCode').textContent);
});

/**
 * 全局拖拽 - 在结果页时允许重新拖拽图片
 * 支持在分析结果页面直接拖入新图片
 */
document.body.addEventListener('dragover', (e) => e.preventDefault());
document.body.addEventListener('drop', (e) => {
  e.preventDefault();
  if (document.getElementById('resultSection').classList.contains('active')) {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImage(file);
  }
});