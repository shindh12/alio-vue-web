<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="950px">
            <v-card id="rest-api-auth-dialog">
                <v-card-title>
                    <span class="headline"> {{$td('menu.add-authorization', '권한 추가')}} </span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box">
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex class="xs12 sm12 md12 lg12">
                                <v-text-field :label="$td('message.role-name', '역할명')" v-model.trim="roleSearchText" @keyup="searchRole"
                                              hint="Role Name 또는 Description을 입력하여 Role을 검색 후 Authorization 관리대상을 선택하세요. " maxlength="50"></v-text-field>
                            </v-flex>

                            <v-flex class="xs6 sm6 md6 lg">
                                <h2 class="sub-title">Role List</h2>
                            </v-flex>
                            <v-flex class="xs6 sm6 md6 lg">
                                <h2 class="sub-title">Selected Role</h2>
                            </v-flex>

                            <!-- Left Grid -->
                            <v-flex class="xs6 sm6 md6 lg overflow-area">
                                <div class="table-area fixed-layout">
                                    <div class="table__body">
                                        <v-data-table
                                            :headers="roleHeaders" :items="roleItems" item-key="roleId"
                                            v-model="selectedRole" hide-actions>
                                            <template slot="items" slot-scope="props">
                                                <td class="table__first__checkbox">
                                                    <v-checkbox hide-details v-model="props.selected" :key="props.item.roleId" @click="updateRoleList(props.item)" />
                                                </td>
                                                <td class="text-xs-left"> {{ props.item.roleName }}</td>
                                                <td class="text-xs-left">{{ props.item.description }}</td>
                                                <td class="text-xs-center"> {{ props.item.useYn }}</td>
                                            </template>
                                        </v-data-table>
                                    </div>
                                </div>
                            </v-flex>
                            <!-- Right Grid -->
                            <v-flex class="xs6 sm6 md6 lg">
                                <div class="table-area fixed-layout">
                                    <div class="table__body">
                                        <v-data-table :headers="authHeaders" :items="authItems"
                                                      hide-actions>
                                            <template slot="items" slot-scope="props">
                                                <tr>
                                                    <td class="text-xs-left"> {{ props.item.roleName }}</td>
                                                    <td class="text-xs-center">
                                                        <v-checkbox true-value='A' false-value='D' v-model="props.item.mGet" />
                                                    </td>
                                                    <td class="text-xs-center">
                                                        <v-checkbox true-value='A' false-value='D' v-model="props.item.mPost" />
                                                    </td>
                                                    <td class="text-xs-center">
                                                        <v-checkbox true-value='A' false-value='D' v-model="props.item.mPut" />
                                                    </td>
                                                    <td class="text-xs-center">
                                                        <v-checkbox true-value='A' false-value='D' v-model="props.item.mDelete" />
                                                    </td>
                                                    <td class="text-xs-center">
                                                        <v-checkbox true-value='A' false-value='D' v-model="props.item.mPatch" />
                                                    </td>
                                                </tr>
                                            </template>
                                            <template slot="no-data">
                                                <div align="center"> Please click role in left table to add</div>
                                            </template>
                                        </v-data-table>
                                    </div>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{$td('button.cancel', '취소')}}</v-btn>
                    <v-btn primary @click.native="addRestApiAuth" :disabled="this.authItems.length == 0">{{$td('button.save', '저장')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

</template>

<script>
    import axios from 'axios';

    export default {
        name: 'RestApiAuthDialog',
        props: [
            'showDialog',
            'targetRestApi',
            'systemKey',
            'existedRole'
        ],
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.searchRole();
                } else if (status === false) {
                    setTimeout(() => {
                        this.roleItems = [];
                        this.authItems = [];
                        this.selectedRole = [];
                        this.roleSearchText = '';
                    }, 500);

                }
            }
        },
        data() {
            const METHOD_WIDTH = '56px';
            return {
                authHeaders: [
                    {text: this.$i18n.td('message.role-name', '역할명'), align: 'center', sortable: false},
                    {text: 'GET', align: 'center', sortable: false, width: METHOD_WIDTH},
                    {text: 'POST', align: 'center', sortable: false, width: METHOD_WIDTH},
                    {text: 'PUT', align: 'center', sortable: false, width: METHOD_WIDTH},
                    {text: 'DELETE', align: 'center', sortable: false, width: METHOD_WIDTH},
                    {text: 'PATCH', align: 'center', sortable: false, width: METHOD_WIDTH},
                ],
                authItems: [],
                roleHeaders: [
                    {text: '-', align: 'center', sortable: false, width: '40px'},
                    {text: this.$i18n.td('message.role-name', '역할명'), align: 'center', sortable: false, width: '140px'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, width: '70px'},
                ],
                roleLoading: false,
                roleItems: [],
                roleSearchText: '',
                selectedRole: [],
                roleUrl: {
                    search: '/rest/v1/role',
                },
                authUrl: {
                    add: '/rest/v1/restapiauth/add',
                },
                pagination: {rowsPerPage: 9999999, page: 1},
            };
        },
        methods: {
            closeDialog() {
                this.$emit('closeDialog');
            },
            searchRole: _.debounce(
                function () {
                    let url = this.roleUrl.search;
                    let searchUseYn = 'Y';
                    const {page, rowsPerPage} = this.pagination;

                    this.roleLoading = true;
                    axios.get(url, {
                        params: {
                            page: page - 1,
                            size: rowsPerPage,
                            searchText: this.roleSearchText,
                            searchSystemKey: this.systemKey,
                            searchUseYn: searchUseYn
                        }
                    }).then(res => {
                        let content = res.data.content;
                        // this.selectedRole = [];
                        this.roleItems = new Array();

                        // 이미 Authorization이 등록되어 있는 Role 은 조회되지 않도록 제거
                        for (let i = 0; i < content.length; i++) {
                            let dup = false;
                            for (let j = 0; j < this.existedRole.length; j++) {
                                console.log(content[i]);
                                console.log(content[i].roleId);
                                if (content[i].roleId === this.existedRole[j].roleId) {
                                    dup = true;
                                    break;
                                }
                            }
                            if (dup === false) {
                                this.roleItems.push(content[i]);
                            }
                        }
                        this.roleLoading = false;
                    }).catch(res => {
                        this.$notify({title: 'Search', text: '조회에 실패했습니다 : ' + res, type: 'error'});
                    });
                }
                , 300
            ),
            updateRoleList(item) {
                // 삭제
                for (let i in this.authItems) {
                    if (item.roleId === this.authItems[i].roleId) {
                        this.authItems.splice(i, 1);
                        return;
                    }
                }
                // 추가
                let addItem = {};
                addItem.restApiId = this.targetRestApi.restApiId;
                addItem.roleName = item.roleName;
                addItem.roleId = item.roleId;
                addItem.mGet = 'A';
                addItem.mPost = 'A';
                addItem.mPut = 'A';
                addItem.mDelete = 'A';
                addItem.mPatch = 'A';
                this.authItems.push(addItem);
            },
            addRestApiAuth() {
                let url = this.authUrl.add;
                for (let i in this.authItems) {
                    axios.post(url, this.authItems[i])
                    .then(() => {
                        this.$emit('searchRestApiAuth');
                        this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                        this.closeDialog();
                    });
                }
            },
        }
    };
</script>

<style scoped>
    #app #rest-api-auth-dialog .overflow-area {
        min-height: 200px;
        max-height: 400px;
        overflow: auto;
    }
</style>

<style>
    #app #rest-api-auth-dialog .table__overflow {
        overflow: hidden
    }
</style>

