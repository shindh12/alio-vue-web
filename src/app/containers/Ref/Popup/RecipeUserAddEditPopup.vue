<template>
    <!-- Add, Edit Dialog Area -->
    <div>
        <v-dialog :value="userAddEditDialog" @input="closeDialog" max-width="400px">
            <v-card id="user-add-edit-popup">
                <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validUser" ref="form-valid" @click.native="clearValid" :dataReset="clearData">
                        <tb-validator :target="editedItem.login" :rules="[this.$rule.REQUIRED, rules.login, rules.nospace]" lazy>
                            <v-text-field ref="login" :label="$i18n.td('user.id', '아이디')" v-model.trim="editedItem.login" :disabled=isDisabled required maxlength="12" />
                        </tb-validator>
                        <tb-validator :target="editedItem.fullName" :rules="[this.$rule.REQUIRED, rules.fullName, rules.nospace]" lazy>
                            <v-text-field ref="fullname" :label="$i18n.td('message.username', '성명')" v-model.trim="editedItem.fullName" required maxlength="30"></v-text-field>
                        </tb-validator>
                        <tb-validator :target="editedItem.email" :rules="[this.$rule.REQUIRED, this.$rule.EMAIL]" lazy>
                            <v-text-field ref="email" :label="$i18n.td('user.e-mail', 'E-Mail')" v-model.trim="editedItem.email" required maxlength="100"></v-text-field>
                        </tb-validator>
                        <div class="select-box--wrapper">
                            <div class="page-searchbox__item-title">{{this.$i18n.td('message.status', '상태')}}</div>
                            <span class="---has-to-be-span---">
                <v-select :items="statusValues" v-model="editedItem.statusSelect" @input="invokeEvent" return-object item-text="text" item-value="value"
                          class="user-status-select" />
              </span>
                        </div>
                    </tb-validator>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary @click.native="saveDialog" @keyup.tab="alert(1)">{{ $td('button.save', '저장') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'recipeUserListPopup',
        props: {
            userAddEditDialog: {
                type: Boolean,
                default: false,
            },
            formTitle: {
                type: String,
                default: '',
            },
            statusValues: {
                type: Array,
                default: [],
            },
            editedItem: {
                type: Object,
                default: {},
            }
        },
        data: function () {
            return {

                validUser: false,
                backEmail: '',
                rules: {
                    login: v => /^[a-z0-9_.]{5,12}$/.test(v) || this.$i18n.td('validate.login', '5~12자의 영문 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    password: v => /^[a-zA-Z0-9!@$%^&*?_~]{8,16}$/.test(v) || this.$i18n.td('validate.passwd', '8~16자의 영문 대소문자, 숫자, 특수문자(!@$%^&*?_~)를 사용하십시오.'),
                    confirmPw: v => v === this.regInfo.authCode || this.$i18n.td('validate.repeat', '패스워드가 일치하지 않습니다.'),
                    fullName: v => /^[a-zA-Z가-힣 ]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                }
            };
        },
        watch: {
            userAddEditDialog(status) {
                if (status) {  // 팝업 호출 시에 기존 데이터 삭제
                    this.clearValid();
                }
            },
        },
        computed: {
            isDisabled() {
                if (this.editedItem.loginFailCount == undefined) {
                    return false;
                } else {
                    return true;
                }
            },
            isDisabledSave() {
                if (!this.editedItem.login || !this.editedItem.fullName || !this.editedItem.email) {
                    return true;
                }
                if (this.isValid == false) {
                    return true;
                }
                return false;
            }
        },
        methods: {

            clearData() {
                this.$refs.login.reset();
                this.$refs.fullname.reset();
                this.$refs.email.reset();
                this.editedItem.statusSelect = {text: this.$i18n.td('message.active', '활성'), value: 1};
            },

            clearValid() {
                this.$refs['form-valid'].clear();
            },
            closeDialog() {
                this.clearValid();
                this.$emit('closeDialog');
            },
            saveDialog() {
                // step 1. check validation
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return;
                }

                console.log(this.backEmail);
                this.editedItem.statusId = this.editedItem.statusSelect.value;
                if (this.editedItem.loginFailCount == undefined || this.backEmail != this.editedItem.email) {
                    const url = '/rest/v1/user/find/duplication';
                    axios.post(url, this.editedItem).then(res => {
                        if (res.data == 'Email' || (res.data != '' && this.editedItem.loginFailCount == undefined)) {
                            this.$notify({title: this.$i18n.td('message.duplication', '중복'), text: res.data + ' ' + this.$i18n.td('message.duplicated', '중복입니다.'), type: 'warn'});
                            return;
                        }
                        this.$emit('saveDialog', this.editedItem);
                    }).catch(e => {
                        this.errors.push(e);
                    });
                } else {
                    this.$emit('saveDialog', this.editedItem);
                }
            },
            invokeEvent: function (e) {
                this.editedItem.statusId = e.value;
            }
        }
    };
</script>


<style>
    #app #user-add-edit-popup .select-box--wrapper {
        font-size: 0px;
        height: 30px;
        line-height: 30px;
    }

    #app #user-add-edit-popup .page-searchbox__item-title {
        height: inherit;
        line-height: inherit;
    }

    #app #user-add-edit-popup .user-status-select {
        width: 100px;
        margin-top: 10px;
    }

</style>
