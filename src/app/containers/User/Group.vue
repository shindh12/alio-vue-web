<template>
    <div>
        <!-- [TITLE] Title area -->
        <page-title />


        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field :label="td.message.group" name="groupName" v-model.trim="searchGroupName"
                                  :placeholder="'\''+td.code.groupName+'\' '+$td('message.or', '또는')+' \''+td.message.description+ '\''" @keyup.enter="callbackPagination(1)"
                                  maxlength="100"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{td.message.useYn}}</div>
                    <span class="---has-to-be-span---">
                    <v-select item-value="value" :items="useYnCombo" v-model="searchUseYn" class="narrow-search-select" />
                </span>

                </div>
            </div>
        </div>
        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{ td.button.search }}</v-btn>
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
                <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                    <div class="table__action__default">
                        <v-btn v-if="menuAuth.create" @click.native="openGroupDialog()">{{ td.button.add }}</v-btn>
                        <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                        <!-- [CX수정] ### 미사용 기능 삭제 -->
                        <!-- <v-btn  v-if="menuAuth.update" :disabled="unuseBtnAvailable" @click.native="openGroupUnuseDialog()">{{ td.button.unuseConfirm }}</v-btn> -->
                    </div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="groupId" v-model="selected"
                                  :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <!--<td><v-checkbox primary hide-details v-model="props.selected" :key="props.item.groupId"></v-checkbox></td>-->
                            <td width="200px" class="text-xs-left">{{ props.item.groupName }}</td>
                            <td class="text-xs-left">{{ props.item.description }}</td>
                            <td width="80px" class="text-xs-center">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td width="85px" v-clickable class="text-xs-center" @click="openGroupRoleDialog(props.item)">{{ props.item.roleCnt + ' ' + $td('message.ea', '개') }}
                            </td>
                            <td width="85px" v-clickable class="text-xs-center" @click="openGroupUserDialog(props.item)">{{ props.item.userCnt + ' ' + $td('message.people',
                                '명')}}
                            </td>
                            <td width="60px" class="text-xs-center">
                                <v-btn icon @click.native="openGroupDialog(props.item)" v-if="menuAuth.update" :title="td.button.modify">
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

        <!-- [MODAL] Delete Dialog Area -->
        <v-layout row justify-center>
            <v-dialog v-model="groupUnuseDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">Confirm</v-card-title>
                    <v-card-text> {{ td.message.unuseConfirm }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="closeGroupUnuseDialog">{{ td.button.no }}</v-btn>
                        <v-btn @click.native="unuseGroup">{{ td.button.yes }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>

        <!-- [MODAL] Add, Edit Dialog Area -->
        <group-dialog
            :target-group='editedItem'
            :show-dialog='groupDialog'
            :mode='groupDialogMode'
            :target-system-key="this.$store.state.loginStore.systemKey"
            @closeDialog="closeGroupDialog"
        />

        <!-- [MODAL] Group-Role Dialog Area -->
        <group-role-dialog
            :show-dialog="groupRoleDialog"
            :target-group="editedItem"
            @closeDialog="closeGroupRoleDialog"
        />

        <!-- [MODAL] Group-User Dialog Area -->
        <group-user-dialog
            :show-dialog="groupUserDialog"
            :target-group="editedItem"
            @closeDialog="closeGroupUserDialog"
        />

    </div>
</template>

<script>
    import axios from 'axios';
    import CodeService from '@/util/code/CodeService';

    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';
    import CommonPagination from '@/containers/Common/CommonPagination';
    import GroupDialog from '@/containers/User/GroupPopup/GroupDialog';
    import GroupRoleDialog from '@/containers/User/GroupPopup/GroupRoleDialog';
    import GroupUserDialog from '@/containers/User/GroupPopup/GroupUserDialog';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            GroupDialog,
            GroupRoleDialog,
            GroupUserDialog,
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null
                ) {
                    return 0;
                } else {
                    return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
                }
            },
            headers() {
                return (this.menuAuth.create || this.menuAuth.update) ? this.td.cudHeaders : this.td.rHeaders;
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
            this.useYnCombo = CodeService.getCodeDetailList('use-yn', true);

            this.downloadHeaders[this.$i18n.td('code.group-name', '그룹명')] = 'groupName';
            this.downloadHeaders[this.$i18n.td('message.description', '설명')] = 'description';
            this.downloadHeaders[this.$i18n.td('message.use-yn', '사용여부')] = 'useYn';
            this.downloadHeaders[this.$i18n.td('message.role', '역할') + this.$i18n.td('message.count', '수')] = 'roleCnt';
            this.downloadHeaders[this.$i18n.td('system.user-count', '사용자수')] = 'userCnt';

        },
        data() {
            return {
                groupDialog: false,
                groupRoleDialog: false,
                groupUserDialog: false,
                groupUnuseDialog: false,

                searchGroupName: '',
                searchUseYn: '',
                searchSystemKey: this.$store.state.loginStore.systemKey,
                groupDialogMode: '',
                totalItems: 0,
                items: [],
                downloadHeaders: {},
                excelData: {},

                loading: true,
                pagination: {rowsPerPage: 3, page: 1},
                contentTitle: {name: 'Group List', path: '사용자/메뉴', menu: '그룹'},
                selected: [],
                useYnCombo: [],
                td: {
                    message: {
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        group: this.$i18n.td('message.group', '그룹'),
                        description: this.$i18n.td('message.description', '설명'),
                        unuseConfirm: this.$i18n.td('message.unuse-confirm', '선택한 항목을 미사용으로 변경하시겠습니까?'),
                        unused: this.$i18n.td('message.unused', '미사용으로 변경되었습니다.'),
                        unusedFail: this.$i18n.td('message.unused-fail', '미사용으로 변경하는데 실패했습니다.')

                    },
                    code: {
                        groupName: this.$i18n.td('code.group-name', '그룹명')
                    },
                    button: {
                        search: this.$i18n.td('button.search', '조회'),
                        add: this.$i18n.td('button.add', '추가'),
                        unuseConfirm: this.$i18n.td('button.unuse-confirm', '미사용'),
                        no: this.$i18n.td('button.no', '아니요'),
                        yes: this.$i18n.td('button.yes', '예'),
                        modify: this.$i18n.td('button.update', '수정'),
                    },
                    cudHeaders: [
                        {text: this.$i18n.td('code.group-name', '그룹명'), align: 'center', sortable: false, value: 'groupName'},
                        {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, value: 'description'},
                        {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, value: 'useYn'},
                        {text: this.$i18n.td('message.role', '역할') + ' ' + this.$i18n.td('message.count', '수'), align: 'center', sortable: false, value: 'roleCnt',},
                        {text: this.$i18n.td('system.user-count', '사용자수'), align: 'center', sortable: false, value: 'userCnt',},
                        {text: this.$i18n.td('button.update', '수정'), align: 'center', sortable: false,},
                    ],
                    rHeaders: [
                        {text: this.$i18n.td('code.group-name', '그룹명'), align: 'center', sortable: false, value: 'groupName'},
                        {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, value: 'description'},
                        {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, value: 'useYn'},
                        {text: this.$i18n.td('message.role', '역할') + ' ' + this.$i18n.td('message.count', '수'), align: 'center', sortable: false, value: 'roleCnt',},
                        {text: this.$i18n.td('system.user-count', '사용자수'), align: 'center', sortable: false, value: 'userCnt',},
                    ],
                },
                url: {
                    search: '/rest/v1/group/list',
                    unuse: '/rest/v1/group/delete',
                    excel: '/rest/v1/group/list/filtered'
                },
                editedIndex: -1,
                editedItem: this.defaultItem,
                defaultItem: {
                    groupId: '',
                    groupName: 'test',
                    description: '',
                    systemKey: '',
                    useYn: 'Y'
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        methods: {
            callbackPageSizeSelector(e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.searchGroup();
            },
            callbackPagination(e) {
                this.pagination.page = Number(e);
                this.searchGroup();
            },
            searchGroup() {
                const url = this.url.search;
                const {page, rowsPerPage} = this.pagination;
                let searchUseYn = this.searchUseYn;
                if (searchUseYn === 'All') { searchUseYn = ''; }
                this.loading = true;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchGroupName: this.searchGroupName,
                        searchUseYn: searchUseYn,
                        searchSystemKey: this.$store.state.loginStore.systemKey,
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.totalItems = res.data.totalElements;
                    this.selected = [];
                    this.items = content;
                    this.loading = false;
                });
            },
            unuseGroup() {
                let url = this.url.unuse;
                let unuseIdList = [];
                for (let i = 0; i < this.selected.length; i++) {
                    unuseIdList.push(this.selected[i].groupId);
                }
                axios.post(url, unuseIdList)
                .then(() => {
                    this.$notify({
                        title: this.td.button.unuseConfirm,
                        text: this.td.message.unused,
                        type: 'success'
                    });
                    this.closeGroupUnuseDialog();
                    this.searchGroup();
                }).catch(() => {
                    this.$notify({
                        title: this.td.button.unuseConfirm,
                        text: this.td.message.unusedFail,
                        type: 'error'
                    });
                });
            },
            openGroupDialog(item) {
                this.editedIndex = this.items.indexOf(item);
                this.editedItem = Object.assign({}, item);

                if (this.editedIndex > -1) {
                    this.groupDialogMode = 'UPDATE';
                } else {
                    this.groupDialogMode = 'ADD';
                }
                this.groupDialog = true;
            },
            openGroupRoleDialog(group) {
                this.editedItem = Object.assign({}, group);
                this.groupRoleDialog = true;
            },
            openGroupUserDialog(group) {
                this.editedItem = Object.assign({}, group);
                this.groupUserDialog = true;
            },
            openGroupUnuseDialog() {
                this.groupUnuseDialog = true;
            },
            closeGroupDialog() {
                this.groupDialog = false;
                this.clearDialog();
            },
            closeGroupRoleDialog() {
                this.groupRoleDialog = false;
                this.clearDialog();
            },
            closeGroupUserDialog() {
                this.groupUserDialog = false;
                this.clearDialog();
            },
            closeGroupUnuseDialog() {
                this.groupUnuseDialog = false;
            },
            clearDialog() {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
                this.searchGroup();
            },
            async getExcelList() {
                const url = this.url.excel;
                let searchUseYn = this.searchUseYn;
                if (searchUseYn === 'All') { searchUseYn = ''; }
                this.loading = true;
                this.excelData = await axios.get(url, {
                    params: {
                        searchGroupName: this.searchGroupName,
                        searchUseYn: searchUseYn,
                        searchSystemKey: this.$store.state.loginStore.systemKey,
                    }
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.groupName = this.excelData.data[i].groupName;
                    row.description = this.excelData.data[i].description;
                    row.useYn = this.excelData.data[i].useYn == 'Y' ? this.$td('message.use-y', '사용') : this.$td('message.use-n', '미사용');
                    row.roleCnt = this.excelData.data[i].roleCnt;
                    row.userCnt = this.excelData.data[i].userCnt;
                    returnData.push(row);
                }
                this.loading = false;
                return returnData;
            },
        }
    };
</script>

<style scoped>
</style>
