# 📸 GlowCollage — Free Online Collage Maker & Photo Grid Creator

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/)

**GlowCollage** is a modern, responsive, and feature-rich **free collage app online** designed to help anyone create stunning photo grids, collage strips, and custom layouts in seconds. Whether you need a simple **2x2 grid**, a detailed **2x4 layout**, a long **2x6 story grid**, or vertical photo strips (1x3, 1x4), GlowCollage provides an interactive, drag-and-drop workspace directly in your web browser. 

Unlike other online collage makers, GlowCollage is 100% free, runs entirely in your browser (no server uploads required for privacy), features no watermarks, and lets you export high-resolution collages up to 3x scale.

---

## 🚀 Key Features

*   **Multiple Grid Layouts & Presets:**
    *   **2 × 2 Grid** (Perfect for square posts)
    *   **2 × 4 Grid** (Ideal for detailed portfolios or comparisons)
    *   **2 × 6 Grid** (Great for comprehensive stories or timelines)
    *   **1 × 3 & 1 × 4 Photo Strips** (Classic retro photobooth style)
*   **Fully Customizable Grid Geometry:**
    *   Adjustable canvas padding, inner gaps, and cell border-radii.
    *   Variable cell aspect ratios (Square 1:1, Portrait 3:4, Landscape 4:3).
*   **Interactive Image Slots:**
    *   Click-to-upload simplicity.
    *   Interactive **drag-to-pan** (re-position images inside their cells).
    *   Fine-tune individual cell image rotation, scaling, and panning from the design panel.
*   **Aesthetic & Premium Backgrounds:**
    *   Clean solid colors or professionally curated linear gradient presets (e.g., Sunset Glow, Neon Indigo, Mystic Forest).
    *   Custom color pickers for custom solid backgrounds or multi-color gradients.
*   **Rich Text Overlays & Meme Styling:**
    *   Add custom headings, meme text, or captions anywhere on the canvas.
    *   Choose from popular Google Fonts (Outfit, Montserrat, Playfair Display, Pacifico, Anton, Caveat, Permanent Marker).
    *   Apply solid text colors or vertical text gradient fills.
    *   Add thick text borders (strokes), drop shadows, and pill-shaped background banners with adjustable opacity.
*   **High-Resolution Canvas Export:**
    *   Export your collages instantly as high-quality PNGs.
    *   Select your export scale (1x, 2x, or 3x resolution) for crystal-clear prints or social media sharing.
*   **No Watermarks & 100% Client-Side:** Keep your photos private. All processing is done locally on your machine.

---

## 🎨 Interactive Controls & Keyboard Shortcuts

*   **Drag & Pan Images:** Select an image cell and drag with your mouse to reposition the photo.
*   **Move & Resize Text:** Click and drag text overlays directly on the canvas. Use the corner handles to scale the text size dynamically.
*   **Delete Text:** Select a text overlay and press the `Delete` or `Backspace` key on your keyboard to remove it.

---

## 🛠️ How to Run Locally (Self-Hosting & Contribution)

Since GlowCollage is completely open-source, you can clone the repository, run it on your own machine, or host it yourself.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16.0 or higher recommended).

### Setup & Run
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/collager-maker.git
    cd collager-maker
    ```
2.  **Install Dependencies:**
    *(Note: The `node_modules` directory is excluded via `.gitignore` to keep the repo lightweight)*
    ```bash
    npm install
    ```
3.  **Start the Local Development Server:**
    ```bash
    npm run dev
    ```
    Once the server starts, open your browser and navigate to `http://localhost:5173` (or the port specified in your console).

4.  **Build for Production:**
    ```bash
    npm run build
    ```
    The production-ready assets will be generated in the `dist/` directory.

---

## ⚙️ Project Architecture

```
├── public/               # Static assets
├── src/
│   ├── assets/           # App icons/assets
│   ├── App.css           # Vanilla styling & theme setup
│   ├── App.jsx           # Main React App containing canvas & sidebar logic
│   ├── index.css         # Global styles & tailwind/variables
│   └── main.jsx          # App entry point
├── package.json          # Dependency and script manager
├── vite.config.js        # Vite compilation configurations
└── .gitignore            # Rules for files to be ignored by Git
```

---

## 🔍 SEO Best Practices Integrated

This repository is optimized for discoverability:
*   **Semantic HTML Structure:** Structured sections with clear markdown headings from `H1` to `H3` for search spiders.
*   **Keyword Optimization:** Packed with highly-searched terms such as *free collage app online*, *high-resolution photo collage*, *photo grid creator*, and *no watermark collage maker*.
*   **Responsive Readme:** Looks pristine on GitHub web, mobile interfaces, and markdown previewers.

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for new presets, grid layouts, or features:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by Anwar Zaib — Made to be simple for everyone.
