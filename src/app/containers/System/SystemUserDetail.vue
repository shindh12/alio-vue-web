<template>
    <div id="system-detail-page">
        <page-title :sub="title"></page-title>


        <!-- [CONTENT] System Info -->
        <div class="detail-page__contents">
            <tb-validator class="tb-validator-in-table" form v-model="validSystem" ref="form-valid" @click.native="clearValid('form-valid')">
                <table class="detail-page__contents__table">
                    <tr>
                        <th>{{$td('system.key', '시스템키')}}</th>
                        <td>{{ systemDetail.systemKey }}</td>
                        <th :class="{'required':systemDetailMode==='UPDATE'}">{{$td('system.auth-code', '보안코드')}}</th>
                        <td v-if="systemDetailMode === 'READ'">
                            {{ systemDetail.authCode }}
                        </td>
                        <td v-if="systemDetailMode !== 'READ'">
                            <tb-validator :target="updSystem.authCode" :rules="[rules.required, rules.nospace]" lazy>
                                <v-text-field v-model.trim="updSystem.authCode" type="text" required maxlength="30" />
                            </tb-validator>
                        </td>
                    </tr>
                    <tr>
                        <th :class="{'required':systemDetailMode==='UPDATE'}">{{$td('system.name', '시스템명')}}</th>
                        <td v-if="systemDetailMode === 'READ'">
                            {{ systemDetail.systemName }}
                        </td>
                        <td v-if="systemDetailMode !== 'READ'">
                            <tb-validator :target="updSystem.systemName" :rules="[rules.required, rules.systemName]" lazy>
                                <v-text-field v-model.trim="updSystem.systemName" maxlength="50" />
                            </tb-validator>
                        </td>

                        <th>{{$td('message.use-yn', '사용여부')}}</th>
                        <td v-if="systemDetailMode === 'READ' && systemDetail.useYn === 'Y'">
                            {{ $td('message.use-y', '사용') }}
                        </td>
                        <td v-if="systemDetailMode === 'READ' && systemDetail.useYn === 'N'">
                            {{ $td('message.use-n', '미사용') }}
                        </td>
                        <td v-if="systemDetailMode !== 'READ'">
                            <v-select id="system-useable" :items="statusValues" v-model="updSystem.useYn" item-value="value"></v-select>
                        </td>
                    </tr>
                    <tr>
                        <th>{{$td('message.description', '설명')}}</th>
                        <td v-if="systemDetailMode === 'READ'" colspan="3">{{ systemDetail.description}}</td>
                        <td v-if="systemDetailMode !== 'READ'" colspan="3">
                            <v-text-field multi-line v-model.trim="updSystem.description" maxlength="500"></v-text-field>
                        </td>
                    </tr>
                </table>
            </tb-validator>
        </div>
        <!-- [CONTENT] System Info -->
        <!-- [CONTENT] System detail action row -->
        <div class="action-row--mini">
            <div class="">
                <v-btn v-show="systemDetailMode === 'READ'" @click.native="backToList">{{$td('button.tolist', '목록')}}</v-btn>
            </div>
            <div class="right">
                <v-btn primary v-if="menuAuth.update" v-show="systemDetailMode === 'READ'" @click.native="changeMode('UPDATE')">{{$td('button.update', '수정')}}</v-btn>
                <v-btn v-show="systemDetailMode === 'UPDATE'" @click.native="changeMode('READ')">{{$td('button.cancel', '취소')}}</v-btn>
                <v-btn primary v-if="menuAuth.update" v-show="systemDetailMode === 'UPDATE'" @click.native="saveSystem('form-valid')" :disabled="!updateValid">{{$td('button.save',
                    '저장')}}
                </v-btn>
            </div>
        </div>
        <!-- [CONTENT] System detail action row END -->


        <!-- [CONTENT] Content area -->
        <div class="page-content full-height">
            <div class="cont-half">
                <h2 class="sub-title">{{ $td('menu-system-user.system-instance-list', '시스템 인스턴스 목록') }}</h2>
                <!-- [TABLE] ㅇㅇ area -->
                <v-form ref=form v-model="instanceValid" lazy-validation>
                    <!-- [TABLE] ㅇㅇ area -->
                    <div class="table-area">
                        <div class="table__info">
                            <!-- [TABLE] Table actions -->
                            <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                                <div class="table__action__default">
                                    <v-btn class="btn-add" v-if="menuAuth.create" @click.native="openInstanceDialog('ADD')">{{$td('button.add', '추가')}}</v-btn>
                                </div>
                                <div class="table__action__optional"></div>
                            </div>
                            <!-- [TABLE] Table actions END -->
                        </div>
                        <!-- [TABLE] 본체 -->
                        <div class="table__body fixed-layout" id="system-instance-list">
                            <v-data-table
                                :headers="headers"
                                :items="instances"
                                :loading="instanceLoading"
                                hide-actions
                                item-key="instanceId">
                                <!-- Grid Body -->
                                <template slot="items" slot-scope="props">
                                    <tr :style=" props.item.flag=='C'? codeCreateStyle: props.item.flag=='U' || props.item.flag=='EU'?codeUpdateStyle:''">
                                        <!-- Index (Order)-->
                                        <td class="text-xs-center">{{ props.index+1 }}</td>
                                        <!-- System IP -->
                                        <td class="text-xs-center">
                                            {{ props.item.systemIp }}
                                        </td>
                                        <!-- Description -->
                                        <td class="text-xs-left">
                                            {{ props.item.description }}
                                        </td>
                                        <!-- Use Yn -->
                                        <td class="text-xs-center" v-if="menuAuth.create || menuAuth.update">
                                            {{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}
                                        </td>

                                        <!-- Action -->
                                        <td class="justify-center layout px-0" v-if="menuAuth.update">
                                            <v-btn icon class="mx-0" @click="openInstanceDialog('UPDATE', props.item)" :title="tooltip.modify">
                                                <v-icon style="color: #2A96FD;">edit</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>
                        <!-- [TABLE] 본체 끝-->
                    </div>
                </v-form>
            </div>
            <div class="cont-half">
                <h2 class="sub-title">{{ $td('menu-system-user.system-user-list', '시스템 사용자 목록') }}</h2>

                <!-- [TABLE] ㅇㅇ area -->
                <div class="table-area table-area--left-fit">
                    <!-- [TABLE] Table information(counter, page size, etc) -->
                    <div class="table__info">
                        <!-- [TABLE] Table actions -->
                        <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                            <div class="table__action__default">
                                <v-btn v-if="menuAuth.create" @click.native="openDialog()">{{ $td('button.add', '추가') }}</v-btn>
                            </div>
                        </div>
                        <!-- [TABLE] Table actions END -->
                        <div class="table__info__counter">
                            <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                        </div>
                    </div>
                    <!-- [TABLE] Table information(counter, page size, etc) END -->


                    <!-- [TABLE] 본체 -->
                    <div class="table__body">
                        <v-data-table
                            :headers="userHeaders" :items="users" item-key="instanceId" id="sysuser-list"
                            :pagination.sync="pagination" :loading="groupLoading" :total-items="totalItems" hide-actions>
                            <template slot="items" slot-scope="props">
                                <!-- Login        -->
                                <!-- Full Name        -->
                                <td class="text-xs-left ellipsis">{{ props.item.fullName }}({{ props.item.login }})</td>
                                <!-- E-Mail -->
                                <td class="text-xs-left ellipsis">{{ props.item.email }}</td>
                                <!-- Join Date        -->
                                <td class="text-xs-center">{{ props.item.createDate | moment(datePattern()) }}</td>
                                <!-- Approval Date        -->
                                <td class="text-xs-center">{{ props.item.approvalDate | moment(datePattern()) }}</td>
                                <td class="text-xs-center hide-overflow">
                                    <v-switch v-model="props.item.approvalYn" true-value="Y" false-value="N" @change="changeApprovalUseYn(props.item)" :disabled="!menuAuth.update"
                                              :title="tooltip.confirm"></v-switch>
                                    <!-- :label="props.item.approvalYn" -->
                                </td>
                                <td class="text-xs-center" v-if="menuAuth.create || menuAuth.update">
                                    <v-btn icon class="mx-0">
                                        <v-btn icon class="mx-0" @click="unassiagn(props.item)" :title="tooltip.delete">
                                            <v-icon style="color: #2A96FD">delete</v-icon>
                                        </v-btn>
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
        </div>
        <!-- Create, User List Popup -->
        <system-instance-cu-dialog :propsSystemInstance="systemInstanceDialog.systemInstance" :showDialog="systemInstanceDialog.showDialog" :mode="systemInstanceDialog.mode"
                                   @closeInstanceDialog="closeInstanceDialog" @saveInstanceDialog="saveInstanceDialog"></system-instance-cu-dialog>
        <system-user-list-popup :systemUserListDialog="dialog" :systemDetail="systemDetail" @closeDialog="closeDialog" @saveDialog="saveDialog" />

        <!-- Main Area -->

        <common-confirm
            :confirm-dialog="confirmDialog"
            :title="'Confirm'"
            :message="$td('message.delete-confirm', '삭제하시겠습니까?')"
            @agree="agreeDelete"
            @disagree="disagreeDelete">
        </common-confirm>

    </div>
</template>

<script>

    /* Conponent Import */
    import CommonConfirm from '../Common/CommonConfirm';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import axios from 'axios';
    import SystemUserListPopup from '../System/SystemPopup/SystemUserListPopup';
    import SystemInstanceCuDialog from '../System/SystemPopup/SystemInstanceCUDialog';

    export default {
        components: {
            CommonConfirm,
            CommonPagination,
            CommonPageSizeSelector,
            axios,
            SystemUserListPopup,
            SystemInstanceCuDialog,
        },
        data() {
            return {
                title: this.$i18n.td('menu.system-management', 'System Management'),
                path: this.$i18n.td('menu.menu-system', 'SYSTEM'),
                validSystem: false,
                instanceValid: true,
                searchText: '',
                searchStatus: 0,
                rules: {
                    required: (v) => !!v || this.$i18n.td('message.required', '필수 입력 항목입니다.'),
                    ipRule: (v) => /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d|\*)(\.|$)){4}$/.test(v) || this.$i18n.td('validate.ip', '유효한 IP를 입력해 주십시오.'),
                    systemKey: (v) => /^[a-zA-Z0-9-_]{4,12}$/.test(v) || this.$i18n.td('validate.systemkey', '4~12자의 영문 대소문자, 숫자, 특수문자(-_)를 사용하십시오.'),
                    systemName: v => /^[a-zA-Z가-힣0-9\s]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                totalItems: 0,
                users: [],
                selectedLogin: '',
                instances: [],
                tempInstance: [],
                errors: [],
                tempUser: {},
                groupLoading: true,
                instanceLoading: true,
                pagination: {rowsPerPage: 15},
                selected: [],
                userHeaders: [
                    {
                        text: this.$i18n.td('message.username', '성명') + '(' + this.$i18n.td('user.id', '아이디') + ')'
                        , align: 'center', sortable: false, value: 'fullName', width: '30%'
                    },
                    {text: this.$i18n.td('user.e-mail', '이메일'), align: 'center', sortable: false, value: 'email', width: '40%'},
                    {text: this.$i18n.td('datetime.join', '가입일'), align: 'center', sortable: false, value: 'createDate', width: '80px'},
                    {text: this.$i18n.td('datetime.approval', '승인일'), align: 'center', sortable: false, value: 'approvalDate', width: '80px'},
                    {text: this.$i18n.td('menu-system-management.approval-yn', '승인여부'), align: 'center', sortable: false, value: 'approvalYn', width: '45px'},
                    {text: this.$i18n.td('button.delete', '삭제'), align: 'center', sortable: false, value: 'delete', width: '45px'}
                ],
                instanceHeaders: [
                    {text: this.$i18n.td('message.order', '순서'), align: 'center', sortable: false, value: 'index', width: '50px'},
                    {text: this.$i18n.td('system.ip', '시스템 IP'), align: 'center', sortable: false, value: 'userIp', width: '140px'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, value: 'description'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, value: 'useYn', width: '60px'},
                    {text: this.$i18n.td('button.update', '수정'), align: 'center', sortable: false, value: 'modify', width: '60px'},
                ],

                statusSelect: {text: 'All', value: 0},
                dialog: false,
                instanceDialog: false,

                systemInstanceDialog: {
                    showDialog: false,
                    mode: 'ADD',
                    systemInstance: {},
                },
                dummyIndex: -1,

                systemDetail: {systemKey: '', authCode: ''},
                updSystem: {authCode: '', systemName: '', description: '', useYn: ''},
                statusValues: [
                    {text: this.$i18n.td('message.use-y', '사용'), value: 'Y'},
                    {text: this.$i18n.td('message.use-n', '미사용'), value: 'N'}
                ],
                systemDetailMode: 'READ',
                codeUpdateStyle: {'background-color': 'antiquewhite'},
                codeCreateStyle: {'background-color': 'honeydew'},
                confirmDialog: false,
                delIpItem: {},
                updateValid: true,
                tooltip: {
                    modify: this.$i18n.td('button.update', '수정'),
                    delete: this.$i18n.td('button.delete', '삭제'),
                    confirm: this.$i18n.td('menu-system-management.approval-yn', '승인여부'),
                },

                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
                systemInstance: {
                    instanceId: '',
                    flag: '',
                    order: '',
                    systemIp: '',
                    description: '',
                    useYn: '',
                    systemKey: ''
                },
                editMode: false,
            };
        },
        watch: {
            dialog(val) {
                val || this.closeDialog();
            },
            instanceDialog(val) {
                val || this.closeInstanceDialog();
            }
        },
        computed: {
            pages() {
                return Math.ceil(this.totalItems / this.pagination.rowsPerPage);
            },
            isDisabledSave() {
                var that = this;
                var inst = this.instances;
                var b = false;

                // 각 행 확인 => N이 아닌것이 있으면 disabled true
                for (var i = 0; i < inst.length; i++) {
                    if (inst[i].flag == 'C') {
                        b = true;
                    }
                }
                for (var i = 0; i < this.tempInstance.length; i++) {
                    if (this.instances[i].systemIp != this.tempInstance[i].systemIp || this.instances[i].description != this.tempInstance[i].description) {
                        b = true;
                    }
                }

                // N이 아닌것이 있으면 valid 진행
                if (b) {
                    b = that.instanceValid;
                }
                return !b;
            },
            headers() {
                return (this.menuAuth.create || this.menuAuth.update) ? this.instanceHeaders : this.instanceHeadersWithoutAction;
            }
        },
        mounted() {
            this.systemDetail = this.$route.query;
            this.findSystem();
            this.findUserInstance();
        },
        methods: {
            copySystem(ori, trg) {
                trg.authCode = ori.authCode;
                trg.systemName = ori.systemName;
                trg.description = ori.description;
                trg.useYn = ori.useYn;
            },
            async saveSystem(refName) {
                // step 1. check validatation
                if (await this.validateData(refName) === false) {
                    return;
                }
                // step 2. save system
                var sys = {};
                this.copySystem(this.updSystem, sys);
                sys.systemKey = this.systemDetail.systemKey;
                const url = '/rest/v1/system/update';
                axios.post(url, sys).then(res => {
                    this.copySystem(sys, this.systemDetail);
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.changeMode('READ');
                    this.instanceValid = false;
                }).catch(e => {
                    console.error(e);
                    this.$notify({
                        title: this.$i18n.td('message.fail', '실패'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.') + (e.response.data.message || e.response.data.error),
                        type: 'error'
                    });
                });
            },
            changeMode(mode) {
                this.systemDetailMode = mode;
            },
            backToList() {
                this.$router.push({
                    path: '/system/systemList',
                    query: this.$route.query,
                });
            },
            validateData(refName) {
                if (!this.$refs[refName].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
            clearValid(refName) {
                this.$refs[refName].clear();
            },
            findSystem() {
                var me = this, sysKey = this.systemDetail.systemKey;
                axios.get('/rest/v1/system/' + sysKey
                ).then(function (res) {
                    me.systemDetail = res.data;
                    me.copySystem(me.systemDetail, me.updSystem);
                    me.findUserList();
                }, function (e) {
                    me.$notify({
                        title: this.$i18n.td('menu-system-user.system-detail', '시스템 상세'),
                        text: this.$i18n.td('message.search-failed', '조회에 실패했습니다.') + (e.response.data.message || e.response.data.error),
                        type: 'error'
                    });
                }).catch(function (e) {
                    me.$notify({
                        title: this.$i18n.td('menu-system-user.system-detail', '시스템 상세'),
                        text: this.$i18n.td('message.search-failed', '조회에 실패했습니다.') + (e.message),
                        type: 'warn'
                    });
                });
            },
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.findUserList();
            },
            callbackPagination: function (e) {
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
                if (!this.systemDetail.systemKey) {
                    console.log('findUserList! Error!');
                    return;
                }
                const url = '/rest/v1/systemuser/list';
                axios.get(url, {
                    params: {
                        page: this.pagination.page - 1,
                        size: this.pagination.rowsPerPage,
                        searchText: this.searchText,
                        userStatus: this.searchStatus,
                        systemKey: this.systemDetail.systemKey
                    }
                }).then(response => {
                    let userList = response.data.content;
                    this.users = userList;
                    this.totalItems = response.data.totalElements;
                    this.groupLoading = false;
                })
                .catch(error => {

                });
            },
            // 상세조회
            findUserInstance() {
                axios.get('/rest/v1/system/' + this.systemDetail.systemKey + '/detail')
                .then(response => {
                    response.data.content.forEach(element => {
                        element.flag = 'N';
                    });
                    this.instances = response.data.content;
                    this.tempInstance = [];
                    for (var i = 0; i < this.instances.length; i++) {
                        this.tempInstance.push(Object.assign({}, this.instances[i]));
                    }
                    this.instanceLoading = false;
                })
                .catch(error => {

                });
            },
            agreeDelete() {
                this.confirmDialog = false;
                axios.post('/rest/v1/systemuser/unassign/' + this.tempUser.login, this.tempUser)
                .then(response => {
                    this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: this.$i18n.td('message.deleted', '삭제되었습니다.'), type: 'success'});
                    this.findUserList();
                });
            },
            unassiagn(user) {
                this.tempUser = user;
                this.confirmDialog = true;
            },
            disagreeDelete() {
                this.confirmDialog = false;
            },
            removeRow(index) {
                if (this.instances[index].flag == 'C') {
                    this.instances.splice(index, 1)[0];
                }
            },
            //User Instance 등록/수정
            saveInstance() {
                const url = '/rest/v1/system/detail/save';
                axios.post(url, this.instances).then(res => {
                    this.findUserInstance();
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            openDialog() {
                this.dialog = true;
            },

            closeDialog() {
                this.dialog = false;
                this.dummyIndex = -1;
            },
            saveDialog() {
                this.findUserList();
                this.closeDialog();
            },
            openInstanceDialog(mode, instance) {
                if (mode === 'ADD') {
                    this.systemInstanceDialog.systemInstance = {
                        instanceId: --this.dummyIndex,
                        flag: 'C',
                        useYn: 'Y',
                        systemKey: this.systemDetail.systemKey,
                    };
                } else if (mode === 'UPDATE') {
                    this.systemInstanceDialog.systemInstance = instance;
                }
                this.systemInstanceDialog.mode = mode;
                this.systemInstanceDialog.showDialog = true;
            },

            closeInstanceDialog() {
                this.systemInstanceDialog.showDialog = false;
                this.dummyIndex = -1;
            },
            saveInstanceDialog() {
                this.findUserInstance();
                this.closeInstanceDialog();
            },
            deleteSystem() {
                var system = new Array();
                system.push(this.systemDetail.systemKey);
                let that = this;
                const url = '/rest/v1/system/delete';
                axios.post(url, system).then(res => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    this.backToList();
                }).catch(e => {
                    this.$notify({
                        title: 'error message',
                        text: error,
                        type: 'error'
                    });
                });
            },

            changeApprovalUseYn(systemUser) {
                axios.post('/rest/v1/systemuser/update', systemUser)
                .then(res => {
                })
                .catch(error => {
                });
            },
        }

    };
</script>

<style scoped>
    #app #system-detail-page .page-content {
        height: calc(100% - 240px);
    }

    #app #system-detail-page .cont-half:first-child {
        width: 40%;
    }

    #app #system-detail-page .cont-half:last-child {
        width: 60%;
        padding-right: 15px;
    }

    #app #system-detail-page .cont-half:first-child .page-content {
        margin-top: 0;
    }

    #app #system-detail-page .cont-half:first-child .table__action {
        border-top: none;
    }

    #app #system-detail-page .hide-overflow {
        overflow: hidden;
    }

    #app #system-detail-page #system-useable {
        width: 120px;
    }

    #app #system-detail-page .cont-half:first-child form {
        height: calc(100% - 75px);
    }

    #app #system-detail-page .cont-half:first-child .table-area {
        height: 100%;
    }

    #app #system-detail-page #system-instance-list {
        height: calc(100% - 40px);
        overflow: auto;
    }

    #app #system-detail-page #button-box-ru {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 10px;
        text-align: right;
    }

    #app #system-detail-page .cont-half:last-child .table-area {
        height: calc(100% - 40px);
    }

    #app #system-detail-page .cont-half:last-child .table__body {
        max-height: calc(100% - 33px - 52px);
        overflow: auto;
        background: cyan;
    }
</style>

<style>
    #app #system-detail-page .input-group__counter {
        display: none;
    }

    #app #system-detail-page #sysuser-list .datatable {
        table-layout: fixed;
    }

    #app #system-detail-page .input-group.input-group--selection-controls.switch .input-group--selection-controls__container {
        color: #2A96FD
    }

    #app #system-detail-page .input-group.input-group--selection-controls.switch .input-group--selection-controls__ripple:after {
        height: 13px;
        width: 13px;
    }

    #app #system-detail-page .input-group.input-group--selection-controls.switch .input-group--selection-controls__toggle {
        height: 10px;
        width: 25px;
        margin-left: 5px;
    }

    /* #app #system-detail-page #sysuser-list .table__overflow {overflow-x:hidden;} */

</style>
