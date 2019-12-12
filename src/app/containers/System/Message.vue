<template>
    <div id="message-page">
        <!--  Title Area -->
        <page-title></page-title>
        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col3">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchGroup" @keyup.enter="callbackPagination(1)" v-model.trim="searchGroup" :label="$td('message.message-group', '메세지 그룹')"
                                  maxlength="50"></v-text-field>
                    <!-- :placeholder="$td('message.message-group', '메세지 그룹')"  -->
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchCode" @keyup.enter="callbackPagination(1)" v-model.trim="searchCode" :label="$td('message.message-code', '메세지 코드')"
                                  maxlength="100"></v-text-field>
                    <!-- :placeholder="$td('message.message-code', '메세지 코드')"  -->
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" @keyup.enter="callbackPagination(1)" v-model.trim="searchText" v-bind:label="$td('message.message', 'Message')"
                                  :placeholder="languageLabel" maxlength="1000"></v-text-field>
                </div>
            </div>
        </div>
        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{ $td('button.search', 'Search') }}</v-btn>
        </div>


        <!-- [CONTENT] Content area -->
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
                <!-- [TABLE] Table actions -->
                <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                    <div class="table__action__default">
                        <v-btn slot="activator" v-if="menuAuth.create" @click.native="openDialog()">{{ $td('button.add', '추가') }}</v-btn>
                        <v-btn :disabled="selected.length <= 0" v-if="menuAuth.delete" @click.native="openConfirmDialog()">{{ $td('button.delete', '삭제') }}</v-btn>
                        <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                    </div>
                </div>

                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="groupCode"
                                  v-model="selected" select-all :pagination.sync="pagination" :loading="loading" :total-items="totalItems" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.messageCode" />
                            </td>
                            <td class="text-xs-left">{{ props.item.messageGroup }}</td>
                            <td class="text-xs-left">{{ props.item.messageCode }}</td>
                            <td class="text-xs-left ellipsis" v-for="lang in languages">{{ props.item[lang]}}</td>
                            <td class="text-xs-center" v-if="menuAuth.update">
                                <v-btn icon class="mx-0" @click="editItem(props.item)" :title="modifyTitle">
                                    <v-icon style="color: #2A96FD;">edit</v-icon>
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

        <!-- [MODAL] 삭제 모달 -->
        <v-layout row justify-center>
            <v-dialog v-model="confirmDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text> {{$td('message.delete-confirm', '삭제하시겠습니까?') }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="disagree">{{$td('button.no', '아니요')}}</v-btn>
                        <v-btn @click.native="agree">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>

        <!-- [MODAL] 삭제 모달 -->
        <!--<v-layout row justify-center>-->
        <!--<v-dialog v-model="singleDeleteDialog" persistent max-width="290">-->
        <!--<v-card>-->
        <!--<v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>-->
        <!--<v-card-text> {{ $td('message.delete-confirm', '삭제하시겠습니까?') }} </v-card-text>-->
        <!--<v-card-actions>-->
        <!--<v-spacer></v-spacer>-->
        <!--<v-btn @click.native="singleDisagree">{{$td('button.no', '아니요')}}</v-btn>-->
        <!--<v-btn @click.native="singleAgree(item)">{{$td('button.yes', '예')}}</v-btn>-->
        <!--</v-card-actions>-->
        <!--</v-card>-->
        <!--</v-dialog>-->
        <!--</v-layout>-->

        <!-- Add, Edit Dialog Area -->
        <message-add-popup :languages="this.languages" :edited-index="editedIndex" :edited-item="editedItem" :show-dialog="dialog" @closeDialog="closeDialog">
        </message-add-popup>
    </div>
</template>

<script>
    import axios from 'axios';
    import MessageAddPopup from '@/containers/System/MessagePopup/MessageAddPopup';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';

    export default {
        components: {
            MessageAddPopup,
            CommonPagination,
            CommonPageSizeSelector
        },
        data() {
            return {
                url: {
                    lang: '/rest/v1/message/lang',
                    search: '/rest/v1/message',
                    create: '/rest/v1/message/create',
                    delete: '/rest/v1/message/delete',
                    update: '/rest/v1/message/update',
                    excel: '/rest/v1/message/list/filtered'
                },
                searchSystemKey: this.$store.state.loginStore.systemKey,
                searchGroup: '',
                searchCode: '',
                searchText: '',
                totalItems: 0,
                items: [],
                loading: true,
                pagination: {rowsPerPage: 3},
                selected: [],
                downloadHeaders: {},
                headers: [
                    {text: this.$i18n.td('message.message-group', '메세지 그룹'), align: 'center', sortable: false, value: 'messageGroup', width: '140px'},
                    {text: this.$i18n.td('message.message-code', '메세지 코드'), align: 'center', sortable: false, value: 'messageCode', width: '220px'}
                ],
                languages: [],
                dialog: false,
                editedIndex: -1,
                editedItem: {
                    systemKey: '',
                    messageGroup: '',
                    messageCode: ''
                },
                defaultItem: {
                    systemKey: this.$store.state.loginStore.systemKey,
                    messageGroup: '',
                    messageCode: ''
                },
                modifyTitle: this.$i18n.td('button.update', '수정'),
                confirmDialog: false,
                // singleDeleteDialog:false,
                singeDelete: [],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        created() {
            this.downloadHeaders[this.$i18n.td('message.message-group', '메세지 그룹')] = 'messageGroup';
            this.downloadHeaders[this.$i18n.td('message.message-code', '메세지 코드')] = 'messageCode';
        },
        computed: {
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null
                ) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            },

            languageLabel: function () {
                let lang = this.languages;
                let that = this;
                let strLang = '\'';
                lang.forEach(function (element) {
                    strLang = strLang + that.$i18n.td('language.' + element, '??') + '\' ' + that.$i18n.td('message.or', '또는') + ' \'';
                });
                return strLang.substr(0, strLang.length - 4) + ' ' + that.$i18n.td('message.message', '메세지');
            }
        },

        watch: {
            pagination: function () {
                this.searchMessage();
            },
            dialog(val) {
                val || this.closeDialog();
            }
        },

        mounted() {
            //system language 조회하여 컬럼에 추가
            this.searchLanguageList();
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
                    this.searchSystemKey = this.$route.query.searchCondition.searchSystemKey;
                    this.searchGroup = this.$route.query.searchCondition.searchGroup;
                    this.searchCode = this.$route.query.searchCondition.searchCode;
                    this.searchText = this.$route.query.searchCondition.searchText;
                }
            },
            addDynamicColumn(arrLang) {
                let that = this;
                arrLang.forEach(function (value) {
                    var titleStr = 'language.' + value;
                    that.headers.push(
                        {text: that.$i18n.td(titleStr, value), align: 'center', sortable: false, value: value, width: (100 / arrLang.lenght) + '%'}
                    );
                    that.editedItem[value] = '';
                    that.defaultItem[value] = '';
                    that.downloadHeaders[that.$td(titleStr, value)] = value;
                });
                if (this.menuAuth.update) {
                    that.headers.push({text: that.$i18n.td('button.update', '수정'), align: 'center', sortable: false, value: 'modify', width: '60px'});
                }
            },
            searchMessage() {
                const url = this.url.search;
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                var storedSystemKey = this.$store.state.loginStore.systemKey;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        systemKey: storedSystemKey,//this.searchSystemKey,
                        group: this.searchGroup,
                        code: this.searchCode,
                        message: this.searchText
                    }
                }).then(res => {
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.selected = [];
                    that.items = content;
                    that.loading = false;
                });
            },

            editItem(item) {
                this.editedIndex = this.items.indexOf(item);
                this.editedItem = Object.assign({}, item);
                this.dialog = true;
            },

            showDetailItem(item) {
                this.editedIndex = this.items.indexOf(item);
                this.editedItem = Object.assign({}, item);
                this.dialog = true;
            },

            deleteMessage(item) {
                var url = this.url.delete;
                let that = this;

                var param = {};
                if (item != null) {
                    param = item;
                } else {
                    param = this.selected;
                }
                axios.post(url, param)
                .then(res => {
                    this.$notify({
                        title: this.$i18n.td('button.delete', '삭제'),
                        text: this.$i18n.td('message.deleted', '삭제되었습니다.'),
                        type: 'success'
                    });
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.selected = [];
                    that.items = content;
                    that.loading = false;
                });
            },
            openDialog() {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.dialog = true;
            },
            closeDialog(searchAfterClose) {
                this.dialog = false;
                setTimeout(() => {
                    this.editedItem = Object.assign({}, this.defaultItem);
                    this.editedIndex = -1;
                    if (searchAfterClose) {
                        this.searchMessage();
                    }
                }, 300);
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                this.deleteMessage();
            },
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            // singleDisagree(){
            //     this.singleDeleteDialog =false;
            // },
            // singleAgree(){
            //     this.singleDeleteDialog =false;
            //     this.deleteMessage(this.singeDelete);
            //     this.singeDelete =[]
            // },
            // openSingleDeleteDialog(item){
            //     this.singleDeleteDialog =true;
            //     this.singeDelete.push(item);
            // }
            async getExcelList() {
                const url = this.url.excel;
                var storedSystemKey = this.$store.state.loginStore.systemKey;
                let returnData = await axios.get(url, {
                    params: {
                        systemKey: storedSystemKey,//this.searchSystemKey,
                        group: this.searchGroup,
                        code: this.searchCode,
                        message: this.searchText
                    }
                });
                return returnData.data;
            },
        }
    };
</script>

<style>
    #message-page table.datatable {
        table-layout: fixed;
    }
</style>
