<template>
    <div class="isdp-body-content">

        <!-- [TITLE] Title area -->
        <page-title />


        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col3">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell page-searchbox__item-cell--colspan2">
                    <v-text-field name="searchText" :label="$td('system.configuration', '환경변수')" @keyup.enter="callbackPagination(1)" v-model.trim="searchText"
                                  :placeholder="'\''+$td('menu-configuration.key', '키')+'\' '+$td('message.or', '또는')+' \''+$td('menu-configuration.value', '값') + '\''"
                                  maxlength="200"></v-text-field>
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
                    <div class="table__info__label">
                    </div>
                </div>
                <!-- [TABLE] Table information(counter, page size, etc) END -->
                <!-- [TABLE] Table actions -->
                <div class="table__action" v-if="menuAuth.create || menuAuth.delete">
                    <div class="table__action__default">
                        <v-btn v-if="menuAuth.create" @click.native="openDialog(defaultItem)">{{$td('button.add', '추가')}}</v-btn>
                        <v-btn v-if="menuAuth.delete" :disabled="selected.length <= 0" @click.native="openConfirmDialog()">{{$td('button.delete', '삭제')}}</v-btn>
                        <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                    </div>
                    <div class="table__action__optional"></div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="configurationId"
                                  v-model="selected" select-all
                                  :pagination.sync="pagination" :loading="loading"
                                  :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.configurationId"></v-checkbox>
                            </td>
                            <td width="200px" class="">{{ props.item.configurationKey }}</td>
                            <td width="300px" class="ellipsis" :title="props.item.configurationValue">
                                {{ props.item.configurationValue }}
                            </td>
                            <td class="ellipsis" :title="props.item.description">
                                {{ props.item.description }}
                            </td>
                            <td width="60px" v-if="menuAuth.update" class="text-xs-center">
                                <v-btn icon @click="openDialog(props.item)" :title="modifyTitle">
                                    <v-icon style="color: #2A96FD;">edit</v-icon>
                                </v-btn>
                            </td>
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

        <!-- [MODAL] 삭제 모달 -->
        <v-layout row justify-center>
            <v-dialog v-model="confirmDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">Confirm</v-card-title>
                    <v-card-text> {{$td('message.delete-confirm', '삭제하시겠습니까?') }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="disagree">{{$td('button.no', '아니요')}}</v-btn>
                        <v-btn @click.native="agree">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>

        <!-- [MODAL] Add, Edit Dialog Area(invisible) -->
        <configuration-dialog
            :show-dialog="dialog"
            :target-configuration="editedItem"
            :mode="dialogMode"
            :target-system-key="searchSystemKey"
            @closeDialog="closeDialog"
        />
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import CommonPagination from '../Common/CommonPagination';
    import ConfigurationDialog from './ConfigurationPopup/ConfigurationDialog';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            ConfigurationDialog,
        },
        data() {
            return {
                pagination: {rowsPerPage: 15},
                contentTitle: {name: 'Configuration List', path: '시스템', menu: '환경변수'},

                searchText: '',
                searchSystemKey: this.$store.state.loginStore.systemKey,
                totalItems: 0,
                items: [],
                loading: true,
                selected: [],
                downloadHeaders: {},
                cuHeaders: [
                    {text: this.$i18n.td('menu-configuration.key', '키'), align: 'center', sortable: false, value: 'key'},
                    {text: this.$i18n.td('menu-configuration.value', '값'), align: 'center', sortable: false, value: 'value'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, value: 'description'},
                    {text: this.$i18n.td('button.update', '수정'), align: 'center', sortable: false, value: 'modify',},
                ],
                rHeaders: [
                    {text: this.$i18n.td('menu-configuration.key', '키'), align: 'center', sortable: false, value: 'key'},
                    {text: this.$i18n.td('menu-configuration.value', '값'), align: 'center', sortable: false, value: 'value'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, value: 'description'},
                ],
                url: {
                    search: '/rest/v1/configuration',
                    add: '/rest/v1/configuration/add',
                    delete: '/rest/v1/configuration/delete',
                    update: '/rest/v1/configuration/update',
                    excel: '/rest/v1/configuration/list/filtered'
                },
                dialog: false,
                dialogMode: 'Add',
                editedIndex: -1,
                editedItem: {
                    key: '',
                    value: '',
                    description: ''
                },
                defaultItem: {
                    key: '',
                    value: '',
                    description: ''
                },
                modifyTitle: this.$i18n.td('button.update', '수정'),
                confirmDialog: false,
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        created() {
            this.downloadHeaders[this.$i18n.td('menu-configuration.key', '환경변수 키')] = 'configurationKey';
            this.downloadHeaders[this.$i18n.td('menu-configuration.value', '환경변수 값')] = 'configurationValue';
            this.downloadHeaders[this.$i18n.td('message.description', '설명')] = 'description';
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
                return (this.menuAuth.update ? this.cuHeaders : this.rHeaders);
            }
        },
        methods: {
            callbackPageSizeSelector(e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.searchConfiguration();
            },
            callbackPagination(e) {
                this.pagination.page = Number(e);
                this.searchConfiguration();
            },
            searchConfiguration() {
                const url = this.url.search;
                const {page, rowsPerPage} = this.pagination;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchText,
                        searchSystemKey: this.$store.state.loginStore.systemKey
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.totalItems = res.data.totalElements;
                    this.selected = [];
                    this.items = content;
                    this.loading = false;
                });
            },
            deleteConfigurations() {
                let url = this.url.delete;
                let deleteIdList = [];
                for (let i = 0; i < this.selected.length; i++) {
                    deleteIdList.push(this.selected[i].configurationId);
                }
                axios.post(url, deleteIdList)
                .then(() => {
                    this.searchConfiguration();
                    this.$notify({
                        title: this.$i18n.td('button.delete', '삭제'),
                        text: this.$i18n.td('message.deleted-something', '삭제되었습니다.', ' '),
                        type: 'success'
                    });
                })
                .catch(res => {
                    this.$notify({
                        title: this.$i18n.td('button.delete', '삭제'),
                        text: this.$i18n.td('message.delete-failed-something', '삭제에 실패했습니다.', this.$i18n('system.configuration', '환경변수')),
                        type: 'error'
                    });
                });
            },
            openDialog(item) {

                this.editedIndex = this.items.indexOf(item);
                this.editedItem = Object.assign({}, item);
                if (this.editedIndex > -1) {
                    this.dialogMode = 'UPDATE';
                } else {
                    this.dialogMode = 'ADD';
                }
                this.dialog = true;
            },
            closeDialog() {
                this.dialog = false;
                setTimeout(() => {
                    this.editedItem = Object.assign({}, this.defaultItem);
                    this.editedIndex = -1;
                }, 300);
                this.searchConfiguration();
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                this.deleteConfigurations();
            },
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            async getExcelList() {
                const url = this.url.excel;
                let returnData = await axios.get(url, {
                    params: {
                        searchText: this.searchText,
                        searchSystemKey: this.$store.state.loginStore.systemKey
                    }
                });
                return returnData.data;
            },
        }

    };
</script>

<style scoped>

</style>
