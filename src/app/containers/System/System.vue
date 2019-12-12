<template>
    <div class="isdp-body-content">

        <!-- [TITLE] Title area -->
        <page-title />


        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" :label="$td('menu.system', '시스템')" v-model.trim="searchCondition.searchText" @keyup.enter="callbackPagination(1)"
                                  :placeholder="'\''+$td('system.key', '시스템키')+'\' '+$td('message.or', '또는')+' \''+$td('system.name', '시스템명')+ '\''" maxlength="50"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('message.use-yn', '사용여부')}}</div>
                    <span class="---has-to-be-span---">
              <v-select :items="statusValues" v-model="searchCondition.searchUseYn" item-value="value" class="narrow-search-select" />
            </span>
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
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>
                <!-- [TABLE] Table information(counter, page size, etc) END -->
                <!-- [TABLE] Table actions -->
                <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                    <div class="table__action__default">
                        <v-btn v-if="menuAuth.create" @click.native="openDialog()">{{$td('button.add', '추가')}}</v-btn>
                        <v-btn v-if="menuAuth.update" :disabled="selected.length <= 0" @click.native="openConfirmDialog()">{{$td('message.use-n', '미사용')}}</v-btn>
                        <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{ $td('button.download', '다운로드') }}</v-btn>
                        </download-excel>
                    </div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="systemKey"
                                  v-model="selected" select-all :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.systemKey"></v-checkbox>
                            </td>
                            <td width="180px" v-clickable class="text-xs-left" @click="onClickRow(props.item)">{{ props.item.systemKey }}</td>
                            <td width="180px" class="text-xs-left">{{ props.item.authCode }}</td>
                            <td width="230px" class="">{{ props.item.systemName }}</td>
                            <td class="ellipsis" style="min-width:0px;">{{ props.item.description }}</td>
                            <td width="80px" class="text-xs-center">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
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

        <common-confirm
            :confirm-dialog="confirmDialog"
            :title="'Confirm'"
            :message="$td('message.not-use', '미사용처리 하시겠습니까?')"
            @agree="agree"
            @disagree="disagree">
        </common-confirm>

        <!-- [MODAL] System add popup(invisible) -->
        <system-add-popup :edited-item="editedItem" :systemAddPopup="dialog" :formTitle="formTitle" :createStatusValues="createStatusValues" @closeDialog="closeDialog"
                          @saveDialog="saveDialog">
        </system-add-popup>
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonConfirm from '../Common/CommonConfirm';
    import SystemAddPopup from '@/containers/System/SystemPopup/SystemAddPopup';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';

    export default {
        components: {
            CommonConfirm,
            CommonPagination,
            CommonPageSizeSelector,
            SystemAddPopup
        },
        data() {
            return {
                searchCondition: {
                    searchText: '',
                    searchUseYn: 'All',
                },
                totalItems: 0,
                items: [],
                loading: true,
                pagination: {rowsPerPage: 15},
                selected: [],
                deleted: [],
                errors: [],
                downloadHeaders: {},
                headers: [
                    {text: this.$i18n.td('system.key', '시스템키'), align: 'center', sortable: false, value: 'systemKey'},
                    {text: this.$i18n.td('system.auth-code', '보안코드'), align: 'center', sortable: false, value: 'systemKey'},
                    {text: this.$i18n.td('system.name', '시스템명'), align: 'center', sortable: false, value: 'systemName'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, value: 'description'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, value: 'useYn'},
                ],

                statusValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: 'All'},
                    {text: this.$i18n.td('message.use-y', '사용'), value: 'Y'},
                    {text: this.$i18n.td('message.use-n', '미사용'), value: 'N'}
                ],
                createStatusValues: [
                    {text: this.$i18n.td('message.use-y', '사용'), value: 'Y'},
                    {text: this.$i18n.td('message.use-n', '미사용'), value: 'N'}
                ],
                dialog: false,
                editedIndex: -1,
                editedItem: {
                    systemKey: '',
                    authCode: '',
                    systemName: '',
                    description: '',
                    useYn: 'Y'
                },
                defaultItem: {
                    systemKey: '',
                    authCode: '',
                    systemName: '',
                    description: '',
                    useYn: 'Y'
                },
                confirmDialog: false,
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        computed: {
            formTitle() {
                return this.editedIndex === -1 ? this.$i18n.td('menu.system-create', '시스템 생성') : this.$i18n.td('menu.system-update', '시스템 수정');
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
            },

        },

        created() {
            this.checkAboutSearchCondition();
            this.searchSystemList();
            // vuetify의 v-pagination 내부 초기화로직(page 1로 변경) 수행 후 수행되도록
            if (this.$route.query.pagination) {
                setTimeout(() => (this.pagination = this.$route.query.pagination), 300);
            }

            this.downloadHeaders[this.$i18n.td('system.key', '신청번호')] = 'systemKey';
            this.downloadHeaders[this.$i18n.td('system.auth-code', '보안코드')] = 'authCode';
            this.downloadHeaders[this.$i18n.td('system.name', '시스템명')] = 'systemName';
            this.downloadHeaders[this.$i18n.td('message.description', '설명')] = 'description';
            this.downloadHeaders[this.$i18n.td('message.use-yn', '사용여부')] = 'useYn';
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchSystemList();
            },

            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.checkAboutSearchCondition();
                this.searchSystemList();
            },

            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition && this.$route.query.pagination) {
                    this.searchCondition = this.$route.query.searchCondition;
                    this.pagination = this.$route.query.pagination;
                }
            },

            searchSystemList() {
                const url = '/rest/v1/system/list';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        useYn: this.searchCondition.searchUseYn
                    }
                }).then(res => {
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.selected = [];
                    that.items = content;
                    that.loading = false;

                });
            },

            createSystem(system) {
                const url = '/rest/v1/system/create';
                axios.post(url, system).then(res => {
                    this.searchSystemList();
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                }).catch(e => {
                    this.$notify({title: 'error message', text: error, type: 'error'});
                });
            },

            updateSystem(system) {
                const url = '/rest/v1/system/update';
                axios.post(url, system).then(res => {
                    this.searchSystemList();
                }).catch(e => {
                    this.$notify({title: 'error message', text: error, type: 'error'});
                });
            },
            deleteSystem(system) {
                let that = this;
                const url = '/rest/v1/system/delete';
                axios.post(url, system).then(res => {
                    //console.log(res.data);
                    that.deleted = [];
                    this.searchSystemList();
                }).catch(e => {
                    this.$notify({title: 'error message', text: error, type: 'error'});
                });
            },
            editItem(item) {
                this.editedIndex = this.items.indexOf(item);
                this.editedItem = Object.assign({}, item);
                this.dialog = true;
            },
            deleteSystems() {
                for (var i = 0; i < this.selected.length; i++) {
                    this.deleted.push(this.selected[i].systemKey);
                }
                //console.log(this.deleted);
                this.deleteSystem(this.deleted);
            },

            openDialog() {
                this.dialog = true;
            },

            closeDialog() {
                this.dialog = false;
                setTimeout(() => {
                    this.editedItem = Object.assign({}, this.defaultItem);
                    this.editedIndex = -1;
                }, 300);
            },

            saveDialog() {
                if (this.editedIndex > -1) {
                    //Edit
                    this.updateSystem(this.editedItem);
                } else {
                    //Create
                    this.createSystem(this.editedItem);
                }
                this.closeDialog();
            },

            onClickRow(system) {
                this.$router.push({
                    path: '/system/detail/',
                    query: {
                        systemKey: system.systemKey,
                        authCode: system.authCode,
                        systemName: system.systemName,
                        searchCondition: this.searchCondition,
                        pagination: this.pagination,
                    }
                });
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                this.deleteSystems();
            },
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            async getExcelList() {
                const url = '/rest/v1/system/list/filtered';
                let returnData = await axios.get(url, {
                    params: {
                        searchText: this.searchCondition.searchText,
                        useYn: this.searchCondition.searchUseYn
                    }
                });
                for (let i in returnData.data) {
                    if (returnData.data[i].useYn === 'Y') {
                        returnData.data[i].useYn = this.$i18n.td('message.use-y', '사용');
                    } else {
                        returnData.data[i].useYn = this.$i18n.td('message.use-n', '미사용');
                    }
                }
                return returnData.data;
            },
        }

    };
</script>

<style scoped></style>
