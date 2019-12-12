<template>
    <div class="isdp-body-content">

        <!--  Title Area -->
        <page-title />

        <!-- Search Area -->
        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <!-- [SEARCH] 1st row,  searchText, type -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" :label="$td('message.user', '사용자')" v-model.trim="searchText"
                                  @keyup.enter="callbackPagination(1)"
                                  maxlength="30"
                                  :placeholder="'\''+$td('message.username', '성명') +'\' '+$td('message.or', '또는')+' \''+ $td('user.id', '아이디') + '\''"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('message.result', '결과')}}</div>
                    <span class="---has-to-be-span---">
                        <v-select :items="conditionStatusValues" v-model="searchStatus" item-value="value" class="narrow-search-select" />
                    </span>
                </div>
            </div>

            <!-- [SEARCH] 2nd row, Event Date -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{ $td('datetime.event', '발생일시') }}</div>
                    <div class="page-searchbox__item-cell--datepicker-comboset__wrapper">
                        <v-menu :close-on-content-click="false"
                                v-model="eventDate.fromDateDisplay"
                                :nudge-right="40"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px">
                            <v-text-field class="search-datepicker"
                                          slot="activator"
                                          v-model.trim="eventDate.fromDateText"
                                          prepend-icon="event"
                                          readonly
                                          @blur="eventDate.fromDateText = parseDate(eventDate.fromDateText)" />
                            <v-date-picker v-model="eventDate.fromDateText" no-title @input="eventDate.fromDateDisplay = false" />
                        </v-menu>
                        <v-menu :close-on-content-click="false"
                                v-model="eventDate.toDateDisplay"
                                :nudge-right="40"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px">
                            <v-text-field class="search-datepicker"
                                          slot="activator"
                                          v-model.trim="eventDate.toDateText"
                                          prepend-icon="event"
                                          readonly
                                          @blur="eventDate.toDateText = parseDate(eventDate.toDateText)" />
                            <v-date-picker v-model="eventDate.toDateText" no-title @input="eventDate.toDateDisplay = false" />
                        </v-menu>
                        <v-btn-toggle v-model="eventDate.dateTerm">
                            <v-btn value="1" @click="changeDate(1)"><span>{{ $td('button.today', '오늘') }}</span></v-btn>
                            <v-btn value="7" @click="changeDate(7)"><span>{{ $td('button.a-week', '1주일') }}</span></v-btn>
                            <v-btn value="30" @click="changeDate(30)"><span>{{ $td('button.a-month', '1개월') }}</span></v-btn>
                        </v-btn-toggle>
                    </div>
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
                <!-- [TABLE] Table information(counter, page size, etc) END -->
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
                            <td class="text-xs-left">{{ props.item.restUrl }}</td>
                            <td class="text-xs-left">{{ props.item.fullName }}({{ props.item.login }})</td>
                            <td class="text-xs-center">{{ props.item.ip }}</td>
                            <td class="text-xs-center" v-if="props.item.resultStatus=='SUCCESS'">{{
                                $td('message.success', '성공') }}
                            </td>
                            <td class="text-xs-center" v-if="props.item.resultStatus=='FAIL'">{{ $td('message.fail',
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
    </div>
</template>

<script>
    import ContentTitle from '@/components/ContentTitle';
    import axios from 'axios';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';

    export default {
        components: {
            ContentTitle,
            CommonPagination,
            CommonPageSizeSelector,
        },
        data() {
            return {
                /* Search Condition */
                searchText: '',
                systemSelected: '',
                eventDate: {
                    fromDateText: '',
                    fromDateDisplay: false,
                    toDateText: '',
                    toDateDisplay: false,
                    dateTerm: -1,
                },
                /*------------------*/

                totalItems: 0,
                items: [],
                loading: true,
                pagination: {rowsPerPage: 15},
                selected: [],
                downloadHeaders: {},
                excelData: [],

                headers: [
                    {
                        text: this.$i18n.td('system.rest-url', 'REST URL'),
                        align: 'center',
                        sortable: false,
                        value: 'restUrl'
                    },
                    {
                        text: this.$i18n.td('message.username', '성명') + '(' + this.$i18n.td('user.id', '아이디') + ')',
                        align: 'center',
                        sortable: false,
                        value: 'login',
                        width: '120px'
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
                        width: '80px'
                    },
                    {
                        text: this.$i18n.td('datetime.event', '발생일시'),
                        align: 'center',
                        sortable: false,
                        value: 'eventDate',
                        width: '140px'
                    }
                ],
                conditionStatusValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: ''},
                    {text: this.$i18n.td('message.success', '성공'), value: 'S'},
                    {text: this.$i18n.td('message.fail', '실패'), value: 'F'}
                ],
            };
        },
        created() {
            this.changeDate(30);
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
        watch: {
            // pagination: function(){
            //   this.searchRestHistoryList()
            // }
        },
        mounted() {
            // this.searchRestHistoryList()
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                // console.log('callbackPageSizeSelector rowsPerPage' + e)
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.searchRestHistoryList();
            },
            callbackPagination: function (e) {
                // console.log('callbackPagination ' + e)
                this.pagination.page = Number(e);
                this.searchRestHistoryList();
            },
            searchRestHistoryList() {
                const url = '/rest/v1/history/rest/list';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchText,
                        resultStatus: this.searchStatus,
                        fromDateText: this.eventDate.fromDateText,
                        toDateText: this.eventDate.toDateText,
                    }
                }).then(res => {
                    // console.log(res.data)
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.selected = [];
                    that.items = content;
                    that.loading = false;

                });
            },
            parseDate(date) {
                if (!date) {
                    return null;
                }
                let dateArray = date.split('-');
                let month = dateArray[1];
                let day = dateArray[2];
                let year = dateArray[0];
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            },
            changeDate(date) {
                let today = new Date();
                let mm = today.getMonth() + 1; // getMonth() is zero-based
                let dd = today.getDate();
                let todayString = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                this.eventDate.toDateText = todayString;

                let yesterDay = new Date();
                let mm2 = yesterDay.getMonth() + 1; // getMonth() is zero-based
                yesterDay.setDate(yesterDay.getDate() - 1);
                let dd2 = yesterDay.getDate();
                let yesterDayString = [yesterDay.getFullYear(), '-', (mm2 > 9 ? '' : '0') + mm2, '-', (dd2 > 9 ? '' : '0') + dd2].join('');

                if (date == 1) {
                    this.eventDate.fromDateText = yesterDayString;
                } else {
                    today = new Date(today.setDate(today.getDate() - date));
                    mm = today.getMonth() + 1; // getMonth() is zero-based
                    dd = today.getDate();
                    this.eventDate.fromDateText = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                }
            },
            setDownloadHeaders() {
                this.downloadHeaders[this.$i18n.td('system.key', '시스템키')] = 'restUrl';
                this.downloadHeaders[this.$i18n.td('message.username', '성명') + '(' + this.$i18n.td('user.id', '아이디') + ')'] = 'fullName';
                this.downloadHeaders[this.$i18n.td('file.ip', 'IP')] = 'ip';
                this.downloadHeaders[this.$i18n.td('message.result', '결과')] = 'resultStatus';
                this.downloadHeaders[this.$i18n.td('datetime.event', '발생일시')] = 'eventDate';
            },
            async getExcelList() {
                const url = '/rest/v1/history/rest/list/filtered';
                this.excelData = await axios.get(url, {
                    params: {
                        searchText: this.searchText,
                        resultStatus: this.searchStatus,
                        fromDateText: '',
                        toDateText: ''
                    }
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.restUrl = this.excelData.data[i].restUrl;
                    row.fullName = this.excelData.data[i].fullName + '(' + this.excelData.data[i].login + ')';
                    row.ip = this.excelData.data[i].ip;
                    if (this.excelData.data[i].resultStatus == 'SUCCESS') {
                        row.resultStatus = this.$i18n.td('message.success', '성공');
                    } else if (this.excelData.data[i].resultStatus == 'FAIL') {
                        row.resultStatus = this.$i18n.td('message.fail', '실패');
                    }
                    row.eventDate = this.$options.filters.moment(this.excelData.data[i].eventDate, this.dateTimePattern());
                    returnData.push(row);
                }
                return returnData;
            },
        }

    };
</script>

<style scoped>
</style>

