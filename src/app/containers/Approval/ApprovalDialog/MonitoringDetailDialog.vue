<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card class="approval-writing" id="approval-detail-dialog">
                <!-- Title Area -->
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{ message['search-approval-detail'] }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text class="dialog-body aprv__content">
                    <div class="aprv__content__row detail-page__contents">
                        <table class="detail-page__contents__table">
                            <tr>
                                <th>{{ message['title'] }}</th>
                                <td>{{ approval.approvalInfo.approvalName }}</td>
                            </tr>
                            <tr>
                                <th>{{ message['submission-user'] }}</th>
                                <td>{{ approval.approvalInfo.submissionUserName + '(' + approval.approvalInfo.submissionUserLogin + ')' }}</td>
                            </tr>
                            <tr>
                                <th>{{ message['processing-date'] }}</th>
                                <td>{{ approval.approvalInfo.submissionDate | moment(datetimePattern) }}</td>
                            </tr>
                            <tr>
                                <th>{{ message['status'] }}</th>
                                <td>{{ getApprovalStatusName(approval.approvalInfo.statusCode) }}</td>
                            </tr>
                        </table>
                    </div>
                    <!-- [CONTENT] 결재선 목록 -->
                    <div class="aprv__content__row table__body fixed-layout">
                        <v-data-table
                            :headers="approvalHeaders"
                            :items="approval.approvalLineInfo"
                            hide-actions
                            item-key="approvalIndex"
                        >
                            <template slot="items" slot-scope="props">
                                <tr>
                                    <!-- 순    번 -->
                                    <td :rowspan="props.item.approvalOpinion != null?2:1" class="test-xs-center">{{ props.item.approvalSequence }}</td>
                                    <!-- 구    분 -->
                                    <td :rowspan="props.item.approvalOpinion != null?2:1" class="test-xs-center">{{ getLineTypeName(props.item.approvalLineType,
                                        props.item.approvalParallelYn) }}
                                    </td>
                                    <!-- 성    명 -->
                                    <td class="test-xs-center">{{ props.item.approvalUserName }} ({{ props.item.approvalUserLogin }})</td>
                                    <!-- 처리일시 -->
                                    <td class="test-xs-center">{{ props.item.submissionDate | moment(datetimePattern) }}</td>
                                </tr>
                                <tr v-if="props.item.approvalOpinion != null">
                                    <td colspan="2">
                                        {{ props.item.approvalOpinion }}
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ message['close'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-layout row justify-center>
            <v-dialog v-model="opinionDialog" persistent max-width="400">
                <v-card>
                    <v-card-title class="headline">{{ message['opinion'] }}</v-card-title>
                    <v-container>
                        <v-layout row>
                            <v-flex xs12 class="mx-4">
                                <v-text-field :label="message['opinion']" v-model.trim="approvalStatus.approvalOpinion" required multi-line maxlength="1000"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="approvalType == 'reject'" color="green darken-1" flat @click.native="reject"> {{ message['approval-status-disapproval'] }}</v-btn>
                        <v-btn v-if="approvalType == 'approve'" color="green darken-1" flat @click.native="approve">{{ message['approval-status-complete'] }}</v-btn>
                        <v-btn v-if="approvalType == 'agreement'" color="green darken-1" flat @click.native="approve">{{ message['approval-line-type-agreement'] }}</v-btn>
                        <v-btn color="green darken-1" flat @click.native="closeOpinionDialog">{{ message['cancel'] }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
    </div>
</template>
</template>


<script>
    import axios from 'axios';

    export default {
        components: {
            axios
        },
        props: [
            'showDialog',
            'approval',
            'files'
        ],
        watch: {},
        data() {
            return {
                contextHost: '',
                opinionDialog: false,
                approvalStatus: {
                    approvalId: '',
                    approvalOpinion: '',
                    approvalUserLogin: '',
                    approvalUserId: ''
                },
                approvalHeaders: [],
                approvalStatusList: [],
                approvalLineTypeList: [],
                approvalType: '',
                message: {
                    'context': '',
                    'status': '',
                    'submission-user': '',
                    'processing-date': '',
                    'division': '',
                    'username': '',
                    'no': '',
                    'title': '',
                    'attach-file': '',
                    'search-approval-detail': '',
                    'submission-datetime': '',
                    'cancel': '',
                    'opinion': '',
                    'close': '',
                    'approval-line': '',
                    'approval-line-type-agreement': '',
                    'approval-status-inprogress': '',
                    'approval-status-complete': '',
                    'approval-status-disapproval': '',
                    'approval-status-cancel': '',
                    'approval-line-type-approval': '',
                    'approval-line-type-draft': '',
                    'approval-line-type-notification': '',
                    'approval-line-type-agreement': '',
                    'parallel': ''
                }

            };
        },
        mounted() {
            this.messageLoad();
            this.getGridHeader();
            this.getLineTypeList();
            this.getStatusCodeList();
            this.contextHost = axios.defaults.baseURL;
        },
        computed: {
            datetimePattern() {
                let sessionDatePatern = this.$store._modules.root.state.loginStore.currentUser.datetimePattern;
                if (sessionDatePatern == '') {
                    sessionDatePatern = 'YYYY-MM-DD HH:mm:ss'; //Default
                }
                sessionDatePatern = sessionDatePatern.replace('yyyy', 'YYYY').replace('dd', 'DD');
                return sessionDatePatern;
            }
        },
        methods: {
            //팝업 닫기
            closeDialog() {
                this.$emit('closeDialog');
            },
            approveOpinion() {
                this.approvalType = 'approve';
                this.opinionDialog = true;
            },
            approve() {

                this.approvalStatus.approvalUserLogin = this.$store._modules.root.state.loginStore.currentUser.login;
                this.approvalStatus.approvalUserId = this.$store._modules.root.state.loginStore.currentUser.userId;
                this.approvalStatus.approvalId = this.approval.approvalInfo.approvalId;

                axios.post('/rest/v1/approval/i/' + this.approval.approvalInfo.approvalId + '/approve', this.approvalStatus)
                .then(response => {
                    this.closeDialog();
                    this.opinionDialog = false;
                })
                .catch(error => {

                });
            },
            rejectOpinion() {
                this.approvalType = 'reject';
                this.opinionDialog = true;
            },
            agreeOpinion() {
                this.approvalType = 'agreement';
                this.opinionDialog = true;
            },
            reject() {

                this.approvalStatus.approvalUserLogin = this.$store._modules.root.state.loginStore.currentUser.login;
                this.approvalStatus.approvalUserId = this.$store._modules.root.state.loginStore.currentUser.userId;
                this.approvalStatus.approvalId = this.approval.approvalInfo.approvalId;

                axios.post('/rest/v1/approval/i/' + this.approval.approvalInfo.approvalId + '/reject', this.approvalStatus)
                .then(response => {
                    this.closeDialog();
                    this.opinionDialog = false;
                })
                .catch(error => {

                });
            },
            closeOpinionDialog() {
                this.opinionDialog = false;
            },
            download(fileId) {
                let url = '/rest/v1/download/' + fileId;
                axios
                .post(url)
                .then(response => {
                })
                .catch(error => {

                });
            },
            getApprovalStatusName(status) {
                if (status === '') {
                    return '';
                }

                let filteredStatus = this.statusCodeList.filter((approvalStatus) => {
                    if (approvalStatus.value == status) {
                        return approvalStatus;
                    }
                });

                if (filteredStatus.length > 0) {
                    return filteredStatus[0].text;
                } else {
                    return '';
                }
            },
            getLineTypeName(type, approvalParallelYn) {
                if (type === '') {
                    return '';
                }

                let filteredType = this.approvalLineTypeList.filter((lineType) => {
                    if (lineType.value == type) {
                        return lineType;
                    }
                });

                if (filteredType.length > 0) {

                    if (approvalParallelYn == 'Y') {
                        return this.message['parallel'] + filteredType[0].text;
                    } else {
                        return filteredType[0].text;
                    }
                } else {
                    return '';
                }
            },
            messageLoad() {

                this.message['context'] = this.$i18n.td('approval.context', '결재본문');
                this.message['status'] = this.$i18n.td('approval.status', '결재상태');
                this.message['submission-user'] = this.$i18n.td('approval.submission-user', '상신자');
                this.message['processing-date'] = this.$i18n.td('datetime.processing-date', '처리일시');
                this.message['division'] = this.$i18n.td('message.division', '구분');
                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['no'] = this.$i18n.td('message.no', '순번');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['attach-file'] = this.$i18n.td('message.attach-file', '첨부파일');
                this.message['search-approval-detail'] = this.$i18n.td('menu-approval.search-approval-detail', '결재 상세조회');
                this.message['submission-datetime'] = this.$i18n.td('datetime.submission-datetime', '상신일시');
                this.message['cancel'] = this.$i18n.td('button.cancel', '취소');
                this.message['opinion'] = this.$i18n.td('approval.approval-opinion', '결재의견');
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['approval-line'] = this.$i18n.td('approval.approval-line', '결재선');
                this.message['approval-line-type-agreement'] = this.$i18n.td('code.approval-line-type-agreement', '합의');

                this.message['approval-status-inprogress'] = this.$i18n.td('code.approval-status-inprogress', '진행중');
                this.message['approval-status-complete'] = this.$i18n.td('code.approval-status-complete', '승인');
                this.message['approval-status-disapproval'] = this.$i18n.td('code.approval-status-disapproval', '반려');
                this.message['approval-status-cancel'] = this.$i18n.td('code.approval-status-cancel', '취소');

                this.message['approval-line-type-approval'] = this.$i18n.td('code.approval-line-type-approval', '결재');
                this.message['approval-line-type-draft'] = this.$i18n.td('code.approval-line-type-draft', '기안');
                this.message['approval-line-type-notification'] = this.$i18n.td('code.approval-line-type-notification', '통보');
                this.message['approval-line-type-agreement'] = this.$i18n.td('code.approval-line-type-agreement', '합의');

                this.message['parallel'] = this.$i18n.td('approval.parallel', '병렬');

            },
            getStatusCodeList() {
                let newStatusCodeList = [
                    {text: this.message['approval-status-inprogress'], value: 'INPROGRESS'}
                    , {text: this.message['approval-status-complete'], value: 'COMPLETE'}
                    , {text: this.message['approval-status-disapproval'], value: 'DISAPPROVAL'}
                    , {text: this.message['approval-status-cancel'], value: 'CANCEL'}
                ];
                this.statusCodeList = newStatusCodeList;
            },
            getLineTypeList() {
                let newLineTypeList = [
                    {text: this.message['approval-line-type-draft'], value: 'DRAFT'}
                    , {text: this.message['approval-line-type-agreement'], value: 'AGREEMENT'}
                    , {text: this.message['approval-line-type-notification'], value: 'NOTIFICATION'}
                    , {text: this.message['approval-line-type-approval'], value: 'APPROVAL'}
                    , {text: this.message['approval-status-cancel'], value: 'CANCEL'}
                ];

                this.approvalLineTypeList = newLineTypeList;
            },
            getGridHeader() {
                let newGridHeader = [
                    {text: this.message['no'], align: 'center', sortable: false, width: '50px'},
                    {text: this.message['division'], align: 'center', sortable: false, width: '120px'},
                    {text: this.message['username'] + '(ID)', align: 'center', sortable: false, width: 'calc(50%-85px)'},
                    {text: this.message['processing-date'], align: 'center', sortable: false, width: 'calc(50%-85px)'}
                ];

                this.approvalHeaders = newGridHeader;
            }
        }
    };
</script>
