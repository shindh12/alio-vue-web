<template>
    <div>
        <v-dialog :value="systemUserListDialog" @input="closeDialog" max-width="800px">
            <v-card>
                <!-- Title Area -->
                <v-card-title>
                    <span class="headline">{{ $td('menu.system-user', '시스템 사용자 추가') }}</span>
                </v-card-title>

                <v-card-text>
                    <!-- Search Area -->
                    <!-- [SEARCH] Search area -->
                    <div class="page-searchbox page-searchbox--col2">
                        <!-- [SEARCH] Search items -->
                        <div class="page-searchbox__item-cell">
                            <v-text-field :label="$td('message.user', '사용자')" v-model.trim="searchText" @keyup.enter="searchUser"
                                          :placeholder="$td('message.username', '성명') +'/'+$td('user.id', '아이디')" maxlength="30"></v-text-field>
                        </div>
                        <!-- [SEARCH] button -->
                    </div>
                    <!-- [SEARCH] button -->
                    <div class="page-searchbox-action">
                        <v-btn @click.native="searchUser">{{ $td('button.search', 'Search') }}</v-btn>
                    </div>

                    <!-- Grid Area -->
                    <div class="page-content userlist-grid">
                        <div class="table-area">
                            <!-- [TABLE] Table information(counter, page size, etc) -->
                            <div class="table__info">
                                <div class="table__info__counter">
                                    <!-- <common-page-size-selector :totalCount="totalItems" :pagination="pagination"
                                            @eventPageSizeSelector="callbackPageSizeSelector"/> -->
                                    <span class="table__info__counter__total">
                                    {{$td('message.total', '총')}} <b>{{totalItems}}</b>
                                </span>
                                </div>
                            </div>
                            <!-- [TABLE] Table information(counter, page size, etc) END -->
                            <!-- [TABLE] 본체 -->
                            <div class="table__body">
                                <v-data-table :headers="headers" :items="users"
                                              expand item-key="userId" v-model="selected"
                                              :pagination.sync="pagination" :total-items="totalItems"
                                              hide-actions select-all>
                                    <template slot="items" slot-scope="props">
                                        <td class="table__first__checkbox">
                                            <v-checkbox primary hide-details v-model="props.selected" :key="props.item.userId"></v-checkbox>
                                        </td>
                                        <!-- Login        -->
                                        <!-- Full Name        -->
                                        <td class="text-xs-center">{{ props.item.fullName }}({{ props.item.login }})</td>
                                        <!-- E-Mail -->
                                        <td class="text-xs-center">{{ props.item.email }}</td>
                                        <!-- Join Date        -->
                                        <td class="text-xs-center">{{ props.item.createDate | moment(datePattern()) }}</td>
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
                </v-card-text>
                <!-- Cancel, Save Button -->
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary @click.native="saveDialog">{{$td('button.add', '추가')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPagination from '@/containers/Common/CommonPagination';
    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';

    export default {
        components: {
            axios,
            CommonPagination,
            CommonPageSizeSelector,
        },
        props: [
            'systemUserListDialog',
            'dialogFrom',
            'systemDetail'
        ],
        watch: {
            systemUserListDialog: function () {
                console.info(this.systemUserListDialog);
                this.searchUser();
            },
        },
        data() {
            return {
                url: {
                    searchUser: '/rest/v1/systemuser/user/list', //사용자 조회
                    create: '/rest/v1/systemuser/create/list'     //시스템사용자 추가
                },
                pagination: {rowsPerPage: 8},

                headers: [
                    {
                        text: this.$i18n.td('message.username', '성명') + '(' + this.$i18n.td('user.id', '아이디') + ')'
                        , align: 'center', sortable: false, value: 'fullName'
                    },
                    {text: this.$i18n.td('user.e-mail', '이메일'), align: 'center', sortable: false, value: 'email'},
                    {text: this.$i18n.td('datetime.join', '가입일'), align: 'center', sortable: false, value: 'createDate'}
                ],
                selected: [],
                searchText: '',
                userStatus: 0,
                users: [],
                totalItems: 0,
            };
        },
        mounted() {
            //this.searchUser();
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null) {
                    return 0;
                } else {
                    return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
                }
            }
        },
        methods: {
            //팝업 닫기
            closeDialog() {
                this.selected = [];
                this.searchText = '';
                this.$emit('closeDialog');
            },
            //팝업 적용
            saveDialog() {
                let saveList = [];
                for (var i = 0; i < this.selected.length; i++) {
                    saveList.push({
                        'userId': this.selected[i].userId,
                        'systemKey': this.systemDetail.systemKey
                    });
                }
                const url = this.url.create;
                axios.post(url, saveList).then(res => {
                    console.log(res.data);
                    this.selected = [];
                    this.searchUser();
                    this.$emit('saveDialog');
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                }).catch(e => {
                    this.errors.push(e);
                });

            },

            searchUser() {
                const url = this.url.searchUser;
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchText,
                        userStatus: this.searchStatus,
                        systemKey: this.systemDetail.systemKey
                    }
                }).then(res => {
                    let content = res.data.content;
                    console.info(content);
                    that.totalItems = res.data.totalElements;
                    that.users = content;
                    that.loading = false;
                });
            },
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
            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition != undefined && this.$route.query.searchCondition.page != undefined) {
                    this.pagination.page = this.$route.query.searchCondition.page;
                    this.pagination.rowsPerPage = this.$route.query.searchCondition.size;
                    this.searchText = this.$route.query.searchCondition.searchText;
                }
            }
        }
    };
</script>

<style scoped>
    #app .userlist-grid {
        height: calc(100% - 500px);
        overflow: auto;
        margin-top: 0;
    }
</style>
