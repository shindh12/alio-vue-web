<template>
    <div>
        <div id="profile-left-box" :class="{'left-box--collapsed':collapse}">
            <div class="left__title">
                <h1>
                    {{ $td('menu.user-setting', '개인정보 설정') }}
                    <!-- <small>{{ $td('menu-user-setting.description', '개인정보를 조회/수정합니다.') }}</small> -->
                </h1>
                <span class="left__collapse" @click="collapse=true;">
                    <v-icon>chevron_left</v-icon>
                </span>
                <span class="left__expand" @click="collapse=false;">
                    <v-icon>chevron_right</v-icon>
                </span>
            </div>

            <div class="left__menu">
                <ul>
                    <!-- (주의) cookie쓰다보니 status가 number였다가 string이였다가 함. === 대신 == 사용 必 -->
                    <li @click="moveSubMenu(1)" :class="{'left-box__menu--selected':status==1}">{{ $td('menu.change-profile', '개인정보 수정') }}</li>
                    <li @click="moveSubMenu(2)" :class="{'left-box__menu--selected':status==2}">{{ $td('menu.change-password', '비밀번호 변경') }}</li>
                    <li @click="moveSubMenu(3)" :class="{'left-box__menu--selected':status==3}">{{ $td('menu.system-personalization', '시스템 개인화 설정') }}</li>
                </ul>
            </div>
        </div>

        <div class="page-body">
            <!-- [BODY] Body1.  -->
            <!-- (주의) cookie쓰다보니 status가 number였다가 string이였다가 함. === 대신 == 사용 必 -->
            <div class="body1" v-show="status==1">
                <div class="body__title">{{ $td('menu.change-profile', '개인정보 수정') }}</div>

                <div class="body__content">
                    <tb-validator class="tb-validator-in-dialog" form v-model="body1.valid" ref="body-one-valid" @click.native="clearValid('body-one-valid')">
                        <tb-validator :target="body1.login" :rules="[rules.required]" lazy>
                            <v-text-field :label="$td('user.id','ID')" v-model.trim="body1.login" disabled />
                        </tb-validator>
                        <tb-validator :target="body1.fullName" :rules="[rules.required,rules.fullName,rules.nospace]" lazy>
                            <v-text-field :label="$td('user.full-name','Name')" v-model.trim="body1.fullName" required maxlength="30" />
                        </tb-validator>
                        <tb-validator :target="body1.email" :rules="[rules.required,rules.email]" lazy>
                            <v-text-field :label="$td('user.e-mail','E-Mail')" v-model.trim="body1.email" required maxlength="100" />
                        </tb-validator>
                    </tb-validator>
                </div>

                <div class="body__action">
                    <v-btn @click="saveDefault" primary :disabled="!body1.valid">{{$td('button.save','Save')}}</v-btn>
                </div>
            </div>

            <auth-code-check-dialog
                :showDialog="body1.authCodeCheckDialog"
                :propsUser="body1"
                @closeAuthCodeCheckDialog="closeAuthCodeCheckDialog"
            />


            <!-- [BODY] Body2.  -->
            <!-- (주의) cookie쓰다보니 status가 number였다가 string이였다가 함. === 대신 == 사용 必 -->
            <div class="body2" v-show="status==2">
                <div class="body__title">{{ $td('menu.change-password','비밀번호 변경') }}</div>

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
                    <v-btn @click="savePassword" primary :disabled="!body2.valid">{{$td('button.save','Save')}}</v-btn>
                </div>
            </div>
            <!-- [BODY] Body3.  -->
            <!-- (주의) cookie쓰다보니 status가 number였다가 string이였다가 함. === 대신 == 사용 必 -->
            <div class="body3" v-show="status==3">
                <div class="body__title">{{$td('menu.system-personalization','시스템 개인화 설정')}}</div>
                <div class="body__content">
                    <v-form v-model="body3.valid">
                        <div class="body__content__row">
                            <div class="page-searchbox__item-title">{{$td('message.language','언어')}}</div>
                            <span class="---has-to-be-span---">
                                <v-select :items="langs" item-value="lang" item-text="label" v-model="body3.locale" class="narrow-search-select" />
                            </span>
                        </div>
                        <div class="body__content__row">
                            <div class="page-searchbox__item-title">{{$td('system.gmt','시간대(GMT)')}}</div>
                            <span class="---has-to-be-span---">
	                            <v-select :items="locales" item-value="key" item-text="label" v-model="body3.timezone"></v-select>
                            </span>
                        </div>
                        <div class="body__content__row" v-show="0">
                            <v-text-field :label="$td('system.datetime-pattern', '시간형식')" v-model="body3.datetimePattern" disabled />
                        </div>
                    </v-form>
                </div>

                <div class="body__action">
                    <v-btn @click="saveConfig" primary :disabled="!body3.valid">{{$td('button.save','Save')}}</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import _x from 'axios';
    import __locales from './profile/locale.js';
    import authCodeCheckDialog from './AuthCodeCheckDialog';

    const MUTE_CURRENT = 'current';
    const COOKIE_STATUS_KEY = 'PROFILE#STATUS';

    export default {
        components: {authCodeCheckDialog},
        data: function () {
            return {
                collapse: false,
                status: this.$cookie.get(COOKIE_STATUS_KEY) || 1,
                user: {},
                body1: {
                    login: '',
                    fullName: '',
                    email: '',
                    valid: false,
                    authCodeCheckDialog: false,
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
            moveSubMenu: function (idx) {
                /* validator clear */
                this.clearValid('body-one-valid');
                this.clearValid('body-two-valid');

                /* move sub menu */
                var st = this.status = idx;
                this.$cookie.set(COOKIE_STATUS_KEY, st, 3);
                if (idx === 2) {
                    if (this.$refs.form2) {
                        this.$refs.form2.reset();
                    }
                }

                /* reload user info*/
                let user = this.$store.state.loginStore.currentUser;
                this.copyUserInfo(user);
            },
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
            openAuthCodeCheckDialog: function () {
                this.body1.authCodeCheckDialog = true;
            },
            closeAuthCodeCheckDialog: function () {
                let user = this.$store.state.loginStore.currentUser;
                this.copyUserInfo(user);
                this.body1.authCodeCheckDialog = false;
            },
            saveDefault: function () {
                if (this.validateData('body-one-valid') === false) { return; }
                this.openAuthCodeCheckDialog();
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
                    this.$refs.form2.reset();
                }).catch(e => {
                    this.$notify(
                        {title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.') + ' ' + e.response.data.message, type: 'error'});
                });
            },
            saveConfig: function () {
                var userId = this.user.userId, me = this;
                var param = {};
                param.locale = this.body3.locale;
                param.timezone = this.body3.timezone;
                param.datetimePattern = this.body3.datetimePattern;
                var url = '/rest/v1/user/patch/' + userId + '/config';
                _x.post(url, param).then(res => {
                    let user = res.data;
                    me.$store.commit(MUTE_CURRENT, user);
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
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
    $menu-hi: 44px;
    $menu-wi: 200px;
    $body-wi: 500px;

    $left-border-col: rgba(0, 0, 0, 0.2);
    $col_top-navi: #EBEBEB;
    $col_left-body: #F6F6F6;
    $col_left-title: #767676;


    #profile-left-box {
        & {
            transition: left 1s;
            background: $col_left-body;
            position: absolute;
            top: 0;
            lefT: 0;
            bottom: 100px;
            width: 200px;
            height: auto;
        }

        .left__title {
            & {
                height: 55px;
                line-height: 55px;
                padding: 0 20px;
                background: $col_top-navi;
            }

            h1 {
                height: 100%;
                color: #767676;
                font-size: 14px;
            }
        }

        .left__collapse, .left__expand {
            & {
                position: absolute;
                cursor: pointer;
            }

            i.icon {
                color: rgba(0, 0, 0, 0.3);
            }
        }

        .left__collapse {
            & {
                top: 0;
                right: 0;
                width: 30px;
                height: 55px;
            }

            i.icon {
                font-size: 26px;
                line-height: 55px;
            }

            i.icon:hover {
                color: $col-white;
            }
        }

        .left__expand {
            & {
                top: 10px;
                left: 100%;
                height: 55px;
                width: 0px;
                border: 1px solid $left-border-col;
                opacity: 0;
                transition: 1s;
            }

            i.icon {
                font-size: 20px;
                line-height: 57px;
            }
        }

        &.left-box--collapsed {
            & {
                left: -200px;
            }

            .left__expand {
                width: 22px;
                opacity: 1;
            }
        }

        &.left-box--collapsed + .page-body {
            padding-left: 0px;
            transition-delay: 0.6s;
        }

        .left__menu {
            margin-top: 15px;
        }

        .left__menu li {
            height: $menu-hi;
            line-height: $menu-hi;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            padding-left: 20px;
        }

        .left__menu li.left-box__menu--selected {
            color: #4282E4;
        }
    }


    /* [BODY] 그냥 진짜 몸통*/
    #app .page-body {
        & {
            padding: 0 0 0 $menu-wi;
            height: 100%;
        }

        .body__content .body__content__row {
            font-size: 0px;
            height: 40px;
        }

        .input-group--text-field {
            width: $body-wi;
        }

        .body__title {
            font-size: 14px;
            height: 55px;
            line-height: 55px;
            font-weight: bold;
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

        .body3 .body__content {
            width: 540px;
        }

        .body3 form > div + div {
            margin-top: 10px;
        }

        .body3 .page-searchbox__item-title + span {
            transform: translateY(4px);
        }

        .body3 .input-group--text-field.input-group--text-field {
            width: 500px
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
