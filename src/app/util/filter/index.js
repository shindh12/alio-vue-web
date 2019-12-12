import numberFilter from './numberFilter.js';

var myFilter = {};
myFilter.install = function (vue) {
    vue.use(numberFilter);
};

export default myFilter;
