<template>
    <div>
        <!-- 메일 송신 팝업 START v-model="isExternalMailWriteDialog"-->
        <div>
            <v-card id="internal-mail-write-dialog">
                <!-- Title Area -->
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{ message['compose'] }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-card-text class="dialog-body approval-writing">
                    <!-- [CONTENT] Approval title -->
                    <div class="aprv__content__row field-box">
                        <v-text-field :label="message['title']" v-model.trim="mailItem.title" required :rules="[rules.required]" maxlength="100"></v-text-field>
                    </div>
                    <!-- [CONTENT] 수신인 -->
                    <div class="aprv__content__row aprv__signer">
                        <!-- [CONTENT] 수신인 추가 -->
                        <div class="aprv__signer__add-row field-box">
              <span class="aprv__signer__add-row__el-wrapper">
                <v-text-field :label="message['recipient']" v-model.trim="searchText" @keypress.enter="searchUserByKeyText()" maxlength="30"
                              :placeholder="message['username']"></v-text-field>
              </span>
                            <span class="aprv__signer__add-row__el-wrapper">
                <v-btn @click.native="searchUserByKeyText()"><v-icon>search</v-icon>{{ message['menu-mail.add-recipient'] }}</v-btn>
              </span>
                        </div>
                        <div class="aprv__signer__ctrl-row">
                            <v-btn :disabled="mailItem.recipient.length < 1" @click.native="updateSelectedRecipientType ('TO', 0)">{{ message['to'] }}</v-btn>
                            <v-btn :disabled="mailItem.recipient.length < 1" @click.native="updateSelectedRecipientType ('CC', 1)">{{ message['cc'] }}</v-btn>
                            <v-btn :disabled="mailItem.recipient.length < 1" @click.native="updateSelectedRecipientType ('BCC', 2)">{{ message['bcc'] }}</v-btn>
                            <span class="aprv__signer__divider"></span>
                            <v-btn class="aprv__btn-icon" :disabled="mailItem.recipient.length < 1" @click.native="moveup()">
                                <v-icon>keyboard_arrow_up</v-icon>
                            </v-btn>
                            <v-btn class="aprv__btn-icon" :disabled="mailItem.recipient.length < 1" @click.native="movedown()">
                                <v-icon>keyboard_arrow_down</v-icon>
                            </v-btn>
                            <v-btn class="aprv__btn-icon" :disabled="mailItem.recipient.length < 1" @click.native="deleteRecipient()">
                                <v-icon>remove</v-icon>
                            </v-btn>
                            <span class="aprv__signer__divider"></span>
                            <span class="aprv__singer__text"> {{ message['total'] }} {{ mailItem.recipient.length }} {{ message['people'] }} </span>
                        </div>
                        <div class="aprv__signer__list">
                            <ul id="recipientList">
                                <li v-for="(item, index) in mailItem.recipient"
                                    class="aprv__signer__item"
                                    :class="{'aprv__signer__item--selected': item.isSelected}"
                                    :key="item.seq"
                                    @click.ctrl.exact.stop.prevent="toggleSelected(index)"
                                    @click.exact="toggleOneSelected(index)">
                                    <span class="aprv__signer__item__seq"> {{ index + 1 }}</span>
                                    <span class="aprv__signer__item__type">
                    <v-btn-toggle v-model="item.toggle" mandatory>
                      <v-btn @click.stop="updateRecipientType(item, 'TO')">{{ message['to'] }}</v-btn>
                      <v-btn @click.stop="updateRecipientType(item, 'CC')">{{ message['cc'] }}</v-btn>
                      <v-btn @click.stop="updateRecipientType(item, 'BCC')">{{ message['bcc'] }}</v-btn>
                    </v-btn-toggle>
                  </span>
                                    <span>{{ item.name }}({{ item.login }})/{{ item.email }}</span>
                                    <v-btn v-if="mode=='i'" @click.exact.stop="deleteOneRecipient('id', item.id)" class="aprv__signer__item__remove">
                                        <v-icon>clear</v-icon>
                                    </v-btn>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <ul class="fileList">
                        <li v-for="(file) in mailItem.newFileList" :key="file.fileId">
                            <span>{{file.fileName}} ({{file.fileSize|byteFilter}}) </span>
                            <v-icon v-if="mode=='i'" @click.exact.stop="deleteFile(file.fileId)">close</v-icon>
                            <!-- <v-btn  v-if="mode=='i'"  small color="" slot="activator" class="mb-2" >X</v-btn> -->
                        </li>
                    </ul>
                    <div class="aprv__content__row aprv__dropzone">
                        <div class="aprv__dropzone__collapse" @click="expandDropzone =! expandDropzone">
                            <span v-if="!expandDropzone">{{ message['attach-file-show'] }}</span>
                            <span v-if="expandDropzone">{{ message['attach-file-hide'] }}</span>
                            <v-icon v-if="expandDropzone">keyboard_arrow_up</v-icon>
                            <v-icon v-if="!expandDropzone">keyboard_arrow_down</v-icon>
                        </div>
                        <div class="aprv__dropzone__summary" v-if="!expandDropzone">
                            <span v-if="fileCount==0" class="aprv__dropzone__summary--empty">{{ message['attach-file-no-selected'] }}</span>
                            <span v-if="fileCount!=0">{{fileCount}} {{ message['attach-file-selected'] }} <small>{{fileSize|byteFilter}}</small></span>
                        </div>
                        <vue-dropzone
                            id="drop1"
                            ref="myVueDropzone"
                            :options="dropOptions"
                            v-show="expandDropzone"
                            @vdropzone-sending="sendingEvent"
                            @vdropzone-removed-file="removeEvent"
                            @vdropzone-file-added="fileAddedEvent"
                            @vdropzone-success-multiple="attachComplete"
                            @vdropzone-error="sendingErrorEvent"
                            @vdropzone-error-multiple="vdropzoneErrorMultiple"
                            @vdropzone-max-files-exceeded="maxFilesExceeded"
                        ></vue-dropzone>
                    </div>
                    <!-- [CONTENT] Approval title -->
                    <div class="aprv__content__row aprv_editor">
                        <div id="app_editor">
                            <wysiwyg v-model="mailItem.content" @blur="onBlur($event)"></wysiwyg>
                        </div>
                    </div>

                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ message['close'] }}</v-btn>
                    <v-btn primary @click.native="saveDialog">{{ message['send'] }}</v-btn>
                </v-card-actions>
                <div v-if="loading" style="width: 100%; height: 100%; z-index: 9999; position: absolute;">
                    <v-progress-circular indeterminate color="primary" :size="70" style="position: fixed; left: 50%; top: 50%; z-index: 200;"></v-progress-circular>
                </div>
            </v-card>
        </div>
        <!-- 메일 송신 팝업 END-->
        <!-- 수신인 검색 START-->
        <internal-user-search-dialog :isUserSearchDialog="isInternalUserSearchDialog"
                                     :searchText="searchText"
                                     :recipientList="mailItem.recipient"
                                     :users="users"
                                     :mode="mode"
                                     @addInternalRecipient="addInternalRecipient"
                                     @closeInternalUserSearchDialog="closeInternalUserSearchDialog" />
        <!-- 수신인 검색 END-->


        <v-layout row justify-center>
            <v-dialog v-model="confirmDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text> 메일 발송 하시겠습니까?</v-card-text>
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

    import axios from 'axios';
    import vueDropzone from 'vue2-dropzone';
    import ExternalUserSearchDialog from './ExternalUserSearchDialog';
    import InternalUserSearchDialog from './InternalUserSearchDialog';
    //var CONTEXT_HOST  = axios.defaults.baseURL
    //debugger
    const CONTEXT_ROOT = '/rest/v1/mail';
    const CONTEXT_USER = '/rest/v1/user/find';
    const DOWNLOAD_ROOT = '/rest/v1/download';
    const FILE_ROOT = '/rest/v1/file';
    const UPLOAD_ROOT = '/rest/v1/upload';
    export default {
        components: {vueDropzone, ExternalUserSearchDialog, InternalUserSearchDialog},
        props: ['isInternalMailWriteDialog', 'mode', 'mailId', 'replyOrForward', 'bExcludeMe', 'bOnlySender'],//, 'mailItem''totalItems',
        data() {
            var contextHost = axios.defaults.baseURL;
            if (contextHost == undefined) {
                contextHost = '';
            }
            return {
                /*----Dropzone----*/
                expandDropzone: false,
                confirmDialog: false,
                fileCount: false,
                fileSize: false,
                TOTAL_FILE_SIZE_LIMIT: 10 * 1024 * 1024,
                /*----------------*/
                toggle: [],
                selectedRow: [],
                isUserSearchDialog: false,
                isInternalUserSearchDialog: false,
                isUserCheck: false,
                content: '',
                totalFileSize: 0,
                searchText: '',
                totalItems: 0,
                loading: false,
                users: [],
                // selected : [],
                mailIndex: -1,
                customToolbar: [
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['image']
                ],
                mailItem: {
                    systemKey: this.$store.state.loginStore.systemKey,
                    title: '',
                    senderMailAddress: '',
                    epid: '',
                    id: 2,
                    recipient: [],
                    newFileList: [],
                    content: '',
                    timezone: 'Asia/Seoul',
                    locale: 'ko_KR',
                    encoding: 'utf-8'
                },
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.')
                },
                defaultItem: {
                    systemKey: this.$store.state.loginStore.systemKey,
                    title: '',
                    sender: '',
                    recipient: [],
                    newFileList: [],
                    content: '',
                    senderMailAddress: '',
                    epid: '',
                    id: 2,
                    timezone: 'Asia/Seoul',
                    locale: 'ko_KR',
                    encoding: 'utf-8'
                },
                recipient: {
                    seq: 0,
                    recipientType: 'TO',
                    name: '',
                    login: '',
                    epid: '',
                    mail: '',
                    toggle: 0,
                    isSelected: false
                },
                mailReader: {
                    mail: {
                        mailSubject: ''
                    },
                    allList: [],
                    toList: [],
                    ccList: [],
                    bccList: []

                },
                config: {
                    toolbar: [
                        // { name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
                        //{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
                        // { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
                        //{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
                        '/',
                        {name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat']},
                        {name: 'paragraph',
                            items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight',
                                'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language']
                        },
                        // { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
                        // { name: 'insert', items: [ 'Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
                        '/',
                        {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                        {name: 'colors', items: ['TextColor', 'BGColor']},
                        // { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
                        {name: 'about', items: ['About']}
                    ],
                    height: 300
                },
                dropOptions: {
                    paramName: 'file',
                    maxFilesize: 10240,//MB
                    maxFiles: 1000000,
                    autoProcessQueue: false,
                    autoQueue: true,
                    addRemoveLinks: true,
                    uploadMultiple: true,
                    parallelUploads: 1000000, //Default : 2
                    dictDefaultMessage: this.$i18n.td('message.attach-file-drop-message', '첨부할 파일을 여기에 놓아 주세요.'),
                    // acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
                    url: contextHost + CONTEXT_ROOT + '/i/attach',
                    headers: {
                        'Cache-Control': '',
                        'X-Requested-With': '',
                        'X-XSRF-TOKEN': this.$cookie.get('XSRF-TOKEN')
                    },
                    dictRemoveFile: this.$i18n.td('message.attach-file-remove', '첨부파일 삭제')
                },
                message: {
                    'close': '',
                    'send': '',
                    'search': '',
                    'compose': '',
                    'bcc': '',
                    'cc': '',
                    'to': '',
                    'title': '',
                    'total': '',
                    'people': '',
                    'registered-user': '',
                    'no-data': '',
                    'user-can-not-search': '',
                    'limit-content': '',
                    'limit-recipient': '',
                    'more-character': '',
                    'menu-mail.add-recipient': '',
                    'recipient-least-one': '',
                    'attach-file-show': '',
                    'attach-file-hide': '',
                    'attach-file-no-selected': '',
                    'attach-file-selected': '',
                    'limit-subject': '',
                    'send-success': '',
                    'max-file': '',
                    'max-file-exceeded': ''

                }
            };
        },
        watch: {
            isInternalMailWriteDialog: function () {
                this.totalFileSize = 0;
                if (this.isInternalMailWriteDialog == true && (this.replyOrForward == 'F' || this.replyOrForward == 'R')) {
                    this.totalFileSize = 0;
                    //this.removeAllFiles()
                    this.getMail(this.mailId);
                }
            }
        },
        mounted() {

            //다국어 메세지 조회
            this.messageLoad();

            // console.log("moundted")
            // console.log(axios.defaults.baseURL)
            // console.log(this.CONTEXT_HOST)
            this.CONTEXT_HOST = axios.defaults.baseURL;
        },
        computed: {
            // CONTEXT_HOST : function(){
            //     return axios.defaults.baseURL
            // }
        },
        methods: {
            onBlur(editor) {
                this.mailItem.content = editor.innerHTML;
            },
            onFocus(editor) {
                // console.log(editor)
            },
            getFileCount() {

                if ('undefined' !== typeof this.$refs.myVueDropzone.dropzone) {
                    var files = this.$refs.myVueDropzone.dropzone.files;
                    this.fileCount = files.length;
                    var size = 0;
                    for (var i = 0, ii = files.length; i < ii; i++) {
                        size += files[i].size;
                    }
                    this.fileSize = size;
                } else {
                    this.fileCount = 0;
                    this.fileSize = 0;
                }

                /*if ( this.mailItem.newFileList > 0 || 'undefined' !== typeof this.$refs.myVueDropzone.dropzone) {
                    this.fileCount = this.mailItem.newFileList.length
                    if ( this.mailItem.newFileList > 0 || 'undefined' !== typeof this.$refs.myVueDropzone.dropzone) {
                        var files = this.$refs.myVueDropzone.dropzone.files;
                        this.fileCount += files.length;
                    }
                    this.fileSize = this.totalFileSize
                } else {
                    this.fileCount = 0;
                    this.fileSize = 0;
                }*/
            },
            getMail(mailId) {
                let sendUrl = CONTEXT_ROOT + '/i/';
                axios
                .get(sendUrl + mailId)
                .then(response => {
                    let mailInfo = response.data.mailInfo;
                    let mail = mailInfo.mail;
                    let toList = mailInfo.toList;
                    let ccList = mailInfo.ccList;
                    let bccList = mailInfo.bccList;
                    this.mailReader = response.data.mailInfo;

                    this.mailItem.title = this.mailReader.mail.mailSubject;
                    this.mailItem.content = this.mailReader.mail.mailDescription;
                    this.mailItem.timezone = 'Asia/Seoul';
                    this.mailItem.locale = 'ko_KR';
                    this.mailItem.encoding = 'utf-8';
                    this.mailItem.senderMailAddress = this.$store.state.loginStore.currentUser.email;
                    this.mailItem.epid = this.$store.state.loginStore.currentUser.epid;
                    this.mailItem.id = this.$store.state.loginStore.currentUser.userId;
                    this.mailItem.recipient = [];
                    this.mailItem.fileList = response.data.fileList;
                    this.mailItem.newFileList = [];

                    this.mailItem.content
                        = '<br><br><strong>--------- Original Message ---------</strong>'
                        + '<br><strong>Sender : </strong>' + this.mailReader.mail.senderUserName + ' (' + this.mailReader.mail.senderUserLogin + ')'
                        + '<br><strong>Date : </strong>' + this.dateToYYYYMMDD(new Date(this.mailReader.mail.sentDate))
                        + '<br><strong>Title : </strong>' + this.mailReader.mail.mailSubject
                        + '<br><br>' + this.mailReader.mail.mailDescription;
                    if (this.mailItem.fileList.length > 0) {
                        let item;
                        axios.post(UPLOAD_ROOT + '/copy', this.mailItem.fileList)
                        .then(response => {
                            this.mailItem.newFileList = response.data;
                            for (let i = 0; i < this.mailItem.newFileList.length; i++) {
                                this.totalFileSize += this.mailItem.newFileList[i].fileSize;
                            }

                            // this.getFileCount()
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                    if (this.replyOrForward == 'R') {
                        // 1-1. 제목
                        this.mailItem.title = 'Re: ' + this.mailItem.title;
                        // debugger
                        // 1-2-1. 발신자에게만
                        if (this.bOnlySender == true) {
                            this.addSenderToRecipient();
                        }
                        // 1-2-2. 발신자와 수신자 모두에게
                        else {
                            if (this.bExcludeMe == false && (this.mailReader.mail.senderUserId != this.$store.state.loginStore.currentUser.userId)) {
                                this.addSenderToRecipient();
                            }
                            for (var i = 0; i < this.mailReader.toList.length; i++) {
                                let item = this.mailReader.toList[i];

                                //수신인에서 본인 제외 옵션
                                if (this.bExcludeMe == false || (item.recipientUserId != this.$store.state.loginStore.currentUser.userId && item.recipientUserId
                                    != this.mailReader.mail.senderUserId)) {
                                    this.initAddRecipient(item, 'TO');
                                }
                            }
                            for (var i = 0; i < this.mailReader.ccList.length; i++) {
                                let item = this.mailReader.ccList[i];
                                if (this.bExcludeMe == false || (item.recipientUserId != this.$store.state.loginStore.currentUser.userId && item.recipientUserId
                                    != this.mailReader.mail.senderUserId)) {
                                    this.initAddRecipient(item, 'CC');
                                }
                            }
                        }
                    } else if (this.replyOrForward == 'F') {
                        this.mailItem.title = 'Fwd: ' + this.mailItem.title;
                        if (this.bOnlySender == true) {
                            for (var i = 0; i < this.mailReader.toList.length; i++) {
                                let item = this.mailReader.toList[i];
                                //수신인에서 본인 제외 옵션
                                if (this.bExcludeMe == false || item.recipientUserId != this.$store.state.loginStore.currentUser.userId) {
                                    this.initAddRecipient(item, 'TO');
                                }
                            }
                            for (var i = 0; i < this.mailReader.ccList.length; i++) {
                                let item = this.mailReader.ccList[i];
                                if (this.bExcludeMe == false || item.recipientUserId != this.$store.state.loginStore.currentUser.userId) {
                                    this.initAddRecipient(item, 'CC');
                                }
                            }
                        }
                    }
                })
                .catch(error => {

                });
            },
            addSenderToRecipient() {
                let item = {};
                item.recipientUserId = this.mailReader.mail.senderUserId;
                item.recipientUserName = this.mailReader.mail.senderUserName;
                item.recipientUserLogin = this.mailReader.mail.senderUserLogin;
                item.epid = this.mailReader.mail.epid;
                item.mailAddress = this.mailReader.mail.senderMailAddress;
                this.initAddRecipient(item, 'TO');
            },
            initAddRecipient(item, recipientType) {
                this.totalItems++;
                let recipientItem = {};
                recipientItem.seq = this.totalItems - 1;
                recipientItem.id = item.recipientUserId;
                recipientItem.name = item.recipientUserName;
                recipientItem.login = item.recipientUserLogin;
                recipientItem.epid = item.epid;
                recipientItem.email = item.mailAddress;
                recipientItem.recipientType = recipientType;

                recipientItem.toggle = this.getRecipientToggle(recipientType);
                recipientItem.isSelected = false;

                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['id'] == item.recipientUserId) {
                        this.$notify({text: '[' + item.recipientUserName + '(' + item.recipientUserId + ')] ' + this.message['registered-user'], type: 'warn'});
                        return false;
                    }
                }
                this.mailItem.recipient.push(recipientItem);
            },
            getRecipientToggle(recipientType) {
                let toggle = 0;
                if (recipientType == 'TO') {
                    toggle = 0;
                } else if (recipientType == 'CC') {
                    toggle = 1;
                } else if (recipientType == 'BCC') {
                    toggle = 2;
                }
                return toggle;
            },
            //날짜시간 형식
            dateToYYYYMMDD(date) {
                var pad = function (num) {
                    num = num + '';
                    return num.length < 2 ? '0' + num : num;
                };
                return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(
                    date.getHours() + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()));
            },
            searchUserByKeyText: _.debounce(function () {
                if (this.mailItem.recipient.length >= 200) {
                    this.$notify({text: this.message['limit-recipient'], type: 'warn'});
                    return false;
                }

                // Internal의 경우 조건 안주면 전체 검색하도록 변경합니다.
                // if(this.searchText.length<2){
                //     this.$notify({text:this.message['more-character'], type:'warn' });
                //     return false;
                // }

                this.searchInternalUser(this.searchText);
            }, 100)
            ,
            searchInternalUser(key) {
                // console.log(this.mode)
                axios
                .post(CONTEXT_USER, {searchText: key, systemKey: this.$store.state.loginStore.systemKey})
                .then(response => {
                    this.users = response.data;
                    if (this.users.length > 0) {
                        if (this.users.length == 1) {
                            this.addInternalRecipient(this.users[0]);
                        } else {
                            this.isInternalUserSearchDialog = true;
                        }
                    } else {
                        this.$notify({text: this.message['no-data'], type: 'warn'});
                    }
                }).catch(error => {

                });
            },
            saveDialog() {
                this.confirmDialog = false;
                let contentlimit = 1 * 1024 * 1024;
                if (this.mailItem.recipient.length < 1) {
                    this.$notify({text: this.message['recipient-least-one'], type: 'warn'});
                    return false;
                } else if (this.mailItem.title.length > 100) {
                    this.$notify({text: this.message['limit-subject'], type: 'warn'});
                    return false;
                } else if (this.mailItem.content.length >= contentlimit) {
                    this.$notify({text: this.message['limit-content'], type: 'warn'});
                    return false;
                } else if (this.mailItem.recipient.length > 200) {
                    this.$notify({text: this.message['limit-recipient'], type: 'warn'});
                    return false;
                }

                if (this.mailItem.title.trim().length < 1) {
                    this.$notify({text: this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.$i18n.td('message.title', '제목')]), type: 'warn'});
                    return false;
                }

                //console.log(this.mailItem.content)
                if (this.mailItem.content.trim().length < 1) {
                    this.$notify({text: this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.$i18n.td('mail.mail-contents', '메일본문')]), type: 'warn'});
                    return false;
                }

                this.confirmDialog = true;
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                this.loading = true;

                this.mailItem.systemKey = this.$store.state.loginStore.systemKey;
                this.mailItem.senderMailAddress = this.$store.state.loginStore.currentUser.email;
                this.mailItem.epid = this.$store.state.loginStore.currentUser.epid;
                this.mailItem.id = this.$store.state.loginStore.currentUser.userId;
                this.mailItem.userName = this.$store.state.loginStore.currentUser.login;
                this.mailItem.fullName = this.$store.state.loginStore.currentUser.fullName;

                /*  if(this.$refs.editor.value.trim().length>0){
                    this.mailItem.content = this.$refs.editor.value;
                  }*/
                //console.log(this.mailItem.content)
                if (this.mailItem.content.trim().length < 1) {
                    this.$notify({text: this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.$i18n.td('mail.mail-contents', '메일본문')]), type: 'warn'});
                    return false;
                }

                //debugger
                let queuedfiles = this.$refs.myVueDropzone.getQueuedFiles();
                let totalAttachedFileSize = this.$refs.myVueDropzone.dropzone.files.length;

                if (queuedfiles.length > 0 || this.mailItem.newFileList.length > 0) { //첨부파일이 있는 경우
                    if (this.mailItem.newFileList.length > 0) { //
                        this.mailItem.bizCode = this.mailItem.newFileList[0].fileGroupId;
                        let fileIds = [];
                        for (let i = 0; i < this.mailItem.newFileList.length; i++) {
                            fileIds.push(this.mailItem.newFileList[i].fileId);
                        }
                        //기존 첨부파일 복사본의 임시저장파일을 확정파일로 변경
                        axios.post(UPLOAD_ROOT + '/confirm', fileIds)
                        .then(response => {
                            // debugger
                            if (queuedfiles.length > 0) { // 새로 추가된 파일이 있으면 전홍
                                this.$refs.myVueDropzone.processQueue();
                                //this.closeDialog ()
                            } else { //queue에 데이터가 없는 경우
                                axios.post(CONTEXT_ROOT + '/i/create', this.mailItem)
                                .then(response => {
                                    this.closeDialog();
                                    this.loading = false;
                                    this.$notify({title: this.message['send'], text: this.message['send-success'], type: 'success'});
                                }).catch(error => {

                                    this.loading = false;
                                });
                            }
                        }).catch(error => {

                            this.loading = false;
                        });
                    } else if (queuedfiles.length > 0) { // 전부 새로 추가시킨 파일인 경우
                        this.$refs.myVueDropzone.processQueue();
                        //this.closeDialog ()
                    }
                } else {
                    //파일이 없을때
                    axios.post(CONTEXT_ROOT + '/i/create', this.mailItem)
                    .then(response => {
                        this.loading = false;
                        this.closeDialog();
                        this.$notify({title: this.message['send'], text: this.message['send-success'], type: 'success'});
                    }).catch(error => {
                        this.loading = false;
                    });
                }
            },
            deleteFile(fileId) {
                for (var i = 0; i < this.mailItem.newFileList.length; i++) {
                    if (this.mailItem.newFileList[i]['fileId'] == fileId) {
                        this.totalFileSize -= this.mailItem.newFileList[i].fileSize;
                        this.mailItem.newFileList.splice(i, 1);
                    }
                }
                axios.get(FILE_ROOT + '/delete/' + fileId)
                .then(response => {
                }).catch(error => {
                });
            },
            attachComplete() {
                this.closeDialog();
                this.$notify({title: this.message['send'], text: this.message['send-success'], type: 'success'});
            },
            closeDialog() {
                this.loading = false;
                this.$refs.myVueDropzone.removeAllFiles();
                this.mailItem = Object.assign({}, this.defaultItem);
                this.mailItem.recipient = [];
                this.mailItem.newFileList = [];
                this.mailIndex = -1;
                this.totalItems = 0;
                this.fileCount = 0;
                this.fileSize = 0;
                this.searchText = '';
                this.$emit('closeInternalMailWriteDialog');
                window.close();
            },
            closeUserSearchDialog() {
                this.isUserSearchDialog = false;
            },
            closeInternalUserSearchDialog() {
                this.isInternalUserSearchDialog = false;
            },
            addInternalRecipient(item) {
                this.totalItems += 1;
                //debugger
                let recipientItem = Object.assign({}, this.recipient);
                recipientItem.seq = this.totalItems - 1;
                recipientItem.id = item.userId;
                recipientItem.name = item.fullName;
                recipientItem.login = item.login;
                recipientItem.epid = item.epid;
                recipientItem.email = item.email;
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['id'] == item.userId) {
                        this.$notify('[' + item.fullName + '(' + item.login + ')] ' + this.message['registered-user']);
                        return false;
                    }
                }
                this.searchText = '';
                this.mailItem.recipient.push(recipientItem);
                this.closeUserSearchDialog();
            },
            updateRecipientType(item, recipientType) {
                if (this.mode == 'e') {
                    this.modifyItemForEpid(item.epid, 'recipientType', recipientType);
                } else if (this.mode == 'i') {
                    this.modifyItemForId(item.id, 'recipientType', recipientType);
                }

            },
            updateSelectedRecipientType(recipientType, buttonType) {
                for (let i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i].isSelected) {
                        this.mailItem.recipient[i]['recipientType'] = recipientType;
                        this.mailItem.recipient[i]['toggle'] = buttonType;
                    }
                }
            },
            modifyItemForEpid(epid, key, value) {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['epid'] == epid) {
                        this.mailItem.recipient[i][key] = value;
                    }
                }
            },
            modifyItemForId(id, key, value) {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['id'] == id) {
                        this.mailItem.recipient[i][key] = value;
                    }
                }
            },
            deleteRecipient() {
                let name = 'id', value = '';

                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['isSelected'] == true) {
                        this.deleteOneRecipient(name, this.mailItem.recipient[i][name]);
                        this.totalItems--;
                        i--;
                    }
                }
                this.adjustAll();
            },
            deleteOneRecipient(key, value) {
                this.removeItem(key, value);
                this.adjustAll();
                this.totalItems--;
            },
            removeItem(key, value) {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i][key] == value) {
                        this.mailItem.recipient.splice(i, 1);
                        return;
                    }
                }
            },
            swap(index1, index2) {
                let temp = this.mailItem.recipient[index1];
                this.mailItem.recipient[index1] = this.mailItem.recipient[index2];
                this.mailItem.recipient[index2] = temp;
            },
            moveup() {
                let isStart = false;
                let key = 'id';

                for (let i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['isSelected'] == true) {
                        if (this.getItem(key, this.mailItem.recipient[i][key], 'seq') == 0) {
                            isStart = true;
                            return false;
                        }
                    }
                }
                if (isStart == false) {
                    for (let i = 0; i < this.mailItem.recipient.length; i++) {
                        if (this.mailItem.recipient[i]['isSelected'] == true) {
                            this.swap(i, i - 1);
                        }
                    }
                    this.adjustAll();
                }
            },
            movedown() {
                let isLast = false;
                let key = 'id';
                for (let i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['isSelected'] == true) {
                        let seq = this.getItem(key, this.mailItem.recipient[i][key], 'seq');
                        if (seq >= (this.mailItem.recipient.length - 1)) {
                            isLast = true;
                            return false;
                        }
                    }
                }
                if (isLast == false) {
                    for (let i = this.mailItem.recipient.length - 1; i >= 0; i--) {
                        if (this.mailItem.recipient[i]['isSelected'] == true) {
                            this.swap(i, i + 1);
                        }
                    }
                    this.adjustAll();
                }
            },
            getItem(key1, id, key2) {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i][key1] == id) {
                        return this.mailItem.recipient[i][key2];
                    }
                }
            },
            adjustAll() {
                var seq = 0;
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    this.mailItem.recipient[i]['seq'] = seq++;
                }
            },

            //style
            styleSelected(isSelected) {
                if (isSelected) {
                    return {selected: true};
                } else {
                    return {selected: false};
                }
            },
            toggleSelected(index) {
                this.mailItem.recipient[index].isSelected = !this.mailItem.recipient[index].isSelected;
            },
            toggleOneSelected(index) {
                for (let i = 0; i < this.mailItem.recipient.length; i++) {
                    this.mailItem.recipient[i].isSelected = false;
                }
                this.mailItem.recipient[index].isSelected = true;
            },
            sendingEvent: function (file, xhr, formData) {
                formData.append('file', file);
                formData.append('mail', new Blob([JSON.stringify(this.mailItem)], {type: 'application/json'}));
            },
            sendingErrorEvent() {
                this.loading = false;
            },
            removeAllFiles() {
                this.$refs.myVueDropzone.removeAllFiles();
                this.getFileCount();

            },
            fileAddedEvent(file) {
                this.totalFileSize += file.size;

                if (this.TOTAL_FILE_SIZE_LIMIT < this.totalFileSize) {
                    this.$refs.myVueDropzone.removeFile(file);
                    this.$notify({title: this.message['max-file'], text: this.message['max-file-exceeded'], type: 'warn'});
                }
                this.getFileCount();
                /*let dropzoneFiles = this.$refs.myVueDropzone.dropzone.files

                console.log("[fileAddedEvent] file")
                console.log(file)
                console.log("[fileAddedEvent] dropzone.files")
                console.log(this.$refs.myVueDropzone.dropzone.files)

                if (dropzoneFiles.length) {
                    var i, len;
                    for (i = 0, len = dropzoneFiles.length; i < len - 1; i++) // -1 to exclude current file
                    {
                        if(dropzoneFiles[i].name === file.name && dropzoneFiles[i].size === file.size )
                        {
                           // this.$refs.myVueDropzone.dropzone.files.splice(len, 1);;
                            this.$refs.myVueDropzone.removeFile(file)
                            alert("파일명 중복은 허용이 안됩니다. ")
                        }
                    }
                }
                console.log("[fileAddedEvent] removed dropzone.files")
                console.log(this.$refs.myVueDropzone.dropzone.files)*/
            },
            removeEvent(file, error, xhr) {
                this.totalFileSize -= file.size;
                this.getFileCount();
                /*let newFiles = this.mailItem.newFileList
                //let queueFiles = this.$refs.myVueDropzone.getQueuedFiles()
                for (let i = 0 ; i < newFiles.length - 1; i++) // -1 to exclude current file
                {
                    console.log("newFiles[i].fileName")
                    console.log(newFiles[i].fileName)
                    console.log("file.name")
                    console.log(file.name)

                    if(newFiles[i].fileName == file.name)
                    {
                        console.log("newFiles[i].fileName == file.name")
                        axios.get(FILE_ROOT + '/delete/' + newFiles[i].fileId)
                            .then(response => {
                                this.mailItem.newFileList.splice(i, 1)
                            }).catch(error=>{
                            console.log(error)
                        })
                    }
                }*/
            },
            maxFilesExceeded(file) {
                //console.log('exceeded file limit')

            },
            messageLoad() {
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['send'] = this.$i18n.td('button.send', '발신');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['compose'] = this.$i18n.td('mail.compose', '메일쓰기');
                this.message['bcc'] = this.$i18n.td('mail.bcc', '비밀참조');
                this.message['cc'] = this.$i18n.td('mail.cc', '참조');
                this.message['to'] = this.$i18n.td('mail.to', '수신');
                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['total'] = this.$i18n.td('message.total', '총');
                this.message['people'] = this.$i18n.td('message.people', '명');
                this.message['registered-user'] = this.$i18n.td('menu-mail.registered-user', '이미 수신인에 등록되어 있습니다.');
                this.message['no-data'] = this.$i18n.td('message.no-data', '조회된 내용이 없습니다.');
                this.message['user-can-not-search'] = this.$i18n.td('message.user-can-not-search', '존재하지 않는 사용자입니다.');
                this.message['limit-content'] = this.$i18n.td('message.limit-content', '본문은 {0}를 초과할 수 없습니다.', '1MB');
                this.message['limit-recipient'] = this.$i18n.td('menu-mail.limit-recipient', '수신자는 200명 이상 지정할 수 없습니다.');
                this.message['more-character'] = this.$i18n.td('message.more-character', '2자 이상 검색됩니다.');
                this.message['menu-mail.add-recipient'] = this.$i18n.td('menu-mail.add-recipient', '수신인추가');
                this.message['recipient-least-one'] = this.$i18n.td('mail.recipient-least-one', '수신자는 적어도 1명이상이어야 합니다.');

                this.message['attach-file-show'] = this.$i18n.td('message.attach-file-show', '첨부파일 보이기');
                this.message['attach-file-hide'] = this.$i18n.td('message.attach-file-hide', '첨부파일 숨기기');

                this.message['attach-file-no-selected'] = this.$i18n.td('message.attach-file-no-selected', '선택된 파일이 없습니다.');
                this.message['attach-file-selected'] = this.$i18n.td('message.attach-file-selected', '개의 파일이 선택되었습니다.');

                this.message['limit-subject'] = this.$i18n.td('limit-subject', '제목은 30자 이상 지정할 수 없습니다.');
                this.message['recipient'] = this.$i18n.td('mail.recipient', '수신인');
                this.message['input-required-approval-contents'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['context']]);

                this.message['send-success'] = this.$i18n.td('mail.send-success', '메일이 발신되었습니다.');

                this.message['max-file'] = this.$i18n.td('message.max-file', '파일 용량 초과');
                this.message['max-file-exceeded'] = this.$i18n.td('message.max-file-exceeded ', '파일 용량을 초과하였습니다: ' + this.TOTAL_FILE_SIZE_LIMIT / 1024 / 1024 + 'MB',
                    [this.TOTAL_FILE_SIZE_LIMIT / 1024 / 1024]);

            },
            vdropzoneErrorMultiple(files, message, xhr) {
                // debugger
                if (xhr != undefined) {
                    this.$notify({title: 'http response code ' + xhr.status, text: message.errMsg, type: 'error'});
                } else {
                    this.$notify({title: 'file upload', text: message, type: 'error'});
                }

            }

        }
    };
</script>
<style lang="scss">
    @import "styles/approvalModal.scss";


    /* [FILE-TABLE] 파일 목록 모양 */
    #app #internal-mail-write-dialog .fileList {
        width: 100%;
        margin: 10px 0;
    }

    #app #internal-mail-write-dialog .fileList > li {
        list-style: none;
        background: #EBEBEB;
        border: 1px solid #CCC;
        padding: 0 15px;
        height: 26px;
        line-height: 26px;
    }

    #app #internal-mail-write-dialog .fileList > li + li {
        margin-top: 2px;
    }

    #app #internal-mail-write-dialog .fileList > li .icon {
        font-size: 20px;
        float: right;
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        border-radius: 50%;
        width: 26px;
        margin-right: -10px;
    }

    #app #internal-mail-write-dialog .fileList > li .icon:hover {
        opacity: 0.5;
        background: #FFF;
    }


    #app #internal-mail-write-dialog .file-table tr:first-child {
        height: 26px;
    }

    #app #internal-mail-write-dialog .file-table tr:first-child td {
        padding: 0 15px;
    }

    #app #internal-mail-write-dialog .file-table tr {
        background: #EBEBEB;
        height: 26px;
    }

    #app #internal-mail-write-dialog .file-table td {
        border: 1px solid #CCC;
        padding: 0 15px;
        line-height: 26px;
    }

    #app #internal-mail-write-dialog .file-table td a {
        text-decoration: none;
    }

    /* [FILE-TABLE] 파일 목록 모양 */
    #app #internal-mail-write-dialog .file-table .icon-link {
        float: right;
    }

    #app #internal-mail-write-dialog .file-table .icon-link .icon {
        font-size: 20px;
    }

    #app #internal-mail-write-dialog .file-table .icon-link .icon:hover {
        opacity: 0.5;
    }

    #vue-editor {
        height: 500px;
        overflow: auto;
    }
</style>
