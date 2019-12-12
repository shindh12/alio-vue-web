<template>
    <div>
        <v-dialog :value="systemAddPopup" @input="closeDialog" max-width="450px">
            <v-card id="system-add-edit-popup">
                <v-card-title>
                    <span class="headline"> {{formTitle}}</span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validSystem" ref="form-valid" @click.native="clearValid('form-valid')">
                        <tb-validator :target="editedItem.systemKey" :rules="[rules.required, rules.systemKey, rules.nospace]" lazy>
                            <v-text-field ref="systemKey" :label="$td('system.key', '시스템키')" v-model.trim="editedItem.systemKey" required maxlength="12" />
                        </tb-validator>
                        <tb-validator :target="editedItem.authCode" :rules="[rules.required, rules.nospace]" lazy>
                            <v-text-field ref="authCode" :label="$td('system.auth-code', '보안코드')" v-model.trim="editedItem.authCode" required maxlength="30"></v-text-field>
                        </tb-validator>
                        <tb-validator :target="editedItem.systemName" :rules="[rules.required, rules.systemName]" lazy>
                            <v-text-field ref="systemName" :label="$td('system.name', '시스템명')" v-model.trim="editedItem.systemName" required maxlength="50"></v-text-field>
                        </tb-validator>
                        <v-text-field multi-line :label="$td('message.description', '설명')" v-model.trim="editedItem.description" maxlength="500" class="system-desc"></v-text-field>
                        <v-switch :label="$td('message.use-yn', '사용여부')" v-model="editedItem.useYn" true-value="Y" false-value="N"></v-switch>
                    </tb-validator>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{$td('button.cancel', '취소')}}</v-btn>
                    <v-btn primary @click.native="saveDialog">{{$td('button.save', '저장')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        props: [
            'editedItem',
            'systemAddPopup',
            'formTitle',
            'createStatusValues'
        ],
        watch: {
            systemAddPopup(status) {
                if (status === true) {
                    if (!this.editedItem.systemKey) {
                        this.$refs.systemKey.reset();
                        this.$refs.authCode.reset();
                        this.$refs.systemName.reset();
                    }
                }
            },
        },
        data() {
            return {
                validSystem: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    systemKey: (v) => /^[a-zA-Z0-9-_]{4,12}$/.test(v) || this.$i18n.td('validate.systemkey', '4~12자의 영문 대소문자, 숫자, 특수문자(-_)를 사용하십시오.'),
                    systemName: v => /^[a-zA-Z가-힣0-9 -_]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
            };
        },

        methods: {
            clearValid(refs) {
                this.$refs[refs].clear();
            },
            closeDialog() {
                this.clearValid('form-valid');
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
                // step 2. save system
                const url = '/rest/v1/system/find/duplication';
                axios.post(url, this.editedItem).then(res => {
                    if (res.data) {
                        this.$notify({title: this.$i18n.td('message.duplication', '중복'), text: res.data + ' ' + this.$i18n.td('message.duplicated', '중복입니다.'), type: 'warn'});
                        return;
                    }
                    this.$emit('saveDialog', this.editedItem);
                }).catch(e => {

                });
            },
        }
    };
</script>

<style>
    #app #system-add-edit-popup .system-desc {
        margin-top: 10px;
    }
</style>
