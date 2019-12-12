<template>
    <div id="agreement">
        <page-title />

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!--Search Item 1st : title-->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" v-model.trim="searchCondition.searchText" @keyup.enter="callbackPagination(1)" :label="$td('','제목')"
                                  maxlength="50"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <v-select name="searchGroupCode" :items="searchCondition.searchGroupCodes" v-model="searchCondition.searchGroupCode"
                              :label="$td('','그룹')"></v-select>
                </div>
            </div>

            <!-- [SEARCH] 2nd row, Event Date -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{ $td('', '작성일자') }}</div>
                    <double-calendar :fromDoubleObj="fromDate" :endDoubleObj="endDate" :term="30"
                                     v-on:update:fromDoubleObj="fromDate.dateText= $event"
                                     v-on:update:endDoubleObj="endDate.dateText= $event">
                    </double-calendar>
                </div>
            </div>
        </div>

        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{$td('button.search','조회')}}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <div class="table-area">
                <!-- [TABLE] Table information(counter, page size, etc) -->
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                    <div class="table__info__label"></div>
                </div>
                <!-- [TABLE] Table information(counter, page size, etc) END -->
                <!-- [TABLE] Table actions -->
                <div class="table__action" v-if="menuAuth.create || menuAuth.update">
                    <div class="table__action__default">
                        <v-btn @click.native="openCreateDialog()" v-if="menuAuth.create">{{$td('button.add','추가')}}</v-btn>
                    </div>
                    <div class="table__action__optional"></div>
                </div>
                <!-- [TABLE] Table actions END -->

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table :headers="headers" :items="items" item-key="agreementId" :pagination.sync="pagination" :loading="loading" :total-items="totalItems"
                                  hide-actions>
                        <template slot="items" slot-scope="props">
                            <td v-clickable @click="openDetailDialog(props.item.agreementId)">{{ props.item.agreementTitle }}</td>
                            <td class="text-xs-center" itemref="groupCodes">{{ getCodeValue('GROUP-CODE',props.item.groupCode)}}</td>
                            <td class="text-xs-center">{{ props.item.agreementCategoryName}}</td>
                            <td class="text-xs-center">{{ props.item.agreementVersion}}</td>
                            <td class="text-xs-center">{{ props.item.mandatoryYn == 'Y' ? $td('message.mandatory', '필수') : $td('message.optional', '선택')}}</td>
                            <td class="text-xs-center">{{ props.item.fullName}}({{props.item.login}})</td>
                            <td class="text-xs-center"> {{ props.item.createDate | moment(dateTimePattern()) }}</td>
                            <td class="text-xs-center">{{ props.item.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            <td class="text-xs-center" v-if="menuAuth.create || menuAuth.update" :title="modifyTitle">
                                <v-btn icon @click="editItem(props.item)">
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

        <!-- Dialog Area -->
        <agreement-dialog ref="agreementDialog" :showDialog="createDialog" :agreement="agreement" :mode="mode" @closeDialog="closeCreateDialog"></agreement-dialog>
        <agreement-detail-dialog :showDialog="detailDialog" @closeDialog="closeDetailDialog" :agreement="agreementDetail" @updateAgreement="editItem"></agreement-detail-dialog>
    </div>
</template>

<script>
    import DoubleCalendar from '@/components/DoubleCalendar';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import CommonPagination from '../Common/CommonPagination';
    import AgreementDetailDialog from '@/containers/Std/AgreementDetailDialog';
    import AgreementDialog from '@/containers/Std/AgreementDialog';
    import CodeValService from '@/util/code/CodeValService';
    import CodeService from '../../util/code/CodeService';

    export default {
        components: {DoubleCalendar, CommonPagination, CommonPageSizeSelector, AgreementDetailDialog, AgreementDialog, CodeValService},
        data() {
            return {
                searchCondition: {
                    searchText: '',
                    searchGroupCodes: [],
                    searchGroupCode: ''
                },
                /* DoubleCalendar */
                fromDate: {
                    dateText: '',
                    dateDisplay: false,
                },
                endDate: {
                    dateText: '',
                    dateDisplay: false,
                },
                totalItems: 0,
                items: [],
                loading: true,
                pagination: {rowsPerPage: 15},
                agreementId: '',
                mode: '',
                agreement: {
                    agreementId: '',
                    agreementCategory: '',
                    agreementCategoryName: '',
                    groupCode: '',
                    agreementTitle: '',
                    agreementContents: '',
                    agreementVersion: '',
                    createUserId: '',
                    createDate: '',
                    login: '',
                    fullName: '',
                    mode: '',
                    useYn: ''
                },
                agreementDetail: {
                    agreementId: 0,
                    agreementCategory: '',
                    groupCode: '',
                    agreementTitle: '',
                    agreementContents: '',
                    agreementVersion: '',
                    createUserId: '',
                    login: '',
                    fullName: '',
                    createDate: '',
                    mandatoryYn: '',
                    useYn: ''
                },
                maxVersion: {},

                detailDialog: false,
                createDialog: false,

                modifyTitle: this.$i18n.td('button.update', '수정'),
                headersWithAction: [
                    {text: this.$i18n.td('', '제목'), width: '35%', align: 'center', sortable: false, value: 'agreementTitle'},
                    {text: this.$i18n.td('', '그룹'), width: '10%', align: 'center', sortable: false, value: 'groupCode'},
                    {text: this.$i18n.td('', '약관 분류'), width: '10%', align: 'center', sortable: false, value: 'agreementCategoryName'},
                    {text: this.$i18n.td('', '버전'), width: '10%', align: 'center', sortable: false, value: 'agreementVersion'},
                    {text: this.$i18n.td('', '필수여부'), width: '5%', align: 'center', sortable: false, value: 'mandatoryYn'},
                    {text: this.$i18n.td('', '작성자'), width: '10%', align: 'center', sortable: false, value: 'createUserId'},
                    {text: this.$i18n.td('', '작성일시'), width: '15%', align: 'center', sortable: false, value: 'createDate'},
                    {text: this.$i18n.td('', '사용여부'), width: '5%', align: 'center', sortable: false, value: 'useYn'},
                    {text: this.$i18n.td('button.update', '수정'), width: '5%', align: 'center', sortable: false, value: ''}
                ],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                }

            }
                ;
        },
        computed: {
            formTitle() {
                return this.editedIndex === -1 ? this.$i18n.td('message.user', '사용자') + ' ' + this.$i18n.td('button.add', '추가') : this.$i18n.td('message.user', '사용자') + ' '
                    + this.$i18n.td('button.update', '수정');
            },
            headers() {
                return this.headersWithAction;
            },
            pages() {
                if (this.pagination.rowsPerPage == null ||
                    this.pagination.totalItems == null
                ) {
                    return 0;
                }
                return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
            }
        },
        watch: {
            dialog(val) {
                val || this.closeDialog();
            }
        },
        created() {
            this.checkAboutSearchCondition();
            // this.searchAgreement();
            // vuetify의 v-pagination 내부 초기화로직(page 1로 변경) 수행 후 수행되도록
            if (this.$route.query.pagination) {
                this.$nextTick(() => { this.pagination = this.$route.query.pagination; });
            }
            this.searchCondition.searchGroupCodes = CodeService.getCodeDetailList('GROUP-CODE', true);
        },
        methods: {

            callbackPagination(page) {
                this.pagination.page = Number(page);
                this.checkAboutSearchCondition();
                this.searchAgreement();
            },
            callbackPageSizeSelector(page) {
                this.pagination.rowsPerPage = Number(page);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.searchAgreement();
            },

            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition || this.$route.query.pagination) {
                    this.searchCondition = this.$route.query.searchCondition;
                    this.pagination = this.$route.query.pagination;
                }
            },
            searchAgreement() {
                const url = '/rest/v1/std/agreement/list';
                const {page, rowsPerPage} = this.pagination;
                this.$http.get(url, {
                    params: {
                        page: page - 1,
                        size: rowsPerPage,
                        searchText: this.searchCondition.searchText,
                        searchGroupCode: this.searchCondition.searchGroupCode,
                        fromDateText: this.fromDate.dateText,
                        endDateText: this.endDate.dateText
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.totalItems = res.data.totalElements;
                    this.items = content;
                    this.loading = false;
                });
            },
            openCreateDialog() {
                this.resetAgreement();
                this.mode = 'CREATE';
                this.createDialog = true;
                this.$refs.agreementDialog.getMaxVersionByCategory();
            },
            closeCreateDialog() {
                this.createDialog = false;
                this.searchAgreement();
            },
            resetAgreement() {
                this.agreement = {agreementTitle: '', agreementContents: '', useYn: 'N', mandatoryYn: 'N', agreementCategory: null};
            },
            openDetailDialog(agreementId) {
                this.agreement.agreementId = agreementId;
                this.getAgreementDetail(agreementId);
            },
            closeDetailDialog() {
                this.detailDialog = false;
                this.searchAgreement();
            },
            getAgreementDetail() {
                const url = '/rest/v1/std/agreement/detail/' + this.agreement.agreementId;
                let that = this;
                this.$http.get(url).then(res => {
                    that.agreementDetail = res.data;
                    that.originAgreement = Object.assign({}, that.agreementDetail);
                    this.detailDialog = true;
                })
                .catch(error => {
                });
            },
            editItem(item) {
                this.mode = 'UPDATE';
                this.editedIndex = this.items.indexOf(item);
                this.agreement = Object.assign({}, item);
                this.createDialog = true;
            }

        }
    };
</script>

<style scoped>
    #user-list-page table.datatable {
        table-layout: fixed;
    }
</style>
