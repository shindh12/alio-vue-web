<template>
    <div class="isdp-body-content">
        <v-dialog :value="showDialog" @input="closeDialog" max-width="800px" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{ $td('menu.message-mapping', 'Message Mapping') }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-card-text class="dialog-body">
                    <!-- [SEARCH] Search area -->
                    <div class="page-searchbox page-searchbox--col3">
                        <!-- [SEARCH] Search items -->
                        <div class="page-searchbox__row">
                            <div class="page-searchbox__item-cell page-searchbox__item-cell--colspan2">
                                <v-text-field name="searchText" :label="$td('message.message', '메시지')" v-model.trim="searchText" @keyup.enter="searchMessage" maxlength="1000"
                                              :placeholder="tholder"></v-text-field>
                            </div>
                        </div>
                    </div>
                    <!-- [SEARCH] button -->
                    <div class="page-searchbox-action">
                        <v-btn @click.native="searchMessage()">{{$td('button.search', '조회')}}</v-btn>
                    </div>

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
                            <!-- [TABLE] 본체 -->
                            <div class="table__body">
                                <v-data-table :headers="headers" class="fixed-layout"
                                              :items="messageList"
                                              expand
                                              item-key="messageCode"
                                              :pagination.sync="pagination"
                                              :total-items="totalItems"
                                              hide-actions>
                                    <template slot="items" slot-scope="props">
                                        <tr @click="rowClick(props.item)"
                                            :style="{'background-color': (props.item.messageGroup + '.' +props.item.messageCode == rowselected) && !checkNewCode ? '#eee' : ''}">
                                            <td class="text-xs-left">
                                                <span @click="rowDoubleClick(props.item)"
                                                      style="cursor: pointer;border-bottom: 1px solid gray;">{{ props.item.messageGroup }} </span>
                                            </td>
                                            <td class="text-xs-left">
                                                <span @click="rowDoubleClick(props.item)"
                                                      style="cursor: pointer;border-bottom: 1px solid gray;">{{ props.item.messageCode }} </span>
                                            </td>
                                            <td class="text-xs-left" v-for="lang in languages" @dblclick="languageClick(props.item[lang])">
                                                <span :title="props.item[lang]" class="popup-datatable-ellipsis">{{ props.item[lang] }}</span>
                                            </td>
                                        </tr>
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
                    <!-- Grid Area -->

                    <!-- Create New Group, Code -->
                    <v-checkbox v-bind:label="$td('menu-message-mapping.create-new', '새로운 메시지 생성')" v-model="checkNewCode"
                                class="override-vuetify"></v-checkbox>

                    <div v-show="checkNewCode">
                        <div class="page-searchbox" :class="'page-searchbox--col' + (isExistMessageGroup?3:4)">
                            <div class="page-searchbox__row">
                                <div class="page-searchbox__item-cell">
                                    <v-select :items="systemSearchValues"
                                              item-text="systemName"
                                              item-value="systemKey"
                                              v-model="systemKey"
                                              :label="$td('menu.system', '시스템')"
                                              :disabled="true" />
                                </div>
                                <div class="page-searchbox__item-cell">
                                    <div class="page-searchbox__item-title">{{$td('message.message-group', '메세지 그룹')}}</div>
                                    <span class="---has-to-be-span---">
	                                    <v-select :items="messageGroups"
                                                  item-text="groupKey"
                                                  item-value="groupValue"
                                                  v-model="messageGroup"
                                                  autocomplete required />
                                    </span>

                                </div>
                                <div class="page-searchbox__item-cell" v-if="!isExistMessageGroup">
                                    <v-text-field v-model.trim="messageGroupText"
                                                  :label="$td('message.new-group', '새 그룹')"
                                                  :disabled="isExistMessageGroup"
                                                  required maxlength="50" />
                                </div>
                                <div class="page-searchbox__item-cell">
                                    <v-text-field v-model.trim="messageCodeText" :label="$td('message.message-code', '메세지 코드')" required maxlength="100" />
                                </div>
                            </div>

                            <!-- Add Dynamic Languages -->
                            <div class="page-searchbox__row" v-for="(item, val) of messageText" :key="val">
                                <div class="page-searchbox__item-cell page-searchbox__item-cell--full-width">
                                    <v-text-field v-bind:label="$td('language.'+val , val)" :disabled=false v-model.trim="messageText[val]" maxlength="1000"></v-text-field>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-card-text>


                <!-- Cancel, Save Button -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary @click.native="applyDialog">{{ $td('button.apply', '적용') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-layout row justify-start>
            <v-dialog v-model="detailTextDialog" max-width="290">
                <v-card>
                    <v-card-text>{{ languageSelected }}
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1" flat @click.native="closeDetailTextDialog">{{ $td('button.confirm', '확인') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
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
            'showDialog',
            'dialogFrom',
            'pSystemKey'
        ],
        watch: {
            showDialog: function () {
                if (!this.showDialog) {
                    return;
                }
            },
            messageGroup: function (val) {
                if (val == '') {
                    this.isExistMessageGroup = false;
                } else {
                    this.isExistMessageGroup = true;
                }
            },
            checkNewCode: function (val) {
                if (val == true) {
                    this.rowselected = '';
                    this.languageSelected = '';
                }
            }
        },
        data() {
            return {
                url: {
                    lang: '/rest/v1/message/lang',
                    searchCodeGroup: '/rest/v1/code',  //전체 코드그룹 조회
                    searchMessage: '/rest/v1/message', //메세지 조회
                    searchMessageGroup: '/rest/v1/message/group', //메세지그룹 목록 조회
                    create: '/rest/v1/message/create'  //메세지 생성
                },
                pagination: {rowsPerPage: 3},

                headers: [
                    {text: this.$i18n.td('message.message-group', '메세지 그룹'), align: 'center', sortable: false, value: 'messageGroup', width: '150px'},
                    {text: this.$i18n.td('message.message-code', '메세지 코드'), align: 'center', sortable: false, value: 'messageCode', width: '200px'}
                ],
                selected: [],
                selectedMessage: '',
                systemSearchValues: [],

                tholder: '',
                searchText: '',
                messageList: [],
                messageGroups: [],
                languages: [],
                checkNewCode: false,

                systemKey: '',
                messageGroup: {},
                messageCode: [],

                locale: [],
                messageGroupText: '',
                messageCodeText: '',
                messageText: {},

                messageForSave: {
                    systemKey: '',
                    messageGroup: '',
                    messageCode: ''
                },

                isExistMessageGroup: true,

                totalItems: 0,
                rowselected: '',
                languageSelected: '',

                detailTextDialog: false
            };
        },
        mounted() {
            this.systemKey = this.$store.state.loginStore.systemKey;
            this.searchLanguageList();
            this.searchMessageGroups();
            this.searchMessage();
            this.initSystemKeySelect();
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
            searchLanguageList() {
                const url = this.url.lang;
                var that = this;
                axios.get(url).then(res => {
                    var langList = res.data;
                    langList.forEach(function (value) {
                        that.languages.push(value.lang);
                    });
                    that.addDynamicColumn(that.languages);
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            initSystemKeySelect() {
//                const url = "/rest/v1/system"
//                let that = this
//                axios.get(url).then(res => {
//                  that.systemSearchValues = res.data
//                  that.searchSystemKey = that.systemSearchValues[0].systemKey
//                  that.treeSystemKey = that.searchSystemKey;
//                })
                this.systemSearchValues = this.$store.state.loginStore.systemList;
            },
            rowDoubleClick(item) {
                this.selected = item;
                this.rowselected = item.messageGroup + '.' + item.messageCode;

                let mGroup, mCode, mMessage;
                mGroup = this.selected.messageGroup;
                mCode = this.selected.messageCode;
                mMessage = this.selected[this.$i18n.locale];

                this.$emit('applyDialog', {'mGroup': mGroup, 'mCode': mCode, 'mMessage': mMessage, 'dialogFrom': this.dialogFrom});
            },
            rowClick(item) {
                this.selected = item;
                this.rowselected = item.messageGroup + '.' + item.messageCode;
            },
            languageClick(lang) {
                this.languageSelected = lang;
                this.detailTextDialog = true;
            },
            addDynamicColumn(arrLang) {
                let that = this;
                arrLang.forEach(function (value) {
                    var titleStr = 'language.' + value;
                    that.tholder = that.tholder + that.$i18n.td(titleStr, value) + '/';
                    that.headers.push(
                        {text: that.$i18n.td(titleStr, value), align: 'center', sortable: false, value: value}
                    );
                    that.messageText[value] = '';
                });

                this.tholder = this.tholder.substr(0, this.tholder.length - 1);
            },

            closeDetailTextDialog() {
                this.detailTextDialog = false;
            },
            //팝업 닫기
            closeDialog() {
                this.$emit('closeDialog');
            },
            //팝업 적용
            applyDialog() {
                //1-1. New check true -> dropdown, input
                //2-1. dropdown value == '' -> group = group input, code = code input, message = message input
                //2-2. dropdown value != '' -> group = dropdown, code = code input, message = message input
                //1-2. New check false -> grid radio check
                //3-1.radio check false -> error message
                //3-2.radio check true -> group = group column, code = code column, message = locale message
                // this.$emit('applyDialog', {"group" : });
                let mGroup, mCode, mMessage;
                if (this.checkNewCode == true) {
                    if (this.messageGroup == '') {
                        mGroup = this.messageGroupText;
                    } else {
                        mGroup = this.messageGroup;
                    }
                    mCode = this.messageCodeText;
                    mMessage = this.messageText[this.$i18n.locale];
                } else {
                    if (this.selected == undefined) {

                    } else {
                        mGroup = this.selected.messageGroup;
                        mCode = this.selected.messageCode;
                        mMessage = this.selected[this.$i18n.locale];
                    }
                }

                // 값이 선택되지 않았거나 입력하지 않은 경우 alert
                if (this.isEmpty(mGroup) || typeof mGroup != 'string' || this.isEmpty(mCode)) {
                    //새로운 코드입력
                    if (this.checkNewCode == true) {
                        if (this.isEmpty(mGroup) || typeof mGroup != 'string') {
                            this.$notify({
                                title: this.$i18n.td('message.error', '오류'),
                                text: this.$i18n.td('message.input-required', '메세지 그룹을 입력해주세요.', [this.$i18n.td('message.message-group', '메세지 그룹') + '을']),
                                type: 'error'
                            });
                            return;
                        }
                        if (this.isEmpty(mCode)) {
                            this.$notify({
                                title: this.$i18n.td('message.error', '오류'),
                                text: this.$i18n.td('message.input-required', '메세지 코드를 입력해주세요.', [this.$i18n.td('message.message-code', '메세지 코드') + '를']),
                                type: 'error'
                            });
                            return;
                        }
                    } else {
                        this.$notify({
                            title: this.$i18n.td('message.error', '오류'),
                            text: this.$i18n.td('menu-message.select-message-if-use-already-exist', '기존에 있는 메세지를 사용할 경우 목록에서 선택해 주세요.'),
                            type: 'error'
                        });
                        // alert(this.$i18n.td('common-message.select-required', '그리드', [this.$i18n.td('common-message.message-to-apply', 'Message to be applied')]))
                        return;
                    }
                }
                this.messageForSave.systemKey = this.systemKey;
                this.messageForSave.messageGroup = mGroup;
                this.messageForSave.messageCode = mCode;
                let that = this;
                for (let lang in that.languages) {
                    let l = that.languages[lang];
                    that.messageForSave[l] = that.messageText[l];
                }

                // new code 생성인 경우 create, grid 선택한 경우 파라미터만 부모화면에 넘긴다
                if (this.checkNewCode == true) {
                    axios.post('/rest/v1/message/create', this.messageForSave)
                    .then(response => {
                        this.$emit('applyDialog', {'mGroup': mGroup, 'mCode': mCode, 'mMessage': mMessage, 'dialogFrom': this.dialogFrom}); // this.messageForSave 로 변경할수있도록 메인화면에서 messageGroup/messageCode 로 사용
                        this.$notify({
                            title: this.$i18n.td('message.created', '추가'),
                            text: this.$i18n.td('menu-message.message-created-and-applied', '새로운 메세지를 생성하여 적용하였습니다.'),
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        this.$notify({
                            title: this.$i18n.td('message.fail', '실패'),
                            text: error.response.data.message,
                            type: 'success'
                        });
                    });
                } else {
                    this.$emit('applyDialog', {'mGroup': mGroup, 'mCode': mCode, 'mMessage': mMessage, 'dialogFrom': this.dialogFrom}); // this.messageForSave 로 변경할수있도록 메인화면에서 messageGroup/messageCode 로 사용
                    this.$notify({
                        title: this.$i18n.td('message.apply', '적용'),
                        text: this.$i18n.td('TODO', '메세지가 적용되었습니다.'),
                        type: 'success'
                    });
                }

            },

            isEmpty(val) {
                if (val == undefined || val == null || val == '') {
                    return true;
                } else {
                    return false;
                }
            },

            searchMessage() {
                const url = this.url.searchMessage;
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        systemKey: that.systemKey,
                        group: '',
                        code: '',
                        message: that.searchText
                    }
                }).then(res => {
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.rowselected = [];
                    that.messageList = content;
                    that.loading = false;
                });
            },
            searchMessageGroups() {
                const url = this.url.searchMessageGroup;
                let that = this;
                axios.get(url, {
                    params: {
                        systemKey: that.systemKey,
                    }
                }).then(res => {
                    let groups = res.data;
                    that.messageGroups = groups;
                    that.messageGroups.push({'groupKey': this.$i18n.td('message.new-group', 'Create New Group'), 'groupValue': ''});
                });
            },
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchMessage();
            },
            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.checkAboutSearchCondition();
                this.searchMessage();
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
    .popup-datatable-ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        column-width: 30px;
        cursor: default;
    }
</style>
