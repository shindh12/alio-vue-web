<template>
    <div id="user-detail-page">
        <!--  Title Area -->
        <page-title :sub="$td('user.user-detail', '사용자 상세')"></page-title>
        <!-- Contents Area -->
        <v-form lazy-validation>
            <div class="detail-page__contents">
                <tb-validator class="tb-validator-in-table" form v-model="validUser" ref="form-valid" @click.native="clearValid">
                    <table class="detail-page__contents__table">
                        <tr>
                            <th> {{$td('user.id', '아이디')}}</th>
                            <td> {{ userDetail.login }}</td>
                            <th> {{$td('message.status', '상태')}}</th>
                            <td>
                                <div v-show="mode === 'READ'"> {{userStatus.text}}
                                    <v-btn v-if="userDetail.statusId==1 && menuAuth.update" @click.native="changeStatus(2)">{{$td('message.inactive', '비활성')}}</v-btn>
                                    <v-btn v-if="userDetail.statusId!=1 && menuAuth.update" @click.native="changeStatus(1)">{{$td('message.active', '활성')}}</v-btn>
                                </div>
                                <div v-show="mode === 'UPDATE'">
                                    <v-select :items="statusValues" v-model="userStatus" item-text="text" item-value="code" return-object class="status-field"></v-select>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th :class="{'required':mode==='UPDATE'}">{{$td('message.username', '성명')}}</th>
                            <td>
                                <div v-show="mode === 'READ'">{{userDetail.fullName}}</div>
                                <tb-validator :target="userDetail.fullName" :rules="[rules.required, rules.fullName, rules.nospace]" lazy>
                                    <v-text-field v-show="mode === 'UPDATE'" v-model.trim="userDetail.fullName" maxlength="20" />
                                </tb-validator>
                            </td>
                            <th :class="{'required':mode==='UPDATE'}">E-Mail</th>
                            <td>
                                <div v-show="mode === 'READ'">{{userDetail.email}}</div>
                                <tb-validator :target="userDetail.email" :rules="[rules.required, rules.email]" lazy>
                                    <v-text-field v-show="mode === 'UPDATE'" v-model.trim="userDetail.email" maxlength="100" />
                                </tb-validator>
                            </td>
                        </tr>
                        <tr>
                            <th>{{$td('system.gmt', '시간(GMT) 설정')}}</th>
                            <td>
                                <div v-show="mode === 'READ'"> {{userDetail.timezone}}</div>
                                <div v-show="mode === 'UPDATE'">
                                    <v-select :items="timeValues" v-model="userDetail.timezone" item-text="text" item-value="value" class="timezone-field"></v-select>
                                </div>
                            </td>
                            <th>{{$td('datetime.join', '가입일')}}</th>
                            <td>{{userDetail.createDate | moment(datePattern())}}</td>
                        </tr>
                        <tr>
                            <th>{{$td('message.language', '언어')}}</th>
                            <td>
                                <div v-show="mode === 'READ'"> {{ $td('language.'+userDetail.locale, '한국어') }}</div>
                                <div v-show="mode === 'UPDATE'">
                                    <v-select :items="langValues" v-model="userDetail.locale" item-text="label" item-value="lang" class="language-field"></v-select>
                                </div>
                            </td>
                        </tr>
                    </table>
                </tb-validator>
            </div>
        </v-form>

        <!-- Button Area-->
        <div class="action-row--mini ">
            <div class="left">
                <v-btn v-show="mode === 'READ'" @click.native="backToList">{{$td('button.to-list', '목록')}}</v-btn>
                <v-btn v-show="mode === 'READ'" @click.native="modifyAuthCode" v-if="menuAuth.update">{{$td('system.authCode', '비밀번호')}} {{$td('button.modify', '변경')}}</v-btn>
            </div>
            <div class="right">
                <v-btn v-show="mode === 'READ'" @click.native="openConfirmDialog" v-if="menuAuth.delete">{{$td('button.delete', '삭제')}}</v-btn>
                <v-btn primary v-show="mode === 'READ'" @click.native="changeMode('UPDATE')" v-if="menuAuth.update">{{$td('button.update', '수정')}}</v-btn>
                <v-btn v-show="mode === 'UPDATE'" @click.native="cancel">{{$td('button.cancel', '취소')}}</v-btn>
                <v-btn primary v-show="mode === 'UPDATE'" @click.native="updateUser" v-if="menuAuth.update">{{$td('button.save', '저장')}}</v-btn>
            </div>
        </div>

        <common-confirm
            :confirm-dialog="confirmDialog"
            :title="'Confirm'"
            :message="$td('message.delete-confirm', '삭제하시겠습니까?')"
            @agree="agree"
            @disagree="disagree">
        </common-confirm>

        <user-auth-code-popup :userAuthCodeDialog="dialog" :userId="userDetail.userId" :isAdmin="isAdmin" @closeAuthCodeDialog="closeAuthCodeDialog" />

    </div>
</template>

<script>
    import axios from 'axios';
    import UserAuthCodePopup from '@/containers/User/UserListPopup/UserAuthCodePopup';
    import CommonConfirm from '../Common/CommonConfirm';

    export default {
        components: {
            UserAuthCodePopup,
            CommonConfirm
        },
        data() {
            return {
                validUser: false,
                dialog: false,
                confirmDialog: false,
                isAdmin: true,
                contentTitle: {
                    name: 'User List Detail',
                    path: '사용자/메뉴',
                    menu: '사용자'
                },
                mode: 'READ',
                originUser: {},
                userDetail: {
                    userId: 0, statusId: 0, login: '',
                    email: '', fullName: '', createDate: 0.1, locale: ''
                },
                userStatus: {text: '', code: 0},
                statusValues: [
                    {text: this.$i18n.td('message.active', '활성'), value: 1},
                    {text: this.$i18n.td('message.inactive', '비활성'), value: 2},
                    {text: this.$i18n.td('message.lock', '잠김'), value: 3},
                ],
                timeValues: [
                    {text: 'Asia/Seoul', value: 'Asia/Seoul'},
                    {text: 'America/Los_Angeles', value: 'America/Los_Angeles'},
                ],
                langValues: [],
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    login: v => /^[a-z0-9_.]{5,12}$/.test(v) || this.$i18n.td('validate.login', '5~12자의 영문 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    password: v => /^[a-zA-Z0-9!@$%^&*?_~]{8,16}$/.test(v) || this.$i18n.td('validate.passwd', '8~16자의 영문 대소문자, 숫자, 특수문자(!@$%^&*?_~)를 사용하십시오.'),
                    confirmPw: v => v === this.regInfo.authCode || this.$i18n.td('validate.repeat', '패스워드가 일치하지 않습니다.'),
                    email: v => /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/.test(v) || this.$i18n.td('validate.e-mail',
                        '유효한 email 주소를 입력해 주십시오.'),
                    fullName: v => /^[a-zA-Z가-힣 ]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        created() {
            this.userDetail = this.$route.query;
            this.search();
            this.searchLanguageList();
        },
        methods: {
            search() {
                const url = '/rest/v1/user/' + this.userDetail.login;
                var that = this;
                axios.get(url).then(res => {
                    that.userDetail = res.data;
                    if (that.userDetail.statusId) {
                        that.userStatus = that.statusValues[that.userDetail.statusId - 1];
                    } else {
                        that.userStatus = that.statusValues[1];
                    }
                    that.userDetail;
                    that.originUser = Object.assign({}, that.userDetail);
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            searchLanguageList() {
                const url = '/rest/v1/message/lang';
                var that = this;
                axios.get(url).then(res => {
                    that.langValues = res.data;
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            changeMode(mode) {
                this.mode = mode;
            },
            cancel() {
                this.search();
                this.clearValid();
                this.changeMode('READ');
            },
            backToList() {
                this.$router.push({
                    path: '/user/userList',
                    query: this.$route.query
                });
            },
            disagree() {
                this.confirmDialog = false;
            },
            agree() {
                this.confirmDialog = false;
                var userList = [this.userDetail.userId];
                const url = '/rest/v1/user/delete';
                var that = this;
                axios.post(url, userList).then(res => {
                    this.$notify({title: this.$i18n.td('button.delete', '삭제'), text: this.$i18n.td('message.deleted', '삭제되었습니다.'), type: 'success'});
                    that.backToList();
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            openConfirmDialog() {
                this.confirmDialog = true;
            },
            changeStatus(statusId) {
                let url = 'rest/v1/user/status';
                var changeUserStatus = {
                    userId: this.userDetail.userId,
                    statusId: statusId
                };
                var that = this;
                axios.post(url, changeUserStatus)
                .then(() => {
                    this.$notify({
                        title: this.$i18n.td('message.status', '상태') + this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.update-status', '상태변경되었습니다.'),
                        type: 'success'
                    });
                    that.search();
                })
                .catch(error => {
                    this.$notify({
                        title: this.$i18n.td('message.status', '상태') + this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.update-status-failed', '상태 변경에 실패했습니다.'),
                        type: 'error'
                    });
                });
            },
            modifyAuthCode() {
                this.dialog = true;
            },
            closeAuthCodeDialog() {
                this.dialog = false;
            },
            updateUser() {
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return;
                }

                if (this.originUser.email != this.userDetail.email) {
                    const url = '/rest/v1/user/find/duplication';
                    axios.post(url, {login: '$%!@#', email: this.userDetail.email}).then(res => {
                        if (res.data) {
                            this.$notify({title: this.$i18n.td('message.duplication', '중복'), text: res.data + ' ' + this.$i18n.td('message.duplicated', '중복입니다.'), type: 'warn'});
                            return;
                        }
                        this.saveUser();
                    }).catch(e => {
                        this.errors.push(e);
                    });
                } else {
                    this.saveUser();
                }
            },
            clearValid() {
                this.$refs['form-valid'].clear();
            },
            saveUser() {
                let url = 'rest/v1/user/update';
                this.userDetail.statusId = this.userStatus.value;
                axios.post(url, this.userDetail)
                .then(() => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    this.mode = 'READ';
                })
                .catch(error => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'), type: 'error'});
                });
            }
        }
    };
</script>

<style scoped>
    .action-row--mini {
        margin-top: 20px;
    }

    #app #user-detail-page .status-field,
    #app #user-detail-page .timezone-field,
    #app #user-detail-page .language-field {
        width: 120px;
    }
</style>
