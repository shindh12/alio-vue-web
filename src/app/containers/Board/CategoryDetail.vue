<template>
    <div>
        <div id="category-detail-page">

            <!--  Title Area -->
            <page-title :sub="td.menuBoard.category + ' ' + td.message.detail"></page-title>

            <!-- Contents Area -->
            <v-form lazy-validation>
                <div class="detail-page__contents">
                    <table class="detail-page__contents__table">
                        <colgroup>
                            <col width="120px" />
                            <col width="calc(50% - 120px)" />
                            <col width="120px" />
                            <col width="calc(50% - 120px)" />
                        </colgroup>
                        <tr>
                            <th> {{`${td.menuBoard.category} ${td.message.key}`}}</th>
                            <td> {{ categoryDetail.categoryKey }}</td>

                            <th v-if="mode == 'READ'"> {{ td.message.useYn }}</th>
                            <td v-if="mode == 'READ'"> {{ categoryDetail.useYn =='Y' ? td.message.useY : td.message.useN }}</td>
                            <td v-if="mode == 'UPDATE'" colspan=2 style="width:auto">
                                <v-switch :label="td.message.useYn" v-model="categoryDetail.useYn" true-value="Y" false-value="N"></v-switch>
                            </td>
                        </tr>
                        <tr>
                            <th :class="{'required':mode==='UPDATE'}"> {{`${td.menuBoard.category} ${td.message.name}`}}</th>
                            <td>
                                <div v-show="mode === 'READ'">{{ categoryDetail.categoryName }}</div>
                                <tb-validator class="tb-validator-in-dialog" v-model="categoryValid" :target="categoryDetail.categoryName" :rules="[rules.required, rules.fullName]"
                                              lazy ref="form-valid">
                                    <v-text-field v-show="mode === 'UPDATE'" v-model.trim="categoryDetail.categoryName" maxlength="100" />
                                </tb-validator>
                            </td>
                            <th>i18N</th>
                            <td>
                                <div>
                                    {{ categoryDetail.i18n }}
                                    <v-btn v-show="mode === 'UPDATE'" @click.native="openMsgDialog('category')" :class="{'margin-left-0px' : categoryDetail.i18n === ''}">{{
                                        $td('menu.message-mapping', 'Message Mapping') }}
                                    </v-btn>
                                </div>
                            </td>

                        </tr>
                    </table>
                </div>
                <div class="action-row--mini ">
                    <div class="left">
                        <v-btn v-show="mode === 'READ'" @click.native="backToList">{{ td.button.toList }}</v-btn>
                    </div>
                    <div class="right">
                        <v-btn primary v-show="mode === 'READ'" @click.native="changeMode('UPDATE')" v-if="menuAuth.update">
                            {{ td.button.update }}
                        </v-btn>
                        <v-btn v-show="mode === 'UPDATE'" @click.native="cancelUpdating">{{ td.button.cancel }}</v-btn>
                        <v-btn primary v-show="mode === 'UPDATE'" @click.native="updateCategory" v-if="menuAuth.update">
                            {{ td.button.save }}
                        </v-btn>
                    </div>
                </div>
            </v-form>

            <!-- [CONTENT] Content area -->
            <div class="page-content full-height">
                <div>
                    <h2 class="sub-title"> {{ `${td.menuBoard.category} ${td.message.item}` }} </h2>
                    <!-- [TABLE] ㅇㅇ area -->
                    <div class="table-area">
                        <!-- [TABLE] Table information(counter, page size, etc) -->
                        <div class="table__info">
                            <!-- [TABLE] Table actions -->
                            <div class="table__action" v-if="menuAuth.create || menuAuth.delete">
                                <div class="table__action__default">
                                    <v-btn class="btn-add" v-if="menuAuth.create" @click="openCategoryItemCuDialog('ADD')">{{ td.button.add }}</v-btn>
                                    <v-btn class="btn-add" v-if="menuAuth.update" @click="changeCategoryItemMode('UPDATE')">{{ td.button.changeOrder }}</v-btn>
                                </div>
                            </div>
                            <!-- [TABLE] Table actions END -->
                            <div class="table__info__counter">
                                <common-data-table-counter :totalCount="categoryItemList.length" />
                            </div>
                        </div>
                        <!-- [TABLE] Table information(counter, page size, etc) END -->


                        <!-- [TABLE] 본체 -->
                        <div class="table__body">
                            <v-data-table
                                :headers="categoryItemMode==='UPDATE' ? categoryItemCuHeaders : categoryItemRHeaders"
                                :items="categoryItemList"
                                :loading="categoryItemLoading"
                                item-key="categoryItemId"
                                hide-actions
                                ref="sortableTable"
                            >
                                <template slot="items" slot-scope="props">
                                    <tr :style=" props.item.flag=='C'? categoryCreateStyle: props.item.flag=='U' || props.item.flag=='EU'?categoryUpdateStyle:''"
                                        class="sortableRow" :class="{'editable-row':gridEditableCondition(props.item.flag)}" :key="itemKey(props.item)">
                                        <td v-show="categoryItemMode==='UPDATE'" class="px-1 text-xs-center" style="width: 0.1%">
                                            <v-icon class="sortHandle" v-clickable>drag_handle</v-icon>
                                        </td>

                                        <!-- Index (Order)-->
                                        <td class="text-xs-center">{{ props.index+1 }}</td>

                                        <!-- 카테고리 항목키 -->
                                        <td class="text-xs-left"> {{ props.item.categoryItemKey }}</td>

                                        <!-- 카테고리 항목명 -->
                                        <td class="text-xs-left"> {{ props.item.categoryItemName }}</td>

                                        <!-- 메세지 그룹   -->
                                        <td class="text-xs-left"> {{ props.item.i18n }}</td>

                                        <!-- 사용여부 -->
                                        <td class="text-xs-center hidden-overflow">
                                            {{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}
                                        </td>

                                        <!-- Action -->
                                        <td class="justify-center layout px-0" v-if="menuAuth.update">
                                            <v-btn icon class="mx-0" @click="openCategoryItemCuDialog('UPDATE', props.item)" :title="td.button.modify">
                                                <v-icon style="color: #2A96FD;">edit</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>
                        <!-- [TABLE] 본체 END-->
                    </div>
                    <div class="cont-half__upper action-row--mini" id="button-box-ru">
                        <div class="right" v-if="categoryItemMode==='UPDATE'">
                            <v-btn @click="cancelCategoryItemUpdating">{{$td('button.cancel', '취소')}}</v-btn>
                            <v-btn primary @click="saveCategoryItems" v-if="menuAuth.update" :disabled="!categoryItemDirty">{{$td('button.save', '저장')}}</v-btn>
                        </div>
                    </div>
                </div>
            </div>

            <code-message-dialog :show-dialog="msgDialog" @closeDialog="closeMsgDialog" @applyDialog="applyMsg">
            </code-message-dialog>

            <category-item-cu-dialog
                :showDialog=categoryItemCuDialog.show
                :mode=categoryItemCuDialog.mode
                :propsCategory=categoryItemCuDialog.targetCategoryItem
                @closeDialog=closeCategoryItemCuDialog()>
            </category-item-cu-dialog>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import CodeMessageDialog from '@/containers/System/CodePopup/CodeMessagePopup';
    import CategoryItemCuDialog from '@/containers/Board/CategoryPopup/CategoryItemCUDialog';
    import CommonDataTableCounter from '../Common/CommonDataTableCounter';
    import Sortable from 'sortablejs';

    export default {
        components: {
            axios,
            CodeMessageDialog,
            CategoryItemCuDialog,
            CommonDataTableCounter
        },
        data() {
            return {
                msgDialog: false,
                dialog: false,
                dialogTarget: '',
                mode: 'READ', /* for category  */
                categoryItemMode: 'READ',  /* for categoryItem */
                categoryId: this.$route.query.categoryId,
                categoryKey: this.$route.query.categoryKey,
                categoryDetail: {},
                categoryValid: false,
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    fullName: v => /^[a-zA-Z가-힣 ]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                },
                url: {
                    searchCategoryDetail: '/rest/v1/category/categoryid/{categoryId}',
                    update: '/rest/v1/category/update',
                    findCategoryItems: '/rest/v1/category/detail',
                    saveCategoryItems: '/rest/v1/category/detail/save',
                },

                //category item
                categoryItemList: [],
                categoryItemListCount: 0,
                categoryItemDirty: false,
                pagination: {rowsPerPage: 9999, page: 1},
                categoryItemCuHeaders: [
                    {sortable: false, width: '44px'},
                    {text: this.$i18n.td('message.order', '순서'), align: 'center', sortable: false, value: 'index', width: '40px'},
                    {
                        text: this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.item', '항목') + ' ' + this.$i18n.td('message.key', '키'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'categoryKey'
                    },
                    {
                        text: this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.item', '항목') + ' ' + this.$i18n.td('message.name', '명'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'categoryName'
                    },
                    {text: 'i18N', width: '100px', align: 'center', sortable: false, value: 'i18n',},
                    {text: this.$i18n.td('message.use-yn', '카테고리'), width: '100px', align: 'center', sortable: false, value: 'useYn',},
                    {text: this.$i18n.td('button.update', '수정'), width: '100px', align: 'center', sortable: false, value: 'modify',}
                ],
                categoryItemRHeaders: [
                    {text: this.$i18n.td('message.order', '순서'), align: 'center', sortable: false, value: 'index', width: '40px'},
                    {
                        text: this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.item', '항목') + ' ' + this.$i18n.td('message.key', '키'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'categoryKey'
                    },
                    {
                        text: this.$i18n.td('menu-board.category', '카테고리') + ' ' + this.$i18n.td('message.item', '항목') + ' ' + this.$i18n.td('message.name', '명'),
                        width: '100px',
                        align: 'center',
                        sortable: false,
                        value: 'categoryName'
                    },
                    {text: 'i18N', width: '100px', align: 'center', sortable: false, value: 'i18n',},
                    {text: this.$i18n.td('message.use-yn', '카테고리'), width: '100px', align: 'center', sortable: false, value: 'useYn',},
                    {text: this.$i18n.td('button.update', '수정'), width: '100px', align: 'center', sortable: false, value: 'modify',}
                ],
                categoryUpdateStyle: {'background-color': 'antiquewhite'},
                categoryCreateStyle: {'background-color': 'honeydew'},

                itemKeys: new WeakMap(),
                currentItemKey: 0,
                categoryItemLoading: true,
                dummyIndex: -1,

                categoryItemCuDialog: {
                    show: false,
                    mode: '',
                    targetCategoryItem: {},
                },
                td: {
                    button: {
                        search: this.$i18n.td('button.search', '조회'),
                        add: this.$i18n.td('button.add', '추가'),
                        unuseConfirm: this.$i18n.td('button.unuse-confirm', '미사용'),
                        delete: this.$i18n.td('button.delete', '삭제'),
                        toList: this.$i18n.td('button.to-list', '목록'),
                        update: this.$i18n.td('button.update', '수정'),
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장'),
                        changeOrder: this.$i18n.td('button.change-order', '순서 변경'),
                        modify: this.$i18n.td('button.update', '수정'),
                    },
                    message: {
                        key: this.$i18n.td('message.key', '키'),
                        name: this.$i18n.td('message.name', '명'),
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        useY: this.$i18n.td('message.use-y', '사용'),
                        useN: this.$i18n.td('message.use-n', '미사용'),
                        detail: this.$i18n.td('message.detail', '상세'),
                        item: this.$i18n.td('message.item', '항목'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        searchFailed: this.$i18n.td('message.search-failed', '조회에 실패했습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        warn: this.$i18n.td('message.warn', '안내'),
                    },
                    menuBoard: {
                        category: this.$i18n.td('menu-board.category', '카테고리'),
                    },
                    validate: {
                        notValidated: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        canNotChangeUseYn: this.$i18n.td('validate.can-not-change-use-yn', '카테고리를 사용중인 게시판이 있어 변경할 수 없습니다.'),
                    }
                },
            };
        },
        mounted() {
            this.categoryId = this.$route.query.categoryId;
            this.searchCategoryDetail(this.categoryId);

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
        computed: {},
        created() {
            this.findCategoryItems();
        },
        watch: {
            'categoryDetail.useYn'(value) {
                if (value === 'N' && this.categoryDetail.categoryUseCnt > 0) {
                    this.categoryDetail.useYn = 'Y';
                    this.$notify({
                        title: this.td.validate.warn,
                        text: this.td.validate.canNotChangeUseYn,
                        type: 'warn'
                    });
                }
            },
        },
        methods: {
            searchCategoryDetail(categoryId) {
                let url = this.url.searchCategoryDetail;
                url = url.replace('{categoryId}', categoryId);

                axios.get(url)
                .then(res => {
                    this.categoryDetail = res.data;
                })
                .catch(() => {
                    this.$notify({
                        title: this.td.button.search,
                        text: this.td.message.searchFailed,
                        type: 'error'
                    });
                });
            },
            findCategoryItems() {
                let url = this.url.findCategoryItems;

                axios.get(url, {
                    params: {
                        page: 0, // 1page 조회
                        size: 9999, // 9999건 조회
                        categoryId: this.$route.query.categoryId,
                    }
                }).then(res => {
                    res.data.content.forEach(element => {
                        element.flag = 'N';
                        element.categoryItemDuplicate = false;
                    });
                    this.categoryItemList = res.data.content;
                    this.categoryItemLoading = false;
                })
                .catch(error => {

                });
            },
            changeMode(mode) {
                this.mode = mode;
            },
            changeCategoryItemMode(mode) {
                this.categoryItemMode = mode;
            },
            cancelUpdating() {
                this.clearValid();
                this.searchCategoryDetail(this.categoryId);
                this.changeMode('READ');
            },
            backToList() {
                this.$router.push({
                    path: '/board/category',
                    query: this.$route.query
                });
            },
            updateCategory() {
                /* check validation*/
                if (this.validateData() === false) { return; }

                let url = this.url.update;
                axios.post(url, this.categoryDetail)
                .then(() => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saved,
                        type: 'success'
                    });
                    this.mode = 'READ';
                })
                .catch(error => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saveFailed,
                        type: 'error'
                    });
                });
            },
            openMsgDialog(target) {
                this.dialogTarget = target;
                this.msgDialog = true;
            },
            closeMsgDialog() {
                this.msgDialog = false;
                this.dummyIndex = -1;
            },
            applyMsg(param) {
                if (this.dialogTarget == 'category') {
                    this.categoryDetail.messageGroup = param.mGroup;
                    this.categoryDetail.messageCode = param.mCode;
                    this.categoryDetail.i18n = param.mGroup + '.' + param.mCode;
                    this.categoryDetail.categoryName = this.$i18n.td(this.categoryDetail.messageGroup + '.' + this.categoryDetail.messageCode, '');
                } else if (this.dialogTarget !== '') {
                    this.categoryItemList[this.dialogTarget].messageGroup = param.mGroup;
                    this.categoryItemList[this.dialogTarget].messageCode = param.mCode;
                    this.categoryItemList[this.dialogTarget].i18n = param.mGroup + '.' + param.mCode;
                    this.categoryItemList[this.dialogTarget].categoryItemName = this.$i18n.td(
                        this.categoryItemList[this.dialogTarget].messageGroup + '.' + this.categoryItemList[this.dialogTarget].messageCode, '');
                    if (this.categoryItemList[this.dialogTarget].flag == 'C') {
                        this.categoryItemList[this.dialogTarget].flag = 'C';
                    } else {
                        this.categoryItemList[this.dialogTarget].flag = 'EU';
                    }
                } else {

                }
                this.msgDialog = false;
            },
            cancelCategoryItemUpdating() {
                this.categoryItemDirty = false;
                this.changeCategoryItemMode('READ');
                this.findCategoryItems();
            },
            saveCategoryItems() {
                let saveList = [];
                let categoryItem = {};
                for (let i = 0; i < this.categoryItemList.length; i++) {
                    categoryItem = this.categoryItemList[i];
                    if (categoryItem.flag == 'C') {
                        categoryItem.categoryItemOrder = i + 1;
                        saveList.push(categoryItem);
                    } else if (categoryItem.flag == 'U' || categoryItem.flag == 'EU') {
                        categoryItem.categoryItemOrder = i + 1;
                        categoryItem.updateUserId = this.$store.state.loginStore.currentUser.userId;
                        saveList.push(categoryItem);
                    } else if (i + 1 != categoryItem.categoryItemOrder) {
                        categoryItem.categoryItemOrder = i + 1;
                        categoryItem.updateUserId = this.$store.state.loginStore.currentUser.userId;
                        saveList.push(categoryItem);
                    }
                }
                let url = this.url.saveCategoryItems;

                axios.post(url, saveList)
                .then(response => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saved,
                        type: 'success'
                    });
                    this.cancelCategoryItemUpdating();
                })
                .catch(error => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saveFailed,
                        type: 'error'
                    });
                });
            },
            gridEditableCondition(flag) {
                return flag == 'C' || flag == 'E' || flag == 'EU';
            },
            itemKey(item) {
                if (!this.itemKeys.has(item)) {
                    this.itemKeys.set(item, ++this.currentItemKey);
                }
                return this.itemKeys.get(item);
            },
            checkCategoryItemDuplicate: _.debounce(
                function (index) {
                    let categoryItemKey = this.categoryItemList[index].categoryItemKey;
                    let duplicatedCategoryItemList = this.categoryItemList.filter((item) => { if (item.categoryItemKey == categoryItemKey) { return item;}});

                    if (duplicatedCategoryItemList.length > 1) {
                        this.categoryItemList[index].codeDuplicate = true;
                    } else {
                        this.categoryItemList[index].codeDuplicate = false;
                    }
                }
                ,
                100
            ),
            dragReorder({oldIndex, newIndex}) {
                const movedItem = this.categoryItemList.splice(oldIndex, 1)[0];
                this.categoryItemList.splice(newIndex, 0, movedItem);

                let reorderedCodes = this.categoryItemList;
                for (let i = 0; i < reorderedCodes.length; i++) {

                    if (reorderedCodes[i].categoryItemOrder != i + 1) {
                        if (reorderedCodes[i].flag == 'N') {
                            reorderedCodes[i].flag = 'U';

                        } else if (reorderedCodes[i].flag == 'E') {
                            reorderedCodes[i].flag = 'EU';

                        }
                    }
                }
                this.categoryItemList = reorderedCodes;
                this.categoryItemDirty = true;
            },
            clearValid() {
                this.$refs['form-valid'].clear();
            },
            validateData() {
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.td.message.warn,
                        text: this.td.validate.notValidated,
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },

            openCategoryItemCuDialog(mode, item) {
                let newItem = {
                    categoryItemId: --this.dummyIndex,
                    flag: 'C',
                    categoryId: this.categoryDetail.categoryId,
                    categoryKey: this.categoryDetail.categoryKey,
                    categoryItemKey: '',
                    categoryItemOrder: '',
                    useYn: 'Y',
                    categoryItemName: '',
                    messageGroup: '',
                    messageCode: '',
                    updateUserId: this.$store.state.loginStore.currentUser.userId,
                    createUserId: this.$store.state.loginStore.currentUser.userId,
                    categoryItemDuplicate: false
                };

                this.categoryItemCuDialog.mode = mode;
                if (mode === 'ADD') {
                    this.categoryItemCuDialog.targetCategoryItem = newItem;
                } else {
                    this.categoryItemCuDialog.targetCategoryItem = item;
                }

                this.categoryItemCuDialog.show = true;
            },
            closeCategoryItemCuDialog() {
                this.categoryItemCuDialog.show = false;
                this.findCategoryItems();
            },

        }
    };
</script>

<style scoped>
    #app .isdp-page > div {
        height: initial;
    }

    #app .margin-left-0px {
        margin-left: 0px !important;
    }
</style>

<style>
    #category-detail-page .tb-validator-in-dialog .-tb-validator__error-message.-tb-validator__error-message--bottom {
        margin-left: 0px;
        width: 100%;
    }
</style>


<style lang="scss">
    @import "styles/mixins.scss";

    #app #category-detail-page .detail-page__contents__table .input-group--selection-controls {
        @include override-vuetify;
        @include labeled-textfield(120px);
    }
</style>
