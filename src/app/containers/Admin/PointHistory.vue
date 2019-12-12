<template>
    <div id="point-history-page">

        <!--  Title Area -->
        <page-title></page-title>

        <!-- Search Area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" :label="$td('', '이름')" v-model.trim="searchText" @keyup.enter="callbackPagination(1)" maxlength="30">
                    </v-text-field>
                </div>
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset">
                    <div class="page-searchbox__item-title">{{ $td('', '사용일시') }}</div>
                    <double-calendar :fromDoubleObj="fromDate" :endDoubleObj="toDate" :term="initCalendarInterval"
                                     v-on:update:fromDoubleObj="fromDate.dateText= $event"
                                     v-on:update:endDoubleObj="toDate.dateText= $event"
                                     ref="calendar">
                    </double-calendar>
                </div>
            </div>
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('message.category', '구분')}}</div>
                    <span class="---has-to-be-span---">
                        <v-select :items="categoryValues" v-model="searchCondition.transactionCategory" item-value="value" />
                    </span>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('message.status', '상태')}}</div>
                    <span class="---has-to-be-span---">
                        <v-select :items="statusValues" v-model="searchCondition.status" item-value="value" class="narrow-search-select" />
                    </span>
                </div>
            </div>
        </div>

        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn @click.native="clearData()">{{$td('message.initialize', '초기화')}}</v-btn>
            <v-btn primary @click.native="callbackPagination(1)">{{$td('message.search', '조회')}}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <div class="table-area">
                <!-- [TABLE] Table information(counter, page size, etc) -->
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>

                <!-- [TABLE] Table actions -->
                <div class="table__action">
                    <div class="table__action__default">
                        <download-excel style="display:inline-block;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                    </div>
                </div>

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="id"
                                  v-model="selected" :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td class="text-xs-center" hidden="true">{{ props.item.txId }}</td>
                            <td class="text-xs-center">{{ props.item.updateDate | moment(dateTimePattern()) }}</td>
                            <td class="text-xs-left">{{ props.item.userName }}</td>
                            <td class="text-xs-center">{{ props.item.employeeNumber }}</td>
                            <td class="text-xs-center">{{ getCodeValue('TX-CATEGORY',props.item.transactionCategory)}}</td>
                            <td class="text-xs-center" v-if="props.item.status!='COMPLETED'">{{ $td('', '비정상') }}</td>
                            <td class="text-xs-center" v-if="props.item.status=='COMPLETED'">{{ $td('', '정상') }}</td>
                            <td class="text-xs-left">{{ props.item.target}}</td>
                            <td class="text-xs-right">{{parseWithComma(props.item.amount)}}</td>
                        </template>
                    </v-data-table>
                </div>

                <!-- [TABLE] Page navi -->
                <div class="table__pager">
                    <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import DoubleCalendar from '@/components/DoubleCalendar';
    import CodeService from '@/util/code/CodeService';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            DoubleCalendar
        },
        data() {
            return {
                searchText: '',
                searchCondition: {
                    transactionCategory: '',
                    status: '',
                },
                /* DoubleCalendar */
                fromDate: {
                    dateText: '',
                    dateDisplay: false,
                },
                toDate: {
                    dateText: '',
                    dateDisplay: false,
                },
                // End of Double Calendar

                updateDate: {
                    fromDateText: '',
                    fromDateDisplay: false,
                    toDateText: '',
                    toDateDisplay: false,
                    dateTerm: -1,
                },
                initCalendarInterval: 30,
                pagination: {rowsPerPage: 15},
                totalItems: 0,
                items: [],
                loading: true,
                downloadHeaders: {},
                excelData: {},
                selected: [],
                categorySelected: '',
                statusSelected: '',
                categoryValues: [],
                statusValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: ''},
                    {text: this.$i18n.td('', '비정상'), value: 'EXCEPTION'},
                    {text: this.$i18n.td('', '정상'), value: 'COMPLETED'},
                ],
                headers: [
                    {text: this.$i18n.td('', '사용일시'), align: 'center', sortable: false, value: 'updateDate', width: '240px'},
                    {text: this.$i18n.td('user.name', '이름'), align: 'center', sortable: false, value: 'userName', width: '140px'},
                    {text: this.$i18n.td('employee.number', '사번'), align: 'center', sortable: false, value: 'employeeNumber', width: '140px'},
                    {text: this.$i18n.td('message.category', '구분'), align: 'center', sortable: false, value: 'category', width: '140px'},
                    {text: this.$i18n.td('message.status', '상태'), align: 'center', sortable: false, value: 'searchStatus', width: '140px'},
                    {text: this.$i18n.td('target', '거래 내역'), align: 'center', sortable: false, value: 'target'},
                    {text: this.$i18n.td('amount', '금액(원)'), align: 'center', sortable: false, value: 'amount', width: '180px'}
                ]
            };
        },
        created() {
            this.setDownloadHeaders();
            this.categoryValues = CodeService.getCodeDetailList('TX-CATEGORY', true);
            // this.statusValues = CodeService.getCodeDetailList('STATUS', true);
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            }
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.searchPointHistoryList();
            },
            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.searchPointHistoryList();
            },
            searchPointHistoryList() {
                const url = '/rest/v1/points/history/list';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        transactionCategory: this.searchCondition.transactionCategory,
                        searchText: this.searchText,
                        status: this.searchCondition.status,
                        fromDateText: this.fromDate.dateText,
                        toDateText: this.toDate.dateText
                    }
                }).then(res => {
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.selected = [];
                    that.items = content;
                    that.loading = false;
                });
            },
            setDownloadHeaders() {
                this.downloadHeaders[this.$i18n.td('tx.id', 'TX_ID')] = 'txId';
                this.downloadHeaders[this.$i18n.td('', '사용일시')] = 'updateDate';
                this.downloadHeaders[this.$i18n.td('user.name', '이름')] = 'userName';
                this.downloadHeaders[this.$i18n.td('employee.number', '사번')] = 'employeeNumber';
                this.downloadHeaders[this.$i18n.td('transaction.category', '구분')] = 'transactionCategory';
                this.downloadHeaders[this.$i18n.td('status', '상태')] = 'status';
                this.downloadHeaders[this.$i18n.td('target', '거래 내역')] = 'target';
                this.downloadHeaders[this.$i18n.td('amount', '금액(원)')] = 'amount';
            },
            async getExcelList() {
                const url = '/rest/v1/points/history/list/filtered';
                this.excelData = await axios.get(url, {
                    params: {
                        searchText: this.searchText,
                        transactionCategory: this.searchCondition.transactionCategory,
                        status: this.searchCondition.status,
                        fromDateText: this.fromDate.dateText,
                        toDateText: this.toDate.dateText
                    }
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.txId = this.excelData.data[i].txId;
                    row.updateDate = this.$options.filters.moment(this.excelData.data[i].updateDate, this.dateTimePattern());
                    row.userName = this.excelData.data[i].userName;
                    row.employeeNumber = this.excelData.data[i].employeeNumber;
                    row.transactionCategory = this.getCodeValue('TX-CATEGORY', this.excelData.data[i].transactionCategory);
                    if (this.excelData.data[i].status == 'COMPLETED') {
                        row.status = this.$i18n.td('', '정상');
                    } else {
                        row.status = this.$i18n.td('', '비정상');
                    }
                    row.target = this.excelData.data[i].target;
                    row.amount = this.excelData.data[i].amount;
                    returnData.push(row);
                }
                return returnData;
            },
            clearData() {
                this.searchText = '';
                this.searchCondition.transactionCategory = '';
                this.searchCondition.status = '';
                this.$refs.calendar.changeDate(this.initCalendarInterval);
            }
        }
    };
</script>

<style scoped>
</style>
