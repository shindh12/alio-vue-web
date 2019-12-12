<template>
    <div class="approval-dialog">
        <!-- 메일 송신 팝업 START v-model="isExternalMailWriteDialog"-->
        <v-dialog :value="isExternalMailWriteDialog" @input="closeDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
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
                        <tb-validator class="tb-validator-in-dialog" :target="mailItem.title" v-model="mailValid" :rules="[rules.required]" ref="form-valid" lazy
                                      @click.native="clearValid">
                            <v-text-field :label="message['title']" v-model.trim="mailItem.title" required maxlength="100" />
                        </tb-validator>
                    </div>

                    <!-- [CONTENT] 수신인 -->
                    <div class="aprv__content__row aprv__signer">
                        <!-- [CONTENT] 수신인 추가 -->
                        <div class="aprv__signer__add-row field-box">
                        <span class="aprv__signer__add-row__el-wrapper">
                            <v-text-field :label="message['recipient']" v-model.trim="searchText" @keypress.enter="searchUserByKeyText()" maxlength="30"
                                          :placeholder="message['username']" />
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
                                    @click.exact="toggleOneSelected(index)"
                                >
                                    <span class="aprv__signer__item__seq"> {{ index + 1 }}</span>
                                    <span class="aprv__signer__item__type">
                                    <v-btn-toggle v-model="item.toggle" mandatory>
                                        <v-btn @click.stop="updateRecipientType(item, 'TO')"> {{ message['to'] }} </v-btn>
                                        <v-btn @click.stop="updateRecipientType(item, 'CC')"> {{ message['cc'] }} </v-btn>
                                        <v-btn @click.stop="updateRecipientType(item, 'BCC')"> {{ message['bcc'] }}</v-btn>
                                    </v-btn-toggle>
                                </span>
                                    <span>{{ item.name }}({{item.epenorganizationname}} , {{ item.login }})/{{ item.email }}</span>
                                    <v-btn @click.exact.stop="deleteOneRecipient(item.epid)" class="aprv__signer__item__remove">
                                        <v-icon>clear</v-icon>
                                    </v-btn>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="aprv__content__row aprv__dropzone">
                        <ul id="fileList">
                            <li v-for="(file) in mailItem.newFileList" :key="file.fileId">
                                <span>{{file.fileName}} </span>
                                <v-btn v-if="mode=='i'" small color="" slot="activator" class="mb-2" @click.exact.stop="deleteFile(file.fileId)">X</v-btn>
                            </li>
                        </ul>

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
                            @vdropzone-file-added="fileAddedEvent"
                            @vdropzone-removed-file="removeEvent"
                            @vdropzone-success-multiple="attachComplete"
                            @vdropzone-error="sendingErrorEvent"
                            @vdropzone-error-multiple="vdropzoneErrorMultiple"
                        ></vue-dropzone>
                    </div>
                    <!-- [CONTENT] Approval title
                    <div class="aprv__content__row aprv_editor">
                        <vue-ckeditor
                            :config="config"
                            ref='editor'
                            v-model="mailItem.content"
                            @blur="onBlur($event)"
                            @focus="onFocus($event)">
                         </vue-ckeditor>
                    </div> -->

                    <div class="aprv__content__row aprv_editor">
                        <div id="app_editor">
                            <wysiwyg id="vue-editor" v-model="mailItem.content" @blur="onBlur($event)"></wysiwyg>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="openDocSecureTypeOptionDialog">{{ message['options'] }}</v-btn>
                    <v-btn @click.native="closeDialog">{{ message['close'] }}</v-btn>
                    <v-btn primary @click.native="saveDialog">{{ message['send'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- 메일 송신 팝업 END-->

        <!-- 수신인 검색 START-->
        <external-user-search-dialog :isUserSearchDialog="isUserSearchDialog"
                                     :searchText="searchText"
                                     :recipientList="mailItem.recipient"
                                     :users="users"
                                     :mode="mode"
                                     @addRecipient="addRecipient"
                                     @closeUserSearchDialog="closeUserSearchDialog" />
        <!-- 수신인 검색 END-->
        <v-dialog :value="isDocSecureTypeOptionDialog" @input="closeDocSecureTypeOptionDialog" max-width="500px">
            <v-card color="white">
                <v-card-title>
                    <span class="headline">{{ message['options'] }}</span>
                </v-card-title>
                <v-container fluid class="pa-1 mt-3 mb-3">
                    <v-radio-group v-model="checkDocSecureType">
                        <v-radio
                            :label="message['personal']"
                            :value="'PERSONAL'"
                        />
                        <v-radio
                            :label="message['official']"
                            :value="'OFFICIAL'"
                        />
                    </v-radio-group>
                </v-container>
                <v-card-actions>
                    <v-btn @click.native="closeDocSecureTypeOptionDialog">{{ message['close'] }}</v-btn>
                    <v-btn primary @click.native="checkDocSecureTypeOption">{{ message['apply'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!-- [MODAL] 삭제 모달 -->
        <v-layout row justify-center>
            <v-dialog v-model="confirmDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text> 외부메일 발송 하시겠습니까?</v-card-text>
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

    const CONTEXT_ROOT = '/rest/v1/mail';
    const CONTEXT_USER = '/rest/v1/user';
    export default {
        components: {vueDropzone, ExternalUserSearchDialog, InternalUserSearchDialog},
        props: ['isExternalMailWriteDialog', 'mode'],
        data() {
            var contextHost = axios.defaults.baseURL;
            if (contextHost == undefined) {
                contextHost = '';
            }
            return {
                /*----Dropzone----*/
                expandDropzone: false,
                fileCount: false,
                fileSize: false,
                TOTAL_FILE_SIZE_LIMIT: 10 * 1024 * 1024,
                /*----------------*/
                toggle: [],
                selectedRow: [],
                confirmDialog: false,
                isUserSearchDialog: false,
                isUserCheck: false,
                isDocSecureTypeOptionDialog: false,
                checkDocSecureType: 'PERSONAL',
                content: '',
                searchText: '',
                totalItems: 0,
                totalFileSize: 0,
                users: [],
                // selected : [],
                mailIndex: -1,
                contentlimit: 1 * 1024 * 1024,
                customToolbar: [
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['image']
                ],
                mailValid: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.')
                },
                mailItem: {
                    systemKey: this.$store._modules.root.state.loginStore.systemKey,
                    title: '',
                    senderMailAddress: '',
                    epid: '',
                    id: 2,
                    recipient: [],
                    content: '',
                    timezone: 'Asia/Seoul',
                    locale: 'ko_KR',
                    encoding: 'utf-8'
                },
                defaultItem: {
                    systemKey: this.$store._modules.root.state.loginStore.systemKey,
                    title: '',
                    sender: '',
                    recipient: [],
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
                config: {
                    toolbar: [
                        // { name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
                        // { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
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
                    addRemoveLinks: true,
                    uploadMultiple: true,
                    parallelUploads: 1000000, //Default : 2
                    dictDefaultMessage: this.$i18n.td('message.attach-file-drop-message', '첨부할 파일을 여기에 놓아 주세요.'),
                    // acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
                    url: contextHost + CONTEXT_ROOT + '/e/attach',
                    headers: {
                        'Cache-Control': '',
                        'X-Requested-With': ''
                    },
                    dictRemoveFile: this.$i18n.td('message.attach-file-remove', '첨부파일 삭제')
                },
                loading: false,
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
                    'options': '',
                    'personal': '',
                    'official': '',
                    'apply': '',
                    'recipient-least-one': '',
                    'attach-file-show': '',
                    'attach-file-hide': '',
                    'attach-file-no-selected': '',
                    'attach-file-selected': '',
                    'limit-subject': '',
                    'recipient': '',
                    'send-success': '',
                    'max-file': '',
                    'max-file-exceeded': '',
                    'attach-file': '',
                    'already-attached': '',
                },
                currentUserEpid: ''
            };
        },
        mounted() {
            this.messageLoad();
            this.getCurrentUser();
        },
        computed: {},
        methods: {
            onBlur(editor) {
                this.mailItem.content = editor.innerHTML;
            },
            onFocus(editor) {
                this.mailItem.content = editor.getData();
            },
            onInputContent(text) {
                this.mailItem.content = text;
            },
            searchUserByKeyText() {
                if (this.mailItem.recipient.length >= 50) {
                    this.$notify({text: this.message['limit-recipient'], type: 'warn'});
                }
                if (this.searchText.length < 2) {
                    this.$notify({text: this.message['more-character'], type: 'warn'});
                } else {
                    this.searchUser(this.searchText);
                }
            },
            searchUser(key) {
                this.searchExternalUser(key);
            },
            searchExternalUser(key) {
                axios
                .get(CONTEXT_USER + '/e', {params: {username: key}})
                .then(response => {
                    this.users = response.data;
                    if (this.users == '') {
                        this.users = [];  //확인 필요
                    }
                    if (this.users.length > 0) {
                        if (this.users.length == 1) {
                            this.addRecipient(this.users[0]);
                        } else {
                            this.isUserSearchDialog = true;
                        }
                    } else {
                        this.$notify({text: this.message['no-data'], type: 'warn'});
                    }
                }).catch(error => {

                });
            },
            getCurrentUser() {
                axios.get('/rest/v1/user/e?userId=' + this.$store._modules.root.state.loginStore.currentUser.login)
                .then(response => {
                    if (response.data.length > 0) {
                        this.currentUserEpid = response.data[0].epid;
                    }
                })
                .catch(error => {

                });
            },
            agree() {
                this.confirmDialog = false;
                this.loading = true;

                this.mailItem.senderMailAddress = this.$store.state.loginStore.currentUser.email;
                this.mailItem.epid = this.currentUserEpid;
                this.mailItem.id = this.$store.state.loginStore.currentUser.userId;
                this.mailItem.userName = this.$store.state.loginStore.currentUser.login;
                this.mailItem.fullName = this.$store.state.loginStore.currentUser.fullName;

                let files = this.$refs.myVueDropzone.getQueuedFiles();

                /*  if(this.$refs.editor.value.trim().length>0){
                    this.mailItem.content = this.$refs.editor.value;
                  }*/
                //  console.log(this.mailItem.content)
                if (this.mailItem.content.trim().length < 1) {
                    this.$notify({text: this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.$i18n.td('mail.mail-contents', '메일본문')]), type: 'warn'});
                    return false;
                }

                if (files.length > 0) { //첨부파일이 있는 경우
                    let totalFileSize = 0;
                    for (let i = 0; i < files.length; i++) {
                        totalFileSize = totalFileSize + files[i].size;
                    }
                    if (totalFileSize > this.totalFileSizeLimit) {
                        this.loading = false;
                        this.$notify({text: this.message['limit-content'], type: 'warn'});
                        return false;
                    }
                    this.$refs.myVueDropzone.processQueue();
                    //this.closeDialog ()
                } else {
                    //파일이 없을때
                    axios.post(CONTEXT_ROOT + '/e/create', this.mailItem)
                    .then(response => {
                        this.closeDialog();
                        this.$notify({title: this.message['send'], text: this.message['send-success'], type: 'success'});
                    }).catch(error => {
                        this.loading = false;

                    });
                }
            },
            disagree() {
                this.confirmDialog = false;
            },
            saveDialog() {
                // check validation
                if (this.validateData() === false) {
                    return;
                }

                if (this.mailItem.recipient.length < 1) {
                    this.$notify({text: this.message['recipient-least-one'], type: 'warn'});
                    return false;
                } else if (this.mailItem.content.length < 1) {
                    this.$notify({text: this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.$i18n.td('mail.mail-contents', '메일본문')]), type: 'warn'});
                    return false;
                } else if (this.mailItem.title.length > 100) {
                    this.$notify({text: this.message['limit-subject'], type: 'warn'});
                    return false;
                } else if (this.mailItem.content.length >= this.contentlimit) {
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
                this.confirmDialog = true;
            },
            attachComplete() {
                this.closeDialog();
                this.$notify({title: this.message['send'], text: this.message['send-success'], type: 'success'});
            },
            checkDocSecureTypeOption() {
                this.mailItem.docSecureType = this.checkDocSecureType;
                this.closeDocSecureTypeOptionDialog();
            },
            openDocSecureTypeOptionDialog() {
                this.isDocSecureTypeOptionDialog = true;
            },
            closeDialog() {
                this.clearValid();
                this.loading = false;
                this.mailItem = Object.assign({}, this.defaultItem);
                this.mailItem.recipient = [];
                this.mailIndex = -1;
                this.totalItems = 0;
                this.totalFileSize = 0;
                this.searchText = '';
                this.fileCount = 0;
                this.fileSize = 0;
                this.removeAllFiles();
                this.$emit('closeDialog');
            },
            closeUserSearchDialog() {
                this.isUserSearchDialog = false;
            },
            closeDocSecureTypeOptionDialog() {
                this.isDocSecureTypeOptionDialog = false;
            },
            addRecipient(item) {
                this.totalItems += 1;

                let recipientItem = Object.assign({}, this.recipient);
                recipientItem.seq = this.totalItems - 1;
                recipientItem.name = item.cn;
                recipientItem.login = item.userid;
                recipientItem.epid = item.epid;
                recipientItem.email = item.mail;
                recipientItem.epenorganizationname = item.epenorganizationname;

                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['epid'] == item.epid) {
                        this.$notify({text: '[' + item.cn + '(' + item.userid + ')] ' + this.message['registered-user'], type: 'warn'});
                        return false;
                    }
                }

                this.searchText = '';
                this.mailItem.recipient.push(recipientItem);
                this.closeUserSearchDialog();
            },

            updateRecipientType(item, recipientType) {
                this.modifyItem(item.epid, 'recipientType', recipientType);
            },
            updateSelectedRecipientType(recipientType, buttonType) {
                for (let i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i].isSelected) {
                        this.mailItem.recipient[i]['recipientType'] = recipientType;
                        this.mailItem.recipient[i]['toggle'] = buttonType;
                    }
                }
            },
            modifyItem(epid, key, value) {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['epid'] == epid) {
                        this.mailItem.recipient[i][key] = value;
                    }
                }
            },
            deleteRecipient() {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['isSelected'] == true) {
                        this.deleteOneRecipient(this.mailItem.recipient[i]['epid']);
                        this.totalItems--;
                        i--;
                    }
                }
                this.adjustAll();
            },
            deleteOneRecipient(epid) {
                this.removeItem(epid);
                this.adjustAll();
                this.totalItems--;
            },
            removeItem(epid) {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['epid'] == epid) {
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

                for (let i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['isSelected'] == true) {
                        if (this.getItem(this.mailItem.recipient[i]['epid'], 'seq') == 0) {
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

                for (let i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['isSelected'] == true) {
                        let seq = this.getItem(this.mailItem.recipient[i]['epid'], 'seq');
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
            getItem(epid, key) {
                for (var i = 0; i < this.mailItem.recipient.length; i++) {
                    if (this.mailItem.recipient[i]['epid'] == epid) {
                        return this.mailItem.recipient[i][key];
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
                this.totalFileSize = 0;
            },
            fileAddedEvent(file) {
                this.totalFileSize += file.size;

                console.log('실행은 되는 것 같다.');

                /* Exceed total file size limit */
                if (this.TOTAL_FILE_SIZE_LIMIT < this.totalFileSize) {
                    this.$refs.myVueDropzone.removeFile(file);
                    this.$notify({title: this.message['max-file'], text: this.message['max-file-exceeded'], type: 'warn'});
                }

                /* Duplicate with new attachment */
                let dropzoneFiles = this.$refs.myVueDropzone.dropzone.files;
                for (let i = dropzoneFiles.length - 2; i >= 0; i--) {
                    if (dropzoneFiles[i].name === file.name) {
                        console.log(dropzoneFiles);
                        this.$refs.myVueDropzone.removeFile(file);
                        this.$notify({title: this.message['attach-file'], text: `${this.message['already-attached']} ( ${file.name} )`, type: 'warn'});
                    }
                }
                this.getFileCount();
            },
            removeEvent(file, error, xhr) {
                //debugger
                this.totalFileSize -= file.size;
                this.getFileCount();
            },
            getFileCount() {
                if ('undefined' !== typeof this.$refs.myVueDropzone.dropzone) {
                    var files = this.$refs.myVueDropzone.dropzone.files;
                    this.fileCount = files.length;
                    this.fileSize = this.totalFileSize;
                } else {
                    this.fileCount = 0;
                    this.fileSize = 0;
                }
            },
            messageLoad() {
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['send'] = this.$i18n.td('button.send', '발신');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['compose'] = this.$i18n.td('mail.compose', '메일쓰기');
                this.message['bcc'] = this.$i18n.td('mail.bcc', '비밀참조');
                this.message['cc'] = this.$i18n.td('mail.cc', '참조');
                this.message['to'] = this.$i18n.td('mail.to', '수신');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['total'] = this.$i18n.td('message.total', '총');
                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['people'] = this.$i18n.td('message.people', '명');
                this.message['registered-user'] = this.$i18n.td('menu-mail.registered-user', '이미 수신인에 등록되어 있습니다.');
                this.message['no-data'] = this.$i18n.td('message.no-data', '조회된 내용이 없습니다.');
                this.message['user-can-not-search'] = this.$i18n.td('message.user-can-not-search', '존재하지 않는 사용자입니다.');
                this.message['limit-content'] = this.$i18n.td('message.limit-content', '본문은 {0}를 초과할 수 없습니다.', '1MB');
                this.message['limit-recipient'] = this.$i18n.td('menu-mail.limit-recipient', '수신자는 200명 이상 지정할 수 없습니다.');
                this.message['more-character'] = this.$i18n.td('message.more-character', '2자 이상 검색됩니다.');
                this.message['menu-mail.add-recipient'] = this.$i18n.td('menu-mail.add-recipient', '수신인추가');

                this.message['options'] = this.$i18n.td('menu-mail.options', '옵션');
                this.message['personal'] = this.$i18n.td('mail.personal', '일반');
                this.message['official'] = this.$i18n.td('mail.official', '공문');
                this.message['apply'] = this.$i18n.td('button.apply', '적용');
                this.message['recipient-least-one'] = this.$i18n.td('mail.recipient-least-one', '수신자는 적어도 1명이상이어야 합니다.');

                this.message['attach-file-show'] = this.$i18n.td('message.attach-file-show', '첨부파일 보이기');
                this.message['attach-file-hide'] = this.$i18n.td('message.attach-file-hide', '첨부파일 숨기기');

                this.message['attach-file-no-selected'] = this.$i18n.td('message.attach-file-no-selected', '선택된 파일이 없습니다.');
                this.message['attach-file-selected'] = this.$i18n.td('message.attach-file-selected', '개의 파일이 선택되었습니다.');

                this.message['limit-subject'] = this.$i18n.td('limit-subject', '제목은 30자 이상 지정할 수 없습니다.');
                this.message['recipient'] = this.$i18n.td('mail.recipient', '수신인');
                this.message['send-success'] = this.$i18n.td('mail.send-success', '메일이 발신되었습니다.');

                this.message['max-file'] = this.$i18n.td('message.max-file', '파일 용량 초과');
                this.message['max-file-exceeded'] = this.$i18n.td('message.max-file-exceeded ', '파일 용량을 초과하였습니다: ' + this.TOTAL_FILE_SIZE_LIMIT / 1024 / 1024 + 'MB',
                    [this.TOTAL_FILE_SIZE_LIMIT / 1024 / 1024]);
                this.message['already-attached'] = this.$i18n.td('validate.already-attached', '이미 첨부된 파일입니다.');
                this.message['attach-file'] = this.$i18n.td('message.attach-file', '첨부파일');
            },
            vdropzoneErrorMultiple(files, message, xhr) {
                //debugger
                // this.$notify({ title: 'http response code ' + xhr.status, text: message.errMsg, type: 'error' });
                if (xhr != undefined) {
                    this.$notify({title: 'http response code ' + xhr.status, text: message.errMsg, type: 'error'});
                } else {
                    this.$notify({title: 'file upload', text: message, type: 'error'});
                }
            },
            clearValid() {
                this.$refs['form-valid'].clear();
            },
            validateData() {
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
        }
    };
</script>
<style lang="scss">
    @import "styles/approvalModal.scss";

    #vue-editor {
        height: 500px;
        overflow: auto;
    }


</style>
