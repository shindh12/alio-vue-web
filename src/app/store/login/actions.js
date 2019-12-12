import axios from 'axios';

export default {
    'current': (store) => {
        axios.get('/login/current').then(function (res, status, xhr) {
            store.commit('current', res);
        });
    },
    'systemInfo': (store, payload) => {
        axios.get('/rest/v1/system/' + payload)
        .then(res => {
            store.commit('systemSelect', res.data);
        });
    },
    'getPublicKey': (store, paylord) => {
        axios.get('/key/public').then(function (res, status, xhr) {
            store.commit('setPublicKey', res.data);
        });
    },
    'getLoginDuration': (store, paylord) => {
        axios.get('/login/pw/duration').then(function (res, status, xhr) {
            console.log(res.data);
            store.commit('setAuthCodeDuration', res.data);
        });
    },
    'logout': (store) => {
        var guest = {
            userId: 4,
            login: 'guest',
            fullName: 'Guest',
            email: '',
            statusId: '1',
            createDate: '',
            datetimePattern: 'yyyy-MM-dd HH:mm',
            epid: null,
            locale: 'ko',
            timezone: 'Asia/Seoul'
        };
        store.commit('current', guest);
        // store.commit("systemList", [])
        store.dispatch('menuLoad', guest);
    },
    'extends': (store, paylord) => {
        var token = {
            tokenKey: store.state.currentUser.login,
            token: paylord
        };
        axios.post('/certification/check', token).then(function (res, status, xhr) {
            if (res.data.isAvailable === false) {
                store.dispatch('logout');
            }
        });
    }

};
