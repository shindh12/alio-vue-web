<template>
    <div id="code-page">
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col3">
            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchGroupKey" :label="$td('code.group-key', '그룹키')"
                                  v-model.trim="searchCondition.groupKey" @keyup.enter="movePage(1)" maxlength="50"></v-text-field>
                    <!-- :placeholder="$td('code.group-key', '그룹키')" -->
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchGroupName" :label="$td('code.group-name', '그룹명')"
                                  v-model.trim="searchCondition.groupName" @keyup.enter="movePage(1)" maxlength="100"></v-text-field>
                    <!--   :placeholder="$td('code.group-name', '그룹명')" -->
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('code.use-yn-group', '그룹 사용여부')}}</div>
                    <span class="---has-to-be-span---">
                    <v-select :items="useYnCombo" item-value="value" class="narrow-search-select" v-model="searchCondition.groupUseYn"></v-select>
                  </span>
                </div>
            </div>

            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchCodeKey" :label="$td('code.key', '코드키')"
                                  v-model.trim="searchCondition.codeKey" @keyup.enter="movePage(1)" maxlength="50"></v-text-field>
                    <!-- :placeholder="$td('code.key', '코드키')" -->
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchCodeName" :label="$td('code.name', '코드명')"
                                  v-model.trim="searchCondition.codeName" @keyup.enter="movePage(1)" maxlength="100"></v-text-field>
                    <!--  :placeholder="$td('code.name', '코드명')" -->
                </div>
            </div>
        </div>
        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="movePage(1)">{{ $td('button.search', 'Search') }}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content full-height">
            <!-- [LEFT] Group info area -->
            <div class="cont-half">
                <h2 class="sub-title"><span>{{ $td('code.code-group-list', '코드 그룹 목록') }}</span></h2>
                <!-- [TABLE] ㅇㅇ area -->
                <div class="table-area table-area--left-fit">
                    <!-- [TABLE] Table information(counter, page size, etc) -->
                    <div class="table__info">
                        <!-- [TABLE] Table actions -->
                        <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                            <div class="table__action__default">
                                <v-btn @click="openCodeGroupDialog()" v-if="menuAuth.create" :disabled="createMode">{{$td('button.add', '추가')}}</v-btn>
                            </div>
                            <div class="table__action__optional"></div>
                        </div>
                        <!-- [TABLE] Table actions END -->


                        <div class="table__info__counter">
                            <common-page-size-selector :totalCount="groupSize" :pagination="pagination" @eventPageSizeSelector="findCodeGroupList" />
                        </div>

                    </div>
                    <!-- [TABLE] Table information(counter, page size, etc) END -->


                    <!-- [TABLE] 본체 -->
                    <div class="table__body">
                        <v-data-table
                            :headers="groupHeaders"
                            :items="groups"
                            :pagination.sync="pagination"
                            :loading="groupLoading"
                            :total-items="groupSize"
                            hide-actions
                            item-key="groupId"
                        >
                            <!-- Grid Body -->
                            <template slot="items" slot-scope="props">
                                <tr :active="props.item.groupId == selectedGroupId ">
                                    <!-- 그룹키 -->
                                    <td class="text-xs-left ellipsis" @click="findGroupDetail(props.item)" :title="props.item.groupKey">{{ props.item.groupKey }}</td>
                                    <!-- 디폴트 그룹명 -->
                                    <td class="text-xs-left ellipsis" @click="findGroupDetail(props.item)" :title="props.item.defaultName">{{ props.item.defaultName }}</td>
                                    <!-- i18N -->
                                    <td class="text-xs-left ellipsis" @click="findGroupDetail(props.item)" :title="props.item.messageGroup + '.' + props.item.messageCode">
                                        <span v-if="props.item.messageGroup">{{props.item.messageGroup + '.' + props.item.messageCode}}</span>
                                        <span v-else="props.item.messageGroup"></span>
                                    </td>
                                    <!-- 사용여부 -->
                                    <td class="text-xs-center hidden-overflow">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                                    <!-- Action -->
                                    <td v-if="menuAuth.update" class="text-xs-center">
                                        <v-btn icon @click="openCodeGroupDialog(props.item)" :title="modifyTitle">
                                            <v-icon style="color: #2A96FD;">edit</v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </div>
                    <!-- [TABLE] 본체 끝-->
                    <!-- [TABLE] Page navi -->
                    <div class="table__pager">
                        <common-pagination :page="pagination.page" :pages="pages" @eventPagination="movePage" />
                    </div>
                    <!-- [TABLE] Page navi END -->
                </div>
            </div>
            <!-- [LEFT] Group info area END -->


            <!-- [RIGHT] Group detail area -->
            <div class="cont-half">
                <!--<div class="cont-half__lower">-->
                <h2 class="sub-title"><span>{{ $td('code.code-list', '코드 목록') }}</span></h2>
                <!-- [TABLE] ㅇㅇ area -->
                <div class="table-area fixed-layout">
                    <!-- [TABLE] Table information(counter, page size, etc) -->
                    <div class="table__info">
                        <!-- [TABLE] Table actions -->
                        <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                            <div class="table__action__default">
                                <!--<v-btn class="btn-add" v-if="menuAuth.create" @click="addCode">{{$td('button.add', '추가')}}</v-btn>-->
                                <v-btn class="btn-add" v-if="menuAuth.create" @click="openCodeDialog">{{$td('button.add', '추가')}}</v-btn>
                                <v-btn class="btn-add" v-if="menuAuth.update" @click="changeOrderCode">{{$td('button.change-order', '순서 변경')}}</v-btn>
                            </div>
                            <div class="table__action__optional"></div>
                        </div>
                        <!-- [TABLE] Table actions END -->
                        <div class="table__info__counter__total">
                            {{ $td('message.total', '총') }} <b>{{codeSize}}</b>
                        </div>
                    </div>


                    <!-- [TABLE] 본체 -->
                    <div class="table__body">
                        <v-data-table
                            :headers="isChangeOrder===true ? codeCuHeaders : codeRHeaders"
                            :items="codes"
                            :loading="codeLoading"
                            hide-actions ref="sortableTable">
                            <!-- Grid Body -->
                            <template slot="items" slot-scope="props">
                                <tr :style=" props.item.flag=='C'? codeCreateStyle: props.item.flag=='U' || props.item.flag=='EU'?codeUpdateStyle:''"
                                    class="sortableRow" :class="{'editable-row':gridEditableCondition(props.item.flag)}" :key="itemKey(props.item)">
                                    <td class="px-1 text-xs-center" v-show="isChangeOrder===true">
                                        <v-icon class="sortHandle" v-clickable>drag_handle</v-icon>
                                    </td>
                                    <td class="text-xs-center" @click.stop="codeEditToggle(props.index)">{{ props.index+1 }}</td>
                                    <td class="text-xs-left">
                                        <span>{{ props.item.codeKey }}</span>
                                    </td>
                                    <td class="text-xs-left">
                                        <span>{{ props.item.defaultName }}</span>
                                    </td>
                                    <td class="text-xs-left">
                                        <span v-if="props.item.messageGroup">{{props.item.messageGroup + '.' + props.item.messageCode}}</span>
                                        <span v-else="props.item.messageGroup"></span>
                                    </td>
                                    <td class="text-xs-center hidden-overflow">
                                        <span v-if="props.item.flag == 'N'">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</span>
                                    </td>
                                    <td v-if="menuAuth.update" class="text-xs-center">
                                        <v-btn icon @click="openCodeDialog(props.item)" :title="modifyTitle">
                                            <v-icon style="color: #2A96FD;">edit</v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </div>
                    <!-- [TABLE] 본체 끝-->
                </div>
                <!--</div>-->
                <div v-if="isChangeOrder" class="cont-half__upper action-row--mini" id="button-box-ru">
                    <v-btn @click="saveCancelCodeGroup">{{$td('button.cancel', '취소')}}</v-btn>
                    <v-btn primary @click="saveCodeGroup" v-if="menuAuth.update" :disabled="!groupValid">{{$td('button.save', '저장')}}</v-btn>
                </div>
            </div>
            <!-- [RIGHT] Group detail area END -->
        </div>

        <!-- Add, Edit Dialog Area -->
        <code-message-dialog :showDialog="dialog" @closeDialog="closeDialog" @applyDialog="applyDialog" />
        <code-group-dialog
            :showDialog="codeGroupDialog"
            :mode="codeGroupDialogMode"
            :target-item="codeGroupEditedItem"
            @closeDialog="closeCodeGroupDialog"
            @applyDialog="openCodeGroupDialog"
            @reloadData="findCodeGroupList"
        />
        <code-dialog
            :showDialog="codeDialog"
            :mode="codeDialogMode"
            :target-item="codeEditedItem"
            @closeDialog="closeCodeDialog"
            @applyDialog="openCodeDialog"
            @reloadData="findCodeList"
        />
    </div>
</template>

<script>
    /* Conponent Import */
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import CommonDataTableCounter from '../Common/CommonDataTableCounter';
    import axios from 'axios';
    import CodeMessageDialog from '@/containers/System/CodePopup/CodeMessagePopup';
    import Sortable from 'sortablejs';
    import CommonCodeSelect from '../Common/CommonCodeSelect';
    import CodeGroupDialog from '@/containers/System/CodePopup/CodeGroupDialog';
    import CodeDialog from '@/containers/System/CodePopup/CodeDialog';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            CommonDataTableCounter,
            axios,
            CodeMessageDialog,
            CommonCodeSelect,
            CodeGroupDialog,
            CodeDialog,
        },
        data() {
            return {
                testGroupCode: 'HELLO',
                testSelectedCode: '',
                testLabal: 'TEST LABEL',
                title: this.$i18n.td('menu.system-code', '코드관리'),
                path: this.$i18n.td('menu.menu-system', '시스템'),
                menu: this.$i18n.td('menu.system-code', '코드관리'),
                searchCondition: {
                    groupKey: '',
                    groupName: '',
                    groupUseYn: '',
                    codeKey: '',
                    codeName: '',
                    codeUseYn: ''
                },
                codeValid: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목입니다.'),
                    groupDup: (v) => !this.groupDuplicate || this.$i18n.td('validate.duplicated', '중복입니다.'),
                    codeDup: (index) => !this.codes[index].codeDuplicate || this.$i18n.td('validate.duplicated', '중복입니다.'),
                    codeKey: v => /^[a-zA-Z0-9-]{1,50}$/.test(v) || this.$i18n.td('validate.group-code-name-message', '50자 이내의 bar(-) 또는 숫자로 이루어진 영문 대소문자를 입력해주세요.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                modifyTitle: this.$i18n.td('button.update', '수정'),
                searchType: 0,
                groupSize: 0,
                codeSize: 0,
                groups: [],
                selectedGroupId: '',
                groupDetail: {
                    groupId: -1,
                    groupKey: '',
                    beforeGroupKey: '',
                    defaultName: '',
                    messageGroup: '',
                    messageCode: '',
                    useYn: '',
                    createDate: '',
                    createUserId: '',
                    updateDate: '',
                    updateUserId: ''
                },
                groupValid: false,
                codes: [],
                errors: [],
                groupLoading: true,
                groupDuplicate: false,
                codeLoading: false,
                pagination: {rowsPerPage: 15},
                groupHeaders: [
                    {text: this.$i18n.td('code.group-key', '그룹키'), align: 'center', sortable: false, value: 'groupKey', width: '150px'},
                    {text: this.$i18n.td('menu-code.group-name', '그룹명'), align: 'center', sortable: false, value: 'groupName', width: '150px'},
                    {text: 'i18N', align: 'center', sortable: false, value: 'i18N'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, value: 'useYn', width: '60px'},
                    {text: this.$i18n.td('button.update', '수정'), align: 'center', sortable: false, value: 'modify', width: '50px'}
                ],
                codeCuHeaders: [
                    {sortable: false, width: '40px'},
                    {text: this.$i18n.td('message.order', '순서'), align: 'center', sortable: false, value: 'index', width: '40px'},
                    {text: this.$i18n.td('code.key', '코드키'), align: 'center', sortable: false, value: 'codeKey', width: '150px'},
                    {text: this.$i18n.td('code.name', '코드명'), align: 'center', sortable: false, value: 'defaultName', width: '150px'},
                    {text: 'i18N', align: 'center', sortable: false, value: 'i18N'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, value: 'useYn', width: '60px'},
                    {text: this.$i18n.td('button.update', '수정'), align: 'center', sortable: false, value: 'modify', width: '50px'}
                ],
                codeRHeaders: [
                    {text: this.$i18n.td('message.order', '순서'), align: 'center', sortable: false, value: 'index', width: '40px'},
                    {text: this.$i18n.td('code.key', '코드키'), align: 'center', sortable: false, value: 'codeKey', width: '150px'},
                    {text: this.$i18n.td('code.name', '코드명'), align: 'center', sortable: false, value: 'defaultName', width: '150px'},
                    {text: 'i18N', align: 'center', sortable: false, value: 'i18N'},
                    {text: this.$i18n.td('message.use-yn', '사용여부'), align: 'center', sortable: false, value: 'useYn', width: '60px'},
                    {text: this.$i18n.td('button.update', '수정'), align: 'center', sortable: false, value: 'modify', width: '50px'}
                ],
                statusSelect: {text: 'All', value: 0},
                useYnCombo: [
                    {text: this.$i18n.td('message.all', '전체'), value: ''},
                    {text: this.$i18n.td('message.use-y', '사용'), value: 'Y'},
                    {text: this.$i18n.td('message.use-n', '미사용'), value: 'N'}
                ],
                messageCodeDisable: true,
                createMode: false,
                updateMode: false,
                dialog: false,
                dialogTarget: '',
                groupConrimDialog: false,
                itemKeys: new WeakMap(),
                currentItemKey: 0,
                codeUpdateStyle: {'background-color': 'antiquewhite'},
                codeCreateStyle: {'background-color': 'honeydew'},
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
                codeGroupEditedIndex: -1,
                codeGroupEditedItem: {
                    groupId: -1,
                    groupKey: '',
                    beforeGroupKey: '',
                    defaultName: '',
                    messageGroup: '',
                    messageCode: '',
                    useYn: '',
                    createDate: '',
                    createUserId: '',
                    updateDate: '',
                    updateUserId: ''
                },
                codeGroupDefaultItem: {
                    groupId: -1,
                    groupKey: '',
                    beforeGroupKey: '',
                    defaultName: '',
                    messageGroup: '',
                    messageCode: '',
                    useYn: '',
                    createDate: '',
                    createUserId: '',
                    updateDate: '',
                    updateUserId: ''
                },
                codeEditedIndex: -1,
                codeEditedItem: {
                    beforeCodeKey: -1,
                    codeDuplicate: false,
                    codeId: -1,
                    codeKey: '',
                    codeOrder: '',
                    createDate: '',
                    createUserId: '',
                    defaultName: '',
                    flag: '',
                    groupId: -1,
                    messageCode: '',
                    messageGroup: '',
                    updateDate: '',
                    updateUserId: '',
                    useYn: 'Y',
                },
                codeDefaultItem: {
                    beforeCodeKey: -1,
                    codeDuplicate: false,
                    codeId: -1,
                    codeKey: '',
                    codeOrder: '',
                    createDate: '',
                    createUserId: '',
                    defaultName: '',
                    flag: '',
                    groupId: -1,
                    messageCode: '',
                    messageGroup: '',
                    updateDate: '',
                    updateUserId: '',
                    useYn: 'Y',
                },
                codeGroupDialogMode: 'ADD',
                codeGroupDialog: false,
                codeDialogMode: 'ADD',
                codeDialog: false,
                isChangeOrder: false,

            };
        },
        watch: {
            groupDetail: function (newGroupDetail) {
                if (newGroupDetail.messageGroup != '') {
                    this.messageCodeDisable = false;
                } else {
                    this.messageCodeDisable = true;
                }
            }
        },
        computed: {
            pages() {
                return Math.ceil(this.groupSize / this.pagination.rowsPerPage);
            },
        },
        mounted() {
            //코드 그룹 목록조회
            this.findCodeGroupList();
            /* eslint-disable no-new */
            new Sortable(
                this.$refs.sortableTable.$el.getElementsByTagName('tbody')[0],
                {
                    draggable: '.sortableRow',
                    handle: '.sortHandle',
                    onEnd: this.dragReorder
                }
            );
        },
        methods: {
            movePage(index) {
                this.pagination.page = index;
                axios.get('/rest/v1/code/list'
                    , {
                        params: {
                            systemKey: this.$store.state.loginStore.systemKey,
                            groupKey: this.searchCondition.groupKey,
                            groupName: this.searchCondition.groupName,
                            groupUseYn: this.searchCondition.groupUseYn,
                            codeKey: this.searchCondition.codeKey,
                            codeName: this.searchCondition.codeName,
                            codeUseYn: this.searchCondition.codeUseYn,
                            page: index - 1,
                            size: this.pagination.rowsPerPage
                        }
                    })
                .then(response => {
                    let groupList = response.data.content;
                    this.groups = groupList;
                    this.groupSize = response.data.totalElements;
                    this.groupLoading = false;
                    if (groupList.length > 0) {
                        this.findGroupDetail(groupList[0]);
                    } else {
                        this.codes = [];
                        this.groupDetail = {
                            groupId: -1,
                            groupKey: '',
                            beforeGroupKey: '',
                            defaultName: '',
                            messageGroup: '',
                            messageCode: '',
                            useYn: '',
                            createDate: '',
                            createUserId: '',
                            updateDate: '',
                            updateUserId: ''
                        };
                    }
                })
                .catch(error => {

                });
            },
            //코드 그룹 Popup
            openCodeGroupDialog(item) {
                this.codeGroupEditedIndex = this.groups.indexOf(item);
                this.codeGroupEditedItem = Object.assign({}, item);
                if (this.codeGroupEditedIndex > -1) {
                    this.codeGroupDialogMode = 'UPDATE';
                } else {
                    this.codeGroupDialogMode = 'ADD';
                }
                this.codeGroupDialog = true;
            },
            closeCodeGroupDialog() {
                // console.log(">> in main page");
                this.codeGroupDialog = false;
                setTimeout(() => {
                    this.codeGroupEditedItem = Object.assign({}, this.codeGroupDefaultItem);
                    this.codeGroupEditedIndex = -1;
                }, 300);
            },
            openCodeDialog(item) {
                this.codeEditedIndex = this.codes.indexOf(item);
                this.codeEditedItem = Object.assign({}, item);
                if (this.codeEditedIndex > -1) {
                    this.codeDialogMode = 'UPDATE';
                } else {
                    this.codeEditedItem.groupId = this.selectedGroupId;
                    this.codeEditedItem.codeOrder = this.codes.length + 1;
                    this.codeDialogMode = 'ADD';
                }
                this.codeDialog = true;
            },
            closeCodeDialog() {
                this.codeDialog = false;
                setTimeout(() => {
                    this.codeEditedItem = Object.assign({}, this.codeDefaultItem);
                    this.codeEditedIndex = -1;
                }, 300);
            },
            //코드 그룹 목록조회
            findCodeGroupList() {
                this.selectedGroupId = undefined;
                this.createMode = false;
                this.movePage(this.pagination.page);
            },
            //코드 그룹 사용여부 수정
            changeGroupUseYn(group) {
                axios.post('/rest/v1/code/update', group)
                .then(response => {
                })
                .catch(error => {

                });
            },
            saveCancelCodeGroup() {
                this.createMode = false;
                this.updateMode = false;
                this.isChangeOrder = false;
                this.groupValid = false;
                this.findGroupDetail();
            },
            //코드 그룹 상세조회
            findGroupDetail(group) {
                if (group != null) {
                    this.selectedGroupId = group.groupId;
                }
                if (this.selectedGroupId == '' || this.selectedGroupId == null || this.selectedGroupId == undefined) {
                    this.findCodeGroupList();
                    return;
                }
                if (this.createMode == true || this.updateMode == true) {
                    this.groupConrimDialog = true;
                } else {
                    axios.get('/rest/v1/code/' + this.selectedGroupId)
                    .then(response => {
                        response.data.beforeGroupKey = response.data.groupKey;
                        this.groupDetail = response.data;
                        this.groupDuplicate = false;
                        this.isChangeOrder = false;
                        this.groupValid = false;
                        this.findCodeList();
                    })
                    .catch(error => {

                    });
                }
            },
            //코드 목록조회
            findCodeList() {
                if (!this.selectedGroupId) {
                    return;
                }
                axios.get('/rest/v1/code/' + this.selectedGroupId + '/detail')
                .then(response => {
                    this.codeSize = response.data.length;
                    response.data.forEach(element => {
                        element.flag = 'N';
                        element.beforeCodeKey = element.codeKey;
                        element.codeDuplicate = false;
                    });
                    this.codes = response.data;
                    this.codeLoading = false;
                })
                .catch(error => {

                });
            },
            //코드 사용여부 수정
            changeCodeUseYn(code) {
                axios.post('/rest/v1/code/' + code.groupId + '/detail/' + code.codeId, code)
                .then(response => {

                })
                .catch(error => {

                });
            },
            changeUpdateMode() {
                if (!this.updateMode) {
                    this.updateMode = true;
                }
            },
            //코드 그룹 등록/수정
            saveCodeGroup() {
                /* check valid */
                //if(this.validateData()===false){ console.log("###"); return; }

                let createCodeList = [];
                let updateCodeList = [];
                let code = {};
                for (let i = 0; i < this.codes.length; i++) {
                    code = this.codes[i];
                    if (code.flag == 'C') {
                        code.codeOrder = i + 1;
                        createCodeList.push(code);
                    } else if (code.flag == 'U' || code.flag == 'EU') {
                        code.codeOrder = i + 1;
                        updateCodeList.push(code);
                    } else if (i + 1 != code.codeOrder) {
                        code.codeOrder = i + 1;
                        updateCodeList.push(code);
                    }
                }
                let codeDetail = {
                    'systemKey': this.$store.state.loginStore.systemKey,
                    'groupKey': this.groupDetail.groupKey,
                    'defaultName': this.groupDetail.defaultName,
                    'messageGroup': this.groupDetail.messageGroup,
                    'messageCode': this.groupDetail.messageCode,
                    'createCodeList': createCodeList,
                    'updateCodeList': updateCodeList
                };
                if (this.createMode) {
                    codeDetail.groupId = -1;
                    codeDetail.useYn = 'Y';
                    axios.post('/rest/v1/code/group/detail', codeDetail)
                    .then(response => {
                        this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                        this.createMode = false;
                        this.updateMode = false;
                        this.isChangeOrder = false;
                        this.groupValid = false;
                        //this.findCodeGroupList();
                        this.findCodeList();
                    })
                    .catch(error => {

                    });
                } else {
                    codeDetail.groupId = this.selectedGroupId;
                    codeDetail.useYn = this.groupDetail.useYn;
                    axios.post('/rest/v1/code/' + this.selectedGroupId + '/detail', codeDetail)
                    .then(response => {
                        this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                        //this.findCodeGroupList();
                        this.updateMode = false;
                        this.createMode = false;
                        this.isChangeOrder = false;
                        this.groupValid = false;
                        this.findCodeList();
                    })
                    .catch(error => {

                    });
                }
            },
            addCode() {
                let newCode = {
                    groupId: this.selectedGroupId,
                    flag: 'C',
                    codeKey: '',
                    defaultName: 'NewCode',
                    codeName: '',
                    messageGroup: '',
                    messageCode: '',
                    useYn: 'Y',
                    codeOrder: '',
                    codeDuplicate: false
                };
                this.codes.push(newCode);
                if (this.createMode != true) {
                    this.updateMode = true;
                }
                this.groupValid = false;
            },
            changeOrderCode() {
                this.isChangeOrder = true;
            },
            codeEditToggle(index) {

                if (this.codes[index].flag == 'N') {
                    this.codes[index].flag = 'E';
                } else if (this.codes[index].flag == 'E') {
                    this.codes[index].flag = 'N';
                } else if (this.codes[index].flag == 'U') {
                    this.codes[index].flag = 'EU';
                } else if (this.codes[index].flag == 'EU') {
                    this.codes[index].flag = 'U';
                }

            },
            changeCodeFlag(index) {
                if (this.codes[index].flag == 'E') {
                    this.codes[index].flag = 'EU';
                    this.updateMode = true;
                }
            }, gridEditableCondition(flag) {
                return flag == 'C' || flag == 'E' || flag == 'EU';
            }, gridUneditableCondition(flag) {
                return flag == 'N' || flag == 'U';
            }, chagneCreateGroupMode() {
                if (this.createMode != true) {
                    this.groupDetail = {
                        groupId: -1,
                        groupKey: '',
                        defaultName: '',
                        messageGroup: '',
                        messageCode: '',
                        useYn: 'Y',
                        createDate: '',
                        createUserId: '',
                        updateDate: '',
                        updateUserId: ''
                    };
                    this.codes = [];
                    this.$refs.groupKey.reset();
                    this.$refs.defaultName.reset();
                    this.$refs.groupKey.focus();
                    this.createMode = true;
                }
            },
            checkGroupDuplicate: _.debounce(
                function () {
                    //코드 그룹이 없으면 무조건 Dup 아님
                    if (!this.groupDetail.groupKey) {
                        this.groupDuplicate = false;
                        return false;
                    }
                    if (!this.createMode && this.groupDetail.beforeGroupKey == this.groupDetail.groupKey) {
                        this.groupDuplicate = false;
                    } else {
                        axios.get('/rest/v1/code/groupkey/' + this.groupDetail.groupKey)
                        .then(response => {
                            if (response.data.length > 0) {
                                this.groupDuplicate = true;
                            } else {
                                this.groupDuplicate = false;
                            }
                        })
                        .catch(error => {

                        });
                    }
                }
                ,
                100
            ),
            checkCodeDuplicate: _.debounce(
                function (index) {
                    let codeKey = this.codes[index].codeKey;
                    let duplicatedCodeList = this.codes.filter((code) => { if (code.codeKey == codeKey) { return code;}});
                    if (duplicatedCodeList.length > 1) {
                        this.codes[index].codeDuplicate = true;
                    } else {
                        this.codes[index].codeDuplicate = false;
                    }
                }
                ,
                100
            ),
            dragReorder({oldIndex, newIndex}) {
                const movedItem = this.codes.splice(oldIndex, 1)[0];
                this.codes.splice(newIndex, 0, movedItem);
                let reorderedCodes = this.codes;
                for (let i = 0; i < reorderedCodes.length; i++) {

                    if (reorderedCodes[i].codeOrder != i + 1) {
                        if (reorderedCodes[i].flag == 'N') {
                            reorderedCodes[i].flag = 'U';
                        } else if (reorderedCodes[i].flag == 'E') {
                            reorderedCodes[i].flag = 'EU';
                        }
                    }
                }
                this.codes = reorderedCodes;
                this.groupValid = true;
            },
            deleteCode(index) {
                if (this.codes[index].flag == 'C') {
                    this.codes.splice(index, 1)[0];
                }
            },
            itemKey(item) {
                if (!this.itemKeys.has(item)) {
                    this.itemKeys.set(item, ++this.currentItemKey);
                }
                return this.itemKeys.get(item);
            },
            disagree() {
                this.groupConrimDialog = false;
            },
            agree() {
                this.groupConrimDialog = false;
                this.createMode = false;
                this.updateMode = false;
                this.findGroupDetail(null);
            },
            openDialog(target) {
                this.dialogTarget = target;
                this.dialog = true;
            },
            closeDialog() {
                this.dialog = false;
            },
            applyDialog(param) {
                this.updateMode = true;
                if (this.dialogTarget == 'group') {
                    this.groupDetail.messageGroup = param.mGroup;
                    this.groupDetail.messageCode = param.mCode;
                } else if (this.dialogTarget !== '') {
                    this.codes[this.dialogTarget].messageGroup = param.mGroup;
                    this.codes[this.dialogTarget].messageCode = param.mCode;
                    if (this.codes[this.dialogTarget].flag == 'C') {
                        this.codes[this.dialogTarget].flag = 'C';
                    } else {
                        this.codes[this.dialogTarget].flag = 'EU';
                    }
                } else {
                }
                this.dialog = false;
            },
            /*clearValid() {
                this.$refs['form-valid'].clear();
            },*/
            validateData() {
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },

        }
    };
</script>

<style scoped>
    #app-root #code-page .page-content.full-height {
        height: calc(100% - 225px);
    }

    #app-root #code-page .cont-half:first-child {
        width: 47%;
    }

    #app-root #code-page .cont-half:last-child {
        width: 53%;
    }

    #app-root #code-page .cont-half__upper {
        margin-bottom: 10px;
        text-align: right;
    }

    #app-root #code-page .cont-half__lower {
        margin-top: 20px;
        height: calc(100% - 180px);
    }

    #app-root #code-page .cont-half__lower .btn-add {
    }

    #app-root #code-page .cont-half__lower .page-content {
        margin-top: 0;
    }

    #app-root #code-page .cont-half__lower .table-area {
        height: calc(100% - 40px);
        min-height: 150px;
    }

    #app-root #code-page .cont-half__lower .table__body {
        max-height: calc(100% + 80px);
        overflow: auto;
    }

    #app-root #code-page .cont-half__lower .cell-editable > span {
        margin-lefT: 7px;
    }

    #app-root #code-page .hidden-overflow {
        overflow: hidden;
    }

    #app-root #code-page .cont-half:last-child form {
        height: calc(100% - 50px);
        overflow: auto;
        padding-right: 15px;
    }

    #button-box-ru {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 15px;
    }

    #app-root #code-page .message-group .input-group--text-field {
        width: 200px;
        display: inline-block;
    }

    #app-root #code-page .message-group .input-group--text-field:last-child {
        width: calc(100% - 325px)
    }

    #app-root #code-page .editable-row {
        background: #EBF1FA;
    }

    #app-root #code-page .message-group .half-input-box__label {
        font-weight: bold;
    }

    #app-root #code-page .no-message {
        opacity: 0.4;
    }

    #app-root #code-page .disable-message {
        background: #FBFCFE;
        position: absolute;
        top: 0;
        left: 5px;
        right: 0;
        bottom: 0;
        padding: 10px 30px;
        z-index: 2;
    }

    #app-root #code-page .cont-half:first-child .table-area {
        height: calc(100% - 40px);
        min-height: 150px;
    }

    #app-root #code-page .cont-half:first-child .table__body {
        max-height: calc(100% - 80px);
        overflow: auto;
    }
</style>

<style>
    #app-root #code-page .half-input-box .input-group--text-field label {
        font-weight: bold;
    }

    #app-root #code-page .message-group .input-group--text-field .input-group__input {
        width: 100%;
    }

    #app-root #code-page .cont-half__lower .cell-editable .input-group__input input {
        font-size: 13px;
    }
</style>
