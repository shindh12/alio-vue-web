<template>
    <div id="user-list-page">
        <!-- [TITLE] Title area -->
        <page-title />


        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" :label="$td('message.username', '성명')" v-model.trim="searchCondition.searchText" @keyup.enter="callbackPagination(1)"
                                  maxlength="30"></v-text-field>
                    <!--  :placeholder="$td('message.username', '성명')" -->
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('message.status', '상태')}}</div>
                    <span class="---has-to-be-span---">
                    <v-select :items="conditionStatusValues" item-value="value" v-model="searchCondition.searchStatus" class="narrow-search-select" />
                </span>
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
                        <v-btn @click.native="openDialog()" v-if="menuAuth.create">{{$td('button.add', '추가')}}</v-btn>
                        <v-btn @click.native="deleteUsers()" :disabled="selected.length <= 0" v-if="menuAuth.delete">{{$td('button.delete', '삭제')}}</v-btn>
                        <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                    </div>
                    <div class="table__action__optional"></div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" select-all item-key="userId" v-model="selected"
                                  :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.userId"></v-checkbox>
                            </td>
                            <td v-clickable @click="onClickRow(props.item)"> {{ props.item.fullName }}({{props.item.login}})</td>
                            <td class="text-xs-left">{{ props.item.email }}</td>
                            <td class="text-xs-center">{{ statusValues[props.item.statusId-1].text }}</td>
                            <td class="text-xs-center">{{ props.item.createDate | moment(datePattern()) }}</td>
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
                    <common-pagination :page="pagination.page" :pages="pages"
                                       @eventPagination="callbackPagination" />
                </div>
                <!-- [TABLE] Page navi END -->
            </div>
        </div>


        <!-- [MODAL] user edit popup(invisible) -->
        <user-add-edit-popup :userAddEditDialog="dialog" :formTitle="formTitle" :statusValues="statusValues" :editedItem="editedItem"
                             @closeDialog="closeDialog" @saveDialog="saveDialog">
        </user-add-edit-popup>

        <common-confirm
            :confirm-dialog="confirmDialog"
            :title="'Confirm'"
            :message="$td('message.delete-confirm', '삭제하시겠습니까?')"
            @agree="agree"
            @disagree="disagree">
        </common-confirm>
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonConfirm from '../Common/CommonConfirm';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import UserAddEditPopup from './UserListPopup/UserAddEditPopup';

    export default {
        components: {
            CommonConfirm,
            CommonPagination,
            CommonPageSizeSelector,
            UserAddEditPopup
        },
        data() {
            return {
                searchCondition: {
                    searchText: '',
                    searchStatus: 0,
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
                    {
                        text: this.$i18n.td('message.username', '성명') + '(' + this.$i18n.td('user.id', '아이디') + ')'
                        , width: '40%', align: 'center', sortable: false, value: 'fullName'
                    },
                    {text: 'E-mail', width: '60%', align: 'center', sortable: false, value: 'email'},
                    {text: this.$i18n.td('message.status', '상태'), width: '70px', align: 'center', sortable: false, value: 'status'},
                    {text: this.$i18n.td('datetime.join', '가입일'), width: '120px', align: 'center', sortable: false, value: 'createDate'},
                    {text: this.$i18n.td('button.update', '수정'), width: '60px', align: 'center', sortable: false, value: 'fullName',}
                ],
                headersWithoutAction: [
                    {
                        text: this.$i18n.td('message.username', '성명') + '(' + this.$i18n.td('user.id', '아이디') + ')'
                        , width: '40%', align: 'center', sortable: false, value: 'fullName'
                    },
                    {text: 'E-mail', width: '60%', align: 'center', sortable: false, value: 'email'},
                    {text: this.$i18n.td('message.status', '상태'), width: '70px', align: 'center', sortable: false, value: 'status'},
                    {text: this.$i18n.td('datetime.join', '가입일'), width: '120px', align: 'center', sortable: false, value: 'createDate'},
                ],
                statusSelect: {text: 'All', value: 0},
                conditionStatusValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: 0},
                    {text: this.$i18n.td('message.active', '활성'), value: 1},
                    {text: this.$i18n.td('message.inactive', '비활성'), value: 2},
                    {text: this.$i18n.td('message.lock', '잠김'), value: 3},
                ],
                statusValues: [
                    {text: this.$i18n.td('message.active', '활성'), value: 1},
                    {text: this.$i18n.td('message.inactive', '비활성'), value: 2},
                    {text: this.$i18n.td('message.lock', '잠김'), value: 3},
                ],
                downloadHeaders: {},
                excelData: {},
                dialog: false,
                editedIndex: -1,
                editedItem: {
                    login: '',
                    name: '',
                    email: '',
                    statusId: 1,
                    statusSelect: 1,
                },
                defaultItem: {
                    login: '',
                    name: '',
                    email: '',
                    statusId: 0
                },
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
            this.searchUser();
            // vuetify의 v-pagination 내부 초기화로직(page 1로 변경) 수행 후 수행되도록
            if (this.$route.query.pagination) {
                this.$nextTick(() => { this.pagination = this.$route.query.pagination; });
            }
            this.downloadHeaders[this.$i18n.td('message.username', '성명') + '(' + this.$i18n.td('user.id', '아이디') + ')'] = 'fullName';
            this.downloadHeaders[this.$i18n.td('user.e-mail', '이메일')] = 'email';
            this.downloadHeaders[this.$i18n.td('message.status', '상태')] = 'status';
            this.downloadHeaders[this.$i18n.td('datetime.join', '가입일')] = 'createDate';
        },

        methods: {
            callbackPageSizeSelector(page) {
                this.pagination.rowsPerPage = Number(page);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchUser();
            },
            callbackPagination(page) {
                this.pagination.page = Number(page);
                this.checkAboutSearchCondition();
                this.searchUser();
            },
            searchUser() {
                const url = '/rest/v1/user';
                const {page, rowsPerPage} = this.pagination;

                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        userStatus: this.searchCondition.searchStatus
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.totalItems = res.data.totalElements;
                    this.selected = [];
                    this.items = content;
                    this.loading = false;

                });
            },
            createUser(user) {
                const url = '/rest/v1/user/create';
                if (user.statusId === 0) {
                    user.statusId = 1;
                }
                axios.post(url, user).then(res => {
                    this.searchUser();
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
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

            // deleteItem (item) {
            //   // confirm('Are you sure you want to delete this item?') && this.items.splice(index, 1)
            //   if (confirm('Are you sure you want to delete this item?') ){
            //     const index = this.items.indexOf(item)
            //     this.items.splice(index, 1)
            //     this.deleteUser(item)
            //   }
            // },
            agree() {
                this.confirmDialog = false;
                let userList = [];
                for (var i = 0; i < this.selected.length; i++) {
                    userList.push(this.selected[i].userId);
                }
                this.doDeleteUser(userList);
            },
            disagree() {
                this.confirmDialog = false;
            },
            deleteUsers() {
                this.confirmDialog = true;
            },
            deleteUser(item) {
                let userList = [item.userId];
                this.doDeleteUser(userList);
            },
            doDeleteUser(userList) {
                const url = '/rest/v1/user/delete';
                this.pagination.page = 1;
                axios.post(url, userList).then(res => {
                    this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: this.$i18n.td('message.deleted', '삭제되었습니다.'), type: 'success'});
                    this.searchUser();
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            openDialog() {
                //save
                if (!this.editedIndex > -1) {
                    this.editItem.statusSelect = 1;
                }
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
                        searchCondition: this.searchCondition,
                        pagination: this.pagination,
                    }
                });
            },
            saveDialog(e) {
                if (this.editedIndex > -1) {
                    this.editedItem = e;
                    this.editUser(this.editedItem);
                } else {
                    this.createUser(this.editedItem);
                }
                this.closeDialog();
            },
            editUser(user) {
                const url = '/rest/v1/user/update';
                axios.post(url, user).then(res => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    this.searchUser();
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition || this.$route.query.pagination) {
                    this.searchCondition = this.$route.query.searchCondition;
                    this.pagination = this.$route.query.pagination;
                }
            },
            async getExcelList() {
                const url = 'rest/v1/user/find/all';
                this.excelData = {};
                this.excelData = await axios.get(url, {
                    params: {
                        searchText: this.searchCondition.searchText,
                        userStatus: this.searchCondition.searchStatus
                    }
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.fullName = this.excelData.data[i].fullName + '(' + this.excelData.data[i].login + ')';
                    row.email = this.excelData.data[i].email;
                    row.status = this.statusValues[this.excelData.data[i].statusId - 1].text;
                    row.createDate = this.$options.filters.moment(this.excelData.data[i].createDate, this.datePattern());
                    returnData.push(row);
                }
                return returnData;
            },
        }
    };
</script>

<style>
    #user-list-page table.datatable {
        table-layout: fixed;
    }
</style>
