class Iterator {
    constructor(container) {
        this.list = container.list
        this.index = 0
    }
    next() {
        if (this.hasNext()) {
            return this.list[this.index++]
        }
        return null
    }
    hasNext() {
        if (this.index >= this.list.length) {
            return false
        }
        return true
    }
}

class Container {
    constructor(list) {
        this.list = list
    }
    getIterator() {
        return new Iterator(this)
    }
}

// test
const arr = [1, 2, 3, 4, 5, 6]
let container = new Container(arr)
let itrator = container.getIterator()
while (itrator.hasNext()) {
    console.log(itrator.next())
}