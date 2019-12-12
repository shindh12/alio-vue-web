<template>
    <div class="isdp-body-content" id="approval-detail-dialog">
        <v-dialog :value="showDialog" @input="closeDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card class="approval-writing" id="approval-detail-dialog"><!-- writing??? -->
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
                    <!-- [CONTENT] 결재 상세 정보들 -->
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
                            <tr v-if="files.length > 0">
                                <th>
                                    {{ message['attach-file'] }}
                                </th>
                                <td>
                                    <table class="detail-page__contents__table file-table">
                                        <tr v-for="(item) in files" :key="item.fileId">
                                            <td style="text-align:left">
                                                <a v-bind:href="contextHost + '/rest/v1/download/' + item.fileId">
                                                    {{ item.fileName }} ({{item.fileSize|byteFilter}})
                                                </a>

                                                <a class="icon-link" :href="contextHost + '/rest/v1/download/' + item.fileId">
                                                    <v-icon>get_app</v-icon>
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <!-- [CONTENT] 결재 상세 정보들 END -->
                    <!-- [CONTENT] 결재선 목록 -->
                    <div class="aprv__content__row table__body fixed-layout">
                        <v-data-table
                            :headers="approvalHeaders"
                            :items="approval.approvalLineInfo"
                            hide-actions
                            item-key="approvalIndex">
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
                                    <td class="test-xs-center">{{ props.item.approvalDate | moment(datetimePattern) }}</td>
                                </tr>
                                <tr v-if="props.item.approvalOpinion != null">
                                    <td colspan="2">
                                        {{ props.item.approvalOpinion }}
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </div>
                    <!-- [CONTENT] 결재선 목록 END -->
                    <!-- [CONTENT] 결재본문 -->
                    <div class="aprv__content__row aprv__content__html" style="">
                        <p v-html="approval.approvalInfo.submissionDescription"></p>
                    </div>
                    <!-- [CONTENT] 결재본문 END-->
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ message['close'] }}</v-btn>
                    <v-btn v-if="approval.currentApprovalUserYn" @click.native="rejectOpinion">{{ message['approval-status-disapproval'] }}</v-btn>
                    <v-btn primary v-if="approval.currentApprovalUserYn && !approval.agreementYn" @click.native="approveOpinion">{{ message['approval-status-complete'] }}</v-btn>
                    <v-btn primary v-if="approval.currentApprovalUserYn && approval.agreementYn" @click.native="agreeOpinion">{{ message['approval-line-type-agreement'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-layout row justify-center>
            <v-dialog v-model="opinionDialog" persistent max-width="400">
                <v-card>
                    <v-card-title class="headline">{{ message['opinion'] }}</v-card-title>
                    <v-card-text class="field-box">
                        <v-text-field :label="message['auth-code']" v-model.trim="approvalStatus.authCode" required type="password" />
                        <v-text-field :label="message['opinion']" v-model.trim="approvalStatus.approvalOpinion" required multi-line maxlength="1000" />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="closeOpinionDialog">{{ message['cancel'] }}</v-btn>
                        <v-btn v-if="approvalType == 'reject'" @click.native="openConfirmDisapprovalDialog"> {{ message['approval-status-disapproval'] }}</v-btn>
                        <v-btn primary v-if="approvalType == 'approve'" @click.native="openConfirmApprovalDialog">{{ message['approval-status-complete'] }}</v-btn>
                        <v-btn primary v-if="approvalType == 'agreement'" @click.native="openConfirmAggrementDialog">{{ message['approval-line-type-agreement'] }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>

        <!-- [MODAL] 삭제 모달 -->
        <v-layout row justify-center>
            <v-dialog v-model="confirmApprovalDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text> {{message['confirm-approved']}}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="disagreeApproval">{{$td('button.no', '아니요')}}</v-btn>
                        <v-btn @click.native="agreeApproval">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
        <!-- [MODAL] 삭제 모달 -->
        <v-layout row justify-center>
            <v-dialog v-model="confirmAggrementDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text> {{message['confirm-aggrement'] }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="disagreeAggrement">{{$td('button.no', '아니요')}}</v-btn>
                        <v-btn @click.native="agreeAggrement">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
        <!-- [MODAL] 삭제 모달 -->
        <v-layout row justify-center>
            <v-dialog v-model="confirmDisapprovalDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text> {{message['confirm-disapproved'] }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="disagreeDisapproval">{{$td('button.no', '아니요')}}</v-btn>
                        <v-btn @click.native="agreeDisapproval">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>


    </div>
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
        watch: {
            opinionDialog: function (value) {
                if (value == true) {
                    this.approvalStatus.authCode = '';
                    this.approvalStatus.approvalOpinion = '';
                }
            }
        },
        data() {
            return {
                contextHost: '',
                opinionDialog: false,
                confirmApprovalDialog: false,
                confirmAggrementDialog: false,
                confirmDisapprovalDialog: false,
                approvalStatus: {
                    approvalId: '',
                    approvalOpinion: '',
                    approvalUserLogin: this.$store._modules.root.state.loginStore.currentUser.login,
                    approvalUserId: this.$store._modules.root.state.loginStore.currentUser.userId,
                    authCode: ''
                },
                approvalHeaders: [],
                approvalStatusList: [],
                approvalLineTypeList: [],
                approvalType: '',
                sanitize: '', /* Content sanitizer for XSS */
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
                    'parallel': '',
                    'disproved': '',
                    'approved': '',
                    'input-required-opinion': ''
                }

            };
        },
        mounted() {

            this.messageLoad();
            this.getGridHeader();
            this.getLineTypeList();
            this.getStatusCodeList();

            this.contextHost = axios.defaults.baseURL;
            if (this.contextHost == undefined) {
                this.contextHost = '';
            }
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
            disagreeApproval() {
                this.confirmApprovalDialog = false;
            },
            agreeApproval() {
                this.confirmApprovalDialog = false;
                this.approve();
            },
            openConfirmApprovalDialog() {
                this.confirmApprovalDialog = true;
            },
            disagreeAggrement() {
                this.confirmAggrementDialog = false;
            },
            agreeAggrement() {
                this.confirmAggrementDialog = false;
                this.agreement();
            },
            openConfirmAggrementDialog() {
                this.confirmAggrementDialog = true;
            },
            disagreeDisapproval() {
                this.confirmDisapprovalDialog = false;
            },
            agreeDisapproval() {
                this.confirmDisapprovalDialog = false;
                this.reject();
            },
            openConfirmDisapprovalDialog() {
                this.confirmDisapprovalDialog = true;
            },
            //팝업 닫기
            closeDialog() {
                this.$emit('closeDialog');
            },
            approveOpinion() {
                this.approvalType = 'approve';
                this.opinionDialog = true;
            },
            approve() {

                if (this.approvalStatus.approvalOpinion.trim() == '') {
                    this.$notify({text: this.message['input-required-opinion'], type: 'warn'});
                    return false;
                }

                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);

                //let parameter = this.approvalStatus;
                let parameter = Object.assign({}, this.approvalStatus);
                parameter.approvalId = this.approval.approvalInfo.approvalId;
                parameter.authCode = encrypt.encrypt(this.approvalStatus.authCode);

                axios.post('/rest/v1/approval/i/' + this.approval.approvalInfo.approvalId + '/approve', parameter)
                .then(response => {
                    this.approvalStatus.authCode = '';
                    this.closeDialog();
                    this.opinionDialog = false;
                    this.$notify({title: this.message['approval-status-complete'], text: this.message['approved'], type: 'success'});
                })
                .catch(error => {
                    this.approvalStatus.authCode = '';
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
            agreement() {

                if (this.approvalStatus.approvalOpinion.trim() == '') {
                    this.$notify({text: this.message['input-required-opinion'], type: 'warn'});
                    return false;
                }

                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);

                //let parameter = this.approvalStatus;
                let parameter = Object.assign({}, this.approvalStatus);
                parameter.approvalId = this.approval.approvalInfo.approvalId;
                parameter.authCode = encrypt.encrypt(this.approvalStatus.authCode);

                axios.post('/rest/v1/approval/i/' + this.approval.approvalInfo.approvalId + '/agreement', parameter)
                .then(response => {
                    this.closeDialog();
                    this.opinionDialog = false;
                    this.approvalStatus.authCode = '';
                    this.$notify({title: this.message['approval-line-type-agreement'], text: this.message['agreemented'], type: 'success'});
                })
                .catch(error => {
                    this.approvalStatus.authCode = '';
                });

            },
            reject() {

                if (this.approvalStatus.approvalOpinion.trim() == '') {
                    this.$notify({text: this.message['input-required-opinion'], type: 'warn'});
                    return false;
                }

                const keyData = '-----BEGIN PUBLIC KEY-----' + this.$store.state.loginStore.publicKey + '-----END PUBLIC KEY-----';
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(keyData);

                let parameter = this.approvalStatus;
                parameter.approvalId = this.approval.approvalInfo.approvalId;
                parameter.authCode = encrypt.encrypt(this.approvalStatus.authCode);

                axios.post('/rest/v1/approval/i/' + this.approval.approvalInfo.approvalId + '/reject', parameter)
                .then(response => {
                    this.closeDialog();
                    this.opinionDialog = false;
                    this.approvalStatus.authCode = '';
                    this.$notify({title: this.message['approval-status-disapproval'], text: this.message['disapproved'], type: 'success'});
                })
                .catch(error => {
                    this.approvalStatus.authCode = '';
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

                this.message['approval-status-inprogress'] = this.$i18n.td('code.approval-status-inprogress', '진행중');
                this.message['approval-status-complete'] = this.$i18n.td('code.approval-status-complete', '승인');
                this.message['approval-status-disapproval'] = this.$i18n.td('code.approval-status-disapproval', '반려');
                this.message['approval-status-cancel'] = this.$i18n.td('code.approval-status-cancel', '취소');

                this.message['approval-line-type-approval'] = this.$i18n.td('code.approval-line-type-approval', '결재');
                this.message['approval-line-type-draft'] = this.$i18n.td('code.approval-line-type-draft', '기안');
                this.message['approval-line-type-notification'] = this.$i18n.td('code.approval-line-type-notification', '통보');
                this.message['approval-line-type-agreement'] = this.$i18n.td('code.approval-line-type-agreement', '합의');
                this.message['auth-code'] = this.$i18n.td('system.authCode', '비밀번호');
                this.message['parallel'] = this.$i18n.td('approval.parallel', '병렬');

                this.message['disapproved'] = this.$i18n.td('menu-approval.disapproved', '반려되었습니다.');
                this.message['approved'] = this.$i18n.td('menu-approval.approved', '승인되었습니다.');
                this.message['agreemented'] = this.$i18n.td('menu-approval.agreemented', '합의되었습니다.');

                this.message['confirm-approved'] = this.$i18n.td('menu-approval.confirm-approved', '승인하시겠습니까?');
                this.message['confirm-aggrement'] = this.$i18n.td('menu-approval.confirm-aggrement', '합의하시겠습니까?');
                this.message['confirm-disapproved'] = this.$i18n.td('menu-approval.confirm-disapproved', '반려하시겠습니까?');

                this.message['input-required-opinion'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['opinion']]);

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
                    {text: this.message['processing-date'], align: 'center', sortable: false, width: '120px'}
                ];

                this.approvalHeaders = newGridHeader;
            }
        }
    };
</script>

<style scoped>
    /* [FILE-TABLE] 파일 목록 모양 */
    #app #approval-detail-dialog .file-table {
        width: 500px;
    }

    #app #approval-detail-dialog .file-table tr:first-child {
        height: 26px;
    }

    #app #approval-detail-dialog .file-table tr:first-child td {
        padding: 0 15px;
    }

    #app #approval-detail-dialog .file-table tr {
        background: #EBEBEB;
        height: 26px;
    }

    #app #approval-detail-dialog .file-table td:hover {
        background: #F2F2F2;
    }

    #app #approval-detail-dialog .file-table tr + tr {
        margin-top: 5px;
    }

    #app #approval-detail-dialog .file-table td {
        border: 1px solid #CCC;
        padding: 0 15px;
        line-height: 26px;
    }

    #app #approval-detail-dialog .file-table td a {
        text-decoration: none;
        color: #000;
    }

    /* [FILE-TABLE] 파일 목록 모양 */
    #app #approval-detail-dialog .file-table .icon-link {
        float: right;
    }

    #app #approval-detail-dialog .file-table .icon-link .icon {
        font-size: 20px;
    }

    #app #approval-detail-dialog .file-table .icon-link .icon:hover {
        opacity: 0.5;
    }
</style>
