<template>
    <div class="isdp-body-content">

        <!--  Title Area -->
        <page-title />

        <!-- Search Area -->
        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col4">
            <!-- [SEARCH] 1st row,  searchText, type -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--colspan2">
                    <v-text-field name="searchText" :label="$td('', 'URL')" v-model.trim="searchText"
                                  @keyup.enter="callbackPagination(1)"
                                  maxlength="100"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell page-searchbox__item-cell--colspan2">
                    <v-text-field name="searchIp" :label="$td('', 'IP')" v-model.trim="searchIp"
                                  @keyup.enter="callbackPagination(1)"
                                  maxlength="20"></v-text-field>
                </div>
            </div>

            <!-- [SEARCH] 2nd row, Event Date -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{ $td('datetime.event', '발생일시') }}</div>
                    <double-calendar :fromDoubleObj="fromDate" :endDoubleObj="endDate" :term="1"
                                     v-on:update:fromDoubleObj="fromDate.dateText= $event"
                                     v-on:update:endDoubleObj="endDate.dateText= $event">
                    </double-calendar>
                </div>
                <div class="page-searchbox__item-cell">
                    <v-select name="resultStatus" :label="this.$i18n.td('message.result', '결과')" v-model.trim="resultStatus"
                              :items="conditionStatusValues" maxlength="20"></v-select>
                </div>
            </div>
        </div>

        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{$td('message.search', '조회')}}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <!-- [TABLE] ㅇㅇ area -->
            <div class="table-area">
                <!-- [TABLE] Table information(counter, page size, etc) -->
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination"
                                                   @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>
                <!-- [TABLE] Table actions -->
                <div class="table__action">
                    <div class="table__action__default">
                        <download-excel style="display:inline-block;" :fetch="getExcelList" name="export.xls"
                                        :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                    </div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="id"
                                  v-model="selected" :pagination.sync="pagination" :loading="loading"
                                  :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td v-clickable v-if="props.item.resultStatus=='FAIL'" @click="openDialog(props.item.description)">{{ props.item.restUrl }}</td>
                            <td class="text-xs-left" v-if="props.item.resultStatus=='S' || props.item.resultStatus=='SUCCESS'">{{props.item.restUrl }}</td>
                            <td class="text-xs-center">{{ props.item.login }}</td>
                            <td class="text-xs-center">{{ props.item.ip }}</td>
                            <td class="text-xs-center" v-if="props.item.resultStatus=='S' || props.item.resultStatus=='SUCCESS'">{{
                                $td('message.success', '성공') }}
                            </td>
                            <td class="text-xs-center" v-if="props.item.resultStatus=='F' || props.item.resultStatus=='FAIL'">{{ $td('message.fail',
                                '실패') }}
                            </td>
                            <td class="text-xs-center">{{ props.item.eventDate | moment(dateTimePattern())}}</td>
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

        <api-history-detail-popup :apiHistoryDetail="dialog" :description="this.description" @closeDialog="closeDialog" />
    </div>
</template>

<script>
    import ContentTitle from '@/components/ContentTitle';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import DoubleCalendar from '@/components/DoubleCalendar';
    import ApiHistoryDetailPopup from '@/containers/Api/Popup/ApiHistoryDetailPopup';

    export default {
        components: {
            ContentTitle,
            CommonPagination,
            CommonPageSizeSelector,
            DoubleCalendar,
            ApiHistoryDetailPopup
        },
        data() {
            return {
                /* Search Condition */
                searchText: '',
                searchIp: '',

                /* DoubleCalendar */
                fromDate: {
                    dateText: '',
                    dateDisplay: false,
                },

                endDate: {
                    dateText: '',
                    dateDisplay: false,
                },
                /*------------------*/

                totalItems: 0,
                items: [],
                loading: true,
                pagination: {rowsPerPage: 15},
                selected: [],
                downloadHeaders: {},
                excelData: [],
                resultStatus: '',
                dialog: false,
                description: '',
                headers: [
                    {
                        text: this.$i18n.td('system.rest-url', 'REST URL'),
                        align: 'center',
                        sortable: false,
                        value: 'restUrl',
                        width: '55%'
                    },
                    {
                        text: this.$i18n.td('', 'Client IP'),
                        align: 'center',
                        sortable: false,
                        value: 'login',
                        width: '180px'
                    },
                    {
                        text: this.$i18n.td('file.ip', 'IP'),
                        align: 'center',
                        sortable: false,
                        value: 'ip',
                        width: '180px'
                    },
                    {
                        text: this.$i18n.td('message.result', '결과'),
                        align: 'center',
                        sortable: false,
                        value: 'resultStatus',
                        width: '100px'
                    },
                    {
                        text: this.$i18n.td('datetime.event', '발생일시'),
                        align: 'center',
                        sortable: false,
                        value: 'eventDate',
                        width: '160px'
                    }
                ],
                conditionStatusValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: ''},
                    {text: this.$i18n.td('message.success', '성공'), value: 'SUCCESS'},
                    {text: this.$i18n.td('message.fail', '실패'), value: 'FAIL'}
                ],
            };
        },
        watch: {
            dialog(val) {
                val || this.closeDialog();
            },

        },
        created() {
            this.setDownloadHeaders();
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null
                ) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            }
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.searchRestHistoryList();
            },
            callbackPagination: function (e) {
                console.log('callbackPagination ' + e);
                this.pagination.page = Number(e);
                this.searchRestHistoryList();
            },
            searchRestHistoryList() {
                const url = '/rest/v1/restapi/history/list';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                this.$http.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchText,
                        searchIp: this.searchIp,
                        resultStatus: this.resultStatus,
                        fromDateText: this.fromDate.dateText,
                        toDateText: this.endDate.dateText,
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
                this.downloadHeaders[this.$i18n.td('system.rest-url', 'REST URL')] = 'restUrl';
                this.downloadHeaders[this.$i18n.td('', 'Client IP')] = 'login';
                this.downloadHeaders[this.$i18n.td('file.ip', 'IP')] = 'ip';
                this.downloadHeaders[this.$i18n.td('file.resultStatus', '결과')] = 'resultStatus';
                this.downloadHeaders[this.$i18n.td('datetime.event', '발생일시')] = 'eventDate';
            },
            async getExcelList() {
                const url = '/rest/v1/restapi/history/list/filtered';
                this.excelData = await this.$http.get(url, {
                    params: {
                        searchText: this.searchText,
                        searchIp: this.searchIp,
                        resultStatus: this.resultStatus,
                        fromDateText: this.fromDate.dateText,
                        toDateText: this.endDate.dateText
                    }
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.restUrl = this.excelData.data[i].restUrl;
                    row.login = this.excelData.data[i].login;
                    row.ip = this.excelData.data[i].ip;
                    if (this.excelData.data[i].resultStatus == 'SUCCESS' || this.excelData.data[i].resultStatus == 'S') {
                        row.resultStatus = this.$i18n.td('message.success', '성공');
                    } else if (this.excelData.data[i].resultStatus == 'FAIL' || this.excelData.data[i].resultStatus == 'F') {
                        row.resultStatus = this.$i18n.td('message.fail', '실패');
                    }
                    row.eventDate = this.$options.filters.moment(this.excelData.data[i].eventDate, this.dateTimePattern());
                    returnData.push(row);
                }
                return returnData;
            },
            openDialog(description) {
                this.description = description;
                this.dialog = true;
            },
            closeDialog() {
                this.dialog = false;
            },
        }

    };
</script>

<style scoped>
</style>

