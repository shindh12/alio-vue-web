import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import ES6Promise from 'es6-promise';
/*import state from './state.js';
import mutations from './mutations.js';
import actions from './actions.js';/**/

/* [MENU STORE] state */
var state = {
    /**/
    menus: [],
    menuMap: {}, /* URL 기반의 메뉴 맵*/
    menkMap: {}, /* KEY 기반의 메뉴 맵*/
    gnbMenu: '', /* GNB 메뉴 */
    currUrl: '', /* 지금 현재 URL */
    currMenu: {}, /* 지금 현재 메뉴 */
    currMenuDirty: false,
};
/* [MENU STORE] mutations */
var mutations = {
    'menus': (state, menus) => {
        /*** 메뉴정보를 갱신하고, Map을 갱신한다. ***/
        buildMenuTree(menus);
        state.menus = menus;

        function buildMenuTree(mlist) {
            for (var i = 0, ii = mlist.length; i < ii; i++) {
                var m = mlist[i];
                state.menuMap[m.menuUrl] = m;
                state.menkMap[m.menuKey] = m;
                if (Array.isArray(m.children)) {
                    buildMenuTree(m.children);
                }
            }
        }
    },
    'urls': (state, url) => {
        /*** 현재 URL과, 그에 따른 GNB 메뉴를 갱신한다. ***/
        // 1. url을 현재 url로 결정한다.
        if (!url) {
            return;
        }
        state.currUrl = url;
        // 2. GNB에 사용할 메뉴를 찾는다.
        var m = state.menuMap[url], gm = {};
        state.currMenu = m;
        // 2.2 map에서 해당 메뉴의 root(1단계) 메뉴를 찾는다.
        for (/*NOPE!*/; m && m.menuKey != 'isdp'; m = state.menkMap[m.parentKey]) {
            gm = m;
        }
        state.gnbMenu = gm;
    },
    'reset': (state) => {
        state.menus = [];
        state.menuMap = {};
        /* URL 기반의 메뉴 맵*/
        state.menkMap = {};
        /* KEY 기반의 메뉴 맵*/
        state.gnbMenu = '';
        /* GNB 메뉴 */
        //state.currUrl = '' /* 지금 현재 URL */
    },
    'setCurrMenuDirty': (state, payload) => {
        state.currMenuDirty = payload;
    }
};

/* [MENU STORE] getters */
var getters = {
    'GNB': function (state) {
        /*** 상단 메뉴에서 쓸꺼, menus에 0번째에(?) children ***/
        if (isLoadedMenu(state)) {
            return [];
        }
        return state.menus[0].children || [];
    },
    'currMenu': function (state) {
        if (isLoadedMenu(state)) {
            return {};
        }
        return state.menuMap[state.currUrl] || {};
    },
    'currPath': function (state) {
        if (isLoadedMenu(state)) {
            return [];
        }
        var m = state.menuMap[state.currUrl] || {}, gm = {}, rtn = [];
        for (m = state.menkMap[m.parentKey]; m && m.menuKey != 'isdp'; m = state.menkMap[m.parentKey]) {
            rtn.push(m);
        }
        /**/
        return rtn;
    }
};

function isLoadedMenu(state) {
    return !state.menus || !Array.isArray(state.menus) || !state.menus.length;
}

/* [MENU STORE] actions */
var SYSTEM_KEY_ADMIN = 'ISDP';
var actions = {
    'menuLoad': (store, paylord) => {
        /*** 사용자 정보(userId)를 사용하여 메뉴를 갱신한다. ***/
        var userId = paylord.login;
        store.commit('reset');
        let url = '/rest/v1/auth/' + SYSTEM_KEY_ADMIN + '/user/' + userId;
        axios.get(url).then(res => {
            store.commit('menus', res.data);
            store.commit('urls', store.state.currUrl);
        });
    },
    'moveRoute': (store, url) => {
        /*** 경로가 이동되었음.. 대체로 Router에서 지정하는데요 ***/
        store.commit('urls', url);
    },
    'setCurrMenuDirty': (store, payload) => {
        store.commit('setCurrMenuDirty', payload);
    },
};

/* [ETC] Util function */
function getNewMenuObject() {
    var menu = createNewMenu();
    menu.children = [];
    menu.children.push(createNewMenu());
    return menu;

    function createNewMenu(obj) {
        var obj = new Object();
        obj.defaultName = '';
        obj.messageGroup = '';
        obj.messageCode = '';
        obj.menuUrl = '';
        obj.menuKey = '';
        obj.parentKey = '';
        return obj;
    }
}

/* [AND...] export! */
export default {
    state,
    mutations,
    actions,
    getters
}
