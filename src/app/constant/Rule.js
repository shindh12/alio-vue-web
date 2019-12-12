const RULES = {
    REQUIRED: function (y) {
        return !_.isEmpty(y) ? true : '필수항목 입니다.';
    },
    EMAIL: v => /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/.test(v) || '유효한 email 주소를 입력해 주십시오.',
    FULLNAME: v => /^[a-zA-Z가-힣 ]{1,20}$/.test(v) || '20자 이내의 유효한 이름을 입력해 주십시오',
    LOGIN: v => /^[a-z0-9_.]{5,12}$/.test(v) || '5~12자의 영문 소문자, 숫자, 특수문자(_.)를 사용하십시오.',
    NO_SPACE: v => /[\s]/g.test(v) == false || '공백은 입력할 수 없습니다.',
    ID: v => /^[a-zA-Z0-9-_]{4,12}$/.test(v) || '4~12자의 영문 대소문자, 숫자, 특수문자(-_)를 사용하십시오.',
    NAME: v => /^[a-zA-Z가-힣0-9 -_]{1,20}$/.test(v) || '20자 이내의 한글,영문 대소문자, 숫자,특수문자(-_)를 사용하십시오.',
    PASSWORD: v => /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(v) || '8~16자의 영문 대소문자, 숫자, 특수문자(!@$%^&*?_~)를 사용하십시오.'
};

const rulePlugin = {};

rulePlugin.install = function (Vue) {
    Vue.prototype.$rule = RULES;
};

export default rulePlugin;
