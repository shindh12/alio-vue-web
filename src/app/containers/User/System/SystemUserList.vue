<template>
    <div>
        <!-- [TITLE] Title area -->
        <page-title />


        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col3">
            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__item-cell">
                <v-text-field name="searchText" label="Search" v-model.trim="searchText" maxlength="30"></v-text-field>
            </div>
            <div class="page-searchbox__item-cell">
                <v-select :items="conditionStatusValues" label="Status" item-value="value" v-model="searchStatus"></v-select>
            </div>
            <!-- [SEARCH] button -->
            <div class="page-searchbox__btn-cell">
                <v-btn @click.native="searchUser()">Search</v-btn>
            </div>
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
                <div class="table__action">
                    <div class="table__action__default">
                        <v-btn @click.native="openDialog()">Add</v-btn>
                        <v-btn @click.native="deleteUsers()" :disabled="selected.length <= 0">Delete</v-btn>
                    </div>
                    <div class="table__action__optional"></div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" select-all item-key="userId" v-model="selected"
                                  :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td class="table__first__checkbox">
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.userId"></v-checkbox>
                            </td>
                            <td v-clickable @click="onClickRow(props.item)"> {{ props.item.fullName }}</td>
                            <td class="text-xs-left">{{ props.item.email }}</td>
                            <td class="text-xs-center">{{ statusValues[props.item.statusId-1].text }}</td>
                            <td class="text-xs-center">{{ props.item.createDate | moment(datePattern()) }}</td>
                            <td class="justify-center layout px-0">
                                <v-btn icon @click="editItem(props.item)">
                                    <v-icon v-col-blue>edit</v-icon>
                                </v-btn>
                                <v-btn icon @click="deleteItem(props.item)">
                                    <v-icon v-col-red>delete</v-icon>
                                </v-btn>
                            </td>
                        </template>
                    </v-data-table>


                </div>
                <!-- [TABLE] 본체 끝-->
                <!-- [TABLE] Page navi -->
                <div class="table__pager">
                    <common-pagination :page="pagination.page" :pages="pages"
                                       @eventPagination="callbackPagination" />
                </div>
                <!-- [TABLE] Page navi END -->
            </div>
        </div>


        <!-- [MODAL] user edit popup(invisible) -->
        <user-add-edit-popup :userAddEditDialog="dialog" :formTitle="formTitle" :statusValues="statusValues" :editedItem="editedItem" :statusSelect="statusSelect"
                             @closeDialog="closeDialog" @saveDialog="saveDialog" />
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPagination from '@/containers/Common/CommonPagination';
    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';
    import UserAddEditPopup from '@/containers/User/UserListPopup/UserAddEditPopup';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            UserAddEditPopup
        },
        data() {
            return {
                title: 'User List',
                path: '사용자/메뉴',
                menu: '사용자',
                searchText: '',
                searchStatus: 0,
                totalItems: 0,
                items: [],
                errors: [],
                loading: true,
                pagination: {rowsPerPage: 3},
                selected: [],
                headers: [
                    {text: 'Name', align: 'center', sortable: false, value: 'fullName'},
                    {text: 'E-mail', align: 'center', sortable: false, value: 'email'},
                    {text: 'Status', align: 'center', sortable: false, value: 'status'},
                    {text: 'Join Date', align: 'center', sortable: false, value: 'createDate'},
                    {text: 'Actions', align: 'center', sortable: false, value: 'fullName',}
                ],
                statusSelect: {text: 'All', value: 0},
                conditionStatusValues: [
                    {text: 'All', value: 0},
                    {text: '미승인(사용자 가입요청 후 아무 조치를 취하지 않은 상태)', value: 1},
                    {text: '활성(활성화된 계정상태)', value: 2},
                    {text: '반려(사용자 가입이 반려된 상태)', value: 3},
                    {text: '잠김(유효하지 않은 접근을 반복하여 비활성화)', value: 4},
                    {text: '블록(시스템 접근 금지)', value: 5}
                ],
                statusValues: [
                    {text: '미승인(사용자 가입요청 후 아무 조치를 취하지 않은 상태)', value: 1},
                    {text: '활성(활성화된 계정상태)', value: 2},
                    {text: '반려(사용자 가입이 반려된 상태)', value: 3},
                    {text: '잠김(유효하지 않은 접근을 반복하여 비활성화)', value: 4},
                    {text: '블록(시스템 접근 금지)', value: 5}
                ],
                dialog: false,
                editedIndex: -1,
                editedItem: {
                    login: '',
                    name: '',
                    email: '',
                    statusId: 0,
                    statusSelect: {}
                },
                defaultItem: {
                    login: '',
                    name: '',
                    email: '',
                    statusId: 0
                }
            };
        },
        computed: {

            formTitle() {
                return this.editedIndex === -1 ? 'Add User' : 'Edit User';
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

        mounted() {
            this.checkAboutSearchCondition();
            this.searchUser();
        },

        methods: {
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
            searchUser() {
                const url = '/rest/v1/user';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                console.log('searchUser');
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchText,
                        userStatus: this.searchStatus
                    }
                }).then(res => {
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.selected = [];
                    that.items = content;
                    that.loading = false;
                    console.log('this.pagination~~~~~~~~~~~~~');
                    console.log(this.pagination);
                });
            },
            createUser(user) {
                const url = '/rest/v1/user/create';
                axios.post(url, user).then(res => {
                    console.log(res.data);
                    this.searchUser();
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            editItem(item) {
                this.editedIndex = this.items.indexOf(item);
                this.editedItem = Object.assign({}, item);
                this.editedItem.statusSelect = this.statusValues[this.editedItem.statusId - 1];

                this.dialog = true;
            },

            deleteItem(item) {
                // confirm('Are you sure you want to delete this item?') && this.items.splice(index, 1)
                if (confirm('Are you sure you want to delete this item?')) {
                    const index = this.items.indexOf(item);
                    this.items.splice(index, 1);
                    this.deleteUser(item);
                }
            },
            deleteUsers() {
                let userList = [];
                for (var i = 0; i < this.selected.length; i++) {
                    userList.push(this.selected[i].userId);
                }
                this.doDeleteUser(userList);
            },
            deleteUser(item) {
                let userList = [item.userId];
                this.doDeleteUser(userList);
            },
            doDeleteUser(userList) {
                console.log(userList);
                const url = '/rest/v1/user/delete';
                this.pagination.page = 1;
                axios.post(url, userList).then(res => {
                    console.log(res.data);
                    this.searchUser();
                }).catch(e => {
                    this.errors.push(e);
                });
            },

            openDialog() {
                //save
                if (!this.editedIndex > -1) {
                    this.statusSelect = {text: '미승인(사용자 가입요청 후 아무 조치를 취하지 않은 상태)', value: 1};
                }
                console.log('this.statusSelect~~~~~~~~~~~~~');
                console.log(this.statusSelect);
                this.dialog = true;
            },

            closeDialog() {
                this.dialog = false;
                setTimeout(() => {
                    this.editedItem = Object.assign({}, this.defaultItem);
                    this.editedIndex = -1;
                }, 300);
            },

            onClickRow(user) {
                this.$router.push({
                    path: '/user/detail/' + user.login,
                    query: {
                        userId: user.userId,
                        statusId: user.statusId,
                        login: user.login,
                        email: user.email,
                        fullName: user.fullName,
                        createDate: user.createDate,
                    }
                });
            },
            saveDialog(e) {
                if (this.editedIndex > -1) {
                    this.editedItem = e;
                    this.editUser(this.editedItem);
                } else {
                    this.items.push(this.editedItem);
                    this.createUser(this.editedItem);
                }
                this.closeDialog();
            },
            editUser(user) {
                const url = '/rest/v1/user/update';
                axios.post(url, user).then(res => {
                    console.log(res.data);
                    this.searchUser();
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition != undefined && this.$route.query.searchCondition.page != undefined) {
                    this.pagination.page = this.$route.query.searchCondition.page;
                    this.pagination.rowsPerPage = this.$route.query.searchCondition.size;
                    this.searchText = this.$route.query.searchCondition.searchText;
                    this.searchStatus = this.$route.query.searchCondition.userStatus;
                }
            }
        }
    }
</script>

<style scoped>

</style>
