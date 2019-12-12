let DialogUtil = {};
let handler = (e) => {
    e.stopPropagation();
};

DialogUtil.addKeydownEventListener = () => {
    window.addEventListener('keydown', handler, true);
};
DialogUtil.removeKeydownEventListener = () => {
    window.removeEventListener('keydown', handler);
};

DialogUtil.addWheelEventListener = () => {
    document.addEventListener('wheel', handler, {passive: false});
};
export default DialogUtil;
