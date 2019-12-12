<template>
    <v-app>
        <div id="app-root">
            <router-view></router-view>
            <notifications style="top:50px;" />
        </div>
    </v-app>
</template>

<script>
    import Vue from 'vue';
    import Vuetify from 'vuetify';
    import 'vuetify/dist/vuetify.css';
    import moment from 'moment-timezone';
    import VueMoment from 'vue-moment';
    import VueCookie from 'vue-cookie/src/vue-cookie';
    import VueI18n from 'vue-i18n';
    import Lodash from 'lodash';
    import {isdpSocket} from '@/util/WebSocket';
    import wysiwyg from '@/components/vue-wysiwyg/public/vueWysiwyg.js';
    import Rules from '@/constant/Rule';

    import JsonExcel from 'vue-json-excel';
    /* import tbValidator */
    import tbValidator from '@/containers/Common/tbValidator';
    import RS from '@/constant/ResponseCode';
    import DateConst from '@/constant/DateConst';

    Vue.component('downloadExcel', JsonExcel);
    Vue.use(wysiwyg, {maxHeight: '1500px', hideModules: {'image': true, 'table': true, 'code': true, 'removeFormat': true, 'headings': true}}); // editor option
    Vue.use(Vuetify);
    Vue.use(VueMoment, moment);
    Vue.use(VueCookie);
    Vue.use(VueI18n);
    Vue.use(Lodash);
    Vue.use(Rules);

    Vue.component('tbValidator', tbValidator);

    const data = require('./message.json');
    export const i18n = new VueI18n({locale: 'ko', messages: data, silentTranslationWarn: true});

    const SESSION_TIME_OUT = '30m';

    export default {
        name: 'app',
        template: '',
        data() {
            return {
                prevKey: '',
                loginId: ''
            };
        },
        i18n: i18n,
        mixins: [isdpSocket],
        beforeCreate() {
            this.$store.dispatch('getCodeList');
            // x. i18n message refresh
            this.$http.get('rest/v1/message/all', {
                params: {
                    systemKey: 'ISDP'
                }
            }).then(res => {
                var langs = res.data;
                for (let k in langs) {
                    this.$i18n.mergeLocaleMessage(k, langs[k]);
                }
            }).catch(e => {
                console.error(e);
            });

            var me = this;
            this.$store.subscribe((mut) => {
                if (mut.type !== 'current') { return;}
                setTimeout(function () {
                    if (!me.$i18n || !me.$i18n.locale) {return;}
                    me.$i18n.locale = mut.payload.locale;
                    console.log('[' + mut.type + ']', me.$i18n.locale, mut.payload.locale);
                    //me.$moment.tz.setDefault(mut.payload.timezone)
                    moment.tz.setDefault(mut.payload.timezone);
                }, 0);

            });
            this.$store.dispatch('getLoginDuration');
            this.$store.dispatch('getPublicKey', null);
            var token = this.$cookie.get('ISDP-TOKEN');
            if (!token) {
                this.$store.dispatch('logout');
                return;
            } else {
                //ISDP-token으로 로그인 (이미 로그인한 경우)
                let url = '/login';
                let param = {token: token};
                let that = this;
                this.$http.post(url, param)
                .then(function (res, status, xhr) {
                    console.log(res.data);
                    that.loginId = res.data.user.login;
                    that.socketDisconnect();
                    that.socketConnect();
                    that.loginId = res.data.user.login;
                    that.$store.commit('current', res.data.user);
                    that.$store.dispatch('menuLoad', res.data.user);
                    that.$store.dispatch('systemInfo', 'ISDP');
                    that.$cookie.set('ISDP-TOKEN', res.data.token.token, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                    that.$cookie.set('ISDP-LOGIN', res.data.user.login, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                }).catch(error => {
                    console.log('Fail to login.', error);
                    that.$store.dispatch('logout');
                    that.$cookie.set('ISDP-TOKEN', '', {expires: '1s'});
                    that.$cookie.set('ISDP-LOGIN', '', {expires: '1s'});
                    return;
                });
            }

        },
        created: function () {
            this.$router.push('/login');
            //td function 을 위한 setting
            Object.defineProperty(Vue.prototype, 'datePattern', {
                get: function get() {
                    var this$1 = this;
                    return function () {
                        let sessionDatePatern = DateConst.DATE_CONST.DATE_FORMAT;
                        if (sessionDatePatern == '') {
                            sessionDatePatern = 'YYYY-MM-DD'; //Default
                        }
                        sessionDatePatern = sessionDatePatern.replace('yyyy', 'YYYY').replace('dd', 'DD');
                        if (sessionDatePatern.indexOf(' ') > 0) {
                            sessionDatePatern = sessionDatePatern.substr(0, sessionDatePatern.indexOf(' '));
                        }
                        if (sessionDatePatern.indexOf('T') > 0) {
                            sessionDatePatern = sessionDatePatern.substr(0, sessionDatePatern.indexOf('T'));
                        }
                        return sessionDatePatern;
                    };
                }
            });

            Object.defineProperty(Vue.prototype, 'dateTimePattern', {
                get: function get() {
                    var this$1 = this;
                    return function () {
                        let sessionDatePatern = DateConst.DATE_CONST.DATE_TIME_FORMAT;
                        if (sessionDatePatern == '') {
                            sessionDatePatern = 'YYYY-MM-DD'; //Default
                        }
                        sessionDatePatern = sessionDatePatern.replace('yyyy', 'YYYY').replace('dd', 'DD');
                        return sessionDatePatern;
                    };
                }
            });

            Object.defineProperty(Vue.prototype, '$td', {
                get: function get() {
                    var this$1 = this;
                    return function (key, defaultValue) {
                        if (key == 'undefined.undefined') {return defaultValue;}
                        var values = [], len = arguments.length - 2;
                        while (len-- > 0) {
                            values[len] = arguments[len + 2];
                        }
                        var i18n = this$1.$i18n;
                        var returnVal = i18n._t.apply(i18n, [key, i18n.locale, i18n._getMessages(), this$1].concat(values));
                        if (key === returnVal) {
                            returnVal = defaultValue;
                        }
                        return returnVal;
                    };
                }
            });
            VueI18n.prototype.td = function td(key, defaultValue) {
                var values = [], len = arguments.length - 2;
                while (len-- > 0) {
                    values[len] = arguments[len + 2];
                }
                var returnVal = (ref = this)._t.apply(ref, [key, this.locale, this._getMessages(), null].concat(values));
                if (key === returnVal) {
                    returnVal = defaultValue;
                }
                return returnVal;
                var ref;
            };
            this.$http.interceptors.response.use(
                response => response,
                error => {
                    let title;
                    let status;
                    let message;
                    let text;

                    /** 서버 연결 실패시 response undefined **/
                    /** FIXME. 그 외 고려하지 않은 상황은 분기문 만들어서 처리 해주세요 **/
                    if (error.response !== undefined) {
                        /* title = error.response.error ? error.response.error : this.$i18n.td('message.error', '오류');
                         status = error.response.status ? error.response.status : " ";
                         message =  error.response.data.message ? error.response.data.message : error.response.data;
                         text = this.$i18n.td('message.status', '상태') + ": " + status + ", " + this.$i18n.td('message.message', '메시지') + ": " + message;
                         */
                        title = this.$i18n.td('message.error', '오류');
                        text = error.response ? this.$i18n.td(error.response.data.errMsgKey, error.response.data.errMsg) : error.message;
                    } else {
                        title = this.$i18n.td('message.error', '오류');
                        message = error.message;
                        text = 'Message: ' + message;
                    }
                    console.log(error);
                    //this.$notify({title: error.message, text: error.response? this.$i18n.td(error.response.data.errMsgKey, error.response.data.errMsg):error.message, type: 'error' });
                    // TODO Error Type 세분화 필요 (서버가 죽었을 때도)
                    if (text != '') {
                        if (error && error.response) {
                            switch (error.response.status) {
                                case '400': // Bad Request
                                    this.$notify({title: RS.ERROR_CODE.BUSINESS_EXCEPTION.TITLE, text: RS.ERROR_CODE.BUSINESS_EXCEPTION.TEXT, type: 'error'});
                                    break;
                                case '401': // Unauthorized
                                    this.$notify({title: RS.ERROR_CODE.UNAUTHORIZED.TITLE, text: RS.ERROR_CODE.UNAUTHORIZED.TEXT, type: 'error'});
                                    break;
                                case '403': // Forbidden
                                    this.$notify({title: RS.ERROR_CODE.FORBIDDEN.TITLE, text: RS.ERROR_CODE.FORBIDDEN.TEXT, type: 'error'});
                                    break;
                                case '500': // Internal Server ERROR
                                    this.$notify({title: RS.ERROR_CODE.INTERNAL_SERVER_ERROR.TITLE, text: RS.ERROR_CODE.INTERNAL_SERVER_ERROR.TEXT, type: 'error'});
                                    // 메시지를 보고 세부화 하면 좋음.response안에서 msg를 읽어와서
                                    break;
                                case '504': // Gateway Timeout
                                    this.$notify({title: RS.ERROR_CODE.SERVER_NOT_RESPONDED.TITLE, text: RS.ERROR_CODE.SERVER_NOT_RESPONDED.TEXT, type: 'error'});
                                    break;
                                default :
                                    //"404": //Not Found
                                    this.$notify({title: title, text: text, type: 'warn'});
                                    break;
                            }
                        } else {
                            this.$notify({title: title, text: text, type: 'error'});
                        }
                    }
                    return Promise.reject(error.response);
                }
            );
            window.onbeforeunload = this.handler;
            //KEY-Event
//      document.addEventListener('keydown', (e) => {
//        if (e.key=="F5") {
//          this.$router.push({path:this.$store.state.menuStore.currUrl})
//        }
//      });
        },
        methods: {
            handler(event) {

            },
        }
    };

</script>

<style>
    @import "./components/vue-wysiwyg/public/vueWysiwyg.css";

    .ellipsis-200 {
        width: 200px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
</style>
