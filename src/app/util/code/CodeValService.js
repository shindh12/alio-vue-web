import {i18n} from '@/App';
import {store} from '@/store/';
import axios from 'axios';

const codeServicePlugin = {
        getCodeValue(codeGroup, codeKey) {

            let codeGroupArr = store.state.codeStore.codeList[codeGroup];

            for (let i in codeGroupArr) {
                let codeDetail = store.state.codeStore.codeList[codeGroup][i];

                if (codeKey === codeDetail.codeKey) {
                    return codeDetail.defaultName;
                }

            }

        }
    }
;

codeServicePlugin.install = function (Vue) {
    Vue.prototype.getCodeValue = codeServicePlugin.getCodeValue;
};
export default codeServicePlugin;

