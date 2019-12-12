<template>
    <!-- Contents Area -->
    <div class="isdp-body-content" id="mail-dialog">
        <v-dialog :value="isExternalMailDialog" @input="closeDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card class="approval-writing" id="mail-dialog"><!-- writing??? -->
                <!-- Title Area -->
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{ message['mail-detail'] }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <!-- Title Area END -->
                <v-card-text class="dialog-body aprv__content">
                    <!-- [CONTENT] 상세 정보들 -->
                    <div class="aprv__content__row detail-page__contents">
                        <table class="detail-page__contents__table">
                            <tr>
                                <th>{{ message['title'] }}</th>
                                <td>{{ mailReader.mail.mailSubject }}</td>
                            </tr>
                            <tr>
                                <th>{{ message['sender'] }}</th>
                                <td>{{mailReader.mail.senderUserName}}</td>
                            </tr>
                            <tr v-if="mailReader.toList.length + mailReader.ccList.length> 0">
                                <th>{{ message['recipient'] }}</th>
                                <td>{{setRecipientText ()}}
                                    <!-- <span v-clickable  style="font-weight: bold;" ></span> -->
                                    <v-btn @click="openExternalRecipient">view all</v-btn>
                                </td>
                            </tr>
                            <tr>
                                <th>{{ message['date'] }}</th>
                                <td>{{mailReader.mail.sentDate | moment(dateTimePattern()) }}</td>
                            </tr>

                            <tr v-if="mailReader.fileList.length > 0">
                                <th>{{ message['attach-file'] }}</th>
                                <td>
                                    <table class="detail-page__contents__table file-table">
                                        <tr v-for="(item) in mailReader.fileList" :key="item.fileId">
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

                    <!-- [CONTENT] 본문 -->
                    <div class="aprv__content__row aprv__content__html">
                        <p v-html="mailReader.mail.mailDescription"></p>
                    </div>
                    <!-- [CONTENT] 본문 END-->

                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ message['close'] }}</v-btn>
                    <v-btn v-if="mode=='i' && action=='INBOX'" @click.native="openConfirmDialog">{{ message['delete'] }}</v-btn>
                    <v-btn v-if="mode=='i' && action=='INBOX'" @click.native="openReplyOptionDialog">{{ message['reply'] }}</v-btn>
                    <v-btn v-if="mode=='i' && action=='INBOX'" @click.native="openForwardOptionDialog">{{ message['forward'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <external-recipient-dialog :isExternalRecipientDialog="isExternalRecipientDialog" :mailId="mailId" :mode="mode" :action="action"
                                   @closeExternalRecipientDialog="closeExternalRecipientDialog" />
        <internal-mail-write-dialog :isInternalMailWriteDialog="isInternalMailWriteDialog"
                                    :mailId="mailReader.mail.mailId"
                                    :mode="mode"
                                    :replyOrForward="replyOrForward"
                                    :bExcludeMe="bExcludeMe"
                                    :bOnlySender="bOnlySender"
                                    @closeInternalMailWriteDialog="closeInternalMailWriteDialog" />
        <v-dialog :value="isReplyOptionDialog" @input="closeDialog" max-width="500px">
            <v-card color="white" class="question-dialog">
                <v-card-title>
                    <span class="headline">{{ message['reply'] }}</span>
                </v-card-title>
                <v-container fluid class="pa-1 mt-3 mb-3">
                    <v-radio-group v-model="checkReplyOption">
                        <v-radio :label="message['to-sender']" :value="1" />
                        <v-radio :label="message['both-sender-recipient']" :value="2" />
                    </v-radio-group>
                    <hr>
                    <v-checkbox :label="message['exclude-yourself']" v-model="checkReplyOption2" :disabled="checkReplyOption != 2" />
                </v-container>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeReplyOptionDialog">{{ message['close'] }}</v-btn>
                    <v-btn primary @click.native="openReplyDialog(mailReader)">{{ message['reply'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog :value="isForwardOptionDialog" @input="closeForwardOptionDialog" max-width="500px">
            <v-card color="white" class="question-dialog">
                <v-card-title>
                    <span class="headline">{{ message['forward'] }}</span>
                </v-card-title>
                <v-container fluid class="pa-1 mt-3 mb-3">
                    <v-checkbox
                        :label="message['use-pre-assigned-recipient']"
                        v-model="checkForwardOption"
                    ></v-checkbox>
                    <v-checkbox
                        :label="message['exclude-yourself']"
                        v-model="checkForwardOption2"
                        :disabled="checkForwardOption == false"
                    ></v-checkbox>
                </v-container>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeForwardOptionDialog">{{ message['close'] }}</v-btn>
                    <v-btn primary @click.native="openForwardDialog(mailReader)">{{ message['forward'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

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

    </div>
</template>

<script>
    import ExternalRecipientDialog from './ExternalRecipientDialog';
    import InternalMailWriteDialog from './InternalMailWriteDialog';
    import axios from 'axios';

    const CONTEXT_ROOT = '/rest/v1/mail';
    const DOWNLOAD_ROOT = '/rest/v1/download';

    export default {
        components: {
            ExternalRecipientDialog,
            InternalMailWriteDialog
        },
        props: ['isExternalMailDialog', 'mailId', 'mode', 'action'],
        data() {
            var contextHost = axios.defaults.baseURL;
            if (contextHost == undefined) {
                contextHost = '';
            }
            return {
                contextHost: contextHost,
                DOWNLOAD_ROOT: '/rest/v1/download',
                isExternalRecipientDialog: false,
                isForwardOptionDialog: false,
                isInternalMailWriteDialog: false,
                isReplyOptionDialog: false,
                confirmDialog: false,
                totalRecipientItems: 0,
                checkForwardOption: true,
                checkForwardOption2: false,
                checkReplyOption: 2,
                checkReplyOption1: false,
                checkReplyOption2: false,
                replyOrForward: false,
                bOnlySender: false,
                bExcludeMe: false,
                totalItems: 0,
                mailItem: {},
                mailReader: {
                    mail: {
                        mailSubject: ''
                    },
                    allList: [],
                    toList: [],
                    ccList: [],
                    bccList: [],
                    fileList: []
                },
                sanitize: '', /* Content sanitizer for XSS */
                message: {
                    'close': '',
                    'reply': '',
                    'send': '',
                    'delete': '',
                    'forward': '',
                    'sender': '',
                    'date': '',
                    'recipient': '',
                    'with': '',
                    'cc': '',
                    'title': '',
                    'attach-file': '',
                    'to-sender': '',
                    'both-sender-recipient': '',
                    'exclude-yourself': '',
                    'use-pre-assigned-recipient': '',
                    'mail-detail': '',
                    'mail-contents': '',
                    'to': '',
                    'deleted': '',
                }
            };
        },
        watch: {
            isExternalMailDialog: function () {
                if (this.isExternalMailDialog == true) {
                    if (this.mode == 'i') {//ADD, 내부메일인 경우에만 오픈 상태로 업데이트
                        this.updateOpendMail(this.mailId);
                    }
                    this.getMail(this.mailId);
                }
            }
        },
        mounted() {
            this.messageLoad();
        },
        methods: {
            updateOpendMail(mailId) {//ADD, 내부메일인 경우에만 오픈 상태로 업데이트
                axios
                .get(CONTEXT_ROOT + '/i/update/opened/' + mailId + '/userId/' + this.$store.state.loginStore.currentUser.userId)
                .then(response => {

                })
                .catch(error => {
                    console.log(error);
                });

            },
            getMail(mailId) {

                let sendUrl = '';
                if (this.mode == 'e') {
                    sendUrl = CONTEXT_ROOT + '/e/';
                } else if (this.mode == 'i') {
                    if (this.action == 'INBOX') {
                        sendUrl = CONTEXT_ROOT + '/i/receive/';
                    } else {
                        sendUrl = CONTEXT_ROOT + '/i/';
                    }
                }

                axios
                .get(sendUrl + mailId)
                .then(response => {
                    let mailInfo = response.data.mailInfo;
                    let mail = mailInfo.mail;
                    let toList = mailInfo.toList;
                    let ccList = mailInfo.ccList;
                    let bccList = mailInfo.bccList;
                    this.mailReader = response.data.mailInfo;
                    this.mailReader.fileList = response.data.fileList;
                })
                .catch(error => {
                    // this.$notify({title: error.message, text: this.$i18n.td(error.response.data.errMsgKey, error.response.data.errMsg), type: 'error' });
                });

            },
            setRecipientText() {
                let toText = '[' + this.message['to'] + '] ', ccText = '[' + this.message['cc'] + '] ';
                if (this.mailReader.toList.length > 0) {
                    toText += this.mailReader.toList[0].recipientUserName;
                    if (this.mailReader.toList.length > 1) {
                        toText += ' ' + this.message['with'] + ' ' + (this.mailReader.toList.length - 1);
                    }
                } else {
                    toText = '';
                }

                /*   if(this.mailReader.ccList.length + this.mailReader.bccList.length > 0){
                       ccText +=  (this.mailReader.ccList.length > 0? this.mailReader.ccList[0].recipientUserName : this.mailReader.bccList[0].recipientUserName);
                       if(this.mailReader.ccList.length + this.mailReader.bccList.length > 1){
                           ccText += " " + this.message['with'] +" " + (this.mailReader.ccList.length + this.mailReader.bccList.length - 1);
                       }
                   } else {
                       ccText = "";
                   }
   */
                if (this.action == 'SENT') {
                    if (this.mailReader.ccList.length + this.mailReader.bccList.length > 0) {
                        ccText += (this.mailReader.ccList.length > 0 ? this.mailReader.ccList[0].recipientUserName : this.mailReader.bccList[0].recipientUserName);
                        if (this.mailReader.ccList.length + this.mailReader.bccList.length > 1) {
                            ccText += ' with ' + (this.mailReader.ccList.length + this.mailReader.bccList.length - 1);
                        }
                    } else {
                        ccText = '';
                    }
                } else if (this.action == 'INBOX') {
                    if (this.mailReader.ccList.length > 0) {
                        ccText += this.mailReader.ccList[0].recipientUserName;
                        if (this.mailReader.ccList.length > 1) {
                            ccText += ' with ' + (this.mailReader.ccList.length - 1);
                        }
                    } else {
                        ccText = '';
                    }
                }
                return toText + ' ' + ccText;
            },
            download(file) {
                let sendUrl = DOWNLOAD_ROOT + '/' + file.fileId;
                console.log(sendUrl);
                axios
                .post(sendUrl)
                .then(response => {
                    // this.closeDialog ()
                })
                .catch(error => {

                });
            },
            deleteMail() {
                if (this.mode == 'e') {
                    return;
                }

                let sendUrl = CONTEXT_ROOT + '/i/delete/' + this.mailReader.mail.mailId + '/action/' + this.action + '/userId/' + this.$store.state.loginStore.currentUser.userId;
                console.log(sendUrl);
                axios
                .get(sendUrl)
                .then(response => {
                    this.closeDialog();
                    this.$notify({title: this.message['delete'], text: this.message['deleted'], type: 'success'});
                })
                .catch(error => {

                });
            },
            openExternalRecipient() {
                this.isExternalRecipientDialog = true;
            },
            openForwardOptionDialog() {
                this.isForwardOptionDialog = true;
            },
            openReplyOptionDialog() {
                this.isReplyOptionDialog = true;
            },
            openForwardDialog(mailReader) {
                // let totalItems = 0
                // console.log("mailReader")
                // console.log(mailReader)
                this.replyOrForward = 'F';
                this.bOnlySender = this.checkForwardOption;
                this.bExcludeMe = this.checkForwardOption2;
                this.isInternalMailWriteDialog = true;
            },
            openReplyDialog(mailReader) {
                // let totalItems = 0
                // console.log("mailReader")
                // console.log(mailReader)

                this.replyOrForward = 'R';
                this.bOnlySender = this.checkReplyOption;
                this.bExcludeMe = this.checkReplyOption2;
                if (this.checkReplyOption == '1') {
                    this.bOnlySender = true;
                }
                this.isInternalMailWriteDialog = true;
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                this.deleteMail();
            },
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            closeExternalRecipientDialog() {
                this.isExternalRecipientDialog = false;
            },
            closeDialog() {
                this.resetOptions();
                this.$emit('closeExternalMailDialog');
            },
            closeInternalMailWriteDialog() {
                this.isInternalMailWriteDialog = false;
                this.isForwardOptionDialog = false;
                this.isReplyOptionDialog = false;
                this.resetOptions();
                this.$emit('closeExternalMailDialog');
            },
            closeForwardOptionDialog() {
                this.resetOptions();
                this.isForwardOptionDialog = false;
            },
            closeReplyOptionDialog() {
                this.resetOptions();
                this.isReplyOptionDialog = false;
            },
            resetOptions() {
                this.checkForwardOption = true;
                this.checkForwardOption2 = false;
                this.checkReplyOption = 2,
                    this.checkReplyOption1 = false;
                this.checkReplyOption2 = false;
                this.replyOrForward = false;
                this.bOnlySender = false;
                this.bExcludeMe = false;
            },
            messageLoad() {
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['reply'] = this.$i18n.td('button.reply', '답장');
                this.message['send'] = this.$i18n.td('button.send', '발신');
                this.message['delete'] = this.$i18n.td('button.delete', '삭제');
                this.message['forward'] = this.$i18n.td('button.forward', '전달');
                this.message['sender'] = this.$i18n.td('mail.sender', '발신인');
                this.message['date'] = this.$i18n.td('mail.date', '발신일');
                this.message['recipient'] = this.$i18n.td('mail.recipient', '수신인');
                this.message['with'] = this.$i18n.td('mail.with', '외');
                this.message['cc'] = this.$i18n.td('mail.cc', '참조');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['attach-file'] = this.$i18n.td('message.attach-file', '첨부파일');
                this.message['to-sender'] = this.$i18n.td('menu-mail.to-sender', '발신인에게');
                this.message['both-sender-recipient'] = this.$i18n.td('menu-mail.both-sender-recipient', '발신인과 수신인 모두에게');
                this.message['exclude-yourself'] = this.$i18n.td('menu-mail.exclude-yourself', '본인은 수신인에서 제외');
                this.message['use-pre-assigned-recipient'] = this.$i18n.td('menu-mail.use-pre-assigned-recipient', '기존에 지정된 수신인 사용');
                this.message['mail-detail'] = this.$i18n.td('mail.mail-detail', '메일 상세조회');
                this.message['mail-contents'] = this.$i18n.td('mail.mail-contents', '메일본문');
                this.message['to'] = this.$i18n.td('mail.to', '수신');
                this.message['deleted'] = this.$i18n.td('message.deleted', '삭제되었습니다.');

            }

        }
    };
</script>


<style scoped>
    /* [FILE-TABLE] 파일 목록 모양 */
    #app #mail-dialog .file-table {
        width: 100%;
    }

    #app #mail-dialog .file-table tr:first-child {
        height: 26px;
    }

    #app #mail-dialog .file-table tr:first-child td {
        padding: 0 15px;
    }

    #app #mail-dialog .file-table tr {
        background: #EBEBEB;
        height: 26px;
    }

    #app #mail-dialog .file-table td:hover {
        background: #F2F2F2;
    }

    #app #mail-dialog .file-table tr + tr {
        margin-top: 5px;
    }

    #app #mail-dialog .file-table td {
        border: 1px solid #CCC;
        padding: 0 15px;
        line-height: 26px;
    }

    #app #mail-dialog .file-table td a {
        text-decoration: none;
        color: #000;
    }

    /* [FILE-TABLE] 파일 목록 모양 */
    #app #mail-dialog .file-table .icon-link {
        float: right;
    }

    #app #mail-dialog .file-table .icon-link .icon {
        font-size: 20px;
    }

    #app #mail-dialog .file-table .icon-link .icon:hover {
        opacity: 0.5;
    }
</style>

<style>
    /* [Q-DIALOG] 질문하는 팝업 */
    #app .question-dialog {
    }

    #app .question-dialog .input-group--selection-controls.input-group--active .icon {
        color: #3A43A6;
    }

    #app .question-dialog .input-group--selection-controls label {
        font-size: 14px;
    }

    #app .question-dialog .input-group--selection-controls .input-group__details {
        min-height: 0;
    }

    #app .question-dialog .radio-group {
        padding-top: 0;
    }

    #app .question-dialog .radio-group .input-group__details {
        min-height: 0;
    }

    #app .question-dialog hr {
        margin: 8px 0;
    }

</style>
