import { GEMINI_API_KEY } from '@/config';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

export const callGeminiAPI = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const conductResearch = async (topic: string): Promise<string> => {
  const prompt = `Research the topic: "${topic}" and provide:

1. **Core Definition**: What is it?
2. **Key Physics/Science**: 3-4 main scientific principles
3. **Key Parameters**: Variables that can be controlled/changed
4. **Visual Behavior**: How it looks and moves
5. **Real Values**: Actual numbers, ranges, units

Keep it concise and simulation-focused.`;

  return await callGeminiAPI(prompt);
};

// A robust function to fix all module paths for blob compatibility
const fixModuleImports = (htmlCode: string): string => {
  console.log('Fixing all module imports to use absolute URLs for blob compatibility...');
  
  const currentOrigin = window.location.origin;
  let fixedHtml = htmlCode;

  // Step 1: Remove any existing import maps. They are a common cause of this error
  // as they don't work correctly in a blob URL context.
  fixedHtml = fixedHtml.replace(/<script\s+type=["']importmap["'][\s\S]*?<\/script>/gi, (match) => {
    console.log('Removing detected import map:', match);
    return ''; // Remove the script tag entirely
  });
  
  // Step 2: Define a single, comprehensive map for all possible import specifiers to their local absolute URLs.
  // This handles bare specifiers, relative paths, CDN URLs, and different addon paths in one go.
  const importReplacements = {
    // --- Core 'three' specifier (the main cause of the error) ---
    'from "three"': `from "${currentOrigin}/libs/three.module.js"`,
    "from 'three'": `from '${currentOrigin}/libs/three.module.js'`,
    'from "./libs/three.module.js"': `from "${currentOrigin}/libs/three.module.js"`,
    "from './libs/three.module.js'": `from '${currentOrigin}/libs/three.module.js'`,
    'from "https://unpkg.com/three"': `from "${currentOrigin}/libs/three.module.js"`,
    'from "https://cdn.skypack.dev/three"': `from "${currentOrigin}/libs/three.module.js"`,

    // --- Addon: OrbitControls (covers old, new, relative, and CDN paths) ---
    'from "three/examples/jsm/controls/OrbitControls"': `from "${currentOrigin}/libs/OrbitControls.js"`,
    "from 'three/examples/jsm/controls/OrbitControls'": `from '${currentOrigin}/libs/OrbitControls.js'`,
    'from "three/addons/controls/OrbitControls.js"': `from "${currentOrigin}/libs/OrbitControls.js"`,
    "from 'three/addons/controls/OrbitControls.js'": `from '${currentOrigin}/libs/OrbitControls.js'`,
    'from "./libs/OrbitControls.js"': `from "${currentOrigin}/libs/OrbitControls.js"`,
    "from './libs/OrbitControls.js'": `from '${currentOrigin}/libs/OrbitControls.js'`,

    // --- Addon: GLTFLoader ---
    'from "three/examples/jsm/loaders/GLTFLoader"': `from "${currentOrigin}/libs/GLTFLoader.js"`,
    "from 'three/examples/jsm/loaders/GLTFLoader'": `from '${currentOrigin}/libs/GLTFLoader.js'`,
    'from "three/addons/loaders/GLTFLoader.js"': `from "${currentOrigin}/libs/GLTFLoader.js"`,
    "from 'three/addons/loaders/GLTFLoader.js'": `from '${currentOrigin}/libs/GLTFLoader.js'`,
  };

  // Step 3: Apply all replacements. Using split/join is a robust way to replace all occurrences.
  Object.entries(importReplacements).forEach(([find, replace]) => {
    if (fixedHtml.includes(find)) {
      console.log(`Replacing module path: ${find} -> ${replace}`);
      fixedHtml = fixedHtml.split(find).join(replace);
    }
  });

  // Step 4: Handle dynamic imports like `import('three')` which are also a common failure point.
  const dynamicImportReplacements = {
    "import('three')": `import('${currentOrigin}/libs/three.module.js')`,
    'import("three")': `import("${currentOrigin}/libs/three.module.js")`,
    "import('./libs/three.module.js')": `import('${currentOrigin}/libs/three.module.js')`,
    'import("./libs/three.module.js")': `import("${currentOrigin}/libs/three.module.js")`,
    "import('./libs/OrbitControls.js')": `import('${currentOrigin}/libs/OrbitControls.js')`,
    'import("./libs/OrbitControls.js")': `import("${currentOrigin}/libs/OrbitControls.js")`,
  };
  Object.entries(dynamicImportReplacements).forEach(([find, replace]) => {
    if (fixedHtml.includes(find)) {
        console.log(`Replacing dynamic import: ${find} -> ${replace}`);
        fixedHtml = fixedHtml.split(find).join(replace);
    }
  });

  if (fixedHtml !== htmlCode) {
    console.log('Successfully converted all imports to absolute URLs for blob compatibility');
  } else {
    console.warn('No module imports were converted. The AI might have generated an unexpected path.');
  }

  return fixedHtml;
};


// CRITICAL: This function injects CSS and JS to fix scaling and responsiveness.
const injectViewportAndResizeFixes = (htmlCode: string): string => {
  console.log('Injecting responsive viewport fixes into simulation HTML...');

  const meta = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;

  const styles = `
    <style>
      /* Basic reset for responsiveness, but preserving layout */
      * {
        box-sizing: border-box;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      /* Remove the absolute positioning that causes overlap */
      canvas, svg {
        display: block !important;
        max-width: 100% !important;
        /* Removed absolute positioning and 100% height/width */
      }
      /* For simulation containers */
      #simulation-container, .simulation-container, .canvas-container {
        position: relative; /* Allow proper layout */
      }
    </style>
  `;

  const script = `
    <script type="module">
      // A more robust resize handler
      const handleResize = () => {
        const container = document.body;
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // --- Three.js ---
        if (window.camera && window.renderer) {
          console.log('Resizing Three.js scene...');
          window.camera.aspect = width / height;
          window.camera.updateProjectionMatrix();
          window.renderer.setSize(width, height);
          return;
        }

        // --- P5.js ---
        if (window.p5Instance && typeof window.p5Instance.resizeCanvas === 'function') {
          console.log('Resizing P5.js canvas...');
          window.p5Instance.resizeCanvas(width, height);
          return;
        }
        
        // --- Matter.js ---
        if (window.render && window.render.canvas) {
            console.log('Resizing Matter.js renderer...');
            const render = window.render;
            render.bounds.max.x = width;
            render.bounds.max.y = height;
            render.options.width = width;
            render.options.height = height;
            render.canvas.width = width;
            render.canvas.height = height;
            if (typeof Matter !== 'undefined' && typeof Matter.Render.setPixelRatio === 'function') {
              Matter.Render.setPixelRatio(render, window.devicePixelRatio);
            }
            return;
        }

        // --- Generic Canvas Fallback ---
        const canvas = document.querySelector('canvas');
        if (canvas) {
          console.log('Resizing generic canvas as a fallback...');
          canvas.width = width;
          canvas.height = height;
        }
      };

      // Run resize logic on load and on every window resize.
      // Use a small timeout to ensure the DOM is fully ready for measurements.
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(handleResize, 50);
      });
      window.addEventListener('resize', handleResize);
    </script>
  `;

  let fixedHtml = htmlCode;
  const headContent = `\n${meta}\n${styles}\n${script}\n`;

  // Inject meta, styles, and script into the <head> tag for reliable execution
  if (fixedHtml.includes('<head>')) {
    fixedHtml = fixedHtml.replace('<head>', `<head>${headContent}`);
  } else if (fixedHtml.includes('</head>')) {
    fixedHtml = fixedHtml.replace('</head>', `${headContent}</head>`);
  } else {
    // Fallback if no <head> tag is present
    fixedHtml = `<head>${headContent}</head>\n` + fixedHtml;
  }

  return fixedHtml;
};

export const buildSimulation = async (topic: string, researchData: string): Promise<string> => {
  const prompt = `Create ONE interactive HTML simulation for: "${topic}"

Research: ${researchData}

CRITICAL REQUIREMENTS:
- Single HTML file with embedded CSS and JavaScript.
- The simulation MUST be fully visible and responsive. It will be placed in an iframe.
- DO NOT set fixed pixel widths or heights on the body, canvas, or other main containers. Use percentages (100%) to fill the available space.
- The main canvas or SVG must fill its parent container (width: 100%, height: 100%).
- Add a window resize listener in your JavaScript to update the simulation's dimensions (e.g., camera aspect ratio, renderer size).
- Dark theme with vibrant colors suitable for a science lab.
- Only provide HTML code, no additional text or explanations.

VIEWPORT & RESIZING RULES:
- CRITICAL: Expose key variables to the global scope so they can be accessed by external scripts.
- For Three.js, ensure 'camera', 'renderer', and 'scene' are available as 'window.camera', 'window.renderer', and 'window.scene'.
- For P5.js, store the p5 instance in 'window.p5Instance'.
- For Matter.js, expose 'engine' and 'render' to the window object.
- For Pixi.js, expose 'app' as 'window.app'.

MODULE IMPORT RULES:
- For Three.js, use local imports: import * as THREE from './libs/three.module.js';
- For Pixi.js, use: <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.2.4/pixi.min.js"></script>
- For P5.js, use: <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
- For D3.js, use: <script src="https://d3js.org/d3.v7.min.js"></script>
- For Matter.js, use: <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>

CRITICAL: When using Pixi.js, ALWAYS include this exact script tag in the <head> section:
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.2.4/pixi.min.js"></script>

Make the simulation in pixi.js / p5.js / d3.js according to the need most of the time.
Choose pixi.js over p5.js for 2D simulations. 
Use three js only if the user has requested 3d stimulation specifically.

EXAMPLE PIXI.JS STRUCTURE:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.2.4/pixi.min.js"></script>
  <style>
    /* Your styles here */
  </style>
</head>
<body>
  <div id="simulation-container"></div>
  <script>
    // Wait for PIXI to load
    document.addEventListener('DOMContentLoaded', () => {
      // Your Pixi.js code here
      const app = new PIXI.Application({...});
      window.app = app; // Expose globally
    });
  </script>
</body>
</html>
\`\`\`

EXAMPLE RESIZE HANDLER (Three.js):
\`\`\`javascript
// Make variables globally accessible
window.camera = camera;
window.renderer = renderer;
window.scene = scene;

window.addEventListener('resize', () => {
  const container = document.body;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
// Initial call to set size
window.dispatchEvent(new Event('resize'));
\`\`\`
Try to make the animation visually stunning!
Focus on core concept visualization with essential interactivity only.`;

  const rawHtmlFromAI = await callGeminiAPI(prompt);
  
  // Clean the AI's output by removing markdown code fences
  let cleanedHtml = rawHtmlFromAI.trim();

  // Remove the starting and ending markdown fences
  const markdownFenceRegex = /^` + "```" + `html\\s*([\\s\\S]+?)\\s*` + "```" + `$/;
  const match = cleanedHtml.match(markdownFenceRegex);

  if (match) {
    cleanedHtml = match[1].trim();
  }

  // First, fix module imports to be valid URLs
  cleanedHtml = fixModuleImports(cleanedHtml);

  // THEN, inject our robust viewport and resize fixes
  cleanedHtml = injectViewportAndResizeFixes(cleanedHtml);

  // Double-check that it starts with the correct doctype or html tag
  const lowerCaseHtml = cleanedHtml.toLowerCase();
  if (!lowerCaseHtml.startsWith('<!doctype html') && !lowerCaseHtml.startsWith('<html')) {
    console.warn('Cleaned response may not be valid HTML.');
  }

  console.log('Successfully processed HTML output with robust viewport fixes.');
  
  return cleanedHtml;
};