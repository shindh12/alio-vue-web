<template>
    <div class="approval-dialog">
        <v-dialog :value="showDialog" @input="checkCurrentMenuDirty" fullscreen hide-overlay
                  transition="dialog-bottom-transition">
            <v-card>
                <!-- Title Area -->
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{ '공지사항 작성' }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text class="dialog-body approval-writing">
                    <!-- [CONTENT] 결재 제목 -->
                    <div class="aprv__content__row field-box">
                        <tb-validator class="tb-validator-in-dialog" :target="notice.noticeTitle" v-model="noticeValid"
                                      :rules="[this.$rule.REQUIRED]" lazy ref="notice-valid"
                                      @click.native="clearValid">
                            <v-text-field :label="message['title']" v-model.trim="notice.noticeTitle" required
                                          maxlength="100"></v-text-field>
                        </tb-validator>
                    </div>
                    <!-- [CONTENT] 결재 제목 END -->
                    <!-- [CONTENT] Approval  -->
                    <div class="aprv__content__row aprv_editor">
                        <tb-validator :target="notice.noticeContents" v-model="contentsValid"
                                      :rules="[this.$rule.REQUIRED]" lazy ref="contents-valid"
                                      @click.native="clearValid">
                            <wysiwyg id="vue-editor" v-model.trim="notice.noticeContents"
                                     @blur="onBlur($event)"></wysiwyg>
                        </tb-validator>
                    </div>

                    <v-card-text class="field-box">
                        <v-switch :label="$td('message.use-yn', '사용여부')" v-model="notice.useYn" true-value="Y" false-value="N"></v-switch>
                    </v-card-text>
                    <!-- [CONTENT] 에디터! END -->
                </v-card-text>
                <v-card-actions>
                    <div class="action-row--mini ">
                        <div class="left">
                            <v-btn @click.native="checkCurrentMenuDirty">{{$td('button.to-list', '목록')}}</v-btn>
                        </div>
                        <div class="right">
                            <v-btn v-show="mode === 'UPDATE'" @click.native="openConfirmDialog('DELETE')" v-if="menuAuth.delete">
                                {{$td('button.delete', '삭제')}}
                            </v-btn>
                            <v-btn primary v-show="mode === 'UPDATE'" @click.native="openConfirmDialog(mode)"
                                   v-if="menuAuth.update">{{$td('button.update', '수정')}}
                            </v-btn>

                            <v-btn v-show="mode === 'CREATE'" @click.native="checkCurrentMenuDirty">{{$td('button.cancel',
                                '취소')}}
                            </v-btn>
                            <v-btn primary v-show="mode === 'CREATE'" @click.native="openConfirmDialog(mode)"
                                   v-if="menuAuth.update">{{$td('button.save', '저장')}}
                            </v-btn>

                        </div>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="userSearchDialog" max-width="450px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ message['user-list'] }}</span>
                </v-card-title>
                <v-card-text>
                    <div class="aprv__content" style="overflow-y:auto; max-height:800px;">
                        <!-- [TABLE] 본체 -->
                        <div class="table__body fixed-layout">
                            <v-data-table
                                :headers="userSearchHeaders"
                                :items="userList"
                                item-key="userId"
                                :total-items="userList.length"
                                hide-actions>
                                <!-- Grid Body -->
                                <template slot="items" slot-scope="props">
                                    <tr @click="addApprovalUser(props.item)">
                                        <td class="text-xs-left"> {{ props.item.fullName }} ({{ props.item.login }})
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <div class="aprv__action">
                        <v-btn @click.native="closeUserSearchDialog">{{ message['close'] }}</v-btn>
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
        components: {
             CommonConfirm
        },
        props: {
            showDialog: {
                type: Boolean,
                default: false,
            },
            notice: {
                type: Object,
                default: {},
            },
            mode: {
                type: String,
                default: '',
            }

        },
        data() {
            return {
                blockerFlag: {},

                expandDropzone: false,
                fileCount: false,
                fileSize: false,
                TOTAL_FILE_SIZE_LIMIT: 10 * 1024 * 1024,
                /*---------*/
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
                noticeValid: false,
                contentsValid: false,
                /*---------*/
                searchUserName: '',
                lineType: '',
                toggle: [],
                selectedRow: [],
                userSearchDialog: false,
                isUserCheck: false,
                content: '',
                // sanitize: require('google-caja').sanitize,
                searchText: '',
                totalItems: 0,
                userList: [],
                userSearchHeaders: [],
                selectedBtn: '',
                editorSettings: {
                    modules: {
                        imageDrop: true,
                        imageResize: {}
                    }
                },
                customToolbar: [
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    // ['image']
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
        watch: {},
        computed: {},
        mounted() {
            //다국어 메세지 가져오기
            this.messageLoad();
            //그리드 헤더 정보 세팅하기
            this.getGridHeader();
            // keydown 적용되도록 추가
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
                this.notice.noticeTitle = '';
                this.notice.noticeContents = '';
                this.notice.comment = '';
                this.$emit('closeDialog');

            },
            closeUserSearchDialog() {
                this.userSearchDialog = false;
            },

            saveDialog(mode) {

                //step 1. check validation
                if (!this.$refs['notice-valid'].isValid()) {
                    this.closeConfirmDialog();
                    return;
                }
                if (!this.$refs['contents-valid'].isValid()) {
                    this.closeConfirmDialog();
                    return;
                }
                // step 2. save system
                if (mode === 'CREATE') {
                    this.createNotice();
                } else if (mode === 'UPDATE') {
                    this.updateNotice();
                } else if (mode === 'DELETE') {
                    this.deleteNotice();
                }
            },

            updateNotice() {
                let notice = {
                    noticeId: this.notice.noticeId,
                    noticeTitle: this.notice.noticeTitle,
                    noticeContents: this.notice.noticeContents,
                    useYn: this.notice.useYn,
                    callbackUrl: ''
                };
                const url = '/rest/v1/std/notice/update';
                this.$http.post(url, notice).then(res => {
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
            createNotice() {
                let notice = {
                    noticeTitle: this.notice.noticeTitle,
                    noticeContents: this.notice.noticeContents,
                    useYn: this.notice.useYn,
                    callbackUrl: ''
                };
                const url = '/rest/v1/std/notice/create';
                this.$http.post(url, notice)
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
            deleteNotice() {
                const url = '/rest/v1/std/notice/delete/' + this.notice.noticeId;
                this.$http.post(url).then(res => {
                    this.closeConfirmDialog();
                    this.closeDialog();
                    this.$notify({
                        title: this.$i18n.td('button.delete', '삭제'),
                        text: this.$i18n.td('message.deleted', '삭제되었습니다.'),
                        type: 'success'
                    });
                }).catch(e => {
                    this.errors.push(e);
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
            getGridHeader() {
                let newUserSearchHeaders = [
                    {
                        text: this.message['full-name'] + '(' + this.$i18n.td('user.id', '아이디') + ')',
                        align: 'center',
                        sortable: false,
                        value: 'fullName',
                        width: '40%'
                    },
                    {text: this.message['e-mail'], align: 'center', sortable: false, value: 'email', width: '60%'}
                ];

                this.userSearchHeaders = newUserSearchHeaders;
            },
            onBlur(editor) {
                this.notice.noticeContents = editor.innerHTML;
            },
            clearValid() {
                this.$refs['notice-valid'].clear();
                this.$refs['contents-valid'].clear();
            },
            validateData(target) {
                if (!this.$refs[target].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
            /* dirty check */
            openDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = true;
            },
            closeDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = false;
            },
            checkCurrentMenuDirty() {
                if (this.notice.title !== '' || this.notice.noticeContents !== '') {
                    this.openDirtyCheckConfirmDialog();
                } else {
                    this.executeMovingFunction();
                }
            },
            executeMovingFunction() {
                this.closeDirtyCheckConfirmDialog();
                this.closeDialog();
            },
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
