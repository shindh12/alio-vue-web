import axios from 'axios';

export default {
    'menuLoad': (store, paylord) => {
        let url = '/rest/v1/auth/ISDP/user/' + paylord.login;
        axios.get(url).then(res => {
            console.log('menuLoad');
            console.log('menuLoad');
            console.log('menuLoad');
            store.commit('gnbs', res.data[0].children);
            store.commit('tree', res.data);
            store.commit('leftMenu', undefined);
            store.commit('selected', undefined);
        });
    },
    'setCurrentMenuDirty': (store, payload) => {
        store.commit('currMenuDirty', payload);
    },

};
