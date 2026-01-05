<p align="center">
  <img src="https://img.shields.io/badge/WebGL-1.0-orange?style=flat-square" alt="WebGL 1.0">
  <img src="https://img.shields.io/badge/GLSL-ES%201.0-blue?style=flat-square" alt="GLSL ES 1.0">
  <img src="https://img.shields.io/badge/AI-Cursor%20Rules-purple?style=flat-square" alt="Cursor Rules">
</p>

# ✨ Shader Web Background Toolkit

A complete development environment for creating stunning WebGL shader backgrounds. This toolkit includes **AI-assisted Shadertoy conversion rules**, a shader registry system, and example implementations—from simple gradients to complex raymarched fractals.

<p align="center">
  <a href="https://mrknstudio.github.io/shader-background/">Live Demo</a> •
  <a href="https://mrknstudio.github.io/shader-background/examples/minimal-example.html">Minimal Example</a> •
  <a href="https://mrknstudio.github.io/shader-background/examples/viewport-aware-example.html">Viewport-Aware Example</a> •
  <a href="https://mrknstudio.github.io/shader-background/examples/card-borders-experiment.html">Shader Borders</a>
</p>

---

## 🎯 What This Project Does

Converting [Shadertoy](https://shadertoy.com) shaders to production websites is notoriously tricky—Shadertoy uses WebGL 2.0 features, while most production sites need WebGL 1.0 compatibility. This toolkit solves that problem.

| Feature | Description |
|---------|-------------|
| **AI Conversion Rules** | Comprehensive `.cursor` rules that teach AI assistants how to convert Shadertoy code automatically |
| **Shader Registry** | Clean JavaScript API for registering and switching between multiple shaders |
| **Working Examples** | From simple gradients to complex multi-pass feedback loops |
| **Interaction Handling** | Mouse, scroll parallax, and device orientation support |
| **Error Handling** | Built-in `onError` callback for graceful fallbacks when WebGL is unavailable |

---

## 🖥️ Demos

### Main Demo
Explore all shader examples with a dropdown selector:
**[https://mrknstudio.github.io/shader-background/](https://mrknstudio.github.io/shader-background/)**

### Minimal Integration Example
Clean, self-contained example with the Interactive Blob effect:
**[https://mrknstudio.github.io/shader-background/examples/minimal-example.html](https://mrknstudio.github.io/shader-background/examples/minimal-example.html)**

### Viewport-Aware Multi-Canvas Example
Performance-optimized example with multiple canvases that pause rendering when not visible:
**[https://mrknstudio.github.io/shader-background/examples/viewport-aware-example.html](https://mrknstudio.github.io/shader-background/examples/viewport-aware-example.html)**

### Shader Borders Example
Multi-canvas showcase with animated shader borders on cards:
**[https://mrknstudio.github.io/shader-background/examples/card-borders-experiment.html](https://mrknstudio.github.io/shader-background/examples/card-borders-experiment.html)**

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/mrknstudio/shader-background.git
cd shader-background
```

### 2. Open in Browser
Open `index.html` in your browser (use a local server for best results):
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

### 3. Explore & Experiment
- Use the dropdown to switch between shader examples
- Copy any shader as a template for your own creations
- Paste Shadertoy code and let AI handle the conversion using the included rules

---

## 📁 Project Structure

```
/shader-background/
├── .cursor/
│   └── rules/
│       ├── converting-from-shadertoy.mdc       ← AI conversion rules
│       ├── css-styling.mdc                     ← CSS styling guidelines
│       ├── interaction.mdc                     ← Mouse/gyro handling
│       └── shader-testing-environment.mdc      ← Project documentation
├── src/
│   ├── shader-web-background.min.js            ← Core library
│   ├── main.js                                 ← ShaderRegistry controller
│   └── styles.css                              ← UI styling
├── shaders/
│   ├── gradient.js                             ← Simple single-pass
│   ├── feedback-circle.js                      ← Two-pass with buffer
│   ├── spectral-feedback.js                    ← Zucconi spectral colors
│   ├── interactive-blob.js                     ← Mouse/gyro interaction
│   ├── demo-shader.js                          ← Advanced multi-input
│   ├── voronoi-dreams.js                       ← Ethereal flowing ribbons
│   └── shadertoy-example-*.js                  ← Converted Shadertoy shaders
├── shadertoy/
│   └── shadertoy-example-*.txt                 ← Original Shadertoy source code
├── examples/
│   ├── minimal-example.html                    ← Minimal integration example
│   ├── viewport-aware-example.html             ← Performance-optimized example
│   └── card-borders-experiment.html            ← Shader borders on cards
├── index.html                                  ← Main demo (shader source + UI)
├── README.md                                   ← Project documentation
└── favicon.ico                                 ← Site icon
```

---

## 🤖 AI Conversion Rules

The `.cursor/rules/converting-from-shadertoy.mdc` file contains comprehensive conversion instructions. When working with Shadertoy code in [Cursor](https://cursor.sh), the AI will automatically:

- Convert `mainImage()` → `main()` entry point
- Replace `fragCoord` / `fragColor` with GLSL equivalents
- Fix `iResolution` type mismatch (vec3 → vec2)
- Rewrite complex for-loops to WebGL 1.0 compatible form
- Implement missing functions like `tanh()`, `isnan()`, `round()`
- Expand problematic macros and fix variable shadowing
- Convert `texture()` → `texture2D()`

### Using in Cursor

Just paste Shadertoy code and ask:
```
"Convert this Shadertoy shader to work with shader-web-background"
```

### Using in Other IDEs

| IDE | How to Use |
|-----|------------|
| **VS Code + Copilot/Codeium** | Create `.github/copilot-instructions.md` and paste the rule contents |
| **JetBrains + AI Assistant** | Add to project-level AI context or custom prompts |
| **Windsurf** | Use `.windsurfrules` file in project root |
| **Any AI Chat** | Paste the rules as system context before your conversion request |

---

## 📝 Adding Your Own Shaders

### Step 1: Add Shader Source to `index.html`

```html
<script type="x-shader/x-fragment" id="my-shader-image">
  precision highp float;
  uniform float iTime;
  uniform vec2 iResolution;

  void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(col, 1.0);
  }
</script>
```

### Step 2: Create Registration File `shaders/my-shader.js`

```javascript
ShaderRegistry.register('my-shader', {
  onError: function (error, canvas) {
    // Optional: Handle errors (e.g., WebGL not supported)
    console.error('Shader failed:', error);
  },
  shaders: {
    'my-shader-image': {
      uniforms: {
        iTime: (gl, loc) => gl.uniform1f(loc, performance.now() / 1000),
        iResolution: (gl, loc, ctx) => gl.uniform2f(loc, ctx.width, ctx.height)
      }
    }
  }
}, '<strong>My Shader</strong> Custom description here.');
```

### Step 3: Add to `index.html`

```html
<option value="my-shader">My Shader</option>
<script src="shaders/my-shader.js"></script>
```

---

## 🔄 Multi-Pass Shaders (Feedback Buffers)

For shaders that need previous frame data (trails, blur, reaction-diffusion):

```javascript
ShaderRegistry.register('my-shader', {
  shaders: {
    // Buffer pass: reads from itself, writes processed result
    'my-shader-buffer': {
      uniforms: {
        iChannel0: (gl, loc, ctx) => ctx.texture(loc, ctx.buffers['my-shader-buffer']),
        iResolution: (gl, loc, ctx) => gl.uniform2f(loc, ctx.width, ctx.height)
      }
    },
    // Image pass: reads buffer and outputs to screen
    'my-shader-image': {
      uniforms: {
        iChannel0: (gl, loc, ctx) => ctx.texture(loc, ctx.buffers['my-shader-buffer']),
        iResolution: (gl, loc, ctx) => gl.uniform2f(loc, ctx.width, ctx.height)
      }
    }
  }
}, 'Description');
```

The library handles double-buffering automatically—you read from the previous frame and write to the current frame.

---

## 🎯 Viewport-Aware Rendering (Multiple Canvases)

For pages with multiple shader canvases, you can optimize performance by pausing rendering when canvases are not visible. The `examples/viewport-aware-example.html` demonstrates this pattern.

### Key Features

- **IntersectionObserver API**: Automatically detects when canvases enter/leave viewport
- **Tab Visibility**: Pauses rendering when browser tab is hidden
- **Shared Shader Source**: Multiple canvases can share the same shader code
- **Phase Offsets**: Each canvas can have unique phase offsets for visual variety

### Phase Offsets Pattern

When using the same shader on multiple canvases, you can create visual variety by adding phase offsets:

```javascript
// Define phase offsets (in radians)
const phaseOffsets = {
  1: 0,                    // 0°
  2: Math.PI * 2 / 3,      // 120°
  3: Math.PI * 4 / 3       // 240°
};

// In shader source, add iPhase uniform
uniform float iPhase;

// Use in shader calculation
float t = iTime * 0.5 + iPhase;

// Pass phase offset as uniform
iPhase: function (gl, loc) {
  gl.uniform1f(loc, phaseOffsets[canvasId]);
}
```

This creates the same animation pattern but offset in time, giving each canvas a unique look while sharing the same shader code.

### Implementation Pattern

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
  });
}, { threshold: 0.01, rootMargin: '50px' });

const ctx = shaderWebBackground.shade({
  canvas: canvas,
  onBeforeFrame: function(ctx) {
    if (!isVisible) return; // Skip rendering when not visible
    // ... rest of your code
  },
  shaders: { /* ... */ }
});
```

---

## ⚡ Quick Shadertoy Conversion Checklist

- [ ] Add `precision highp float;` at top
- [ ] Declare uniforms: `iTime`, `iResolution`, `iChannel0`...
- [ ] `mainImage(out vec4 fragColor, vec2 fragCoord)` → `void main()`
- [ ] `fragCoord` → `gl_FragCoord.xy`
- [ ] `fragColor` → `gl_FragColor`
- [ ] `vec3 r = iResolution` → `vec3 r = vec3(iResolution, 1.0)`
- [ ] Complex for-loops → simple `for(int i=0; i<N; i++)` with break
- [ ] `tanh(x)` → custom implementation
- [ ] `isnan(x)` → `x != x`
- [ ] `texture()` → `texture2D()`

---

## 🎨 Included Shader Examples

| Shader | Description |
|--------|-------------|
| **Simple Gradient** | Single-pass animated color cycling using sin waves |
| **Feedback Circle** | Orbiting circle with fading trail—demonstrates buffer feedback |
| **Spectral Feedback** | Zucconi spectral algorithm for natural rainbow colors |
| **Interactive Blob** | Mouse and gyroscope controlled metaballs with trails |
| **Voronoi Dreams** | Ethereal flowing silk ribbons with hypnotic mouse interaction |
| **Demo Shader** | Advanced multi-input: mouse, scroll parallax, device orientation |
| **Shadertoy Examples 1-3** | Real-world Shadertoy ports demonstrating conversion techniques |
| **Viewport-Aware Example** | Multiple canvases with IntersectionObserver-based pause/resume |
| **Shader Borders** | Multi-canvas showcase with animated shader borders on cards |

---

## 📚 Resources

- [shader-web-background](https://github.com/xemantic/shader-web-background) — Original library by xemantic
- [Shadertoy](https://www.shadertoy.com) — Shader community and inspiration
- [The Book of Shaders](https://thebookofshaders.com) — Learn GLSL fundamentals
- [Inigo Quilez Articles](https://iquilezles.org/articles/) — Advanced shader techniques

---

## 🙏 Credits

Built with [shader-web-background](https://github.com/xemantic/shader-web-background) by [xemantic](https://github.com/xemantic)

---

<p align="center">Made with ❤️ for the shader community</p>
