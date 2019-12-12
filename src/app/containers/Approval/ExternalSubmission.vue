<template>
    <div class="isdp-body-content">
        <!-- [TITLE] Title area -->
        <page-title />
        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchApprovalName" :label="message['title']" v-model.trim="searchCondition.approvalName" @keyup.enter="callbackPagination(1)"
                                  maxlength="100"></v-text-field>
                    <!--  :placeholder="message['title']" -->
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchApprovalUser" :label="message['current-approval-user']"
                                  :placeholder="'\''+message['username'] + '\' ' + this.message['or'] + ' \'' + message['id'] + '\''"
                                  v-model.trim="searchCondition.approvalUserText" @keyup.enter="callbackPagination(1)" maxlength="30"></v-text-field>
                </div>
            </div>
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{ message['status'] }}</div>
                    <div class="page-searchbox__item__select-wrapper" v-for="status in statusCodeList" :key="status.value">
                        <v-checkbox v-model="multipleStatusCodeList" :label="status.text" :value="status.value"></v-checkbox>
                    </div>
                </div>
            </div>
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{message['submission-date']}}</div>
                    <div class="page-searchbox__item-cell--datepicker-comboset__wrapper">
                        <v-menu ref="datepicker1"
                                :close-on-content-click="false"
                                v-model="datepicker1"
                                :nudge-right="40"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px">
                            <v-text-field class="search-datepicker"
                                          slot="activator"
                                          v-model.trim="searchCondition.fromSubmissionDateText"
                                          prepend-icon="event"
                                          readonly
                                          @blur="searchCondition.fromSubmissionDateText = parseDate(searchCondition.fromSubmissionDateText)" />
                            <v-date-picker v-model="searchCondition.fromSubmissionDateText" no-title @input="datepicker1 = false" />
                        </v-menu>
                        <v-menu ref="datepicker2"
                                :close-on-content-click="false"
                                v-model="datepicker2"
                                :nudge-right="40"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px">
                            <v-text-field class="search-datepicker"
                                          slot="activator"
                                          v-model.trim="searchCondition.toSubmissionDateText"
                                          prepend-icon="event"
                                          readonly
                                          @blur="searchCondition.toSubmissionDateText = parseDate(searchCondition.toSubmissionDateText)" />
                            <v-date-picker v-model.trim="searchCondition.toSubmissionDateText" no-title @input="datepicker2 = false" />
                        </v-menu>
                        <v-btn-toggle v-model="dateCount">
                            <v-btn value="1" @click="changeDate(1)"><span>{{ message['today'] }}</span></v-btn>
                            <v-btn value="7" @click="changeDate(7)"><span>{{ message['a-week'] }}</span></v-btn>
                            <v-btn value="30" @click="changeDate(30)"><span>{{ message['a-month'] }}</span></v-btn>
                        </v-btn-toggle>
                    </div>
                </div>
            </div>
        </div>

        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="callbackPagination(1)">{{ message['search'] }}</v-btn>
        </div>

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <div class="table-area">
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="approvalSize" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>

                <!-- [TABLE] Table actions -->
                <div class="table__action">
                    <div class="table__action__default">
                        <v-btn @click.native="openCreateDialog()" :disabled="!createValid">{{ message['create-approval'] }}</v-btn>
                    </div>
                </div>

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table
                        :headers="approvalHeaders"
                        :items="approvals"
                        :pagination.sync="pagination"
                        :loading="loading"
                        :total-items="approvalSize"
                        hide-actions
                        item-key="approvalId">

                        <!-- Grid Body -->
                        <template slot="items" slot-scope="props">
                            <tr>
                                <!-- 제목 -->
                                <td v-clickable @click="openDetailDialog(props.item.approvalId)" class="text-xs-left">{{ props.item.approvalName }}</td>
                                <td v-if="props.item.currentApprovalUserName != ''" class="text-xs-center">{{ props.item.currentApprovalUserName }} ({{
                                    props.item.currentApprovalUserLogin }})
                                </td>
                                <td v-if="props.item.currentApprovalUserName == ''" class="text-xs-center"></td>
                                <!-- 결재 상태 -->
                                <td class="text-xs-center">{{ getApprovalStatusName(props.item.statusCode) }}</td>
                                <!-- 상신일자 -->
                                <td class="text-xs-center">{{ props.item.submissionDate | moment(datetimePattern)}}</td>
                                <!-- Actions -->
                                <td class="justify-center layout px-0">
                                    <v-btn v-if="props.item.statusCode != 'CANCEL'" icon @click.stop="openConfirmCancelDialog(props.item)">
                                        <v-icon color="teal">cancel</v-icon>
                                    </v-btn>
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

                <!-- [MODAL] 삭제 모달 -->
                <v-layout row justify-center>
                    <v-dialog v-model="confirmCancelDialog" persistent max-width="290">
                        <v-card>
                            <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                            <v-card-text> {{message['confirm-cancel'] }}</v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click.native="disagreeCancel">{{$td('button.no', '아니요')}}</v-btn>
                                <v-btn @click.native="agreeCancel">{{$td('button.yes', '예')}}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-layout>

            </div>
        </div>

        <!-- Create Dialog Area -->
        <external-approval-dialog :showDialog="createDialog" @closeDialog="closeCreateDialog"></external-approval-dialog>
        <approval-detail-dialog :showDialog="detailDialog" @closeDialog="closeDetailDialog" :approval="selectedApproval" :files="selectedApprovalFiles"></approval-detail-dialog>
    </div>
</template>

<script>

    /* Conponent Import */
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import axios from 'axios';
    import ExternalApprovalDialog from './ApprovalDialog/ExternalApprovalDialog';
    import ApprovalDetailDialog from './ApprovalDialog/ApprovalDetailDialog';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            axios,
            ExternalApprovalDialog,
            ApprovalDetailDialog
        },
        data() {
            return {
                currentUserLogin: '',
                selectedApprovalId: '',
                confirmCancelDialog: false,
                selectedApproval: {
                    approvalInfo: {
                        systemKey: '',
                        approvalId: '',
                        externalApprovalId: '',
                        approvalType: '',
                        approvalName: '',
                        submissionUserId: '',
                        submissionUserLogin: '',
                        submissionUserName: '',
                        currentApprovalSequence: '',
                        submissionDescription: '',
                        submissionDate: '',
                        statusCode: '',
                        createUserId: '',
                        createDate: '',
                        updateUserId: '',
                        updateDate: '',
                        cancelOpinion: '',
                        fileGroupId: ''
                    },
                    approvalLineInfo: []
                },
                selectedApprovalFiles: [],
                multipleStatusCodeList: ['INPROGRESS', 'COMPLETE', 'DISAPPROVAL', 'CANCEL'],
                searchCondition: {
                    systemKey: this.$store._modules.root.state.loginStore.systemKey,
                    approvalName: '',
                    multipleStatusCode: '',

                    //상신자
                    submissionUserLogin: this.$store._modules.root.state.loginStore.currentUser.login,
                    submissionUserName: '',
                    submissionUserId: '',
                    submissionUserText: '',

                    //결재자
                    approvalUserLogin: '',
                    approvalUserName: '',
                    approvalUserText: '',

                    fromSubmissionDateText: '',
                    toSubmissionDateText: ''
                },
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.')
                },
                selectedApprovalId: '',
                approvals: [],
                statusCodeList: [],
                approvalSize: 0,
                loading: true,
                pagination: {page: 1, rowsPerPage: 10},
                approvalHeaders: [],
                datepicker1: false,
                datepicker2: false,
                dateCount: 1,

                //Dialog
                detailDialog: false,
                createDialog: false,
                createValid: false,

                message: {
                    'canceled': ''
                    , 'cancel-failed': ''
                    , 'title': '' //제목
                    , 'status': '' //결재 상태
                    , 'pending-user': '' //미결자
                    , 'submission-date': '' //상신일자
                    , 'action': '' //Action
                    , 'approval-status-inprogress': ''//진행중
                    , 'approval-status-complete': ''//승인
                    , 'approval-status-disapproval': ''//반려
                    , 'cancel': '' //취소
                    , 'today': '' //오늘
                    , 'a-week': '' //1주일
                    , 'a-month': '' //1개월
                    , 'start-date': '' //시작일자
                    , 'end-date': '' //종료일자
                    , 'current-approval-user': '' //현재 결재자
                    , 'current-approval-login': '' //현재 결재자 ID
                    , 'current-approval-username': '' //현재 결재자명
                    , 'search': ''
                    , 'create-approval': ''
                    , 'username': ''
                    , 'id': ''
                    , 'confirm-cancel': ''
                }

            };
        },
        computed: {
            pages() {
                return Math.ceil(this.approvalSize / this.pagination.rowsPerPage);
            },
            datetimePattern() {
                let sessionDatePatern = this.$store._modules.root.state.loginStore.currentUser.datetimePattern;
                if (sessionDatePatern == '') {
                    sessionDatePatern = 'YYYY-MM-DD HH:mm:ss'; //Default
                }
                sessionDatePatern = sessionDatePatern.replace('yyyy', 'YYYY').replace('dd', 'DD');
                return sessionDatePatern;
            }
        },

        mounted() {

            //다국어 메세지 조회
            this.messageLoad();
            //코드값 설정
            this.getStatusCodeList();
            //그리드 헤더 설정
            this.getGridHeader();

            this.getCurrentUser();

            this.changeDate(30);

        },
        methods: {
            movePage(index) {
                this.loading = true;
                this.pagination.page = index;

                let fromDate = new Date(this.searchCondition.fromSubmissionDateText);
                let toDate = new Date(this.searchCondition.toSubmissionDateText);

                if (fromDate > toDate) {
                    this.$notify({text: this.message['date-range-error'], type: 'warn'});
                    this.loading = false;
                    return false;
                }

                let parameter = this.searchCondition;
                parameter.multipleStatusCode = this.multipleStatusCodeList.join();
                parameter.page = index - 1;
                parameter.size = this.pagination.rowsPerPage;

                axios.get('/rest/v1/approval/e/submission', {params: parameter})
                .then(response => {
                    let approvalList = response.data.page.content;
                    this.loading = false;
                    this.approvals = approvalList;
                    this.approvalSize = response.data.page.totalElements;
                })
                .catch(error => {

                });
            },
            disagreeCancel() {
                this.confirmCancelDialog = false;
            },
            agreeCancel() {
                console.log('11111111111111111111');
                console.log(this.cancelItem);
                console.log('11111111111111111111');
                this.confirmCancelDialog = false;
                this.cancelApproval(this.cancelItem);
            },
            openConfirmCancelDialog(item) {
                this.cancelItem = item;
                this.confirmCancelDialog = true;
            },

            //결재  목록조회
            findList() {
                this.pagination.page = Number(1);
                this.movePage(1);
            },
            searchList() {
                this.movePage(this.pagination.page);
            },
            callbackPagination: function (e) {
                this.pagination.page = Number(e);
                this.movePage(e);
            },
            callbackPageSizeSelector: function (e) {
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.movePage(this.pagination.page);
            },

            changeDate(date) {
                let today = new Date();
                let mm = today.getMonth() + 1; // getMonth() is zero-based
                let dd = today.getDate();
                let todayString = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                this.searchCondition.toSubmissionDateText = todayString;

                let yesterDay = new Date();
                let mm2 = yesterDay.getMonth() + 1; // getMonth() is zero-based
                yesterDay.setDate(yesterDay.getDate() - 1);
                let dd2 = yesterDay.getDate();
                let yesterDayString = [yesterDay.getFullYear(), '-', (mm2 > 9 ? '' : '0') + mm2, '-', (dd2 > 9 ? '' : '0') + dd2].join('');

                if (date == 1) {
                    this.searchCondition.fromSubmissionDateText = yesterDayString;
                } else {
                    today = new Date(today.setDate(today.getDate() - date));
                    mm = today.getMonth() + 1; // getMonth() is zero-based
                    dd = today.getDate();
                    this.searchCondition.fromSubmissionDateText = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                }
            },
            openCreateDialog() {
                this.createDialog = true;
            },
            closeCreateDialog() {
                this.createDialog = false;
                this.searchList();
            },
            openDetailDialog(approvalId) {
                this.selectedApprovalId = approvalId;
                this.getApprovalDetail();
            },
            closeDetailDialog() {
                this.detailDialog = false;
            },
            getApprovalDetail() {
                axios.get('/rest/v1/approval/e/' + this.selectedApprovalId)
                .then(response => {

                    let approvalDetail = response.data.approval;
                    let currentUser = this.$store._modules.root.state.loginStore.currentUser.userId;

                    let currentApprovalUserYn = approvalDetail.approvalLineInfo.filter((line) => {
                        if (approvalDetail.approvalInfo.currentApprovalSequence == line.approvalSequence
                            && line.approvalUserId == currentUser
                        ) {
                            return line;
                        }
                    });

                    if (currentApprovalUserYn.length > 0) {
                        approvalDetail.currentApprovalUserYn = true;
                    } else {
                        approvalDetail.currentApprovalUserYn = false;
                    }

                    this.selectedApproval = approvalDetail;
                    this.selectedApprovalFiles = response.data.fileList;
                    this.detailDialog = true;
                })
                .catch(error => {

                });
            },
            cancelApproval(approval) {
                axios.post('/rest/v1/approval/e/cancel', approval)
                .then(response => {

                    if (response.data.result != 'fail') {
                        this.$notify({text: this.message['canceled'], type: 'success'});
                    } else {
                        this.$notify({text: this.message['cancel-failed'], type: 'error'});
                    }
                    this.searchList();
                })
                .catch(error => {

                });
            },
            parseDate(date) {
                if (!date) {
                    return null;
                }
                let dateArray = date.split('-');
                let month = dateArray[1];
                let day = dateArray[2];
                let year = dateArray[0];
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            },
            getApprovalStatusName(type) {

                let filteredApprovalType = this.statusCodeList.filter((ApprovalType) => {
                    if (ApprovalType.value == type) {
                        return ApprovalType;
                    }
                });

                if (filteredApprovalType.length > 0) {
                    return filteredApprovalType[0].text;
                } else {
                    return '';
                }
            },
            getCurrentUser() {
                axios.get('/rest/v1/user/e'
                    , {params: {userId: this.$store._modules.root.state.loginStore.currentUser.login}}
                )
                .then(response => {
                    if (response.data.length > 0) {
                        this.createValid = true;
                    } else {
                        this.createValid = false;
                    }
                })
                .catch(error => {

                });
            },
            messageLoad() {
                this.message['canceled'] = this.$i18n.td('message.canceled', '취소되었습니다._');
                this.message['cancel-failed'] = this.$i18n.td('message.cancel-failed', '취소되지 않았습니다._');
                this.message['title'] = this.$i18n.td('message.title', '제목_');
                this.message['status'] = this.$i18n.td('approval.status', '결재상태_');
                this.message['pending-user'] = this.$i18n.td('approval.pending-user', '미결자_');
                this.message['submission-date'] = this.$i18n.td('datetime.submission-date', '상신일자_');
                this.message['action'] = this.$i18n.td('message.action', 'Action_');
                this.message['approval-status-inprogress'] = this.$i18n.td('code.approval-status-inprogress', '진행중_');
                this.message['approval-status-complete'] = this.$i18n.td('code.approval-status-complete', '승인_');
                this.message['approval-status-disapproval'] = this.$i18n.td('code.approval-status-disapproval', '반려_');
                this.message['cancel'] = this.$i18n.td('button.cancel', '취소_');
                this.message['today'] = this.$i18n.td('button.today', '오늘_');
                this.message['a-week'] = this.$i18n.td('button.a-week', '1주일_');
                this.message['a-month'] = this.$i18n.td('button.a-month', '1개월_');
                this.message['start-date'] = this.$i18n.td('datetime.start-date', '시작일자_');
                this.message['end-date'] = this.$i18n.td('datetime.end-date', '종료일자_');
                this.message['current-approval-login'] = this.$i18n.td('menu-approval.current-approval-login', '현재 결재자 ID_');
                this.message['current-approval-username'] = this.$i18n.td('menu-approval.current-approval-username', '현재 결재자명_');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['create-approval'] = this.$i18n.td('approval.create-approval', '결재 작성');
                this.message['date-range-error'] = this.$i18n.td('message.date-range-error', '종료일자는 반드시 시작일자보다 커야합니다.');
                this.message['current-approval-user'] = this.$i18n.td('menu-approval.current-approval-user', '현재 결재자');

                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['id'] = this.$i18n.td('user.id', '아이디');
                this.message['or'] = this.$i18n.td('message.or', '또는');

                this.message['confirm-cancel'] = this.$i18n.td('message.confirm-cancel', '취소하시겠습니까?.');
            },
            getStatusCodeList() {
                let newStatusCodeList = [
                    {text: this.$data.message['approval-status-inprogress'], value: 'INPROGRESS'}
                    , {text: this.$data.message['approval-status-complete'], value: 'COMPLETE'}
                    , {text: this.$data.message['approval-status-disapproval'], value: 'DISAPPROVAL'}
                    , {text: this.$data.message['cancel'], value: 'CANCEL'}
                ];
                this.statusCodeList = newStatusCodeList;
            },
            getGridHeader() {
                let newGridHeader = [
                    {text: this.$data.message['title'], align: 'center', sortable: false, value: 'approvalName'},
                    {text: this.$data.message['current-approval-user'], align: 'center', sortable: false, value: 'currentApprovalUserName', width: '150px'},
                    {text: this.$data.message['status'], align: 'center', sortable: false, value: 'statusCode', width: '80px'},
                    {text: this.$data.message['submission-date'], align: 'center', sortable: false, value: 'submissionDate', width: '120px'},
                    {text: this.$data.message['action'], align: 'center', sortable: false, width: '60px'}
                ];

                this.approvalHeaders = newGridHeader;
            }

        }

    };
</script>

<style scoped></style>
