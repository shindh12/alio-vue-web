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
                                  :placeholder="'\''+$td('', 'ID')+'\' '+$td('message.or', '또는')+' \''+$td('system.name', '시스템명')+ '\''" maxlength="50"></v-text-field>
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
                    <v-data-table :headers="headers" :items="items" item-key="clientId"
                                  v-model="selected" select-all :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.clientId"></v-checkbox>
                            </td>
                            <td width="180px" class="text-xs-left">{{ props.item.clientId }}</td>
                            <td width="180px" class="text-xs-left">{{ props.item.rawSecret }}</td>
                            <td width="230px" class="">{{ props.item.secretName }}</td>
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
        <api-add-popup :edited-item="editedItem" :secretAddPopup="dialog" :formTitle="formTitle" :createStatusValues="createStatusValues" @closeDialog="closeDialog"
                       @saveDialog="saveDialog">
        </api-add-popup>
    </div>
</template>

<script>
    import CommonConfirm from '../Common/CommonConfirm';
    import ApiAddPopup from '@/containers/Api/Popup/ApiAddPopup';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';

    export default {
        components: {
            CommonConfirm,
            CommonPagination,
            CommonPageSizeSelector,
            ApiAddPopup
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
                    {text: this.$i18n.td('', 'ID'), align: 'center', sortable: false, value: 'clientId'},
                    {text: this.$i18n.td('', 'Secret'), align: 'center', sortable: false, value: 'clientSecret'},
                    {text: this.$i18n.td('system.name', '시스템명'), align: 'center', sortable: false, value: 'secretName'},
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
                    clientId: '',
                    rawSecret: '',
                    secretName: '',
                    description: '',
                    useYn: 'Y'
                },
                defaultItem: {
                    clientId: '',
                    rawSecret: '',
                    secretName: '',
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
                return this.editedIndex === -1 ? this.$i18n.td('menu.system-create', '시크릿 생성') : this.$i18n.td('menu.system-update', '시크릿 수정');
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
            this.searchSecretList();
            // vuetify의 v-pagination 내부 초기화로직(page 1로 변경) 수행 후 수행되도록
            if (this.$route.query.pagination) {
                setTimeout(() => (this.pagination = this.$route.query.pagination), 300);
            }

            this.downloadHeaders[this.$i18n.td('system.key', '신청번호')] = 'clientId';
            this.downloadHeaders[this.$i18n.td('system.auth-code', '보안코드')] = 'rawSecret';
            this.downloadHeaders[this.$i18n.td('system.name', '시스템명')] = 'secretName';
            this.downloadHeaders[this.$i18n.td('message.description', '설명')] = 'description';
            this.downloadHeaders[this.$i18n.td('message.use-yn', '사용여부')] = 'useYn';
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchSecretList();
            },

            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.checkAboutSearchCondition();
                this.searchSecretList();
            },

            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition && this.$route.query.pagination) {
                    this.searchCondition = this.$route.query.searchCondition;
                    this.pagination = this.$route.query.pagination;
                }
            },

            searchSecretList() {
                const url = '/rest/v1/secret/list';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                this.$http.get(url, {
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

            createSecret(secret) {
                const url = '/rest/v1/secret/create';
                this.$http.post(url, secret).then(res => {
                    this.searchSecretList();
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                }).catch(e => {
                    this.$notify({title: 'error message', text: error, type: 'error'});
                });
            },

            updateSecret(secret) {
                const url = '/rest/v1/secret/update';
                this.$http.post(url, secret).then(res => {
                    this.searchSecretList();
                }).catch(e => {
                    this.$notify({title: 'error message', text: error, type: 'error'});
                });
            },
            deleteSecret(secret) {
                let that = this;
                const url = '/rest/v1/secret/delete';
                this.$http.post(url, secret).then(res => {
                    //console.log(res.data);
                    that.deleted = [];
                    this.searchSecretList();
                }).catch(e => {
                    this.$notify({title: 'error message', text: error, type: 'error'});
                });
            },
            editItem(item) {
                this.editedIndex = this.items.indexOf(item);
                this.editedItem = Object.assign({}, item);
                this.dialog = true;
            },
            deleteSecrets() {
                for (var i = 0; i < this.selected.length; i++) {
                    this.deleted.push(this.selected[i].clientId);
                }
                //console.log(this.deleted);
                this.deleteSecret(this.deleted);
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
                    this.updateSecret(this.editedItem);
                } else {
                    //Create
                    this.createSecret(this.editedItem);
                }
                this.closeDialog();
            },

            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                this.deleteSecrets();
            },
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            async getExcelList() {
                const url = '/rest/v1/secret/list/filtered';
                let returnData = await this.$http.get(url, {
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
