<template>
    <!-- Add, Edit Dialog Area -->
    <div>
        <v-dialog :value="userAuthCodeDialog" @input="closeDialog" max-width="400px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{$td('system.authCode', '비밀번호')}} {{$td('button.modify', '변경')}}</span>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="isValid" ref="form-valid" @click.native="clearValid">
                        <v-text-field ref="authCode" v-if="checkCurrent" :label="$td('button.current', '현재')+' '+$td('system.authCode', '비밀번호')" v-model.trim="currentAuthCode"
                                      :rules="[rules.min]" :type="'password'" maxlength="20" />
                        <tb-validator :target="authCode" :rules="[rules.required, rules.password]" lazy>
                            <v-text-field ref="newAuthCode" :label="$td('system.authCode', '비밀번호')" v-model.trim="authCode" :type="'password'" maxlength="20" required />
                        </tb-validator>
                        <tb-validator :target="authCodeConfirm" :rules="[rules.required, rules.confirmPw]" lazy>
                            <v-text-field ref="authCodeConfirm" :label="$td('system.authCode', '비밀번호') + ' ' + $td('button.confirm', '확인')" v-model.trim="authCodeConfirm"
                                          :type="'password'" maxlength="20" required />
                        </tb-validator>
                    </tb-validator>

                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary @click.native="saveDialog" :disabled="!isValid">{{ $td('button.save', '저장') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

    import jsencrypt from '@/util/jsencryt/jsencrypt.js';
    import axios from 'axios';

    export default {
        name: 'userAuthCodePopup',
        props: ['userAuthCodeDialog', 'isAdmin', 'userId'],
        data() {
            return {
                currentAuthCode: '',
                isValid: false,
                authCode: '',
                authCodeConfirm: '',
                show1: false,
                show2: false,
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    password: v => /^[a-zA-Z0-9!@$%^&*?_~]{8,16}$/.test(v) || this.$i18n.td('validate.passwd', '8~16자의 영문 대소문자, 숫자, 특수문자(!@$%^&*?_~)를 사용하십시오.'),
                    confirmPw: v => v === this.authCode || this.$i18n.td('validate.repeat', '패스워드가 일치하지 않습니다.'),
                }
            };
        },
        mounted() {
            this.authCode = '';
            this.authCodeConfirm = '';
        },
        computed: {
            checkCurrent() {
                return !this.isAdmin;
            }
        },
        watch: {
            userAuthCodeDialog(status) {
                if (status === true) {
                    this.$refs.form.reset();
                }
            },
        },
        methods: {
            closeDialog() {
                this.clearValid();
                this.authCode = '';
                this.authCodeConfirm = '';
                this.$emit('closeAuthCodeDialog');
            },
            saveDialog() {
                /* check valid */
                if (this.validateData('body-one-valid') === false) { return; }

                var userAuthCode = '{ "userId" :' + this.userId + ', "authCode" : "' + this.currentAuthCode + '", "newAuthCode" : "' + this.authCode + '"}';
                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);
                var encrypted1 = encrypt.encrypt(userAuthCode);
                var tokenRequest = {
                    base64: encrypted1
                };
                const url = '/rest/v1/user/authcode/force';
                var that = this;
                axios.post(url, tokenRequest).then(res => {
                    that.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    that.closeDialog();
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            clearValid() {
                this.$refs['form-valid'].clear();
            },

            validateData() {
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
        }
    };
</script>
