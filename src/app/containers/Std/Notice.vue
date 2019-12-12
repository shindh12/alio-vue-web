<template>
    <div id="user-list-page">
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" :label="$td('', '제목')" v-model.trim="searchCondition.searchText" @keyup.enter="callbackPagination(1)"
                                  maxlength="50"></v-text-field>
                </div>
            </div>

            <!-- [SEARCH] 2nd row, Event Date -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{ $td('', '작성일자') }}</div>
                    <double-calendar :fromDoubleObj="fromDate" :endDoubleObj="endDate" :term="30"
                                     v-on:update:fromDoubleObj="fromDate.dateText= $event"
                                     v-on:update:endDoubleObj="endDate.dateText= $event">
                    </double-calendar>
                </div>
            </div>

        </div>
        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{$td('button.search', '조회')}}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <!-- [TABLE] ㅇㅇ area -->
            <div class="table-area">
                <!-- [TABLE] Table information(counter, page size, etc) -->
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                    <div class="table__info__label"></div>
                </div>
                <!-- [TABLE] Table information(counter, page size, etc) END -->
                <!-- [TABLE] Table actions -->
                <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                    <div class="table__action__default">
                        <v-btn @click.native="openCreateDialog()" v-if="menuAuth.create">{{$td('button.add', '추가')}}</v-btn>
                       <!-- <v-btn @click.native="deleteNotices()" :disabled="selected.length <= 0" v-if="menuAuth.delete">{{$td('button.delete', '삭제')}}</v-btn>-->
                    </div>
                    <div class="table__action__optional"></div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items"  item-key="noticeId" v-model="selected"
                                  :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                         <!--   <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.noticeId"></v-checkbox>
                            </td>-->
                            <td v-clickable @click="openDetailDialog(props.item.noticeId)"> {{ props.item.noticeTitle }}</td>
                            <td class="text-xs-center"> {{ props.item.fullName }}({{props.item.login}})</td>
                            <td class="text-xs-center">{{ props.item.updateDate  | moment(dateTimePattern()) }}</td>
                            <td class="text-xs-center">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td class="text-xs-center" v-if="menuAuth.create || menuAuth.update" :title="modifyTitle">
                                <v-btn icon @click="editItem(props.item)">
                                    <v-icon style="color: #2A96FD;">edit</v-icon>
                                </v-btn>
                            </td>
                        </template>
                    </v-data-table>

                </div>
                <!-- [TABLE] 본체 끝-->
                <!-- [TABLE] Page navi -->
                <div class="table__pager">
                    <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                </div>
                <!-- [TABLE] Page navi END -->
            </div>
        </div>

        <!-- Create Dialog Area -->
        <notice-dialog :showDialog="createDialog" :notice="notice" :mode="mode" @closeDialog="closeCreateDialog" ></notice-dialog>
        <notice-detail-dialog :showDialog="detailDialog" @closeDialog="closeDetailDialog" :notice="noticeDetail" @updateNotice="editItem"></notice-detail-dialog>
    </div>
</template>

<script>
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import DoubleCalendar from '@/components/DoubleCalendar';
    import NoticeDialog from "@/containers/Std/NoticeDialog";
    import NoticeDetailDialog from "@/containers/Std/NoticeDetailDialog";

    export default {
        components: {
            NoticeDialog,
            CommonPagination,
            CommonPageSizeSelector,
            DoubleCalendar,
            NoticeDetailDialog,
        },
        data() {
            return {
                searchCondition: {
                    searchText: '',
                },

                /* DoubleCalendar */
                fromDate: {
                    dateText: '',
                    dateDisplay: false,
                },

                endDate: {
                    dateText: '',
                    dateDisplay: false,
                },
                noticeId :'',

                //Dialog (공지사항 작성창)
                detailDialog: false,
                createDialog: false,

                mode:'',
                notice: {
                    noticeId :'',
                    title :'',
                    content :'',
                    updateUserId :'',
                    updateDate :'',
                    useYn :'',
                    login: '',
                    fullName: '',
                    mode :'',
                },

                noticeDetail: {
                    noticeId: 0,  noticeTitle: '', noticeContents:'',
                    useYn:'', updateUserId :'', login:'',
                    fullName: '', updateDate: '',
                },
                
                totalItems: 0,
                items: [],
                errors: [],
                loading: true,
                confirmDialog: false,
                pagination: {rowsPerPage: 15},
                selected: [],
                modifyTitle: this.$i18n.td('button.update', '수정'),
                headersWithAction: [
                    {text: this.$i18n.td('', '제목') , width: '40%', align: 'center', sortable: false, value: 'noticeTitle'},
                    {text: this.$i18n.td('', '작성자'), width: '10%', align: 'center', sortable: false, value: 'updateUserId'},
                    {text: this.$i18n.td('', '작성일시'), width: '10%', align: 'center', sortable: false, value: 'updateDate'},
                    {text: this.$i18n.td('', '사용여부'), width: '10%', align: 'center', sortable: false, value: 'useYn'},
                    {text: this.$i18n.td('button.update', '수정'), width: '60px', align: 'center', sortable: false, value: '',}
                ],
                headersWithoutAction: [
                    {text: this.$i18n.td('', '제목') , width: '40%', align: 'center', sortable: false, value: 'noticeTitle'},
                    {text: this.$i18n.td('', '작성자'), width: '10%', align: 'center', sortable: false, value: 'updateUserId'},
                    {text: this.$i18n.td('datetime.join', '작성일시'), width: '10%', align: 'center', sortable: false, value: 'updateDate'},
                    {text: this.$i18n.td('', '사용여부'), width: '10%', align: 'center', sortable: false, value: 'useYn'},
                    {text: this.$i18n.td('button.update', '수정'), width: '60px', align: 'center', sortable: false, value: '',}
                ],
                downloadHeaders: {},
                dialog: false,
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        computed: {
            formTitle() {
                return this.editedIndex === -1 ? this.$i18n.td('message.user', '사용자') + ' ' + this.$i18n.td('button.add', '추가') : this.$i18n.td('message.user', '사용자') + ' '
                    + this.$i18n.td('button.update', '수정');
            },
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null
                ) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            },
            headers() {
                return (this.menuAuth.create || this.menuAuth.update) ? this.headersWithAction : this.headersWithoutAction;
            }
        },
        watch: {
            dialog(val) {
                val || this.closeDialog();
            }
        },

        created() {
            this.checkAboutSearchCondition();
            // vuetify의 v-pagination 내부 초기화로직(page 1로 변경) 수행 후 수행되도록  // 로딩시 sizeselector 및 pagination이 page를 1로 초기화하기 때문에 검색조건 유지를 위해 nextTick 넣음
            if (this.$route.query.pagination) {
                this.$nextTick(() => { this.pagination = this.$route.query.pagination; });
            }
            this.downloadHeaders[this.$i18n.td('', '제목') ] = 'noticeTitle';
            this.downloadHeaders[this.$i18n.td('', '작성자')] = 'updateUserId';
            this.downloadHeaders[this.$i18n.td('', '작성일')] = 'updateDate';
        },

        methods: {
            callbackPageSizeSelector(page) {
                this.pagination.rowsPerPage = Number(page);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchNotice();
            },
            callbackPagination(page) {
                this.pagination.page = Number(page);
                this.checkAboutSearchCondition();
                this.searchNotice();
            },
            searchNotice() {
                const url = '/rest/v1/std/notice/list';
                const {page, rowsPerPage} = this.pagination;

                this.$http.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        fromDateText: this.fromDate.dateText,
                        toDateText: this.endDate.dateText,
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.totalItems = res.data.totalElements;
                    this.selected = [];
                    this.items = content;
                    this.loading = false;

                });
            },

            agree() {
                this.confirmDialog = false;
                let noticeList = [];
                for (let i = 0; i < this.selected.length; i++) {
                    noticeList.push(this.selected[i].noticeId);
                }
                this.doDeleteNotice(noticeList);
            },
            disagree() {
                this.confirmDialog = false;
            },
            editItem(item) {
                this.mode='UPDATE';
                this.editedIndex = this.items.indexOf(item);
                this.notice = Object.assign({}, item);
                this.createDialog = true;
            },
            openCreateDialog() {
                this.resetNotice();
                this.mode='CREATE';
                this.createDialog = true;
            },
            closeCreateDialog() {
                this.createDialog = false;
                this.searchNotice();
            },
            resetNotice(){
                this.notice = {useYn: 'N'};
            },

            openDetailDialog(noticeId) {
                this.notice.noticeId = noticeId;
                this.getNoticeDetail(noticeId);
            },
            closeDetailDialog() {
                this.detailDialog = false;
                this.searchNotice();
            },
            getNoticeDetail() {
                const url = '/rest/v1/std/notice/detail/' + this.notice.noticeId;
                let that = this;
                this.$http.get(url).then(res => {
                    that.noticeDetail = res.data;
                    that.originNotice = Object.assign({}, that.noticeDetail);
                    this.detailDialog = true;
                    })
                    .catch(error => {
                    });
            },

            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition || this.$route.query.pagination) {
                    this.searchCondition = this.$route.query.searchCondition;
                    this.pagination = this.$route.query.pagination;
                }
            },
        }
    };
</script>

<style>
    #user-list-page table.datatable {
        table-layout: fixed;
    }
</style>
