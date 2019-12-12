<template>
    <div>
        <v-dialog v-model="showDialog" max-width="450px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box">

                    <tb-validator class="tb-validator-in-dialog" form v-model="validMessage" ref="form-valid" @click.native="clearValid">
                        <v-select :items="systemSearchValues" :label="$td('menu.system', '시스템')" disabled
                                  item-text="systemName" item-value="systemKey" v-model.trim="saveData.systemKey"></v-select>
                        <tb-validator :target="saveData.messageGroup" :rules="[ rules.required, rules.limitChar50 ]" lazy>
                            <v-text-field
                                ref="messageGroup"
                                :label="$td('message.message-group', '메세지 그룹')"
                                :disabled=isDisabled
                                v-model.trim="saveData.messageGroup"
                                :hint="$td('validate.message-group-code-50', '50자 이내의 bar(-) 또는 숫자로 이루어진 영문 소문자를 입력해주세요.')"
                                required maxlength="50" />
                        </tb-validator>
                        <tb-validator :target="saveData.messageCode" :rules="[ rules.required, rules.limitChar ]" lazy>
                            <v-text-field
                                :label="$td('message.message-code', '메세지 코드')"
                                :disabled=isDisabled
                                v-model.trim="saveData.messageCode"
                                :hint="$td('validate.message-group-code', '100자 이내의 bar(-) 또는 숫자로 이루어진 영문 소문자를 입력해주세요.')"
                                required maxlength="100" />
                        </tb-validator>
                        <hr>
                        <v-text-field v-for="(item, val) of defaultMessage" :key="val" v-if="val.length == 2"
                                      :label="$td('language.'+val , val)" v-model.trim="saveData[val]" maxlength="1000"></v-text-field>
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
            'languages',
            'editedIndex',
            'editedItem',
            'showDialog'
        ],
        data() {
            return {
                url: {
                    create: '/rest/v1/message/create',
                    update: '/rest/v1/message/update'
                },
                saveData: {},
                validMessage: false,
                systemSearchValues: [],
                defaultMessage: {
                    systemKey: '',
                    messageGroup: '',
                    messageCode: ''
                },
                searchAfterClose: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('message.required', '필수 입력 항목입니다.'),
                    limitChar50: v => /^[a-z0-9-]{1,50}$/.test(v) || this.$i18n.td('validate.message-group-code-50', '50자 이내의 bar(-) 또는 숫자로 이루어진 영문 소문자를 입력해주세요.'),
                    limitChar: v => /^[a-z0-9-]{1,100}$/.test(v) || this.$i18n.td('validate.message-group-code', '100자 이내의 bar(-) 또는 숫자로 이루어진 영문 소문자를 입력해주세요.')
                }
            };
        },
        computed: {
            formTitle() {
                return this.editedIndex > -1 ? this.$i18n.td('menu.message-update', '메세지 수정') : this.$i18n.td('menu.message-create', '메세지 생성');
            },
            isDisabled() {
                return this.editedIndex > -1 ? true : false;
            },
        },
        mounted() {
            this.initSystemKeySelect();
        },
        watch: {
            showDialog(value) {
                if (value === true) {
                    //form reset 후 다시 세팅
                    let reset = Object.assign({}, this.editedItem);
                    this.saveData = reset;
                    this.searchAfterClose = false;
                    this.addDynamicLanguages(this.languages);
                } else if (value === false) {
                    return;
                }
            },
        },
        methods: {
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
            initSystemKeySelect() {
                const url = '/rest/v1/system';
                axios.get(url).then(res => {
                    this.systemSearchValues = res.data;
                    this.searchSystemKey = this.systemSearchValues[0].systemKey;
                    this.treeSystemKey = this.searchSystemKey;
                });
            },
            addDynamicLanguages(arrLang) {
                arrLang.forEach((value) => {
                    this.defaultMessage[value] = '';
                });
            },
            closeDialog() {
                this.clearValid();

                //변경된 데이터가 있으면 searchAfterClose -> true
                var searchAfterClose = this.searchAfterClose;
                this.$emit('closeDialog', searchAfterClose);
                setTimeout(() => {
                    this.editItem = Object.assign({}, this.defaultMessage);
                }, 1000);
            },
            async saveDialog() {
                if (await this.validateData() === false) {
                    return;
                }

                let saveSystemKey = this.saveData.systemKey;
                let saveMessageGroup = this.saveData.messageGroup;
                let saveMessageCode = this.saveData.messageCode;
                if (this.isEmpty(saveSystemKey) || typeof saveSystemKey != 'string') {
                    this.$notify({
                        title: this.$i18n.td('message.error', '오류'),
                        text: this.$i18n.td('message.input-required', '시스템을 입력해주세요.', [this.$i18n.td('message.system', '시스템') + '을']),
                        type: 'error'
                    });
                    return;
                }
                if (this.isEmpty(saveMessageGroup) || typeof saveMessageGroup != 'string') {
                    this.$notify({
                        title: this.$i18n.td('message.error', '오류'),
                        text: this.$i18n.td('message.input-required', '메세지 그룹을 입력해주세요.', [this.$i18n.td('message.message-group', '메세지 그룹') + '을']),
                        type: 'error'
                    });
                    return;
                }
                if (this.isEmpty(saveMessageCode) || typeof saveMessageCode != 'string') {
                    this.$notify({
                        title: this.$i18n.td('message.error', '오류'),
                        text: this.$i18n.td('message.input-required', '메세지 코드를 입력해주세요.', [this.$i18n.td('message.message-code', '메세지 코드') + '를']),
                        type: 'error'
                    });
                    return;
                }
                //update
                if (this.editedIndex > -1) {
                    this.saveMessage('update');
                }
                //create
                else {
                    this.saveMessage('create');
                }
            },
            saveMessage(param) {
                var url = this.url.create;
                if (param == 'update') {
                    url = this.url.update;
                }
                axios.post(url, this.saveData)
                .then(res => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.searchAfterClose = true;
                    this.closeDialog();
                }).catch(e => {
                });
            },
            isEmpty(val) {
                if (val == undefined || val == null || val == '') {
                    return true;
                } else {
                    return false;
                }
            }
        }
    };
</script>

<style>
</style>
