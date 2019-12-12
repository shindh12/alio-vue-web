import colorDirc from './colorDirc.js';
import actionDirc from './actionDirc.js';

var myDirc = {};
myDirc.install = function (vue) {
    vue.use(colorDirc);
    vue.use(actionDirc);
};

export default myDirc;
