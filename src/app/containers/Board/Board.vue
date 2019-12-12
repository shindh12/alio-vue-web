<template>
    <div id="board-page">
        <div>
            <!-- [TITLE] Title area -->
            <page-title />

            <!-- [SEARCH] Search area -->
            <div class="page-searchbox page-searchbox--col2">
                <div class="page-searchbox__row">
                    <!-- [SEARCH] Search items -->
                    <div class="page-searchbox__item-cell">
                        <v-text-field name="searchText" :label="td.menuBoard.board" @keyup.enter="callbackPagination(1)" v-model.trim="searchCondition.searchText"
                                      :placeholder="'\''+td.menuBoard.board+' '+td.message.key + '\' ' + td.message.or + ' \'' + td.menuBoard.board+' '+td.message.name + '\''"
                                      maxlength="50"></v-text-field>
                    </div>
                    <div class="page-searchbox__item-cell">
                        <div class="page-searchbox__item-title">{{this.td.message.useYn}}</div>
                        <span class="---has-to-be-span---">
              <v-select item-value="value" :items="useYnCombo" v-model="searchCondition.boardUseYn" class="narrow-search-select" />
            </span>
                    </div>
                </div>
            </div>

            <!-- [SEARCH] button -->
            <div class="page-searchbox-action">
                <v-btn primary @click.native="callbackPagination(1)">{{ this.td.button.search }}</v-btn>
            </div>

            <!-- [CONTENT] Content area -->
            <div class="page-content">
                <!-- [TABLE] ㅇㅇ area -->
                <div class="table-area">
                    <!-- [TABLE] Table information(counter, page size, etc) -->
                    <div class="table__info">
                        <div class="table__info__counter">
                            <common-page-size-selector
                                :totalCount="boardListCount" :pagination="pagination"
                                @eventPageSizeSelector="callbackPageSizeSelector" />
                        </div>
                    </div>
                    <!-- [TABLE] Table information(counter, page size, etc) END -->

                    <!-- [TABLE] Table actions -->
                    <div class="table__action" v-if="menuAuth.create || menuAuth.delete">
                        <div class="table__action__default">
                            <v-btn v-if="menuAuth.create" @click="openBoardCuDialog('ADD')">{{ this.td.button.add }}</v-btn>
                            <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                                <v-btn :disabled="boardListCount==0">{{this.td.button.download}}</v-btn>
                            </download-excel>
                        </div>
                    </div>
                    <!-- [TABLE] Table actions END -->

                    <!-- [TABLE] 본체 -->
                    <div class="table__body">
                        <v-data-table
                            :headers="headers" :items="boardList" item-key="boardId"
                            :total-items="boardListCount" hide-actions>
                            <template slot="items" slot-scope="props">
                                <td v-clickable @click="gotoDetail(props.item)" class="text-xs-left"> {{ props.item.boardKey }}</td>
                                <td class="text-xs-left"> {{ props.item.boardTitle }}</td>
                                <td class="text-xs-left"> {{ props.item.menuKey }}</td>
                                <td width="80px" class="text-xs-center">{{ props.item.boardUseYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                                <td class="text-xs-center"> {{ props.item.articleCnt }}</td>
                                <td class="justify-center layout px-0" v-if="menuAuth.update">
                                    <v-btn icon slot="activator" class="mx-0" @click="openBoardCuDialog('UPDATE', props.item)" :title="td.button.modify">
                                        <v-icon style="color: #2A96FD;">edit</v-icon>
                                    </v-btn>
                                </td>
                            </template>
                        </v-data-table>
                    </div>
                    <!-- [TABLE] 본체 END-->

                    <!-- [TABLE] Page navi -->
                    <div class="table__pager">
                        <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                    </div>
                    <!-- [TABLE] Page navi END -->
                </div>
            </div>

            <!-- [MODAL] Add, Edit Dialog Area -->
            <board-cu-dialog
                :showDialog=boardCuDialog.show
                :mode=boardCuDialog.mode
                :propsBoard=boardCuDialog.targetBoard
                @closeDialog=closeBoardCuDialog()
            />
        </div>

    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';
    import CommonPagination from '@/containers/Common/CommonPagination';
    import BoardCuDialog from '@/containers/Board/BoardPopup/BoardCUDialog';
    import CodeService from '@/util/code/CodeService';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            BoardCuDialog,
        },
        data() {
            return {
                searchCondition: {
                    searchText: '',
                    boardUseYn: '',
                },
                boardCuDialog: {
                    show: false,
                    mode: '',
                    targetBoard: {},
                },
                downloadHeaders: {},
                excelData: [],

                /* data table */
                boardList: [],
                boardListCount: 0,
                pagination: {rowsPerPage: 15, page: 1},
                cuHeaders: [
                    {text: this.$i18n.td('menu-board.board-key', '게시판 키'), width: '100px', align: 'center', sortable: false, value: 'boardName'},
                    {text: this.$i18n.td('menu-board.board-name', '게시판 명'), width: '100px%', align: 'center', sortable: false, value: 'boardDescription'},
                    {text: this.$i18n.td('menu-menus.menu-key', '메뉴키'), width: '100px%', align: 'center', sortable: false, value: 'menuKey'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), width: '100px', align: 'center', sortable: false, value: 'boardUseYn'},
                    {
                        text: this.$i18n.td('menu-board.article', '게시물') + ' ' + this.$i18n.td('message.count', '수'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'articleCnt'
                    },
                    {text: this.$i18n.td('button.update', '수정'), width: '100px', align: 'center', sortable: false, value: 'modify'}
                ],
                rHeaders: [
                    {text: this.$i18n.td('menu-board.board-key', '게시판 키'), width: '100px', align: 'center', sortable: false, value: 'boardName'},
                    {text: this.$i18n.td('menu-board.board-name', '게시판 명'), width: '100px%', align: 'center', sortable: false, value: 'boardDescription'},
                    {text: this.$i18n.td('menu-menus.menu-key', '메뉴키'), width: '100px%', align: 'center', sortable: false, value: 'menuKey'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), width: '100px', align: 'center', sortable: false, value: 'boardUseYn'},
                    {
                        text: this.$i18n.td('menu-board.article', '게시물') + ' ' + this.$i18n.td('message.count', '수'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'articleCnt'
                    },
                ],
                url: {
                    search: '/rest/v1/board/list',
                    excel: '/rest/v1/board'
                },
                useYnCombo: [],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                },
                td: {
                    button: {
                        search: this.$i18n.td('button.search', '조회'),
                        add: this.$i18n.td('button.add', '추가'),
                        unuseConfirm: this.$i18n.td('button.unuse-confirm', '미사용'),
                        delete: this.$i18n.td('button.delete', '삭제'),
                        download: this.$i18n.td('button.download', '다운로드'),
                        modify: this.$i18n.td('button.update', '수정'),
                    },
                    message: {
                        description: this.$i18n.td('message.description', '설명'),
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        key: this.$i18n.td('message.key', '키'),
                        name: this.$i18n.td('message.name', '명'),
                        count: this.$i18n.td('message.count', '수'),
                        searchFailed: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        useY: this.$i18n.td('message.use-y', '사용'),
                        useN: this.$i18n.td('message.use-n', '미사용'),
                        or: this.$i18n.td('message.or', '또는'),
                    },
                    menuBoard: {
                        board: this.$i18n.td('menu-board.board', '게시판'),
                        boardName: this.$i18n.td('menu-board.board-name', '게시판 명'),
                        boardKey: this.$i18n.td('menu-board.board-key', '게시판 키'),
                        article: this.$i18n.td('menu-board.article', '게시물'),
                    },
                    menuMenu: {
                        menuKey: this.$i18n.td('menu-menus.menu-key', '메뉴키'),
                    }
                },
            };
        },
        computed: {
            pages() {
                if (this.boardListCount == null || this.pagination.rowsPerPage == null) {
                    return 0;
                } else {
                    return Math.ceil(this.boardListCount / this.pagination.rowsPerPage);
                }
            },
            headers() {
                return (this.menuAuth.update ? this.cuHeaders : this.rHeaders);
            },
        },
        created() {
            this.useYnCombo = CodeService.getCodeDetailList('use-yn', true);
            if (this.$route.query.searchCondition || this.$route.query.pagination) {
                this.pagination.page = this.$route.query.pagination.page;
                this.pagination.rowsPerPage = this.$route.query.pagination.rowsPerPage;
                this.searchCondition = this.$route.query.searchCondition;
            }
            this.setDownloadHeaders();
        },
        mounted() {
            this.$nextTick(() => {
                this.searchBoard();
            });
        },
        methods: {
            searchBoard() {
                let url = this.url.search;
                this.loading = true;
                axios.get(url, {
                    params: {
                        page: this.pagination.page - 1,
                        size: this.pagination.rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        systemKey: this.$store.state.loginStore.systemKey,
                        boardUseYn: this.searchCondition.boardUseYn === 'All' ? '' : this.searchCondition.boardUseYn,
                    }
                }).then(res => {
                    this.boardList = res.data.content;
                    this.boardListCount = res.data.totalElements;
                    this.loading = false;
                }).catch(() => {
                    this.$notify({
                        title: this.td.button.search,
                        text: this.td.message.searchFailed,
                        type: 'error'
                    });
                });
            },
            callbackPageSizeSelector(pageSize) {
                this.pagination.rowsPerPage = Number(pageSize);
                this.pagination.page = 1;
                this.searchBoard();
            },
            callbackPagination(pageNo) {
                this.pagination.page = Number(pageNo);
                this.searchBoard();
            },
            gotoDetail(board) {
                this.$router.push({
                    path: '/board/board/detail',
                    query: {
                        boardId: board.boardId,
                        searchCondition: this.searchCondition,
                        pagination: this.pagination,
                    }
                });
            },
            openBoardCuDialog(mode, item) {
                this.boardCuDialog.mode = mode;
                if (mode === 'ADD') { this.boardCuDialog.target = {}; } else { this.boardCuDialog.targetBoard = item; }
                this.boardCuDialog.show = true;
            },
            closeBoardCuDialog() {
                this.boardCuDialog.show = false;
                this.searchBoard();
            },
            async getExcelList() {
                let url = this.url.excel;
                this.loading = true;
                this.excelData = await axios.get(url, {
                    params: {
                        searchText: this.searchCondition.searchText,
                        systemKey: this.$store.state.loginStore.systemKey,
                        boardUseYn: this.searchCondition.boardUseYn === 'All' ? '' : this.searchCondition.boardUseYn,
                    }
                }).catch(() => {
                    this.$notify({
                        title: this.td.button.search,
                        text: this.td.message.searchFailed,
                        type: 'error'
                    });
                });
                console.log('>>>>>>>>', this.excelData);
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.boardKey = this.excelData.data[i].boardKey;
                    row.boardTitle = this.excelData.data[i].boardTitle;
                    row.menuKey = this.excelData.data[i].menuKey;
                    if (this.excelData.data[i].boardUseYn == 'Y') {
                        row.boardUseYn = this.td.message.useY;
                    } else if (this.excelData.data[i].boardUseYn == 'N') {
                        row.boardUseYn = this.td.message.useN;
                    }
                    row.articleCnt = this.excelData.data[i].articleCnt;
                    returnData.push(row);
                }
                return returnData;

                this.loading = true;
            },
            setDownloadHeaders() {
                this.downloadHeaders[this.td.menuBoard.boardKey] = 'boardKey';
                this.downloadHeaders[this.td.menuBoard.boardName] = 'boardTitle';
                this.downloadHeaders[this.td.menuMenu.menuKey] = 'menuKey';
                this.downloadHeaders[this.td.message.useYn] = 'boardUseYn';
                this.downloadHeaders[this.td.menuBoard.article + ' ' + this.td.message.count] = 'articleCnt';
            },
        },

    };
</script>

<style scoped>
    /*#role-page table.datatable {table-layout:fixed;}*/
</style>
