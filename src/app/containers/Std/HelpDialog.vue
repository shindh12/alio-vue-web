<template>
    <div class="help-dialog">
        <v-dialog :value="showDialog" @input="checkCurrentMenuDirty" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{'도움말 작성'}}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text class="dialog-body approval-writing">
                    <!--[Content] 도움말 제목-->
                    <div class="aprv__content__row field-box">
                        <tb-validator class="tb-validator-in-dialog" :target="help.helpTitle" v-model="helpValid" :rules="[this.$rule.REQUIRED]" lazy ref="help-valid"
                                      @click.native="clearValid">
                            <v-text-field :label="message['title']" v-model.trim="help.helpTitle" required maxlength="100"></v-text-field>
                        </tb-validator>
                    </div>
                    <!--[Content] 도움말 제목 END-->
                    <!--[Content] 도움말 에디터 -->
                    <div class="aprv__content__row aprv_editor">
                        <tb-validator :target="help.helpContents" v-model="contentsValid" :rules="[this.$rule.REQUIRED]" lazy ref="contents-valid" @click.native="clearValid">
                            <wysiwyg id="vue-editor" v-model.trim="help.helpContents" @blur="onBlur($event)"></wysiwyg>
                        </tb-validator>
                    </div>
                    <v-card-text class="field-box">
                        <v-switch :label="$td('message.use-yn', '사용여부')" v-model="help.useYn" true-value="Y" false-value="N"></v-switch>
                    </v-card-text>
                    <!--[Content] 도움말 에디터 END -->
                </v-card-text>
                <v-card-actions>
                    <div class="action-row--mini">
                        <div class="left">
                            <v-btn @click.native="checkCurrentMenuDirty">{{$td('button.to-list', '목록')}}</v-btn>
                        </div>
                        <div class="right">
                            <v-btn v-show="mode==='UPDATE'" @click.native="openConfirmDialog('DELETE')" v-if="menuAuth.delete">
                                {{$td('button.delete', '삭제')}}
                            </v-btn>
                            <v-btn primary v-show="mode==='UPDATE'" @click.native="openConfirmDialog(mode)" v-if="menuAuth.update">
                                {{$td('button.update', '수정')}}
                            </v-btn>

                            <v-btn v-show="mode==='CREATE'" @click.native="checkCurrentMenuDirty">
                                {{$td('button.cacel','취소')}}
                            </v-btn>
                            <v-btn primary v-show="mode === 'CREATE'" @click.native="openConfirmDialog(mode)"
                                   v-if="menuAuth.update">{{$td('button.save', '저장')}}
                            </v-btn>
                        </div>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- confirm dialog for moving without save -->
        <common-confirm
            :confirm-dialog="dirtyCheckConfirmDialog.showDialog"
            :title="dirtyCheckConfirmDialog.title"
            :message="dirtyCheckConfirmDialog.message"
            @agree="executeMovingFunction"
            @disagree="closeDirtyCheckConfirmDialog"
        />

        <common-confirm
            :confirm-dialog="confirmDialog.showDialog"
            :title="confirmDialog.title"
            :message="confirmDialog.message"
            @agree="saveDialog(confirmMode)"
            @disagree="closeConfirmDialog">
        </common-confirm>
    </div>
</template>
<script>

    import CommonConfirm from '@/containers/Common/CommonConfirm';
    import DialogUtil from '@/util/dialog';

    export default {
        components: { CommonConfirm},
        props: {
            showDialog: {
                type: Boolean,
                default: false
            },
            help: {
                type: Object,
                default: {}
            },
            mode: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
                helpValid: false,
                contentsValid: false,
                sanitize: require('google-caja').sanitize,
                customToolbar: [
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                ],
                config: {
                    toolbar: [
                        '/',
                        {
                            name: 'basicstyles',
                            items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat']
                        },
                        {
                            name: 'paragraph',
                            items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight',
                                'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language']
                        },
                        '/',
                        {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                        {name: 'colors', items: ['TextColor', 'BGColor']},
                        {name: 'about', items: ['About']}
                    ],
                    height: 300
                },
                dirtyCheckConfirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: this.$i18n.td('message.confirm-menu-moving', '작성중인 내용은 저장되지 않습니다. 이동하시겠습니까?'),
                    nextFunction: '',
                    nextUrl: '',
                },
                confirmMode: '',
                confirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: '',
                    nextFunction: '',
                    nextUrl: '',
                },
                message: {
                    'context': '',
                    'close': '',
                    'submit': '',
                    'search': '',
                    'title': '',
                    'user-can-not-search': '',
                    'total': '',
                    'people': '',
                    'full-name': '',
                    'e-mail': '',
                    'user-list': '',
                    'user-count-meessage': '',
                    'must-select-two-more': '',
                    'input-required-title': '',
                }
            };
        },
        mounted() {
            this.messageLoad();
            DialogUtil.addKeydownEventListener();
        },
        beforeDestroy() {
            DialogUtil.removeKeydownEventListener();
        },
        methods: {
            openConfirmDialog(mode) {
                this.confirmMode = mode;
                if (mode == 'UPDATE') {
                    this.confirmDialog.message = '수정 하시겠습니까?';
                    this.confirmDialog.showDialog = true;
                } else if (mode == 'CREATE') {
                    this.confirmDialog.message = '저장 하시겠습니까?';
                    this.confirmDialog.showDialog = true;
                } else if (mode == 'DELETE') {
                    this.confirmDialog.message = '삭제 하시겠습니까?';
                    this.confirmDialog.showDialog = true;
                }
            },
            closeConfirmDialog() {
                this.confirmDialog.showDialog = false;
            },
            closeDialog() {
                this.clearValid();
                this.help.helpTitle = '';
                this.help.helpContents = '';
                this.$emit('closeDialog');
            },
            saveDialog(mode) {
                //step 1. check validation
                if (!this.$refs['help-valid'].isValid()) {
                    this.closeConfirmDialog();
                    return;
                }
                if (!this.$refs['contents-valid'].isValid()) {
                    this.closeConfirmDialog();
                    return;
                }

                // step 2. save system
                if (mode === 'CREATE') {
                    this.createHelp();
                } else if (mode === 'UPDATE') {
                    this.updateHelp();
                } else if (mode === 'DELETE') {
                    this.deleteHelp();
                }

            },
            updateHelp() {
                let help = {
                    helpId: this.help.helpId,
                    helpTitle: this.sanitize(this.help.helpTitle),
                    helpContents: this.sanitize(this.help.helpContents),
                    useYn: this.help.useYn,
                    callbackUrl: ''
                };
                const url = '/rest/v1/std/help/update';
                this.$http.post(url, help).then(res => {
                    this.closeConfirmDialog();
                    this.closeDialog();
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                }).catch(e => {

                });
            },
            createHelp() {
                let help = {
                    helpTitle: this.sanitize(this.help.helpTitle),
                    helpContents: this.sanitize(this.help.helpContents),
                    useYn: this.help.useYn,
                    callbackUrl: ''
                };
                const url = '/rest/v1/std/help/create';
                this.$http.post(url, help)
                .then(response => {
                    this.closeConfirmDialog();
                    this.closeDialog();
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                }).catch(error => {
                });
            },
            deleteHelp() {
                const url = '/rest/v1/std/help/delete/' + this.help.helpId;
                this.$http.post(url).then(res => {
                    this.closeConfirmDialog();
                    this.closeDialog();
                    this.$notify({
                        title: this.$i18n.td('button.delete', '삭제'),
                        text: this.$i18n.td('message.deleted', '삭제되었습니다.'),
                        type: 'success'
                    });
                }).catch(e => {

                });
            },
            messageLoad() {
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['submit'] = this.$i18n.td('button.submit', '저장');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['contents'] = this.$i18n.td('message.contents', '내용');
                this.message['input-required-title'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['title']]);
                this.message['input-required-approval-contents'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['context']]);
                this.message['input-required-opinion'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['submit-opinion']]);
            },
            onBlur(editor) {
                this.help.helpContents = editor.innerHTML;
            },
            clearValid() {
                this.$refs['help-valid'].clear();
                this.$refs['contents-valid'].clear();
            },
            openDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = true;
            },
            closeDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = false;
            },
            checkCurrentMenuDirty() {
                if (this.help.helpTitle !== '' || this.help.helpContents !== '') {
                    this.openDirtyCheckConfirmDialog();
                } else {
                    this.executeMovingFunction();
                }
            },
            executeMovingFunction() {
                this.closeDirtyCheckConfirmDialog();
                this.closeDialog();
            }
        }
    };

</script>
<style lang="scss" scoped>
    @import "styles/approvalModal.scss";

    .action-row--mini {
        margin-top: 30px;
    }

    #quill-editor {
        height: 1000px;
        overflow: auto;
    }

    #app .dialog__content .dialog .card .field-box .input-group--selection-controls.input-group--selection-controls {
        margin-top: 15px;
    }
</style>