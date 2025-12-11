import { Node } from "./tree";

export class CanvasVisualizer {
    constructor(private tree: Node, private options: { nodeRadius: number; levelHeight: number }) {}

    mount(canvas: HTMLCanvasElement) {
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
                const y = 40 + depth * levelHeight;

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
}
