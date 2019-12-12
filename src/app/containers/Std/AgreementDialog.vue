<template>
    <div class="agreement-dialog">
        <v-dialog :value="showDialog" @input="checkCurrentMenuDirty" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{'약관 작성'}}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="checkCurrentMenuDirty">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text class="dialog-body approval-writing">
                    <tb-validator class="tb-validator-in-dialog" form v-model="agreementValid" ref="agreement-valid" @click.native="clearValid">
                        <!--[Content] 약관 제목-->
                        <div class="aprv__content__row field-box">
                            <tb-validator :target="agreement.agreementTitle" :rules="[this.$rule.REQUIRED]" lazy>
                                <v-text-field :label="message['title']" v-model.trim="agreement.agreementTitle" required maxlength="100"></v-text-field>
                            </tb-validator>
                        </div>
                        <!--[Content] 약관 제목 END-->
                        <div class="aprv__content__row aprv__signer">
                            <!--[Content] 약관 추가 항목 -->
                            <div class="aprv__signer__add-row field-box">
                                <span class="aprv__signer__add-row__el-wrapper">
                                    <tb-validator :target="agreement.groupCode" :rules="[this.$rule.REQUIRED]" lazy>
                                     <v-select :disabled="mode==='UPDATE'" :label="message['groupCode']" v-model="agreement.groupCode"
                                               :items="groupCodes" @change="changeVersionByGroupCode($event)" required></v-select>
                                    </tb-validator>
                                </span>
                                <span class="aprv__signer__add-row__el-wrapper">
                                <tb-validator :target="agreement.agreementCategory" :rules="[this.$rule.REQUIRED]" lazy>
                                    <v-select :disabled="mode==='UPDATE'" :label="message['agreementCategory']" v-model="agreement.agreementCategory"
                                              :items="agreementCategorys" @change="changeVersionByCategory($event)" required></v-select>
                                </tb-validator>
                                </span>
                                <span class="aprv__signer__add-row__el-wrapper">
                                    <tb-validator :target="agreement.agreementVersion" :rules="[this.$rule.REQUIRED]" lazy>
                            <v-text-field :label="message['agreementVersion']" disabled v-model="agreement.agreementVersion"></v-text-field>
                                    </tb-validator>
                        </span>
                            </div>
                            <!-- [Content] 약관 추가 항목 END-->
                        </div>
                    </tb-validator>
                    <!--[Content] 약관 에디터 -->
                    <br />
                    <div class="aprv__content__row aprv_editor">
                        <tb-validator :target="agreement.agreementContents" v-model="contentsValid" :rules="[this.$rule.REQUIRED]" lazy ref="contents-valid"
                                      @click.native="clearValid">
                            <wysiwyg id="vue-editor" v-model.trim="agreement.agreementContents" @blur="onBlur($event)"></wysiwyg>
                        </tb-validator>
                    </div>
                    <br />
                    <v-card-text class="field-box">
                        <v-layout row>
                            <v-switch :label="$td('message.use-yn', '사용여부')" v-model="agreement.useYn" true-value="Y" false-value="N" @change=checkUseYn></v-switch>
                            <v-switch :label="$td('message.mandatory-yn', '필수여부')" v-model="agreement.mandatoryYn" true-value="Y" false-value="N"></v-switch>
                        </v-layout>
                    </v-card-text>
                    <!--[Content] 약관 에디터 END -->
                </v-card-text>
                <v-card-actions>
                    <div class="action-row--mini">
                        <div class="left">
                            <v-btn @click.native="checkCurrentMenuDirty">{{$td('button.to-list', '목록')}}</v-btn>
                        </div>
                        <div class="right">
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
            @agree="closeAllDialog"
            @disagree="closeDirtyCheckConfirmDialog"
        />
        <common-confirm
            :confirm-dialog="confirmDialog.showDialog"
            :title="confirmDialog.title"
            :message="confirmDialog.message"
            @agree="saveDialog(mode)"
            @disagree="closeConfirmDialog"
        />
        <common-notice
            :notice-dialog="updatePreviousUseYnDialog.showDialog"
            :title="updatePreviousUseYnDialog.title"
            :message="updatePreviousUseYnDialog.message"
            @ok="closeNoticeDialog"
        />
    </div>
</template>
<script>

    import CodeService from '@/util/code/CodeService';
    import CommonConfirm from '@/containers/Common/CommonConfirm';
    import CommonNotice from '@/containers/Common/CommonNotice';
    import DialogUtil from '@/util/dialog';

    export default {
        components: {CommonConfirm, CommonNotice},
        props: {
            showDialog: {
                type: Boolean,
                default: false
            },
            agreement: {
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
                // agreementCategorys: [{text: '개인정보처리방침', value: 'privacy-policy'}, {text: '서비스이용약관', value: 'terms-of-service'}],
                agreementCategorys: [],
                groupCodes: [],
                maxVersion: [],
                changedUseYnY: 'N',
                agreementValid: false,
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
                updatePreviousUseYnDialog: {
                    showDialog: false,
                    title: 'Notice',
                    message: this.$i18n.td('', '동일한 약관 분류에 대해 이전 사용하던 약관은 미사용 처리됩니다.'),
                    nextFunction: '',
                    nextUrl: '',
                },
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
                    'agreementCategory': '',
                    'agreementVersion': '',
                    'groupCode': '',
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
        created() {
            this.agreementCategorys = CodeService.getCodeDetailList('AGREEMENT-CATEGORY', false);
            this.groupCodes = CodeService.getCodeDetailList('GROUP-CODE', false);
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
                if (mode == 'UPDATE') {
                    this.confirmDialog.message = '수정 하시겠습니까?';
                    this.confirmDialog.showDialog = true;
                } else if (mode == 'CREATE') {
                    this.confirmDialog.message = '저장 하시겠습니까?';
                    this.confirmDialog.showDialog = true;
                }
            },
            closeDialog() {
                this.clearValid();
                this.agreement.agreementTitle = '';
                this.agreement.agreementContents = '';
                this.$emit('closeDialog');
            },
            saveDialog(mode) {
                //step 1. check validation
                if (!this.$refs['agreement-valid'].isValid()) {
                    this.closeConfirmDialog();
                    return;
                }
                if (!this.$refs['contents-valid'].isValid()) {
                    this.closeConfirmDialog();
                    return;
                }

                // step 2. save system
                if (mode === 'CREATE') {
                    this.createAgreement();
                } else if (mode === 'UPDATE') {
                    this.updateAgreement();
                }
            },
            updateAgreement() {
                let agreement = {
                    agreementId: this.agreement.agreementId,
                    agreementTitle: this.sanitize(this.agreement.agreementTitle),
                    groupCode: this.sanitize(this.agreement.groupCode),
                    agreementCategory: this.sanitize(this.agreement.agreementCategory),
                    agreementVersion: this.sanitize(this.agreement.agreementVersion),
                    agreementContents: this.sanitize(this.agreement.agreementContents),
                    useYn: this.agreement.useYn,
                    mandatoryYn: this.agreement.mandatoryYn,
                    changedUseYnY: this.changedUseYnY,
                    callbackUrl: ''
                };
                const url = '/rest/v1/std/agreement/update';
                this.$http.post(url, agreement).then(res => {
                    this.closeConfirmDialog();
                    this.closeDialog();
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    if (res.data > 0) {
                        this.updatePreviousUseYnDialog.showDialog = true;
                    }
                }).catch(e => {

                });
            },
            createAgreement() {
                let agreement = {
                    agreementTitle: this.sanitize(this.agreement.agreementTitle),
                    groupCode: this.sanitize(this.agreement.groupCode),
                    agreementCategory: this.sanitize(this.agreement.agreementCategory),
                    agreementVersion: this.sanitize(this.agreement.agreementVersion),
                    agreementContents: this.sanitize(this.agreement.agreementContents),
                    useYn: this.agreement.useYn,
                    mandatoryYn: this.agreement.mandatoryYn,
                    changedUseYnY: this.changedUseYnY,
                    callbackUrl: ''
                };
                const url = '/rest/v1/std/agreement/create';
                this.$http.post(url, agreement)
                .then(response => {
                    this.closeConfirmDialog();
                    this.closeDialog();
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    if (response.data > 0) {
                        this.updatePreviousUseYnDialog.showDialog = true;
                    }
                }).catch(error => {
                });
            },
            messageLoad() {
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['submit'] = this.$i18n.td('button.submit', '저장');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['agreementCategory'] = this.$i18n.td('message.agreementCategory', '약관 분류');
                this.message['agreementVersion'] = this.$i18n.td('message.agreementVersion', '약관 버전');
                this.message['groupCode'] = this.$i18n.td('message.groupCode', '그룹');
                this.message['contents'] = this.$i18n.td('message.contents', '내용');
                this.message['input-required-title'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['title']]);
                this.message['input-required-approval-contents'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['context']]);
                this.message['input-required-opinion'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['submit-opinion']]);
            },
            onBlur(editor) {
                this.agreement.agreementContents = editor.innerHTML;
            },
            clearValid() {
                this.$refs['agreement-valid'].clear();
                this.$refs['contents-valid'].clear();
            },
            openDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = true;
            },
            closeDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = false;
            },
            checkCurrentMenuDirty() {
                if (this.agreement.agreementTitle !== '' || this.agreement.agreementContents !== '') {
                    this.openDirtyCheckConfirmDialog();
                } else {
                    this.closeAllDialog();
                }
            },
            closeAllDialog() {
                this.closeDirtyCheckConfirmDialog();
                this.closeDialog();
            },
            closeNoticeDialog() {
                this.updatePreviousUseYnDialog.showDialog = false;
            },
            closeConfirmDialog() {
                this.confirmDialog.showDialog = false;
            },
            getMaxVersionByCategory() {
                const url = '/rest/v1/std/agreement/agreementCategorys/maxVersion';
                this.$http.get(url).then(res => {
                    this.maxVersion = res.data;
                });
            },
            changeVersionByGroupCode(event) {
                if (!_.isEmpty(this.agreement.agreementCategory)) {
                    this.agreement.agreementVersion = '0';
                    for (var i = 0; i < this.maxVersion.length; i++) {
                        if (event == this.maxVersion[i].groupCode && this.agreement.agreementCategory == this.maxVersion[i].agreementCategory) {
                            this.agreement.agreementVersion = this.maxVersion[i].agreementMaxVersion;
                            break;
                        }
                    }
                    this.agreement.agreementVersion = (parseFloat(this.agreement.agreementVersion) + 1.0).toString();
                }
            },
            changeVersionByCategory(event) {
                if (!_.isEmpty(this.agreement.groupCode)) {
                    this.agreement.agreementVersion = '0';
                    for (var i = 0; i < this.maxVersion.length; i++) {
                        if (event == this.maxVersion[i].agreementCategory && this.agreement.groupCode == this.maxVersion[i].groupCode) {
                            this.agreement.agreementVersion = this.maxVersion[i].agreementMaxVersion;
                            break;
                        }
                    }
                    this.agreement.agreementVersion = (parseFloat(this.agreement.agreementVersion) + 1.0).toString();
                }

            },
            checkUseYn() {
                if (this.agreement.useYn == 'Y') {
                    this.changedUseYnY = 'Y';
                } else {
                    this.changedUseYnY = 'N';
                }
            }
        }
    }
    ;

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
</style>