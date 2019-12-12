<template>
    <div class="isdp-body-content" id="approval-detail-dialog">
        <v-dialog :value="showDialog" @input="closeDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card class="approval-writing" id="approval-detail-dialog">
                <!-- Title Area-->
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">약관 상세조회</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text class="dialog-body aprv__content">
                    <!-- [CONTENT]약관 상세 정보들 -->
                    <div class="aprv__content__row detail-page__contents">
                        <table class="detail-page__contents__table">
                            <colgroup>
                                <col width="160px" />
                                <col width="250px" />
                                <col width="150px" />
                                <col width="160px" />
                                <col width="100px" />
                                <col width="calc(50% - 160px)" />
                            </colgroup>
                            <tr>
                                <th>{{message['title']}}</th>
                                <td>{{agreement.agreementTitle}}</td>
                            </tr>
                            <tr>
                                <th>그룹</th>
                                <td>{{getCodeValue('GROUP-CODE', agreement.groupCode)}}</td>
                                <th>약관 분류</th>
                                <td>{{agreement.agreementCategoryName}}</td>
                                <th>약관 버전</th>
                                <td>{{agreement.agreementVersion}}</td>
                            </tr>
                            <tr>
                                <th>작성자</th>
                                <td>{{agreement.fullName+'('+agreement.login+')'}}</td>
                                <th>작성일시</th>
                                <td>{{agreement.createDate| moment(dateTimePattern())}}</td>
                            </tr>
                            <tr>
                                <th>필수여부</th>
                                <td>{{ agreement.mandatoryYn =='Y' ? $td('message.mandatory', '필수') : $td('message.optional', '선택')}}</td>
                                <th>사용여부</th>
                                <td>{{ agreement.useYn =='Y' ? $td('message.use-y', '사용') : $td('message.use-n', '미사용')}}</td>
                            </tr>
                        </table>
                    </div>
                    <!-- [CONTENT]약관 상세 정보들 END -->
                    <!-- [CONTENT] 약관 본문 -->
                    <div class="aprv__content__row aprv__content__html" style="">
                        <p v-html="agreement.agreementContents"></p>
                    </div>
                    <!-- [CONTENT] 도움말 본문 END -->
                </v-card-text>

                <v-card-actions>
                    <div class="action-row--mini ">
                        <div class="left">
                            <v-btn @click.native="closeDialog">{{$td('button.to-list', '목록')}}
                            </v-btn>
                        </div>
                        <div class="right">
                            <!--                            <v-btn @click.native="openConfirmDialog" v-if="menuAuth.delete">{{$td('button.delete','삭제')}}-->
                            <!--                            </v-btn>-->
                            <v-btn primary @click.native="openUpdateDialog(agreement)" v-if="menuAuth.update">
                                {{$td('button.update', '수정')}}
                            </v-btn>
                        </div>
                    </div>
                </v-card-actions>

                <!--                <common-confirm-->
                <!--                    :confirm-dialog="confirmDialog"-->
                <!--                    :title="'Confirm'"-->
                <!--                    :message="$td('message.delete-confirm', '삭제하시겠습니까?')"-->
                <!--                    @agree="agree"-->
                <!--                    @disagree="disagree">-->
                <!--                </common-confirm>-->
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import CommonConfirm from '@/containers/Common/CommonConfirm';
    import DialogUtil from '@/util/dialog';

    export default {
        components: {CommonConfirm},
        props: {
            showDialog: {
                type: Boolean,
                default: false,
            },
            agreement: {
                type: Object,
                default: {},
            },
        },
        data() {
            return {
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },

                createDialog: false,
                confirmDialog: false,
                contextHost: '',
                opinionDialog: false,
                confirmApprovalDialog: false,
                confirmAgreementDialog: false,
                confirmDisapprovalDialog: false,
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
                    'submission-datetime': '',
                    'cancel': '',
                    'opinion': '',
                    'close': '',
                    'parallel': '',
                    'disproved': '',
                    'approved': '',
                    'input-required-opinion': ''
                }
            };
        },
        mounted() {
            DialogUtil.addWheelEventListener();
            this.messageLoad();

            this.contextHost = this.$http.defaults.baseURL;
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
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            // disagree() {
            //     this.confirmDialog = false;
            // },
            // agree() {
            //     this.confirmDialog = false;
            //     const url = '/rest/v1/std/agreement/delete/' + this.help.helpId;
            //     this.$http.post(url).then(res => {
            //         this.closeDialog();
            //         this.$notify({
            //             title: this.$i18n.td('button.delete', '삭제'),
            //             text: this.$i18n.td('message.deleted', '삭제되었습니다.'),
            //             type: 'success'
            //         });
            //     }).catch(e => {
            //         this.errors.push(e);
            //     });
            // },
            openUpdateDialog(agreement) {
                this.createDialog = true;
                this.$emit('closeDialog');
                this.$emit('updateAgreement', agreement);
            },
            closeCreateDialog() {
                this.createDialog = false;
                this.searchAgreement();
            },
            closeDialog() {
                this.$emit('closeDialog');
            },
            messageLoad() {
                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['title'] = this.$i18n.td('message.title', '제목');
                this.message['attach-file'] = this.$i18n.td('message.attach-file', '첨부파일');
                this.message['cancel'] = this.$i18n.td('button.cancel', '취소');
                this.message['close'] = this.$i18n.td('button.close', '닫기');
                this.message['input-required-opinion'] = this.$i18n.td('message.input-required', '{0} 입력해 주세요.', [this.message['opinion']]);

            },
            getGridHeader() {
                let newGridHeader = [
                    {text: this.message['no'], align: 'center', sortable: false, width: '50px'},
                    {text: this.message['division'], align: 'center', sortable: false, width: '120px'},
                    {
                        text: this.message['username'] + '(ID)',
                        align: 'center',
                        sortable: false,
                        width: 'calc(50%-85px)'
                    },
                    {text: this.message['processing-date'], align: 'center', sortable: false, width: '120px'}
                ];

            }
        }
    };

</script>
<style scoped>
    #app .dialog__content .dialog .card .card__text {
        font-size: 14px;
    }
</style>