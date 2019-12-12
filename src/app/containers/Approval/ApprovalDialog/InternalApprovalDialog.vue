<template>
    <div class="approval-dialog">
        <v-dialog :value="showDialog" @input="checkCurrentMenuDirty" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <!-- Title Area -->
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{ message['create-approval'] }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text class="dialog-body approval-writing">
                    <!-- [CONTENT] 결재 제목 -->
                    <div class="aprv__content__row field-box">
                        <tb-validator class="tb-validator-in-dialog" :target="approval.title" v-model="approvalValid" :rules="[rules.required]" lazy ref="form-valid"
                                      @click.native="clearValid">
                            <v-text-field :label="message['title']" v-model.trim="approval.title" required maxlength="100"></v-text-field>
                        </tb-validator>
                    </div>
                    <!-- [CONTENT] 결재 제목 END -->
                    <!-- [CONTENT] 결재선 -->
                    <div class="aprv__content__row aprv__signer">
                        <!-- [CONTENT][SIGNER] 결재선 추가 -->
                        <div class="aprv__signer__add-row field-box">
                            <span class="aprv__signer__add-row__el-wrapper">
                                <v-text-field :label="message['add-approval-user']" :placeholder="message['username']"
                                              v-model.trim="searchUserName" @keypress.enter="findUser()" maxlength="30"></v-text-field>
                            </span>
                            <span class="aprv__signer__add-row__el-wrapper">
                                <v-btn @click.native="findUser()"><v-icon>search</v-icon>{{ message['search'] }}</v-btn>
                            </span>
                        </div>
                        <!-- [CONTENT][SIGNER] 결재선 추가 -->

                        <!-- [CONTENT][SIGNER] 결재선 콘트롤 -->
                        <div class="aprv__signer__ctrl-row">
                            <v-btn :class="{'btn btn--active': selectedBtn == 'APPROVAL'}" :disabled="approvalLineList.length < 2" value="APPROVAL"
                                   @click.stop="updateLineTypeForSelected('APPROVAL')">{{ message['approval-line-type-approval'] }}
                            </v-btn>
                            <v-btn :class="{'btn btn--active': selectedBtn == 'AGREEMENT'}" :disabled="approvalLineList.length < 2" value="AGREEMENT"
                                   @click.stop="updateLineTypeForSelected('AGREEMENT')">{{ message['approval-line-type-agreement'] }}
                            </v-btn>
                            <v-btn :class="{'btn btn--active': selectedBtn == 'NOTIFICATION'}" :disabled="approvalLineList.length < 2" value="NOTIFICATION"
                                   @click.stop="updateLineTypeForSelected('NOTIFICATION')">{{ message['approval-line-type-notification'] }}
                            </v-btn>
                            <span class="aprv__signer__divider"></span>
                            <v-btn :disabled="approvalLineList.length < 2" @click.stop="activeParallel()">{{ message['parallel'] }}</v-btn>
                            <v-btn :disabled="approvalLineList.length < 2" @click.stop="inactiveParallel()">{{ message['cancel-parallel'] }}</v-btn>
                            <span class="aprv__signer__divider"></span>
                            <v-btn :disabled="approvalLineList.length < 2" class="aprv__btn-icon" @click.stop="dropUp()">
                                <v-icon>keyboard_arrow_up</v-icon>
                            </v-btn>
                            <v-btn :disabled="approvalLineList.length < 2" class="aprv__btn-icon" @click.stop="dropDown()">
                                <v-icon>keyboard_arrow_down</v-icon>
                            </v-btn>
                            <v-btn :disabled="approvalLineList.length < 2" class="aprv__btn-icon" @click.stop="lineClear()">
                                <v-icon>remove</v-icon>
                            </v-btn>
                            <span class="aprv__signer__divider"></span>
                            <span class="aprv__singer__text"> {{message['total']}} {{ approvalLineSize -1 }} {{message['people']}} </span>
                        </div>
                        <!-- [CONTENT][SIGNER] 결재선 목록 -->
                        <div class="aprv__signer__list">
                            <ul id="lineList">
                                <li v-for="(item, index) in approvalLineList" :key="item.order"
                                    class="aprv__signer__item"
                                    :class="{'aprv__signer__item--selected':item.selected&&index!=0}"
                                    @click.exact="toggleLine(index)"
                                    @click.ctrl.exact.stop.prevent="toggleCtrlLine(index)"
                                    @click.shift.exact.stop.prevent="toggleShiftLine(index)">
                                    <span class="aprv__signer__item__seq"> {{ item.seq }} </span>
                                    <span class="aprv__signer__item__type">
                                        <!-- [SINGER] Type :: 기안자 -->
                                        <v-btn v-if="item.stepType == 'DRAFT'" class="aprv__signer__item__type-long">{{ message['approval-line-type-draft'] }}</v-btn>
                                        <!-- [SINGER] Type :: 결재/합의/통보 -->
                                        <v-btn-toggle v-if="item.stepType != 'DRAFT' && !item.parallel" v-model="item.stepType" mandatory class="aprv__signer__item__type-normal">
                                            <v-btn value="APPROVAL" v-if="item.stepType != 'DRAFT' && !item.parallel" @click.stop="updateLineType(index, 'APPROVAL')">{{ message['approval-line-type-approval'] }}</v-btn>
                                            <v-btn value="AGREEMENT" v-if="item.stepType != 'DRAFT' && !item.parallel" @click.stop="updateLineType(index, 'AGREEMENT')">{{ message['approval-line-type-agreement'] }}</v-btn>
                                            <v-btn value="NOTIFICATION" v-if="item.stepType != 'DRAFT' && !item.parallel" @click.stop="updateLineType(index, 'NOTIFICATION')">{{ message['approval-line-type-notification'] }}</v-btn>
                                        </v-btn-toggle>
                                        <!-- [SINGER] Type :: 병렬결재 -->
                                        <v-btn v-if="item.stepType == 'APPROVAL' && item.parallel" class="aprv__signer__item__type-long">{{ message['approval-parellel'] }}</v-btn>
                                        <!-- [SINGER] Type :: 병렬합의 -->
                                        <v-btn v-if="item.stepType == 'AGREEMENT' && item.parallel"
                                               class="aprv__signer__item__type-long">{{ message['agreement-parallel'] }}</v-btn>
                                    </span>
                                    <span>{{ item.name }}({{ item.login }})/{{ item.email }}</span>
                                    <v-btn v-if="index > 0" @click.exact.stop="deleteApprovalLine(index)" class="aprv__signer__item__remove">
                                        <v-icon>clear</v-icon>
                                    </v-btn>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!-- [CONTENT] 결재선 END -->
                    <!-- [CONTENT] 첨부파일 -->
                    <div class="aprv__content__row aprv__dropzone">
                        <div class="aprv__dropzone__collapse" @click="expandDropzone =! expandDropzone">
                            <span v-if="!expandDropzone">{{ message['attach-file-show'] }}</span>
                            <span v-if="expandDropzone">{{ message['attach-file-hide'] }}</span>
                            <v-icon v-if="expandDropzone">keyboard_arrow_up</v-icon>
                            <v-icon v-if="!expandDropzone">keyboard_arrow_down</v-icon>
                        </div>
                        <div class="aprv__dropzone__summary" v-if="!expandDropzone">
                            <span v-if="fileCount==0" class="aprv__dropzone__summary--empty"> {{ message['attach-file-no-selected'] }}</span>
                            <span v-if="fileCount!=0">{{fileCount}} {{ message['attach-file-selected'] }} <small>{{fileSize|byteFilter}}</small></span>
                        </div>
                        <vue-dropzone id="dropzone" ref="myVueDropzone" :options="dropOptions" v-show="expandDropzone"
                                      @vdropzone-sending="sendingEvent"
                                      @vdropzone-success-multiple="attachComplete"
                                      @vdropzone-file-added="fileAddedEvent"
                                      @vdropzone-removed-file="removeEvent"
                                      @vdropzone-error-multiple="vdropzoneErrorMultiple"
                        />
                    </div>
                    <!-- [CONTENT] 첨부파일 END -->
                    <!-- [CONTENT] Approval  -->
                    <div class="aprv__content__row aprv_editor">
                        <wysiwyg id="vue-editor" v-model="approval.content" @blur="onBlur($event)"></wysiwyg>
                    </div>
                    <!-- [CONTENT] 에디터! END -->

                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="checkCurrentMenuDirty">{{ message['close'] }}</v-btn>
                    <v-btn primary @click.native="saveDialog">{{ message['submit'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="opinionDialog" persistent max-width="450">
            <v-card>
                <v-card-title class="headline">{{ message['submit-opinion'] }}</v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" :target="approval.comment" v-model="opinionValid" :rules="[rules.required]" lazy ref="opinion-valid"
                                  @click.native="clearValid">
                        <v-text-field :label="message['submit-opinion']" v-model.trim="approval.comment" required multi-line lazy maxlength="1000"></v-text-field>
                    </tb-validator>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeOpinionDialog">{{ message['close'] }}</v-btn>
                    <v-btn primary @click.native="saveApproval">{{ message['submit'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="userSearchDialog" max-width="450px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ message['user-list'] }}</span>
                </v-card-title>
                <v-card-text>
                    <div class="aprv__content" style="overflow-y:auto; max-height:400px;">
                        <!-- [TABLE] 본체 -->
                        <div class="table__body fixed-layout">
                            <v-data-table
                                :headers="userSearchHeaders"
                                :items="userList"
                                item-key="userId"
                                :total-items="userList.length"
                                hide-actions>
                                <!-- Grid Body -->
                                <template slot="items" slot-scope="props">
                                    <tr @click="addApprovalUser(props.item)">
                                        <td class="text-xs-left"> {{ props.item.fullName }} ({{ props.item.login }})</td>
                                        <td class="text-xs-left">{{ props.item.email }}</td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <div class="aprv__action">
                        <v-btn @click.native="closeUserSearchDialog">{{ message['close'] }}</v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!-- confirm dialog for moving without save -->
        <common-confirm
            :confirm-dialog="dirtyCheckConfirmDialog.showDialog"
            :title="dirtyCheckConfirmDialog.title"
            :message="dirtyCheckConfirmDialog.message"
            @agree="executeMovingFunction"
            @disagree="closeDirtyCheckConfirmDialog"
        />

    </div>
</template>

<script>

    import axios from 'axios';
    import vueDropzone from 'vue2-dropzone';
    import CommonConfirm from '@/containers/Common/CommonConfirm';

    export default {
        components: {
            vueDropzone, CommonConfirm
        },
        props: ['showDialog'],
        data() {
            return {
                blockerFlag: {},

                expandDropzone: false,
                fileCount: false,
                fileSize: false,
                TOTAL_FILE_SIZE_LIMIT: 10 * 1024 * 1024,
                /*---------*/
                approval: {
                    title: '',
                    content: '',
                    comment: ''
                },
                totalFileSize: 0,
                submissionLine: {},
                searchUserName: '',
                lineType: '',
                approvalLineSize: 1,
                toggle: [],
                selectedRow: [],
                userSearchDialog: false,
                isUserCheck: false,
                content: '',
                searchText: '',
                totalItems: 0,
                approvalLineList: [],
                userList: [],
                userSearchHeaders: [],
                approvalValid: false,
                opinionValid: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.')
                },
                opinionDialog: false,
                selectedBtn: '',
                editorSettings: {
                    modules: {
                        imageDrop: true,
                        imageResize: {}
                    }
                },
                customToolbar: [
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['image']
                ],
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
                    maxFilesize: 10240,
                    maxFiles: 1000000,
                    autoProcessQueue: false,
                    addRemoveLinks: true,
                    uploadMultiple: true,
                    parallelUploads: 1000000, //Default : 2
                    dictDefaultMessage: this.$i18n.td('message.attach-file-drop-message', '첨부할 파일을 여기에 놓아 주세요.'),
                    // acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg,.txt",
                    url: (axios.defaults.baseURL ? axios.defaults.baseURL : '') + '/rest/v1/approval/i/attach',
                    headers: {
                        'Cache-Control': '',
                        'X-Requested-With': ''
                    },
                    dictRemoveFile: this.$i18n.td('message.attach-file-remove', '첨부파일 삭제')
                },
                dirtyCheckConfirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: this.$i18n.td('message.confirm-menu-moving', '작성중인 내용은 저장되지 않습니다. 이동하시겠습니까?'),
                    nextFunction: '',
                    nextUrl: '',
                },
                message: {
                    'create-approval': '',
                    'context': '',
                    'parallel': '',
                    'approval-parellel': '',
                    'agreement-parallel': '',
                    'cancel-parallel': '',
                    'submit-opinion': '',
                    'close': '',
                    'submit': '',
                    'search': '',
                    'approval-line-type-approval': '',
                    'approval-line-type-notification': '',
                    'approval-line-type-agreement': '',
                    'approval-line-type-draft': '',
                    'limit-filesize': '',
                    'title': '',
                    'user-can-not-search': '',
                    'total': '',
                    'people': '',
                    'full-name': '',
                    'e-mail': '',
                    'user-list': '',
                    'add-approval-user': '',
                    'user-count-meessage': '',
                    'already-added-approval-user-message': '',
                    'must-select-two-more': '',

                    'input-required-title': '',
                    'input-required-approval-contents': '',
                    'input-required-opinion': '',
                    'attach-file-show': '',
                    'attach-file-hide': '',
                    'attach-file-no-selected': '',
                    'attach-file-selected': '',
                    'max-file': '',
                    'max-file-exceeded': '',
                    'attach-file': '',
                    'already-attached': '',
                }

            };
        },
        watch: {},
        computed: {
            dirtyCheckCurrentTarget() {
                console.log('CurrentTarget 변경');
                let target = [];
                for (let i in this.authData) {
                    target.push(Object.assign({}, this.authData[i]));
                }
                target.push(Object.assign({}, this.menuData));
                return target;
            }
        },
        mounted() {
            //다국어 메세지 가져오기
            this.messageLoad();
            //그리드 헤더 정보 세팅하기
            this.getGridHeader();
            //현재 사용자 정보 가져오기
            this.getCurrentUser();
        },
        methods: {
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
            },
            getCurrentUser() {
                axios.get('/rest/v1/user/' + this.$store._modules.root.state.loginStore.currentUser.login)
                .then(response => {
                    if (response.data.login) {
                        this.addSubmissionUser(response.data);
                    }
                })
                .catch(error => {

                });
            },
            findUser: _.debounce(
                function () {
                    axios.post('/rest/v1/user/find',
                        {searchText: this.searchUserName, systemKey: this.$store._modules.root.state.loginStore.systemKey}
                    )
                    .then(response => {
                        if (response.data.length == 1) {
                            this.addApprovalUser(response.data[0]);
                        } else if (response.data.length > 1) {
                            //Dialog 호출
                            this.userSearchDialog = true;
                            this.userList = response.data;
                        } else {
                            this.$notify({text: this.message['user-can-not-search'], type: 'warn'});
                        }
                    })
                    .catch(error => {

                    });
                }, 100)
            ,
            closeDialog() {
                this.clearValid();
                this.totalFileSize = 0;
                this.approval.title = '';
                this.approval.content = '';
                this.approval.comment = '';
                this.approvalLineList = [this.submissionLine];
                this.$refs.myVueDropzone.removeAllFiles();
                this.$emit('closeDialog');

            },
            attachComplete() {
                this.closeDialog();
                this.$notify({title: this.message['submit'], text: this.message['submit-success'], type: 'success'});
            },
            saveDialog() {
                // check validation
                if (this.validateData('form-valid') === false) {
                    return;
                }

                if (this.approval.title.trim().length < 1) {
                    this.$notify({text: this.message['input-required-title'], type: 'warn'});
                    return false;
                }

                if (this.approval.content.trim().length < 1) {
                    this.$notify({text: this.message['input-required-approval-contents'], type: 'warn'});
                    return false;
                }

                let lineList = this.approvalLineList.filter((line) => { if (line.stepType == 'APPROVAL') { return line;}});

                if (lineList.length < 1) {
                    this.$notify({text: this.message['user-count-meessage'], type: 'warn'});
                    return false;
                }

                this.opinionDialog = true;
            },

            closeOpinionDialog() {
                this.opinionDialog = false;
                this.approval.comment = '';
                this.clearValid();
            },
            closeUserSearchDialog() {
                this.userSearchDialog = false;
            },
            saveApproval() {
                // check validation
                if (this.validateData('opinion-valid') === false) {
                    return;
                }

                if (this.approval.comment.trim() == '') {
                    this.$notify({text: this.message['input-required-opinion'], type: 'warn'});
                    return false;
                }
                let lineList = [];

                this.approvalLineList.forEach(line => {
                    lineList.push({
                        seq: line.seq,
                        order: line.order,
                        stepType: line.stepType,
                        parallel: line.parallel,
                        epid: line.epid,
                        userId: line.userId,
                        name: line.name,
                        login: line.login,
                        email: line.email
                    });
                });

                let approval = {
                    systemKey: this.$store._modules.root.state.loginStore.systemKey,
                    title: this.approval.title,
                    content: this.approval.content,
                    comment: this.approval.comment,
                    timezone: this.$store._modules.root.state.loginStore.currentUser.timezone,
                    lineList: this.approvalLineList,
                    callbackUrl: ''
                };

                let files = this.$refs.myVueDropzone.getQueuedFiles();

                if (files.length > 0) { //첨부파일이 있는 경우
                    this.$refs.myVueDropzone.processQueue();
                } else {
                    //파일이 없을때
                    axios.post('/rest/v1/approval/i/create', approval)
                    .then(response => {
                        this.closeOpinionDialog();
                        this.closeDialog();
                        this.$notify({title: this.message['submit'], text: this.message['submit-success'], type: 'success'});
                    }).catch(error => {

                    });
                }
            },
            addSubmissionUser(submissionUser) {

                let approvalLine = {};
                approvalLine.seq = 0;
                approvalLine.order = 0;
                approvalLine.stepType = 'DRAFT';
                approvalLine.parallel = false;
                approvalLine.epid = '-1';
                approvalLine.userId = submissionUser.userId;
                approvalLine.name = submissionUser.fullName;
                approvalLine.login = submissionUser.login;
                approvalLine.email = submissionUser.email;
                approvalLine.selected = false;

                this.searchUserName = '';
                this.submissionLine = approvalLine;
                this.approvalLineList.push(approvalLine);

            },
            addApprovalUser(approvalUser) {
                if (this.blockerFlag.searchUser) {return;}
                this.blockerFlag.searchUser = true;
                //console.log(">>> ",this.blockerFlag, new Date().getSeconds() + "." + new Date().getMilliseconds());
                setTimeout(() => {
                    //console.log("<<< ",this.blockerFlag, new Date().getSeconds() + "." + new Date().getMilliseconds());
                    this.blockerFlag.searchUser = false;
                }, 1000);

                let approvalLogin = approvalUser.login;
                let dup = false;
                for (let i = 0; i < this.approvalLineList.length; i++) {
                    if (this.approvalLineList[i].login == approvalLogin) {
                        dup = true;
                    }
                }
                if (dup == true) {
                    this.$notify({text: this.message['already-added-approval-user-message'], type: 'warn'});
                    return false;
                }

                this.userSearchDialog = false;

                let approvalLine = {};
                approvalLine.seq = 0;
                approvalLine.order = 0;

                let stepType = this.selectedBtn;
                if (stepType == '') {
                    stepType = 'APPROVAL';
                }
                approvalLine.stepType = this.selectedBtn;

                approvalLine.parallel = false;
                approvalLine.epid = '-1';
                approvalLine.userId = approvalUser.userId;
                approvalLine.name = approvalUser.fullName;
                approvalLine.login = approvalUser.login;
                approvalLine.email = approvalUser.email;
                approvalLine.selected = false;
                this.searchUserName = '';
                this.approvalLineList.push(approvalLine);
                this.approvalLineSize = this.approvalLineList.length;
                this.refreshApprovalLineList();
            },
            refreshApprovalLineList() {

                // debugger

                let newApprovalLineList = this.approvalLineList;
                for (let index = 0; index < newApprovalLineList.length - 1; index++) {
                    const line = newApprovalLineList[index];
                    if (!line.parallel) {
                        newApprovalLineList[index + 1].seq = line.seq + 1;
                    } else if (!newApprovalLineList[index + 1].parallel || newApprovalLineList[index + 1].seq != line.seq) {
                        newApprovalLineList[index + 1].seq = line.seq + 1;
                    } else {
                        newApprovalLineList[index + 1].seq = line.seq;
                    }
                    newApprovalLineList[index + 1].order = index + 1;
                }

                this.approvalLineList = newApprovalLineList;
            },
            updateLineType(index, stepType) {
                this.approvalLineList[index].stepType = stepType;
            },
            deleteApprovalLine(index) {
                this.approvalLineList.splice(index, 1)[0];
                this.refreshApprovalLineList();
            },
            toggleLine(index) {
                let newApprovalLineList = this.approvalLineList;
                for (let i = 0; i < newApprovalLineList.length; i++) {
                    if (i == index) {
                        newApprovalLineList[i].selected = !newApprovalLineList[i].selected;
                    } else {
                        newApprovalLineList[i].selected = false;
                    }
                }
                this.approvalLineList = newApprovalLineList;
            },
            toggleCtrlLine(index) {
                this.approvalLineList[index].selected = !this.approvalLineList[index].selected;
            },
            toggleShiftLine(index) {
                this.approvalLineList[index].selected = !this.approvalLineList[index].selected;
                let newApprovalLineList = this.approvalLineList;
                let startIndex = 0; //Selcet 시작지점
                let lastIndex = 0;  //Selcet 종료지점
                for (let i = 0; i < newApprovalLineList.length; i++) {
                    if (newApprovalLineList[i].selected) {
                        if (startIndex == lastIndex) {
                            startIndex = i;
                        } else {
                            lastIndex = i;
                        }
                    }
                }
                if (startIndex != lastIndex) {
                    for (let i = startIndex; i <= lastIndex; i++) {
                        newApprovalLineList[i].selected = true;
                    }
                }
                this.approvalLineList = newApprovalLineList;
            },
            updateLineTypeForSelected(stepType) {

                //togle
                if (stepType == this.selectedBtn) {
                    this.selectedBtn = '';
                } else {
                    this.selectedBtn = stepType;
                }

                let newApprovalLineList = this.approvalLineList;
                let selectedList = newApprovalLineList.filter(line => {
                    if (line.selected) {
                        return line;
                    }
                });

                //선택한 결재라인들의 라인유형 수정
                newApprovalLineList.forEach(line => {
                    for (let i = 0; i < selectedList.length; i++) {
                        if (selectedList[i].seq == line.seq) {
                            line.stepType = stepType;
                            if (stepType == 'NOTIFICATION') {
                                line.parallel = false;
                            }
                        }
                    }
                });

                this.approvalLineList = newApprovalLineList;
                this.refreshApprovalLineList();
            },
            activeParallel() {
                let newApprovalLineList = [];

                let selectedLineList = this.approvalLineList.filter((line) => { if (line.selected) { return line;}});

                //2개이상 선택
                if (selectedLineList.length < 2) {
                    this.$notify({text: this.message['must-select-two-more'], type: 'warn'});
                    return false;
                }

                for (let index = 0; index < selectedLineList.length; index++) {
                    if (selectedLineList[index].stepType == 'NOTIFICATION') {
                        this.$notify({text: this.message['must-select-not-notification'], type: 'warn'});
                        return false;
                    }

                    selectedLineList[index].seq = selectedLineList[0].seq;
                    selectedLineList[index].order = selectedLineList[0].order + index;
                    selectedLineList[index].parallel = true;
                }
                //제일낮은 번호
                let minIndex = selectedLineList[0].order;
                let beforeLineList = this.approvalLineList.filter((line) => { if (line.order < minIndex && !line.selected) { return line;}});
                let afterLineList = this.approvalLineList.filter((line) => { if (line.order > minIndex && !line.selected) { return line;}});

                beforeLineList.forEach(line => {
                    newApprovalLineList.push(line);
                });
                selectedLineList.forEach(line => {
                    newApprovalLineList.push(line);
                });
                afterLineList.forEach(line => {
                    newApprovalLineList.push(line);
                });

                this.approvalLineList = newApprovalLineList;
                this.refreshApprovalLineList();
            },
            inactiveParallel() {
                let newApprovalLineList = this.approvalLineList;
                let selectedLineList = this.approvalLineList.filter((line) => { if (line.selected) { return line;}});
                selectedLineList.forEach(selectedLine => {
                    newApprovalLineList.forEach(line => {
                        if (line.seq == selectedLine.seq) {
                            line.parallel = false;
                        }
                    });
                });
                this.approvalLineList = newApprovalLineList;
                this.refreshApprovalLineList();
            },
            dropUp() {
                let newApprovalLineList = [];

                let tempList = this.approvalLineList;
                //선택한 결재선
                let selected = tempList.filter((line) => { if (line.selected) { return line;}});

                //병렬 포함한 선택결재선
                let selectedLineList = [];
                //선택결재선을 제외한 나머지 결재선
                let otherLineList = [];

                //선택한 결재선들중 병렬인 것
                let selectedParallelList = selected.filter((line) => { if (line.parallel) { return line;}});

                //병렬로 묶여있는 결재라인도 동시에 이동
                for (let j = 0; j < tempList.length; j++) {
                    if (!tempList[j].selected && !tempList[j].parallel) {
                        otherLineList.push(tempList[j]);
                    } else if (tempList[j].selected) {
                        selectedLineList.push(tempList[j]);
                    } else {
                        const parallelLine = selectedParallelList.filter((line) => {if (line.seq == tempList[j].seq) { return line;}});
                        if (parallelLine.length > 0) {
                            selectedLineList.push(tempList[j]);
                        } else {
                            otherLineList.push(tempList[j]);
                        }
                    }
                }
                //위로 이동할 수 없는 경우
                if (selectedLineList.length < 1) {
                    return false;
                }

                if (1 == selectedLineList[0].order) {
                    return false;
                }

                //초기데이터
                for (let index = 0; index < this.approvalLineList.length; index++) {
                    newApprovalLineList.push({order: '-1'});
                }

                selectedLineList.forEach(line => {
                    newApprovalLineList[line.order - 1] = line;
                });

                let otherIndex = 0;
                for (let index = 0; index < newApprovalLineList.length; index++) {
                    if (newApprovalLineList[index].order == '-1') {
                        newApprovalLineList[index] = otherLineList[otherIndex];
                        otherIndex++;
                    }
                }

                this.approvalLineList = newApprovalLineList;
                this.refreshApprovalLineList();
            },
            dropDown() {
                let newApprovalLineList = [];
                let tempList = this.approvalLineList;
                //선택한 결재선
                let selected = tempList.filter((line) => { if (line.selected) { return line;}});

                //병렬 포함한 선택결재선
                let selectedLineList = [];
                //선택결재선을 제외한 나머지 결재선
                let otherLineList = [];

                //선택한 결재선들중 병렬인 것
                let selectedParallelList = selected.filter((line) => { if (line.parallel) { return line;}});

                //병렬로 묶여있는 결재라인도 동시에 이동
                for (let j = 0; j < tempList.length; j++) {
                    if (!tempList[j].selected && !tempList[j].parallel) {
                        otherLineList.push(tempList[j]);
                    } else if (tempList[j].selected) {
                        selectedLineList.push(tempList[j]);
                    } else {
                        const parallelLine = selectedParallelList.filter((line) => {if (line.seq == tempList[j].seq) { return line;}});
                        if (parallelLine.length > 0) {
                            selectedLineList.push(tempList[j]);
                        } else {
                            otherLineList.push(tempList[j]);
                        }
                    }
                }

                //아래로 이동할 수 없는 경우
                if (selectedLineList.length < 1) {
                    return false;
                }

                if (this.approvalLineList.length - 1 == selectedLineList[selectedLineList.length - 1].order) {
                    return false;
                }

                //초기데이터
                for (let index = 0; index < this.approvalLineList.length; index++) {
                    newApprovalLineList.push({order: '-1'});
                }

                selectedLineList.forEach(line => {
                    newApprovalLineList[line.order + 1] = line;
                });

                let otherIndex = 0;
                for (let index = 0; index < newApprovalLineList.length; index++) {
                    if (newApprovalLineList[index].order == '-1') {
                        newApprovalLineList[index] = otherLineList[otherIndex];
                        otherIndex++;
                    }
                }

                this.approvalLineList = newApprovalLineList;
                this.refreshApprovalLineList();
            },
            lineClear() {
                let selectedLineList = this.approvalLineList.filter((line) => { if (line.selected) { return line;}});
                let parallelList = this.approvalLineList.filter((line) => { if (line.parallel && !line.selected) { return line;}});

                if (parallelList.length == 1) {
                    this.approvalLineList[parallelList[0].order].parallel = false;
                } else {
                    for (let index = 0; index < parallelList.length - 1; index++) {
                        if (parallelList[index].seq != parallelList[index + 1].seq) {
                            if (index == 0) {
                                this.approvalLineList[parallelList[index].order].parallel = false;
                            } else if (parallelList[index].seq != parallelList[index - 1].seq) {
                                this.approvalLineList[parallelList[index].order].parallel = false;
                            }
                        }
                    }
                }

                for (let index = 0; index < selectedLineList.length; index++) {
                    this.approvalLineList.splice(selectedLineList[index].order, 1)[0];
                }

                this.refreshApprovalLineList();
            },
            sendingEvent: function (file, xhr, formData) {

                let lineList = [];

                this.approvalLineList.forEach(line => {
                    lineList.push({
                        seq: line.seq,
                        order: line.order,
                        stepType: line.stepType,
                        parallel: line.parallel,
                        epid: line.epid,
                        userId: line.userId,
                        name: line.name,
                        login: line.login,
                        email: line.email
                    });
                });

                let approval = {
                    systemKey: this.$store._modules.root.state.loginStore.systemKey,
                    title: this.approval.title,
                    content: this.approval.content,
                    comment: this.approval.comment,
                    timezone: this.$store._modules.root.state.loginStore.currentUser.timezone,
                    lineList: this.approvalLineList,
                    callbackUrl: ''
                };

                formData.append('file', file);
                formData.append('approval', new Blob([JSON.stringify(approval)], {type: 'application/json'}));
                this.closeOpinionDialog();
                this.closeDialog();
            },
            messageLoad() {

                this.message['create-approval'] = this.$i18n.td('approval.create-approval', '결재 작성');
                this.message['context'] = this.$i18n.td('approval.context', '결재본문');
                this.message['parallel'] = this.$i18n.td('approval.parallel', '병렬');
                this.message['approval-parellel'] = this.$i18n.td('approval.approval-parellel', '병렬결재');
                this.message['agreement-parallel'] = this.$i18n.td('approval.agreement-parallel', '병렬합의');
                this.message['cancel-parallel'] = this.$i18n.td('approval.cancel-parallel', '병렬해제');
                this.message['submit-opinion'] = this.$i18n.td('approval.submit-opinion', '상신의견');
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['submit'] = this.$i18n.td('button.submit', '상신');
                this.message['search'] = this.$i18n.td('button.search', '조회');
                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['approval-line-type-approval'] = this.$i18n.td('code.approval-line-type-approval', '결재');
                this.message['approval-line-type-notification'] = this.$i18n.td('code.approval-line-type-notification', '통보');
                this.message['approval-line-type-agreement'] = this.$i18n.td('code.approval-line-type-agreement', '합의');
                this.message['approval-line-type-draft'] = this.$i18n.td('code.approval-line-type-draft', '기안');
                this.message['limit-filesize'] = this.$i18n.td('file.limit-filesize', '파일용량은 총 {0}를 넘을 수 없습니다.', '1MB');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['user-can-not-search'] = this.$i18n.td('message.user-can-not-search', '존재하지 않는 사용자입니다.');
                this.message['total'] = this.$i18n.td('message.total', '총');
                this.message['people'] = this.$i18n.td('message.people', '명');
                this.message['full-name'] = this.$i18n.td('message.username', '성명');
                this.message['e-mail'] = this.$i18n.td('user.e-mail', '이메일');
                this.message['user-list'] = this.$i18n.td('message.user-list', '사용자 목록');
                this.message['add-approval-user'] = this.$i18n.td('menu-approval.add-approval-user', '결재자추가');
                this.message['user-count-meessage'] = this.$i18n.td('menu-approval.user-count-meessage', '결재자는 반드시 1명 이상이어야 합니다.');
                this.message['already-added-approval-user-message'] = this.$i18n.td('menu-approval.already-added-approval-user-message', '이미 결재라인에 추가되어있는 결재자입니다.');
                this.message['must-select-two-more'] = this.$i18n.td('menu-approval.must-select-two-more', '병렬결재자를 2명이상 선택해주십시오.');

                this.message['input-required-title'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['title']]);
                this.message['input-required-approval-contents'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['context']]);
                this.message['input-required-opinion'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['submit-opinion']]);

                this.message['attach-file-show'] = this.$i18n.td('message.attach-file-show', '첨부파일 보이기');
                this.message['attach-file-hide'] = this.$i18n.td('message.attach-file-hide', '첨부파일 숨기기');

                this.message['attach-file-no-selected'] = this.$i18n.td('message.attach-file-no-selected', '선택된 파일이 없습니다.');
                this.message['attach-file-selected'] = this.$i18n.td('message.attach-file-selected', '개의 파일이 선택되었습니다.');

                this.message['must-select-not-notification'] = this.$i18n.td('menu-approval.must-select-not-notification', '통보는 병렬처리할 수 없습니다.');
                this.message['submit-success'] = this.$i18n.td('menu-approval.submit-success', '상신되었습니다.');

                this.message['max-file'] = this.$i18n.td('message.max-file', '파일 용량 초과');
                this.message['max-file-exceeded'] = this.$i18n.td('message.max-file-exceeded ', '파일 용량을 초과하였습니다: ' + this.TOTAL_FILE_SIZE_LIMIT / 1024 / 1024 + 'MB',
                    [this.TOTAL_FILE_SIZE_LIMIT / 1024 / 1024]);
                this.message['already-attached'] = this.$i18n.td('validate.already-attached', '이미 첨부된 파일입니다.');
                this.message['attach-file'] = this.$i18n.td('message.attach-file', '첨부파일');

                // this.message[] = this.$i18n.td('', '');
            },
            getGridHeader() {
                let newUserSearchHeaders = [
                    {text: this.message['full-name'] + '(' + this.$i18n.td('user.id', '아이디') + ')', align: 'center', sortable: false, value: 'fullName', width: '40%'},
                    {text: this.message['e-mail'], align: 'center', sortable: false, value: 'email', width: '60%'}
                ];

                this.userSearchHeaders = newUserSearchHeaders;
            },
            fileAddedEvent(file) {
                this.getFileCount();
                this.totalFileSize += file.size;

                /* Exceed total file size limit */
                if (this.TOTAL_FILE_SIZE_LIMIT < this.totalFileSize) {
                    this.$refs.myVueDropzone.removeFile(file);
                    this.$notify({title: this.message['max-file'], text: this.message['max-file-exceeded'], type: 'warn'});
                }

                /* Duplicated file */
                let dropzoneFiles = this.$refs.myVueDropzone.dropzone.files;
                for (let i = dropzoneFiles.length - 2; i >= 0; i--) {
                    if (dropzoneFiles[i].name === file.name) {
                        console.log(dropzoneFiles);
                        this.$refs.myVueDropzone.removeFile(file);
                        this.$notify({title: this.message['attach-file'], text: `${this.message['already-attached']} ( ${file.name} )`, type: 'warn'});
                    }
                }

            },
            vdropzoneErrorMultiple(files, message, xhr) {
                // debugger
                // this.$notify({ title: 'http response code ' + xhr.status, text: message.errMsg, type: 'error' });
                if (xhr != undefined) {
                    this.$notify({title: 'http response code ' + xhr.status, text: message.errMsg, type: 'error'});
                } else {
                    this.$notify({title: 'file upload', text: message, type: 'error'});
                }
            },
            removeEvent(file, error, xhr) {
                //debugger
                this.totalFileSize -= file.size;
                this.getFileCount();
            },
            onBlur(editor) {
                this.approval.content = editor.innerHTML;
            },
            clearValid() {
                this.$refs['form-valid'].clear();
                this.$refs['opinion-valid'].clear();
            },
            validateData(target) {
                if (!this.$refs[target].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
            /* dirty check */
            openDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = true;
            },
            closeDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = false;
            },
            checkCurrentMenuDirty() {
                if (this.approval.title !== '' || this.approvalLineList.length !== 1 || this.approval.content !== '') {
                    this.openDirtyCheckConfirmDialog();
                } else {
                    this.executeMovingFunction();
                }
            },
            executeMovingFunction() {
                this.closeDirtyCheckConfirmDialog();
                this.closeDialog();
            },
        }
    };
</script>
<style lang="scss">
    @import "styles/approvalModal.scss";

    #quill-editor {
        height: 500px;
        overflow: auto;
    }
</style>
