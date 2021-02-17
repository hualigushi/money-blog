class ReadImg {
    constructor(filename) {
        this.filename = filename
        this.loadFromDisk()
    }
    display() {
        console.log('display... ' + this.filename)
    }
    loadFromDisk() {
        console.log('loading... ' + this.filename)
    }
}

class ProxyImg {
    constructor(filename) {
        this.realImg = new ReadImg(filename)
    }
    display() {
        this.realImg.display()
    }
}
// test
let proxy = new ProxyImg('1.png')
proxy.display()