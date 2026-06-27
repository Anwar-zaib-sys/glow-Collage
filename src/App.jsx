import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  LayoutGrid, 
  Palette, 
  Type, 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Upload, 
  X, 
  Bold, 
  Italic, 
  Info,
  Maximize,
  RotateCw,
  Sliders,
  Image as ImageIcon,
  Clipboard
} from 'lucide-react';
import './App.css';

// Preset Grid Layouts
const LAYOUT_PRESETS = [
  // 2-column grids
  { id: '2x3', name: '2 x 3 Grid',    cols: 2, rows: 3, type: 'grid-2x3', count: 6 },
  { id: '2x4', name: '2 x 4 Grid',    cols: 2, rows: 4, type: 'grid-2x4', count: 8 },
  { id: '2x5', name: '2 x 5 Grid',    cols: 2, rows: 5, type: 'grid-2x5', count: 10 },
  // 3-column grids
  { id: '3x3', name: '3 x 3 Grid',    cols: 3, rows: 3, type: 'grid-3x3', count: 9 },
  { id: '3x4', name: '3 x 4 Grid',    cols: 3, rows: 4, type: 'grid-3x4', count: 12 },
  // 4-column grids
  { id: '4x3', name: '4 x 3 Grid',    cols: 4, rows: 3, type: 'grid-4x3', count: 12 },
];

// ─────────────────────────────────────────────────────────
// CUSTOM ASYMMETRIC LAYOUTS
// ─────────────────────────────────────────────────────────
const CUSTOM_LAYOUTS = [
  { id: 'featured-left',  name: 'Featured Left',  previewClass: 'prev-featured-left',  slots: 3 },
  { id: 'featured-right', name: 'Featured Right', previewClass: 'prev-featured-right', slots: 3 },
  { id: 'featured-top',   name: 'Featured Top',   previewClass: 'prev-featured-top',   slots: 4 },
  { id: 'magazine-5',     name: 'Magazine 5',     previewClass: 'prev-magazine-5',     slots: 5 },
  { id: 'magazine-6',     name: 'Magazine 6',     previewClass: 'prev-magazine-6',     slots: 6 },
  { id: 'mosaic-7',       name: 'Mosaic 7',       previewClass: 'prev-mosaic-7',       slots: 7 },
];

/**
 * Compute cell geometry for a given custom layout ID.
 * Returns an array of { index, x, y, w, h } objects.
 */
const computeCustomGeo = (layoutId, pad, gp, W, aspectRatio = 1.0) => {
  // Helper: row height from a column width
  const rowH = (colW) => colW / aspectRatio;

  // Available inner width/height
  const innerW = W - 2 * pad;

  switch (layoutId) {
    case 'featured-left': {
      // Left: 1 large cell spanning full height
      // Right: 2 cells stacked vertically
      const bigW = innerW * 0.6 - gp / 2;
      const smW  = innerW * 0.4 - gp / 2;
      const totalH = 2 * rowH(smW) + gp;
      return [
        { index: 0, x: pad,          y: pad,             w: bigW, h: totalH },
        { index: 1, x: pad + bigW + gp, y: pad,          w: smW,  h: rowH(smW) },
        { index: 2, x: pad + bigW + gp, y: pad + rowH(smW) + gp, w: smW, h: rowH(smW) },
      ];
    }

    case 'featured-right': {
      // Left: 2 cells stacked vertically
      // Right: 1 large cell spanning full height
      const smW  = innerW * 0.4 - gp / 2;
      const bigW = innerW * 0.6 - gp / 2;
      const totalH = 2 * rowH(smW) + gp;
      return [
        { index: 0, x: pad,            y: pad,            w: smW,  h: rowH(smW) },
        { index: 1, x: pad,            y: pad + rowH(smW) + gp, w: smW, h: rowH(smW) },
        { index: 2, x: pad + smW + gp, y: pad,            w: bigW, h: totalH },
      ];
    }

    case 'featured-top': {
      // Top: 1 wide cell spanning full width
      // Bottom: 3 equal cells side by side
      const topH  = rowH(innerW * 0.5);
      const smW   = (innerW - 2 * gp) / 3;
      const smH   = rowH(smW);
      return [
        { index: 0, x: pad,                    y: pad,              w: innerW, h: topH },
        { index: 1, x: pad,                    y: pad + topH + gp,  w: smW,    h: smH },
        { index: 2, x: pad + smW + gp,         y: pad + topH + gp,  w: smW,    h: smH },
        { index: 3, x: pad + 2 * (smW + gp),  y: pad + topH + gp,  w: smW,    h: smH },
      ];
    }

    case 'magazine-5': {
      // Row 0: 2 equal cells
      // Row 1: 3 equal cells
      const w2 = (innerW - gp) / 2;
      const h2 = rowH(w2);
      const w3 = (innerW - 2 * gp) / 3;
      const h3 = rowH(w3);
      return [
        { index: 0, x: pad,            y: pad,        w: w2, h: h2 },
        { index: 1, x: pad + w2 + gp,  y: pad,        w: w2, h: h2 },
        { index: 2, x: pad,            y: pad + h2 + gp, w: w3, h: h3 },
        { index: 3, x: pad + w3 + gp,  y: pad + h2 + gp, w: w3, h: h3 },
        { index: 4, x: pad + 2 * (w3 + gp), y: pad + h2 + gp, w: w3, h: h3 },
      ];
    }

    case 'magazine-6': {
      // Left column: 1 tall cell spanning 2 rows
      // Right area: 2 rows × 2 cells each
      const bigW = innerW * 0.45 - gp / 2;
      const smW  = (innerW * 0.55 - gp * 1.5) / 2;
      const smH  = rowH(smW);
      const bigH = 2 * smH + gp;
      return [
        { index: 0, x: pad,                    y: pad,              w: bigW, h: bigH },
        { index: 1, x: pad + bigW + gp,        y: pad,              w: smW,  h: smH },
        { index: 2, x: pad + bigW + gp + smW + gp, y: pad,          w: smW,  h: smH },
        { index: 3, x: pad + bigW + gp,        y: pad + smH + gp,   w: smW,  h: smH },
        { index: 4, x: pad + bigW + gp + smW + gp, y: pad + smH + gp, w: smW, h: smH },
        { index: 5, x: pad,                    y: pad + bigH + gp,  w: innerW, h: rowH(innerW * 0.4) },
      ];
    }

    case 'mosaic-7': {
      // Top row: 1 big + 1 medium
      // Middle row: 3 equal
      // Bottom row: 2 equal wide
      const bigW   = innerW * 0.55 - gp / 2;
      const medW   = innerW * 0.45 - gp / 2;
      const bigH   = rowH(bigW * 0.85);
      const w3     = (innerW - 2 * gp) / 3;
      const h3     = rowH(w3);
      const w2     = (innerW - gp) / 2;
      const h2     = rowH(w2 * 0.8);
      return [
        { index: 0, x: pad,                   y: pad,              w: bigW, h: bigH },
        { index: 1, x: pad + bigW + gp,       y: pad,              w: medW, h: bigH },
        { index: 2, x: pad,                   y: pad + bigH + gp,  w: w3,   h: h3 },
        { index: 3, x: pad + w3 + gp,         y: pad + bigH + gp,  w: w3,   h: h3 },
        { index: 4, x: pad + 2 * (w3 + gp),  y: pad + bigH + gp,  w: w3,   h: h3 },
        { index: 5, x: pad,                   y: pad + bigH + h3 + 2 * gp, w: w2, h: h2 },
        { index: 6, x: pad + w2 + gp,         y: pad + bigH + h3 + 2 * gp, w: w2, h: h2 },
      ];
    }

    default:
      return [];
  }
};

/**
 * Compute the canvas height for a custom layout.
 */
const computeCustomCanvasHeight = (layoutId, pad, gp, W, aspectRatio) => {
  const cells = computeCustomGeo(layoutId, pad, gp, W, aspectRatio);
  if (!cells.length) return W; // fallback square
  const maxBottom = cells.reduce((mx, c) => Math.max(mx, c.y + c.h), 0);
  return Math.round(maxBottom + pad);
};

const CUSTOM_LAYOUT_IDS = CUSTOM_LAYOUTS.map(l => l.id);

// Special Layout — fixed canvas dimensions + custom geometry
// 8 photo slots (indices 0-7) arranged around a centre hero panel
// Slot map:
//   0  1  2        ← top row (3 photos)
//   3  [C]  4      ← middle row sides (center = hero card)
//   5  6  7        ← bottom row (3 photos)
// Text zones: topBanner, centerHeroTitle/subtitle/urdu, bottomLeft, bottomRight
const SPECIAL_CANVAS_W = 1200;
const SPECIAL_CANVAS_H = 960;

// Compute geometry for the special layout given padding & gap
const computeSpecialGeometry = (pad, gp, aspectRatio = 1.42) => {
  const topBannerH = 75; // slightly taller for better text spacing
  // 4 columns of equal width internally
  // Total horizontal gaps: 3 gaps
  const colW = (SPECIAL_CANVAS_W - 2 * pad - 3 * gp) / 4;
  // Calculate row height dynamically based on cell aspect ratio
  const rowH = colW / aspectRatio;

  const y0 = pad; // top banner y
  const y1 = y0 + topBannerH + gp; // Row 0 y
  const y2 = y1 + rowH + gp;       // Row 1 y
  const y3 = y2 + rowH + gp;       // Row 2 y
  const y4 = y3 + rowH + gp;       // Row 3 (very bottom row) y

  // Column x positions (4 equal columns)
  const x0 = pad;
  const x1 = x0 + colW + gp;
  const x2 = x1 + colW + gp;
  const x3 = x2 + colW + gp;

  const centerW = colW * 2 + gp; // width spanning 2 center columns

  // Hero nested photo card padding
  const cardPad = 14;

  const cleanCells = [
    // Row 0: 4 slots
    { index: 0, x: x0, y: y1, w: colW, h: rowH },
    { index: 1, x: x1, y: y1, w: colW, h: rowH },
    { index: 2, x: x2, y: y1, w: colW, h: rowH },
    { index: 3, x: x3, y: y1, w: colW, h: rowH },

    // Row 1: 2 slots (left & right side of Hero text)
    { index: 4, x: x0, y: y2, w: colW, h: rowH },
    { index: 5, x: x3, y: y2, w: colW, h: rowH },

    // Row 2: 3 slots: left, hero building photo, right
    { index: 6, x: x0, y: y3, w: colW, h: rowH },
    { 
      index: 8, 
      x: x1 + cardPad, 
      y: y3 + cardPad / 2, 
      w: centerW - cardPad * 2, 
      h: rowH - cardPad * 1.5 
    },
    { index: 7, x: x3, y: y3, w: colW, h: rowH },

    // Row 3: 1 slot in the center (tractor photo)
    { index: 9, x: x1, y: y4, w: centerW, h: rowH }
  ];

  // Hero card container (covers Row 1 & Row 2 center, i.e., height rowH * 2 + gp)
  const hero = { x: x1, y: y2, w: centerW, h: rowH * 2 + gp };
  
  // Top banner
  const banner = { x: pad, y: y0, w: SPECIAL_CANVAS_W - 2 * pad, h: topBannerH };
  
  // Bottom text zones (in Row 3)
  const botLeft  = { x: x0, y: y4, w: colW, h: rowH };
  const botRight = { x: x3, y: y4, w: colW, h: rowH };

  return { cells: cleanCells, hero, banner, botLeft, botRight, rowH, topBannerH, yBot: y4 };
};

const SPECIAL_LAYOUT_ID = 'special-collage';


// Preset Background Colors & Gradients (Main Canvas Background)
const BG_PRESETS = [
  { name: 'Pure White', value: '#ffffff', type: 'solid' },
  { name: 'Classic Black', value: '#111111', type: 'solid' },
  { name: 'Retro Cream', value: '#faf7f0', type: 'solid' },
  { name: 'Warm Peach', value: '#ffebee', type: 'solid' },
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', type: 'gradient', colors: ['#f6d365', '#fda085'] },
  { name: 'Neon Indigo', value: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', type: 'gradient', colors: ['#6a11cb', '#2575fc'] },
  { name: 'Cotton Candy', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', type: 'gradient', colors: ['#ff9a9e', '#fecfef'] },
  { name: 'Mystic Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', type: 'gradient', colors: ['#11998e', '#38ef7d'] },
  { name: 'Royal Velvet', value: 'linear-gradient(135deg, #b12c6c 0%, #31115c 100%)', type: 'gradient', colors: ['#b12c6c', '#31115c'] }
];

// Available Google Fonts for Text Overlay
const AVAILABLE_FONTS = [
  { name: 'Outfit (Sleek Sans)', family: 'Outfit' },
  { name: 'Montserrat (Geometric)', family: 'Montserrat' },
  { name: 'Playfair (Elegant Serif)', family: 'Playfair Display' },
  { name: 'Pacifico (Cute Script)', family: 'Pacifico' },
  { name: 'Caveat (Handwritten)', family: 'Caveat' },
  { name: 'Anton (Heavy Impact)', family: 'Anton' },
  { name: 'Permanent Marker', family: 'Permanent Marker' }
];

// Text Styling Color Presets (Solid Colors for Presets Swatches)
const TEXT_COLOR_PRESETS = [
  '#ffffff', '#e2e8f0', '#94a3b8', '#475569', '#0f172a',
  '#ffebd6', '#fca5a5', '#f87171', '#ef4444', '#38bdf8', '#8b5cf6', '#10b981'
];

// Gradient presets for Text Fill, Background, and Border
const GRADIENT_PRESETS = [
  { name: 'Sunset Glow', colors: ['#f6d365', '#fda085'] },
  { name: 'Blue Sky', colors: ['#ffffff', '#38bdf8'] },
  { name: 'Ocean Wave', colors: ['#3b82f6', '#10b981'] },
  { name: 'Cotton Candy', colors: ['#ff9a9e', '#fecfef'] },
  { name: 'Purple Night', colors: ['#7c3aed', '#db2777'] },
  { name: 'Lime Zest', colors: ['#a8ff78', '#78ffd6'] }
];

const CANVAS_WIDTH = 1200; // Fixed width for editing resolution

// Theme helpers
const THEMES = [
  { id: 'dark',      label: '🌙',  title: 'Dark Mode' },
  { id: 'solarized', label: '☀️', title: 'Solarized Mode' },
  { id: 'light',     label: '🔆', title: 'Light Mode' }
];

function App() {
 // Theme 
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gc-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gc-theme', theme);
  }, [theme]);

 // Export Resolution Panel 
  const [exportPanelOpen, setExportPanelOpen] = useState(false);

  // Sidebar Tabs
  const [activeTab, setActiveTab] = useState('layout'); // 'layout' | 'design' | 'text' | 'image'
  const [textEditTab, setTextEditTab] = useState('TEXT'); // Sub-tab for Text overlay configurations: 'TEXT' | 'BACKGROUND' | 'BORDER'

  // Canvas States
  const [layout, setLayout] = useState('2x4');
  const [cellAspectRatio, setCellAspectRatio] = useState(1.0); // 1.0 = Square, 0.75 = Portrait 3:4, 1.33 = Landscape 4:3
  const [padding, setPadding] = useState(25);
  const [gap, setGap] = useState(16);
  const [borderRadius, setBorderRadius] = useState(10);
  
  // Background configuration
  const [bgType, setBgType] = useState('preset'); // 'preset' | 'custom-solid' | 'custom-gradient'
  const [bgPresetIndex, setBgPresetIndex] = useState(0); // Default to Pure White
  const [customSolidBg, setCustomSolidBg] = useState('#1e293b');
  const [customGradA, setCustomGradA] = useState('#7c3aed');
  const [customGradB, setCustomGradB] = useState('#db2777');

  // Images state decoupled: 
  // uploadedImages: { [imageId]: { imgElement, src, name } }
  // slots: { [slotIndex]: { imageId, scale, xOffset, yOffset, rotation } }
  const [uploadedImages, setUploadedImages] = useState({});
  const [slots, setSlots] = useState({});
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);

  // Text Overlays State
  const [texts, setTexts] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);

  // Special layout built-in text zones
  const [specialTexts, setSpecialTexts] = useState({
    banner:   'Your City Name, District / Region',
    heroTitle: 'CITY NAME',
    heroSub:   'CLEAN CITY • GREEN CITY • HEALTHY CITY',
    heroUrdu:  'میرا شہر، میری ذمہ داری',
    bottomLeft: 'WORKING FOR A BETTER CITY\n✓ Regular Road Cleaning\n✓ Waste Collection & Disposal\n✓ Efficient Waste Management\n✓ Chlorine Spraying\n✓ Ditch & Verge Cleaning',
    bottomRight: 'میرا شہر\nمیری ذمہ داری\nKEEP YOUR CITY\nCLEAN & GREEN',
  });

  // Interaction / Drag-Pan-Zoom Tracker
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isResizingText, setIsResizingText] = useState(false);
  const [resizeHandleName, setResizeHandleName] = useState(null); // 'TL' | 'TR' | 'BL' | 'BR'
  
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageStartOffset, setImageStartOffset] = useState({ dx: 0, dy: 0 });
  const [textStartPos, setTextStartPos] = useState({ x: 0.5, y: 0.5 });
  const [resizeStartFontSize, setResizeStartFontSize] = useState(36);
  const [resizeStartMouseDist, setResizeStartMouseDist] = useState(0);

  const [hoveredSlotIndex, setHoveredSlotIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [exportResolution, setExportResolution] = useState(2); // Export multiplier: 1x, 2x, 3x

  // Refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Layout configuration details
  const isSpecialLayout = layout === SPECIAL_LAYOUT_ID;
  const isCustomLayout = CUSTOM_LAYOUT_IDS.includes(layout);
  const isGridLayout = !isSpecialLayout && !isCustomLayout;
  const activeLayoutConfig = LAYOUT_PRESETS.find(l => l.id === layout) || LAYOUT_PRESETS[1];
  const { cols, rows } = isGridLayout ? activeLayoutConfig : { cols: 3, rows: 3 };

  // Custom layout geometry
  const customCells = isCustomLayout
    ? computeCustomGeo(layout, padding, gap, CANVAS_WIDTH, cellAspectRatio)
    : [];
  const maxSlots = isSpecialLayout ? 10 : isCustomLayout ? customCells.length : cols * rows;

  // Special layout geometry (memoized on pad/gap change)
  const specialGeo = isSpecialLayout ? computeSpecialGeometry(padding, gap, cellAspectRatio) : null;

  // Compute cell dims & canvas height dynamically
  const cellWidth = isGridLayout ? (CANVAS_WIDTH - 2 * padding - (cols - 1) * gap) / cols : 0;
  const cellHeight = isGridLayout ? cellWidth / cellAspectRatio : 0;
  const canvasHeight = isSpecialLayout
    ? (specialGeo ? Math.round(specialGeo.topBannerH + 4 * specialGeo.rowH + 2 * padding + 4 * gap) : SPECIAL_CANVAS_H)
    : isCustomLayout
      ? computeCustomCanvasHeight(layout, padding, gap, CANVAS_WIDTH, cellAspectRatio)
      : Math.round(2 * padding + rows * cellHeight + (rows - 1) * gap);

  // Array of computed cells coordinates for rendering & hit testing
  const computedCells = isSpecialLayout
    ? (specialGeo ? specialGeo.cells : [])
    : isCustomLayout
      ? customCells
      : (() => {
          const cells = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const idx = r * cols + c;
              cells.push({
                index: idx,
                x: padding + c * (cellWidth + gap),
                y: padding + r * (cellHeight + gap),
                w: cellWidth,
                h: cellHeight
              });
            }
          }
          return cells;
        })();


  // Handle Delete key for selected texts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedTextId) {
        // Ignore if user is editing inside a text input or textarea
        if (
          document.activeElement.tagName === 'INPUT' || 
          document.activeElement.tagName === 'TEXTAREA' || 
          document.activeElement.isContentEditable
        ) {
          return;
        }
        
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          deleteSelectedText();
          showToast('Text overlay deleted. Ã°Å¸â€”â€˜Ã¯Â¸Â');
          showToast('Text overlay deleted. 🗑️');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextId, texts]);

  // Draw Canvas Helper
  const drawCanvasOnContext = (ctx, isExporting = false, scaleFactor = 1) => {
    const w = CANVAS_WIDTH * scaleFactor;
    const h = canvasHeight * scaleFactor;
    const pad = padding * scaleFactor;
    const gp = gap * scaleFactor;
    const rad = borderRadius * scaleFactor;
    const cWidth = isGridLayout ? (w - 2 * pad - (cols - 1) * gp) / cols : 0;
    const cHeight = isGridLayout ? cWidth / cellAspectRatio : 0;

    // 1. Draw Background
    let fillStyle;
    if (bgType === 'preset') {
      const preset = BG_PRESETS[bgPresetIndex];
      if (preset.type === 'solid') {
        fillStyle = preset.value;
      } else {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, preset.colors[0]);
        grad.addColorStop(1, preset.colors[1]);
        fillStyle = grad;
      }
    } else if (bgType === 'custom-solid') {
      fillStyle = customSolidBg;
    } else {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, customGradA);
      grad.addColorStop(1, customGradB);
      fillStyle = grad;
    }
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, w, h);

    // ─────────────────────────────────────────────────────────
    // SPECIAL LAYOUT BRANCH
    // ─────────────────────────────────────────────────────────
    if (isSpecialLayout && specialGeo) {
      const sf = scaleFactor;
      const geo = computeSpecialGeometry(padding * sf, gap * sf, cellAspectRatio);
      const cellRad = borderRadius * sf;

      // Helper: draw one photo cell
      const drawPhotoCell = (cell, index) => {
        const { x, y, w: cw, h: ch } = cell;
        ctx.save();
        drawRoundedRectPath(ctx, x, y, cw, ch, cellRad);
        ctx.clip();
        ctx.fillStyle = '#e8edf5';
        ctx.fillRect(x, y, cw, ch);

        const slotState = slots[index];
        const imageInfo = slotState?.imageId ? uploadedImages[slotState.imageId] : null;

        if (imageInfo && imageInfo.imgElement) {
          const img = imageInfo.imgElement;
          const coverScale = Math.max(cw / img.width, ch / img.height);
          const finalScale = coverScale * (slotState.scale || 1.0);
          const cx = x + cw / 2;
          const cy = y + ch / 2;
          ctx.save();
          ctx.translate(cx + (slotState.xOffset || 0) * sf, cy + (slotState.yOffset || 0) * sf);
          ctx.rotate(((slotState.rotation || 0) * Math.PI) / 180);
          ctx.drawImage(img, -img.width * finalScale / 2, -img.height * finalScale / 2, img.width * finalScale, img.height * finalScale);
          ctx.restore();
        } else if (!isExporting) {
          const isHov = hoveredSlotIndex === index;
          ctx.strokeStyle = isHov ? '#8b5cf6' : 'rgba(0,0,0,0.12)';
          ctx.lineWidth = 2 * sf;
          ctx.setLineDash([6 * sf, 6 * sf]);
          ctx.strokeRect(x + 4 * sf, y + 4 * sf, cw - 8 * sf, ch - 8 * sf);
          ctx.setLineDash([]);
          const cx = x + cw / 2;
          const cy = y + ch / 2;
          ctx.strokeStyle = isHov ? '#8b5cf6' : 'rgba(0,0,0,0.18)';
          ctx.lineWidth = 2.5 * sf;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - 12 * sf, cy); ctx.lineTo(cx + 12 * sf, cy);
          ctx.moveTo(cx, cy - 12 * sf); ctx.lineTo(cx, cy + 12 * sf);
          ctx.stroke();
          ctx.fillStyle = isHov ? '#8b5cf6' : 'rgba(0,0,0,0.38)';
          ctx.font = `600 ${Math.max(10, 11 * sf)}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Click to upload', cx, cy + 24 * sf);
        }
        ctx.restore();

        // Active outline
        if (!isExporting && activeSlotIndex === index) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 4 * sf;
          ctx.strokeRect(x + 2 * sf, y + 2 * sf, cw - 4 * sf, ch - 4 * sf);
        }
      };

      // Helper to draw decorative leaf
      const drawLeaf = (cx, cy, size, angle, color = '#2d7a3a') => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size / 2, -size / 3, size, 0);
        ctx.quadraticCurveTo(size / 2, size / 3, 0, 0);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      };

      // Draw all photo slots except cell 8 (which is inside the hero card and needs to be drawn on top of the hero background)
      geo.cells.filter(cell => cell.index !== 8).forEach(cell => drawPhotoCell(cell, cell.index));

      // ── Top Banner ──
      const bn = geo.banner;
      ctx.save();
      // Green gradient banner
      const bannerGrad = ctx.createLinearGradient(bn.x, bn.y, bn.x, bn.y + bn.h);
      bannerGrad.addColorStop(0, '#1b6c2a');
      bannerGrad.addColorStop(1, '#0e4a1c');
      ctx.fillStyle = bannerGrad;
      drawRoundedRectPath(ctx, bn.x, bn.y, bn.w, bn.h, cellRad);
      ctx.fill();
      // Leafy texture stripe
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(bn.x, bn.y, bn.w, bn.h * 0.45);
      // Banner text
      ctx.fillStyle = '#ffffff';
      const bannerFontSize = Math.max(18, Math.min(32, bn.h * 0.42)) * sf;
      ctx.font = `700 ${bannerFontSize}px "Montserrat", "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4 * sf;
      ctx.fillText(specialTexts.banner, bn.x + bn.w / 2, bn.y + bn.h / 2);
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Hero Card (center) ──
      const hr = geo.hero;
      ctx.save();
      // White background with subtle rounded border
      drawRoundedRectPath(ctx, hr.x, hr.y, hr.w, hr.h, cellRad * 1.5);
      ctx.fillStyle = '#ffffff'; // Solid white
      ctx.fill();
      // Thin green border
      ctx.strokeStyle = '#2d7a3a';
      ctx.lineWidth = 3 * sf;
      ctx.stroke();
      ctx.restore();

      // ── Draw Photo Cell 8 (center building photo) ──
      const cell8 = geo.cells.find(c => c.index === 8);
      if (cell8) {
        drawPhotoCell(cell8, 8);
      }

      // ── Leaf Ornaments ──
      // Top-right of Center Card
      drawLeaf(hr.x + hr.w - 5 * sf, hr.y - 5 * sf, 22 * sf, -35, '#2d7a3a');
      drawLeaf(hr.x + hr.w - 8 * sf, hr.y - 2 * sf, 16 * sf, -75, '#47a058');

      // Bottom-left corner of canvas
      drawLeaf(20 * sf, h - 20 * sf, 55 * sf, -45, 'rgba(45, 122, 58, 0.45)');
      drawLeaf(32 * sf, h - 12 * sf, 42 * sf, -75, 'rgba(71, 160, 88, 0.45)');
      drawLeaf(12 * sf, h - 32 * sf, 38 * sf, -15, 'rgba(27, 108, 42, 0.45)');

      // Bottom-right corner of canvas
      drawLeaf(w - 20 * sf, h - 20 * sf, 55 * sf, -135, 'rgba(45, 122, 58, 0.45)');
      drawLeaf(w - 32 * sf, h - 12 * sf, 42 * sf, -105, 'rgba(71, 160, 88, 0.45)');
      drawLeaf(w - 12 * sf, h - 32 * sf, 38 * sf, -165, 'rgba(27, 108, 42, 0.45)');

      // ── Hero Text (in top half) ──
      // Hero title (large, bold, green)
      ctx.save();
      const heroTitleSize = Math.max(24, Math.min(52, hr.w * 0.16)) * sf;
      ctx.font = `900 ${heroTitleSize}px "Outfit", "Montserrat", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1a5c28';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 3 * sf;
      const titleY = hr.y + geo.rowH * 0.35;
      ctx.fillText(specialTexts.heroTitle, hr.x + hr.w / 2, titleY);
      ctx.shadowBlur = 0;

      // Hero tagline green pill
      const heroSubSize = Math.max(8, Math.min(14, hr.w * 0.045)) * sf;
      ctx.font = `700 ${heroSubSize}px "Montserrat", "Outfit", sans-serif`;
      const textW = ctx.measureText(specialTexts.heroSub).width;
      const pillW = textW + 24 * sf;
      const pillH = heroSubSize * 2.0;
      const pillY = hr.y + geo.rowH * 0.58;

      ctx.fillStyle = '#1a5c28'; // solid dark green
      drawRoundedRectPath(ctx, hr.x + (hr.w - pillW) / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
      ctx.fill();

      // Tagline text inside pill
      ctx.fillStyle = '#ffffff';
      ctx.fillText(specialTexts.heroSub, hr.x + hr.w / 2, pillY);

      // Hero Urdu text
      const heroUrduSize = Math.max(12, Math.min(22, hr.w * 0.065)) * sf;
      ctx.font = `600 ${heroUrduSize}px "Noto Nastaliq Urdu", "Amiri", serif`;
      ctx.fillStyle = '#1a5c28';
      ctx.direction = 'rtl';
      ctx.fillText(specialTexts.heroUrdu, hr.x + hr.w / 2, hr.y + geo.rowH * 0.8);
      ctx.direction = 'ltr';
      ctx.restore();

      // ── Bottom-Left Text Zone ──
      const bl = geo.botLeft;
      ctx.save();
      drawRoundedRectPath(ctx, bl.x, bl.y, bl.w, bl.h, cellRad);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#2d7a3a';
      ctx.lineWidth = 1.5 * sf;
      ctx.stroke();
      
      // Text inside
      const blLines = specialTexts.bottomLeft.split('\n');
      const blFontSize = Math.max(10, Math.min(15, bl.h / (blLines.length + 1) * 0.8)) * sf;
      ctx.font = `600 ${blFontSize}px "Outfit", sans-serif`;
      ctx.fillStyle = '#1a3a1a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const blLineH = bl.h / (blLines.length + 1);
      
      blLines.forEach((line, i) => {
        if (i === 0) {
          // Title
          ctx.font = `800 ${blFontSize * 1.15}px "Montserrat", "Outfit", sans-serif`;
          ctx.fillStyle = '#1a5c28';
          ctx.fillText(line, bl.x + 18 * sf, bl.y + blLineH * 0.65);
        } else {
          // Items
          ctx.font = `600 ${blFontSize}px "Outfit", sans-serif`;
          ctx.fillStyle = '#2d6e3a';
          if (line.trim().startsWith('✓') || line.trim().startsWith('✔')) {
            ctx.fillStyle = '#10b981'; // bright green checkmark
            ctx.font = `800 ${blFontSize * 1.1}px "Outfit", sans-serif`;
            ctx.fillText('✔', bl.x + 18 * sf, bl.y + blLineH * (i + 0.65));
            ctx.fillStyle = '#1a3a1a';
            ctx.font = `600 ${blFontSize}px "Outfit", sans-serif`;
            // Strip the symbol and leading space
            const rawText = line.replace(/^[✓✔]/, '').trim();
            ctx.fillText(rawText, bl.x + 34 * sf, bl.y + blLineH * (i + 0.65));
          } else {
            ctx.fillText(line, bl.x + 18 * sf, bl.y + blLineH * (i + 0.65));
          }
        }
      });
      ctx.restore();

      // ── Bottom-Right Text Zone ──
      const br = geo.botRight;
      ctx.save();
      drawRoundedRectPath(ctx, br.x, br.y, br.w, br.h, cellRad);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#2d7a3a';
      ctx.lineWidth = 1.5 * sf;
      ctx.stroke();

      // Parse lines
      const brLines = specialTexts.bottomRight.split('\n');
      const urduLines = brLines.filter(line => /[\u0600-\u06FF]/.test(line));
      const engLines = brLines.filter(line => !/[\u0600-\u06FF]/.test(line));
      const brFontSize = Math.max(9, Math.min(15, br.h * 0.09)) * sf;

      // Draw Eco Icon on the left-center of the upper section
      const iconX = br.x + br.w * 0.28;
      const iconY = br.y + br.h * 0.36;
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 2.5 * sf;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Draw Bin (trapezoid outline)
      ctx.beginPath();
      ctx.moveTo(iconX + 12 * sf, iconY + 5 * sf);
      ctx.lineTo(iconX + 10 * sf, iconY + 18 * sf);
      ctx.lineTo(iconX + 18 * sf, iconY + 18 * sf);
      ctx.lineTo(iconX + 16 * sf, iconY + 5 * sf);
      ctx.closePath();
      ctx.stroke();

      // 2. Draw Stick Figure
      // Head
      ctx.beginPath();
      ctx.arc(iconX - 8 * sf, iconY - 8 * sf, 3.5 * sf, 0, Math.PI * 2);
      ctx.fill();
      // Body spine
      ctx.beginPath();
      ctx.moveTo(iconX - 8 * sf, iconY - 4.5 * sf);
      ctx.lineTo(iconX - 8 * sf, iconY + 6 * sf);
      ctx.stroke();
      // Leg 1
      ctx.beginPath();
      ctx.moveTo(iconX - 8 * sf, iconY + 6 * sf);
      ctx.lineTo(iconX - 12 * sf, iconY + 18 * sf);
      ctx.stroke();
      // Leg 2
      ctx.beginPath();
      ctx.moveTo(iconX - 8 * sf, iconY + 6 * sf);
      ctx.lineTo(iconX - 6 * sf, iconY + 18 * sf);
      ctx.stroke();
      // Arm holding trash
      ctx.beginPath();
      ctx.moveTo(iconX - 8 * sf, iconY - 1 * sf);
      ctx.lineTo(iconX - 1 * sf, iconY - 5 * sf);
      ctx.lineTo(iconX + 4 * sf, iconY + 1 * sf);
      ctx.stroke();
      // Trash dot
      ctx.beginPath();
      ctx.arc(iconX + 7 * sf, iconY + 1 * sf, 1.5 * sf, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Urdu Text on the right-center of the upper section
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const urduFontSize = brFontSize * 1.35;
      ctx.font = `700 ${urduFontSize}px "Noto Nastaliq Urdu", "Amiri", serif`;
      ctx.fillStyle = '#1a5c28';
      ctx.direction = 'rtl';
      
      const urduY1 = br.y + br.h * 0.22;
      const urduY2 = br.y + br.h * 0.48;
      if (urduLines[0]) ctx.fillText(urduLines[0], br.x + br.w * 0.88, urduY1);
      if (urduLines[1]) ctx.fillText(urduLines[1], br.x + br.w * 0.88, urduY2);
      ctx.restore();

      // Draw English text at the bottom
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const engFontSize = brFontSize * 1.05;
      ctx.font = `800 ${engFontSize}px "Outfit", "Montserrat", sans-serif`;
      ctx.fillStyle = '#0d2e0d';
      
      const engLineH = engFontSize * 1.25;
      const engStartY = br.y + br.h * 0.76;
      engLines.forEach((line, idx) => {
        ctx.fillText(line, br.x + br.w / 2, engStartY + idx * engLineH);
      });
      ctx.restore();

      ctx.restore();

      // ── Free-floating text overlays (same as normal) ──
      texts.forEach(txt => {
        ctx.save();
        const tx = txt.x * w;
        const ty = txt.y * h;
        const scaledFontSize = txt.fontSize * sf;
        ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${scaledFontSize}px "${txt.fontFamily}", Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = txt.text.split('\n');
        const lineH = scaledFontSize * 1.25;
        let maxW = 0;
        lines.forEach(l => { const lw = ctx.measureText(l).width; if (lw > maxW) maxW = lw; });
        const blockH = lines.length * lineH;
        ctx.translate(tx, ty);
        ctx.rotate((txt.rotation * Math.PI) / 180);
        ctx.globalAlpha = (txt.opacity ?? 100) / 100;
        if (txt.bgEnabled) {
          ctx.save();
          ctx.globalAlpha = ((txt.bgOpacity ?? 80) / 100) * ((txt.opacity ?? 100) / 100);
          const padAmt = (txt.padding || 10) * sf;
          const bRad = (txt.borderRadius || 8) * sf;
          const boxW = maxW + padAmt * 2; const boxH2 = blockH + padAmt * 2;
          let bgSt = txt.bgType === 'gradient'
            ? (() => { const g = ctx.createLinearGradient(-boxW/2,-boxH2/2,boxW/2,boxH2/2); g.addColorStop(0,txt.bgGradA||'#7c3aed'); g.addColorStop(1,txt.bgGradB||'#db2777'); return g; })()
            : (txt.backgroundColor || '#000000');
          ctx.fillStyle = bgSt;
          drawRoundedRectPath(ctx, -boxW/2, -boxH2/2, boxW, boxH2, bRad);
          ctx.fill();
          ctx.restore();
        }
        if (txt.shadow) { ctx.shadowColor='rgba(0,0,0,0.45)'; ctx.shadowBlur=8*sf; ctx.shadowOffsetX=3*sf; ctx.shadowOffsetY=3*sf; }
        let fst = txt.fillType === 'gradient'
          ? (() => { const g = ctx.createLinearGradient(0,-blockH/2,0,blockH/2); g.addColorStop(0,txt.colorGradA||'#fff'); g.addColorStop(1,txt.colorGradB||'#38bdf8'); return g; })()
          : (txt.color || '#ffffff');
        const sw = txt.strokeWidth ?? 0;
        if (sw > 0) {
          ctx.save();
          ctx.globalAlpha = ((txt.strokeOpacity??100)/100)*((txt.opacity??100)/100);
          ctx.strokeStyle = txt.strokeType === 'gradient'
            ? (() => { const g = ctx.createLinearGradient(0,-blockH/2,0,blockH/2); g.addColorStop(0,txt.strokeGradA||'#000'); g.addColorStop(1,txt.strokeGradB||'#333'); return g; })()
            : (txt.strokeColor || '#000000');
          ctx.lineWidth = sw * sf; ctx.lineJoin = 'round';
          lines.forEach((line, i) => { ctx.strokeText(line, 0, -blockH/2+i*lineH+lineH/2); });
          ctx.restore();
        }
        ctx.fillStyle = fst;
        lines.forEach((line, i) => ctx.fillText(line, 0, -blockH/2+i*lineH+lineH/2));
        if (!isExporting && selectedTextId === txt.id) {
          ctx.save();
          ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
          ctx.globalAlpha=1;
          const padAmt=(txt.padding||10)*sf; const boxW=maxW+padAmt*2; const boxH2=blockH+padAmt*2;
          ctx.strokeStyle='#8b5cf6'; ctx.lineWidth=2*sf; ctx.setLineDash([5*sf,5*sf]);
          ctx.strokeRect(-boxW/2,-boxH2/2,boxW,boxH2); ctx.setLineDash([]);
          ctx.fillStyle='#ffffff'; ctx.strokeStyle='#8b5cf6'; ctx.lineWidth=2*sf;
          const hs=8*sf;
          [[-boxW/2,-boxH2/2],[boxW/2,-boxH2/2],[-boxW/2,boxH2/2],[boxW/2,boxH2/2]].forEach(([hx,hy]) => {
            ctx.fillRect(hx-hs/2,hy-hs/2,hs,hs); ctx.strokeRect(hx-hs/2,hy-hs/2,hs,hs);
          });
          ctx.restore();
        }
        ctx.restore();
      });

      return; // special layout done
    }
    // ─────────────────────────────────────────────────────────
    // END SPECIAL LAYOUT BRANCH — continue with regular grid below
    // ─────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────
    // CUSTOM ASYMMETRIC LAYOUT BRANCH
    // ─────────────────────────────────────────────────────────
    if (isCustomLayout) {
      const sf = scaleFactor;
      const cells = computeCustomGeo(layout, pad, gp, w, cellAspectRatio);
      const cellRad = borderRadius * sf;

      cells.forEach(({ index: cellIdx, x: cellX, y: cellY, w: cw, h: ch }) => {
        ctx.save();
        drawRoundedRectPath(ctx, cellX, cellY, cw, ch, cellRad);
        ctx.clip();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cellX, cellY, cw, ch);

        const slotState = slots[cellIdx];
        const imageInfo = slotState?.imageId ? uploadedImages[slotState.imageId] : null;

        if (imageInfo && imageInfo.imgElement) {
          const img = imageInfo.imgElement;
          const coverScale = Math.max(cw / img.width, ch / img.height);
          const finalScale = coverScale * (slotState.scale || 1.0);
          const cx = cellX + cw / 2;
          const cy = cellY + ch / 2;
          ctx.save();
          ctx.translate(cx + (slotState.xOffset || 0) * sf, cy + (slotState.yOffset || 0) * sf);
          ctx.rotate(((slotState.rotation || 0) * Math.PI) / 180);
          ctx.drawImage(img, -img.width * finalScale / 2, -img.height * finalScale / 2, img.width * finalScale, img.height * finalScale);
          ctx.restore();
        } else if (!isExporting) {
          const isHov = hoveredSlotIndex === cellIdx;
          ctx.strokeStyle = isHov ? '#8b5cf6' : 'rgba(0,0,0,0.08)';
          ctx.lineWidth = 2 * sf;
          ctx.setLineDash([6 * sf, 6 * sf]);
          ctx.strokeRect(cellX + 4 * sf, cellY + 4 * sf, cw - 8 * sf, ch - 8 * sf);
          ctx.setLineDash([]);
          const cx = cellX + cw / 2;
          const cy = cellY + ch / 2;
          ctx.strokeStyle = isHov ? '#8b5cf6' : 'rgba(0,0,0,0.16)';
          ctx.lineWidth = 3 * sf;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - 14 * sf, cy); ctx.lineTo(cx + 14 * sf, cy);
          ctx.moveTo(cx, cy - 14 * sf); ctx.lineTo(cx, cy + 14 * sf);
          ctx.stroke();
          ctx.fillStyle = isHov ? '#8b5cf6' : 'rgba(0,0,0,0.35)';
          ctx.font = `600 ${Math.max(11, 13 * sf)}px Outfit, Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Click to upload', cx, cy + 30 * sf);
        }
        ctx.restore();

        // Active slot highlight
        if (!isExporting && activeSlotIndex === cellIdx) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 4 * sf;
          ctx.strokeRect(cellX + 2 * sf, cellY + 2 * sf, cw - 4 * sf, ch - 4 * sf);
        }
      });

      // Text overlays (same as regular layout)
      texts.forEach((txt) => {
        ctx.save();
        const tx = txt.x * w;
        const ty = txt.y * h;
        const scaledFontSize = txt.fontSize * sf;
        ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${scaledFontSize}px "${txt.fontFamily}", Outfit, Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = txt.text.split('\n');
        const lineHeight = scaledFontSize * 1.25;
        let maxLineWidth = 0;
        lines.forEach((line) => { const lw = ctx.measureText(line).width; if (lw > maxLineWidth) maxLineWidth = lw; });
        const blockWidth = maxLineWidth;
        const blockHeight = lines.length * lineHeight;
        ctx.translate(tx, ty);
        ctx.rotate((txt.rotation * Math.PI) / 180);
        ctx.globalAlpha = (txt.opacity !== undefined ? txt.opacity : 100) / 100;
        if (txt.bgEnabled) {
          ctx.save();
          const padAmt = (txt.padding || 10) * sf; const bRad = (txt.borderRadius || 8) * sf;
          const boxW = blockWidth + padAmt * 2; const boxH = blockHeight + padAmt * 2;
          ctx.globalAlpha = ((txt.bgOpacity || 80) / 100) * ((txt.opacity || 100) / 100);
          ctx.fillStyle = txt.bgType === 'gradient'
            ? (() => { const g = ctx.createLinearGradient(-boxW/2,-boxH/2,boxW/2,boxH/2); g.addColorStop(0,txt.bgGradA||'#7c3aed'); g.addColorStop(1,txt.bgGradB||'#db2777'); return g; })()
            : (txt.backgroundColor || '#000000');
          drawRoundedRectPath(ctx, -boxW/2, -boxH/2, boxW, boxH, bRad); ctx.fill();
          ctx.restore();
        }
        if (txt.shadow) { ctx.shadowColor='rgba(0,0,0,0.45)'; ctx.shadowBlur=8*sf; ctx.shadowOffsetX=3*sf; ctx.shadowOffsetY=3*sf; }
        const sw = txt.strokeWidth ?? 0;
        if (sw > 0) {
          ctx.save();
          ctx.globalAlpha = ((txt.strokeOpacity??100)/100)*((txt.opacity??100)/100);
          ctx.strokeStyle = txt.strokeType === 'gradient'
            ? (() => { const g = ctx.createLinearGradient(0,-blockHeight/2,0,blockHeight/2); g.addColorStop(0,txt.strokeGradA||'#000'); g.addColorStop(1,txt.strokeGradB||'#333'); return g; })()
            : (txt.strokeColor || '#000000');
          ctx.lineWidth = sw * sf; ctx.lineJoin = 'round';
          lines.forEach((line, i) => { ctx.strokeText(line, 0, -blockHeight/2+i*lineHeight+lineHeight/2); });
          ctx.restore();
        }
        ctx.fillStyle = txt.fillType === 'gradient'
          ? (() => { const g = ctx.createLinearGradient(0,-blockHeight/2,0,blockHeight/2); g.addColorStop(0,txt.colorGradA||'#fff'); g.addColorStop(1,txt.colorGradB||'#38bdf8'); return g; })()
          : (txt.color || '#ffffff');
        lines.forEach((line, i) => ctx.fillText(line, 0, -blockHeight/2+i*lineHeight+lineHeight/2));
        if (!isExporting && selectedTextId === txt.id) {
          ctx.save();
          ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.globalAlpha=1;
          const padAmt=(txt.padding||10)*sf; const boxW=blockWidth+padAmt*2; const boxH2=blockHeight+padAmt*2;
          ctx.strokeStyle='#8b5cf6'; ctx.lineWidth=2*sf; ctx.setLineDash([5*sf,5*sf]);
          ctx.strokeRect(-boxW/2,-boxH2/2,boxW,boxH2); ctx.setLineDash([]);
          ctx.fillStyle='#ffffff'; ctx.strokeStyle='#8b5cf6'; ctx.lineWidth=2*sf;
          const hs=8*sf;
          [[-boxW/2,-boxH2/2],[boxW/2,-boxH2/2],[-boxW/2,boxH2/2],[boxW/2,boxH2/2]].forEach(([hx,hy]) => {
            ctx.fillRect(hx-hs/2,hy-hs/2,hs,hs); ctx.strokeRect(hx-hs/2,hy-hs/2,hs,hs);
          });
          ctx.restore();
        }
        ctx.restore();
      });

      return; // custom layout done
    }
    // ─────────────────────────────────────────────────────────
    // END CUSTOM LAYOUT BRANCH — continue with regular grid below
    // ─────────────────────────────────────────────────────────

    // 2. Draw Image Cells

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const cellX = pad + c * (cWidth + gp);
        const cellY = pad + r * (cHeight + gp);
        
        ctx.save();
        
        // Clip to rounded rect
        drawRoundedRectPath(ctx, cellX, cellY, cWidth, cHeight, rad);
        ctx.clip();
        
        // Cell Background
        ctx.fillStyle = '#f8fafc'; // White/gray frame default
        ctx.fillRect(cellX, cellY, cWidth, cHeight);
        
        const slotState = slots[index];
        const imageInfo = slotState?.imageId ? uploadedImages[slotState.imageId] : null;
        
        if (imageInfo && imageInfo.imgElement) {
          const img = imageInfo.imgElement;
          
          // Fit & Cover Logic
          const coverScale = Math.max(cWidth / img.width, cHeight / img.height);
          const finalScale = coverScale * (slotState.scale || 1.0);
          
          const cx = cellX + cWidth / 2;
          const cy = cellY + cHeight / 2;
          
          ctx.save();
          // Translate to slot center + offsets (scaled)
          ctx.translate(
            cx + (slotState.xOffset || 0) * scaleFactor, 
            cy + (slotState.yOffset || 0) * scaleFactor
          );
          ctx.rotate(((slotState.rotation || 0) * Math.PI) / 180);
          ctx.drawImage(
            img,
            -img.width * finalScale / 2,
            -img.height * finalScale / 2,
            img.width * finalScale,
            img.height * finalScale
          );
          ctx.restore();
        } else {
          // Empty slot placeholder (only draw if not exporting)
          if (!isExporting) {
            // Dashed Border
            ctx.strokeStyle = (hoveredSlotIndex === index) ? '#8b5cf6' : 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 2 * scaleFactor;
            ctx.setLineDash([6 * scaleFactor, 6 * scaleFactor]);
            ctx.strokeRect(cellX + 4 * scaleFactor, cellY + 4 * scaleFactor, cWidth - 8 * scaleFactor, cHeight - 8 * scaleFactor);
            ctx.setLineDash([]);
            
            // Plus Sign
            const cx = cellX + cWidth / 2;
            const cy = cellY + cHeight / 2;
            ctx.strokeStyle = (hoveredSlotIndex === index) ? '#8b5cf6' : 'rgba(0, 0, 0, 0.16)';
            ctx.lineWidth = 3 * scaleFactor;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cx - 14 * scaleFactor, cy);
            ctx.lineTo(cx + 14 * scaleFactor, cy);
            ctx.moveTo(cx, cy - 14 * scaleFactor);
            ctx.lineTo(cx, cy + 14 * scaleFactor);
            ctx.stroke();
            
            // Text Label
            ctx.fillStyle = (hoveredSlotIndex === index) ? '#8b5cf6' : 'rgba(0, 0, 0, 0.35)';
            ctx.font = `600 ${Math.max(11, 13 * scaleFactor)}px Outfit, Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('Click to upload', cx, cy + 30 * scaleFactor);
          }
        }
        
        ctx.restore();

        // Active slot highlight outline (in editor only)
        if (!isExporting && activeSlotIndex === index) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 4 * scaleFactor;
          ctx.strokeRect(cellX + 2 * scaleFactor, cellY + 2 * scaleFactor, cWidth - 4 * scaleFactor, cHeight - 4 * scaleFactor);
        }
      }
    }

    // 3. Draw Text Overlays
    texts.forEach((txt) => {
      ctx.save();
      const tx = txt.x * w;
      const ty = txt.y * h;
      
      const scaledFontSize = txt.fontSize * scaleFactor;
      ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${scaledFontSize}px "${txt.fontFamily}", Outfit, Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const lines = txt.text.split('\n');
      const lineHeight = scaledFontSize * 1.25;
      
      let maxLineWidth = 0;
      lines.forEach((line) => {
        const lineW = ctx.measureText(line).width;
        if (lineW > maxLineWidth) maxLineWidth = lineW;
      });
      const blockWidth = maxLineWidth;
      const blockHeight = lines.length * lineHeight;
      
      ctx.translate(tx, ty);
      ctx.rotate((txt.rotation * Math.PI) / 180);
      
      // Global Text Opacity base
      const textAlpha = (txt.opacity !== undefined ? txt.opacity : 100) / 100;
      ctx.globalAlpha = textAlpha;

      // Draw background tag
      const bgEnabled = txt.bgEnabled !== undefined ? txt.bgEnabled : false;
      if (bgEnabled) {
        ctx.save();
        const bgAlpha = (txt.bgOpacity !== undefined ? txt.bgOpacity : 80) / 100;
        ctx.globalAlpha = bgAlpha * textAlpha; // Combine with main text opacity
        
        const padAmount = (txt.padding || 10) * scaleFactor;
        const bRad = (txt.borderRadius || 8) * scaleFactor;
        const boxW = blockWidth + padAmount * 2;
        const boxH = blockHeight + padAmount * 2;
        
        // Background Color vs Gradient
        let bgStyle;
        if (txt.bgType === 'gradient') {
          const grad = ctx.createLinearGradient(-boxW / 2, -boxH / 2, boxW / 2, boxH / 2);
          grad.addColorStop(0, txt.bgGradA || '#7c3aed');
          grad.addColorStop(1, txt.bgGradB || '#db2777');
          bgStyle = grad;
        } else {
          bgStyle = txt.backgroundColor || '#000000';
        }
        
        ctx.fillStyle = bgStyle;
        drawRoundedRectPath(ctx, -boxW / 2, -boxH / 2, boxW, boxH, bRad);
        ctx.fill();
        ctx.restore();
      }
      
      // Drop Shadow
      if (txt.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 8 * scaleFactor;
        ctx.shadowOffsetX = 3 * scaleFactor;
        ctx.shadowOffsetY = 3 * scaleFactor;
      }
      
      // Text Fill style (solid Color vs Gradient)
      let fillStyle;
      if (txt.fillType === 'gradient') {
        // Vertical gradient for text
        const grad = ctx.createLinearGradient(0, -blockHeight / 2, 0, blockHeight / 2);
        grad.addColorStop(0, txt.colorGradA || '#ffffff');
        grad.addColorStop(1, txt.colorGradB || '#38bdf8');
        fillStyle = grad;
      } else {
        fillStyle = txt.color || '#ffffff';
      }

      // Text stroke outline (Solid vs Gradient)
      const strokeW = txt.strokeWidth !== undefined ? txt.strokeWidth : 0;
      let strokeStyle;
      if (strokeW > 0) {
        if (txt.strokeType === 'gradient') {
          const grad = ctx.createLinearGradient(0, -blockHeight / 2, 0, blockHeight / 2);
          grad.addColorStop(0, txt.strokeGradA || '#000000');
          grad.addColorStop(1, txt.strokeGradB || '#333333');
          strokeStyle = grad;
        } else {
          strokeStyle = txt.strokeColor || '#000000';
        }
      }

      // Draw Stroke Outline (drawn underneath fill)
      if (strokeW > 0) {
        ctx.save();
        const strokeAlpha = (txt.strokeOpacity !== undefined ? txt.strokeOpacity : 100) / 100;
        ctx.globalAlpha = strokeAlpha * textAlpha;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeW * scaleFactor;
        ctx.lineJoin = 'round';
        lines.forEach((line, index) => {
          const lineY = -blockHeight / 2 + index * lineHeight + lineHeight / 2;
          ctx.strokeText(line, 0, lineY);
        });
        ctx.restore();
      }

      // Draw Fill Text
      ctx.fillStyle = fillStyle;
      lines.forEach((line, index) => {
        const lineY = -blockHeight / 2 + index * lineHeight + lineHeight / 2;
        ctx.fillText(line, 0, lineY);
      });
      
      // Render text controls selection indicator (editor only)
      if (!isExporting && selectedTextId === txt.id) {
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1.0;
        
        const padAmount = (txt.padding || 10) * scaleFactor;
        const boxW = blockWidth + padAmount * 2;
        const boxH = blockHeight + padAmount * 2;
        
        // Dashed box
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2 * scaleFactor;
        ctx.setLineDash([5 * scaleFactor, 5 * scaleFactor]);
        ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
        ctx.setLineDash([]);
        
        // Corner drag-dots
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2 * scaleFactor;
        const handleSize = 8 * scaleFactor;
        const handles = [
          { x: -boxW / 2, y: -boxH / 2 },
          { x: boxW / 2, y: -boxH / 2 },
          { x: -boxW / 2, y: boxH / 2 },
          { x: boxW / 2, y: boxH / 2 }
        ];
        
        handles.forEach((hPos) => {
          ctx.fillRect(hPos.x - handleSize / 2, hPos.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(hPos.x - handleSize / 2, hPos.y - handleSize / 2, handleSize, handleSize);
        });
        ctx.restore();
      }
      
      ctx.restore();
    });
  };

  // Canvas Drawing Trigger
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and draw editor canvas at 1x scale
    ctx.clearRect(0, 0, CANVAS_WIDTH, canvasHeight);
    drawCanvasOnContext(ctx, false, 1);
  };

  // Re-draw canvas on any layout or asset adjustments
  useEffect(() => {
    draw();
  }, [
    layout, 
    cellAspectRatio, 
    padding, 
    gap, 
    borderRadius, 
    bgType, 
    bgPresetIndex, 
    customSolidBg, 
    customGradA, 
    customGradB, 
    slots, 
    texts, 
    uploadedImages, 
    selectedTextId, 
    activeSlotIndex, 
    canvasHeight,
    hoveredSlotIndex
  ]);

  // Rounded rectangle helper path
  const drawRoundedRectPath = (ctx, x, y, w, h, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Translate mouse coordinate to backing canvas resolution
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * canvasHeight;
    return { x, y };
  };

  // Event Handlers for Canvas Interaction (Drag, Zoom, Pan)
  const handleMouseDown = (e) => {
    const { x: mx, y: my } = getCanvasCoords(e);
    
    // 1. Hit-Test Selected Text Handles (for Resizing) first
    if (selectedTextId) {
      const txt = texts.find(t => t.id === selectedTextId);
      if (txt) {
        const tx = txt.x * CANVAS_WIDTH;
        const ty = txt.y * canvasHeight;
        const dx = mx - tx;
        const dy = my - ty;
        const rad = -((txt.rotation || 0) * Math.PI) / 180;
        const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
        
        // Measure text boundary box
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${txt.fontSize}px "${txt.fontFamily}", Outfit, Inter, sans-serif`;
        const lines = txt.text.split('\n');
        let maxLineWidth = 0;
        lines.forEach(l => {
          const w = ctx.measureText(l).width;
          if (w > maxLineWidth) maxLineWidth = w;
        });
        const pad = txt.padding || 10;
        const boxW = maxLineWidth + pad * 2;
        const boxH = lines.length * txt.fontSize * 1.25 + pad * 2;
        
        const handleRadius = 15; // Clickable padding for tiny handles
        const handles = [
          { x: -boxW / 2, y: -boxH / 2, name: 'TL' },
          { x: boxW / 2, y: -boxH / 2, name: 'TR' },
          { x: -boxW / 2, y: boxH / 2, name: 'BL' },
          { x: boxW / 2, y: boxH / 2, name: 'BR' }
        ];

        let clickedHandle = null;
        for (let h of handles) {
          if (Math.hypot(rx - h.x, ry - h.y) <= handleRadius) {
            clickedHandle = h.name;
            break;
          }
        }

        if (clickedHandle) {
          setIsResizingText(true);
          setResizeHandleName(clickedHandle);
          setResizeStartFontSize(txt.fontSize);
          setResizeStartMouseDist(Math.hypot(mx - tx, my - ty));
          return;
        }
      }
    }

    // 2. Hit-Test Text Overlays Bounding Box (for Dragging)
    for (let i = texts.length - 1; i >= 0; i--) {
      const txt = texts[i];
      const tx = txt.x * CANVAS_WIDTH;
      const ty = txt.y * canvasHeight;
      const dx = mx - tx;
      const dy = my - ty;
      const rad = -((txt.rotation || 0) * Math.PI) / 180;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${txt.fontSize}px "${txt.fontFamily}", Outfit, Inter, sans-serif`;
      
      const lines = txt.text.split('\n');
      let maxLineWidth = 0;
      lines.forEach(l => {
        const w = ctx.measureText(l).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });
      const pad = txt.padding || 10;
      const boxW = maxLineWidth + pad * 2;
      const boxH = lines.length * txt.fontSize * 1.25 + pad * 2;

      if (rx >= -boxW / 2 && rx <= boxW / 2 && ry >= -boxH / 2 && ry <= boxH / 2) {
        setIsDraggingText(true);
        setSelectedTextId(txt.id);
        setActiveSlotIndex(null);
        setActiveTab('text');
        setDragStart({ x: mx, y: my });
        setTextStartPos({ x: txt.x, y: txt.y });
        return;
      }
    }

    // 3. Hit-Test Grid Cells
    for (let cell of computedCells) {
      if (mx >= cell.x && mx <= cell.x + cell.w && my >= cell.y && my <= cell.y + cell.h) {
        setSelectedTextId(null);
        
        const slot = slots[cell.index];
        if (slot?.imageId) {
          // Frame has a picture - select frame and start panning image
          setActiveSlotIndex(cell.index);
          setActiveTab('image');
          setIsDraggingImage(true);
          setDragStart({ x: mx, y: my });
          setImageStartOffset({
            dx: slot.xOffset || 0,
            dy: slot.yOffset || 0
          });
        } else {
          // Empty slot clicked - open image browser window instantly
          triggerFileInput(cell.index);
        }
        return;
      }
    }

    // Clicked background - clear selection
    setSelectedTextId(null);
    setActiveSlotIndex(null);
  };

  const handleMouseMove = (e) => {
    const { x: mx, y: my } = getCanvasCoords(e);
    
    // Check Drag/Resize actions
    if (isResizingText && selectedTextId) {
      const txt = texts.find(t => t.id === selectedTextId);
      if (txt) {
        const tx = txt.x * CANVAS_WIDTH;
        const ty = txt.y * canvasHeight;
        const currentDist = Math.hypot(mx - tx, my - ty);
        const scale = currentDist / (resizeStartMouseDist || 1);
        const newFontSize = Math.max(12, Math.min(220, Math.round(resizeStartFontSize * scale)));
        
        setTexts(prev => prev.map(t => t.id === selectedTextId ? { ...t, fontSize: newFontSize } : t));
      }
      return;
    }

    if (isDraggingText && selectedTextId) {
      const dx = mx - dragStart.x;
      const dy = my - dragStart.y;
      const newX = Math.max(0.01, Math.min(0.99, textStartPos.x + dx / CANVAS_WIDTH));
      const newY = Math.max(0.01, Math.min(0.99, textStartPos.y + dy / canvasHeight));
      
      setTexts(prev => prev.map(t => t.id === selectedTextId ? { ...t, x: newX, y: newY } : t));
      return;
    }

    if (isDraggingImage && activeSlotIndex !== null) {
      const dx = mx - dragStart.x;
      const dy = my - dragStart.y;
      
      setSlots(prev => ({
        ...prev,
        [activeSlotIndex]: {
          ...prev[activeSlotIndex],
          xOffset: imageStartOffset.dx + dx,
          yOffset: imageStartOffset.dy + dy
        }
      }));
      return;
    }

    // Dynamic Hover Cursors when not dragging
    updateCursorStyle(mx, my);
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setIsDraggingText(false);
    setIsResizingText(false);
  };

  // Adjust cursor style based on hover targets
  const updateCursorStyle = (mx, my) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check active text handles
    if (selectedTextId) {
      const txt = texts.find(t => t.id === selectedTextId);
      if (txt) {
        const tx = txt.x * CANVAS_WIDTH;
        const ty = txt.y * canvasHeight;
        const dx = mx - tx;
        const dy = my - ty;
        const rad = -((txt.rotation || 0) * Math.PI) / 180;
        const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
        
        ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${txt.fontSize}px "${txt.fontFamily}", Outfit, Inter, sans-serif`;
        const lines = txt.text.split('\n');
        let maxLineWidth = 0;
        lines.forEach(l => {
          const w = ctx.measureText(l).width;
          if (w > maxLineWidth) maxLineWidth = w;
        });
        const pad = txt.padding || 10;
        const boxW = maxLineWidth + pad * 2;
        const boxH = lines.length * txt.fontSize * 1.25 + pad * 2;
        
        const hRadius = 15;
        const hList = [
          { x: -boxW / 2, y: -boxH / 2, cursor: 'nwse-resize' },
          { x: boxW / 2, y: -boxH / 2, cursor: 'nesw-resize' },
          { x: -boxW / 2, y: boxH / 2, cursor: 'nesw-resize' },
          { x: boxW / 2, y: boxH / 2, cursor: 'nwse-resize' }
        ];

        for (let h of hList) {
          if (Math.hypot(rx - h.x, ry - h.y) <= hRadius) {
            canvas.style.cursor = h.cursor;
            return;
          }
        }

        if (rx >= -boxW / 2 && rx <= boxW / 2 && ry >= -boxH / 2 && ry <= boxH / 2) {
          canvas.style.cursor = 'move';
          return;
        }
      }
    }

    // Check general texts
    for (let txt of texts) {
      if (txt.id === selectedTextId) continue;
      const tx = txt.x * CANVAS_WIDTH;
      const ty = txt.y * canvasHeight;
      const dx = mx - tx;
      const dy = my - ty;
      const rad = -((txt.rotation || 0) * Math.PI) / 180;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
      
      ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${txt.fontSize}px "${txt.fontFamily}", Outfit, Inter, sans-serif`;
      const lines = txt.text.split('\n');
      let maxLineWidth = 0;
      lines.forEach(l => {
        const w = ctx.measureText(l).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });
      const pad = txt.padding || 10;
      const boxW = maxLineWidth + pad * 2;
      const boxH = lines.length * txt.fontSize * 1.25 + pad * 2;
      
      if (rx >= -boxW / 2 && rx <= boxW / 2 && ry >= -boxH / 2 && ry <= boxH / 2) {
        canvas.style.cursor = 'pointer';
        return;
      }
    }

    // Check cells
    for (let cell of computedCells) {
      if (mx >= cell.x && mx <= cell.x + cell.w && my >= cell.y && my <= cell.y + cell.h) {
        const slot = slots[cell.index];
        canvas.style.cursor = slot?.imageId ? 'grab' : 'pointer';
        return;
      }
    }

    canvas.style.cursor = 'default';
  };

  // Zoom inside cell via scroll wheel
  const handleWheel = (e) => {
    const { x: mx, y: my } = getCanvasCoords(e);
    
    // Find hovering cell
    const cell = computedCells.find(c => mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h);
    if (cell) {
      const slot = slots[cell.index];
      if (slot?.imageId) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.05 : 0.95;
        const currentScale = slot.scale || 1.0;
        const nextScale = Math.max(0.2, Math.min(10, currentScale * factor));
        
        setSlots(prev => ({
          ...prev,
          [cell.index]: {
            ...prev[cell.index],
            scale: nextScale
          }
        }));
      }
    }
  };

  // Double-Click Handler
  const handleDoubleClick = (e) => {
    const { x: mx, y: my } = getCanvasCoords(e);
    
    // If text clicked, select & prompt to edit immediately
    for (let txt of texts) {
      const tx = txt.x * CANVAS_WIDTH;
      const ty = txt.y * canvasHeight;
      const dx = mx - tx;
      const dy = my - ty;
      const rad = -((txt.rotation || 0) * Math.PI) / 180;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.font = `${txt.bold ? 'bold ' : ''}${txt.italic ? 'italic ' : ''}${txt.fontSize}px "${txt.fontFamily}", Outfit, Inter, sans-serif`;
      
      const lines = txt.text.split('\n');
      let maxLineWidth = 0;
      lines.forEach(l => {
        const w = ctx.measureText(l).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });
      const pad = txt.padding || 10;
      const boxW = maxLineWidth + pad * 2;
      const boxH = lines.length * txt.fontSize * 1.25 + pad * 2;

      if (rx >= -boxW / 2 && rx <= boxW / 2 && ry >= -boxH / 2 && ry <= boxH / 2) {
        setSelectedTextId(txt.id);
        setActiveTab('text');
        return;
      }
    }

    // If cell clicked, open upload browser
    for (let cell of computedCells) {
      if (mx >= cell.x && mx <= cell.x + cell.w && my >= cell.y && my <= cell.y + cell.h) {
        triggerFileInput(cell.index);
        return;
      }
    }
  };

  // Drag and drop image files directly onto slots
  const handleDragOver = (e) => {
    e.preventDefault();
    const { x: mx, y: my } = getCanvasCoords(e);
    const cell = computedCells.find(c => mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h);
    
    if (cell) {
      setHoveredSlotIndex(cell.index);
    } else {
      setHoveredSlotIndex(null);
    }
  };

  const handleDragLeave = () => {
    setHoveredSlotIndex(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setHoveredSlotIndex(null);
    
    const { x: mx, y: my } = getCanvasCoords(e);
    const cell = computedCells.find(c => mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    
    if (files.length === 0) return;

    if (cell) {
      // Load onto slot + sequential remaining slots
      let startSlot = cell.index;
      files.forEach((file, index) => {
        if (startSlot < maxSlots) {
          handleImageUpload(file, startSlot);
          startSlot++;
        }
      });
    } else {
      // Find first empty slots sequentially
      let fileIdx = 0;
      for (let i = 0; i < maxSlots; i++) {
        if (!slots[i]?.imageId && fileIdx < files.length) {
          handleImageUpload(files[fileIdx], i);
          fileIdx++;
        }
      }
    }
  };

  // Image upload handler
  const handleImageUpload = (file, slotIndex) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setUploadedImages(prev => ({
          ...prev,
          [imageId]: { imgElement: img, src: event.target.result, name: file.name }
        }));
        setSlots(prev => ({
          ...prev,
          [slotIndex]: {
            imageId,
            scale: 1.0,
            xOffset: 0,
            yOffset: 0,
            rotation: 0
          }
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Input click trigger
  const triggerFileInput = (slotIndex) => {
    setActiveSlotIndex(slotIndex);
    fileInputRef.current.click();
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (activeSlotIndex !== null) {
      // Upload specifically to selected slot, distribute others next
      let idx = activeSlotIndex;
      files.forEach(file => {
        if (idx < maxSlots) {
          handleImageUpload(file, idx);
          idx++;
        }
      });
    } else {
      // Upload into empty slots sequentially
      let fileIdx = 0;
      for (let i = 0; i < maxSlots; i++) {
        if (!slots[i]?.imageId && fileIdx < files.length) {
          handleImageUpload(files[fileIdx], i);
          fileIdx++;
        }
      }
    }
    e.target.value = null; // Reset
  };

  // Text Overlay Helpers
  const addText = () => {
    const newId = `txt-${Date.now()}`;
    const newTxt = {
      id: newId,
      text: 'Heading Text',
      x: 0.5,
      y: 0.5,
      fontSize: 48,
      fontFamily: 'Montserrat',
      bold: true,
      italic: false,
      shadow: true,

      // Fill settings
      fillType: 'color',
      color: '#ffffff',
      colorGradA: '#ffffff',
      colorGradB: '#38bdf8',
      opacity: 100,

      // Background settings
      bgEnabled: false,
      bgType: 'color',
      backgroundColor: '#000000',
      bgGradA: '#7c3aed',
      bgGradB: '#db2777',
      bgOpacity: 80,
      borderRadius: 8,
      padding: 10,

      // Border settings
      strokeWidth: 4,
      strokeType: 'color',
      strokeColor: '#000000',
      strokeGradA: '#000000',
      strokeGradB: '#333333',
      strokeOpacity: 100,

      rotation: 0
    };
    setTexts(prev => [...prev, newTxt]);
    setSelectedTextId(newId);
    setActiveTab('text');
  };

  const updateSelectedText = (key, value) => {
    if (!selectedTextId) return;
    setTexts(prev => prev.map(t => t.id === selectedTextId ? { ...t, [key]: value } : t));
  };

  const deleteSelectedText = () => {
    if (!selectedTextId) return;
    setTexts(prev => prev.filter(t => t.id !== selectedTextId));
    setSelectedTextId(null);
  };

  // Slot Controls
  const updateSlotControl = (key, value) => {
    if (activeSlotIndex === null) return;
    setSlots(prev => ({
      ...prev,
      [activeSlotIndex]: {
        ...prev[activeSlotIndex],
        [key]: value
      }
    }));
  };

  const removeSlotImage = (index) => {
    setSlots(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const fitImage = (index) => {
    const slot = slots[index];
    if (!slot?.imageId) return;
    const imgInfo = uploadedImages[slot.imageId];
    if (!imgInfo) return;

    // Dimensions
    const img = imgInfo.imgElement;
    const coverScale = Math.max(cellWidth / img.width, cellHeight / img.height);
    const containScale = Math.min(cellWidth / img.width, cellHeight / img.height);
    
    // Fit ratio factor
    const fitScale = containScale / coverScale;
    
    setSlots(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        scale: fitScale,
        xOffset: 0,
        yOffset: 0,
        rotation: 0
      }
    }));
  };

  const fillImage = (index) => {
    setSlots(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        scale: 1.0,
        xOffset: 0,
        yOffset: 0,
        rotation: 0
      }
    }));
  };

  // Clear Canvas completely
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your collage? This will delete all images and texts.')) {
      setSlots({});
      setTexts([]);
      setUploadedImages({});
      setActiveSlotIndex(null);
      setSelectedTextId(null);
    }
  };

  // High-Resolution Export
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Show processing toast
    showToast('Exporting high-quality collage...');
    
    setTimeout(() => {
      // Create high-res offline canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = CANVAS_WIDTH * exportResolution;
      exportCanvas.height = canvasHeight * exportResolution;
      
      const exportCtx = exportCanvas.getContext('2d');
      
      // Draw collage with scale multiplier
      drawCanvasOnContext(exportCtx, true, exportResolution);
      
      // Generate Download Link
      const dataUrl = exportCanvas.toDataURL('image/png', 0.95);
      const link = document.createElement('a');
      link.download = `glowcollage_${layout}_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Success celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#8b5cf6', '#db2777', '#3b82f6', '#10b981']
      });

      showToast('Collage downloaded successfully! Ã°Å¸Å½â€°');
    }, 600);
  };

  // Copy collage binary image directly to Clipboard (for pasting into WhatsApp, Slack, etc.)
  const handleCopyCollage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    showToast('Copying collage to clipboard...');

    try {
      // Render to target export size canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = CANVAS_WIDTH * exportResolution;
      exportCanvas.height = canvasHeight * exportResolution;
      const exportCtx = exportCanvas.getContext('2d');

      drawCanvasOnContext(exportCtx, true, exportResolution);

      exportCanvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to copy collage.');
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          
          confetti({
            particleCount: 80,
            spread: 55,
            origin: { y: 0.8 },
            colors: ['#8b5cf6', '#db2777', '#10b981']
          });
          
          showToast('Collage copied to clipboard! Paste it anywhere (Ctrl+V). Ã°Å¸â€œâ€¹Ã°Å¸Å½â€°');
        } catch (err) {
          console.error('Clipboard copy error:', err);
          showToast('Failed to write to clipboard. Try downloading.');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Image rendering error:', err);
      showToast('Copy failed. Try using standard export.');
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const selectedText = selectedTextId ? texts.find(t => t.id === selectedTextId) : null;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept="image/*" 
        multiple 
        style={{ display: 'none' }} 
      />

      {/* Sidebar Controls */}
      <aside className="sidebar">
        <header className="sidebar-header">
          <Sparkles className="logo-icon" size={24} />
          <h1 className="logo-text">GlowCollage</h1>

          {/* Theme Toggle */}
          <div className="theme-toggle-group" role="group" aria-label="Color theme">
            {THEMES.map((t) => (
              <button
                key={t.id}
                id={`theme-btn-${t.id}`}
                className={`theme-btn${theme === t.id ? ' theme-btn--active' : ''}`}
                title={t.title}
                aria-pressed={theme === t.id}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* Tab Headers */}
        <div className="sidebar-tabs">
          <button 
            className={`tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => { setActiveTab('layout'); setSelectedTextId(null); }}
          >
            <LayoutGrid size={15} />
            Layout
          </button>
          <button 
            className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`}
            onClick={() => { setActiveTab('design'); setSelectedTextId(null); }}
          >
            <Palette size={15} />
            Canvas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => { setActiveTab('image'); setSelectedTextId(null); }}
          >
            <ImageIcon size={15} />
            Frames
          </button>
          <button 
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => { setActiveTab('text'); setActiveSlotIndex(null); }}
          >
            <Type size={15} />
            Texts
          </button>
        </div>

        <div className="sidebar-content">
          
          {/* TAB 1: LAYOUT CONFIG */}
          {activeTab === 'layout' && (
            <div className="animate-fade-in control-group">
              <h2 className="section-title">
                <LayoutGrid size={14} /> Grid Template
              </h2>
              <div className="layout-presets">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`layout-card ${layout === preset.id ? 'active' : ''}`}
                    onClick={() => {
                      setLayout(preset.id);
                      setActiveSlotIndex(null);
                    }}
                  >
                    <div className={`layout-preview-icon ${preset.type}`}>
                      {Array.from({ length: preset.count }).map((_, i) => (
                        <div key={i} className="layout-preview-cell" />
                      ))}
                    </div>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* ── Asymmetric Layouts ── */}
              <h2 className="section-title" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <LayoutGrid size={14} /> Asymmetric
              </h2>
              <div className="layout-presets">
                {/* Featured Left: big left + 2 stacked right */}
                <button
                  id="layout-btn-featured-left"
                  className={`layout-card ${layout === 'featured-left' ? 'active' : ''}`}
                  onClick={() => { setLayout('featured-left'); setActiveSlotIndex(null); }}
                >
                  <div className="layout-preview-icon prev-featured-left">
                    <div className="prev-cell prev-big" />
                    <div className="prev-col">
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                    </div>
                  </div>
                  <span>Featured Left</span>
                </button>

                {/* Featured Right: 2 stacked left + big right */}
                <button
                  id="layout-btn-featured-right"
                  className={`layout-card ${layout === 'featured-right' ? 'active' : ''}`}
                  onClick={() => { setLayout('featured-right'); setActiveSlotIndex(null); }}
                >
                  <div className="layout-preview-icon prev-featured-right">
                    <div className="prev-col">
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                    </div>
                    <div className="prev-cell prev-big" />
                  </div>
                  <span>Featured Right</span>
                </button>

                {/* Featured Top: wide top + 3 bottom */}
                <button
                  id="layout-btn-featured-top"
                  className={`layout-card ${layout === 'featured-top' ? 'active' : ''}`}
                  onClick={() => { setLayout('featured-top'); setActiveSlotIndex(null); }}
                >
                  <div className="layout-preview-icon prev-featured-top">
                    <div className="prev-cell prev-wide" />
                    <div className="prev-row">
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                    </div>
                  </div>
                  <span>Featured Top</span>
                </button>

                {/* Magazine 5: 2 top + 3 bottom */}
                <button
                  id="layout-btn-magazine-5"
                  className={`layout-card ${layout === 'magazine-5' ? 'active' : ''}`}
                  onClick={() => { setLayout('magazine-5'); setActiveSlotIndex(null); }}
                >
                  <div className="layout-preview-icon prev-magazine-5">
                    <div className="prev-row">
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                    </div>
                    <div className="prev-row">
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                    </div>
                  </div>
                  <span>Magazine 5</span>
                </button>

                {/* Magazine 6: tall left + 2x2 right + wide bottom */}
                <button
                  id="layout-btn-magazine-6"
                  className={`layout-card ${layout === 'magazine-6' ? 'active' : ''}`}
                  onClick={() => { setLayout('magazine-6'); setActiveSlotIndex(null); }}
                >
                  <div className="layout-preview-icon prev-magazine-6">
                    <div className="prev-cell prev-tall" />
                    <div className="prev-col prev-col-2x2">
                      <div className="prev-row">
                        <div className="prev-cell" />
                        <div className="prev-cell" />
                      </div>
                      <div className="prev-row">
                        <div className="prev-cell" />
                        <div className="prev-cell" />
                      </div>
                    </div>
                  </div>
                  <span>Magazine 6</span>
                </button>

                {/* Mosaic 7: big+med top, 3 mid, 2 bottom */}
                <button
                  id="layout-btn-mosaic-7"
                  className={`layout-card ${layout === 'mosaic-7' ? 'active' : ''}`}
                  onClick={() => { setLayout('mosaic-7'); setActiveSlotIndex(null); }}
                >
                  <div className="layout-preview-icon prev-mosaic-7">
                    <div className="prev-row">
                      <div className="prev-cell prev-big-h" />
                      <div className="prev-cell prev-med-h" />
                    </div>
                    <div className="prev-row">
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                    </div>
                    <div className="prev-row">
                      <div className="prev-cell" />
                      <div className="prev-cell" />
                    </div>
                  </div>
                  <span>Mosaic 7</span>
                </button>
              </div>

              {/* ── Special Category ── */}
              <h2 className="section-title" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <Sparkles size={14} /> Special

              </h2>
              <div className="layout-presets" style={{ gridTemplateColumns: '1fr' }}>
                <button
                  id="special-layout-btn"
                  className={`layout-card layout-card--special ${layout === SPECIAL_LAYOUT_ID ? 'active' : ''}`}
                  onClick={() => {
                    setLayout(SPECIAL_LAYOUT_ID);
                    setActiveSlotIndex(null);
                  }}
                >
                  <div className="layout-preview-icon layout-preview-special">
                    <div className="lps-banner" />
                    {/* Row 0: 4 slots */}
                    <div className="lps-row">
                      <div className="lps-cell" />
                      <div className="lps-cell" />
                      <div className="lps-cell" />
                      <div className="lps-cell" />
                    </div>
                    {/* Row 1: left, hero-top, right */}
                    <div className="lps-row">
                      <div className="lps-cell" />
                      <div className="lps-hero-top" />
                      <div className="lps-cell" />
                    </div>
                    {/* Row 2: left, hero-bottom, right */}
                    <div className="lps-row">
                      <div className="lps-cell" />
                      <div className="lps-hero-bot" />
                      <div className="lps-cell" />
                    </div>
                    {/* Row 3: bottom-left text, center-tractor, bottom-right text */}
                    <div className="lps-row">
                      <div className="lps-bot" />
                      <div className="lps-cell-wide" />
                      <div className="lps-bot" />
                    </div>
                  </div>
                  <span>City Bulletin</span>
                </button>
              </div>

              {isSpecialLayout && (
                <div className="special-text-controls animate-fade-in">
                  <p className="special-hint">
                    ✏️ Edit built-in text zones. Click photo slots on canvas to upload images.
                  </p>
                  <div className="control-group">
                    <span className="control-label">🟢 Top Banner</span>
                    <input type="text" value={specialTexts.banner}
                      onChange={e => setSpecialTexts(p => ({ ...p, banner: e.target.value }))}
                      placeholder="Tehsil Gujjar Khan, District Rawalpindi" />
                  </div>
                  <div className="control-group">
                    <span className="control-label">⭐ Hero Title</span>
                    <input type="text" value={specialTexts.heroTitle}
                      onChange={e => setSpecialTexts(p => ({ ...p, heroTitle: e.target.value }))}
                      placeholder="GUJJAR KHAN" />
                  </div>
                  <div className="control-group">
                    <span className="control-label">Hero Subtitle</span>
                    <input type="text" value={specialTexts.heroSub}
                      onChange={e => setSpecialTexts(p => ({ ...p, heroSub: e.target.value }))}
                      placeholder="CLEAN CITY • GREEN CITY • HEALTHY CITY" />
                  </div>
                  <div className="control-group">
                    <span className="control-label">Hero Urdu / Arabic</span>
                    <input type="text" value={specialTexts.heroUrdu}
                      onChange={e => setSpecialTexts(p => ({ ...p, heroUrdu: e.target.value }))}
                      placeholder="میرا شہر، میری ذمہ داری"
                      dir="rtl" style={{ textAlign: 'right' }} />
                  </div>
                  <div className="control-group">
                    <span className="control-label">📋 Bottom-Left Text</span>
                    <textarea rows={5} className="text-edit-textarea"
                      value={specialTexts.bottomLeft}
                      onChange={e => setSpecialTexts(p => ({ ...p, bottomLeft: e.target.value }))}
                      placeholder={"WORKING FOR A BETTER CITY\n✓ Regular Road Cleaning"} />
                  </div>
                  <div className="control-group">
                    <span className="control-label">📝 Bottom-Right Text</span>
                    <textarea rows={4} className="text-edit-textarea"
                      value={specialTexts.bottomRight}
                      onChange={e => setSpecialTexts(p => ({ ...p, bottomRight: e.target.value }))}
                      placeholder={"میرا شہر\nمیری ذمہ داری\nKEEP YOUR CITY\nCLEAN & GREEN"} />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '20px' }} className="control-group">
                <div className="control-label"><span>Photo Frame Aspect Ratio</span></div>
                <select value={cellAspectRatio} onChange={(e) => setCellAspectRatio(parseFloat(e.target.value))}>
                  <optgroup label="── Square ──"><option value={1.0}>Square (1:1)</option></optgroup>
                  <optgroup label="── Portrait ──">
                    <option value={0.8}>Portrait (4:5) — Instagram</option>
                    <option value={0.75}>Portrait (3:4)</option>
                    <option value={0.67}>Tall Portrait (2:3)</option>
                    <option value={0.5625}>Story / Reel (9:16)</option>
                  </optgroup>
                  <optgroup label="── Landscape ──">
                    <option value={1.25}>Landscape (5:4)</option>
                    <option value={1.33}>Landscape (4:3)</option>
                    <option value={1.5}>Landscape (3:2) — DSLR</option>
                    <option value={1.7778}>Widescreen (16:9) — HD</option>
                    <option value={2.0}>Panorama (2:1)</option>
                    <option value={2.3333}>Cinematic (21:9) — Ultra-wide</option>
                  </optgroup>
                </select>
              </div>
            </div>
          )}


          {/* TAB 2: CANVAS DESIGN */}
          {activeTab === 'design' && (
            <div className="animate-fade-in color-picker-container">
              <h2 className="section-title">
                <Palette size={14} /> Background Style
              </h2>

              <select 
                value={bgType} 
                onChange={(e) => setBgType(e.target.value)}
                style={{ marginBottom: '15px' }}
              >
                <option value="preset">Theme Presets</option>
                <option value="custom-solid">Custom Solid Color</option>
                <option value="custom-gradient">Custom Gradient</option>
              </select>

              {bgType === 'preset' && (
                <div className="color-presets">
                  {BG_PRESETS.map((preset, index) => (
                    <button
                      key={preset.name}
                      title={preset.name}
                      className={`color-swatch ${bgPresetIndex === index ? 'active' : ''}`}
                      style={{ background: preset.value }}
                      onClick={() => setBgPresetIndex(index)}
                    />
                  ))}
                </div>
              )}

              {bgType === 'custom-solid' && (
                <div className="custom-color-row">
                  <input 
                    type="color" 
                    className="custom-color-input" 
                    value={customSolidBg}
                    onChange={(e) => setCustomSolidBg(e.target.value)}
                  />
                  <input 
                    type="text" 
                    value={customSolidBg.toUpperCase()}
                    onChange={(e) => setCustomSolidBg(e.target.value)}
                    placeholder="#FFFFFF"
                  />
                </div>
              )}

              {bgType === 'custom-gradient' && (
                <div className="control-group">
                  <div className="custom-color-row">
                    <input 
                      type="color" 
                      className="custom-color-input" 
                      value={customGradA}
                      onChange={(e) => setCustomGradA(e.target.value)}
                    />
                    <input 
                      type="color" 
                      className="custom-color-input" 
                      value={customGradB}
                      onChange={(e) => setCustomGradB(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <input 
                      type="text" 
                      value={customGradA.toUpperCase()} 
                      onChange={(e) => setCustomGradA(e.target.value)}
                      placeholder="#000000"
                    />
                    <input 
                      type="text" 
                      value={customGradB.toUpperCase()} 
                      onChange={(e) => setCustomGradB(e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              )}

              <hr style={{ borderColor: 'var(--border-color)', margin: '15px 0' }} />

              <h2 className="section-title">
                <Sliders size={14} /> Layout Spacing
              </h2>

              <div className="control-group">
                <div className="control-label">
                  <span>Outer Borders (Padding)</span>
                  <span className="control-value">{padding}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="80" 
                  value={padding} 
                  onChange={(e) => setPadding(parseInt(e.target.value))}
                />
              </div>

              <div className="control-group">
                <div className="control-label">
                  <span>Inner Spacing (Gaps)</span>
                  <span className="control-value">{gap}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={gap} 
                  onChange={(e) => setGap(parseInt(e.target.value))}
                />
              </div>

              <div className="control-group">
                <div className="control-label">
                  <span>Corner Roundness</span>
                  <span className="control-value">{borderRadius}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="35" 
                  value={borderRadius} 
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE FRAMES CONTROLS */}
          {activeTab === 'image' && (
            <div className="animate-fade-in control-group">
              <h2 className="section-title">
                <Sliders size={14} /> Image Slot Editor
              </h2>
              {activeSlotIndex !== null ? (
                <div className="control-group" style={{ gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Frame #{activeSlotIndex + 1} Selected
                    </span>
                    <button 
                      className="text-style-btn" 
                      onClick={() => setActiveSlotIndex(null)}
                      title="Clear Selection"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {slots[activeSlotIndex]?.imageId ? (
                    <>
                      <div className="control-group">
                        <div className="control-label">
                          <span>Image Zoom</span>
                          <span className="control-value">{Math.round((slots[activeSlotIndex].scale || 1.0) * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.2" 
                          max="4.0" 
                          step="0.05"
                          value={slots[activeSlotIndex].scale || 1.0} 
                          onChange={(e) => updateSlotControl('scale', parseFloat(e.target.value))}
                        />
                      </div>

                      <div className="control-group">
                        <div className="control-label">
                          <span>Image Rotation</span>
                          <span className="control-value">{slots[activeSlotIndex].rotation || 0}Ã‚Â°</span>
                        </div>
                        <input 
                          type="range" 
                          min="-180" 
                          max="180" 
                          value={slots[activeSlotIndex].rotation || 0} 
                          onChange={(e) => updateSlotControl('rotation', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="btn-group-2">
                        <button className="btn btn-secondary" onClick={() => fitImage(activeSlotIndex)}>
                          Fit Image
                        </button>
                        <button className="btn btn-secondary" onClick={() => fillImage(activeSlotIndex)}>
                          Fill Grid
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => triggerFileInput(activeSlotIndex)}>
                          Change Photo
                        </button>
                        <button className="btn btn-danger" onClick={() => removeSlotImage(activeSlotIndex)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '24px 10px', textAlign: 'center', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
                        This frame is currently empty.
                      </p>
                      <button className="btn btn-primary" onClick={() => triggerFileInput(activeSlotIndex)}>
                        <Upload size={16} /> Upload Photo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Info size={24} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p style={{ fontSize: '13px' }}>
                    Select any photo frame on the canvas to edit its position, zoom, and rotation details.
                  </p>
                  <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => triggerFileInput(null)}>
                    <Upload size={16} /> Upload Multiple Photos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TEXT OVERLAYS CONTROLS */}
          {activeTab === 'text' && (
            <div className="animate-fade-in control-group">
              <h2 className="section-title">
                <Type size={14} /> Text Editor
              </h2>

              <button className="btn btn-primary" onClick={addText} style={{ marginBottom: '10px' }}>
                <Plus size={16} /> Add Text Box
              </button>

              {selectedTextId && selectedText ? (
                <div className="control-group" style={{ gap: '14px' }}>
                  
                  {/* Basic Text Options */}
                  <div className="control-group">
                    <span className="control-label">Edit Text Content</span>
                    <textarea 
                      rows="2"
                      className="text-edit-textarea"
                      value={selectedText.text}
                      onChange={(e) => updateSelectedText('text', e.target.value)}
                      placeholder="Type text overlay..."
                    />
                  </div>

                  <div className="btn-group-2">
                    <div className="control-group">
                      <span className="control-label">Font Family</span>
                      <select 
                        value={selectedText.fontFamily}
                        onChange={(e) => updateSelectedText('fontFamily', e.target.value)}
                      >
                        {AVAILABLE_FONTS.map(f => (
                          <option key={f.family} value={f.family}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="control-group">
                      <div className="control-label">
                        <span>Font Size</span>
                        <span className="control-value">{selectedText.fontSize}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="12" 
                        max="140" 
                        value={selectedText.fontSize}
                        onChange={(e) => updateSelectedText('fontSize', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Sub-Tab Pill Selector (Text, Background, Border) exactly like in user's screenshots */}
                  <div className="text-styling-tabs">
                    <button 
                      className={`text-style-tab-btn ${textEditTab === 'TEXT' ? 'active' : ''}`}
                      onClick={() => setTextEditTab('TEXT')}
                    >
                      TEXT
                    </button>
                    <button 
                      className={`text-style-tab-btn ${textEditTab === 'BACKGROUND' ? 'active' : ''}`}
                      onClick={() => setTextEditTab('BACKGROUND')}
                    >
                      BACKGROUND
                    </button>
                    <button 
                      className={`text-style-tab-btn ${textEditTab === 'BORDER' ? 'active' : ''}`}
                      onClick={() => setTextEditTab('BORDER')}
                    >
                      BORDER
                    </button>
                  </div>

                  {/* SUB-TAB 1: TEXT COLOR / GRADIENT & OPACITY */}
                  {textEditTab === 'TEXT' && (
                    <div className="animate-fade-in text-control-subpanel">
                      <div className="control-label" style={{ marginBottom: '8px' }}>
                        <span>Color Options</span>
                        <div className="fill-type-toggle">
                          <button 
                            className={`toggle-sub-btn ${selectedText.fillType !== 'gradient' ? 'active' : ''}`}
                            onClick={() => updateSelectedText('fillType', 'color')}
                          >
                            Solid
                          </button>
                          <button 
                            className={`toggle-sub-btn ${selectedText.fillType === 'gradient' ? 'active' : ''}`}
                            onClick={() => updateSelectedText('fillType', 'gradient')}
                          >
                            Gradient
                          </button>
                        </div>
                      </div>

                      {/* Presets Grid */}
                      {selectedText.fillType !== 'gradient' ? (
                        <>
                          <div className="preset-swatches-row">
                            {TEXT_COLOR_PRESETS.map((color) => (
                              <button 
                                key={color}
                                className={`color-swatch-mini ${selectedText.color === color ? 'active' : ''}`}
                                style={{ background: color }}
                                onClick={() => updateSelectedText('color', color)}
                              />
                            ))}
                          </div>
                          <div className="custom-color-row" style={{ marginTop: '10px' }}>
                            <input 
                              type="color" 
                              className="custom-color-input"
                              value={selectedText.color}
                              onChange={(e) => updateSelectedText('color', e.target.value)}
                            />
                            <input 
                              type="text" 
                              value={selectedText.color.toUpperCase()}
                              onChange={(e) => updateSelectedText('color', e.target.value)}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="preset-swatches-row">
                            {GRADIENT_PRESETS.map((grad, i) => (
                              <button 
                                key={i}
                                title={grad.name}
                                className={`color-swatch-mini ${selectedText.colorGradA === grad.colors[0] && selectedText.colorGradB === grad.colors[1] ? 'active' : ''}`}
                                style={{ background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})` }}
                                onClick={() => {
                                  updateSelectedText('colorGradA', grad.colors[0]);
                                  updateSelectedText('colorGradB', grad.colors[1]);
                                }}
                              />
                            ))}
                          </div>
                          <div className="custom-color-row" style={{ marginTop: '10px' }}>
                            <input 
                              type="color" 
                              className="custom-color-input" 
                              value={selectedText.colorGradA}
                              onChange={(e) => updateSelectedText('colorGradA', e.target.value)}
                            />
                            <input 
                              type="color" 
                              className="custom-color-input" 
                              value={selectedText.colorGradB}
                              onChange={(e) => updateSelectedText('colorGradB', e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      <div className="control-group" style={{ marginTop: '14px' }}>
                        <div className="control-label">
                          <span>Text Opacity</span>
                          <span className="control-value">{selectedText.opacity || 100}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={selectedText.opacity !== undefined ? selectedText.opacity : 100}
                          onChange={(e) => updateSelectedText('opacity', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: BACKGROUND BOX OPTIONS */}
                  {textEditTab === 'BACKGROUND' && (
                    <div className="animate-fade-in text-control-subpanel">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="control-label">Enable Tag Background</span>
                        <label className="switch-toggle-label">
                          <input 
                            type="checkbox" 
                            checked={selectedText.bgEnabled}
                            onChange={(e) => updateSelectedText('bgEnabled', e.target.checked)}
                          />
                          <span className="switch-toggle-slider"></span>
                        </label>
                      </div>

                      {selectedText.bgEnabled && (
                        <>
                          <div className="control-label" style={{ marginBottom: '8px' }}>
                            <span>Background Style</span>
                            <div className="fill-type-toggle">
                              <button 
                                className={`toggle-sub-btn ${selectedText.bgType !== 'gradient' ? 'active' : ''}`}
                                onClick={() => updateSelectedText('bgType', 'color')}
                              >
                                Solid
                              </button>
                              <button 
                                className={`toggle-sub-btn ${selectedText.bgType === 'gradient' ? 'active' : ''}`}
                                onClick={() => updateSelectedText('bgType', 'gradient')}
                              >
                                Gradient
                              </button>
                            </div>
                          </div>

                          {selectedText.bgType !== 'gradient' ? (
                            <>
                              <div className="preset-swatches-row">
                                {TEXT_COLOR_PRESETS.map((color) => (
                                  <button 
                                    key={color}
                                    className={`color-swatch-mini ${selectedText.backgroundColor === color ? 'active' : ''}`}
                                    style={{ background: color }}
                                    onClick={() => updateSelectedText('backgroundColor', color)}
                                  />
                                ))}
                              </div>
                              <div className="custom-color-row" style={{ marginTop: '10px' }}>
                                <input 
                                  type="color" 
                                  className="custom-color-input"
                                  value={selectedText.backgroundColor}
                                  onChange={(e) => updateSelectedText('backgroundColor', e.target.value)}
                                />
                                <input 
                                  type="text" 
                                  value={selectedText.backgroundColor.toUpperCase()}
                                  onChange={(e) => updateSelectedText('backgroundColor', e.target.value)}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="preset-swatches-row">
                                {GRADIENT_PRESETS.map((grad, i) => (
                                  <button 
                                    key={i}
                                    title={grad.name}
                                    className={`color-swatch-mini ${selectedText.bgGradA === grad.colors[0] && selectedText.bgGradB === grad.colors[1] ? 'active' : ''}`}
                                    style={{ background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})` }}
                                    onClick={() => {
                                      updateSelectedText('bgGradA', grad.colors[0]);
                                      updateSelectedText('bgGradB', grad.colors[1]);
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="custom-color-row" style={{ marginTop: '10px' }}>
                                <input 
                                  type="color" 
                                  className="custom-color-input" 
                                  value={selectedText.bgGradA}
                                  onChange={(e) => updateSelectedText('bgGradA', e.target.value)}
                                />
                                <input 
                                  type="color" 
                                  className="custom-color-input" 
                                  value={selectedText.bgGradB}
                                  onChange={(e) => updateSelectedText('bgGradB', e.target.value)}
                                />
                              </div>
                            </>
                          )}

                          <div className="control-group" style={{ marginTop: '14px' }}>
                            <div className="control-label">
                              <span>Background Opacity</span>
                              <span className="control-value">{selectedText.bgOpacity}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={selectedText.bgOpacity}
                              onChange={(e) => updateSelectedText('bgOpacity', parseInt(e.target.value))}
                            />
                          </div>

                          <div className="control-group">
                            <div className="control-label">
                              <span>Box Roundness</span>
                              <span className="control-value">{selectedText.borderRadius}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="35" 
                              value={selectedText.borderRadius}
                              onChange={(e) => updateSelectedText('borderRadius', parseInt(e.target.value))}
                            />
                          </div>

                          <div className="control-group">
                            <div className="control-label">
                              <span>Box Spacing (Padding)</span>
                              <span className="control-value">{selectedText.padding}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="2" 
                              max="30" 
                              value={selectedText.padding}
                              onChange={(e) => updateSelectedText('padding', parseInt(e.target.value))}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: BORDER (OUTLINE) OPTIONS */}
                  {textEditTab === 'BORDER' && (
                    <div className="animate-fade-in text-control-subpanel">
                      <div className="control-group">
                        <div className="control-label">
                          <span>Outline Width (Stroke)</span>
                          <span className="control-value">{selectedText.strokeWidth || 0}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          value={selectedText.strokeWidth || 0}
                          onChange={(e) => updateSelectedText('strokeWidth', parseInt(e.target.value))}
                        />
                      </div>

                      {selectedText.strokeWidth > 0 && (
                        <>
                          <div className="control-label" style={{ marginBottom: '8px', marginTop: '10px' }}>
                            <span>Outline Color Type</span>
                            <div className="fill-type-toggle">
                              <button 
                                className={`toggle-sub-btn ${selectedText.strokeType !== 'gradient' ? 'active' : ''}`}
                                onClick={() => updateSelectedText('strokeType', 'color')}
                              >
                                Solid
                              </button>
                              <button 
                                className={`toggle-sub-btn ${selectedText.strokeType === 'gradient' ? 'active' : ''}`}
                                onClick={() => updateSelectedText('strokeType', 'gradient')}
                              >
                                Gradient
                              </button>
                            </div>
                          </div>

                          {selectedText.strokeType !== 'gradient' ? (
                            <>
                              <div className="preset-swatches-row">
                                {TEXT_COLOR_PRESETS.map((color) => (
                                  <button 
                                    key={color}
                                    className={`color-swatch-mini ${selectedText.strokeColor === color ? 'active' : ''}`}
                                    style={{ background: color }}
                                    onClick={() => updateSelectedText('strokeColor', color)}
                                  />
                                ))}
                              </div>
                              <div className="custom-color-row" style={{ marginTop: '10px' }}>
                                <input 
                                  type="color" 
                                  className="custom-color-input"
                                  value={selectedText.strokeColor}
                                  onChange={(e) => updateSelectedText('strokeColor', e.target.value)}
                                />
                                <input 
                                  type="text" 
                                  value={selectedText.strokeColor.toUpperCase()}
                                  onChange={(e) => updateSelectedText('strokeColor', e.target.value)}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="preset-swatches-row">
                                {GRADIENT_PRESETS.map((grad, i) => (
                                  <button 
                                    key={i}
                                    title={grad.name}
                                    className={`color-swatch-mini ${selectedText.strokeGradA === grad.colors[0] && selectedText.strokeGradB === grad.colors[1] ? 'active' : ''}`}
                                    style={{ background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})` }}
                                    onClick={() => {
                                      updateSelectedText('strokeGradA', grad.colors[0]);
                                      updateSelectedText('strokeGradB', grad.colors[1]);
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="custom-color-row" style={{ marginTop: '10px' }}>
                                <input 
                                  type="color" 
                                  className="custom-color-input" 
                                  value={selectedText.strokeGradA}
                                  onChange={(e) => updateSelectedText('strokeGradA', e.target.value)}
                                />
                                <input 
                                  type="color" 
                                  className="custom-color-input" 
                                  value={selectedText.strokeGradB}
                                  onChange={(e) => updateSelectedText('strokeGradB', e.target.value)}
                                />
                              </div>
                            </>
                          )}

                          <div className="control-group" style={{ marginTop: '14px' }}>
                            <div className="control-label">
                              <span>Outline Opacity</span>
                              <span className="control-value">{selectedText.strokeOpacity || 100}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={selectedText.strokeOpacity !== undefined ? selectedText.strokeOpacity : 100}
                              onChange={(e) => updateSelectedText('strokeOpacity', parseInt(e.target.value))}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

                  {/* Text General Alignment / Font style triggers */}
                  <div className="btn-group-2">
                    <div className="control-group">
                      <div className="control-label">
                        <span>Text Rotation</span>
                        <span className="control-value">{selectedText.rotation}Ã‚Â°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={selectedText.rotation}
                        onChange={(e) => updateSelectedText('rotation', parseInt(e.target.value))}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className={`tab-btn ${selectedText.bold ? 'active' : ''}`}
                          style={{ padding: '6px' }}
                          onClick={() => updateSelectedText('bold', !selectedText.bold)}
                        >
                          <Bold size={14} /> B
                        </button>
                        <button 
                          className={`tab-btn ${selectedText.italic ? 'active' : ''}`}
                          style={{ padding: '6px' }}
                          onClick={() => updateSelectedText('italic', !selectedText.italic)}
                        >
                          <Italic size={14} /> I
                        </button>
                      </div>
                      <button 
                        className={`tab-btn ${selectedText.shadow ? 'active' : ''}`}
                        style={{ padding: '6px', fontSize: '11px' }}
                        onClick={() => updateSelectedText('shadow', !selectedText.shadow)}
                      >
                        Shadow
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-danger" onClick={deleteSelectedText} style={{ marginTop: '5px' }}>
                    <Trash2 size={16} /> Delete Text
                  </button>
                </div>
              ) : (
                <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '13px' }}>
                    Click an existing text box on the canvas or click "Add Text Box" to design labels.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </aside>

      {/* Main Workspace (Canvas Viewer) */}
      <main className="workspace">
        <div 
          className="canvas-wrapper animate-fade-in"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={canvasHeight}
            className={`editor-canvas ${
              isDraggingText ? 'dragging-text' : 
              isDraggingImage ? 'panning' : 
              isResizingText ? 'dragging-text' : ''
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
          />


        </div>

        {/* Copy Collage to Clipboard and Export buttons */}
        <div className="workspace-buttons animate-fade-in">
          <button className="btn btn-secondary btn-copy" onClick={handleCopyCollage}>
            <Clipboard size={16} /> Copy Collage to Clipboard
          </button>
          <button className="btn btn-primary btn-export" onClick={handleExport}>
            <Download size={16} /> Export Collage
          </button>
        </div>

        <div className="instruction-banner animate-fade-in">
          <Info size={14} />
          <span>
            {activeSlotIndex !== null ? (
              <b>Frame selected: Drag inside to pan picture, scroll wheel to zoom.</b>
            ) : selectedTextId !== null ? (
              <b>Text selected: Drag to position, drag corner dots to resize font, press Delete to remove.</b>
            ) : (
              "Ã°Å¸â€™Â¡ Drag & drop pictures directly onto grids. Click frames/texts to configure them."
            )}
          </span>
        </div>
      </main>
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Floating Export Resolution Panel (right-side drawer) Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div
        id="export-resolution-panel"
        className={`export-res-panel${exportPanelOpen ? ' export-res-panel--open' : ''}`}
        aria-hidden={!exportPanelOpen}
      >
        {/* Toggle Tab */}
        <button
          id="export-res-toggle-btn"
          className="export-res-tab"
          title={exportPanelOpen ? 'Hide Export Settings' : 'Show Export Settings'}
          onClick={() => setExportPanelOpen(v => !v)}
          aria-expanded={exportPanelOpen}
        >
          <Sliders size={15} />
          <span className="export-res-tab-label">
            {exportPanelOpen ? 'Hide' : 'Export'}
          </span>
        </button>

        {/* Panel Body */}
        <div className="export-res-body">
          <p className="export-res-title">
            <Sliders size={14} /> Export Resolution
          </p>

          <div className="control-group">
            <div className="control-label">
              <span>Quality</span>
              <span className="control-value">{exportResolution}x&nbsp;({CANVAS_WIDTH * exportResolution}px)</span>
            </div>
            <select
              id="export-res-select"
              value={exportResolution}
              onChange={(e) => setExportResolution(parseInt(e.target.value))}
            >
              <option value={1}>Standard Web (1Ãƒâ€”)</option>
              <option value={2}>High Definition (2Ãƒâ€” HD)</option>
              <option value={3}>Print Quality (3Ãƒâ€” UHD)</option>
            </select>
          </div>

          {/* Quality indicator pills */}
          <div className="export-res-pills">
            {[1, 2, 3].map(r => (
              <button
                key={r}
                className={`export-res-pill${exportResolution === r ? ' active' : ''}`}
                onClick={() => setExportResolution(r)}
              >
                {r === 1 ? '1Ãƒâ€” Web' : r === 2 ? '2Ãƒâ€” HD' : '3Ãƒâ€” UHD'}
              </button>
            ))}
          </div>

          {/* Divider */}
          <hr className="export-res-divider" />

          {/* Action Buttons */}
          <div className="export-res-actions">
            <button
              id="export-reset-btn"
              className="btn btn-secondary export-res-reset-btn"
              onClick={handleClearAll}
              title="Reset Canvas"
            >
              <RefreshCw size={15} /> Reset
            </button>
            <button
              id="export-collage-btn"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleExport}
            >
              <Download size={15} /> Export Collage
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;