<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="500px">
            <v-card id="board-dialog-popup">
                <v-card-title>
                    <span class="headline"> {{ title }} </span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>

                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validBoard" ref="form-valid" @click.native="clearValid">
                        <!-- Board Key, 게시판 키 -->
                        <tb-validator :target="targetBoard.boardKey" :rules="[rules.required, rules.boardKey, rules.nospace, rules.boardKeyDup]" lazy>
                            <v-text-field ref="boardKey" :label="td.menuBoard.boardKey" :disabled="isUpdateMode" v-model.trim="targetBoard.boardKey" required maxlength="100" />
                        </tb-validator>
                        <!-- Board Title, 게시판 명 -->
                        <tb-validator :target="targetBoard.boardTitle" :rules="[rules.required, rules.fullName, rules.nospace]" lazy>
                            <v-text-field ref="boardTitle" :label="td.menuBoard.boardName" v-model.trim="targetBoard.boardTitle" @keyup.enter="onClickSave" required
                                          maxlength="100" />
                        </tb-validator>
                        <!-- Menu Key, 메뉴 키 -->
                        <v-text-field ref="menuKey" :label="td.menuMenus.menuKey" v-model.trim="targetBoard.menuKey" @keyup.enter="onClickSave" maxlength="100"
                                      class="margin-top-10px" />
                        <!-- Board Use Yn, 게시판 사용여부 -->
                        <v-switch :label="td.menuBoard.board + ' ' + td.message.useYn" v-model="targetBoard.boardUseYn" true-value="Y" false-value="N" class="margin-top-10px" />
                        <hr />

                        <div id="board-dialog-popup__option">
                            <!-- Comment UseYn, 댓글 사용여부 -->
                            <v-switch :disabled="optionDisabled" :label="td.menuBoard.comment + ' ' + td.message.useYn" v-model="targetBoard.commentUseYn" true-value="Y"
                                      false-value="N" />
                            <!-- Reply UseYn, 답글 사용여부 -->
                            <v-switch :disabled="optionDisabled" :label="td.menuBoard.reply + ' ' + td.message.useYn" v-model="targetBoard.replyUseYn" true-value="Y"
                                      false-value="N" />
                            <!-- Announcement UseYn, 공지사항 사용여부 -->
                            <v-switch :disabled="optionDisabled" style="width:50%; margin-top:10px;" :label="td.menuBoard.announcement + ' ' + td.message.useYn"
                                      v-model="targetBoard.announcementUseYn" true-value="Y" false-value="N" />

                            <!-- Category, 카테고리 -->
                            <div style="display:inline-flex; width:100%">
                                <v-switch :disabled="optionDisabled" style="width:60%; margin-top:10px;" :label="td.menuBoard.category + ' ' + td.message.useYn"
                                          v-model="targetBoard.categoryUseYn" true-value="Y" false-value="N" />
                                <v-select :disabled="optionDisabled" v-show="targetBoard.categoryUseYn==='Y'" :items="categoryList" v-model="targetBoard.categoryId"
                                          item-text="text" item-value="value" />
                            </div>

                            <!-- Attachment, 첨부 -->
                            <div style="display:inline-flex; width:100%">
                                <v-switch :disabled="optionDisabled" style="width:60%; margin-top:10px;" :label="td.menuBoard.attachment + ' ' + td.message.useYn"
                                          v-model="targetBoard.attachmentUseYn" true-value="Y" false-value="N" />
                                <v-select :disabled="optionDisabled" v-show="targetBoard.attachmentUseYn==='Y'" :items="attachmentSizeList"
                                          v-model="targetBoard.attachmentSizeLimit" item-text="text" item-value="value" class="user-status-select" />
                            </div>

                            <!-- Expiration Days, 유효기간 -->
                            <div style="display:inline-flex; width:100%">
                                <v-switch :disabled="optionDisabled" style="width:60%; margin-top:10px;" :label="td.menuBoard.expirationDay + ' ' + td.message.useYn"
                                          v-model="targetBoard.articleExpirationDayUseYn" true-value="Y" false-value="N" />
                                <tb-validator id="expDayValidator" v-if="targetBoard.articleExpirationDayUseYn==='Y'" :target="targetBoard.articleExpirationDay"
                                              :rules="[rules.number, rules.required]" lazy>
                                    <v-text-field :disabled="optionDisabled" v-model.trim="targetBoard.articleExpirationDay" maxlength="4" :suffix="td.menuBoard.days" />
                                </tb-validator>
                            </div>
                        </div>
                    </tb-validator>
                </v-card-text>

                <v-card-actions v-if="this.menuAuth.update">
                    <v-btn @click.native="closeDialog">{{ td.button.cancel }}</v-btn>
                    <v-btn :disabled="false" v-show="this.mode==='ADD'" primary @click.native="saveBoard"> {{ td.button.save }}</v-btn>
                    <v-btn :disabled="false" v-show="this.mode==='UPDATE'" primary @click.native="saveBoard"> {{ td.button.save }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>


</template>

<script>
    import axios from 'axios';
    import MessageMappingDialog from '@/containers/System/CodePopup/CodeMessagePopup';
    import CodeService from '@/util/code/CodeService';

    export default {
        name: 'BoardCUDialog',
        components: {
            MessageMappingDialog
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
            propsBoard: {
                type: Object,
                default: {},
            }
        },
        data() {
            return {
                validBoard: false,
                boardKeyDuplicate: false,
                targetBoard: {
                    systemKey: '',
                    boardKey: '',
                    boardTitle: '',
                    menuKey: '',
                    boardUseYn: '',
                    categoryUseYn: '',
                    categoryId: -1,
                    commentUseYn: '',
                    replyUseYn: '',
                    attachmentUseYn: '',
                    attachmentSizeLimit: -1,
                    announcementUseYn: '',
                    announcementRoleId: '',
                    articleExpirationDayUseYn: '',
                    articleExpirationDay: -1,
                },
                attachmentSizeList: [],
                categoryList: [],
                useYnValues: [
                    {text: 'Y'},
                    {text: 'N'}
                ],
                url: {
                    create: '/rest/v1/board/create',
                    update: '/rest/v1/board/update',
                    duplicate: 'rest/v1/board/duplicate',
                    category: 'rest/v1/category'
                },
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    boardKeyDup: () => !this.boardKeyDuplicate || this.$i18n.td('message.duplicated', '중복입니다.'),
                    boardKey: (v) => /^[a-zA-Z0-9_.]{4,50}$/.test(v) || this.$i18n.td('validate.group-name', '4~50자의 영문 대문자, 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    nospace: (v) => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                    number: (v) => /[^0-9]/g.test(v) == false || this.$i18n.td('validate.number', '숫자만 입력할 수 있습니다.'),
                    fullName: v => /^[0-9a-zA-Z가-힣 ]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                },
                td: {
                    message: {
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        description: this.$i18n.td('message.description', '설명'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),

                        name: this.$i18n.td('message.name', '명'),
                    },
                    button: {
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장'),
                        add: this.$i18n.td('button.add', '추가'),
                        update: this.$i18n.td('button.update', '수정'),
                    },
                    menuMenus: {
                        menuKey: this.$i18n.td('menu-menus.menu-key', '메뉴키'),
                    },
                    menuBoard: {
                        board: this.$i18n.td('menu-board.board', '게시판'),
                        boardName: this.$i18n.td('menu-board.board-name', '게시판 명'),
                        boardKey: this.$i18n.td('menu-board.board-key', '게시판 키'),
                        article: this.$i18n.td('menu-board.article', '게시물'),
                        category: this.$i18n.td('menu-board.category', '카테고리'),
                        reply: this.$i18n.td('menu-board.reply', '답글'),
                        comment: this.$i18n.td('menu-board.comment', '댓글'),
                        attachment: this.$i18n.td('menu-board.attachment', '첨부'),
                        announcement: this.$i18n.td('menu-board.notice', '공지사항'),
                        expirationDay: this.$i18n.td('menu-board.expiration-day', '유효기간'),
                        days: this.$i18n.td('menu-board.days', '일'),
                    }
                },

                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                },
            };
        },
        computed: {
            title() {
                let prefix = this.td.menuBoard.board;
                let postfix = this.mode == 'ADD' ? this.td.button.add : this.td.button.update;
                return prefix + ' ' + postfix;
            },
            isUpdateMode() {
                return this.mode === 'UPDATE' ? true : false;
            },
            optionDisabled() {
                return this.targetBoard.boardUseYn === 'N';
            }
        },
        watch: {
            showDialog(value) {
                if (value === true) {
                    if (this.mode === 'ADD') {
                        this.initializeBoard();
                    } else { // mode === 'UPDATE'
                        Object.assign(this.targetBoard, this.propsBoard);
                    }
                } else { /* Nothing to do */ }
            }
        },
        created() {
            this.attachmentSizeList = CodeService.getCodeDetailList('file-upload-size-limit');
            this.getCategoryList();
        },
        methods: {
            initializeBoard() {
                this.targetBoard = {
                    systemKey: this.$store.state.loginStore.systemKey,
                    boardKey: '',
                    boardTitle: '',
                    menuKey: '',
                    boardUseYn: 'Y',
                    categoryUseYn: 'Y',
                    categoryId: this.categoryList.length == 0 ? '' : this.categoryList[0].value,
                    commentUseYn: 'Y',
                    replyUseYn: 'Y',
                    attachmentUseYn: 'Y',
                    attachmentSizeLimit: this.attachmentSizeList[0].value,
                    announcementUseYn: 'Y',
                    announcementRoleId: '',
                    articleExpirationDayUseYn: 'Y',
                    articleExpirationDay: '14',
                };
                this.$refs.boardKey.reset();
                this.$refs.boardTitle.reset();
                this.$refs.menuKey.reset();
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
            async isDuplicatedBoardKey(boardKey) {
                let url = this.url.duplicate;
                let systemKey = this.$store.state.loginStore.systemKey;

                try {
                    let res = await axios.get(url, {
                        params: {
                            systemKey: systemKey,
                            boardKey: boardKey
                        }
                    });
                    this.boardKeyDuplicate = res.data;
                } catch (e) {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saveFailed,
                        type: 'error'
                    });
                }

            },
            async saveBoard() {
                // step 1. check validation
                if (this.mode === 'ADD') { await this.isDuplicatedBoardKey(this.targetBoard.boardKey); }

                if (this.validateData() === false) { return; }

                // step 2. adjust board options
                this.adjustBoardOption();

                // step 3. save board
                let url = this.mode === 'ADD' ? this.url.create : this.url.update;
                axios.post(url, this.targetBoard)
                .then(() => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saved,
                        type: 'success'
                    });
                    this.closeDialog();
                })
                .catch(() => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saveFailed,
                        type: 'error'
                    });
                });
            },
            adjustBoardOption() {
                const UN_USED = -1;
                if (this.targetBoard.categoryUseYn === 'N') { this.targetBoard.categoryId = UN_USED; }
                if (this.targetBoard.attachmentUseYn === 'N') { this.targetBoard.attachmentSizeLimit = UN_USED; }
                if (this.targetBoard.articleExpirationDayUseYn === 'N') { this.targetBoard.articleExpirationDay = UN_USED; }
            },
            closeDialog() {
                this.clearValid();
                this.$emit('closeDialog');
            },
            getCategoryList() {
                let url = this.url.category;
                axios.get(url, {
                    params: {
                        systemKey: this.$store.state.loginStore.systemKey,
                        searchText: '',
                        useYn: 'Y'
                    }
                }).then(res => {
                    res.data.forEach(element => {
                        this.categoryList.push({text: this.$i18n.td(element.i18n, element.categoryName), value: element.categoryId});
                    });
                }).catch(() => {
                    this.$notify({
                        title: this.$i18n.td('button.search', '조회'),
                        text: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
        }
    };


</script>

<style>
    #app .dialog__content .dialog #board-dialog-popup.card .field-box .input-group--text-field.input-group--select > div.input-group__input {
        width: 100%;
    }

    #app .dialog__content .dialog #board-dialog-popup.card .field-box #board-dialog-popup__option .input-group--text-field.input-group--text-field:not(.input-group--multi-line) .input-group__input {
        width: 100%;
    }

    #app .dialog__content .dialog #board-dialog-popup.card .field-box #board-dialog-popup__option .input-group--text-field > div.input-group__details {
        margin-left: 0px;
        width: 100%;
    }

    #app .dialog__content .dialog #board-dialog-popup.card .field-box .input-group label {
        width: 160px;
    }

    #app .dialog__content .dialog #board-dialog-popup.card .field-box .input-group label + div {
        width: calc(100% - 160px);
    }

    #app .dialog__content .dialog #board-dialog-popup.card .field-box .input-group .input-group__details {
        width: calc(100% - 160px);
        margin-left: 160px;
    }

    #expDayValidator {
        width: 50%
    }

    #expDayValidator .-tb-validator__error-message.-tb-validator__error-message--bottom {
        margin-left: 0px;
        width: 100%;
    }

</style>

<style scoped>
    #app #board-dialog-popup .useable-field {
        width: 220px;
    }

    .margin-top-10px {
        margin-top: 10px;
    }

    -tb-validator__error-message -tb-validator__error-message--bottom {
        width: 200px;
    }

    #board-dialog-popup .input-group--suffix {
        width: 50px;
    }
</style>

<style>
    #board-dialog-popup .input-group--text-field__suffix {
        position: absolute;
        left: 50px;
        color: rgba(0, 0, 0, 0.87);
        font-size: 13px;
        margin-left: 5px;
    }
</style>
