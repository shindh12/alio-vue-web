<template>
    <div id="usestatus-page">

        <!--  Title Area -->
        <page-title></page-title>

        <!-- Search Area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset">
                    <div class="page-searchbox__item-title">{{ $td('', '조회기간') }}</div>
                    <double-calendar :fromDoubleObj="fromDateSearch" :endDoubleObj="toDateSearch" :term="1"
                                     v-on:update:fromDoubleObj="fromDateSearch.dateText= $event"
                                     v-on:update:endDoubleObj="toDateSearch.dateText= $event">
                    </double-calendar>
                </div>
            </div>
        </div>

        <!-- Search Button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="getDPUsingStatus">{{$td('message.search', '조회')}}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <!-- User Count Area -->
            <div class="table-area">
                <div class="table__body">
                    <table class="custom-table">
                        <thead class="custom-header">
                            <tr class="header-row" style="border-bottom: 1px solid rgba(0,0,0,0.12);">
                                <th>{{$td('', '사용자 현황 (결제/선물 1회 이상)')}}</th>
                                <th>{{$td('', '신규 가입자 현황')}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="text-xs-center" width="50%">{{ parseWithComma(this.userItems.userCnt + '') + '명'}}</td>
                                <td class="text-xs-center" width="50%">{{ parseWithComma(this.userItems.newUserCnt + '') + '명'}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="table-area">
                <div class="table__body">
                    <table class="custom-table">
                        <thead class="custom-header">
                            <tr class="header-row">
                                <th rowspan="2" style="border-bottom: 1px solid rgba(0,0,0,0.12);" width="23%">{{$td('', '포인트발행부서')}}</th>
                                <th colspan="2">{{$td('', '적립')}}</th>
                                <th colspan="2">{{$td('', '결제')}}</th>
                                <th>{{$td('', '잔액')}}</th>
                                <th colspan="2">{{$td('', '선물')}}</th>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(0,0,0,0.12);">
                                <th width="11%">{{$td('', '건수')}}</th>
                                <th width="11%">{{$td('', '금액')}}</th>
                                <th width="11%">{{$td('', '건수')}}</th>
                                <th width="11%">{{$td('', '금액')}}</th>
                                <th width="11%">{{$td('', '금액')}}</th>
                                <th width="11%">{{$td('', '건수')}}</th>
                                <th width="11%">{{$td('', '금액')}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <!-- 포인트 발행부서 -->
                                <td class="text-xs-center">{{this.txItems.target}}</td>
                                <!-- 적립 건수 -->
                                <td class="text-xs-right">{{parseWithComma(this.txItems.saveCnt + '') + '건'}}</td>
                                <!-- 적립 금액 -->
                                <td class="text-xs-right">{{parseWithComma(this.txItems.saveAmount + '') + '원'}}</td>
                                <!-- 결제 건수 -->
                                <td class="text-xs-right" :rowspan=this.rowspanSize style="vertical-align:top;">
                                    {{parseWithComma(this.txItems.payCnt + '') + '건'}}
                                </td>
                                <!-- 결제 금액 -->
                                <td class="text-xs-right" :rowspan=this.rowspanSize style="vertical-align:top;">
                                    {{parseWithComma(this.txItems.payAmount + '') + '원'}}
                                </td>
                                <!-- 잔액 금액 -->
                                <td class="text-xs-right" :rowspan=this.rowspanSize style="vertical-align:top;">
                                    {{parseWithComma(this.txItems.amount + '') + '원'}}
                                </td>
                                <!-- 선물 건수 -->
                                <td class="text-xs-right" :rowspan=this.rowspanSize style="vertical-align:top;">
                                    {{parseWithComma(this.txItems.sendCnt + '') + '건'}}
                                </td>
                                <!-- 선물 금액 -->
                                <td class="text-xs-right" :rowspan=this.rowspanSize style="vertical-align:top;">
                                    {{parseWithComma(this.txItems.sendAmount + '') + '원'}}
                                </td>
                            </tr>
    <!--                        <custom-row/>-->
                            <tr v-for="row in appendRows">
                                <td class="text-xs-center">{{row.target}}</td>
                                <td class="text-xs-right">{{parseWithComma(row.saveCnt) + '건'}}</td>
                                <td class="text-xs-right">{{parseWithComma(row.saveAmount) + '원'}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DoubleCalendar from '@/components/DoubleCalendar';
    import axios from 'axios';

    export default {
        components: {
            DoubleCalendar
        },
        data() {
            return {
                /* DoubleCalendar */
                fromDateSearch: {
                    dateText: '',
                    dateDisplay: false
                },
                toDateSearch: {
                    dateText: '',
                    dateDisplay: false
                },
                // End of Double Calendar
                countHeaders: [
                    {text: this.$i18n.td('', '사용자 현황 (결제/선물 1회 이상)'), align: 'center', sortable: false, value: 'userCnt', width: '50%'},
                    {text: this.$i18n.td('', '신규 가입자 현황'), align: 'center', sortable: false, value: 'newUserCnt', width: '50%'},
                ],
                loading: false,
                items: [],
                userItems: '',
                txItems: '',
                savingItems: [],
                savingDataSize: '',
                rowspanSize: '',
                appendRows: [
                ]
            }
        },
        mounted() {
            this.getDPUsingStatus();
        },
        methods: {
            getDPUsingStatus() {

                this.appendRows = [];

                let userInfoUrl = '/rest/v1/status/user';
                let txInfoUrl = '/rest/v1/status/tx';
                let savingInfoUrl = '/rest/v1/status/saving';

                let fromDate = this.fromDateSearch.dateText;
                let toDate = this.toDateSearch.dateText;

                const userPromise = (fromDate, toDate) => {
                    return axios.get(userInfoUrl, {
                        params: {
                            fromDate, toDate
                        }
                    })
                }

                const txPromise = (fromDate, toDate) => {
                    return axios.get(txInfoUrl, {
                        params: {
                            fromDate, toDate
                        }
                    })
                }

                const savingPromise = (fromDate, toDate) => {
                    return axios.get(savingInfoUrl, {
                        params: {
                            fromDate, toDate
                        }
                    })
                }

                axios.all([userPromise(fromDate, toDate), txPromise(fromDate, toDate), savingPromise(fromDate, toDate)])
                    .then(axios.spread((userRes, txRes, savingRes) => {
                        let userContent = userRes.data;
                        this.userItems = userContent;
                        let txContent = txRes.data;
                        this.txItems = txContent;
                        let savingContent = savingRes.data;
                        this.savingDataSize = savingRes.data.length;

                        // td rowspan size temp
                        this.rowspanSize = this.savingDataSize + 1;
                        this.loading = false;

                        for(let i = 0; i < this.savingDataSize; i++) {
                            let oneSaveObj = {};
                            oneSaveObj.target = savingContent[i].target;
                            oneSaveObj.saveCnt = savingContent[i].saveCnt;
                            oneSaveObj.saveAmount = savingContent[i].saveAmount;

                            this.appendRows.push(oneSaveObj);
                        }
                    })).catch((error) => {
                        console.error(error);
                })
            }
        }
    }
</script>

<style scoped>
#app .table-area { margin-top: 50px; }
.custom-table { width: 100%; font-size: 12px; border-spacing: unset; border-collapse: collapse; border-top: 1px solid #999; border-bottom: 1px solid #999; }
.custom-header { background-color: #F7F7F7; line-height: 2.5rem; }
.text-xs-center, .text-xs-right { line-height: 2.5rem !important; }
</style>