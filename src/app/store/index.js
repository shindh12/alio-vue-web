import Vue from 'vue';
import Vuex from 'vuex';
import state from './state.js';
import mutations from './mutations.js';
import actions from './actions.js';
import ES6Promise from 'es6-promise';
import loginStore from './login';
import menuStore from './menu';
import codeStore from './code';

ES6Promise.polyfill();
Vue.use(Vuex);

export const store = new Vuex.Store({
    state,
    mutations,
    actions,
    modules: {
        loginStore: loginStore,
        menuStore: menuStore,
        codeStore: codeStore,
    }
});

export default store;
