import axios from 'axios';

export default {
    'getCodeList': (store) => {
        let url = '/rest/v1/code/systemkey/ISDP';

        axios.get(url)
        .then(res => {
            store.commit('setCodeList', res);
        });
    },
};
