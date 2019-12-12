<template>
    <div id="role-detail-page">

        <!--  Title Area -->
        <page-title :sub="$td('message.role', '역할')+$td('message.detail', '상세')"></page-title>

        <!-- Contents Area -->
        <div class="detail-page__contents">
            <tb-validator class="tb-validator-in-table" form ref="form-valid" v-model="validRole" @click.native="clearValid">
                <table class="detail-page__contents__table">
                    <colgroup>
                        <col />
                        <col />
                        <col />
                        <col />
                    </colgroup>
                    <tr>
                        <th :class="{'required':mode==='UPDATE'}"> {{$td('message.role-name', '역할명')}}</th>
                        <td v-if="mode === 'READ'">
                            {{ roleDetail.roleName }}
                        </td>
                        <td v-if="mode !== 'READ'">
                            <tb-validator :target="roleDetail.roleName"
                                          :rules="[rules.required, rules.roleName,rules.nospace]" lazy>
                                <v-text-field v-model.trim="roleDetail.roleName" maxlength="50"></v-text-field>
                            </tb-validator>
                        </td>
                        <th v-if="mode == 'READ'"> {{$td('message.use-yn', '사용여부')}}</th>
                        <td v-if="mode == 'READ'"> {{ roleDetail.useYn =='Y' ? $td('message.use-y', '사용') :
                            $td('message.use-n', '미사용')}}
                        </td>
                        <td v-if="mode !== 'READ'" colspan=2>
                            <v-switch :label="$td('message.use-yn', '사용여부')" v-model="roleDetail.useYn" true-value="Y"
                                      false-value="N"></v-switch>
                        </td>
                    </tr>
                    <tr>
                        <th :class="{'required':mode==='UPDATE'}">{{ $td('message.description', '설명') }}</th>
                        <td v-if="mode === 'READ'" colspan="3">{{ roleDetail.description}}</td>
                        <td v-if="mode !== 'READ'" colspan="3">
                            <tb-validator :target="roleDetail.description" :rules="[rules.required, rules.max500]" lazy>
                                <v-text-field multi-line v-model="roleDetail.description"
                                              maxlength="500"></v-text-field>
                            </tb-validator>
                        </td>
                    </tr>
                </table>
            </tb-validator>
        </div>

        <!-- Button Area-->
        <div class="action-row--mini ">
            <div class="left">
                <v-btn v-show="mode === 'READ'" @click.native="backToList">{{$td('button.to-list', '목록')}}</v-btn>
            </div>
            <div class="right">
                <v-btn v-show="mode === 'READ'" @click.native="openConfirmDialog('N')"
                       :disabled="roleDetail.useYn==='N'">{{$td('button.unuse-confirm', '미사용')}}
                </v-btn>
                <v-btn v-show="mode === 'READ'" @click.native="changeMode('UPDATE')" primary>{{$td('button.update',
                    '수정')}}
                </v-btn>
                <v-btn v-show="mode === 'UPDATE'" @click.native="cancel">{{$td('button.cancel', '취소')}}</v-btn>
                <v-btn v-show="mode === 'UPDATE'" @click.native="onClickSaveRoleBtn" primary>{{$td('button.save',
                    '저장')}}
                </v-btn>
            </div>
        </div>


        <!--  -->
        <div class="page-content full-height">
            <div class="cont-half">
                <h2 class="sub-title">{{$td('menu-regist.user-info', '사용자정보')}}</h2>

                <div class="table-area table-area--left-fit">
                    <!-- [TABLE] Table information(counter, page size, etc) -->
                    <div class="table__info">
                        <!-- [TABLE] Table actions -->
                        <div class="table__action">
                            <div class="table__action__default">
                                <v-btn @click.native="openRoleUserDialog()">{{$td('button.update', '수정')}}</v-btn>
                            </div>
                        </div>
                        <!-- [TABLE] Table actions END -->
                        <div class="table__info__counter">
                            <common-page-size-selector :totalCount="totalItems" :pagination="pagination"
                                                       @eventPageSizeSelector="callbackPageSizeSelector" />
                        </div>
                    </div>
                    <!-- [TABLE] Table information(counter, page size, etc) END -->

                    <!-- [TABLE] 본체 -->
                    <div class="table__body fixed-layout">
                        <v-data-table :headers="userHeaders" :items="users" item-key="login"
                                      :pagination.sync="pagination" :loading="isLoading" :total-items="totalItems"
                                      hide-actions>
                            <template slot="items" slot-scope="props">
                                <!-- Login        -->
                                <td class="text-xs-left ellipsis">{{ props.item.login }}</td>
                                <!-- Full Name        -->
                                <td class="text-xs-left ellipsis">{{ props.item.fullName }}</td>
                                <!-- E-Mail -->
                                <td class="text-xs-left ellipsis">{{ props.item.email }}</td>
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


            <div class="cont-half">
                <h2 class="sub-title">{{$td('system.auth-info', '권한정보')}}</h2>

                <div class="tree-content">
                    <div class="tree-header">
                        <div class="tree-head-info">{{$td('menu-menus.menu-name', '메뉴명')}}</div>
                        <div class="tree-head-checker">
                            <div class="tree-head-checker__group">
                                <div class="tree-head-role">{{$td('system.auth', '권한')}}</div>
                            </div>
                            <div class="tree-head-checker__items">
                                <div class="tree-head-ck">{{$td('system.auth-read', '읽기')}}</div>
                                <div class="tree-head-ck">{{$td('system.auth-write', '쓰기')}}</div>
                                <div class="tree-head-ck">{{$td('system.auth-update', '수정')}}</div>
                                <div class="tree-head-ck">{{$td('system.auth-delete', '삭제')}}</div>
                            </div>
                        </div>
                    </div>
                    <div v-for="tobj of treeData" class="tree-body">
                        <tree-obj :data='tobj'></tree-obj>
                    </div>
                    <div class="empty-tree" v-if="!isLoading && (!treeData || treeData.length === 0)">
                        "Empty!!", "Data!!"
                    </div>
                </div>
                <div class="action-row--mini my-action">
                    <v-btn primary @click.native="saveTree()">{{$td('system.auth-info', '권한정보')}} {{$td('button.save', '저장')}}
                    </v-btn>
                </div>
            </div>
        </div>


        <!-- [MODAL] Role-User Dialog -->
        <role-user-dialog
            :show-dialog="roleUserDialog"
            :target-role="roleDetail"
            @closeDialog="closeRoleUserDialog"
        />

        <!-- [MODAL] Common-confirm Dialog -->
        <common-confirm
            :confirm-dialog="confirmDialog"
            :title="'Confirm'"
            :message="confirmMessage"
            @agree="agree"
            @disagree="disagree"
        />

        <!-- [No display] Menu Tree Dirty Checker -->
        <common-dirty-checker
            :beforeTargetObject="dirtyCheckBeforeTarget"
            :currentTargetObject="treeData[0]"
        />
        <common-confirm
            :confirm-dialog="dirtyCheckConfirmDialog.showDialog"
            :title="dirtyCheckConfirmDialog.title"
            :message="dirtyCheckConfirmDialog.message"
            @agree="executeMovingFunction"
            @disagree="closeDirtyCheckConfirmDialog"
        />


    </div>
</template>

<script>
    import axios from 'axios';
    import treeObj from './Authorization/AuthTree';
    import RoleUserDialog from '@/containers/User/RolePopup/RoleUserDialog';

    import CommonConfirm from '../Common/CommonConfirm';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import CommonDirtyChecker from '@/containers/Common/CommonDirtyChecker';

    export default {
        components: {
            RoleUserDialog,
            CommonPagination,
            CommonPageSizeSelector,
            CommonConfirm,
            CommonDirtyChecker,
            'tree-obj': treeObj
        },
        data() {
            return {
                validRole: false,
                dialog: false,
                confirmDialog: false,
                confirmMessage: '',
                useYNValue: '',
                isLoading: false,
                isAdmin: true,
                roleUserDialog: false,
                mode: 'READ',
                roleDetail: {
                    roleId: 0, useYn: 0, roleName: '', description: ''
                },
                roleDetailBefore: {},
                roleId: 0,
                userStatus: {text: '', code: 0},
                statusValues: [{text: 'Y'}, {text: 'N'}],
                treeData: [],
                userHeaders: [
                    {
                        text: this.$i18n.td('user.id', '아이디'),
                        align: 'center',
                        sortable: false,
                        value: 'login',
                        width: '100px'
                    },
                    {
                        text: this.$i18n.td('message.username', '성명'),
                        align: 'center',
                        sortable: false,
                        value: 'fullName',
                        width: '100px'
                    },
                    {text: this.$i18n.td('user.e-mail', '이메일'), align: 'center', sortable: false, value: 'email'},
                ],
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    max50: v => v.length <= 50 || this.$i18n.td('message.max-input', '최대 입력 길이는 50자 입니다.', ['50']),
                    max500: v => v.length <= 500 || this.$i18n.td('message.max-input', '최대 입력 길이는 500자 입니다.', ['500']),
                    roleName: v => /^[a-zA-Z0-9_.]{4,50}$/.test(v) || this.$i18n.td('validate.role-name', '4~50자의 영문 대문자, 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                totalItems: 0,
                pagination: {rowsPerPage: 15},
                users: [],

                /* for Dirty Checker & Dialog */
                dirtyCheckBeforeTarget: {},
                dirtyCheckConfirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: this.$i18n.td('message.confirm-menu-moving', '작성중인 내용은 저장되지 않습니다. 이동하시겠습니까?'),
                    nextFunction: '',
                    nextUrl: '',
                },
            };
        },

        mounted() {
            this.roleDetail = this.$route.query;
            this.roleId = this.roleDetail.roleId;
            this.search();
        },
        computed: {
            pages() {
                return Math.ceil(this.totalItems / this.pagination.rowsPerPage);
            },
        },
        methods: {
            search() {
                const url = '/rest/v1/role/' + this.roleId;
                var that = this;
                this.isLoading = true;
                axios.get(url).then(res => {
                    that.roleDetail = res.data;
                    this.roleDetailBefore = Object.assign({}, this.roleDetail);

                    that.searchMenu();
                    that.findUserList();
                }).catch(e => {
                    that.isLoading = false;
                    this.errors.push(e);
                });
            },
            changeMode(mode) {
                this.mode = mode;
            },
            cancel() {
                this.search();
                this.changeMode('READ');
            },
            backToList() {
                if (this.checkCurrentMenuDirty() === true) { return; }
                this.setCurrMenuDirty(false);
                this.$router.push({
                    path: '/user/role',
                    query: this.$route.query
                });
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                const url = '/rest/v1/role/' + this.roleId + '/unuse';
                var that = this;
                axios.post(url).then(() => {
                    this.$notify({
                        title: this.$i18n.td('button.unuse-confirm', '미사용'),
                        text: this.$i18n.td('message.unused', '미사용 역할로 변경되었습니다.'),
                        type: 'success'
                    });
                    //that.backToList()
                    this.search();
                }).catch(() => {
                    this.$notify({
                        title: this.$i18n.td('button.unuse-confirm', '미사용'),
                        text: this.$i18n.td('message.unused-fail', '미사용 역할로 변경하는데 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
            openConfirmDialog(useYn) {
                this.confirmDialog = true;
                if (useYn == 'Y') {
                    this.confirmMessage = this.$i18n.td('message.use-confirm', '사용으로 변경하시겠습니까?');
                } else {
                    this.confirmMessage = this.$i18n.td('message.unuse-confirm', '미사용으로 변경하시겠습니까?');
                }
            },
            modifyAuthCode() {
                this.dialog = true;
            },
            closeAuthCodeDialog() {
                this.dialog = false;
            },

            onClickSaveRoleBtn() {
                // step 1. check validation
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return;
                }
                // step 2. check role name that has been created or not
                if (this.roleDetail.roleName !== this.roleDetailBefore.roleName) {
                    let url = '/rest/v1/role/{systemKey}/{roleName}';
                    url = url.replace('{systemKey}', this.roleDetail.systemKey);
                    url = url.replace('{roleName}', this.roleDetail.roleName);
                    axios.get(url)
                    .then(res => {
                        if (res.data.roleId !== undefined) {
                            this.$notify({
                                title: this.$i18n.td('button.save', '저장'),
                                text: this.$i18n.td('menu-role.duplicated-role', '이미 등록된 역할명입니다.'),
                                type: 'error'
                            });
                        } else {
                            // step 2. save role
                            this.updateUser();
                        }
                    });
                } else {
                    // step 2. save role
                    this.updateUser();
                }
            },
            clearValid() {
                this.$refs['form-valid'].clear();
            },

            updateUser() {
                let url = 'rest/v1/role/update';
                axios.post(url, this.roleDetail)
                .then(() => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.mode = 'READ';
                })
                .catch(() => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
            searchMenu() {
                this.treeData = [];
                let url = '/rest/v1/auth/' + this.$store.state.loginStore.systemKey + '/role/' + this.roleId;

                axios.get(url).then(res => {
                    var rtnArr = [];
                    convertTree(res.data[0]);
                    this.treeData = res.data;

                    function convertTree(td) {
                        td.updateYn = 'N';
                        if (!td.children) {
                            return;
                        }
                        for (var i = 0, ii = td.children.length; i < ii; i++) {
                            td.children[i].parent = td;
                            convertTree(td.children[i]);
                        }
                    }

                    this.isLoading = false;
                    this.setDirtyCheckTarget();
                });
            },
            saveTree() {
                var rtnArr = [];
                var requests = [];
                convertResult(this.treeData[0], this.roleDetail.roleId);
                let updateUrl = '/rest/v1/auth/update';
                for (let i = 0; i < rtnArr.length; i++) {
                    requests.push(axios.post(updateUrl, rtnArr[i]));
                }
                axios.all(requests).then(rest => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.setCurrMenuDirty(false);
                    this.setDirtyCheckTarget();
                }).catch(e => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: '저장중에 에러가 발생했습니다.', type: 'error'});
                });

                function nvl(obj) {
                    if (obj == null) {
                        return 'N';
                    } else {
                        return obj;
                    }
                }

                function convertResult(td, roleId) {
                    if (td.updateYn == 'Y') {
                        rtnArr.push({
                            systemKey: td.systemKey,
                            menuKey: td.menuKey,
                            roleId: roleId,
                            aRead: nvl(td.aRead),
                            aCreate: nvl(td.aCreate),
                            aUpdate: nvl(td.aUpdate),
                            aDelete: nvl(td.aDelete),
                        });
                    }
                    if (!td.children) {
                        return;
                    }
                    for (var i = 0, ii = td.children.length; i < ii; i++) {
                        td.children[i].parent = td;
                        convertResult(td.children[i], roleId);
                    }
                }
            },
            setDirtyCheckTarget() {
                this.dirtyCheckBeforeTarget = Object.assign({}, this.treeData[0]);
            },
            setCurrMenuDirty(value) {
                this.$store.dispatch('setCurrMenuDirty', value);
            },
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                // this.checkAboutSearchCondition()
                this.findUserList();
            },
            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                // this.checkAboutSearchCondition()
                this.findUserList();
            },

            // 유저 그룹 목록조회
            findUserList() {
                const url = '/rest/v1/role/' + this.roleId + '/user/list';
                axios.get(url, {
                    params: {
                        page: this.pagination.page - 1,
                        size: this.pagination.rowsPerPage,
                        systemKey: this.roleDetail.systemKey
                    }
                }).then(response => {
                    let userList = response.data.content;
                    this.users = userList;
                    this.totalItems = response.data.totalElements;
                    that.isLoading = false;
                })
                .catch(error => {
                });
            },
            openRoleUserDialog() {
                this.roleUserDialog = true;
            },
            closeRoleUserDialog() {
                this.roleUserDialog = false;
                this.findUserList();
            },
            /* dirty check */
            openDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = true;
            },
            closeDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = false;
            },
            checkCurrentMenuDirty() {
                if (this.$store.state.menuStore.currMenuDirty === true) {
                    this.openDirtyCheckConfirmDialog();
                    return true;
                } else {
                    return false;
                }
            },
            executeMovingFunction() {
                this.$store.dispatch('setCurrMenuDirty', false);
                this.backToList();
                this.closeDirtyCheckConfirmDialog();
            },

        }
    };
</script>

<style scoped>
    .action-row--mini {
        margin-top: 20px;
    }

    #app .page-content {
        height: calc(100% - 196px);
    }

    #app #role-detail-page .cont-half:first-child {
        width: 40%;
    }

    #app #role-detail-page .cont-half:last-child {
        width: 60%;
    }

    /* [TREE] TREEEEEEEEEEE!*/
    #app #role-detail-page .tree-content {
        width: 100%;
        height: calc(100% - 115px);
        border-bottom: 1px solid #888;
        margin-top: 24px;
    }

    /* [TREE] TRE... HED!!*/
    #app #role-detail-page .tree-header {
        height: 68px;
        position: relative;
        border-bottom: 1px solid #CCC;
        background: #F7F7F7;
        color: #000;
        font-weight: bold;
        position: relative;
        border-top: 1px solid #888;
        width: calc(100% - 18px)
    }

    #app #role-detail-page .tree-head-info,
    #app #role-detail-page .tree-head-checker {
        display: inline-block;
        text-align: center;
    }

    #app #role-detail-page .tree-head-info {
        width: calc(100% - 280px);
        height: 68px;
        line-height: 68px;
    }

    #app #role-detail-page .tree-head-checker {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
    }

    #app #role-detail-page .tree-head-checker__group,
    #app #role-detail-page .tree-head-checker__items {
        height: 34px;
        font-size: 0;
        display: block;
    }

    #app #role-detail-page .tree-head-role {
        font-size: 12px;
        line-height: 34px;
        position: relative;
    }

    #app #role-detail-page .tree-head-role:before {
        content: ' ';
        position: absolute;
        bottom: 0;
        left: 5px;
        right: 5px;
        background: #CCC;
        height: 1px;
    }

    #app #role-detail-page .tree-head-ck {
        width: 70px;
        height: 34px;
        line-height: 34px;
        display: inline-block;
        font-size: 12px
    }

    /* [TREE] TREE CONTENT ->> "<TREE-OBJ>" */
    #app #role-detail-page .tree-body {
        height: calc(100% - 68px);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    /* [ㅖㅁㅎㄸ] 뻐뜬 */
    #app #role-detail-page .my-action {
        text-align: right;
    }

    .empty-tree {
        text-align: center;
        padding: 20px;
        font-size: 24px;
        border-top: 1px solid #AAA;
        border-bottom: 1px solid #AAA;
    }


</style>

<style lang="scss">
    @import "styles/mixins.scss";

    #app #role-detail-page .detail-page__contents__table .input-group--selection-controls {
        @include override-vuetify;
        @include labeled-textfield(120px);
    }
</style>
