var myActionDirc = {};

myActionDirc.install = function (vue) {
    // @see util.scss
    vue.directive('clickable', {inserted: function (el) {el.classList.add('clickable');}});
    vue.directive('ellipsis', {inserted: function (el) {el.classList.add('ellipsis');}});
};

export default myActionDirc;


