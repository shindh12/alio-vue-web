<template>
    <div id="help">
        <page-title />

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!--Search Item 1st : title-->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" v-model.trim="searchCondition.searchText" @keyup.enter="callbackPagination(1)" :label="$td('','제목')"
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
            <v-btn primary @click.native="callbackPagination(1)">{{$td('button.search','조회')}}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
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
                        <v-btn @click.native="openCreateDialog()" v-if="menuAuth.create">{{$td('button.add','추가')}}</v-btn>
                    </div>
                    <div class="table__action__optional"></div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="helpId" :pagination.sync="pagination" :loading="loading" :total-items="totalItems"
                                  hide-actions>
                        <template slot="items" slot-scope="props">
                            <td v-clickable @click="openDetailDialog(props.item.helpId)">{{ props.item.helpTitle }}</td>
                            <td class="text-xs-center">{{ props.item.fullName}}({{props.item.login}})</td>
                            <td class="text-xs-center"> {{ props.item.updateDate | moment(dateTimePattern()) }}</td>
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

        <!-- Dialog Area -->
        <help-dialog :showDialog="createDialog" :help="help" :mode="mode" @closeDialog="closeCreateDialog"></help-dialog>
        <help-detail-dialog :showDialog="detailDialog" @closeDialog="closeDetailDialog" :help="helpDetail" @updateHelp="editItem"></help-detail-dialog>
    </div>
</template>

<script>
    import DoubleCalendar from '@/components/DoubleCalendar';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import CommonPagination from '../Common/CommonPagination';
    import HelpDetailDialog from '@/containers/Std/HelpDetailDialog';
    import HelpDialog from '@/containers/Std/HelpDialog';

    export default {
        components: {DoubleCalendar, CommonPagination, CommonPageSizeSelector, HelpDetailDialog, HelpDialog},
        data() {
            return {
                searchCondition: {
                    searchText: ''
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
                totalItems: 0,
                items: [],
                loading: true,
                pagination: {rowsPerPage: 15},
                helpId: '',
                mode: '',
                help: {
                    helpId: '',
                    helpTitle: '',
                    helpContents: '',
                    updateUserId: '',
                    updateDate: '',
                    login: '',
                    fullName: '',
                    mode: '',
                    useYn: ''
                },
                helpDetail: {
                    helpId: 0,
                    helpTitle: '',
                    helpContents: '',
                    updateUserId: '',
                    login: '',
                    fullName: '',
                    updateDate: '',
                    useYn: ''
                },

                detailDialog: false,
                createDialog: false,

                modifyTitle: this.$i18n.td('button.update', '수정'),
                headersWithAction: [
                    {text: this.$i18n.td('', '제목'), width: '50%', align: 'center', sortable: false, value: 'helpTitle'},
                    {text: this.$i18n.td('', '작성자'), width: '20%', align: 'center', sortable: false, value: 'updateUserId'},
                    {text: this.$i18n.td('', '작성일시'), width: '15%', align: 'center', sortable: false, value: 'updateDate'},
                    {text: this.$i18n.td('', '사용여부'), width: '10%', align: 'center', sortable: false, value: 'useYn'},
                    {text: this.$i18n.td('button.update', '수정'), width: '5%', align: 'center', sortable: false, value: ''}
                ],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                }

            }
                ;
        },
        computed: {
            formTitle() {
                return this.editedIndex === -1 ? this.$i18n.td('message.user', '사용자') + ' ' + this.$i18n.td('button.add', '추가') : this.$i18n.td('message.user', '사용자') + ' '
                    + this.$i18n.td('button.update', '수정');
            },
            headers() {
                return this.headersWithAction;
            },
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null
                ) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            }
        },
        watch: {
            dialog(val) {
                val || this.closeDialog();
            }
        },
        created() {
            this.checkAboutSearchCondition();
            // vuetify의 v-pagination 내부 초기화로직(page 1로 변경) 수행 후 수행되도록
            if (this.$route.query.pagination) {
                this.$nextTick(() => { this.pagination = this.$route.query.pagination; });
            }
        },
        methods: {

            callbackPagination(page) {
                this.pagination.page = Number(page);
                this.checkAboutSearchCondition();
                this.searchHelp();
            },
            callbackPageSizeSelector(page) {
                this.pagination.rowsPerPage = Number(page);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchHelp();
            },

            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition || this.$route.query.pagination) {
                    this.searchCondition = this.$route.query.searchCondition;
                    this.pagination = this.$route.query.pagination;
                }
            },
            searchHelp() {
                const url = '/rest/v1/std/help/list';
                const {page, rowsPerPage} = this.pagination;
                this.$http.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        fromDateText: this.fromDate.dateText,
                        endDateText: this.endDate.dateText
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.totalItems = res.data.totalElements;
                    this.items = content;
                    this.loading = false;
                });
            },
            openCreateDialog() {
                this.resetHelp();
                this.mode = 'CREATE';
                this.createDialog = true;
            },
            closeCreateDialog() {
                this.createDialog = false;
                this.searchHelp();
            },
            resetHelp() {
                this.help = {helpTitle: '', helpContents: '', useYn: 'N'};
            },
            openDetailDialog(helpId) {
                this.help.helpId = helpId;
                this.getHelpDetail(helpId);
            },
            closeDetailDialog() {
                this.detailDialog = false;
                this.searchHelp();
            },
            getHelpDetail() {
                const url = '/rest/v1/std/help/detail/' + this.help.helpId;
                let that = this;
                this.$http.get(url).then(res => {
                    that.helpDetail = res.data;
                    that.originHelp = Object.assign({}, that.helpDetail);
                    this.detailDialog = true;
                })
                .catch(error => {
                });
            },
            editItem(item) {
                this.mode = 'UPDATE';
                this.editedIndex = this.items.indexOf(item);
                this.help = Object.assign({}, item);
                this.createDialog = true;
            }

        }
    };
</script>

<style scoped>
    #user-list-page table.datatable {
        table-layout: fixed;
    }
</style>
