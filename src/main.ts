import { Node } from "./tree";
import { DOMVisualizer } from "./domVisualizer";
import { CanvasVisualizer } from "./canvasVisualizer";
import { PixiVisualizer } from "./pixiVisualizer";
import { Application } from "pixi.js";

// =============================
// USAGE
// =============================

// 1. Build tree
const root = new Node("Root");
const c1 = new Node("Child 1");
const c2 = new Node("Child 2");
const g11 = new Node("Grand 1.1");

root.add(c1);
root.add(c2);
c2.add(g11);

// 2. Create visualizers
const domVis = new DOMVisualizer(root);
const canvasVis = new CanvasVisualizer(root, { nodeRadius: 20, levelHeight: 100 });
const pixiVis = new PixiVisualizer(root, { nodeRadius: 20, levelHeight: 100 });

// 3. DOM visual
domVis.mount(document.getElementById("dom")!);

// ---------- CANVAS ----------
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
function resizeCanvas() {
    canvasVis.mount(canvas);
}
resizeCanvas();
window.addEventListener("resize", () => resizeCanvas());

// 5. Pixi visual (WebGL)
const app = new Application();

await app.init({
    background: "#1e293b",
    resizeTo: document.getElementById("pixi")!
});

document.getElementById("pixi")!.appendChild(app.canvas);

// Функция ресайза
function resizePixi() {
    pixiVis.mount(app);
}
resizePixi();
window.addEventListener("resize", () => resizePixi());