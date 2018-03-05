
let defautlFactory = data => new Node(data);

export function buildTree(data, factory=defautlFactory) {
    // console.time(`buildTree(${data.length})`);;
    let map = {};
    let nodes = [];

    for (let i = 0; i < data.length; i += 1) {
        let node = factory(data[i]);
        map[node.data.id] = node;
        nodes.push(node);
    }
    let tree = factory();
    for (let i = 0; i < nodes.length; i += 1) {
        let node = nodes[i];
        let pid = node.data.parent;
        if (pid === 0) {
            tree.addChild(node);
        } else {
            if (pid in map) {
                map[pid].addChild(node);
            }
        }
    }
    map = null;
    nodes = null;
    // console.timeEnd(`buildTree(${data.length})`);
    return tree;
}


export class Node {
    constructor(data) {
        this.data = data;
        this.deep = 0;
        this._children = [];
        this.parent = null;
    }
    size() {
        return this._children.length;
    }
    reset() {
        this._children.forEach(node => node.reset());
        this._children = [];
        this.parent = null;
    }
    children() {
        return this._children.concat();
    }
    accept(visitor) {
        visitor(this);
        this._children.forEach(node => node.accept(visitor));
    }
    walk(visitor){
        if(visitor(this)){
            return this;
        }
        for(let i = 0; i < this._children.length;i+=1){
            let child = this._children[i];
            let node = child.walk(visitor);
            if(node){
                return node;
            }
        }
        return null;
    }
    *[Symbol.iterator](){
        yield this;
        for(let child of this._children){
            yield* child;
        }
    }
    isRoot() {
        return this.parent === null;
    }
    isLeaf() {
        return this.size() === 0;
    }
    getPath(){
        let node = this;
        let buff = [node];
        while(node.parent){
            buff.push(node.parent);
            node = node.parent;
        }
        return buff.reverse();
    }
    get root(){
        let node = this;
        while(node.parent){
            node = node.parent;
        }
        return node;
    }
    hasChild(node) {
        return this._children.indexOf(node) !== -1;
    }
    addChild(node) {
        if (!this.hasChild(node)) {
            let nextChild = this.findNextChild(node);
            if (nextChild) {
                this.insertBefore(node, nextChild);
            } else {
                this.appendChild(node);
            }
            node.deep = this.deep + 1;
        }
    }
    insertBefore(node, referenceChild) {
        this.removeChild(node);
        let index = this._children.indexOf(referenceChild);
        if (index === -1) {
            throw new TypeError('Not found reference node');
        }
        node.parent = this;
        this._children.splice(index, 0, node);
    }
    appendChild(node) {
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;
        this._children.push(node);
    }
    removeChild(node) {
        let index = this._children.indexOf(node);
        if (index !== -1) {
            this._children[index].parent = null;
            this._children.splice(index, 1);
            return true;
        }
        return false;
    }
    findNextChild(node) {
        for (let i = 0; i < this._children.length; i += 1) {
            if (this._children[i].compare(node) > 0) {
                return this._children[i];
            }
        }
        return null;
    }
    compare(node) {
        return this.data - node.data;
    }
    clone(deep=true, factory=defautlFactory){
        let node = factory(copy(this.data));
        if(deep){
            let child;
            for (let i = 0; i < this._children.length; i += 1) {
                child = this._children[i];
                node.appendChild(child.clone(deep, factory));
            }
        }
        return node;
    }
    toString() {
        return `Node(${this.data})`;
    }
    findNode(id){
        return this.walk(node => {
            if(node.data && node.data.id === id){
                return node;
            }
        });
    }
}


function copy(data){
    if(Array.isArray(data)){
        return data.map(copy);
    }
    if(typeof data === 'object'){
        let buff = {};
        for(let key of Object.keys(data)){
            buff[key] = copy(data[key]);
        }
        return buff;
    }
    return data;
}
