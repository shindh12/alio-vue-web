<template>
    <div class="isdp-body-content">
        <!--  Title Area -->
        <page-title></page-title>

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field
                        name="searchText"
                        @keyup.enter="callbackPagination(1)"
                        v-model.trim="searchText"
                        :label="$td('menu-terms.terms-key', '약관키')"
                        :placeholder="'\''+$td('menu-terms.terms-key', '약관키') + '\' '+$td('message.or', '또는')+' \'' + $td('menu-terms.terms-name', '약관명')+ '\''"
                        maxlength="100"
                    ></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('menu-terms.published-yn', '발행여부')}}</div>
                    <span class="---has-to-be-span---">
                <v-select
                    :items="dropdownPublishedYn"
                    class="narrow-search-select"
                    item-text="key"
                    item-value="value"
                    v-model="publishedYn"
                    single-line />
              </span>

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
                        <v-btn slot="activator" v-if="menuAuth.create" @click.native="createNewItem()">{{ $td('button.add', '추가') }}</v-btn>
                        <download-excel style="display:inline-block; margin-left:5px;" :fetch="getExcelList" name="export.xls" :fields="downloadHeaders">
                            <v-btn :disabled="totalItems==0">{{$td('button.download', '다운로드')}}</v-btn>
                        </download-excel>
                    </div>
                    <!--<div class="table__action__optional">-->
                    <!--<v-icon v-col-green>brightness_1</v-icon>-->
                    <!--<span v-col-green class="subheading"> Create New Version </span>-->
                    <!--<v-icon v-col-blue>edit</v-icon>-->
                    <!--<span v-col-blue class="subheading"> Update </span>-->
                    <!--</div>-->
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="messageCode" :pagination.sync="pagination" :loading="loading"
                                  :total-items="totalItems" hide-actions>
                        <!-- <template slot="headerCell" slot-scope="props"> 공통으로 다같이 빼재요
                            <v-tooltip bottom> <span slot="activator"> {{ props.header.text }} </span> <span> {{ props.header.text }} </span> </v-tooltip>
                        </template> -->
                        <template slot="items" slot-scope="props">
                            <td class="text-xs-left">{{ props.item.termsKey }}</td>
                            <td class="text-xs-center">{{ props.item.version }}</td>
                            <td v-clickable class="text-xs-left">
                                <span @click="editItem(props.item, 'D')">{{ props.item.termsName }}</span>
                            </td>
                            <td class="text-xs-center">
                                <span v-if="props.item.mandatoryYn == 'N'">{{ $td('message.optional', '선택') }}</span>
                                <span v-else-if="props.item.mandatoryYn != 'N'">{{ $td('message.mandatory', '필수') }}</span>
                            </td>
                            <td class="text-xs-center">
                                <span v-if="props.item.publishedYn == 'N'">{{ $td('menu-terms.published-n', '미발행') }}</span>
                                <span v-else-if="props.item.publishedYn != 'N'">{{ $td('menu-terms.published-y', '발행') }}</span>
                            </td>
                            <td class="text-xs-center">{{ props.item.publishedDate | moment(datePattern()) }}</td>
                            <td class="text-xs-center" v-if="menuAuth.create || menuAuth.update">
                                <v-btn v-if="props.item.action == 'U'" icon class="mx-5" @click="editItem(props.item, 'U')" :title="tooltipTitle.modify">
                                    <v-icon style="color: #2A96FD;">edit</v-icon>
                                </v-btn>
                                <v-btn v-else-if="props.item.action == 'C'" icon @click="editItem(props.item, 'C')" :title="tooltipTitle.add">
                                    <v-icon style="color: #2A96FD;">note_add</v-icon>
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

        <!-- Add, Edit Dialog Area -->
        <terms-detail :languages="languages" :edited-index="editedIndex" :edited-item="editedItem" :show-dialog="dialog" :edit-type="editType"
                      @closeDialog="closeDialog"></terms-detail>
    </div>
</template>

<script>
    import axios from 'axios';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import TermsDetail from '@/containers/System/TermsPopup/TermsDetailPopup';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            TermsDetail
        },
        data() {
            return {
                url: {
                    lang: '/rest/v1/message/lang',
                    search: '/rest/v1/terms',
                    create: '/rest/v1/terms/create',
                    delete: '/rest/v1/terms/delete',
                    update: '/rest/v1/terms/update',
                    excel: '/rest/v1/terms/list/filtered'
                },
                editedIndex: -1,
                editedItem: [],

                languages: [],
                mySystemKey: this.$store.state.loginStore.systemKey, //TODO

                searchSystemKey: this.$store.state.loginStore.systemKey,
                searchText: '',
                publishedYn: '',

                totalItems: 0,
                items: [],
                loading: true,
                pagination: {rowsPerPage: 10},
                tooltipTitle: {
                    modify: this.$i18n.td('button.update', '수정'),
                    add: this.$i18n.td('button.add', '추가'),
                },
                dropdownPublishedYn: [
                    {key: this.$i18n.td('message.all', '전체'), value: ''},
                    {key: this.$i18n.td('menu-terms.published-y', '발행'), value: 'Y'},
                    {key: this.$i18n.td('menu-terms.published-n', '미발행'), value: 'N'}
                ],
                termsHeaders: [
                    {text: this.$i18n.td('menu-terms.terms-key', '약관키'), width: '120px', align: 'center', sortable: false, value: 'termsKey'},
                    {text: this.$i18n.td('message.version', '버전'), width: '60px', align: 'center', sortable: false, value: 'version'},
                    {text: this.$i18n.td('menu-terms.terms-name', '약관명'), width: '', align: 'center', sortable: false, value: 'termsName'},
                    {text: this.$i18n.td('message.mandatory-yn', '필수여부'), width: '80px', align: 'center', sortable: false, value: 'mandatoryYn'},
                    {text: this.$i18n.td('menu-terms.published-yn', '발행여부'), width: '80px', align: 'center', sortable: false, value: 'publishedYn'},
                    {text: this.$i18n.td('menu-terms.published-date', '발행일자'), width: '110px', align: 'center', sortable: false, value: 'publishedDate'},
                    {text: this.$i18n.td('button.update', '수정'), width: '60px', align: 'center', sortable: false, value: 'action'}
                ],
                termsHeadersWithoutAction: [
                    {text: this.$i18n.td('menu-terms.terms-key', '약관키'), align: 'center', sortable: false, value: 'termsKey'},
                    {text: this.$i18n.td('message.version', '버전'), align: 'center', sortable: false, value: 'version'},
                    {text: this.$i18n.td('message.mandatory-yn', '필수여부'), align: 'center', sortable: false, value: 'mandatoryYn'},
                    {text: this.$i18n.td('menu-terms.terms-name', '약관명'), align: 'center', sortable: false, value: 'termsName'},
                    {text: this.$i18n.td('menu-terms.published-yn', '발행여부'), align: 'center', sortable: false, value: 'publishedYn'},
                    {text: this.$i18n.td('menu-terms.published-date', '발행일자'), align: 'center', sortable: false, value: 'publishedDate'},
                ],
                downloadHeaders: {},
                excelData: {},
                dialog: false,
                editType: '',
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },

            };
        },
        created() {
            this.downloadHeaders[this.$i18n.td('menu-terms.terms-key', '약관키')] = 'termsKey';
            this.downloadHeaders[this.$i18n.td('message.version', '버전')] = 'version';
            this.downloadHeaders[this.$i18n.td('menu-terms.terms-name', '약관명')] = 'termsName';
            this.downloadHeaders[this.$i18n.td('message.mandatory-yn', '환경변수 키')] = 'mandatoryYn';
            this.downloadHeaders[this.$i18n.td('menu-terms.published-yn', '환경변수 키')] = 'publishedYn';
            this.downloadHeaders[this.$i18n.td('menu-terms.published-date', '환경변수 키')] = 'publishedDate';
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
            headers() {
                return (this.menuAuth.create || this.menuAuth.update) ? this.termsHeaders : this.termsHeadersWithoutAction;
            }
        },
        watch: {
            pagination: function () {
                this.searchTerms();
            },
            dialog(val) {
                val || this.closeDialog();
            }
        },
        mounted() {
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
                }).catch(e => {
                    that.errors.push(e);
                });
            },
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchTerms();
            },

            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.checkAboutSearchCondition();
                this.searchTerms();
            },

            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition != undefined && this.$route.query.searchCondition.page != undefined) {
                    this.pagination.page = this.$route.query.searchCondition.page;
                    this.pagination.rowsPerPage = this.$route.query.searchCondition.size;
                    this.searchSystemKey = this.$route.query.searchCondition.searchSystemKey;
                    this.searchText = this.$route.query.searchCondition.searchText;
                    this.publishedYn = this.$route.query.searchCondition.publishedYn;
                }
            },

            searchTerms() {
                const url = this.url.search;
                const {page, rowsPerPage} = this.pagination;
                let that = this;
                axios.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        systemKey: this.searchSystemKey,
                        termsText: this.searchText,
                        publishedYn: this.publishedYn
                    }
                }).then(res => {
                    let content = res.data.content;
                    that.totalItems = res.data.totalElements;
                    that.items = content;
                    that.loading = false;
                });
            },
            editItem(item, editType) {
//          this.editedIndex = this.items.indexOf(item)
//          this.editedItem = Object.assign({}, item)
//          this.editType = editType
//          this.dialog = true

                let q = {
                    editType: editType,
                    version: item.version
                };

                this.$router.push({
                    path: '/system/terms/detail/' + item.termsKey,
                    query: q
                });

            },
            createNewItem() {
                this.$router.push({
                    path: '/system/terms/new',
                    query: {}
                });
            },

            closeDialog(searchAfterClose) {
                this.dialog = false;
                setTimeout(() => {
                    this.editedItem = Object.assign({}, this.defaultItem);
                    this.editedIndex = -1;
                    if (searchAfterClose) {
                        this.searchTerms();
                    }
                }, 300);
            },
            async getExcelList() {
                const url = this.url.excel;
                this.excelData = {};
                this.excelData = await axios.get(url, {
                    params: {
                        systemKey: this.searchSystemKey,
                        termsText: this.searchText,
                        publishedYn: this.publishedYn
                    }
                });
                let returnData = [];
                for (let i in this.excelData.data) {
                    let row = {};
                    row.termsKey = this.excelData.data[i].termsKey;
                    row.version = this.excelData.data[i].version;
                    row.termsName = this.excelData.data[i].termsName;
                    if (this.excelData.data[i].mandatoryYn === 'Y') {
                        row.mandatoryYn = this.$i18n.td('message.mandatory', '필수');
                    } else {
                        row.mandatoryYn = this.$i18n.td('message.optional', '선택');
                    }
                    if (this.excelData.data[i].publishedYn === 'Y') {
                        row.publishedYn = this.$i18n.td('menu-terms.published-y', '발행');
                    } else {
                        row.publishedYn = this.$i18n.td('menu-terms.published-n', '미발행');
                    }
                    row.publishedDate = this.$options.filters.moment(this.excelData.data[i].publishedDate, this.datePattern());
                    returnData.push(row);
                }
                return returnData;
            },
        }
    };
</script>

<style scoped></style>
