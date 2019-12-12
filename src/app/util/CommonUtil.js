const parsingPlugin = {
    parseWithComma(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

parsingPlugin.install = function (Vue) {
    Vue.prototype.parseWithComma = parsingPlugin.parseWithComma;
}

export default parsingPlugin;