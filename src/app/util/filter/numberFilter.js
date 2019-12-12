var myNumberFilter = {};

myNumberFilter.install = function (vue) {
    // @see util.scss
    vue.filter('byteFilter', byteFilter);

    function byteFilter(value) {
        var r, v = value;
        const K = 1000, CUT = 100, PREC = 10;
        if ('number' !== typeof v) {return 0;}
        if (v == 1) {
            return v + ' b';
        }
        if (v < CUT) {
            return v + ' b';
        }
        v /= K;
        if (v < CUT) {
            return conv(v, PREC) + ' KB';
        }
        v /= K;
        if (v < CUT) {
            return conv(v, PREC) + ' MB';
        }
        v /= K;
        return conv(v, PREC) + ' GB';

        function conv(vv, cc) {
            return Math.round(vv * cc) / cc;
        }
    }
}

export default myNumberFilter;


