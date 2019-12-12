<template>
    <div id="walletuser-page">

        <!--  Title Area -->
        <page-title></page-title>

        <!-- Search Area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" :label="$td('', '이름')" v-model.trim="searchText" @keyup.enter="callbackPagination(1)" maxlength="30">
                    </v-text-field>
                </div>
            </div>
        </div>

        <!-- Search Button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{$td('message.search', '조회')}}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <div class="table-area">
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="userId"
                                  :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td v-clickable @click="onClickUserId(props.item)">{{ props.item.userName }}</td>
                            <td class="text-xs-left">{{ props.item.email }}</td>
                            <td class="text-xs-center">{{ props.item.employeeNumber }}</td>
                            <td class="text-xs-center">{{ props.item.createDate | moment(dateTimePattern()) }}</td>
                        </template>
                    </v-data-table>
                </div>

                <!-- [TABLE] Page navi -->
                <div class="table__pager">
                    <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                </div>
            </div>
        </div>

        <!-- [DIALOG] Dialog Area -->
        <wallet-user-detail-dialog :showDialog="walletUserDetailDialog" @closeDialog="closeDetailDialog" :walletuser="walletUserDetail" />
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import WalletUserDetailDialog from '@/containers/Admin/WalletUserDetailDialog';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            WalletUserDetailDialog
        },
        data() {
            return {
                pagination: {rowsPerPage: 15},
                totalItems: 0,
                searchText: '',
                items: [],
                loading: true,
                userId: '',
                walletUserDetail: {
                    userId:'',
                    userName: '',
                    email: '',
                    employeeNumber: '',
                    employeePosition: '',
                    departmentName: '',
                    companyName: '',
                    createDate: '',
                    phoneTelecomId: '',
                    phoneMobileCategory: '',
                    phoneUserSelection: '',
                    walletId: '',
                    walletCategory: '',
                    walletCreateDate: '',
                    walletStatus: '',
                    balance: ''
                },

                // 상세 Dialog
                walletUserDetailDialog: false,

                headers: [
                    {text: this.$i18n.td('', '이름'), align: 'center', sortable: false, value: 'userName', width: '180px'},
                    {text: this.$i18n.td('message.email', 'E-mail'), align: 'center', sortable: false, value: 'email', width: '500px'},
                    {text: this.$i18n.td('employee.number', '사번'), align: 'center', sortable: false, value: 'employeeNumber', width: '120px'},
                    {text: this.$i18n.td('create.date', '가입일'), align: 'center', sortable: false, value: 'createDate', width: '300px'}
                ]
            }
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.searchWalletUserList();
            },
            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.searchWalletUserList();
            },
            searchWalletUserList() {
                const url = '/rest/v1/walletusers/list';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchText
                    }
                }).then(res => {
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.items = content;
                    that.loading = false;
                });
            },
            onClickUserId(item) {
                this.walletUserDetail.userId = item.userId;
                this.walletUserDetailDialog = true;
            },
            closeDetailDialog() {
                this.walletUserDetailDialog = false;
            },
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            }
        }
    }
</script>

<style scoped>
</style>