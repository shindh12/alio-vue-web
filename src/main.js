import Vue from 'vue';
import noti from 'vue-notification';

import 'vuetify/dist/vuetify.css';
import 'vue2-dropzone/dist/vue2Dropzone.css';

import App from '@/App';
import router from '@/router/main';
import store from '@/store';
import 'styles/common.scss';
/* Project component */
import myComp from '@/containers/Common';
import myDirc from '@/util/directive';
import myFilt from '@/util/filter';
import axiosPlugin from '@/util/ajax';
import CodeService from '@/util/code/CodeValService';
import CommonUtil from '@/util/CommonUtil';

//deploy
var hostIndex = location.href.indexOf(location.host) + location.host.length;
var contIndex = location.href.indexOf('/', location.href.indexOf('/', hostIndex + 1));

/*/// prod mode
var contextPath = location.href.substring(hostIndex, contIndex);
console.log("[contextPath!!!]:["+contextPath+"]");
if(contextPath!=="/" && contextPath!=="/#" ){
  axios.defaults.baseURL=location.href.substring(0, contIndex);
}
/*///local dev
//axios.defaults.baseURL = 'http://localhost:80'
/**/

//console.log("process.env.NODE_ENV",process.env.NODE_ENV);

Vue.use(noti);
Vue.use(myComp);
Vue.use(myDirc);
Vue.use(myFilt);
Vue.use(axiosPlugin);
Vue.use(CodeService);
Vue.use(CommonUtil);

new Vue({
    el: '#app',
    store,
    router,
    template: '<App/>',
    components: {App}
});
