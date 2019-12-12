<template>
    <div id="menu-detail">
        <div class="detail-body read-mode-body" v-if="editMode==false &&menuData.defaultName!=undefined">
            <h2 class="sub-title">{{message.menuInfo}}</h2>
            <table class="form-table">
                <tr v-if="menuData.parentKey">
                    <th>{{message.parentkey}}</th>
                    <td>{{menuData.parentKey}}</td>
                </tr>
                <tr>
                    <th>{{message.menukey}}</th>
                    <td>{{menuData.menuKey}}</td>
                </tr>
                <tr>
                    <th>{{message.menuname}}</th>
                    <td>{{menuData.defaultName}}</td>
                </tr>
                <tr>
                    <th>i18N</th>
                    <td>{{$td(menuData.messageGroup+'.'+menuData.messageCode, menuData.defaultName)}}({{menuData.messageGroup}}.{{menuData.messageCode}})</td>
                </tr>
                <tr v-if="menuData.menuUrl">
                    <th>URL</th>
                    <td>{{menuData.menuUrl}}</td>
                </tr>
                <tr>
                    <th>{{message.useyn}}</th>
                    <td>
                        {{ menuData.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}
                    </td>
                </tr>
            </table>

            <h2 class="sub-title auth-info-title">{{message.authInfo}} <span class="totalSpan">총 {{authData.length}}</span></h2>

            <div class="detailAuth">
                <div class="table-area">
                    <div class="table__body">
                        <v-data-table :headers="headers" :items="authData"
                                      hide-actions v-model="selected" item-key="roleId">
                            <template slot="items" slot-scope="props">
                                <td class="text-xs-left">{{ props.item.roleName }}</td>
                                <td class="text-xs-center">
                                    <v-checkbox v-if="props.item.aRead==='Y'" disabled input-value="true"></v-checkbox>
                                </td>
                                <td class="text-xs-center">
                                    <v-checkbox v-if="props.item.aCreate==='Y'" disabled input-value="true"></v-checkbox>
                                </td>
                                <td class="text-xs-center">
                                    <v-checkbox v-if="props.item.aUpdate==='Y'" disabled input-value="true"></v-checkbox>
                                </td>
                                <td class="text-xs-center">
                                    <v-checkbox v-if="props.item.aDelete==='Y'" disabled input-value="true"></v-checkbox>
                                </td>
                            </template>
                        </v-data-table>
                    </div>
                </div>
            </div>

            <div class="action-row--mini detail-buttons">
                <!--<v-btn :disabled="menuData.parentKey=='' || menuData.isLeaf=='N' " @click.native="deleteMenu" v-if="menuAuth.delete">{{message.delete}}</v-btn>-->
                <v-btn primary @click.native="makeEditable" v-if="menuAuth.update">{{message.update}}</v-btn>
            </div>
        </div>


        <div class="detail-body edit-mode-body" v-if="editMode==true && menuData.defaultName!=undefined">
            <h2 class="sub-title">{{message.menuInfo}}</h2>
            <v-form ref=form v-model="isValid" lazy-validation>
                <table class="form-table">
                    <tr v-if="menuData.parentKey">
                        <th>{{message.parentkey}}</th>
                        <td class="read-field">{{menuData.parentKey}}</td>
                    </tr>
                    <tr>
                        <th>{{message.menukey}}</th>
                        <td class="read-field">{{menuData.menuKey}}</td>
                    </tr>
                    <tr>
                        <th class="required">{{message.menuname}}</th>
                        <td>
                            <v-text-field v-model.trim="menuData.defaultName" :rules="[rules.required, rules.menuName]" maxlength="100"></v-text-field>
                        </td>
                    </tr>
                    <tr>
                        <th>i18N</th>
                        <td class="read-field">{{$td(menuData.messageGroup+'.'+menuData.messageCode, menuData.defaultName)}}
                            <v-btn @click.native="changei18N">{{ $td('menu.message-mapping', 'Message Mapping') }}</v-btn>
                        </td>
                    </tr>
                    <tr>
                        <th class="required">URL</th>
                        <td>
                            <v-text-field v-model.trim="menuData.menuUrl" :rules="[rules.required, rules.rest, rules.nospace]" maxlength="200"></v-text-field>
                        </td>
                    </tr>
                    <tr>
                        <th>{{message.useyn}}</th>
                        <td>
                            <v-switch class="labelling" true-value='Y' false-value='N' v-model="menuData.useYn"></v-switch>
                            <!-- :label="menuData.useYn=='Y'? message.use : message.nouse" -->
                        </td>
                    </tr>
                </table>
            </v-form>


            <h2 class="sub-title auth-info-title">{{message.authInfo}} <span class="totalSpan">{{$td('message.total', '총')}} {{authData.length}}</span></h2>
            <hr>


            <div class="action-row--mini left-row">
                <v-btn @click.native="addRoles">{{message.addrole}}</v-btn>
                <v-btn :disabled="selected.length <= 0" @click.native="deleteAuth">{{message.delrole}}</v-btn>
            </div>

            <div class="table-area">
                <div class="table__body">
                    <v-data-table :headers="headers" select-all :items.sync="authData"
                                  hide-actions v-model="selected" item-key="roleId">
                        <template slot="items" slot-scope="props">
                            <td class="table__first__checkbox">
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.roleId"></v-checkbox>
                            </td>
                            <td class="text-xs-left">{{ props.item.roleName }}</td>
                            <td class="text-xs-center">
                                <v-checkbox hide-details @change="props.item.aRead=='N' ?  props.item.aCreate=props.item.aUpdate=props.item.aDelete='N' :'' "
                                            v-model="props.item.aRead" true-value='Y' false-value='N'></v-checkbox>
                            </td>
                            <td class="text-xs-center">
                                <v-checkbox hide-details @change="props.item.aRead=='N' && props.item.aCreate=='Y' ? props.item.aRead='Y' : ''" v-model="props.item.aCreate"
                                            true-value='Y' false-value='N'></v-checkbox>
                            </td>
                            <td class="text-xs-center">
                                <v-checkbox hide-details @change="props.item.aRead=='N' && props.item.aUpdate=='Y' ? props.item.aRead='Y' : ''" v-model="props.item.aUpdate"
                                            true-value='Y' false-value='N'></v-checkbox>
                            </td>
                            <td class="text-xs-center">
                                <v-checkbox hide-details @change="props.item.aRead=='N' && props.item.aDelete=='Y' ? props.item.aRead='Y' : ''" v-model="props.item.aDelete"
                                            true-value='Y' false-value='N'></v-checkbox>
                            </td>
                        </template>
                    </v-data-table>
                </div>
            </div>

            <div class="action-row--mini detail-buttons">
                <v-btn @click.native="cancelEdit">{{message.cancel}}</v-btn>
                <v-btn primary @click.native="saveDetail" :disabled="!isValid">{{message.save}}</v-btn>
            </div>


            <!-- Group-Role Dialog Area -->
            <role-picker :title="message.addrole" :showDialog="roleDialog" :exceptRoleList.sync="roleList" @closeDialog="closeRoleDialog"
                         @selectedRole="selectedRole" />
        </div>


        <div v-if="menuData.defaultName==undefined" class="unselected-menu">
            <span> {{message.selectmenu}} </span>
        </div>

        <code-message-dialog :show-dialog="msgDialog" :pSystemKey="searchSystemKey" @closeDialog="closeDialog" @applyDialog="applyDialog"></code-message-dialog>


        <common-confirm
            :confirm-dialog="confirmDialog"
            :title="'Confirm'"
            :message="confirmMessage"
            @agree="agree"
            @disagree="disagree">
        </common-confirm>


        <!-- Dirty check & confirm dialog -->
        <common-dirty-checker
            :beforeTargetArray="dirtyCheck.beforeTarget"
            :currentTargetArray="dirtyCheckCurrentTarget"
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
    import CommonPageSizeSelector from '@/containers/Common/CommonPageSizeSelector';
    import axios from 'axios';
    import RolePicker from '@/containers/User/Role/RolePopup/RolePicker';
    import CodeMessageDialog from '@/containers/System/CodePopup/CodeMessagePopup';
    import CommonConfirm from '@/containers/Common/CommonConfirm';
    import CommonDirtyChecker from '@/containers/Common/CommonDirtyChecker';

    export default {
        name: 'MenuDetail',
        components: {
            RolePicker,
            CodeMessageDialog,
            CommonPageSizeSelector,
            CommonConfirm,
            CommonDirtyChecker,
        },
        props: ['searchSystemKey', 'searchMenuKey', 'refreshDetail'],
        data() {
            return {
                message: {
                    menuInfo: this.$i18n.td('menu-menus.info', '메뉴정보'),
                    parentkey: this.$i18n.td('menu-menus.parent-key', '부모키'),
                    menukey: this.$i18n.td('menu-menus.menu-key', '메뉴키'),
                    menuname: this.$i18n.td('menu-menus.menu-name', '메뉴명'),
                    useyn: this.$i18n.td('message.use-yn', '사용여부'),
                    authInfo: this.$i18n.td('system.auth-info', '권한정보'),
                    delete: this.$i18n.td('button.delete', '삭제'),
                    update: this.$i18n.td('button.update', '수정'),
                    modefy: this.$i18n.td('button.modify', '변경'),
                    use: this.$i18n.td('message.use-y', '사용'),
                    notuse: this.$i18n.td('message.use-n', '미사용'),
                    addrole: this.$i18n.td('menu-menus.add-role', '역할추가'),
                    delrole: this.$i18n.td('menu-menus.del-role', '역할삭제'),
                    cancel: this.$i18n.td('button.cancel', '취소'),
                    save: this.$i18n.td('button.save', '저장'),
                    selectmenu: this.$i18n.td('menu-menus.select-menu', '메뉴를 선택해 주십시오.'),
                },
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    systemKey: (v) => /^[a-zA-Z0-9-_]{4,12}$/.test(v) || this.$i18n.td('validate.systemkey', '4~12자의 영문 대소문자, 숫자, 특수문자(-_)를 사용하십시오.'),
                    menuName: v => /^[a-zA-Z가-힣Z0-9-_]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                    rest: v => /^[a-zA-Z0-9/]{1,200}$/.test(v) || this.$i18n.td('validate.rest', '200자 이내의 영문자, 숫자, 특수문자(/)를 사용하십시오.'),
                },
                editMode: false,
                roleDialog: false,
                msgDialog: false,
                confirmDialog: false,
                confirmMode: '',
                confirmMessage: '',
                isValid: true,
                menuData: {},
                authData: [],
                selected: [],
                deleted: [],
                roleList: [],
                headers: [
                    {text: this.$i18n.td('message.role-name', '역할명'), align: 'center', sortable: false,},
                    {text: this.$i18n.td('system.auth-read', '읽기'), align: 'center', sortable: false,},
                    {text: this.$i18n.td('system.auth-write', '쓰기'), align: 'center', sortable: false,},
                    {text: this.$i18n.td('system.auth-update', '수정'), align: 'center', sortable: false,},
                    {text: this.$i18n.td('system.auth-delete', '삭제'), align: 'center', sortable: false,},
                ],
                authorizes: [this.$i18n.td('message.all', '전체'), this.$i18n.td('system.auth-read', '읽기'), this.$i18n.td('system.auth-write', '쓰기'),
                    this.$i18n.td('system.auth-update', '수정'), this.$i18n.td('system.auth-delete', '삭제')],
                editedItem: [],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },

                /* dirty check & confirm dialog */
                dirtyCheck: {
                    beforeTarget: [],
                    currentTarget: [],
                },
                dirtyCheckConfirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: this.$i18n.td('message.confirm-menu-moving', '작성중인 내용은 저장되지 않습니다. 이동하시겠습니까?'),
                    nextFunction: '',
                    nextUrl: '',
                },
            };
        },
        computed: {
            dirtyCheckCurrentTarget() {
                let target = [];
                for (let i in this.authData) {
                    target.push(Object.assign({}, this.authData[i]));
                }
                target.push(Object.assign({}, this.menuData));
                return target;
            }
        },
        watch: {
            searchMenuKey: function () {
                this.searchMenuDetail();
            },
            refreshDetail: function () {
                this.searchMenuDetail();
            }
        },

        methods: {
            /**
             * Data 조회
             */
            async searchMenuDetail() {
                this.editMode = false;
                if (this.searchSystemKey == '') {
                    return;
                }
                if (this.searchMenuKey == '' || this.searchMenuKey == undefined) {
                    this.menuData = {};
                    return;
                }
                let url = '/rest/v1/menu/' + this.searchSystemKey + '/menu/' + this.searchMenuKey;

                let res = await axios.get(url);
                this.menuData = res.data;
                await this.initAuthData();
                this.setDirtyCheckTarget();
            },

            async initAuthData() {
                let url = '/rest/v1/auth/' + this.searchSystemKey + '/authorities/' + this.searchMenuKey;

                let res = await axios.get(url);
                this.authData = new Array();
                for (var i = 0; i < res.data.length; i++) {
                    let auth = res.data[i];
                    this.authData.push(auth);
                }
            },
            setDirtyCheckTarget() {
                this.dirtyCheck.beforeTarget = [];
                for (let i in this.authData) {
                    this.dirtyCheck.beforeTarget.push(Object.assign({}, this.authData[i]));
                }
                this.dirtyCheck.beforeTarget.push(Object.assign({}, this.menuData));
            },
            clearDirtyCheckTarget() {
                this.dirtyCheck.targetArray = [];
                this.dirtyCheck.targetObject = {};
            },
            cancelEdit() {
                if (this.checkCurrentMenuDirty() === true) { return; }
                this.searchMenuDetail();
                this.editMode = false;
                this.deleted = [];
                this.selected = [];
                this.clearDirtyCheckTarget();
            },
            makeEditable() {
                this.editMode = true;
                this.setDirtyCheckTarget();
            },
            findIndex(auth) {
                for (var i = 0; i < this.authData.length; i++) {
                    if (auth.roleId == this.authData[i]['roleId']) {
                        return i;
                    }
                }
                return -1;
            },
            deleteAuth() {
                this.confirmMessage = this.$i18n.td('menu-menus.del-role-message', '할당된 역할을 삭제하시겠습니까? (저장하기 전에 취소할 수 있습니다.)');
                this.confirmDialog = true;
                this.confirmMode = 'AUTH';
            },
            closeConfirmDialog() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                if (this.confirmMode === 'AUTH') {
                    for (var j = 0; j < this.selected.length; j++) {
                        let index = this.findIndex(this.selected[j]);
                        this.deleted.push(this.selected[j]);
                        this.authData.splice(index, 1);
                    }
                } else {
                    // auth delete
                    let deleteUrl = '/rest/v1/auth/delete';
                    let requests = new Array();
                    for (var i = 0; i < this.authData.length; i++) {
                        requests.push(axios.post(deleteUrl, this.authData[i]));
                    }
                    if (requests.length > 0) {
                        axios.all(requests).then(rest => {
                        }).catch(e => {
                            console.log(e);
                        });
                    }

                    // menu delete
                    let url = '/rest/v1/menu/delete';
                    let that = this;
                    let loading = true;
                    axios.post(url, this.menuData).then(res => {
                        this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: this.$i18n.td('message.deleted', '삭제되었습니다.'), type: 'success'});
                        this.$emit('deleteMenu', this.menuData);
                    }).catch(e => {
                        console.log(e);
                    });
                }
            },
            disagree() {
                this.confirmDialog = false;
            },
            saveDetail() {
                // menu update
                let url = '/rest/v1/menu/update';
                axios.post(url, this.menuData).then(res => {
                    this.$emit('updateDetail', this.menuData);
                }).catch(e => {
                    console.log(e);
                });
                // auth update
                // selected
                let updateUrl = '/rest/v1/auth/update';
                let createUrl = '/rest/v1/auth/create';
                let deleteUrl = '/rest/v1/auth/delete';
                let requests = new Array();
                for (var i = 0; i < this.authData.length; i++) {
                    if (this.authData[i]['mode'] == 'U') {
                        requests.push(axios.post(updateUrl, this.authData[i]));
                    }
                    if (this.authData[i]['mode'] == 'C') {
                        requests.push(axios.post(createUrl, this.authData[i]));
                    }
                }
                for (var i = 0; i < this.deleted.length; i++) {
                    requests.push(axios.post(deleteUrl, this.deleted[i]));
                }

                axios.all(requests).then(rest => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    this.$store.dispatch('setCurrMenuDirty', false);
                    this.cancelEdit();
                }).catch(e => {
                    console.log(e);
                });
            },
            closeRoleDialog() {
                this.roleDialog = false;
            },
            selectedRole(resultRoleList) {
                for (var i = 0; i < resultRoleList.length; i++) {
                    let obj = {
                        menuKey: this.menuData.menuKey
                        , mode: 'C'
                        , roleId: resultRoleList[i].roleId
                        , roleName: resultRoleList[i].roleName
                        , systemKey: this.menuData.systemKey
                        , a1: 'N'
                        , a2: 'N'
                        , a3: 'N'
                        , a4: 'N'
                        , a5: 'N'
                        , aCreate: 'N'
                        , aDelete: 'N'
                        , aRead: 'N'
                        , aUpdate: 'N'
                    };
                    this.authData.push(obj);
                }
                this.roleDialog = false;
            },
            addRoles() {
                this.roleList = [];
                for (var i = 0; i < this.authData.length; i++) {
                    let obj = {
                        roleId: this.authData[i].roleId,
                        roleName: this.authData[i].roleName,
                    };
                    this.roleList.push(obj);
                }
                this.roleDialog = true;
            },
            changei18N() {
                this.msgDialog = true;
            },
            closeDialog() {
                this.msgDialog = false;
            },
            applyDialog(param) {
                this.menuData.messageGroup = param.mGroup;
                this.menuData.messageCode = param.mCode;
                this.menuData.defaultName = param.mMessage;
                this.msgDialog = false;
            },
            deleteMenu() {
                if (this.menuData.parentKey == '') {
                    this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: this.$i18n.td('menu-menus.cannot-del-root', 'Root 메뉴는 삭제할 수 없습니다.'), type: 'error'});
                    return;
                }
                this.confirmMessage = this.$i18n.td('menu-menus.del-menu-message', '메뉴를 삭제하시겠습니까? 삭제된 메뉴는 복구할 수 없습니다.');
                this.confirmDialog = true;
                this.confirmMode = 'MENU';
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
                this.cancelEdit();
                this.closeDirtyCheckConfirmDialog();
            },
        },

        mounted() {
            this.searchMenuDetail();
        },
    };
</script>

<style scoped lang="scss">
    table th {
        text-align: left;
    }

    table td {
        text-align: left;
    }

    .auth-info-title {
        margin-top: 20px;
    }

    .action-row--mini {
        text-align: right;
        margin-top: 10px;
    }

    .action-row--mini.left-row {
        text-align: left;
        margin-top: 0;
        margin-bottom: 10px;
    }

    .totalSpan {
        display: inline-block;
        padding-left: 12px;
        margin-left: 12px;
        height: 14px;
        line-height: 16px;
        vertical-align: baseline;
        font-size: 12px;
        border-left: solid 1px #E1E1E1;
    }

    .authHeader {
        margin-left: 12px;
        margin-right: 12px;
        overflow: auto;
    }

    .detail-body {
        height: calc(100% - 100px);
        overflow: auto;
    }

    #menu-detail {
        height: 100%;
        position: realtive;
    }

    #menu-detail .read-mode-body .form-table td {
        padding-left: 7px;
    }

    #menu-detail .edit-mode-body .form-table td.read-field {
        padding-left: 7px;
    }

    #menu-detail .action-row--mini.detail-buttons {
        position: absolute;
        lefT: 0;
        right: 0;
        bottom: 0;
    }
</style>
<style>
    #app #menu-detail .read-mode-body .detailAuth i.icon {
        color: #666;
    }

    #app #menu-detail .form-table td .btn {
        height: 23px;
        margin-left: 10px;
    }

    #app #menu-detail .form-table td .btn .btn__content {
        height: 21px;
        line-height: 21px;
        padding: 0 9px;
    }
</style>
