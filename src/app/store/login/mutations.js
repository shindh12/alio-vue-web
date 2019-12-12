export default {
    'current': (state, payload) => {
        state.currentUser = payload;
        state.isResetAuthCode = false;
        if (state.duration && state.duration > 0) {
            var ld = new Date(state.currentUser.lastAuthCodeUpdateDate * 1000);
            var now = new Date();
            var days = new Date().setDate(now.getDate() - state.duration);
            if (days > ld.getTime()) {
                state.isResetAuthCode = true;
            }
        }
    },
    'systemSelect': (state, payload) => {
        state.systemKey = payload.systemKey;
        state.systemName = payload.systemName;
    },
    'setPublicKey': (state, payload) => {
        state.publicKey = payload.configurationValue;
    },
    'setAuthCodeDuration': (state, payload) => {
        state.duration = payload;
    },

};
