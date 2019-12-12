<template>
    <div>
        <div id="board-detail-page">

            <!--  Title Area -->
            <page-title :sub="td.menuBoard.board + ' ' + td.message.detail"></page-title>
            <!-- Contents Area -->

            <div class="detail-page__contents">
                <tb-validator class="tb-validator-in-table" form v-model="validBoard" ref="form-valid" @click.native="clearValid">
                    <table class="detail-page__contents__table">
                        <colgroup>
                            <col width="160px" />
                            <col width="calc(50% - 160px)" />
                            <col width="150px" />
                            <col width="calc(50% - 160px)" />
                        </colgroup>
                        <tr>
                            <!-- 게시판 키 , Board Key -->
                            <th>{{ td.menuBoard.boardKey }}</th>
                            <td>{{ boardDetail.boardKey }}</td>

                            <!-- 사용여부 , Use Yn -->
                            <th v-if="mode == 'READ'"> {{$td('message.use-yn', '사용여부')}}</th>
                            <td v-if="mode == 'READ'"> {{ boardDetail.boardUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-if="mode == 'UPDATE'" colspan=2 style="width:auto">
                                <v-switch :label="$td('message.use-yn', '사용여부')" v-model="boardDetail.boardUseYn" true-value="Y" false-value="N"></v-switch>
                            </td>
                        </tr>
                        <tr>
                            <!-- 게시판 명 , Board Name -->
                            <th :class="{'required':mode==='UPDATE'}">{{td.menuBoard.boardName}}</th>
                            <td>
                                <div v-show="mode === 'READ'">{{ boardDetail.boardTitle }}</div>
                                <tb-validator v-show="mode === 'UPDATE'" :target="boardDetail.boardTitle" :rules="[rules.required, rules.fullName, rules.nospace]" lazy>
                                    <v-text-field v-show="mode === 'UPDATE'" v-model.trim="boardDetail.boardTitle" maxlength="100" />
                                </tb-validator>
                            </td>

                            <!-- 메뉴 키 , Menu Key -->
                            <th>{{td.menuMenus.menuKey}}</th>
                            <td>
                                <div v-show="mode === 'READ'">{{ boardDetail.menuKey }}</div>
                                <v-text-field v-show="mode === 'UPDATE'" v-model.trim="boardDetail.menuKey" maxlength="100" />
                            </td>
                        </tr>

                        <!-- 게시판 옵션 , Board Option after divider-->
                        <tr>
                            <td colspan="4">
                                <hr />
                            </td>
                        </tr>
                        <tr>
                            <!-- 댓글 사용여부 , Comment Use Yn -->
                            <th v-if="mode === 'READ'"> {{ `${td.menuBoard.comment} ${td.message.useYn}` }}</th>
                            <td v-if="mode === 'READ'"> {{ boardDetail.commentUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-if="mode === 'UPDATE'" colspan=2>
                                <v-switch :disabled="optionDisabled" :label="td.menuBoard.comment + ' ' + td.message.useYn" v-model="boardDetail.commentUseYn" true-value="Y"
                                          false-value="N"></v-switch>
                            </td>

                            <!-- 답글 사용여부 , Reply Use Yn -->
                            <th v-if="mode === 'READ'"> {{ `${td.menuBoard.reply} ${td.message.useYn}` }}</th>
                            <td v-if="mode === 'READ'"> {{ boardDetail.replyUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-if="mode === 'UPDATE'" colspan=2>
                                <v-switch :disabled="optionDisabled" :label="td.menuBoard.reply + ' ' + td.message.useYn" v-model="boardDetail.replyUseYn" true-value="Y"
                                          false-value="N"></v-switch>
                            </td>
                        </tr>

                        <tr>
                            <!-- 카테고리 사용여부 , Category Use Yn -->
                            <th v-if="mode === 'READ'"> {{ `${td.menuBoard.category} ${td.message.useYn}` }}</th>
                            <td v-if="mode === 'READ'"> {{ boardDetail.categoryUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-if="mode === 'UPDATE'" colspan=2>
                                <v-switch :disabled="optionDisabled" :label="td.menuBoard.category + ' ' + td.message.useYn" v-model="boardDetail.categoryUseYn" true-value="Y"
                                          false-value="N"></v-switch>
                            </td>

                            <!-- 카테고리 그룹 , Group of category -->
                            <th v-if="boardDetail.categoryUseYn==='Y'"> {{ `${td.menuBoard.category} ${td.message.group}` }}</th>
                            <td v-if="mode === 'READ' && boardDetail.categoryUseYn==='Y'"> {{ categoryList.find(x => x.value === boardDetail.categoryId).text }}</td>
                            <td v-if="mode === 'UPDATE' && boardDetail.categoryUseYn==='Y'">
                                <v-select :disabled="optionDisabled" :items="categoryList" v-model="boardDetail.categoryId"
                                          item-text="text" item-value="value" class="user-status-select"></v-select>
                            </td>
                        </tr>

                        <tr>
                            <!-- 첨부 사용여부 , Attachment Use Yn -->
                            <th v-if="mode === 'READ'"> {{ `${td.menuBoard.attachment} ${td.message.useYn}` }}</th>
                            <td v-if="mode === 'READ'"> {{ boardDetail.attachmentUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-if="mode === 'UPDATE'" colspan=2>
                                <v-switch :disabled="optionDisabled" :label="td.menuBoard.attachment + ' ' + td.message.useYn" v-model="boardDetail.attachmentUseYn" true-value="Y"
                                          false-value="N"></v-switch>
                            </td>

                            <!-- 첨부 용량 제한 , Limit of attachment size for article -->
                            <th v-if="boardDetail.attachmentUseYn==='Y'"> {{ td.menuBoard.attachmentSizeLimit }}</th>
                            <td v-if="mode === 'READ' && boardDetail.attachmentUseYn==='Y'"> {{ attachmentSizeList.find(x => x.value === boardDetail.attachmentSizeLimit).text }}
                            </td>
                            <td v-if="mode === 'UPDATE'">
                                <v-select :disabled="optionDisabled" v-show="boardDetail.attachmentUseYn==='Y'" :items="attachmentSizeList"
                                          v-model="boardDetail.attachmentSizeLimit"
                                          item-text="text" item-value="value" class="user-status-select"></v-select>
                            </td>
                        </tr>

                        <tr>
                            <!-- 공지사항 사용여부 , Announcement Use Yn -->
                            <th v-if="mode == 'READ'"> {{ `${td.menuBoard.announcement} ${td.message.useYn}` }}</th>
                            <td v-if="mode == 'READ'"> {{ boardDetail.announcementUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-if="mode == 'UPDATE'" colspan=2>
                                <v-switch :disabled="optionDisabled" :label="td.menuBoard.announcement + ' ' + td.message.useYn" v-model="boardDetail.announcementUseYn"
                                          true-value="Y" false-value="N"></v-switch>
                            </td>
                        </tr>

                        <tr>
                            <!-- 게시물 유효기간 사용여부 , Article expiration days Use Yn -->
                            <th v-if="mode == 'READ'"> {{ `${td.menuBoard.expirationDay} ${td.message.useYn}` }}</th>
                            <td v-if="mode == 'READ'"> {{ articleExpirationDayUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-if="mode == 'UPDATE'" colspan=2>
                                <v-switch :disabled="optionDisabled" :label="td.menuBoard.expirationDay + ' ' + td.message.useYn" v-model="articleExpirationDayUseYn" true-value="Y"
                                          false-value="N"></v-switch>
                            </td>

                            <!-- 유효기간, Article expiration days -->
                            <th v-if="articleExpirationDayUseYn==='Y'"> {{ td.menuBoard.expirationDay }}</th>
                            <td v-if="articleExpirationDayUseYn==='Y'">
                                <div v-if="mode === 'READ'">{{articleExpirationDay}}{{td.menuBoard.days}}</div>
                                <tb-validator v-show="mode === 'UPDATE'" :target="articleExpirationDay" :rules="[rules.expDay]" lazy>
                                    <v-text-field :disabled="optionDisabled" maxlength='4' v-if="mode === 'UPDATE'" v-model.trim="articleExpirationDay"
                                                  :suffix="td.menuBoard.days" />
                                </tb-validator>
                            </td>
                        </tr>


                    </table>
                </tb-validator>
            </div>


            <!-- Button Area-->
            <div class="action-row--mini ">
                <div class="left">
                    <v-btn v-show="mode === 'READ'" @click.native="backToList">{{ td.button.toList}}</v-btn>
                </div>
                <div class="right">
                    <v-btn primary v-show="mode === 'READ'" @click.native="changeMode('UPDATE')" v-if="menuAuth.update">
                        {{ td.button.update }}
                    </v-btn>
                    <v-btn v-show="mode === 'UPDATE'" @click.native="cancelUpdating">{{ td.button.cancel }}</v-btn>
                    <v-btn primary v-show="mode === 'UPDATE'" @click.native="updateBoard" v-if="menuAuth.update">
                        {{ td.button.save }}
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import CodeService from '@/util/code/CodeService';

    export default {
        data() {
            return {
                mode: 'READ',
                boardId: -1,
                boardDetail: {},
                validBoard: false,
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    fullName: v => /^[0-9a-zA-Z가-힣 ]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                    expDay: v => /^[0-9]{1,4}$/.test(v) || this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                },
                menuAuth: {
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                },
                url: {
                    searchBoardDetail: 'rest/v1/board/boardid/{boardId}',
                    update: 'rest/v1/board/update',
                    category: 'rest/v1/category'
                },
                categoryList: [],
                attachmentSizeList: [],
                articleExpirationDay: '',
                defaultArticleExpirationDay: '',
                articleExpirationDayUseYn: '',

                td: {
                    message: {
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        description: this.$i18n.td('message.description', '설명'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        name: this.$i18n.td('message.name', '명'),
                        detail: this.$i18n.td('message.detail', '상세'),
                        group: this.$i18n.td('message.group', '그룹'),
                    },
                    button: {
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장'),
                        add: this.$i18n.td('button.add', '추가'),
                        update: this.$i18n.td('button.update', '수정'),
                        toList: this.$i18n.td('button.to-list', '목록'),
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
                        attachmentSizeLimit: this.$i18n.td('menu-board.attachment-size-limit', '첨부 용량 제한'),
                        days: this.$i18n.td('menu-board.days', '일'),

                    }
                }
            };
        },
        computed: {
            optionDisabled() {
                return this.boardDetail.boardUseYn === 'N';
            }
        },
        watch: {
            articleExpirationDayUseYn(value) {
                if (value === 'Y') {
                    this.articleExpirationDay = this.defaultArticleExpirationDay;
                } else {
                    this.articleExpirationDay = '-1';
                }
            }
        },
        created() {
            this.attachmentSizeList = CodeService.getCodeDetailList('file-upload-size-limit');
            this.boardId = this.$route.query.boardId;
            this.searchBoardDetail(this.boardId);
            this.getCategoryjList();
        },
        methods: {
            searchBoardDetail(boardId) {
                let url = this.url.searchBoardDetail;
                url = url.replace('{boardId}', boardId);

                axios.get(url)
                .then(res => {
                    const DEFAULT_EXP_DAY = '14';
                    this.boardDetail = res.data;
                    this.articleExpirationDay = this.boardDetail.articleExpirationDay;
                    this.articleExpirationDayUseYn = this.boardDetail.articleExpirationDayUseYn;
                    if (this.articleExpirationDay >= 0) {
                        this.defaultArticleExpirationDay = this.articleExpirationDay;
                    } else {
                        this.defaultArticleExpirationDay = DEFAULT_EXP_DAY;
                    }
                })
                .catch(() => {
                    this.$notify({
                        title: this.$i18n.td('button.search', '조회'),
                        text: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
            changeMode(mode) {
                this.mode = mode;
            },
            cancelUpdating() {
                this.searchBoardDetail(this.boardId);
                this.changeMode('READ');
            },
            backToList() {
                this.$router.push({
                    path: '/board/board',
                    query: this.$route.query
                });
            },
            updateBoard() {
                /* check validation */
                if (this.validateData() === false) { return; }

                let url = this.url.update;
                this.boardDetail.articleExpirationDayUseYn = this.articleExpirationDayUseYn;
                this.boardDetail.articleExpirationDay = this.articleExpirationDay;
                axios.post(url, this.boardDetail)
                .then(() => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.mode = 'READ';
                })
                .catch(error => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
            getCategoryjList() {
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

<style scoped>
    .action-row--mini {
        margin-top: 20px;
    }

    #app .page-content {
        height: calc(100% - 230px);
    }

    #board-detail-page .input-group--suffix {
        width: 50px;
    }
</style>

<style lang="scss">
    @import "styles/mixins.scss";

    #app #board-detail-page .detail-page__contents__table .input-group--selection-controls {
        @include override-vuetify;
        @include labeled-textfield(120px);
    }

    #board-detail-page .input-group__input .input-group--selection-controls__container {
        margin-left: 40px;
    }
</style>
<style>
    #board-detail-page .input-group--text-field__suffix {
        position: absolute;
        left: 50px;
        color: rgba(0, 0, 0, 0.87);
        font-size: 13px;
        margin-left: 5px;
    }
</style>

