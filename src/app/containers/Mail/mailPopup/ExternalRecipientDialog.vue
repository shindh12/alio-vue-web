<template>
    <div class="isdp-body-content">
        <v-dialog :value="isExternalRecipientDialog" @input="closeDialog" max-width="1000px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ message['search-recipient'] }}</span>
                </v-card-title>
                <v-card-text>

                    <div class="aprv__content">
                        <div class="detail-page__contents">
                            <table class="detail-page__contents__table">
                                <tr>
                                    <th>{{ message['title'] }}</th>
                                    <td>{{mailInfo.mailSubject}}</td>
                                </tr>
                                <tr>
                                    <th>{{ message['send'] }}</th>
                                    <td> {{mailInfo.senderUserName}}</td>
                                </tr>
                                <tr v-if="mailInfo.showList.length > 0">
                                    <th>{{ message['to'] }}</th>
                                    <td> {{recipientCountDetail}}</td>
                                </tr>

                            </table>
                        </div>
                    </div>
                    <div class="table__body">
                        <v-data-table
                            :headers="headers"
                            :items.sync="mailInfo.showList"
                            :select-all="action=='SENT'"
                            item-key="recipientSequence"
                            v-model="selected"
                            hide-actions
                        >
                            <!-- Grid Body -->
                            <template slot="items" slot-scope="props">
                                <td v-if="action=='SENT'">
                                    <v-checkbox primary hide-details v-model="props.selected" :key="props.item.recipientSequence" v-if="props.item.cancelYn=='N'"></v-checkbox>
                                </td>
                                <td> {{ props.item.recipientUserName }}({{props.item.recipientUserLogin}})</td>
                                <td> {{ convertRecipientType(props.item.recipientType) }}</td>

                                <td v-if="action!='INBOX' && props.item.cancelYn === 'Y'"> {{ message['cancel-sending'] }} ( {{props.item.cancelDate | moment(dateTimePattern())
                                    }})
                                </td>
                                <td v-else-if="action!='INBOX' &&  props.item.openedYn === 'Y'"> {{ message['read'] }} ( {{props.item.openedDate | moment(dateTimePattern()) }})
                                </td>
                                <td v-else-if="action!='INBOX' &&  props.item.openedYn === 'N'"> {{ message['unread'] }} ( {{props.item.arrivalDate | moment(dateTimePattern())
                                    }})
                                </td>

                            </template>
                        </v-data-table>
                    </div>
                    <v-card-actions>
                        <v-btn @click.native="closeDialog">{{ message['close'] }}</v-btn>
                        <v-btn :disabled="selected.length === 0" v-if="action=='SENT'" @click.native="cancelMailDialog">{{ message['cancel-sending'] }}</v-btn>
                    </v-card-actions>
                </v-card-text>
            </v-card>
        </v-dialog>


        <!-- [MODAL] 삭제 모달 -->
        <v-layout row justify-center>
            <v-dialog v-model="confirmDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text> 발신취소 하시겠습니까?</v-card-text>
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
    const CONTEXT_ROOT = '/rest/v1/mail';
    import axios from 'axios';

    export default {
        props: ['isExternalRecipientDialog', 'mailId', 'mode', 'action'],
        data() {
            return {
                totalItems: 0,
                confirmDialog: false,
                recipientCountDetail: '',
                selected: [],
                mailInfo: {
                    canceledCount: 0,
                    readCount: 0,
                    unreadCount: 0,
                    showList: []
                },
                headers: [],
                message: {
                    'cancel-sending': '',
                    'canceled-sending': '',
                    'read': '',
                    'unread': '',
                    'cc': '',
                    'bcc': '',
                    'to': '',
                    'full-name': '',
                    'type': '',
                    'status': '',
                    'search-recipient': '',
                    'close': '',
                    'send': '',
                    'title': '',
                    'total': ''
                }
            };
        },
        watch: {
            isExternalRecipientDialog: function () {
                if (this.isExternalRecipientDialog == true) {
                    this.selected = [];
                    this.getMailItem(this.mailId);
                }
            }
        },
        mounted() {
            this.messageLoad();
            this.getGridHeader();
        },
        methods: {
            getMailItem(mailId) {

                let sendUrl = '';
                if (this.mode == 'e') {
                    sendUrl = CONTEXT_ROOT + '/e/';
                } else if (this.mode == 'i') {
                    sendUrl = CONTEXT_ROOT + '/i/';
                }

                axios
                .get(sendUrl + mailId)
                .then(response => {
                    let mailInfo = response.data.mailInfo;
                    let mail = response.data.mailInfo.mail;
                    let toList = mailInfo.toList;
                    let ccList = mailInfo.ccList;
                    let bccList = mailInfo.bccList;
                    let sentList = toList.concat(ccList);
                    let allList = mailInfo.allList;

                    /*   if(mailInfo.mail.senderUserId == this.$store.state.loginStore.currentUser.userId){
                         this.action = "SENT"
                       }else{
                         this.action = "INBOX"
                       }
                       */
                    this.mailInfo = response.data.mailInfo.mail;
                    this.mailInfo.allList = response.data.mailInfo.allList;
                    this.totalItems = allList.length;

                    if (this.action == 'INBOX') {
                        this.mailInfo.showList = sentList;
                    } else {
                        this.mailInfo.showList = allList;
                    }
                    this.countRecipientCount(response.data.mailInfo.allList);
                    this.convertRecipientCountDetail(this.mailInfo);
                    this.isExternalRecipientDialog = true;
                })
                .catch(error => {

                });
            },
            countRecipientCount(recipientList) {
                this.mailInfo.canceledCount = 0;
                this.mailInfo.readCount = 0;
                this.mailInfo.unreadCount = 0;

                for (var i = 0; i < recipientList.length; i++) {
                    if (recipientList[i]['cancelYn'] == 'Y') {
                        this.mailInfo.canceledCount++;
                    } else if (recipientList[i]['openedYn'] == 'Y') {
                        this.mailInfo.readCount++;
                    } else {
                        this.mailInfo.unreadCount++;
                    }
                }
            },
            convertRecipientCountDetail: function (mailItem) {
                let recipientCountDetail = '';

                if (mailItem.canceledCount > 0) {
                    recipientCountDetail += this.message['cancel-sending'] + ' ' + mailItem.canceledCount;
                }
                if (mailItem.readCount > 0) {
                    recipientCountDetail += (mailItem.canceledCount > 0 ? ', ' : '') + this.message['read'] + ' ' + mailItem.readCount;
                }
                if (mailItem.unreadCount > 0) {
                    recipientCountDetail += (mailItem.canceledCount + mailItem.readCount > 0 ? ', ' : '') + this.message['unread'] + ' ' + mailItem.unreadCount;
                }

                if (this.action == 'INBOX') {
                    recipientCountDetail = this.message['total'] + ' ' + mailItem.showList.length;
                } else {
                    recipientCountDetail = this.message['total'] + ' ' + mailItem.showList.length + ' (' + recipientCountDetail + ')';
                }
                if (mailItem.showList.length == 0) {
                    recipientCountDetail = '';
                }
                this.recipientCountDetail = recipientCountDetail;
                return recipientCountDetail;
            },
            convertRecipientType: function (recipientType) {
                let convertText = '';
                switch (recipientType) {
                    case 'TO' : // 수신
                        convertText = this.message['to'];
                        break;
                    case 'CC' : // 참조
                        convertText = this.message['cc'];
                        break;
                    case 'BCC' : // 비밀참조
                        convertText = this.message['bcc'];
                        break;
                    default : // Default 수신
                        convertText = this.message['to'];
                }
                return convertText;
            },
            // convertStatus : function (recipient){
            //     let statusText = ''
            //     if (recipient.cancelYn === "Y") {
            //         // statusText = ("발신취소" + "(" + this.getTimeStamp(new Date(recipient.cancelDate * 1000), true)  + ")")
            //         statusText = (this.message['cancel-sending'] + "(" + this.getTimeStamp(new Date(recipient.cancelDate * 1000), true)  + ")")
            //     }else if(recipient.openedYn === "Y"){
            //         // statusText = ("개봉" + "(" +  this.getTimeStamp(new Date(recipient.openedDate * 1000), true) +")")
            //         statusText = (this.message['read'] + "(" +  this.getTimeStamp(new Date(recipient.openedDate * 1000), true) +")")
            //     }else {
            //         // statusText = ("미개봉" +"("+ this.getTimeStamp(new Date(recipient.arrivalDate * 1000), true) + ")")
            //         statusText = (this.message['unread'] +"("+ this.getTimeStamp(new Date(recipient.arrivalDate * 1000), true) + ")")
            //     }
            //     return statusText
            // },
            //시간을 yyyy-mm-dd 형태로 변경, isShowTime이 true이면 hh:mm:ss 까지 추가
            // getTimeStamp : function (date, isShowTime) {

            //     let d = date;
            //     var s =
            //         this.leadingZeros(d.getFullYear(), 4) + '-' +
            //         this.leadingZeros(d.getMonth() + 1, 2) + '-' +
            //         this.leadingZeros(d.getDate(), 2);

            //     if(isShowTime){
            //         s += ' '+this.leadingZeros(d.getHours(), 2) + ':' +
            //             this.leadingZeros(d.getMinutes(), 2) + ':' +
            //             this.leadingZeros(d.getSeconds(), 2);
            //     }

            //     return s;
            // },
            // leadingZeros : function (n, digits) {
            //     var zero = '';
            //     n = n.toString();

            //     if (n.length < digits) {
            //         for (let i = 0; i < digits - n.length; i++)
            //             zero += '0';
            //     }
            //     return zero + n;
            // },
            closeDialog() {
                this.$emit('closeExternalRecipientDialog');
            },
            agree() {
                this.confirmDialog = false;
                var tempSel = new Array();
                for (var i = 0; i < this.selected.length; i++) {
                    if (this.selected[i].cancelYn != 'Y') {
                        tempSel.push(this.selected[i]);
                    }
                }
                if (!tempSel || tempSel.length == 0) {
                    this.selected = [];
                    return;
                }
                this.doCancelMailDialog(tempSel, this.mailInfo);
            },
            disagree() {
                this.confirmDialog = false;
            },
            cancelMailDialog() {
                this.confirmDialog = true;
            },
            doCancelMailDialog(selected, mailItem) {
                let cancelUserList = {
                    'mailId': mailItem.mailId,
                    'mailRecipient': selected,
                    'locale': 'ko_KR',
                    'timeZone': 'Asia/Seoul',
                    'encoding': 'utf-8'
                };

                let sendUrl = '';
                if (this.mode == 'e') {
                    sendUrl = CONTEXT_ROOT + '/e/cancel/';
                } else if (this.mode == 'i') {
                    sendUrl = CONTEXT_ROOT + '/i/cancel/';
                }

                axios.post(sendUrl, cancelUserList)
                .then(response => {

                    sendUrl = '';
                    if (this.mode == 'e') {
                        sendUrl = CONTEXT_ROOT + '/e/';
                    } else if (this.mode == 'i') {
                        sendUrl = CONTEXT_ROOT + '/i/';
                    }

                    axios
                    .get(sendUrl + mailItem.mailId)
                    .then(response => {
                        let mailInfo = response.data.mailInfo;
                        let mail = mailInfo.mail;
                        let toList = mailInfo.toList;
                        let ccList = mailInfo.ccList;
                        let bccList = mailInfo.bccList;
                        let sentList = toList.concat(ccList);
                        let allList = mailInfo.allList;

                        this.mailInfo = response.data.mailInfo.mail;
                        this.mailInfo.allList = mailInfo.allList;
                        this.totalItems = mailInfo.allList.length;

                        if (this.action == 'INBOX') {
                            this.mailInfo.showList = sentList;
                        } else {
                            this.mailInfo.showList = allList;
                        }
                        this.getMailItem(this.mailInfo.mailId);
                        this.countRecipientCount(this.mailInfo.allList);
                        this.convertRecipientCountDetail(this.mailInfo);
                        this.selected = [];
                        this.$notify({title: this.message['cancel-sending'], text: this.message['canceled-sending'], type: 'success'});

                    })
                    .catch(error => {

                    });
                })
                .catch(error => {

                });
            },

            messageLoad() {
                this.message['cancel-sending'] = this.$i18n.td('mail.cancel-sending', '발신취소');
                this.message['canceled-sending'] = this.$i18n.td('mail.canceled-sending', '발신이 취소되었습니다.');
                this.message['read'] = this.$i18n.td('mail.read', '개봉');
                this.message['unread'] = this.$i18n.td('mail.unread', '미개봉');
                this.message['cc'] = this.$i18n.td('mail.cc', '참조');
                this.message['bcc'] = this.$i18n.td('mail.bcc', '비밀참조');
                this.message['to'] = this.$i18n.td('mail.to', '수신');
                this.message['full-name'] = this.$i18n.td('message.username', '성명');
                this.message['type'] = this.$i18n.td('mail.type', '구분');
                this.message['status'] = this.$i18n.td('message.status', '상태');
                this.message['search-recipient'] = this.$i18n.td('menu-mail.search-recipient', '수신인 조회');
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['send'] = this.$i18n.td('button.send', '발신');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['total'] = this.$i18n.td('mail.total', '총');
            },
            getGridHeader() {
                let newHeaders = [];

                if (this.action == 'INBOX') {
                    newHeaders = [
                        {text: this.message['full-name'] + '(' + this.$i18n.td('user.id', '아이디') + ')', align: 'center', sortable: false, value: 'subject'},
                        {text: this.message['type'], align: 'center', sortable: false, value: 'recipient'}
                    ];
                } else {
                    newHeaders = [
                        {text: this.message['full-name'], align: 'center', sortable: false, value: 'subject'},
                        {text: this.message['type'], align: 'center', sortable: false, value: 'recipient'},
                        {text: this.message['status'], align: 'center', sortable: false, value: 'status'}
                    ];
                }

                this.headers = newHeaders;
            }
        }
    };
</script>
