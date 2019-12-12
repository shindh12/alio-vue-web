<template>
    <div id="rest-api-page">
        <!--  Title Area -->
        <page-title></page-title>

        <!-- Search Area -->
        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field :label="$td('system.rest-url', 'REST URL')" name="searchText" v-model.trim="searchText" @keyup.enter="callbackRestApiPagination(1)"
                                  maxlength="200"></v-text-field>
                    <!--  :placeholder="$td('system.rest-url', 'REST URL')" -->
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('message.use-yn', '사용여부')}}</div>
                    <span class="---has-to-be-span---">
	                    <v-select item-value="value" :items="useYnCombo" v-model="searchUseYn" class="narrow-search-select" />
                    </span>
                </div>
            </div>
        </div>
        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackRestApiPagination(1)">{{$td('message.search', '조회')}}</v-btn>
        </div>


        <!-- [CONTENT] 본문 영역 -->
        <div class="page-content full-height">
            <!-- [CONTENT] 왼반쪽 -->
            <div class="cont-half">
                <h2 class="sub-title">REST List</h2>
                <!-- [TABLE-1] 시작 -->
                <div class="table-area table-area--left-fit">
                    <!-- [TABLE-1] Table information(counter, page size, etc) -->
                    <div class="table__info">
                        <!-- [TABLE-1] Table actions -->
                        <div class="table__action" v-if="menuAuth.create || menuAuth.update ||menuAuth.delete">
                            <div class="table__action__default">
                                <v-btn @click.native="openRestApiDialog()" v-if="menuAuth.create">{{$td('button.add', '추가')}}</v-btn>
                                <v-btn @click.native="openConfirmDialog()" :disabled="selectedRestApi.restApiId==''" v-if="menuAuth.delete">{{$td('button.delete', '삭제')}}</v-btn>
                            </div>
                        </div>
                        <!-- [TABLE-1] Table actions END -->
                        <div class="table__info__counter">
                            <common-page-size-selector :totalCount="restApiTotalItems" :pagination="restApiPagination"
                                                       @eventPageSizeSelector="callbackRestApiPageSizeSelector" />
                        </div>
                    </div>
                    <!-- [TABLE-1] Table information(counter, page size, etc) END -->

                    <!-- [TABLE-1] 본체 -->
                    <div class="table__body">
                        <v-data-table id="rest-list" :headers="headers" :items="restApiItems" item-key="items.resetApiId"
                                      :loading="restApiLoading" :total-items="restApiTotalItems"
                                      :pagination.sync="restApiPagination" hide-actions>
                            <template slot="items" slot-scope="props">
                                <tr :active="props.item == selectedRestApi">
                                    <td class="text-xs-left ellipsis" @click="updateAuthItems(props.item)">{{ props.item.restApiUrl }}</td>
                                    <td class="text-xs-left ellipsis" @click="updateAuthItems(props.item)">{{ props.item.description }}</td>
                                    <td class="text-xs-center" @click="updateAuthItems(props.item)">
                                        {{ props.item.useYN =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}
                                    </td>
                                    <td class="justify-center layout px-0" v-if="menuAuth.update">
                                        <v-btn icon @click="openRestApiDialog(props.item)" :title="modifyTitle">
                                            <v-icon style="color: #2A96FD;">edit</v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </div>
                    <!-- [TABLE-1] 본체 끝-->
                    <!-- [TABLE-1] Page navi -->
                    <div class="table__pager">
                        <common-pagination :page="restApiPagination.page" :pages="restApiPages" @eventPagination="callbackRestApiPagination" />
                    </div>
                    <!-- [TABLE-1] Page navi END -->
                </div>
                <!-- [TABLE-1] 끝 -->
            </div>


            <!-- [CONTENT] 오른반쪽 -->
            <div class="cont-half">
                <!-- [TABLE-2] 시작 -->
                <div class="table-area table-area--left-fit">
                    <h2 class="sub-title">Role List</h2>
                    <!-- [TABLE-2] Table information(counter, page size, etc) -->
                    <div class="table__info">
                        <!-- [TABLE-2] Table actions -->
                        <div class="table__action" v-if="menuAuth.create || menuAuth.update ||menuAuth.delete">
                            <div class="table__action__default">
                                <v-btn :disabled="selectedRestApi.restApiId==''" @click.native="openRestApiAuthDialog()" v-if="menuAuth.create">{{$td('button.add', '추가')}}</v-btn>

                                <v-btn :disabled="selectedAuth.length == 0" @click.native="openRoleConfirmDialog()" v-if="menuAuth.delete">{{$td('button.delete', '삭제')}}</v-btn>
                            </div>
                        </div>
                        <!-- [TABLE-2] Table actions END -->
                        <div class="table__info__counter">
                            <common-page-size-selector :totalCount="authTotalItems" :pagination="authPagination"
                                                       @eventPageSizeSelector="callbackAuthPageSizeSelector" />
                        </div>
                    </div>
                    <!-- [TABLE-2] Table information(counter, page size, etc) END -->

                    <!-- [TABLE-2] 본체 -->
                    <div class="table__body">
                        <v-data-table id="role-list"
                                      :headers="authHeaders" :items="authItems" item-key="roleId"
                                      v-model="selectedAuth" select-all :total-items="authTotalItems"
                                      :loading="authLoading" hide-actions>
                            <template slot="items" slot-scope="props">
                                <tr>
                                    <td>
                                        <v-checkbox primary hide-details v-model="props.selected" :key="props.item.roleId" />
                                    </td>
                                    <td class="text-xs-left">{{ props.item.roleName }}</td>
                                    <td class="text-xs-center">
                                        <v-checkbox :disabled="!menuAuth.update" true-value='A' false-value='D' @click=updateAuthButtonFlag(true) v-model="props.item.mGet" />
                                    </td>
                                    <td class="text-xs-center">
                                        <v-checkbox :disabled="!menuAuth.update" true-value='A' false-value='D' @click=updateAuthButtonFlag(true) v-model="props.item.mPost" />
                                    </td>
                                    <td class="text-xs-center">
                                        <v-checkbox :disabled="!menuAuth.update" true-value='A' false-value='D' @click=updateAuthButtonFlag(true) v-model="props.item.mPut" />
                                    </td>
                                    <td class="text-xs-center">
                                        <v-checkbox :disabled="!menuAuth.update" true-value='A' false-value='D' @click=updateAuthButtonFlag(true) v-model="props.item.mDelete" />
                                    </td>
                                    <td class="text-xs-center">
                                        <v-checkbox :disabled="!menuAuth.update" true-value='A' false-value='D' @click=updateAuthButtonFlag(true) v-model="props.item.mPatch" />
                                    </td>
                                </tr>
                            </template>
                            <template slot="no-data">
                                <div v-show="selectedRestApi.restApiId  == ''" align="center">Please select REST API to see the data</div>
                                <div v-show="selectedRestApi.restApiId !== ''" align="center">All HTTP methods are blocked</div>
                            </template>
                        </v-data-table>
                    </div>
                    <!-- [TABLE-2] 본체 끝-->
                    <!-- [TABLE-2] Page navi -->
                    <div class="table__pager">
                        <common-pagination :page="authPagination.page" :pages="authPages" @eventPagination="callbackAuthPagination" />
                    </div>
                    <!-- [TABLE-2] Page navi END -->
                </div>
                <!-- [TABLE-2] 끝 -->
                <div class="cont-half__upper action-row--mini" id="button-box-ru">
                    <v-btn primary :disabled="authButtonFlag!==true" @click.native="saveAuthItems()" v-if="menuAuth.update">{{$td('button.save', '저장')}}</v-btn>
                </div>
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
                        <v-btn primary @click.native="agree">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>

        <v-layout row justify-center>
            <v-dialog v-model="roleConfirmDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">Confirm</v-card-title>
                    <v-card-text> {{$td('message.delete-confirm', '삭제하시겠습니까?') }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="roleDisagree">{{$td('button.no', '아니요')}}</v-btn>
                        <v-btn primary @click.native="roleAgree">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
        <!-- ============================================================================ -->

        <!-- [DIALOG] RestApi Dialog -->
        <rest-api-dialog
            :showDialog="restApiDialog"
            :mode="restApiDialogMode"
            :targetRestApi="targetRestApi"
            :systemKey="systemKey"
            :formTitle="formTitle"
            @closeDialog="closeRestApiDialog"
            @searchRestApi="searchRestApi"
            @saveRestApi="saveRestApi"
        />
        <!-- [DIALOG] RestApi Auth Dialog -->
        <rest-api-auth-dialog
            :showDialog="restApiAuthDialog"
            :systemKey="systemKey"
            :targetRestApi="targetRestApi"
            :existedRole="allAuthItems"
            @closeDialog="closeRestApiAuthDialog"
            @searchRestApiAuth="searchRestApiAuth(selectedRestApi)"
        />
    </div>
</template>

<script>

    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';
    import CommonPagination from '@/containers/Common/CommonPagination';
    import axios from 'axios';
    import RestApiDialog from './RestApiPopup/RestApiDialog';
    import RestApiAuthDialog from './RestApiPopup/RestApiAuthDialog';

    export default {
        name: 'RestApi',
        components: {
            CommonPageSizeSelector,
            CommonPagination,
            RestApiDialog,
            RestApiAuthDialog,

        },
        computed: {
            formTitle() {
                return this.restApiDialogMode = 'ADD' ? this.$i18n.td('menu.resource-add', 'REST API 추가') : this.$i18n.td('menu.resource-update', 'REST API 수정');
            },
            restApiPages() {
                if (this.restApiPagination.rowsPerPage == null ||
                    this.restApiTotalItems == null
                ) {
                    return 0;
                } else {
                    return Math.ceil(this.restApiTotalItems / this.restApiPagination.rowsPerPage);
                }
            },
            authPages() {
                if (this.authPagination.rowsPerPage == null ||
                    this.authTotalItems == null
                ) {
                    return 0;
                } else {
                    return Math.ceil(this.authTotalItems / this.authPagination.rowsPerPage);
                }
            },
            headers() {
                return (this.menuAuth.create || this.menuAuth.update) ? this.restApiHeaders : this.restApiHeadersWithoutAction;
            }

        },
        data() {
            return {
                contentTitle: {name: 'REST API List', path: '보안', menu: 'REST API'},
                searchText: '',
                searchUseYn: '',
                useYnSearchValues: ['ALL', 'Y', 'N'],
                useYnCombo: [
                    {text: this.$i18n.td('message.all', '전체'), value: ''},
                    {text: this.$i18n.td('message.use-y', '사용'), value: 'Y'},
                    {text: this.$i18n.td('message.use-n', '미사용'), value: 'N'}
                ],
                modifyTitle: this.$i18n.td('button.update', '수정'),

                restApiDialog: false,
                restApiDialogMode: 'ADD',
                targetRestApi: null,
                targetRestApiId: -1,

                restApiAuthDialog: false,

                restApiHeaders: [
                    {text: this.$i18n.td('system.rest-url', 'REST URL'), align: 'center', sortable: false, width: '45%'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, width: '55%'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, width: '80px'},
                    {text: this.$i18n.td('button.update', '수정'), align: 'center', sortable: false, value: 'action', width: '60px'}
                ],
                restApiHeadersWithoutAction: [
                    {text: this.$i18n.td('system.rest-url', 'REST URL'), align: 'center', sortable: false, width: '45%'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, width: '55%'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, width: '80px'},
                ],
                restApiItems: [],
                selectedRestApi: {
                    restApiId: '',
                    restApiUrl: '',
                    systemKey: this.$store.state.loginStore.systemKey,
                    restUrl: '',
                    description: '',
                    useYn: '',
                },
                defaultRestApi: {
                    restApiId: '',
                    restApiUrl: '',
                    systemKey: this.$store.state.loginStore.systemKey,
                    restUrl: '',
                    description: '',
                    useYn: '',
                },
                restApiLoading: false,
                restApiTotalItems: 0,
                restApiPagination: {rowsPerPage: 3, page: 1},

                authHeaders: [
                    {text: this.$i18n.td('message.role-name', '역할명'), align: 'center', sortable: false},
                    {text: 'GET', align: 'center', sortable: false, width: '70px'},
                    {text: 'POST', align: 'center', sortable: false, width: '70px'},
                    {text: 'PUT', align: 'center', sortable: false, width: '70px'},
                    {text: 'DELETE', align: 'center', sortable: false, width: '70px'},
                    {text: 'PATCH', align: 'center', sortable: false, width: '70px'},
                ],

                authItems: [],  // display용
                allAuthItems: [],  // restApiAuthDialog 전달용
                authLoading: false,
                authTotalItems: 0,
                authButtonFlag: false,
                selectedAuth: [],
                authPagination: {rowsPerPage: 3, page: 1, totalItems: 10},

                systemKey: this.$store.state.loginStore.systemKey,
                restApiId: '',

                apiAuthSearch: {
                    restApiId: 0,
                    roleSearchText: ''
                },

                restApiUrl: {
                    search: '/rest/v1/restapi/',
                    delete: '/rest/v1/restapi/delete',
                },
                restUrl: {
                    add: '/rest/v1/restapi/create',
                    update: '/rest/v1/restapi/update',
                    duplicate: '/rest/v1/restapi/duplication',
                },

                authUrl: {
                    search: '/rest/v1/restapiauth/list',
                    update: '/rest/v1/restapiauth/update',
                    delete: '/rest/v1/restapiauth/{{restApiId}}/delete'
                },
                confirmDialog: false,
                roleConfirmDialog: false,
                roleDelete: [],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        mounted() {
            this.searchRestApi();
        },
        methods: {
            searchRestApi() {
                this.restApiLoading = true;
                const {page, rowsPerPage} = this.restApiPagination;
                const url = this.restApiUrl.search;
                let searchUseYn = this.searchUseYn;
                if (searchUseYn === 'ALL') { searchUseYn = ''; }
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        systemKey: this.$store.state.loginStore.systemKey,
                        searchText: this.searchText,
                        searchUseYn: searchUseYn
                    }
                }).then(res => {
                    this.restApiItems = res.data.content;
                    this.restApiTotalItems = res.data.totalElements;
                    this.restApiLoading = false;
                    this.selectedRestApi = this.defaultRestApi;
                    this.authTotalItems = 0;
                    if (this.restApiTotalItems > 0) {
                        this.searchRestApiAuth(this.restApiItems[0]);
                    } else {
                        this.selectedAuth = [];
                        this.authItems = [];
                        this.authLoading = false;
                    }
                });
            },
            callbackRestApiPageSizeSelector(e) {
                this.restApiPagination.rowsPerPage = Number(e);
                this.restApiPagination.page = 1;
                this.searchRestApi();
            },
            callbackRestApiPagination(e) {
                this.restApiPagination.page = Number(e);
                this.searchRestApi();
            },

            callbackAuthPageSizeSelector(e) {
                this.authPagination.rowsPerPage = Number(e);
                this.authPagination.page = 1;
                this.searchRestApiAuth(this.selectedRestApi);
            },
            callbackAuthPagination(e) {
                this.authPagination.page = Number(e);
                this.searchRestApiAuth(this.selectedRestApi);
            },

            deleteRestApi() {
                let url = this.authUrl.delete;
                let targetRestApiId = this.selectedRestApi.restApiId;
                url = url.replace('{{restApiId}}', targetRestApiId);
                for (var i = 0; i < this.allAuthItems.length; i++) {
                    this.roleDelete.push(this.allAuthItems[i].roleId);
                }

                axios.post(url, this.roleDelete)
                .then(() => {
                    let restDel = this.restApiUrl.delete;
                    let targetRestApiId = [this.selectedRestApi.restApiId];
                    // 2. DELETE TB_RESTAPI
                    axios.post(restDel, targetRestApiId)
                    .then(() => {
                        this.searchRestApi();
                        this.selectedRestApi.restApiId = '';
                        this.authItems = [];
                        this.authTotalItems = 0;

                        this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: this.$i18n.td('message.deleted', '삭제되었습니다.'), type: 'success'});
                    })
                    .catch(res => {
                    });
                })
                .catch(res => {
                    this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: '삭제중 오류가 발생했습니다.', type: 'error'});
                });

            },
            updateAuthItems(selected) {
                this.authPagination.page = 1;
                this.searchRestApiAuth(selected);
            },
            searchRestApiAuth(selected) {
                this.authLoading = true;

                let url = this.authUrl.search;
                let {page, rowsPerPage} = this.authPagination;
                this.selectedRestApi = selected;

                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        restApiId: this.selectedRestApi.restApiId,
                        systemKey: this.$store.state.loginStore.systemKey,
                    }
                }).then(res => {
                    this.authItems = res.data.content;
                    this.authTotalItems = res.data.totalElements;
                    this.authButtonFlag = false;
                    this.selectedAuth = [];

                    this.searchRestApiAuthAll();
                    this.authLoading = false;
                }).catch(res => {
                    this.authLoading = false;
                });
            },
            searchRestApiAuthAll() {
                const url = this.authUrl.search;
                const page = 1;
                const rowsPerPage = this.authTotalItems;

                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        restApiId: this.selectedRestApi.restApiId,
                    }
                }).then(res => {
                    this.allAuthItems = res.data.content;
                }).catch(err => {
                });
            },
            saveAuthItems() {
                const url = this.authUrl.update;

                // 서버에서 루프 돌리는 방식으로 수정 필요
                for (let i in this.authItems) {
                    axios.post(url, this.authItems[i]);
                }
                this.authButtonFlag = false;
                this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
            },

            // Dialog 관련 Methods
            openRestApiDialog(item) {
                if (item !== undefined) {
                    this.restApiDialogMode = 'UPDATE';
                    this.targetRestApi = item;
                } else {
                    this.restApiDialogMode = 'ADD';
                }
                this.restApiDialog = true;
            },
            openRestApiAuthDialog() {
                this.restApiAuthDialog = true;
                this.targetRestApi = this.selectedRestApi;
                this.searchRestApiAuthAll();
            },
            closeRestApiDialog() {
                this.restApiDialog = false;
                this.targetRestApi = null;
            },
            closeRestApiAuthDialog() {
                this.restApiAuthDialog = false;
                this.searchRestApiAuth(this.selectedRestApi);
            },
            updateAuthButtonFlag(flag) {
                this.authButtonFlag = flag;
            },
            deleteRestApiAuths() {
                for (var i = 0; i < this.selectedAuth.length; i++) {
                    this.roleDelete.push(this.selectedAuth[i].roleId);
                }
                this.deleteRestApiAuth(this.roleDelete);
            },
            deleteRestApiAuth(auth) {
                let url = this.authUrl.delete;
                let targetRestApiId = this.selectedRestApi.restApiId;
                url = url.replace('{{restApiId}}', targetRestApiId);
                axios.post(url, auth)
                .then(() => {
                    this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: this.$i18n.td('message.deleted', '삭제되었습니다.'), type: 'success'});
                    if (this.selectedRestApi !== null) {
                        this.searchRestApiAuth(this.selectedRestApi);
                    }
                })
                .catch(res => {
                    this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: '삭제중 오류가 발생했습니다.', type: 'error'});
                });
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                this.deleteRestApi();
            },
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            roleDisagree() {
                this.roleConfirmDialog = false;
            },
            roleAgree() {
                this.roleConfirmDialog = false;
                this.deleteRestApiAuths();
            },
            openRoleConfirmDialog() {
                this.roleConfirmDialog = true;
            },
            saveRestApi(restApi) {
                let url;
                if (this.restApiDialogMode == 'ADD') {
                    url = this.restUrl.add;
                    //this.restApi.restApiId=null;
                } else if (this.restApiDialogMode == 'UPDATE') {
                    url = this.restUrl.update;
                }
                axios.post(url, restApi)
                .then(() => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    this.searchRestApi();
                })
                .catch(res => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        type: 'error'
                    });
                });
                this.closeRestApiDialog();
            }
        }
    };
</script>

<style scoped>
    #app #rest-api-page .page-content.full-height {
        height: calc(100% - 174px);
    }

    #app #rest-api-page .cont-half:first-child {
        width: 40%;
    }

    #app #rest-api-page .cont-half:last-child {
        width: 60%;
    }

    #app #rest-api-page .cont-half .table-area {
        height: calc(100% - 50px);
    }

    #app #rest-api-page .cont-half .table__body {
        max-height: calc(100% - 75px);
        overflow: auto;
    }

    #app #rest-api-page #button-box-ru {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding-right: 10px;
        text-align: right;
    }
</style>
<style>
    #app #rest-api-page #rest-list .datatable {
        table-layout: fixed;
    }

    #app #rest-api-page #role-list .table__overflow {
        overflow: hidden;
    }
</style>
