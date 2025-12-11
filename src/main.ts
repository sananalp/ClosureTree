// =============================
// CLOSED TREE IMPLEMENTATION
// =============================

export interface INode {
    root: Node | null;
    parent: Node | null;

    prev: Node | null;
    next: Node | null;

    first: Node | null;
    last: Node | null;

    count: number;

    add(node: Node): void;
    remove(node: Node): void;
    each(cb: (node: Node) => void): void;
}

export class Node implements INode {
    root: Node | null = null;
    parent: Node | null = null;

    prev: Node | null = null;
    next: Node | null = null;

    first: Node | null = null;
    last: Node | null = null;

    count = 0;
    value: string;

    constructor(value: string) {
        this.value = value;
        this.root = this;
    }

    add(node: Node) {
        if (node.parent) {
            node.parent.remove(node);
        }

        node.parent = this;

        node.root = this.root ?? this;

        if (this.count === 0) {
            this.first = node;
            this.last = node;
            node.prev = null;
            node.next = null;
        } else {
            node.prev = this.last;
            node.next = null;
            if (this.last) this.last.next = node;
            this.last = node;
        }

        this.count++;

        this._updateRoot(node);
    }

    remove(node: Node) {
        if (node.parent !== this) return;

        if (node.prev) node.prev.next = node.next;
        else this.first = node.next;

        if (node.next) node.next.prev = node.prev;
        else this.last = node.prev;

        this.count--;

        node.parent = null;
        node.prev = null;
        node.next = null;
        node.root = node;
    }

    each(cb: (node: Node) => void) {
        let cur = this.first;
        while (cur) {
            cb(cur);
            cur = cur.next;
        }
    }

    private _updateRoot(node: Node) {
        node.root = this.root ?? this;
        node.each(child => this._updateRoot(child));
    }

    traverse(cb: (node: Node, depth: number) => void, depth = 0) {
        cb(this, depth);
        this.each(child => child.traverse(cb, depth + 1));
    }
}

// =============================
// VISUALIZATION
// =============================

import { Application, Graphics } from "pixi.js";

export class TreeVisualizer {
    constructor(
        private tree: Node,
        private options: { nodeRadius: number; levelHeight: number }
    ) {}

    // ---------- DOM ----------
    mountDOM(container: HTMLElement) {
        container.innerHTML = "";
        container.style.fontFamily = "sans-serif";

        const render = (node: Node, depth = 0) => {
            const block = document.createElement("div");
            block.style.marginLeft = depth * 24 + "px";
            block.style.marginTop = "4px";
            block.style.color = "#e2e8f0";

            block.textContent = `${node.value} (children: ${node.count})`;
            container.appendChild(block);

            node.each(child => render(child, depth + 1));
        };

        render(this.tree);
    }

// ---------- CANVAS ----------
mountCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;
    const { nodeRadius, levelHeight } = this.options;

    // Подгоняем canvas под размер родителя
    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const positions = new Map<number, Node[]>();

    this.tree.traverse((node, depth) => {
        if (!positions.has(depth)) positions.set(depth, []);
        positions.get(depth)!.push(node);
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;

    positions.forEach((nodes, depth) => {
        const spacing = canvas.width / (nodes.length + 1);

        nodes.forEach((node, index) => {
            const x = spacing * (index + 1);
            const y = 40 + depth * levelHeight; // чуть ближе к верху

            (node as any)._cx = x;
            (node as any)._cy = y;

            if (node.parent && (node.parent as any)._cx) {
                ctx.strokeStyle = "#64748b";
                ctx.beginPath();
                ctx.moveTo((node.parent as any)._cx, (node.parent as any)._cy);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.fillStyle = "#3b82f6";
            ctx.strokeStyle = "#1e40af";
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "white";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(node.value.slice(0, 6), x, y);
        });
    });
}


// ---------- PIXI (WebGL) ----------
mountPixi(app: Application) {
    const { nodeRadius, levelHeight } = this.options;
    const positions = new Map<number, Node[]>();

    // Чистим сцену перед перерисовкой
    app.stage.removeChildren();

    // Подгоняем размеры под контейнер
    const parent = app.canvas.parentElement!;
    app.renderer.resize(parent.clientWidth, parent.clientHeight);

    this.tree.traverse((node, depth) => {
        if (!positions.has(depth)) positions.set(depth, []);
        positions.get(depth)!.push(node);
    });

    positions.forEach((nodes, depth) => {
        const spacing = app.canvas.width / (nodes.length + 1);

        nodes.forEach((node, index) => {
            const x = spacing * (index + 1);
            const y = 40 + depth * levelHeight;

            (node as any)._px = x;
            (node as any)._py = y;

            if (node.parent && (node.parent as any)._px) {
                const g = new Graphics()
                    .moveTo((node.parent as any)._px, (node.parent as any)._py)
                    .lineTo(x, y)
                    .stroke({ color: 0x64748b, width: 2 });
                app.stage.addChild(g);
            }

            const circle = new Graphics()
                .circle(0, 0, nodeRadius)
                .fill({ color: 0x3b82f6 })
                .stroke({ color: 0x1e40af, width: 2 });
            circle.x = x;
            circle.y = y;

            app.stage.addChild(circle);
        });
    });
}
}

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
c1.add(g11);

// 2. Create visualizer
const visualizer = new TreeVisualizer(root, {
    nodeRadius: 20,
    levelHeight: 100
});

// 3. DOM visual
visualizer.mountDOM(document.getElementById("dom")!);

// 4. Canvas visual
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// Функция ресайза
function resizeCanvas() {
    visualizer.mountCanvas(canvas);
}

// Сразу вызываем
resizeCanvas();

// Слушаем изменение окна
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
    visualizer.mountPixi(app);
}

// Сразу вызываем
resizePixi();

// Слушаем изменение окна
window.addEventListener("resize", () => resizePixi());
