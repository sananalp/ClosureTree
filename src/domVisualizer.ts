import { Node } from "./tree";

export class DOMVisualizer {
    constructor(private tree: Node) {}

    mount(container: HTMLElement) {
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
}
