var myColorDirc = {};

myColorDirc.install = function (vue) {
    // @see color.scss
    vue.directive('colRed', {inserted: function (el) {el.classList.add('col-red');}});
    vue.directive('colOrange', {inserted: function (el) {el.classList.add('col-orange');}});
    vue.directive('colYellow', {inserted: function (el) {el.classList.add('col-yellow');}});
    vue.directive('colGreen', {inserted: function (el) {el.classList.add('col-green');}});
    vue.directive('colBlue', {inserted: function (el) {el.classList.add('col-blue');}});
    vue.directive('colNavy', {inserted: function (el) {el.classList.add('col-navy');}});
    vue.directive('colViolet', {inserted: function (el) {el.classList.add('col-voliet');}});
};

export default myColorDirc;


