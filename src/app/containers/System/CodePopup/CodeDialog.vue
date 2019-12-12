<template>
    <div class="code-group-dialog">
        <!--<v-form ref=form v-model="createValid" lazy-validation>-->
        <v-dialog :value="showDialog" @input="closeDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline"> {{title}}</span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="createValid" ref="form-valid2" @click.native="clearValid">
                        <tb-validator :target="editedItem.codeKey" :rules="[rules.required , rules.codeDup, rules.codeKey, rules.nospace]" lazy>
                            <v-text-field
                                name="codeKey"
                                ref="codeKey"
                                :placeholder="$td('code.key', '코드키')"
                                :label="$td('code.key', '코드키')"
                                v-model.trim="editedItem.codeKey"
                                @keyup="checkCodeDuplicate"
                                required maxlength="50" />
                        </tb-validator>
                        <tb-validator :target="editedItem.defaultName" :rules="[rules.required]" lazy>
                            <v-text-field
                                name="defaultName"
                                ref="defaultName"
                                :placeholder="$td('code.name', '코드명')"
                                :label="$td('code.name', '코드명')"
                                v-model.trim="editedItem.defaultName"
                                required maxlength="400" />
                        </tb-validator>
                        <div class="action-row--mini">
                            <div class="label">i18N</div>
                            <div class="content">
                                <span v-if="editedItem.messageGroup" class="read-field">{{editedItem.messageGroup+'.'+editedItem.messageCode}}</span>
                                <span v-else class="empty-i18n">{{ $td('menu-menus.not-exist-i18n', '다국어가 없습니다.') }}</span>
                                <v-btn style="width: 80px;margin-left: 8px;margin-right: 8px;" @click.native="openMsgDialog()">{{ $td('menu.message-mapping', 'Message Mapping')
                                    }}
                                </v-btn>
                            </div>
                        </div>


                        <v-switch :label="$td('message.use-yn', '사용여부')" v-model="editedItem.useYn" true-value="Y" false-value="N" :disabled="!menuAuth.update"></v-switch>
                    </tb-validator>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog()">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary v-if="saveBtnAuth" @click.native="saveCode()">{{ $td('button.save', '저장') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--</v-form>-->
        <!-- Add, Edit Dialog Area -->
        <code-message-dialog :show-dialog="msgDialog" @closeDialog="closeMsgDialog" @applyDialog="msgApplyDialog" />
    </div>
</template>

<script>
    import axios from 'axios';
    import CodeMessageDialog from '@/containers/System/CodePopup/CodeMessagePopup';

    export default {
        name: 'CodeDialog',
        components: {
            axios,
            CodeMessageDialog
        },
        props: {
            showDialog: {
                type: Boolean,
                default: false,
            },
            mode: {
                type: String,
                default: 'ADD',
            },
            targetItem: {
                type: Object,
                default: {}
            },
        },
        computed: {
            saveBtnAuth() {
                return (this.mode === 'ADD' ? this.menuAuth.create : this.menuAuth.update);
            },
            title() {
                return this.mode == 'ADD' ? this.$i18n.td('menu.code-create', '코드 생성') : this.$i18n.td('menu.code-update', '코드 수정');
            },
        },
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.$refs.codeKey.reset();
                    this.$refs.defaultName.reset();
                    if (this.mode === 'ADD') {
                        this.editedItem = this.targetItem;
                        this.editedItem.useYn = 'Y';
                    } else {
                        this.editedItem = this.targetItem;
                    }
                } else {
                    this.defaultItem.useYn = this.editedItem.useYn;
                    this.editedItem = Object.assign({}, this.defaultItem);
                }
            }
        },
        data() {
            return {
                createValid: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목입니다.'),
                    codeDup: (v) => !this.codeDuplicate || this.$i18n.td('message.duplicated', '중복입니다.'),
                    codeKey: v => /^[a-zA-Z0-9-]{1,50}$/.test(v) || this.$i18n.td('validate.group-code-name-message', '50자 이내의 bar(-) 또는 숫자로 이루어진 영문 대소문자를 입력해주세요.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                editedItem: {
                    groupId: -1,
                    codeId: -1,
                    codeKey: '',
                    beforeCodeKey: '',
                    codeDuplicate: '',
                    codeOrder: '',
                    flag: '',
                    defaultName: '',
                    messageGroup: '',
                    messageCode: '',
                    useYn: 'Y',
                    createDate: '',
                    createUserId: '',
                    updateDate: '',
                    updateUserId: ''
                },
                defaultItem: {
                    groupId: -1,
                    codeId: -1,
                    codeKey: '',
                    beforeCodeKey: '',
                    codeDuplicate: '',
                    codeOrder: '',
                    flag: '',
                    defaultName: '',
                    messageGroup: '',
                    messageCode: '',
                    useYn: 'Y',
                    createDate: '',
                    createUserId: '',
                    updateDate: '',
                    updateUserId: ''
                },
                codeDuplicate: false,
                msgDialog: false,
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        methods: {
            clearValid() {
                this.$refs['form-valid2'].clear();
            },
            closeDialog() {
                console.log('>>> test in dialog ');
                this.clearValid();
                this.$emit('closeDialog');
            },
            openMsgDialog() {
                this.msgDialog = true;
            },
            closeMsgDialog() {
                this.msgDialog = false;
            },
            msgApplyDialog(param) {
                console.log(this.editedItem);
                this.editedItem.messageGroup = param.mGroup;
                this.editedItem.messageCode = param.mCode;
                this.msgDialog = false;
            },
            validateData() {
                if (!this.$refs['form-valid2'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
            saveCode() {
                if (this.validateData() === false) {
                    console.log('###');
                    return;
                }

                let codeDetail = {
                    'codeKey': this.editedItem.codeKey,
                    'groupId': this.editedItem.groupId,
                    'defaultName': this.editedItem.defaultName,
                    'messageGroup': this.editedItem.messageGroup,
                    'messageCode': this.editedItem.messageCode,
                    'codeOrder': this.editedItem.codeOrder,
                };

                if (this.mode === 'ADD') {
                    codeDetail.codeId = -1;
                    codeDetail.useYn = this.editedItem.useYn;
                    axios.post('/rest/v1/code/' + this.editedItem.groupId + '/detail/create', codeDetail)
                    .then(response => {
                        this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                        this.$emit('reloadData');
                        this.closeDialog();
                    })
                    .catch(error => {

                    });
                } else {
                    codeDetail.codeId = this.editedItem.codeId;
                    codeDetail.useYn = this.editedItem.useYn;
                    axios.post('/rest/v1/code/' + this.editedItem.groupId + '/detail/' + this.editedItem.codeId, codeDetail)
                    .then(response => {
                        this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                        this.$emit('reloadData');
                        this.closeDialog();
                    })
                    .catch(error => {

                    });
                }
            },
            checkCodeDuplicate: _.debounce(
                function () {
                    //코드 그룹이 없으면 무조건 Dup 아님
                    if (!this.editedItem.codeKey) {
                        this.codeDuplicate = false;
                        return false;
                    }
                    if (!this.mode === 'ADD' && this.editedItem.beforeCodeKey == this.editedItem.codeKey) {
                        this.codeDuplicate = false;
                    } else {
                        axios.get('/rest/v1/code/' + this.editedItem.groupId + '/codekey/' + this.editedItem.codeKey)
                        .then(response => {
                            if (response.data.length > 0) {
                                this.codeDuplicate = true;
                            } else {
                                this.codeDuplicate = false;
                            }
                        })
                        .catch(error => {

                        });
                    }
                }
                ,
                100
            ),
        }
    };
</script>

<style scoped>

</style>
