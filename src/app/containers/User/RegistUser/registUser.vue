<template>
    <div id="regist-user">

        <div class="contents">
            <div class="reg-head">
                <!-- <div class="reg-head__step" :class="stepClass(1)" @click="moveStep(1)">
                    <span><v-icon>check_circle</v-icon>Step1. {{$td('menu-regist.check-join', '가입여부 확인')}}</span>
                </div> -->
                <div class="reg-head__step" :class="stepClass(2)" @click="moveStep(2)">
                    <span>
                        <v-icon>check_circle</v-icon>Step1. {{$td('menu-regist.terms-agree', '약관동의')}}
                    </span>
                </div>
                <div class="reg-head__step" :class="stepClass(3)" @click="moveStep(3)">
                    <span>
                        <v-icon>check_circle</v-icon>Step2. {{$td('menu-regist.user-info', '사용자 정보')}}
                    </span>
                </div>
                <div class="reg-head__step" :class="stepClass(4)" @click="moveStep(4)">
                    <span>
                        <v-icon>check_circle</v-icon>Step3. {{$td('menu-regist.complete', '완료')}}
                    </span>
                </div>
            </div>

            <div class="reg-body"><!-- :class="bodyClass()" -->
                <!-- [BODY] Step1. 가입여부 확인 -->
                <transition name="step-transition" mode="in-out">
                    <!-- enter-active-class="step-fade-in" leave-active-class="step-fade-out" -->
                    <div class="reg-body__step" v-if="stepIdx==1" key="step1">
                        <div class="step1-wrapper">
                            <div class="step1__title">
                                <small>{{$td('menu-regist.new-be', 'ISDP Admin Service에 처음이십니까?')}}</small>
                                <label>{{$td('menu-regist.login-id', 'Check your Login ID')}}</label>
                            </div>
                            <div class="step1__row">
                                <v-form v-model="step1.valid">
                                    <v-text-field v-model.trim="step1.idForCheck" placeholder="Input your ID here"
                                                  :rules="[this.$rule.LOGIN, this.$rule.NO_SPACE]"
                                                  @keyup.enter="checkUser"></v-text-field>
                                    <label>{{step1.comment}}</label>
                                    <v-text-field v-model.trim="step1.authCode" placeholder="Password"
                                                  v-show="step1.loginMode" type="password"
                                                  @keyup.enter="loginFirst" ref="authcode"></v-text-field>
                                </v-form>
                            </div>

                            <div class="step1__button">
                                <v-btn @click="checkUser" class="trivia">Check your ID</v-btn>
                                <v-btn @click="signUp" v-show="!step1.loginMode" :disabled="!step1.ableToNext"
                                       ref="signUp">{{$td('menu-regist.sign-up', '가입')}}
                                </v-btn>
                                <v-btn @click="loginFirst" v-show="step1.loginMode">Login</v-btn>
                            </div>
                        </div>
                    </div>
                    <!-- [BODY] Step1. 가입여부 확인 END -->

                    <!-- [BODY] Step2. 약관 동의 -->
                    <div class="reg-body__step" v-if="stepIdx==2" key="step2">
                        <div class="reg-body__step__title">
                            {{$td('menu.terms-of-use', '이용약관')}}
                        </div>

                        <div class="step2__terms">
                            <!-- [BODY] Step2. 약관 동의 - 약관.들 -->
                            <div class="step2__terms__item" v-for="t in step2.terms">
                                <div class="step2__terms__title" @click="t.isExpand = !t.isExpand">
                                    <v-icon v-if="t.isAgree">check_circle</v-icon>
                                    {{t.termsName}}
                                    <small v-if="t.mandatoryYn!=='Y'"> [{{$td('message.optional', '선택')}}]</small>
                                </div>
                                <div class="step2__terms__content" v-html="t.contents" v-show="t.isExpand"></div>
                                <div class="step2__terms__ask" v-show="t.isExpand">
                                    <v-radio-group v-model="t.isAgree" @change="checkAgreeTerms">
                                        <v-radio :label="$td('message.agreed', '동의함')" :value="true"></v-radio>
                                        <v-radio :label="$td('message.not-agreed', '동의하지않음')" :value="false"></v-radio>
                                    </v-radio-group>
                                </div>
                            </div>
                            <!-- [BODY] Step2. 약관 동의 - 약관.들 END -->
                        </div>


                        <div class="reg-body__step__action">
                            <!-- <v-btn @click="moveStep(1)">{{$td('message.prev', '이전')}}</v-btn> -->
                            <v-btn @click="moveStep(3)" :disabled="!step3.valid">{{$td('message.next', '다음')}}</v-btn>
                        </div>
                    </div>
                    <!-- [BODY] Step2. 약관 동의 END -->

                    <!-- [BODY] Step3. 가입정보 입력 -->
                    <div class="reg-body__step" v-if="stepIdx==3" key="step3">
                        <div class="reg-body__step__title">사용자 정보</div>
                        <div class="step3__contents">
                            <div class="step3__contents__id-cover" @click="openIdCheckDialog"></div>
                            <v-form v-model="step3.valid">
                                <tb-validator class="tb-validator-in-dialog" form v-model="step3.userCheckFormValid"
                                              ref="step3-user-check-form-valid"
                                              @click.native="step3UserCheckFormClearValid">
                                    <!-- ID Area -->
                                    <tb-validator :target="regInfo.login" :rules="[this.$rule.REQUIRED]" lazy>
                                        <v-text-field class="mandatory with-edit-button" :label="$td('user.id','ID')"
                                                      :disabled="true" v-model.trim="regInfo.login"
                                                      maxlength="12"/>
                                        <v-btn class="step3__contents__id-check" @click.native="openIdCheckDialog">
                                            {{$td('message.check-duplicate', '중복확인')}}
                                        </v-btn>
                                    </tb-validator>
                                    <!-- Password Area -->
                                    <tb-validator :target="regInfo.authCode"
                                                  :rules="[this.$rule.REQUIRED, this.$rule.PASSWORD, this.$rule.NO_SPACE]"
                                                  lazy>
                                        <v-text-field class="mandatory" :label="$td('system.authCode','Password')"
                                                      v-model.trim="regInfo.authCode"
                                                      type="password" ref="authCode"
                                                      :placeholder="$td('placeholder.validate-passwd', '영문자, 숫자, 특수문자((!@#$%&*^) 모두 혼용한 8~12자.')"
                                                      maxlength="20"/>
                                    </tb-validator>
                                    <!-- Password Check Area -->
                                    <tb-validator :target="regInfo.checkPass" :rules="[rules.confirmPw]" lazy>
                                        <v-text-field class="mandatory"
                                                      :label="$td('user.confirm-auth-code','Confirm Password')"
                                                      v-model.trim="regInfo.checkPass"
                                                      type="password" ref="checkPass"
                                                      maxlength="20"/>
                                    </tb-validator>
                                    <hr>
                                    <!-- Name Area -->
                                    <tb-validator :target="regInfo.fullName"
                                                  :rules="[this.$rule.REQUIRED, this.$rule.NAME]" lazy>
                                        <v-text-field class="mandatory" :label="$td('message.username','Name')"
                                                      v-model.trim="regInfo.fullName" maxlength="30"/>
                                    </tb-validator>
                                    <!-- Email Area -->
                                    <tb-validator :target="regInfo.email"
                                                  :rules="[this.$rule.REQUIRED, this.$rule.EMAIL]" lazy>
                                        <v-text-field class="mandatory" :label="$td('user.e-mail','E-Mail')"
                                                      v-model.trim="regInfo.email" maxlength="100"/>
                                    </tb-validator>
                                </tb-validator>
                                <!--                                <v-btn class="step3__contents__id-check" @click.native="openIdCheckDialog">{{$td('button.modify', '변경')}}</v-btn> &lt;!&ndash;TODO: i18n '중복확인' 추가&ndash;&gt;-->
                                <!--                                <v-text-field class="mandatory" :label="$td('user.id','ID')" v-model="regInfo.login"-->
                                <!--                                              :rules="[rules.required]" :disabled="true" maxlength="12" />-->
                                <!--                                <v-text-field class="mandatory" :label="$td('system.authCode','Password')" v-model.trim="regInfo.authCode"-->
                                <!--                                              :rules="[rules.required, rules.password,rules.nospace]" type="password" ref="authCode" maxlength="20" />-->
                                <!--                                <v-text-field :label="$td('user.confirm-auth-code','Confirm password')" v-model.trim="regInfo.checkPass"-->
                                <!--                                              :rules="[rules.confirmPw, rules.password]" type="password" ref="checkPass" maxlength="20" />-->
                                <!--                                <hr>-->
                                <!--                                <v-text-field class="mandatory" :label="$td('message.username','Name')" v-model.trim="regInfo.fullName"-->
                                <!--                                              :rules="[rules.required, rules.fullName]" maxlength="30" />-->
                                <!--                                <v-text-field class="mandatory" :label="$td('user.e-mail','E-Mail')" v-model.trim="regInfo.email"-->
                                <!--                                              :rules="[rules.required, rules.email]" ref="email" maxlength="100" />-->
                            </v-form>
                        </div>

                        <div class="reg-body__step__action">
                            <v-btn @click="moveStep(2)">{{$td('message.prev', '이전')}}</v-btn>
                            <!--                            <v-btn @click="checkDup" :disabled="step4Disable">{{$td('message.next', '다음')}}</v-btn>-->
                            <v-btn @click="checkDup">{{$td('message.next', '다음')}}</v-btn>
                        </div>
                        <v-dialog :value="step3.idCheckDialog" @input="closeDialog" max-width="450px">
                            <v-card>
                                <v-card-title>
                                    <span class="headline">중복확인</span>
                                    <div class="modal-close" @click="closeDialog">
                                        <v-icon>close</v-icon>
                                    </div>
                                </v-card-title>
                                <v-card-text class="field-box id-check-dialog">
                                    <div id="id-row" class="step3-id-check-dialog">
                                        <tb-validator class="tb-validator-in-dialog" form
                                                      v-model="step3.idCheckDialogValid"
                                                      ref="step3-id-check-dialog-valid"
                                                      @click.native="step3IdCheckDialogClearValid">
                                            <tb-validator :target="step3.idCheck" :rules="[rules.login, rules.nospace]"
                                                          lazy>
                                                <v-text-field class="id-check-dialog__text-field" ref="idCheck"
                                                              v-model.trim="step3.idCheck"
                                                              :label="$td('user.id', 'ID')"
                                                              @keyup.esc="closeDialog" @keyup.enter="idCheck"
                                                              maxlength="12"/>
                                            </tb-validator>
                                        </tb-validator>
                                        <!--                                        <v-text-field class="id-check-dialog__text-field" ref="idCheck" v-model.trim="step3.idCheck" :label="$td('user.id','ID')"-->
                                        <!--                                                      :rules="[rules.login,rules.nospace]"></v-text-field>-->
                                        <v-btn class="id-check-dialog__btn" @click.native="idCheck">
                                            {{$td('button.check', '확인')}}
                                        </v-btn>
                                    </div>

                                    <div style="margin-top:5px;"><span v-show="validId">{{step3.idChecked}} : </span>{{step3.idCheckMessage}}
                                    </div>
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                                    <v-btn primary @click.native="useValidId" :disabled="!validId">{{ $td('button.save',
                                        '저장') }}
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </div>
                    <!-- [BODY] Step3. 가입정보 입력 END -->

                    <!-- [BODY] Step4. 가입 확인 -->
                    <div class="reg-body__step" v-if="stepIdx==4" key="step4">
                        <div class="reg-body__step__title">{{$td('menu-regist.complete', '완료')}}</div>

                        <div class="step4__contents">
                            <table class="detail-page__contents__table">
                                <tr>
                                    <th>{{$td('user.id', 'ID')}}</th>
                                    <td colspan="3">{{ regInfo.login }}</td>
                                </tr>
                                <tr>
                                    <th>{{$td('user.full-name', 'Name')}}</th>
                                    <td colspan="3">{{ regInfo.fullName }}</td>
                                </tr>
                                <tr>
                                    <th>{{$td('user.e-mail', 'E-Mail')}}</th>
                                    <td colspan="3">{{ regInfo.email}}</td>
                                </tr>
                            </table>

                            <v-btn @click="saveUser" :disabled="!step4.ableToSave">{{$td('button.save','Save')}}</v-btn>
                            <!-- <v-btn @click="loginFin" :disabled="!step4.ableToLogin">{{$td('system.login','login')}}</v-btn>-->
                        </div>
                        <div class="reg-body__step__action">
                            <v-btn @click="moveStep(3)">{{$td('message.prev', '이전')}}</v-btn>
                            <div></div>
                        </div>
                    </div>
                </transition>
                <!-- [BODY] Step4. 가입 확인 END-->

                <!-- [BODY] control, 상단 언어 선택, [[순서를 바꾸면 안되요.css nth-child 때문]] -->
                <div class="reg-body__controll" v-if="isStep1">
                    <v-select :items="langs"
                              item-value="lang" item-text="label"
                              v-model.number="regLang" @change="changeLang"></v-select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import {isdpSocket} from '@/util/WebSocket';
    import DateConst from "@/constant/DateConst";
    import ResponseCode from "@/constant/ResponseCode";

    const URL_LOGIN = '/login';
    const SESSION_TIME_OUT = '30m';

    export default {
        data() {
            return {
                stepIdx: 2,
                regLang: 'ko',
                langs: [{lang: 'ko', label: '한국어'}, {lang: 'en', label: 'English'}],
                step1: {
                    idForCheck: '',
                    comment: '',
                    loginMode: false,
                    ableToNext: false,
                    valid: true
                },
                step2: {
                    terms: [],
                    termsCache: {},
                    greeAll: false,
                    valid: true
                },
                step3: {
                    valid: false,
                    idCheck: '',
                    idCheckDialog: false,
                    idChecked: '',
                    idCheckMessage: '',
                    idCheckDialogValid: false,
                    userCheckFormValid: false
                },
                step4: {
                    ableToSave: true,
                    ableToLogin: false,
                    valid: false
                },
                regInfo: {
                    login: '',
                    fullName: '',
                    email: '',
                    authCode: '',
                    checkPass: '',
                    statusId: '1'
                },
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    login: v => /^[a-z0-9_.]{5,12}$/.test(v) || this.$i18n.td('validate.login', '5~12자의 영문 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    password: v => /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(v) || this.$i18n.td('validate.passwd',
                        '8~16자의 영문 대소문자, 숫자, 특수문자(!@$%^&*?_~)를 사용하십시오.'),
                    confirmPw: v => v === this.regInfo.authCode || this.$i18n.td('validate.repeat', '패스워드가 일치하지 않습니다.'),
                    email: v => /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/.test(v) || this.$i18n.td('validate.e-mail',
                        '유효한 email 주소를 입력해 주십시오.'),
                    fullName: v => /^[a-zA-Z가-힣 ]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.')
                },
                sanitize: '', /* Content sanitizer for XSS */
            };
        },
        mixins: [isdpSocket],
        computed: {
            step4Disable: function () {
                if (this.step4.valid == false) {
                    return true;
                }
                if (this.regInfo.authCode != this.regInfo.checkPass) {
                    this.$refs.checkPass.focus();
                    this.$refs.authCode.focus();
                    this.$refs.checkPass.focus();
                    return true;
                }
                return false;
            },
            isStep1: function () {
                return this.stepIdx == 1;
            },
            validId: function () {
                return this.step3.idChecked != '';
            }
        },
        watch: {
            'step1.idForCheck': function (val) {
                this.step1.comment = '';
                this.step1.loginMode = false;
                this.step1.ableToNext = false;
            }
        },
        mounted: function () {

            var token = this.$cookie.get('ISDP-TOKEN');

            if (!token) {
                this.getTerms();
            } else {
                //ISDP-token으로 로그인
                let url = '/login';
                let param = {token: token};
                let that = this;
                axios.post(url, param)
                    .then(function (res, status, xhr) {
                        console.log(res.data);
                        that.loginId = res.data.user.login;
                        that.socketDisconnect();
                        that.socketConnect();
                        that.loginId = res.data.user.login;
                        that.$store.commit('current', res.data.user);
                        that.$store.dispatch('menuLoad', res.data.user);
                        that.$store.dispatch('systemInfo', res.data.user);
                        that.$cookie.set('ISDP-TOKEN', res.data.token.token, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                        that.$cookie.set('ISDP-LOGIN', res.data.user.login, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                        that.$router.push('/');
                    }).catch(error => {
                    console.log('Fail to login.', error);
                    that.$store.dispatch('logout');
                    that.$cookie.set('ISDP-TOKEN', '', {expires: '1s'});
                    that.$cookie.set('ISDP-LOGIN', '', {expires: '1s'});
                    return;
                });
            }

        },
        methods: {
            checkAgreeTerms: function () {
                /* [STEP2] 약관체크. */
                for (let i = 0, ii = this.step2.terms.length; i < ii; i++) {
                    let t = this.step2.terms[i];
                    if (t.mandatoryYn == 'Y' && !t.isAgree) {
                        this.step3.valid = this.step4.valid = false;
                        return;
                    }
                }
                this.step3.valid = true;
            },
            toggleExpand: function (i) {
                /* [STEP2] expand toggle */
                this.step2.expandTerms[i] = !this.step2.expandTerms[i];
            },
            changeLang: function (lang) {
                /* [COMMON] everyTime :: 언어가 바뀌었을때 해야 하는것 */
                this.getTerms(lang);
                if (this.$i18n) {
                    this.$i18n.locale = lang;
                }
            },
            getTerms: function (lang) {
                /* [COMMON] mounted :: 약관을 불러온다. */
                const SYSTEM_KEY = 'ISDP';//this.$store.state.loginStore.systemKey?? 로그인 안하믄 없는데
                var LANG = lang || this.regLang,
                    URL = '/rest/v1/terms/' + SYSTEM_KEY + '/recent?locale=' + LANG,
                    me = this;
                // 2. cache 확인
                if (this.step2.termsCache[LANG]) {
                    this.step2.terms = this.step2.termsCache[LANG];
                    resetTerms(this.step2.terms);
                    return;
                }
                // 3. rest call
                axios.get(URL)
                    .then(res => {
                        resetTerms(res.data);
                        me.step2.terms = res.data;
                        me.step2.termsCache[LANG] = res.data;
                    });

                function resetTerms(data) {
                    for (let i = 0, ii = data.length; i < ii; i++) {
                        var t = data[i];
                        t.isExpand = true;
                        t.isAgree = false;
                    }
                }
            },
            checkUser: function () {
                if (this.step1.valid == false) {
                    return;
                }
                /* [STEP1] check user is exist or not*/
                var me = this, url = 'rest/v1/user/' + this.step1.idForCheck;
                const EMPTY_USER = '';
                me.step2.valid = false;
                axios.get(url).then(res => {
                    var isUser = res.data;
                    if (EMPTY_USER === isUser) {
                        /* 기존에 없던 사용자 입니다. => 회원가입으로 갑시다. */
                        me.step1.ableToNext = true;
                        me.step1.loginMode = false;
                        me.step2.valid = true;
                        me.regInfo.login = me.step1.idForCheck;
                        me.step1.comment = this.$i18n.td('validate.enable-join', '회원 가입이 가능한 ID입니다.');
                    } else {
                        /* 기존에 있는 사용자 입니다. => 로그인을 합시다. */
                        me.step1.ableToNext = false;
                        me.step1.comment = this.$i18n.td('validate.aready-joined', '가입되어 있는 ID입니다. 패스워드는 관리자에게 문의해 주세요.');
                        me.step1.loginMode = true;
                        setTimeout(function () {
                            me.$refs.authcode.focus();
                        }, 0);/**/
                    }

                }).catch(e => {
                    console.error(e);
                });
            },
            // checkDup: function () {
            //     const url = '/rest/v1/user/find/duplication';
            //     var userInfo = {
            //         login: this.regInfo.login,
            //         fullName: this.regInfo.fullName,
            //         email: this.regInfo.email,
            //     };
            //     axios.post(url, userInfo).then(res => {
            //         if (res.data) {
            //             this.$notify({title: this.$i18n.td('message.duplication', '중복'), text: res.data + ' ' + this.$i18n.td('message.duplicated', '중복입니다.'), type: 'warn'});
            //             this.$refs.email.focus();
            //             return;
            //         } else {
            //             this.moveStep(4);
            //         }
            //     }).catch(e => {
            //         this.errors.push(e);
            //     });
            // },

            moveStep: function (idx) {
                /* [COMMON] step을 일로 옮김*/
                if (!this['step' + idx].valid) {
                    return;
                }
                if (this.stepIdx === 3) {
                    if (this.step4.valid === false && idx === 2) {
                        this.stepIdx = idx;
                    } else {
                        if (this.step3CheckUserValid()) {
                            this.stepIdx = idx;
                        }
                    }
                } else {
                    this.stepIdx = idx;
                }
            },
            stepClass: function (idx) {
                /* [COMMON] header-step에 보여줄 class를 만듦(숫자 대소비교 활용) */
                const PREFIX = 'reg-head__step';
                var cls = '';
                if (!this['step' + idx].valid) {
                    cls += PREFIX + '--invalid ';
                }
                if (this.stepIdx === idx) {
                    cls += PREFIX + '--selected ';
                } else if (this.stepIdx > idx) {
                    cls += PREFIX + '--complete ';
                }
                return cls;
            },
            bodyClass: function () {
                /* [COMMON] body 선택되었을때 쓸 class */
                return 'reg-body--selected' + this.stepIdx;
            },
            signUp: function (forced) {
                /* [STEP1] 가입확인에서 다음단계(약관)으로 step 이동 */
                this.moveStep(2);
                this.regInfo.login = this.step1.idForCheck;
            },
            saveUser: function () {
                /* [STEP4] 사용자를 저장한다 */
                // const url = '/rest/v1/user/create';
                const url = '/rest/v1/user/create/all';
                var me = this;
                this.step4.ableToSave = false;
                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);
                var encrypted1 = encrypt.encrypt(this.regInfo.authCode);
                var userInfo = {
                    login: this.regInfo.login,
                    fullName: this.regInfo.fullName,
                    email: this.regInfo.email,
                    authCode: encrypted1,
                    statusId: '2', // 초기값 : 비활성화
                    'systemKey': 'ISDP',
                    'approvalYn': 'Y', // 초기값 승인
                };
                axios.post(url, userInfo).then(res => {
                    // [ALIOOLIO-184] 회원가입 시 user, SystemUser 에 추가, ROUE_USER 권한 추가
                    this['step1'].valid = false;
                    this['step2'].valid = false;
                    this['step3'].valid = false;
                    this.step4.ableToLogin = true;
                    me.$notify({
                        title: ResponseCode.CREATE_USER.TITLE,
                        text: ResponseCode.CREATE_USER.TEXT ,
                        type: ResponseCode.TYPE.SUCCESS
                    });
                }).catch(e => {
                    me.$notify({
                        title: ResponseCode.CREATE_USER_FAIL.TITLE,
                        text: ResponseCode.CREATE_USER_FAIL.TEXT + e.message,
                        type: ResponseCode.TYPE.ERROR
                    });
                    this.step4.ableToSave = true;
                });
                this.$router.push('/login');
            },
            login: function (id, pw) {
                // @see login.vue :: clickSignIn
                this.errorMessage = '';
                let url = URL_LOGIN;
                if (!this.$store.state.loginStore.publicKey) {
                    this.$store.dispatch('getPublicKey', null);
                    while (!this.$store.state.loginStore.publicKey) {
                        console.log('waiting...');
                    }
                }
                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);
                var encrypted1 = encrypt.encrypt(pw);
                let param = {login: id, authCode: encrypted1};
                let that = this;
                axios.post(url, param)
                    .then(function (res, status, xhr) {
                        console.log(res.data.user);
                        that.$store.commit('current', res.data.user);
                        // that.$store.dispatch('systemInfo', res.data.user);
                        that.$emit('refreshMenu', res.data.user);
                        that.$cookie.set('ISDP-TOKEN', res.data.token.token, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                        that.$cookie.set('ISDP-LOGIN', res.data.user.login, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                    }).catch(error => {
                    that.step1.comment = error.response.data;
                });

            },
            loginFirst: function () {
                this.login(this.step1.idForCheck, this.step1.authCode);
            },
            loginFin: function () {
                this.login(this.regInfo.login, this.regInfo.authCode);
            },
            openIdCheckDialog: function () {
                this.step3.idCheck = '';
                this.step3.idChecked = '';
                this.step3.idCheckMessage = '';
                this.$refs.idCheck.reset();
                this.step3.idCheckDialog = true;
            },
            closeDialog: function () {
                this.step3.idCheckDialog = false;
            },
            // idCheck: function () {
            //     if (this.$refs.idCheck.validate()) {
            //         var me = this, url = 'rest/v1/user/' + this.step3.idCheck;
            //         const EMPTY_USER = '';
            //         axios.get(url).then(res => {
            //             var isUser = res.data;
            //             if (EMPTY_USER === isUser) {
            //                 me.step3.idChecked = this.step3.idCheck;
            //                 me.step3.idCheckMessage = this.$i18n.td('validate.enable-join', '회원 가입이 가능한 ID입니다.');
            //             } else {
            //                 me.step3.idChecked = '';
            //                 me.step3.idCheckMessage = this.$i18n.td('validate.aready-joined', '가입되어 있는 ID입니다. 패스워드는 관리자에게 문의해 주세요.');/*TODO: i18n 약간 수정?*/
            //             }
            //         }).catch(e => {
            //             me.step3.idChecked = '';
            //             me.step3.idCheckMessage = this.$i18n.td('exception.server-error', '서버 에러');
            //         });
            //     } else {
            //         return;
            //     }
            // },
            step3IdCheckDialogValidation() {
                if (this.$refs['step3-id-check-dialog-valid'].isValid()) {
                    return true;
                }
                return false;
            },
            step3IdCheckDialogClearValid() {
                this.$refs['step3-id-check-dialog-valid'].clear();
            },
            async idCheck() {
                if (await this.step3IdCheckDialogValidation() === false) {
                    this.step3.valid = '';
                    this.step3.idCheckMessage = '';
                    return;
                }

                if (this.$refs.idCheck.validate()) {
                    var me = this, url = 'rest/v1/user/' + this.step3.idCheck;
                    const EMPTY_USER = '';
                    axios.get(url).then(res => {
                        var isUser = res.data;
                        if (EMPTY_USER === isUser) {
                            me.step3.idChecked = this.step3.idCheck;
                            me.step3.idCheckMessage = this.$i18n.td('validate.enable-join', '회원 가입이 가능한 ID입니다.');
                        } else {
                            me.step3.idChecked = '';
                            me.step3.idCheckMessage = this.$i18n.td('validate.aready-joined', '가입되어 있는 ID입니다. 패스워드는 관리자에게 문의해 주세요.');/*TODO: i18n 약간 수정?*/
                        }
                    }).catch(e => {
                        me.step3.idChecked = '';
                        me.step3.idCheckMessage = this.$i18n.td('exception.server-error', '서버 에러');
                    });
                } else {
                    return;
                }
            },
            useValidId: function () {
                if (this.step3.idChecked != '') {
                    this.regInfo.login = this.step3.idChecked;
                    this.step3.idCheckDialog = false;
                }
            },
            step3CheckUserValid() {
                if (this.$refs['step3-user-check-form-valid'].isValid()) {
                    return true;
                }
                return false;
            },
            step3UserCheckFormClearValid() {
                this.$refs['step3-user-check-form-valid'].clear();
            },
            async checkDup() {
                if (await this.step3CheckUserValid() === false) {
                    return;
                }
                const url = '/rest/v1/user/find/duplication';
                var userInfo = {
                    login: this.regInfo.login,
                    fullName: this.regInfo.fullName,
                    email: this.regInfo.email,
                };
                axios.post(url, userInfo).then(res => {
                    if (res.data) {
                        this.$notify({
                            title: this.$i18n.td('message.duplication', '중복'),
                            text: res.data + ' ' + this.$i18n.td('message.duplicated', '중복입니다.'),
                            type: 'warn'
                        });
                        this.$refs.email.focus();
                        return;
                    } else {
                        this.step4.valid = true;
                        this.moveStep(4);
                    }
                }).catch(e => {
                    this.errors.push(e);
                });
            }
        }
    };
</script>


<style scoped lang="scss">
    @import "styles/color.scss";
    @import "styles/util.scss";

    $header-height: 50px;
    $cline: $col-grey-l1;

    #regist-user {
        position: relative;
    }

    #regist-user .contents {
        width: 800px;
        margin-left: calc(50% - 410px);
        padding-top: 10px;
    }

    /* [HEAD] Register Header :: stepper */
    #regist-user .reg-head {
        height: $header-height + 2;
        font-size: 0;
        background: $col-white;
        overflow: hidden;
        border: 2px solid $cline;
        display: -ms-flexbox;
    }

    #regist-user .reg-head__step {
        width: 34.17%;
        font-size: 14px;
        display: inline-block;
        position: relative;
        height: $header-height;
        line-height: $header-height;
        padding: 0 10px 0 30px;
        background: #FFF;
        cursor: pointer;
    }

    #regist-user .reg-head__step span {
        z-index: 1;
        display: inline-block;
        width: 100%;
        @extend .unselectable;
        max-width: unset;
    }

    #regist-user .reg-head__step:nth-child(1) {
        z-index: 34;
        margin-left: -20px;
    }

    #regist-user .reg-head__step:nth-child(2) {
        z-index: 33;
    }

    #regist-user .reg-head__step:nth-child(3) {
        z-index: 32;
    }

    #regist-user .reg-head__step:nth-child(4) {
        z-index: 31;
        width: calc(25% + 20px)
    }

    #regist-user .reg-head__step::before {
        content: ' ';
        position: absolute;
        width: 50px;
        height: 50px;
        top: 0;
        right: -15px;
        transform: rotate(45deg) skew(20deg, 20deg);
        z-index: 10;
        border-top: 1px solid $cline;
        border-right: 1px solid $cline;
        background: #FFF;
        z-index: -1;
    }

    #regist-user .reg-head__step:last-child::before {
        content: '';
        display: none;
    }

    #regist-user .reg-head__step .icon {
        opacity: 0;
        font-size: 16px;
        margin-right: 3px;
    }

    #regist-user .reg-head__step--invalid {
    }

    #regist-user .reg-head__step--invalid span {
        cursor: initial;
        opacity: 0.4;
    }

    #regist-user .reg-head__step--complete {
        background: $col-prim-l2;
        color: $col-white;
        $transform: grey(0.3);
    }

    #regist-user .reg-head__step--complete span {
        opacity: 0.6;
    }

    #regist-user .reg-head__step--complete .icon {
        opacity: 1;
        color: $col-white;
    }

    #regist-user .reg-head__step--complete::before {
        background: $col-prim-l2;
    }

    #regist-user .reg-head__step--selected {
        background: $col-primary;
        color: $col-white;
    }

    #regist-user .reg-head__step--selected::before {
        background: $col-prim;
    }

    /* [BODY] Register Body :: control */
    #regist-user .reg-body__controll {
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 1rem;
    }

    #regist-user .reg-body__controll .input-group--select {
        width: 80px;
    }

    /* [BODY] Register Body :: merry-go-round */
    #regist-user .reg-body {
        border: 2px solid $cline;
        margin-top: 10px;
        height: calc(100% - 72px);
        overflow: hidden;
        position: relative;
        font-size: 0;
        white-space: nowrap;
    }

    #regist-user .reg-body__step {
        position: absolute;
        width: calc(100% + 2px);
        height: 100%;
        margin-left: 0px;
        font-size: 14px;
        background: $col-white;
        padding: 10px 20px;
    }

    /* #regist-user .reg-body__step {position:absolute;width:calc(100% + 2px);height:100%;margin-left:0px;font-size:14px;
        transition: transform 1s;background:$col-white;border-left:1px solid $cline;padding:10px 20px;left:100%;}
    #regist-user .reg-body__step:first-child {left:000%;border-left:none;}
    #regist-user .reg-body--selected2 .reg-body__step:nth-child(2) {transform:translateX(-100%);}
    #regist-user .reg-body--selected3 .reg-body__step:nth-child(2),
    #regist-user .reg-body--selected3 .reg-body__step:nth-child(3) {transform:translateX(-100%);}
    #regist-user .reg-body--selected4 .reg-body__step:nth-child(2),
    #regist-user .reg-body--selected4 .reg-body__step:nth-child(3),
    #regist-user .reg-body--selected4 .reg-body__step:nth-child(4) {transform:translateX(-100%);} */

    #regist-user .reg-body__step__title {
        font-size: 24px;
        margin-bottom: 10px;
    }

    #regist-user .reg-body__step__action {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        height: 68px;
    }

    #regist-user .reg-body__step__action .btn {
        border-radius: 0;
        box-shadow: none;
    }

    #regist-user .reg-body__step__action .btn:first-child:not(:last-child) {
        background: $col-white;
        color: $col-dark;
        border: 1px solid $col-dark;
    }

    #regist-user .reg-body__step__action .btn:last-child {
        background: $col-prim;
        color: $col-white;
        position: absolute;
        right: 10px;
    }

    /* [BODY] Register Body :: step1 - check your ID */
    #regist-user .step1-wrapper {
        background: $col-white;
        width: 60%;
        height: 500px;
        position: absolute;
        top: calc(50% - 250px);
        left: calc(20%);
        padding: 0px;
        border: 1px solid $cline;
    }

    #regist-user .step1__row {
        padding: 0 20px;
    }

    #regist-user .step1__row .input-group + label {
        margin: 5px 0px;
        display: block;
    }

    #regist-user .step1__title {
        background: $col-prim;
        color: $col-white;
        position: relative;
        height: 120px;
        margin-bottom: 40px;
    }

    #regist-user .step1__title > small {
        position: absolute;
        top: 18px;
        left: 45px;
        font-size: 16px;
        color: $cline;
    }

    #regist-user .step1__title > label {
        position: absolute;
        top: 40px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 40px;
        font-weight: bold;
    }

    #regist-user .step1__button {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        padding: 0 20px;
    }

    #regist-user .step1__button .btn.btn {
        width: 100%;
        height: 60px;
        display: block;
        background: $col-prim;
        color: $col-white;
        margin: 0;
    }

    #regist-user .step1__button .btn.trivia {
        background: $col-white;
        border: 1px solid $cline;
        color: $col-black
    }

    #regist-user .step1__button .btn + .btn {
        margin-top: 10px;
    }

    /* [BODY] Register Body :: step2 - terms */
    #regist-user .step2__terms {
        height: calc(100% - 100px);
        overflow: auto;
        padding: 0 10px;
    }

    #regist-user .step2__terms .step2__terms__item {
        margin-top: 20px;
    }

    #regist-user .step2__terms__title {
        font-size: 18px;
        margin-bottom: 10px;
    }

    #regist-user .step2__terms__title .icon {
        color: #3A43A6
    }

    #regist-user .step2__terms__content {
        height: 200px;
        border: 1px solid $cline;
        overflow: overlay;
        padding: 10px 10px;
        white-space: normal;
    }

    #regist-user .step2__terms__ask {
        text-align: right;
    }

    /* [BODY] Register Body :: step3 - user info */
    #regist-user .step3__contents {
        position: relative;
    }

    #regist-user .step3__contents .input-group--text-field {
        width: 75%;
    }

    #regist-user .step3__contents .input-group--text-field + .input-group--text-field {
        margin-top: 20px;
    }

    #regist-user .step3__contents hr {
        margin: 20px 0;
    }

    #regist-user .step3__contents__id-cover {
        position: absolute;
        width: 100px;
        height: 40px;
        cursor: pointer;
        top: 0px;
        left: 180px;
        width: calc(75% - 180px);
        height: 30px;
    }

    #regist-user .step3__contents__id-check {
        z-index: 10;
        height: 30px;
        margin: 0;
        min-width: 0;
        background: $col-white;
        color: $col-dark;
        border: 1px solid $col-dark;
        font-size: 12px;
        box-shadow: none;
        border-radius: 0px;
    }

    #regist-user .step3__contents .input-group--text-field.with-edit-button {
        display: inline-block;
        width: calc(100% - 315px);
        margin-right: 5px;
    }

    #regist-user .step3__contents .input-group--text-field.with-edit-button + button {
        width: 120px;
        position: unset;
        vertical-align: top;
        text-transform: none;
    }

    #regist-user .step3__contents .tb-validator-in-dialog .-tb-validator {
        height: 30px;
    }

    #app .id-check-dialog .id-check-dialog__btn {
        display: inline-block;
        height: 30px;
        line-height: 28px;
        margin: 0;
        min-width: 0;
        background: $col-white;
        color: $col-dark;
        border: 1px solid $col-dark;
        font-size: 12px;
        box-shadow: none;
        border-radius: 0px;
        vertical-align: top;
    }

    #app .id-check-dialog .id-check-dialog__text-field {
        display: inline-block;
        width: 100%;
    }

    #id-row.step3-id-check-dialog {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    #id-row.step3-id-check-dialog .tb-validator-in-dialog {
        height: 30px;
    }

    #id-row.step3-id-check-dialog .tb-validator-in-dialog .-tb-validator {
        margin: 0px;
    }

    /*#app .id-check-dialog .id-check-dialog__text-field  *,*/

    /* [BODY] Register Body :: step4 - reg done */
    #regist-user .step4__contents .detail-page__contents__table {
        border-top: 1px solid $cline;
        border-bottom: 1px solid $cline;
    }

    #regist-user .step4__contents .detail-page__contents__table th {
        padding-right: 40px;
    }

    #regist-user .step4__contents .btn {
        width: 100%;
        background: $col-prim;
        color: $col-white;
        margin: 0px;
        margin-top: 30px;
        height: 50px;
        display: block;
    }

    #regist-user .step4__contents .btn + .btn {
        margin-top: 10px;
    }


</style>

<style lang="scss">
    @import "styles/color.scss";
    @import "styles/mixins.scss";

    /*** only for 3rdParty libs ***/
    #regist-user .step1-wrapper .input-group--text-field {
        @include override-vuetify;
    }

    #regist-user .step1-wrapper .input-group--text-field .input-group__input {
        width: 100%;
    }

    #regist-user .step1__button .btn {
        @include override-vuetify;
    }

    #regist-user .step1__button .btn.btn .btn__content {
        font-size: 16px;
    }

    #regist-user .step2__terms__ask .input-group--selection-controls {
        @include override-vuetify;
    }

    #regist-user .step2__terms__ask .input-group--selection-controls .input-group__input i.icon {
        font-size: 22px !important;
    }

    #regist-user .step2__terms__ask .input-group--selection-controls .input-group__details {
        display: none;
    }

    #app #regist-user .step2__terms__ask .input-group--selection-controls {
        display: inline-block;
        width: inherit;
        margin-right: 5px;
        width: 100px;
    }

    #app #regist-user .step2__terms__ask .input-group--selection-controls > label {
        position: relative;
        left: 0;
        display: inline-block;
    }

    #app #regist-user .step2__terms__ask .input-group--selection-controls .input-group__input {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
    }

    #regist-user .step3__contents__id-check > .btn__content {
        height: 28px;
    }

    #regist-user .step3__contents .input-group--text-field {
        @include override-vuetify;
        @include labeled-textfield(180px);
    }

    #regist-user .step3__contents .input-group--text-field.mandatory label:after {
        content: " *";
        color: red;
    }

    #regist-user .step4__button .btn {
        @include override-vuetify;
    }

    #regist-user .step4__button .btn {
        margin: 0;
    }

    #regist-user .reg-body__controll .input-group--select {
        @include override-vuetify;
    }

    #regist-user .step-transition-enter-active {
        transition: all .8s ease;
    }

    #regist-user .step-transition-leave-active {
        transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }

    #regist-user .step-transition-enter,
    #regist-user .step-transition-leave-to {
        transform: translateX(100%);
        opacity: 0;
    }

    #regist-user .-tb-validator__error-message.-tb-validator__error-message--bottom {
        width: auto;
        position: absolute;
        left: 60px
    }

    /* #regist-user .step-fade-in  {transform:translateX(100%);transition:1s;}
    #regist-user .step-fade-out {transform:translateX(-100%);transition:1s;}
    #regist-user .step-fade-active   {opacity:1}
    #regist-user .step-fade-deactive {opacity:0} */

    #app .id-check-dialog.field-box {
        height: 40px;
    }

    #app .id-check-dialog #id-row div.input-group__input {
        vertical-align: top;
    }

    #app .id-check-dialog #id-row div.input-group__details {
        margin-top: -11px;
    }

    #app .id-check-dialog #id-row .id-check-dialog__text-field {
        width: 325px;
        display: inline-block;
    }

    /* 아이디 text-field disabled 회색공간 안깨지게끔 수 */
    #regist-user .step3__contents .input-group--text-field input {
        display: block;
    }

    #regist-user .step3__contents .input-group--text-field.with-edit-button .input-group__input {
        position: absolute;
    }


</style>
