<template>
    <div id="i-inbox-page">

        <!--  Title Area  -->
        <page-title />

        <!-- Search Area -->
        <div class="page-searchbox page-searchbox--col3">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="subjectText" :label="message['title']" v-model.trim="subjectText" @keyup.enter="callbackPagination(1)" maxlength="100"></v-text-field>
                    <!--  :placeholder="message['title']" -->
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="senderText" :label="message['sender']" v-model.trim="senderText" @keyup.enter="callbackPagination(1)" maxlength="30"
                                  :placeholder="message['name-id']"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{message['type']}}</div>
                    <span class="---has-to-be-span---">
                    <v-select :items="recipientTypeValues" item-value="value" v-model="recipientType" class="narrow-search-select" />
                </span>

                </div>

            </div>

            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{message['date']}}</div>
                    <div class="page-searchbox__item-cell--datepicker-comboset__wrapper">
                        <v-menu ref="menu1"
                                :close-on-content-click="false"
                                v-model="menu1"
                                :nudge-right="40"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px">
                            <v-text-field class="search-datepicker"
                                          slot="activator"
                                          v-model.trim="date1"
                                          prepend-icon="event"
                                          readonly
                                          @blur="date1 = parseDate(date1)" />
                            <v-date-picker v-model="date1" no-title @input="menu1 = false" />
                        </v-menu>
                        <!-- <div class="date-divider"></div> -->
                        <v-menu
                            ref="menu2"
                            :close-on-content-click="false"
                            v-model="menu2"
                            :nudge-right="40"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px">
                            <v-text-field class="search-datepicker"
                                          slot="activator"
                                          v-model.trim="date2"
                                          prepend-icon="event"
                                          readonly
                                          @blur="date2 = parseDate(date2)"
                            ></v-text-field>
                            <v-date-picker v-model="date2" no-title @input="menu2 = false"></v-date-picker>
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


        <!-- Dialog Area Start -->
        <internal-mail-write-dialog :isInternalMailWriteDialog="isInternalMailWriteDialog"
                                    :mailItem="mailItem"
                                    :mode="mode"
                                    :replyOrForward="replyOrForward"
                                    @closeInternalMailWriteDialog="closeInternalMailWriteDialog"
        />

        <!-- <external-mail-write-dialog :isExternalMailWriteDialog="isExternalMailWriteDialog" :mode="mode" @closeDialog="closeExternalMailWriteDialog"/> -->

        <external-recipient-dialog :isExternalRecipientDialog="isExternalRecipientDialog" :mailId="mailId" :mode="mode" :action="'INBOX'"
                                   @closeExternalRecipientDialog="closeExternalRecipientDialog" />

        <external-mail-dialog :isExternalMailDialog="isExternalMailDialog" :mailId="mailId" :mode="mode" :action="action"
                              @closeExternalMailDialog="closeExternalMailDialog" />
        <!-- Dialog Area End -->

        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <div class="table-area">
                <div class="table__info">
                    <div class="table__info__counter">
                        <common-page-size-selector :totalCount="totalItems" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>

                <!-- [TABLE] Table actions -->
                <div class="table__action">
                    <div class="table__action__default">
                        <v-btn @click.native="openInternalMailWriteDialog()">{{ message['compose'] }}</v-btn>
                    </div>
                </div>

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table
                        :headers="headers"
                        :items="items"
                        item-key="userId"
                        :pagination.sync="pagination"
                        :loading="loading"
                        :total-items="totalItems"
                        hide-actions
                    >

                        <!-- Grid Body -->
                        <template slot="items" slot-scope="props">
                            <td v-clickable class="text-xs-left" @click="openExternalMailDialog(props.item.mailId)">
                                <v-icon v-if="false">attach_file</v-icon>
                                {{ props.item.mailSubject }}
                            </td>
                            <td class="text-xs-left">{{props.item.senderUserName }}({{props.item.senderUserLogin }})</td>
                            <td v-clickable @click="openExternalRecipient(props.item.mailId)" class="text-xs-center">{{getSendType(props.item.myRecipientType) }}</td>
                            <td class="text-xs-center">{{ props.item.sentDate | moment(datetimePattern) }}</td>
                        </template>
                    </v-data-table>
                </div>
                <!-- [TABLE] 본체 끝-->
                <!-- [TABLE] Page navi -->
                <div class="table__pager">
                    <common-pagination :page="pagination.page" :pages="pages" @eventPagination="callbackPagination" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    import pageTitle from '../Common/pageTitle';
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    // import ExternalMailWriteDialog from './mailPopup/ExternalMailWriteDialog'
    import ExternalRecipientDialog from './mailPopup/ExternalRecipientDialog';
    import ExternalMailDialog from './mailPopup/MailDialog';
    import InternalMailWriteDialog from './mailPopup/InternalMailWriteDialog';

    import axios from 'axios';

    const CONTEXT_ROOT = '/rest/v1/mail';

    export default {
        components: {
            pageTitle,
            CommonPagination,
            CommonPageSizeSelector,
            //  ExternalMailWriteDialog,
            ExternalRecipientDialog,
            ExternalMailDialog,
            InternalMailWriteDialog
        },
        data() {
            return {
                mode: 'i',
                action: 'INBOX',
                isExternalMailWriteDialog: false,
                isExternalRecipientDialog: false,
                isExternalMailDialog: false,
                isInternalMailWriteDialog: false,
                replyOrForward: undefined,
                items: [],
                mailId: '',
                loading: true,
                subjectText: '',
                senderText: '',
                recipientType: 'ALL',
                date1: this.milisecondToYYYYMMDD(),
                menu1: false,
                date2: this.milisecondToYYYYMMDD(),
                menu2: false,
                totalItems: 0,
                totalRecipientItems: 0,
                pagination: {rowsPerPage: 3},
                mailItem: {},
                maileReader: {
                    mail: {
                        mailSubject: ''
                    },
                    allList: [],
                    toList: [],
                    ccList: [],
                    bccList: []

                },
                headers: [],
                dateCount: 1,
                message: {
                    'bcc': '',
                    'to': '',
                    'cc': '',
                    'title': '',
                    'sender': '',
                    'type': '',
                    'date': '',
                    'compose': '',
                    'a-month': '',
                    'a-week': '',
                    'today': '',
                    'start-date': '',
                    'end-date': '',
                    'search': '',
                    'with': '',
                    'date-range-error': '',
                    'name-id': '',

                },
                recipientTypeValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: 'ALL'},
                    {text: this.$i18n.td('mail.to', '수신'), value: 'TO'},
                    {text: this.$i18n.td('mail.cc', '참조'), value: 'CC'},
                    {text: this.$i18n.td('mail.bcc', '비밀참조'), value: 'BCC'}
                ],
            };
        },
        mounted() {

            //다국어 메세지 조회
            this.messageLoad();

            //그리드 헤더 설정
            this.getGridHeader();

            this.checkAboutSearchCondition();
            // setTimeout(() => {
            //     this.getMailList()
            // }, 1000)
            this.changeDate(30);
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
            milisecondToYYYYMMDD: function () {
                let date = new Date();
                let mm = date.getMonth() + 1; // getMonth() is zero-based
                let dd = date.getDate();
                return [date.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
            },
            callbackPageSizeSelector: function (e) {
                //console.log('callbackPageSizeSelector rowsPerPage' + e)
                this.pagination.rowsPerPage = Number(e);
                this.pagination.page = 1;
                this.checkAboutSearchCondition();
                this.getMailList();
            },
            callbackPagination: function (e) {
                //console.log('callbackPagination ' + e)
                this.pagination.page = Number(e);
                this.checkAboutSearchCondition();
                this.getMailList();
            },
            openExternalMailDialog(item) {
                this.mailId = item;
                this.isExternalMailDialog = true;
            },
            openExternalMailWriteDialog() {
                this.isExternalMailWriteDialog = true;
            },
            openInternalMailWriteDialog() {
                this.isInternalMailWriteDialog = true;
            },
            openInternalMailWriteDialog2() {
                let routeData = this.$router.resolve({path: '/pop', query: {data: 'someData'}});
                window.open(routeData.href, '_blank');
            },
            openExternalRecipient(item) {
                this.mailId = item;
                this.isExternalRecipientDialog = true;

            },
            closeExternalMailDialog() {
                this.isExternalMailDialog = false;
                this.checkAboutSearchCondition();
                this.getMailList();
            },
            closeExternalMailWriteDialog() {
                this.isExternalMailWriteDialog = false;
                this.checkAboutSearchCondition();
                this.getMailList();
            },
            closeInternalMailWriteDialog() {
                this.isInternalMailWriteDialog = false;
                this.checkAboutSearchCondition();
                this.getMailList();
            },
            closeExternalRecipientDialog() {
                this.isExternalRecipientDialog = false;
                this.checkAboutSearchCondition();
                this.getMailList();
            },
            getMailList() {
                const {page, rowsPerPage} = this.pagination;
                this.loading = true;

                let fromDate = new Date(this.date1);
                let toDate = new Date(this.date2);

                if (fromDate > toDate) {
                    this.$notify({text: this.message['date-range-error'], type: 'warn'});
                    this.loading = false;
                    return false;
                }

                axios
                .get(CONTEXT_ROOT + '/i/inbox',
                    {
                        params: {
                            systemKey: this.$store._modules.root.state.loginStore.systemKey,
                            page: page - 1,
                            size: rowsPerPage,
                            senderText: this.senderText,
                            subjectText: this.subjectText,
                            recipientType: this.recipientType == 'ALL' ? '' : this.recipientType,
                            fromSentDateText: this.date1,
                            toSentDateText: this.date2,
                            mailSenderAddress: this.$store.state.loginStore.currentUser.email,
                            userId: this.$store.state.loginStore.currentUser.userId,
                            userLoginId: this.$store.state.loginStore.currentUser.login
                        }
                    })
                .then(response => {
                    this.mails = response.data.page;
                    this.items = this.mails.content;
                    // debugger
                    this.totalItems = response.data.page.totalElements;
                    this.loading = false;
                    // if (this.items.length == 0) {
                    //     console.log("검색 결과가 없습니다.")
                    // }
                }).catch(error => {
                    this.loading = false;

                    console.log(error);
                });
            },
            getRecipientName(content) {
                var recipientName = '';
                if (content.recipientCount > 1) {
                    recipientName = content.recipientUserName + this.message['with'] + (content.recipientCount - 1);
                } else {
                    recipientName = content.recipientUserName;
                }
                return recipientName;
            },
            getSendType(type) {
                var sendType = '';
                //수신 상태 정보
                if (type == 'TO') {
                    sendType = this.message['to'];
                }
                if (type == 'CC') {
                    sendType = this.message['cc'];
                }
                if (type == 'BCC') {
                    sendType = this.message['bcc'];
                }
                return sendType;
            },
            checkAboutSearchCondition() {
                if (this.$route.query.searchCondition != undefined && this.$route.query.searchCondition.page != undefined) {
                    this.pagination.page = this.$route.query.searchCondition.page;
                    this.pagination.rowsPerPage = this.$route.query.searchCondition.size;
                    this.subjectText = this.$route.query.searchCondition.subjectText;
                    this.senderText = this.$route.query.searchCondition.senderText;
                }
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
            changeDate(date) {
                let today = new Date();
                let mm = today.getMonth() + 1; // getMonth() is zero-based
                let dd = today.getDate();

                let todayString = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                this.date2 = todayString;

                if (date == 1) {
                    this.date1 = todayString;
                } else {
                    today = new Date(today.setDate(today.getDate() - date));
                    mm = today.getMonth() + 1; // getMonth() is zero-based
                    dd = today.getDate();
                    this.date1 = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                }
            },
            messageLoad() {
                this.message['bcc'] = this.$i18n.td('mail.bcc', '비밀참조');
                this.message['to'] = this.$i18n.td('mail.to', '수신');
                this.message['cc'] = this.$i18n.td('mail.cc', '참조');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['sender'] = this.$i18n.td('mail.sender', '발신인');
                this.message['type'] = this.$i18n.td('mail.recipient-status', '수신상태');
                this.message['date'] = this.$i18n.td('mail.date', '발신일');
                this.message['compose'] = this.$i18n.td('mail.compose', '메일쓰기');
                this.message['a-month'] = this.$i18n.td('button.a-month', '1개월');
                this.message['a-week'] = this.$i18n.td('button.a-week', '1주일');
                this.message['today'] = this.$i18n.td('button.today', '오늘');
                this.message['start-date'] = this.$i18n.td('datetime.start-date', '시작일자');
                this.message['end-date'] = this.$i18n.td('datetime.end-date', '종료일자');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['with'] = this.$i18n.td('mail.with', '외');
                this.message['date-range-error'] = this.$i18n.td('message.date-range-error', '종료일자는 반드시 시작일자보다 커야합니다.');
                this.message['name-id'] = '\'' + this.$i18n.td('message.username', '성명') + '\' ' + this.$i18n.td('message.or', '또는') + ' \'' + this.$i18n.td('user.id', '아이디')
                    + '\'';
            },
            getGridHeader() {
                let newHeaders = [
                    {text: this.message['title'], align: 'center', sortable: false, value: 'subject', width: ''},
                    {text: this.message['sender'], align: 'center', sortable: false, value: 'sender', width: '150px'},
                    {text: this.message['type'], align: 'center', sortable: false, value: 'status', width: '80px'},
                    {text: this.message['date'], align: 'center', sortable: false, value: 'createDate', width: '120px'}
                ];

                this.headers = newHeaders;
            }

        }
    }

</script>
<style scoped>


</style>
