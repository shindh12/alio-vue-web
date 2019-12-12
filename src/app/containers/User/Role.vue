<template>
    <div id="role-page">
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" :label="this.td.message.role" @keyup.enter="callbackPagination(1)" v-model.trim="searchCondition.searchText"
                                  :placeholder="'\''+this.td.message.roleName+'\' '+$td('message.or', '또는')+' \''+this.td.message.description+ '\''" maxlength="50"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{this.td.message.useYn}}</div>
                    <span class="---has-to-be-span---">
                    <v-select item-value="value" :items="useYnCombo" v-model="searchCondition.searchUseYn" class="narrow-search-select" />
                </span>
                </div>
            </div>
        </div>
        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{ this.td.button.search }}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <!-- [TABLE] ㅇㅇ area -->
            <div class="table-area">
                <!-- [TABLE] Table information(counter, page size, etc) -->
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector
                            :totalCount="totalItems" :pagination="pagination"
                            @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>
                <!-- [TABLE] Table information(counter, page size, etc) END -->

                <!-- [TABLE] Table actions -->
                <div class="table__action" v-if="menuAuth.create || menuAuth.delete">
                    <div class="table__action__default">
                        <v-btn v-if="menuAuth.create" @click.native="openDialog()">{{ this.td.button.add }}</v-btn>
                        <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                        <!-- [CX수정] ### 미사용 기능 삭제 -->
                        <!-- <v-btn v-if="menuAuth.update" :disabled="unuseBtnAvailable" @click.native="openRoleUnuseDialog">{{ this.td.button.unuseConfirm }}</v-btn> -->
                    </div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table
                        :headers="headers" :items="items" item-key="roleId" v-model="selected"
                        :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <!--<td class="table__first__checkbox"><v-checkbox hide-details v-model="props.selected" :key="props.item.roleId"/></td>-->
                            <td v-clickable @click="onClickRow(props.item)" class="text-xs-left"> {{ props.item.roleName }}</td>
                            <td class="text-xs-left"> {{ props.item.description }}</td>
                            <td width="80px" class="text-xs-center">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td v-clickable class="text-xs-center" @click="openRoleUserDialog(props.item)"> {{ props.item.userCnt + ' ' + $td('message.people', '명')}}</td>
                            <td class="justify-center layout px-0" v-if="menuAuth.update">
                                <v-btn icon class="mx-0" @click="openDialog(props.item)" :title="td.button.modify">
                                    <v-icon style="color: #2A96FD;">edit</v-icon>
                                </v-btn>
                            </td>
                        </template>
                    </v-data-table>
                </div>
                <!-- [TABLE] 본체 끝-->
                <!-- [TABLE] Page navi -->
                <div class="table__pager">
                    <common-pagination
                        :page="pagination.page" :pages="pages"
                        @eventPagination="callbackPagination" />
                </div>
                <!-- [TABLE] Page navi END -->
            </div>
        </div>


        <!-- [MODAL] Role Dialog Area -->
        <role-dialog
            :show-dialog="this.roleDialog"
            :mode="this.roleDialogMode"
            :target-role="this.editedItem"
            @closeDialog="closeRoleDialog"
        />
        <!-- [MODAL] Role-User Dialog -->
        <role-user-dialog
            :show-dialog="this.roleUserDialog"
            :target-role="this.editedItem"
            @closeDialog="closeRoleUserDialog"
        />

        <common-confirm
            :confirm-dialog="roleUnuseDialog"
            :title="'Confirm'"
            :message="td.message.unuseConfirm"
            @agree="deleteRoles"
            @disagree="closeRoleUnuseDialog"
        >
        </common-confirm>

    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import CommonPagination from '../Common/CommonPagination';
    import CommonConfirm from '../Common/CommonConfirm';

    import RoleDialog from '@/containers/User/RolePopup/RoleDialog';
    import RoleUserDialog from '@/containers/User/RolePopup/RoleUserDialog';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            CommonConfirm,
            RoleDialog,
            RoleUserDialog,
        },
        data() {
            return {
                searchCondition: {
                    searchText: '',
                    searchUseYn: '',
                },
                confirmDialog: false,
                roleDialog: false,
                roleDialogMode: '',
                roleUserDialog: false,
                roleUnuseDialog: false,
                totalItems: 0,
                pagination: {rowsPerPage: 15, page: 1},
                selected: [],
                cuHeaders: [
                    {text: this.$i18n.td('message.role-name', '역할명'), width: '35%', align: 'center', sortable: false, value: 'Role Name'},
                    {text: this.$i18n.td('message.description', '설명'), width: '65%', align: 'center', sortable: false, value: 'Description'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), width: '100px', align: 'center', sortable: false, value: 'Use YN'},
                    {text: this.$i18n.td('system.user-count', '사용자수'), width: '100px', align: 'center', sortable: false, value: 'User Count'},
                    {text: this.$i18n.td('button.update', '수정'), width: '60px', align: 'center', sortable: false, vavalue: 'action',}
                ],
                rHeaders: [
                    {text: this.$i18n.td('message.role-name', '역할명'), width: '35%', align: 'center', sortable: false, value: 'Role Name'},
                    {text: this.$i18n.td('message.description', '설명'), width: '65%', align: 'center', sortable: false, value: 'Description'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), width: '100px', align: 'center', sortable: false, value: 'Use YN'},
                    {text: this.$i18n.td('system.user-count', '사용자수'), width: '100px', align: 'center', sortable: false, value: 'User Count'},
                ],
                td: {
                    button: {
                        search: this.$i18n.td('button.search', '조회'),
                        add: this.$i18n.td('button.add', '추가'),
                        unuseConfirm: this.$i18n.td('button.unuse-confirm', '미사용'),
                        delete: this.$i18n.td('button.delete', '삭제'),
                        modify: this.$i18n.td('button.update', '수정'),
                    },
                    message: {
                        searchFailed: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        unuseConfirm: this.$i18n.td('message.unuse-confirm', '선택한 {0}을 미사용으로 변경하시겠습니까?'),
                        role: this.$i18n.td('message.role', '역할'),
                        unused: this.$i18n.td('message.unused', '미사용 {0}으로 변경되었습니다.'),
                        unusedFail: this.$i18n.td('message.unused-fail', '미사용 {0}로 변경하는데 실패했습니다.'),
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        roleName: this.$i18n.td('message.role-name', '역할명'),
                        description: this.$i18n.td('message.description', '설명'),
                        userCount: this.$i18n.td('system.user-count', '사용자수'),
                        action: this.$i18n.td('message.action', 'Action'),
                    },
                },
                items: [],
                url: {
                    search: '/rest/v1/role',
                    delete: '/rest/v1/role/delete',
                    unuse: 'rest/v1/role/unuse',
                    excel: 'rest/v1/role/list/filtered'
                },
                editedIndex: -1,
                editedItem: {
                    roleName: '',
                    description: '',
                    useYn: 'Y',
                },
                defaultItem: {
                    roleName: '',
                    description: '',
                    useYn: 'All',
                },
                searchUseYn: '',
                downloadHeaders: {},
                excelData: {},
                useYnCombo: [
                    {text: this.$i18n.td('message.all', '전체'), value: ''},
                    {text: this.$i18n.td('message.use-y', '사용'), value: 'Y'},
                    {text: this.$i18n.td('message.use-n', '미사용'), value: 'N'}
                ],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        computed: {
            pages() {
                if (this.totalItems == null || this.pagination.rowsPerPage == null) {
                    return 0;
                } else {
                    return Math.ceil(this.totalItems / this.pagination.rowsPerPage);
                }
            },
            headers() {
                return (this.menuAuth.update ? this.cuHeaders : this.rHeaders);
            },
            unuseBtnAvailable() {
                if (this.selected.length > 0) {
                    for (let i in this.selected) {
                        if (this.selected[i].useYn === 'Y') {
                            return false;
                        }
                    }
                }
                return true;
            }
        },
        created() {
            if (this.$route.query.searchCondition || this.$route.query.pagination) {
                // sizeselector 및 pagination이 page를 1로 초기화한 후 page 변경
                setTimeout(() => (
                    this.pagination.page = this.$route.query.pagination.page,
                        this.pagination.rowsPerPage = this.$route.query.pagination.rowsPerPage,
                        this.searchRole()
                ), 10);
            }
            this.downloadHeaders[this.$i18n.td('message.role-name', '역할명')] = 'roleName';
            this.downloadHeaders[this.$i18n.td('message.description', '설명')] = 'description';
            this.downloadHeaders[this.$i18n.td('message.use-yn', '사용여부')] = 'useYn';
            this.downloadHeaders[this.$i18n.td('system.user-count', '사용자수')] = 'userCnt';

        },
        methods: {
            searchRole() {
                let url = this.url.search;
                this.loading = true;
                axios.get(url, {
                    params: {
                        page: this.pagination.page - 1,
                        size: this.pagination.rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        searchSystemKey: this.$store.state.loginStore.systemKey,
                        searchUseYn: this.searchCondition.searchUseYn === 'All' ? '' : this.searchCondition.searchUseYn
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.totalItems = res.data.totalElements;
                    this.selected = [];
                    this.items = content;
                    this.loading = false;
                }).catch(() => {
                    this.$notify({
                        title: this.$i18n.td('button.search', '조회'),
                        text: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
            callbackPageSizeSelector(e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.searchRole();
            },
            callbackPagination(e) {
                this.pagination.page = Number(e);
                this.searchRole();
            },
            onClickRow(role) {
                this.$router.push({
                    path: '/user/role/detail/' + role.roleId,
                    query: {
                        roleId: role.roleId,
                        searchCondition: this.searchCondition,
                        pagination: this.pagination,
                    }
                });
            },
            openRoleUnuseDialog() {
                this.roleUnuseDialog = true;
            },
            closeRoleUnuseDialog() {
                this.roleUnuseDialog = false;
            },
            deleteRoles() {
                let url = this.url.unuse;
                let unuseList = [];
                for (let i in this.selected) {
                    unuseList.push(this.selected[i].roleId);
                }
                axios.post(url, unuseList)
                .then(() => {
                    this.$notify({title: this.td.button.unuseConfirm, text: this.td.message.unused, type: 'success'});
                    this.searchRole();
                    this.closeRoleUnuseDialog();
                })
                .catch(() => {
                    this.$notify({title: this.td.button.unuseConfirm, text: this.td.message.unusedFail, type: 'error'});
                });
            },
            openDialog(item) {
                this.editedItem = Object.assign({}, item);
                this.editedIndex = this.items.indexOf(item);
                if (this.editedIndex > -1) {
                    this.roleDialogMode = 'update';
                } else {
                    this.roleDialogMode = 'add';
                }
                this.roleDialog = true;
            },
            closeRoleDialog() {
                this.roleDialog = false;
                this.searchRole();
            },
            openRoleUserDialog(item) {
                this.editedItem = Object.assign({}, item);
                this.editedIndex = this.items.indexOf(item);
                this.roleUserDialog = true;
            },
            closeRoleUserDialog() {
                this.roleUserDialog = false;
                this.searchRole();
            },
            async getExcelList() {
                const url = this.url.excel;
                this.excelData = {};
                this.excelData = await axios.get(url, {
                    params: {
                        searchText: this.searchCondition.searchText,
                        searchSystemKey: this.$store.state.loginStore.systemKey,
                        searchUseYn: this.searchCondition.searchUseYn === 'All' ? '' : this.searchCondition.searchUseYn
                    }
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.roleName = this.excelData.data[i].roleName;
                    row.description = this.excelData.data[i].description;
                    row.useYn = this.excelData.data[i].useYn == 'Y' ? this.$td('message.use-y', '사용') : this.$td('message.use-n', '미사용');
                    row.userCnt = this.excelData.data[i].userCnt;
                    returnData.push(row);
                }
                return returnData;
            },
        },

    };
</script>

<style>
    #role-page table.datatable {
        table-layout: fixed;
    }
</style>
