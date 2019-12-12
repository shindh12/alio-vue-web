<template>
    <div id="login">
        <!-- [BLOCKER] -->
        <div class="login__blocker">
            <img src="@/assets/backs/login-01.jpg" />
        </div>
        <div class="login__wrapper">
            <!-- [LOGIN-TITLE] -->
            <!-- <div class="login__title">
              <h1>Sign in</h1>
            </div> -->
            <!-- [LOGIN-CONTENT] -->
            <div class="login__content">
                <div class="login__content__item">
                    <div class="login__content__item__value">
                        <v-text-field name="login" v-model.trim="loginId" placeholder="ID"></v-text-field>
                    </div>
                </div>
                <div class="login__content__item">
                    <div class="login__content__item__value">
                        <v-text-field name="authCode" v-model.trim="authCode"
                                      :append-icon="visible?'visibility_off':'visibility'"
                                      :append-icon-cb="()=>(visible = !visible)" @keyup.13="clickSignIn"
                                      :type="visible?'text':'password'" placeholder="Password"></v-text-field>
                    </div>
                </div>

            </div>
            <!-- [LOGIN-BOTTOM] -->
            <div class="login__bottom">
                <v-btn primary @click.native="clickSignIn()">Sign in</v-btn>

                <div class="login__content__item" id="chk-remember-me">
                    <v-checkbox v-model="singleCheckbox" @click.native="remember" :label="'Remember ID'"></v-checkbox>
                </div>

                <!-- <hr class="login__bottom__divider"> -->
                <!--<v-btn id="sso-login-btn" @click.native="clickSSO()">Knox SSO</v-btn>-->
                <div class="login__content__item login__content__item--msg" id="error-msg">
                    <span class="login__content__error-msg" v-html="errorMessage"></span>
                </div>
            </div>
        </div>
        <!-- and... [COPYRIGHT] -->
        <div class="login__copyright">
            Copyright 2018 SAMSUNG SDS. All rights reserved.
        </div>
    </div>
</template>

<script>

    const URL_LOGIN = '/login';
    const URL_SSO = '/login/sso';
    const SESSION_TIME_OUT = '30m';
    import {isdpSocket} from '@/util/WebSocket';

    export default {
        data() {
            return {
                rememberme: false,
                loginId: '',
                authCode: '',
                singleCheckbox: false || this.$cookie.get('rememeberMe'),
                visible: false,
                errorMessage: '',
                query: this.$route.query
            };
        },
        mixins: [isdpSocket],
        created() {
            var id = this.$cookie.get('rememeberMe');
            if (id) {
                this.singleCheckbox = true;
                this.loginId = id;
            }
        },
        methods: {
            remember: function () {
                console.log('rememeber');
            },
            clickSignIn: function () {
                if (this.singleCheckbox) {
                    this.$cookie.set('rememeberMe', this.loginId, {expires: '7d'});
                } else {
                    this.$cookie.set('rememeberMe', '', {expires: '1s'});
                }
                this.errorMessage = '';
                let url = URL_LOGIN;
                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);
                var encrypted1 = encrypt.encrypt(this.authCode);
                let param = {login: this.loginId, authCode: encrypted1};
                let that = this;
                this.$http.post(url, param)
                .then(function (res, status, xhr) {
                    console.log(res.data.user);
                    that.socketDisconnect();
                    that.socketConnect();
                    that.$store.commit('current', res.data.user);
                    // that.$store.dispatch('systemInfo', res.data.user);
                    that.$emit('refreshMenu', res.data.user);
                    that.$cookie.set('ISDP-TOKEN', res.data.token.token, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                    that.$cookie.set('ISDP-LOGIN', res.data.user.login, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                    that.$router.push('/admin/pointHistory');
                }).catch(error => {
                    console.log(error);
                    if (error.status == 500) {
                        that.errorMessage = '로그인 중 알 수 없는 에러가 발생했습니다.';
                    } else {
                        that.errorMessage = error.data;
                    }
                });
            },
            clickSSO: function () {
                var ssoUrl = URL_SSO;
                let param = {clientUrl: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/#/sso'};
                let that = this;
                this.$http.post(ssoUrl, param)
                .then(res => {
                    that.$router.push({path: '/sso', query: res.data});
                }).catch(error => {
                    console.log('SSO Login Fail');
                });
            }
        },
        mounted() {

            var token = this.$cookie.get('ISDP-TOKEN');

            if (!token) {
                this.$http.get('/login/init').then(res => {
                    console.log('Session Reset');
                });
                if (this.query.msg) {
                    this.errorMessage = this.query.msg;
                }
            } else {
                //ISDP-token으로 로그인
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
                    // that.$store.dispatch('systemInfo', res.data.user);
                    that.$cookie.set('ISDP-TOKEN', res.data.token.token, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                    that.$cookie.set('ISDP-LOGIN', res.data.user.login, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                    that.$router.push({path: '/admin/pointHistory'});
                    // that.$router.push('/');
                }).catch(error => {
                    console.log('Fail to login.', error);
                    that.$store.dispatch('logout');
                    that.$cookie.set('ISDP-TOKEN', '', {expires: '1s'});
                    that.$cookie.set('ISDP-LOGIN', '', {expires: '1s'});
                    return;
                });
            }

        }
    };
</script>

<style scoped lang="scss">
    @import "styles/color.scss";
    /* color alias*/
    $background-blocker: $col-black;


    hr {
        position: relative;
    }

    hr::before {
        content: "OR";
        background: $col-white;
        position: absolute;
        top: -10px;
        lefT: calc(50% - 25px);
        width: 50px;
        padding: 2px 17px;
    }

    #login {
        position: absolute;
        top: 0px;
        left: 0;
        right: 0;
        bottom: 0;
        vertical-align: middle;
        color: $col-black;
        overflow: hidden;

        /* BLOCKER */
        .login__blocker {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: $background-blocker;

            img {
                opacity: 0.4;
            }
        }

        /* LOGIN-WRAPPER */
        .login__wrapper {
            width: 440px;
            height: 350px;
            background: $col-white;
            padding: 40px 60px;
            position: absolute;
            top: calc(50% - 180px);
            left: calc(50% - 220px);
        }

        /* LOGIN-TITLE */
        /* .login__title{
          height:60px;line-height:60px;padding:0 20px;border-bottom:1px solid var(--line-grey);
          color:#555; background:$col-grey-l3;
        } */

        /* LOGIN-CONTENT-ITEM */
        .login__content__item {
            visibility: visible;
        }

        .login__content__item + .login__content__item {
            margin-top: 10px;
        }

        .login__content__item--msg {
            margin: 5px 0px;
        }

        /* LOGIN-CONTENT-ERROR */
        .login__content__error-msg {
            display: inline-block;
            color: $col-red;
            font-size: 12px;
        }

        /*
        .login__content__item__title {
          margin-bottom:5px;height:30px;
          i.icon {height:30px;line-height:30px;}
        } */
        /* .login__content__item__title__label {
          display:inline-block;height:30px;line-height:30px;vertical-align:sub;font-size:16px;
        } */

        /* LOGIN-BOTTOM */
        .login__bottom {
            #sso-login-btn {
                margin-top: 10px;
            }
        }

        /* LOGIN-BOTTOM-DIVIDER*/
        .login__bottom__divider {
            position: relative;
            margin: 10px -20px;

            ::before {
                content: "OR";
                background: #FFF;
                position: absolute;
                top: -11px;
                lefT: calc(50% - 25px);
                width: 50px;
                padding: 2px 17px;
            }
        }

        /* COPYRIGHT */
        .login__copyright {
            position: absolute;
            bottom: 2px;
            left: 10px;
            color: #EEE;
            height: auto;
        }
    }
</style>

<style lang="scss">
    @import "styles/mixins.scss";

    /* only for vuetify */
    #login .login__content__item .input-group__details {
        min-height: 0px;
    }

    #login .login__content__item__value .input-group--text-field {
        @include override-vuetify;
        padding-top: 0px;
    }

    #login .login__content__item__value .input-group__input {
        width: 100%;
    }

    #login .login__bottom .btn {
        margin: 0px;
        border-radius: 0;
    }

    #login .login__bottom .btn + .btn {
        margin-top: 5px;
    }

    #login .login__bottom .input-group--selection-controls {
        @include override-vuetify;
        margin-top: 10px;
    }

    #login .login__bottom .btn {
        @include override-vuetify;
        width: 100%;
    }

    #login .login__bottom .btn.btn {
        margin-top: 10px;
        height: 45px;
    }

    #login .login__bottom .btn.btn .btn__content {
        height: 45px;
    }

    //#login .login__content .login__content__item .input-group__input {}

    #login .login__content .login__content__item,
    #login .login__content__item__value .input-group--text-field.input-group--text-field .input-group__input,
    #login .login__content__item__value .input-group--text-field.input-group--text-field .input-group__input input,
    #login .login__content__item__value .input-group--text-field.input-group--text-field:not(.input-group--multi-line) .input-group__input {
        height: 45px;
    }

    #login .login__content__item__value .input-group--text-field.input-group--text-field:not(.input-group--multi-line) .input-group__input input {
        height: 100%;
    }

    #login #error-msg {
        height: 15px;
        margin-top: 5px
    }

    /* .btn {
          box-shadow:none;background-color:#4267B2;color:#FFF;width:100%;height:45px;z-index:1;
          i.icon {margin-right:7px;height:45px; line-height:45px;}
          :hover {box-shadow:0px 3px 5px -1px var(--back_shadow), 0px 5px 8px 0px var(--back_shadow), 0px 1px 14px 0px var(--back_shadow);}
        } */
</style>
