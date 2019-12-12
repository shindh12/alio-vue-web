<template>
    <div class="isdp-body-content">
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col3">
            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{message['system']}}</div>
                    <span class="---has-to-be-span---">
            <v-select :items="systemList" v-model="searchCondition.systemKey" item-value="systemKey" item-text="systemName" />
          </span>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{message['mail-type']}}</div>
                    <span class="---has-to-be-span---">
            <v-select :items="mailTypeList" v-model="searchCondition.mailType" item-value="value" item-text="text" class="narrow-search-select" />
          </span>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{message['recipient-status']}}</div>
                    <span class="---has-to-be-span---">
            <v-select :items="recipientStatusValues" item-value="value" v-model="searchCondition.recipientStatus" class="narrow-search-select" />
          </span>
                </div>

            </div>
            <!-- [SEARCH] Search items -->

            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchSubject" :label="message['title']" v-model.trim="searchCondition.subjectText" @keyup.enter="callbackPagination(1)"
                                  maxlength="100"></v-text-field>
                    <!-- :placeholder="message['title']"  -->
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchSender" :label="message['sender']" v-model.trim="searchCondition.senderText" @keyup.enter="callbackPagination(1)" maxlength="30"
                                  :placeholder="message['name-id']"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchReceiver" :label="message['recipient']" v-model.trim="searchCondition.recipientText" @keyup.enter="callbackPagination(1)"
                                  maxlength="30" :placeholder="message['name-id']"></v-text-field>
                </div>
            </div>

            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{message['date']}}</div>
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
                                          v-model.trim="searchCondition.fromSentDateText"
                                          prepend-icon="event"
                                          readonly
                                          @blur="searchCondition.fromSentDateText = parseDate(searchCondition.fromSentDateText)" />
                            <v-date-picker v-model="searchCondition.fromSentDateText" no-title @input="datepicker1 = false" />
                        </v-menu>
                        <v-menu
                            ref="datepicker2"
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
                                          v-model="searchCondition.toSentDateText"
                                          prepend-icon="event"
                                          readonly
                                          @blur="searchCondition.toSentDateText = parseDate(searchCondition.toSentDateText)" />
                            <v-date-picker v-model="searchCondition.toSentDateText" no-title @input="datepicker2 = false"></v-date-picker>
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
                        <common-page-size-selector :totalCount="mailSize" :pagination="pagination" @eventPageSizeSelector="callbackPageSizeSelector" />
                    </div>
                </div>

                <!-- [TABLE] 본체 -->
                <div class="table__body">
                    <v-data-table
                        :headers="mailHeaders"
                        :items="mails"
                        :pagination.sync="pagination"
                        :loading="loading"
                        :total-items="mailSize"
                        hide-actions
                        item-key="mailId"
                    >

                        <!-- Grid Body -->
                        <template slot="items" slot-scope="props">
                            <tr>
                                <!-- 시스템키  -->
                                <td class="text-xs-center">{{ getSystemName(props.item.systemKey) }}</td>
                                <!-- 메일 유형 -->
                                <td class="text-xs-center">{{ getMailTypeName(props.item.mailType) }}</td>
                                <!-- 제목      -->
                                <td class="text-xs-left">{{ props.item.mailSubject }}</td>
                                <!-- 발신인    -->
                                <td class="text-xs-left">{{ props.item.senderUserName }} ({{props.item.senderUserLogin}})</td>
                                <!-- 수신인    -->
                                <td class="text-xs-left">{{ getRecipientName(props.item) }}</td>
                                <!-- 수신상태  -->
                                <td v-clickable class="text-xs-center" @click="openExternalRecipient(props.item.mailId)">{{ getRecipientStatus(props.item) }}</td>
                                <!-- 발신일자  -->
                                <td class="text-xs-center">{{ props.item.sentDate | moment(datetimePattern) }}</td>
                            </tr>
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

        <external-recipient-dialog :isExternalRecipientDialog="isExternalRecipientDialog" :mailId="mailId" :mode="mode" :action="'MONI'"
                                   @closeExternalRecipientDialog="closeExternalRecipientDialog" />

    </div>
</template>

<script>

    /* Conponent Import */
    import CommonPagination from '../Common/CommonPagination';
    import CommonPageSizeSelector from '../Common/CommonPageSizeSelector';
    import axios from 'axios';
    import ExternalRecipientDialog from './mailPopup/ExternalRecipientDialog';

    export default {
        components: {
            CommonPagination,
            CommonPageSizeSelector,
            axios,
            ExternalRecipientDialog
        },
        data() {
            return {
                mode: 'i',
                currentUserLogin: '',
                searchCondition: {
                    systemKey: '',
                    recipientText: '',
                    senderText: '',
                    subjectText: '',
                    recipientStatus: 'A',
                    recipientType: '',
                    opened: '',
                    fromSentDateText: '',
                    toSentDateText: '',
                    mailId: '',
                    mailType: ''
                },
                mailId: '',
                mailTypeList: [],
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    // max50:(v) => v.length <= 50 || 'Max 50 characters',
                    // max400:(v) => v.length <= 400 || 'Max 400 characters',
                    // groupDup:(v) => !this.groupDuplicate || 'Group Key are Duplicated',
                    // codeDup:(index) => !this.codes[index].codeDuplicate || 'Code Key are Duplicated'
                },
                mails: [],
                mailSize: 0,
                loading: true,
                pagination: {page: 1, rowsPerPage: 10},
                mailHeaders: [],
                datepicker1: false,
                datepicker2: false,
                dateCount: 1,
                systemList: [],
                isExternalRecipientDialog: false,
                message: {
                    'all': '',
                    'date-range-error': '',
                    'a-month': '',
                    'a-week': '',
                    'today': '',
                    'search': '',
                    'start-date': '',
                    'end-date': '',
                    'read': '',
                    'unread': '',
                    'sender': '',
                    'date': '',
                    'cancel-sending': '',
                    'recipient-status': '',
                    'recipient': '',
                    'with': '',
                    'internal-mail': '',
                    'system': '',
                    'external-mail': '',
                    'title': '',
                    'mail-type': '',
                    'name-id': '',

                },
                recipientStatusValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: 'A'},
                    {text: this.$i18n.td('mail.read', '개봉'), value: 'R'},
                    {text: this.$i18n.td('mail.unread', '미개봉'), value: 'U'},
                    {text: this.$i18n.td('mail.cancel-sending', '발신취소'), value: 'C'}
                ],

            };
        },
        computed: {
            pages() {
                // if (this.pagination.rowsPerPage == null ||
                //   this.pagination.totalItems == null
                // ) return 0
                return Math.ceil(this.mailSize / this.pagination.rowsPerPage);
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

            //메일 유형 조회
            this.getMailTypeList();

            //그리드 헤더 설정
            this.getGridHeader();

            this.changeDate(30);

            this.findSystemList();
            //목록조회
            // this.findList();

        },
        methods: {
            movePage(index) {
                this.loading = true;
                this.pagination.page = index;

                let fromDate = new Date(this.searchCondition.fromSentDateText);
                let toDate = new Date(this.searchCondition.toSentDateText);

                if (fromDate > toDate) {
                    this.$notify({text: this.message['date-range-error'], type: 'warn'});
                    this.loading = false;
                    return false;
                }

                axios.get('/rest/v1/mail/monitoring'
                    , {
                        params: {
                            systemKey: this.searchCondition.systemKey,
                            recipientText: this.searchCondition.recipientText,
                            senderText: this.searchCondition.senderText,
                            subjectText: this.searchCondition.subjectText,
                            recipientStatus: this.searchCondition.recipientStatus == 'A' ? '' : this.searchCondition.recipientStatus,
                            recipientType: this.searchCondition.recipientType,
                            opened: this.searchCondition.opened,
                            fromSentDateText: this.searchCondition.fromSentDateText,
                            toSentDateText: this.searchCondition.toSentDateText,
                            mailId: this.searchCondition.mailId,
                            mailType: this.searchCondition.mailType,
                            page: index - 1,
                            size: this.pagination.rowsPerPage
                        }
                    })
                .then(response => {
                    let mailList = response.data.page.content;
                    this.loading = false;
                    this.mails = mailList;
                    this.mailSize = response.data.page.totalElements;
                })
                .catch(error => {

                });
            },
            findSystemList() {

                axios.get('/rest/v1/systemuser/system/' + this.$store._modules.root.state.loginStore.currentUser.login)
                .then(response => {
                    let res = response.data;
                    let systemList = [];
                    systemList.push({'systemKey': '', 'systemName': this.message['all']});
                    res.forEach(system => {
                        if (system.useYn == 'Y') {
                            systemList.push({'systemKey': system.systemKey, 'systemName': system.systemName});
                        }
                    });
                    this.systemList = systemList;
                })
                .catch(error => {

                });
            },
            //  목록조회
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
                this.searchCondition.toSentDateText = todayString;

                if (date == 1) {
                    this.searchCondition.fromSentDateText = todayString;
                } else {
                    today = new Date(today.setDate(today.getDate() - date));
                    mm = today.getMonth() + 1; // getMonth() is zero-based
                    dd = today.getDate();
                    this.searchCondition.fromSentDateText = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                }
            },
            getRecipientName(content) {
                var recipientName = '';
                if (content.recipientCount > 1) {
                    recipientName = content.recipientUserName + '(' + content.recipientUserLogin + ')' + this.message['with'] + (content.recipientCount - 1);
                } else {
                    recipientName = content.recipientUserName + '(' + content.recipientUserLogin + ')';
                }
                return recipientName;
            },
            getRecipientStatus(content) {
                var recipientStatus = '';
                //수신 상태 정보
                if (content.readCount > 0) {
                    recipientStatus += this.message['read'] + content.readCount;
                }
                if (content.unreadCount > 0) {
                    if (content.readCount > 0) {
                        recipientStatus += ',';
                    }
                    recipientStatus += ' ' + this.message['unread'] + content.unreadCount;
                }
                if (content.canceledCount > 0) {
                    if (content.readCount > 0 || content.unreadCount > 0) {
                        recipientStatus += ',';
                    }
                    recipientStatus += ' ' + this.message['cancel-sending'] + content.canceledCount;
                }
                return recipientStatus;
            },
            openExternalRecipient(item) {
                this.mailId = item;
                this.isExternalRecipientDialog = true;
            },
            closeExternalRecipientDialog() {
                this.isExternalRecipientDialog = false;
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
            getMailTypeName(type) {

                if (type === '') {
                    return '';
                }

                let filteredMailType = this.mailTypeList.filter((MailType) => {
                    if (MailType.value == type) {
                        return MailType;
                    }
                });

                if (filteredMailType.length > 0) {
                    return filteredMailType[0].text;
                } else {
                    return '';
                }

            },
            getSystemName(systemKey) {
                if (systemKey === '') {
                    return '';
                }

                let filteredSystemKey = this.systemList.filter((system) => {
                    if (system.systemKey == systemKey) {
                        return system;
                    }
                });

                if (filteredSystemKey.length > 0) {
                    return filteredSystemKey[0].systemName;
                } else {
                    return '';
                }
            },
            messageLoad() {
                this.message['all'] = this.$i18n.td('message.all', '전체');
                this.message['date-range-error'] = this.$i18n.td('message.date-range-error', '종료일자는 반드시 시작일자보다 커야합니다.');
                this.message['a-month'] = this.$i18n.td('button.a-month', '1개월');
                this.message['a-week'] = this.$i18n.td('button.a-week', '1주일');
                this.message['today'] = this.$i18n.td('button.today', '오늘');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['start-date'] = this.$i18n.td('datetime.start-date', '시작일자');
                this.message['end-date'] = this.$i18n.td('datetime.end-date', '종료일자');
                this.message['read'] = this.$i18n.td('mail.read', '개봉');
                this.message['unread'] = this.$i18n.td('mail.unread', '미개봉');
                this.message['sender'] = this.$i18n.td('mail.sender', '발신인');
                this.message['date'] = this.$i18n.td('mail.date', '발신일');
                this.message['cancel-sending'] = this.$i18n.td('mail.cancel-sending', '발신취소');
                this.message['recipient-status'] = this.$i18n.td('mail.recipient-status', '수신상태');
                this.message['recipient'] = this.$i18n.td('mail.recipient', '수신인');
                this.message['with'] = this.$i18n.td('mail.with', '외');
                this.message['internal-mail'] = this.$i18n.td('menu.internal-mail', '내부메일');
                this.message['system'] = this.$i18n.td('menu.system', '시스템');
                this.message['external-mail'] = this.$i18n.td('menu.external-mail', '외부메일');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['mail-type'] = this.$i18n.td('mail.mail-type', '메일유형');
                this.message['name-id'] = '\'' + this.$i18n.td('message.username', '성명') + '\' ' + this.$i18n.td('message.or', '또는') + ' \'' + this.$i18n.td('user.id', '아이디')
                    + '\'';
            },
            getMailTypeList() {
                let newMailTypeList = [
                    {text: this.message['all'], value: ''}
                    , {text: this.message['internal-mail'], value: 'INTERNAL'}
                    , {text: this.message['external-mail'], value: 'EXTERNAL'}
                ];
                this.mailTypeList = newMailTypeList;
            },
            getGridHeader() {
                let newGridHeader = [
                    {text: this.message['system'], align: 'center', sortable: false, value: 'systemKey', width: '180px'},
                    {text: this.message['mail-type'], align: 'center', sortable: false, value: 'mailType', width: '80px'},
                    {text: this.message['title'], align: 'center', sortable: false, value: 'mailSubject'},
                    {text: this.message['sender'], align: 'center', sortable: false, value: 'senderUserName', width: '150px'},
                    {text: this.message['recipient'], align: 'center', sortable: false, value: 'recipientUserName', width: '150px'},
                    {text: this.message['recipient-status'], align: 'center', sortable: false, width: '180px'},
                    {text: this.message['date'], align: 'center', sortable: false, value: 'sentDate', width: '120px'}
                ];

                this.mailHeaders = newGridHeader;
            }

        }

    }
</script>

<style scoped>

</style>
