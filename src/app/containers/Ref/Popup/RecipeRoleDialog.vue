<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="400px">
            <v-card id="role-dialog-popup">
                <v-card-title>
                    <span class="headline"> {{$td('message.role', '역할')}} {{$td('button.'+this.mode , this.mode )}} </span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validRole" ref="form-valid" @click.native="clearValid">
                        <tb-validator :target="updatedRole.roleName" :rules="[rules.required, rules.roleName,rules.nospace]" lazy>
                            <v-text-field ref="roleName" :label="$td('message.role-name', '역할명')" v-model.trim="updatedRole.roleName"
                                          @keyup.enter="saveRole" required maxlength="50"></v-text-field>
                        </tb-validator>
                        <tb-validator :target="updatedRole.description" :rules="[rules.required, rules.max500]" lazy>
                            <v-text-field ref="description" :label="$td('message.description', '설명')" v-model.trim="updatedRole.description"
                                          @keyup.enter="saveRole" required maxlength="500"></v-text-field>
                        </tb-validator>
                    </tb-validator>
                    <v-switch :label="$td('message.use-yn', '사용여부')" v-model="updatedRole.useYn" true-value="Y" false-value="N"></v-switch>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary v-if="saveBtnAuth" @click.native="onClickSave"> {{ $td('button.save', '저장') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'RoleDialog',
        props: {
            showDialog: {
                type: Boolean,
                default: false
            },
            mode: {
                type: String,
                default: 'add'
            },
            targetRole: {
                type: Object,
                default: null
            },
        },
        computed: {
            saveBtnAuth() {
                return (this.mode === 'add' ? this.menuAuth.create : this.menuAuth.update);
            },
        },
        data() {
            return {
                validRole: false,
                updatedRole: {
                    systemKey: this.$store.state.loginStore.systemKey,
                    roleId: 0,
                    roleName: '',
                    description: '',
                    useYn: 'Y'
                },
                url: {
                    checkCreatedRole: '/rest/v1/role/{systemKey}/{roleName}',
                    add: '/rest/v1/role/create',
                    update: '/rest/v1/role/update',
                },
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    max50: v => v.length <= 50 || this.$i18n.td('message.max-input', '최대 입력 길이는 50자 입니다.', ['50']),
                    max500: v => v.length <= 500 || this.$i18n.td('message.max-input', '최대 입력 길이는 500자 입니다.', ['500']),
                    roleName: v => /^[a-zA-Z0-9_.]{4,50}$/.test(v) || this.$i18n.td('validate.role-name', '4~50자의 영문 대문자, 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                createValid: true,
                useYnItems: [
                    {text: 'Y'},
                    {text: 'N'}
                ],
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        watch: {
            showDialog(status) {
                if (status === true) {

                    this.$refs.roleName.reset();
                    this.$refs.description.reset();

                    if (this.mode === 'update') {
                        this.updatedRole.roleId = this.targetRole.roleId;
                        this.updatedRole.roleName = this.targetRole.roleName;
                        this.updatedRole.description = this.targetRole.description;
                        this.updatedRole.useYn = this.targetRole.useYn;
                    }
                    if (this.mode === 'add') {
                        this.updatedRole.roleId = '';
                        this.updatedRole.roleName = '';
                        this.updatedRole.description = '';
                        this.updatedRole.useYn = 'Y';
                    }

                }
            },
        },
        methods: {
            closeDialog() {
                this.clearValid();
                this.$emit('closeDialog');
            },
            onClickSave() {
                // step 1. check validation
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '실패'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return;
                }

                // step 2. check role name that has been created or not
                if (this.mode === 'add' || this.targetRole.roleName !== this.updatedRole.roleName) {
                    let url = this.url.checkCreatedRole;
                    url = url.replace('{systemKey}', this.updatedRole.systemKey);
                    url = url.replace('{roleName}', this.updatedRole.roleName);
                    axios.get(url)
                    .then(res => {
                        if (res.data.roleId !== undefined) {
                            this.$notify({
                                title: this.$i18n.td('button.save', '저장'),
                                text: this.$i18n.td('menu-role.duplicated-role', '이미 등록된 역할명입니다.'),
                                type: 'error'
                            });
                            return false;
                        } else {
                            // step 3. save role
                            this.saveRole();
                            return true;
                        }
                    });
                } else {
                    // step 3. save role
                    this.saveRole();
                    return true;
                }
            },
            clearValid() {
                this.$refs['form-valid'].clear();
            },
            saveRole() {
                let url;
                if (this.mode === 'add') {
                    url = this.url.add;
                } else {
                    url = this.url.update;
                }
                axios.post(url, this.updatedRole)
                .then(() => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.closeDialog();
                })
                .catch(err => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.', err),
                        type: 'error'
                    });
                });
            }
        }
    };
</script>

<style scoped>
    #app #role-dialog-popup .useable-field {
        width: 200px;
    }
</style>

