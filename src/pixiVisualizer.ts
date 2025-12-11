import { Node } from "./tree";
import { Application, Graphics } from "pixi.js";

export class PixiVisualizer {
    constructor(private tree: Node, private options: { nodeRadius: number; levelHeight: number }) {}

    mount(app: Application) {
        const { nodeRadius, levelHeight } = this.options;
        const positions = new Map<number, Node[]>();

        app.stage.removeChildren();

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
