<template>
    <div>
        <div>
            <div class="page-header">
                <div class="page-header__title">{{$td('system.authCode', '비밀번호')}} {{$td('message.reset', '재설정')}}</div>

            </div>


            <div class="page-body">
                <!-- [BODY] Body2.  -->
                <div class="body2">
                    <div class="body__title">{{$td('message.auth-code-expired', '비밀번호가 만료되었습니다.')}}</div>

                    <div class="body__content">
                        <tb-validator class="tb-validator-in-dialog" form v-model="body2.valid" ref="body-two-valid" @click.native="clearValid('body-two-valid')">
                            <tb-validator :target="body2.oldAuthCode" :rules="[rules.required]" lazy>
                                <v-text-field :label="$td('system.authCode', '비밀번호')" v-model.trim="body2.oldAuthCode" type="password" required />
                            </tb-validator>
                            <hr>
                            <tb-validator :target="body2.newAuthCode" :rules="[rules.required,rules.password,rules.nospace,rules.different]" lazy>
                                <v-text-field :label="$td('message.new', '신규')+' '+$td('system.authCode', '비밀번호')" v-model.trim="body2.newAuthCode" maxlength="20" type="password"
                                              required />
                            </tb-validator>
                            <tb-validator :target="body2.confirmCode" :rules="[rules.required,rules.confirmPw]" lazy>
                                <v-text-field :label="$td('user.confirm-auth-code', '비밀번호 확인')" v-model.trim="body2.confirmCode" maxlength="20" type="password" required />
                            </tb-validator>
                        </tb-validator>

                    </div>

                    <div class="body__action">
                        <v-btn @click="savePassword" :disabled="!body2.valid">{{$td('button.save','Save')}}</v-btn>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import _x from 'axios';
    import __locales from './profile/locale.js';

    const MUTE_CURRENT = 'current';
    const COOKIE_STATUS_KEY = 'PROFILE#STATUS';

    export default {
        data: function () {
            return {
                status: this.$cookie.get(COOKIE_STATUS_KEY) || 1,
                user: {},
                body1: {
                    login: '',
                    fullName: '',
                    email: '',
                    valid: true
                },
                body2: {
                    oldAuthCode: '',
                    newAuthCode: '',
                    confirmCode: '',
                    valid: false
                },
                body3: {
                    locale: '',
                    timezone: '',
                    datetimePattern: '',
                    valid: true
                },
                locales: __locales,
                langs: [],
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    password: v => /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(v) || this.$i18n.td('validate.passwd',
                        '8~16자의 영문 대소문자, 숫자, 특수문자(!@$%^&*?_~)를 사용하십시오.'),
                    email: v => /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{1,3}$/.test(v) || this.$i18n.td('validate.e-mail',
                        '유효한 email 주소를 입력해 주십시오.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                    confirmPw: v => v === this.body2.newAuthCode || this.$i18n.td('validate.repeat', '패스워드가 일치하지 않습니다.'),
                    different: v => v !== this.body2.oldAuthCode || this.$i18n.td('validate.same-password', '동일한 패스워드는 입력할 수 없습니다.'),
                    fullName: v => /^[a-zA-Z가-힣_ ]{2,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                }
            };
        },
        mounted: function () {
            let user = this.$store.state.loginStore.currentUser;
            this.copyUserInfo(user);
        },
        created: function () {
            this.$store.subscribe((mut) => {
                if (mut.type !== 'current') { return;}
                let user = mut.payload;
                this.copyUserInfo(user);
            });

            var me = this, url = '/rest/v1/message/lang';
            _x.get(url).then(res => {
                me.langs = res.data;
            }).catch(e => {/*sh!*/});
        },
        computed: {},
        methods: {
            copyUserInfo: function (user) {
                // 1. set global user info
                this.user = user;
                // 2. user for body1
                this.body1.login = user.login;
                this.body1.fullName = user.fullName;
                this.body1.email = user.email;
                // 3. user for body3
                this.body3.locale = user.locale;
                this.body3.timezone = user.timezone;
                this.body3.datetimePattern = user.datetimePattern;
            },
            savePassword: function () {
                /* check valid */
                if (this.validateData('body-two-valid') === false) { return; }

                var userId = this.user.userId, me = this;
                var param = {};
                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);
                param.authCode = encrypt.encrypt(this.body2.oldAuthCode);
                param.newAuthCode = encrypt.encrypt(this.body2.newAuthCode);
                var url = '/rest/v1/user/patch/' + userId + '/authcode';
                _x.post(url, param).then(res => {
                    let user = res.data;
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    //me._succ("Update auth. code","Success to update");
                    console.log(res.data);
                    this.$store.commit('current', res.data);
                    // this.$store.dispatch('systemInfo', res.data);
                    this.$emit('refreshMenu', res.data);
                }).catch(e => {
                    this.$notify(
                        {title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.') + ' ' + e.response.data.message, type: 'error'});
                });
            },
            clearValid(refName) {
                this.$refs[refName].clear();
            },
            validateData(refName) {
                if (!this.$refs[refName].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },

            /* [LOG] log함 */
            _succ: function (title, text) {this._noti(title, text, 'success');},
            _warn: function (title, text) {this._noti(title, text, 'warn');},
            _err: function (title, text) {this._noti(title, text, 'error');},
            _noti: function (title, text, type) {
                var param = {};
                param.title = title;
                param.text = text;
                param.type = type;
                this.$notify(param);
            }
        }
    };
</script>


<style scoped lang="scss">
    @import "styles/color.scss";
    @import "styles/mixins.scss";

    /* [COM] variables */
    $cline: $col-grey-l1;
    $title-hi: 60px;
    $menu-hi: 60px;
    $menu-wi: 200px;
    $body-wi: 500px;

    /* [HEAD] Profile page header */
    #app .page-header {
        position: absolute;
        top: 0;
        lefT: 0;
        right: 0;
        @include text-height($title-hi);
        padding: 0 30px;
        margin: 0;
        border-bottom: 1px solid $cline;
    }


    /* [LEFT] 왼쪽 상자 */
    #app .left-box {
        border-right: 1px solid $cline;
        transition: left 1s;
        background: $col-white;
        position: absolute;
        top: $title-hi;
        left: 0;
        width: $menu-wi;
        bottom: 0;

        /* [LEFT] 왼쪽 상자 : 머리 */
        .left-box__title {
            border-bottom: 1px solid $cline;
            padding: 15px 0 15px 20px;

            h1 {
                color: $col-grey-d2;
                font-size: 20px;
            }
        }

        /* [LEFT] 왼쪽 상자 : 몸통 */
        .left-box__menus {
            li {
                @include text-height($menu-hi);
                padding-left: 10px;
                font-size: 14px;
                border-bottom: 1px solid $cline;
                cursor: pointer;
                color: $col-grey-l1;
            }

            li:hover {
                background: $col-lgrey;
            }

            li.left-box__menu--selected {
                color: $col-black;
            }
        }


    }

    /* [BODY] 그냥 진짜 몸통*/
    #app .page-body {

        padding: $title-hi 0 0 $menu-wi;
        height: 100%;

        .body-content {
            width: 100%;
            height: 100%;
        }

        .input-group--text-field {
            width: $body-wi;
        }

        .body__title {
            font-size: 20px;
            font-weight: bold;
            padding: 10px 0;
            border-bottom: 1px solid $cline;
            width: $body-wi+40px;
        }

        .body__content {
            padding: 20px;
        }

        .body1 .input-group + .input-group {
            margin-top: 30px;
        }

        .body2 .input-group + .input-group {
            margin-top: 10px;
        }

        .body2 hr {
            margin: 30px 0;
            width: $body-wi;
            display: inline-block;
        }

        .body3 .input-group + .input-group {
            margin-top: 30px;
        }

        .body__action {
            width: $body-wi + 40px;
            text-align: right;
            border-top: 1px solid $cline;
            padding: 10px 20px;
        }
    }

</style>


<style lang="scss">
    @import "styles/mixins.scss";

    #app .page-body .input-group--text-field {
        @include override-vuetify;
        @include labeled-textfield(120px);
    }

    #app .page-body .btn {
        @include override-vuetify;
    }
</style>
