class Product {
    constructor(name) {
        this.name = name
    }
    init() {
        console.log('init')
    }
    func1() {
        console.log('func1')
    }
    func2() {
        console.log('func2')
    }
}

class Creator{
    create(name){
        return new Product(name)
    }
}

// test
let creator = new Creator()
let p = creator.create('p1')
p.init()
p.func1()