<template>
    <div>
        <v-dialog :value="secretAddPopup" @input="closeDialog" max-width="450px">
            <v-card id="system-add-edit-popup">
                <v-card-title>
                    <span class="headline"> {{formTitle}}</span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validSystem" ref="form-valid" @click.native="clearValid('form-valid')">
                        <tb-validator :target="editedItem.clientId" :rules="[this.$rule.REQUIRED, this.$rule.ID, this.$rule.NO_SPACE]" lazy>
                            <v-text-field ref="clientId" :label="$td('', 'ID')" v-model.trim="editedItem.clientId" required maxlength="12" />
                        </tb-validator>
                        <tb-validator :target="editedItem.rawSecret" :rules="[this.$rule.REQUIRED, this.$rule.NO_SPACE]" lazy>
                            <v-text-field ref="rawSecret" :label="$td('', '시크릿')" v-model.trim="editedItem.rawSecret" required maxlength="30"></v-text-field>
                        </tb-validator>
                        <tb-validator :target="editedItem.secretName" :rules="[this.$rule.REQUIRED, this.$rule.NAME]" lazy>
                            <v-text-field ref="secretName" :label="$td('system.name', '시스템명')" v-model.trim="editedItem.secretName" required maxlength="50"></v-text-field>
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
    export default {
        props: [
            'editedItem',
            'secretAddPopup',
            'formTitle',
            'createStatusValues'
        ],
        watch: {
            secretAddPopup(status) {
                if (status === true) {
                    if (!this.editedItem.clientId) {
                        this.$refs.clientId.reset();
                        this.$refs.rawSecret.reset();
                        this.$refs.secretName.reset();
                    }
                }
            },
        },
        data() {
            return {
                validSystem: false,
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
                const url = '/rest/v1/secret/find/duplication';
                this.$http.post(url, this.editedItem).then(res => {
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
