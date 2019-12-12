import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.crossDomain = true;

if (process.env.NODE_ENV == 'production') {
    // var contextPath = location.href.substring(hostIndex, contIndex);
    // console.log("[contextPath!!!]:["+contextPath+"]");
    // if(contextPath!=="/" && contextPath!=="/#" ){
    axios.defaults.baseURL = location.origin + location.pathname;
    // }
} else {
    axios.defaults.baseURL = 'http://localhost:6700/admin';
}

// console.log("axios",axios);
// console.log("axios.defaults",axios.defaults);

const axiosPlugin = {};

axiosPlugin.install = function (Vue) {
    Vue.prototype.$http = axios;
};
export default axiosPlugin;

