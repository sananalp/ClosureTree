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
        if (node.parent) node.parent.remove(node);

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
