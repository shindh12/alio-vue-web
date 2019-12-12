<template>
    <div>
        <v-dialog :value="userListDialog" @input="closeDialog" max-width="800px">
            <v-card>
                <!-- Title Area -->
                <v-card-title>
                    <span class="headline">{{ $td('menu.menu-user', 'USER') }}</span>
                </v-card-title>
                <v-divider></v-divider>
                <!-- Search Area -->
                <v-card-actions color="grey lighten-4">
                    <v-layout row justify-space-between>
                        <v-flex class="ml-4" xs12 sm12 md12 lg12>
                            <v-text-field label="Search" v-model.trim="searchText" @keyup.enter="searchUser" maxlength="30"></v-text-field>
                        </v-flex>
                        <v-flex class="mt-2 pt-1" offset-xs1 xs3 offset-sm1 sm3 offset-md1 md3 offset-lg1 lg3>
                            <v-btn color="primary" slot="activator" @click.native="searchUser">{{ $td('button.search', 'Search') }}</v-btn>
                        </v-flex>
                    </v-layout>
                </v-card-actions>

                <!-- Grid Area -->
                <v-card-text>
                    <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    <v-data-table
                        :headers="headers"
                        :items="users"
                        expand
                        item-key="userId"
                        v-model="selected"

                        :pagination.sync="pagination"
                        :total-items="totalItems"
                        hide-actions
                        select-all
                        l>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.userId"></v-checkbox>
                            </td>
                            <!-- Login        -->
                            <td class="text-xs-center">{{ props.item.login }}</td>
                            <!-- Full Name        -->
                            <td class="text-xs-center">{{ props.item.fullName }}</td>
                            <!-- E-Mail -->
                            <td class="text-xs-center">{{ props.item.email }}</td>
                            <!-- Join Date        -->
                            <td class="text-xs-center">{{ props.item.createDate | moment(datePattern()) }}</td>
                        </template>
                    </v-data-table>
                    <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                </v-card-text>
                <!-- Cancel, Save Button -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', 'Cancel') }}</v-btn>
                    <v-btn @click.native="saveDialog">{{ $td('button.add', 'ADD') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPagination from '@/containers/Common/CommonPagination';
    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';

    export default {
        components: {
            axios,
            CommonPagination,
            CommonPageSizeSelector,
        },
        props: [
            'userListDialog',
            'dialogFrom'
        ],
        watch: {
            userListDialog: function () {
                console.info(this.userListDialog);
                if (!this.userListDialog) {
                    return;
                }
            },
        },
        data() {
            return {
                url: {
                    searchUser: '/rest/v1/userInstance/list/create', //사용자 조회
                    create: '/rest/v1/userInstance/create/list'  //사용자&인스턴스 추가
                },
                pagination: {rowsPerPage: 10},

                headers: [
                    {text: 'ID', align: 'center', sortable: false, value: 'login'},
                    {text: this.$i18n.td('message.username', '성명'), align: 'center', sortable: false, value: 'fullName'},
                    {text: 'E-Mail', align: 'center', sortable: false, value: 'email'},
                    {text: 'Join Date', align: 'center', sortable: false, value: 'createDate'}
                ],
                selected: [],
                searchText: '',
                userStatus: 0,
                users: [],
                totalItems: 0,
            };
        },
        mounted() {
            this.searchUser();
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null) {
                    return 0;
                } else {
                    return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
                }
            }
        },
        methods: {
            //팝업 닫기
            closeDialog() {
                this.selected = [];
                this.searchUser();
                this.$emit('closeDialog');
            },
            //팝업 적용
            saveDialog() {
                let saveList = [];
                for (var i = 0; i < this.selected.length; i++) {
                    saveList.push({
                        'instanceId': '',
                        'login': this.selected[i].login,
                        'userIp': '127.0.0.1'
                    });
                }
                const url = this.url.create;
                axios.post(url, saveList).then(res => {
                    console.log(res.data);
                    this.selected = [];
                    this.searchUser();
                    this.$emit('saveDialog');
                }).catch(e => {
                    this.errors.push(e);
                });

            },

            searchUser() {
                const url = this.url.searchUser;
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchText,
                        userStatus: this.searchStatus
                    }
                }).then(res => {
                    let content = res.data.content;
                    console.info(content);
                    that.totalItems = res.data.totalElements;
                    that.users = content;
                    that.loading = false;
                });
            },
            callbackPageSizeSelector: function (e) {
                console.log('callbackPageSizeSelector rowsPerPage' + e);
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchUser();
            },
            callbackPagination: function (e) {
                console.log('callbackPagination ' + e);
                this.pagination.page = Number(e);
                this.checkAboutSearchCondition();
                this.searchUser();
            },
            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition != undefined && this.$route.query.searchCondition.page != undefined) {
                    this.pagination.page = this.$route.query.searchCondition.page;
                    this.pagination.rowsPerPage = this.$route.query.searchCondition.size;
                    this.searchText = this.$route.query.searchCondition.searchText;
                }
            }
        }
    };
</script>

<style scoped>
</style>
