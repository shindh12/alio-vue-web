<template>
    <div id="category-page">
        <div>
            <!-- [TITLE] Title area -->
            <page-title />

            <!-- [SEARCH] Search area -->
            <div class="page-searchbox page-searchbox--col2">
                <div class="page-searchbox__row">
                    <!-- [SEARCH] Search items -->
                    <div class="page-searchbox__item-cell">
                        <v-text-field name="searchText" :label="td.menuBoard.category" @keyup.enter="callbackPagination(1)" v-model.trim="searchCondition.searchText"
                                      :placeholder="'\''+td.menuBoard.category+' '+td.message.key + '\' ' + td.message.or + ' \'' + td.menuBoard.category+' '+td.message.name + '\''"
                                      maxlength="50"></v-text-field>
                    </div>
                    <div class="page-searchbox__item-cell">
                        <div class="page-searchbox__item-title">{{td.message.useYn}}</div>
                        <span class="---has-to-be-span---">
              <v-select item-value="value" :items="useYnCombo" v-model="searchCondition.useYn" class="narrow-search-select" />
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
                                :totalCount="categoryListCount" :pagination="pagination"
                                @eventPageSizeSelector="callbackPageSizeSelector" />
                        </div>
                    </div>
                    <!-- [TABLE] Table information(counter, page size, etc) END -->

                    <!-- [TABLE] Table actions -->
                    <div class="table__action" v-if="menuAuth.create || menuAuth.delete">
                        <div class="table__action__default">
                            <v-btn v-if="menuAuth.create" @click="openCategoryCuDialog('ADD')">{{ this.td.button.add }}</v-btn>
                            <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                                <v-btn :disabled="categoryListCount==0">{{this.td.button.download}}</v-btn>
                            </download-excel>
                        </div>
                    </div>
                    <!-- [TABLE] Table actions END -->

                    <!-- [TABLE] 본체 -->
                    <div class="table__body">
                        <v-data-table
                            :headers="headers" :items="categoryList" item-key="categoryId"
                            :total-items="categoryListCount" hide-actions>
                            <template slot="items" slot-scope="props">
                                <td v-clickable @click="gotoDetail(props.item)" class="text-xs-left"> {{ props.item.categoryKey }}</td>
                                <td class="text-xs-left"> {{ props.item.categoryName }}</td>
                                <td class="text-xs-left"> {{ props.item.i18n }}</td>
                                <td class="text-xs-center"> {{ props.item.itemCnt }}</td>
                                <td width="80px" class="text-xs-center">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                                <td class="justify-center layout px-0" v-if="menuAuth.update">
                                    <v-btn icon class="mx-0" @click="openCategoryCuDialog('UPDATE', props.item)" :title="td.button.modify">
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
            <category-cu-dialog
                :showDialog=categoryCuDialog.show
                :mode=categoryCuDialog.mode
                :propsCategory=categoryCuDialog.targetCategory
                @closeDialog=closeCategoryCuDialog()
            />
        </div>

    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';
    import CommonPagination from '@/containers/Common/CommonPagination';
    import CategoryCuDialog from '@/containers/Board/CategoryPopup/CategoryCUDialog';
    import CodeService from '@/util/code/CodeService';

    export default {
        components: {
            axios,
            CommonPagination,
            CommonPageSizeSelector,
            CategoryCuDialog,
        },
        data() {
            return {
                searchCondition: {
                    searchText: '',
                    useYn: '',
                },
                categoryCuDialog: {
                    show: false,
                    mode: '',
                    targetCategory: {},
                },
                downloadHeaders: {},
                excelData: [],

                /* data table */
                categoryList: [],
                categoryListCount: 0,
                pagination: {rowsPerPage: 15, page: 1},
                categoryHeaders: [
                    {
                        text: this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.key', '키'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'categoryKey'
                    },
                    {
                        text: this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.name', '명'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'categoryName'
                    },
                    {text: 'i18N', width: '100px', align: 'center', sortable: false, value: 'i18n',},
                    {
                        text: this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.item', '항목') + ' ' + this.$i18n.td('message.count', '수'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'itemCnt',
                    },
                    {text: this.$i18n.td('message.use-yn', '사용여부'), width: '100px', align: 'center', sortable: false, value: 'useYn',},
                    {text: this.$i18n.td('button.update', '수정'), width: '100px', align: 'center', sortable: false, value: 'modify',}
                ],
                url: {
                    search: '/rest/v1/category/list',
                    excel: '/rest/v1/category',
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
                        key: this.$i18n.td('message.key', '키'),
                        name: this.$i18n.td('message.name', '명'),
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        useY: this.$i18n.td('message.use-y', '사용'),
                        useN: this.$i18n.td('message.use-n', '미사용'),
                        or: this.$i18n.td('message.or', '또는'),
                    },
                    menuBoard: {
                        category: this.$i18n.td('menu-board.category', '카테고리'),
                    },
                },
            };
        },
        computed: {
            pages() {
                if (this.categoryListCount == null || this.pagination.rowsPerPage == null) {
                    return 0;
                } else {
                    return Math.ceil(this.categoryListCount / this.pagination.rowsPerPage);
                }
            },
            headers() {
                return this.categoryHeaders;
            },
        },
        created() {
            if (this.$route.query.searchCondition || this.$route.query.pagination) {
                // 로딩시 sizeselector 및 pagination이 page를 1로 초기화하기 때문에 검색조건 유지를 위해 nextTick 넣음
                this.$nextTick(() => {
                    this.pagination.page = this.$route.query.pagination.page,
                        this.pagination.rowsPerPage = this.$route.query.pagination.rowsPerPage,
                        this.searchCondition = this.$route.query.searchCondition,
                        this.searchCategory();
                });
            }
            this.useYnCombo = CodeService.getCodeDetailList('use-yn', true);
            this.searchCategory();
            this.setDownloadHeaders();
        },
        methods: {
            searchCategory() {
                let url = this.url.search;
                this.loading = true;
                axios.get(url, {
                    params: {
                        page: this.pagination.page - 1,
                        size: this.pagination.rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        systemKey: this.$store.state.loginStore.systemKey,
                        useYn: this.searchCondition.useYn === 'All' ? '' : this.searchCondition.useYn,
                    }
                }).then(res => {
                    this.categoryList = res.data.content;
                    this.categoryListCount = res.data.totalElements;
                    this.loading = false;
                }).catch(() => {
                    this.$notify({
                        title: this.$i18n.td('button.search', '조회'),
                        text: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
            callbackPageSizeSelector(pageSize) {
                this.pagination.rowsPerPage = Number(pageSize);
                this.pagination.page = 1;
                this.searchCategory();
            },
            callbackPagination(pageNo) {
                this.pagination.page = Number(pageNo);
                this.searchCategory();
            },
            gotoDetail(category) {
                this.$router.push({
                    path: '/board/category/detail',
                    query: {
                        categoryId: category.categoryId,
                        searchCondition: this.searchCondition,
                        pagination: this.pagination,
                        categoryKey: category.categoryKey,
                    }
                });
            },
            openCategoryCuDialog(mode, item) {
                this.categoryCuDialog.mode = mode;
                if (mode === 'ADD') { this.categoryCuDialog.target = {}; } else { this.categoryCuDialog.targetCategory = item; }
                this.categoryCuDialog.show = true;
            },
            closeCategoryCuDialog() {
                this.categoryCuDialog.show = false;
                this.searchCategory();
            },
            async getExcelList() {
                let url = this.url.excel;
                this.loading = true;
                this.excelData = await axios.get(url, {
                    params: {
                        searchText: this.searchCondition.searchText,
                        systemKey: this.$store.state.loginStore.systemKey,
                        useYn: this.searchCondition.useYn === 'All' ? '' : this.searchCondition.useYn,
                    }
                }).catch(() => {
                    this.$notify({
                        title: this.$i18n.td('button.search', '조회'),
                        text: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        type: 'error'
                    });
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.categoryKey = this.excelData.data[i].categoryKey;
                    row.categoryName = this.excelData.data[i].categoryName;
                    row.i18n = this.excelData.data[i].i18n;
                    row.itemCnt = this.excelData.data[i].itemCnt;
                    if (this.excelData.data[i].useYn == 'Y') {
                        row.useYn = this.td.message.useY;
                    } else if (this.excelData.data[i].useYn == 'N') {
                        row.useYn = this.td.message.useN;
                    }
                    returnData.push(row);
                }
                return returnData;

                this.loading = true;
            },
            setDownloadHeaders() {
                this.downloadHeaders[this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.key', '키')] = 'categoryKey';
                this.downloadHeaders[this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.name', '명')] = 'categoryName';
                this.downloadHeaders['i18N'] = 'i18n';
                this.downloadHeaders[this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.item', '항목') + ' ' + this.$i18n.td('message.count',
                    '수')] = 'itemCnt';
                this.downloadHeaders[this.$i18n.td('message.use-yn', '사용여부')] = 'useYn';
            },
        },

    };
</script>

<style scoped>
    /*#role-page table.datatable {table-layout:fixed;}*/
</style>
