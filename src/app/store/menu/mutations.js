export default {
    'gnbs': (state, payload) => {
        state.gnbs = payload;
    },
    'tree': (state, payload) => {
        state.tree = payload;
    },
    'selected': (state, payload) => {
        state.selected = payload;
    },
    'leftMenu': (state, payload) => {
        state.leftMenu = payload;
    },
    'setCurrentMenuDirty': (state, payload) => {
        state.currentMenuDirty = payload;
    }

};
