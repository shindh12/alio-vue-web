<template>
    <div>
        <page-title></page-title>

        <!-- Search Area -->
        <div>
            <v-card color="white">
                <v-container fluid class="pa-1 mt-3">
                    <!-- Search Condition for User List-->
                    <v-layout row>
                        <v-flex xs3 class="ml-4">
                            <v-text-field name="searchText" label="Login" v-model.trim="searchText" @keyup.13="findUserList" maxlength="30"></v-text-field>
                        </v-flex>
                        <v-flex class="mt-2 pt-1 text-md-right">
                            <v-btn color="primary" slot="activator" @click.native="findUserList">{{ $td('button.search', 'Search') }}</v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
        </div>

        <v-container grid-list-md my-0 pa-2>
            <v-layout row wrap>
                <v-flex xs1 class="mt-3 subheading">
                    <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                </v-flex>
                <v-flex xs6>
                    <div class="text-md-right">
                        <v-btn small color="primary" slot="activator" @click="openDialog()">Create</v-btn>
                    </div>
                </v-flex>
                <v-flex xs5>
                    <div class="text-md-right">
                        <v-btn small color="primary" slot="activator" @click="addInstance">Add</v-btn>
                        <v-btn small color="primary" slot="activator" @click="saveInstance" :disabled="!instanceValid">Save</v-btn>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>
        <!-- Create, User List Popup -->

        <user-list-popup :userListDialog="dialog" @closeDialog="closeDialog" @saveDialog="saveDialog" />

        <!-- Main Area -->
        <v-container grid-list-md text-xs-center pa-0 mt-1 mb-3>
            <v-layout row wrap>
                <v-flex xs7 mt-0>
                    <div>
                        <v-card color="white">
                            <!-- Group List -->
                            <div>
                                <v-data-table
                                    :headers="userHeaders"
                                    :items="users"
                                    :pagination.sync="pagination"
                                    :loading="groupLoading"
                                    :total-items="totalItems"
                                    hide-actions
                                    item-key="instanceId"
                                >

                                    <!-- Grid Body -->
                                    <template slot="items" slot-scope="props">
                                        <!-- Login        -->
                                        <td class="text-xs-center" @click="findUserInstance(props.item)">{{ props.item.login }}</td>
                                        <!-- Full Name        -->
                                        <td class="text-xs-center" @click="findUserInstance(props.item)">{{ props.item.fullName }}</td>
                                        <!-- E-Mail -->
                                        <td class="text-xs-center" @click="findUserInstance(props.item)">{{ props.item.email }}</td>
                                        <!-- Join Date        -->
                                        <td class="text-xs-center" @click="findUserInstance(props.item)">{{ props.item.createDate | moment(datePattern()) }}</td>
                                    </template>
                                </v-data-table>

                                <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                            </div>

                        </v-card>
                    </div>
                </v-flex>

                <v-flex xs5 mt-0>
                    <!-- User Instance 상세 정보 -->
                    <v-form ref=form v-model="instanceValid" lazy-validation>
                        <!-- Instance List -->
                        <div>
                            <v-card color="white">
                                <v-data-table
                                    :headers="instanceHeaders"
                                    :items="instances"
                                    :loading="instanceLoading"
                                    hide-actions
                                    item-key="instanceId"
                                >
                                    <!-- Grid Body -->
                                    <template slot="items" slot-scope="props">

                                        <td class="text-xs-center">{{ props.item.flag }}</td>
                                        <!-- Index (Order)-->
                                        <td class="text-xs-center" @click.stop="instanceEditToggle(props.index)">{{ props.index+1 }}</td>

                                        <!-- User IP -->
                                        <td class="text-xs-center" @click.stop="instanceEditToggle(props.index)">
                                            <span v-if="gridUneditableCondition(props.item.flag)">{{ props.item.userIp }}</span>
                                            <v-text-field v-else-if="gridEditableCondition(props.item.flag)"
                                                          name="userIp"
                                                          :rules="[rules.ipRule]"
                                                          v-model="props.item.userIp"
                                                          autofocus
                                                          @click.stop
                                                          @change="changeInstanceFlag(props.index)"
                                                          required></v-text-field>
                                        </td>
                                        <td class="text-xs-center">
                                            <v-btn icon class="mx-0" :disabled="props.item.flag != 'N' && props.item.flag != 'C'" @click="removeRow(props.item)">
                                                <v-icon color="pink">delete</v-icon>
                                            </v-btn>
                                        </td>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </div>
                    </v-form>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>

    /* Conponent Import */
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import axios from 'axios';
    import UserListPopup from './UserListPopup/UserListPopup';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            axios,
            UserListPopup
        },
        data() {
            return {
                searchText: '',
                searchStatus: 0,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    ipRule: (v) => /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(v) || 'User IP must be valid'
                },
                totalItems: 0,
                users: [],
                selectedLogin: '',
                instanceValid: true,
                instances: [],
                errors: [],
                groupLoading: true,
                instanceLoading: true,
                pagination: {rowsPerPage: 10},
                selected: [],
                userHeaders: [
                    {text: 'ID', align: 'center', sortable: false, value: 'login'},
                    {text: this.$i18n.td('message.username', '성명'), align: 'center', sortable: false, value: 'fullName'},
                    {text: 'E-Mail', align: 'center', sortable: false, value: 'email'},
                    {text: 'Join Date', align: 'center', sortable: false, value: 'createDate'}
                ],
                instanceHeaders: [
                    {text: 'Flag', align: 'center', sortable: false, value: 'flag'},
                    {text: '순서', align: 'center', sortable: false, value: 'index'},
                    {text: 'IP', align: 'center', sortable: false, value: 'userIp'},
                    {text: 'Action', align: 'center', sortable: false, value: 'Action'}
                ],
                statusSelect: {text: 'All', value: 0},
                dialog: false,
            };
        },
        watch: {
            dialog(val) {
                val || this.closeDialog();
            }
        },
        computed: {
            pages() {
                return Math.ceil(this.totalItems / this.pagination.rowsPerPage);
            }

        },
        mounted() {
            //유저 목록조회
            this.findUserList();
        },
        methods: {
            callbackPageSizeSelector: function (e) {
                console.log('callbackPageSizeSelector rowsPerPage' + e);
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.findUserList();
            },
            callbackPagination: function (e) {
                console.log('callbackPagination ' + e);
                this.pagination.page = Number(e);
                this.checkAboutSearchCondition();
                this.findUserList();
            },

            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition != undefined && this.$route.query.searchCondition.page != undefined) {
                    this.pagination.page = this.$route.query.searchCondition.page;
                    this.pagination.rowsPerPage = this.$route.query.searchCondition.size;
                    this.searchText = this.$route.query.searchCondition.searchText;
                    this.searchStatus = this.$route.query.searchCondition.userStatus;
                }
            },
            //유저 그룹 목록조회
            findUserList() {
                const url = '/rest/v1/userInstance/list/user';
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                console.log('findUserList');
                axios.get(url, {
                    params: {
                        page: this.pagination.page - 1,
                        size: this.pagination.rowsPerPage,
                        searchText: this.searchText,
                        userStatus: this.searchStatus
                    }
                }).then(response => {
                    let userList = response.data.content;
                    this.users = userList;
                    this.totalItems = response.data.totalElements;
                    this.groupLoading = false;
                    if (userList.length > 0) {
                        this.findUserInstance(userList[0]);
                    }
                })
                .catch(error => {

                });
            },
            // 상세조회
            findUserInstance(user) {
                if (user != null) {
                    this.selectedLogin = user.login;
                }
                axios.get('/rest/v1/userInstance/' + this.selectedLogin)
                .then(response => {
                    response.data.forEach(element => {
                        element.flag = 'N';
                    });
                    this.instances = response.data;
                    this.instanceLoading = false;
                })
                .catch(error => {

                });
            },
            removeRow: function (item) {
                const index = this.instances.indexOf(item);
                this.instances.splice(index, 1);
                axios.post('/rest/v1/userInstance/delete', item)
                .then(response => {

                })
                .catch(error => {

                });
            },

            //User Instance 등록/수정
            saveInstance() {
                let instance = {};
                let requests = new Array();
                let createUrl = '/rest/v1/userInstance/create';
                let updateUrl = '/rest/v1/userInstance/update';

                for (let i = 0; i < this.instances.length; i++) {
                    instance = this.instances[i];
                    if (instance.flag == 'C') {
                        instance.order = i + 1;
                        requests.push(axios.post(createUrl, instance));
                    } else if (instance.flag == 'U' || instance.flag == 'EU') {
                        instance.order = i + 1;
                        requests.push(axios.post(updateUrl, instance));
                    } else if (i + 1 != instance.order) {
                        instance.order = i + 1;
                        requests.push(axios.post(updateUrl, instance));
                    }
                }

                axios.all(requests).then(rest => {
                    this.findUserInstance(this.user);
                }).catch(e => {
                    console.log(e);
                });
            },
            addInstance() {
                let newInstance = {
                    login: this.selectedLogin,
                    flag: 'C',
                    userIp: '',
                    order: ''
                };
                this.instances.push(newInstance);
            },
            instanceEditToggle(index) {
                if (this.instances[index].flag == 'N') {
                    this.instances[index].flag = 'E';
                } else if (this.instances[index].flag == 'E') {
                    this.instances[index].flag = 'N';
                } else if (this.instances[index].flag == 'U') {
                    this.instances[index].flag = 'EU';
                } else if (this.instances[index].flag == 'EU') {
                    this.instances[index].flag = 'U';
                }
            },
            changeInstanceFlag(index) {
                if (this.instances[index].flag == 'E') {
                    this.instances[index].flag = 'EU';
                }
            }, gridEditableCondition(flag) {
                return flag == 'C' || flag == 'E' || flag == 'EU';
            }, gridUneditableCondition(flag) {
                return flag == 'N' || flag == 'U';
            },

            openDialog() {
                //save
                console.log('this.statusSelect~~~~~~~~~~~~~');
                this.dialog = true;
            },

            closeDialog() {
                this.dialog = false;
            },
            saveDialog() {
                this.findUserList();
                this.closeDialog();
            },

        }

    };
</script>

<style scoped>

</style>
