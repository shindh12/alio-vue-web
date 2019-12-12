<template>
    <!-- Add, Edit Dialog Area -->
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="400px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{$td('system.authCode', '비밀번호')}} {{$td('button.confirm', '확인')}}</span>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator :target="currentAuthCode" :rules=[rules.required] v-model="isValid" lazy ref="form-valid" class="tb-validator-in-dialog"
                                  @click.native="clearValid">
                        <v-text-field ref="currentAuthCode" :label="$td('button.current', '현재')+' '+$td('system.authCode', '비밀번호')" v-model.trim="currentAuthCode" required
                                      :type="'password'" maxlength="20" />
                    </tb-validator>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary @click.native="saveDialog" :disabled="!isValid">{{ $td('button.confirm', '확인') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'authCodeCheckDialog',
        props: {
            showDialog: {
                type: Boolean,
                required: true,
            },
            propsUser: {
                type: Object,
                required: true,
            }
        },
        data() {
            return {
                currentAuthCode: '',
                isValid: false,
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                },
                url: {
                    updateUserInfo: '/rest/v1/user/patch/{userId}/default',
                }
            };
        },
        created() {
            this.authCode = '';
        },
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.$refs.currentAuthCode.reset();
                    this.authCode = '';
                }
            },
        },
        methods: {
            closeDialog() {
                this.clearValid();
                this.currentAuthCode = '';
                this.$emit('closeAuthCodeCheckDialog');
            },
            saveDialog() {
                /* check valid */
                if (this.validateData('form-valid') === false) { return; }

                /* encrypt auth code */
                var userAuthCode = '{ "userId" :' + this.userId + ', "authCode" : "' + this.currentAuthCode + '", "newAuthCode" : "' + this.authCode + '"}';
                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                let encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);
                let encryptedCurrentAuthCode = encrypt.encrypt(this.currentAuthCode);
                let tokenRequest = {base64: encryptedCurrentAuthCode};

                let user = Object.assign({}, this.propsUser);
                user.userId = this.$store.state.loginStore.currentUser.userId;
                user.authCode = encryptedCurrentAuthCode;

                let url = this.url.updateUserInfo;
                url = url.replace('{userId}', user.userId);

                axios.post(url, user)
                .then(res => {
                    let updatedUser = res.data;
                    const MUTE_CURRENT = 'current';
                    this.$store.commit(MUTE_CURRENT, updatedUser);
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    this.closeDialog();
                })
                .catch((e) => {
                    console.log(e);
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        type: 'warn'
                    });
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
