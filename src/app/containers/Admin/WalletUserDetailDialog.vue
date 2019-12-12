<template>

    <div class="isdp-body-content" id="detail-dialog-main">
        <v-dialog :value="showDialog" @input="closeDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card id="detail-dialog-popup">
                <v-card-title>
                    <div class="headline"> 사용자 및 월렛 정보 상세
                        <v-btn class="close-icon" icon @click.native="closeDialog">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </div>
                </v-card-title>

                <!-- 상단 유저 정보 영역 -->
                <div class="user-info-area">
                    <div class="table__body">
                        <table class="user-info-table">
                            <tr>
                                <td class="user-detail-info">{{$td('user.full-name', '이름')}} : {{this.selectedUser.userName}}</td>
                                <td class="user-detail-info">{{$td('user.e-mail', 'E-mail')}} : {{this.selectedUser.email}}</td>
                            </tr>
                            <tr>
                                <td class="user-detail-info">{{$td('', '소속')}} : {{this.selectedUser.employeePosition}}
                                                                           / {{this.selectedUser.departmentName}}
                                                                           / {{this.selectedUser.companyName}}
                                </td>
                                <td class="user-detail-info">{{$td('', '사번')}} : {{this.selectedUser.employeeNumber}}</td>
                            </tr>
                            <tr>
                                <td class="user-detail-info">{{$td('', '전화번호')}} : {{$td('', '+82')}}-{{this.selectedUser.phoneTelecomId}}-{{this.selectedUser.phoneMobileCategory}}-{{this.selectedUser.phoneUserSelection}}
                                </td>
                                <td class="user-detail-info">{{$td('datetime.join', '가입일')}} : {{this.selectedUser.createDate}}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="walletUserDetailList" item-key="userId"
                                  :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td class="text-xs-left">{{ props.item.walletCategory }}</td>
                            <td class="text-xs-center">{{ props.item.walletCreateDate | moment(dateTimePattern()) }}</td>
                            <td class="text-xs-center">{{ props.item.walletStatus }}</td>
                            <td class="text-xs-right">{{ parseWithComma(props.item.balance) }}</td>
                        </template>
                    </v-data-table>
                </div>

                <!-- [TABLE] Page navi -->
                <div class="table__pager">
                    <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                </div>
                <v-card-actions>
                    <div class="action-row--mini">
                        <div class="right">
                            <v-btn @click.native="closeDialog">{{$td('button.to-list', '목록')}}</v-btn>
                        </div>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector
        },
        props: {
            showDialog: {
                type: Boolean,
                default: false
            },
            walletuser: {
                type: Object,
                default: {}
            }
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            }
        },
        data() {
            return {
                pagination: {rowsPerPage: 10},
                totalItems: 0,
                items: [],
                loading: true,
                selectedUser: '',
                walletUserDetailList: [],
                headers: [
                    {text: this.$i18n.td('', '월렛구분') , width: '30%', align: 'center', sortable: false, value: 'walletCategory'},
                    {text: this.$i18n.td('', '생성일자') , width: '25%', align: 'center', sortable: false, value: 'walletCreateDate'},
                    {text: this.$i18n.td('', '상태') , width: '20%', align: 'center', sortable: false, value: 'walletStatus'},
                    {text: this.$i18n.td('', '잔여포인트') , width: '25%', align: 'center', sortable: false, value: 'balance'}
                ]
            }
        },
        watch: {
            showDialog(status) {
                if(status === true) {
                    this.findDetailList();
                }
            }
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.findDetailList();
            },
            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.findDetailList();
            },
            closeDialog() {
                this.$emit('closeDialog');
            },
            findDetailList() {
                this.loading = true;
                const {page, rowsPerPage} = this.pagination;
                const url = '/rest/v1/walletusers/list/detail/' + this.walletuser.userId;
                if(this.walletuser.userId.length != 0) {
                    axios.get(url, {
                        params: {
                            page: page - 1,
                            size: rowsPerPage,
                        }
                    }).then(response => {
                        let content = response.data.content;
                        let obj = content[0];
                        this.selectedUser = obj;
                        this.walletUserDetailList = content;
                        this.totalItems = response.data.totalElements;
                    }).catch(e => {
                        console.error(e);
                    });
                }
                this.loading = false;
            }
        }
    }
</script>

<style scoped>
.headline { margin-left: 10px; }
.user-info-area { width: 100%; font-size: 1.0rem; margin-right: 10px; }
.user-info-table { width: 100%; margin-top: 10px; background-color: #EAEAEA; }
.user-detail-info { width: 50%; }
.table__body { margin-left: 10px; margin-right: 10px; }
#app .table__info { margin: 10px 0px 0px 10px; }
#app .dialog__content .dialog .card .card__title .headline { display: flex; justify-content: space-between; line-height: unset !important; }
</style>