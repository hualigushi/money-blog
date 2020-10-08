class Graph {
    constructor() {
        this.AdjList = new Map()
    }
    addVertex(vertex) {
        if (!this.AdjList.has(vertex)) {
            this.AdjList.set(vertex, [])
        } else {
            throw 'Already Exist!!!'
        }
    }
    addEdge(vertex, node) {
        // 向顶点添加边之前，必须验证该顶点是否存在。
        if (this.AdjList.has(vertex)) {
            // 确保添加的边尚不存在。
            if (this.AdjList.has(node)) {
                let arr = this.AdjList.get(vertex)

                // 如果都通过，那么可以将边添加到顶点。
                if (!arr.includes(node)) {
                    arr.push(node)
                }
            } else {
                throw `Can't add non-existing vertex ->'${node}'`
            }
        } else {
            throw `You should add '${vertex}' first`
        }
    }

    print() {
        for (let [key, value] of this.AdjList) {
            console.log(key, value)
        }
    }

    createVisitedObject() {
        let arr = {}
        for (let key of this.AdjList.keys()) {
            arr[key] = false
        }
        return arr
    }

    bfs(startingNode) {
        let visited = this.createVisitedObject()
        let q = []

        visited[startingNode] = true
        q.push(startingNode)

        while (q.length) {
            let current = q.pop()
            console.log(current)

            let arr = this.AdjList.get(current)

            for (let elem of arr) {
                if (!visited[elem]) {
                    visited[elem] = true
                    q.unshift(elem)
                }
            }
        }
    }

    dfs(startingNode) {
        console.log('\nDFS')
        let visited = this.createVisitedObject()
        this.dfsHelper(startingNode, visited)
    }

    dfsHelper(startingNode, visited) {
        visited[startingNode] = true
        console.log(startingNode)

        let arr = this.AdjList.get(startingNode)

        for (let elem of arr) {
            if (!visited[elem]) {
                this.dfsHelper(elem, visited)
            }
        }
    }
}

let g = new Graph()
let arr = ['A', 'B', 'C', 'D', 'E', 'F'];
for (let i = 0; i < arr.length; i++) {
    g.addVertex(arr[i]);
}
g.addEdge('A', 'B');
g.addEdge('A', 'D');
g.addEdge('A', 'E');
g.addEdge('B', 'C');
g.addEdge('D', 'E');
g.addEdge('E', 'F');
g.addEdge('E', 'C');
g.addEdge('C', 'F');
g.print();