import {i18n} from '@/App';
import {store} from '@/store/';

export default {
    getCodeDetailList(codeGroup, searchAll) {
        let codeDetailList = [];
        if (searchAll) { codeDetailList.push({value: '', text: i18n.td('message.all')}); }
        for (let i in store.state.codeStore.codeList[codeGroup]) {
            let codeDetail = store.state.codeStore.codeList[codeGroup][i];
            let convCodeDetail = {};
            convCodeDetail.value = codeDetail.codeKey;
            convCodeDetail.text = i18n.td(codeDetail.messageGroup + '.' + codeDetail.messageCode, codeDetail.defaultName);
            codeDetailList.push(convCodeDetail);
        }
        return codeDetailList;
    }
};
