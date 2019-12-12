/* [COMMON] page-title */
import pageTitle from './pageTitle.vue';

pageTitle.install = function install(Vue) {
    Vue.component(pageTitle.name, pageTitle);
};
/* [COMMON] others? */

var myComp = {};
myComp.install = function (Vue) {
    Vue.use(pageTitle);
};

export default myComp;
