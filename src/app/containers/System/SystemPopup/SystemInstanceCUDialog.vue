<template>
    <div>
        <v-dialog :value="showDialog" @input="closeInstanceDialog" max-width="450px">
            <v-card id="system-instance-cu-dialog">
                <v-card-title>
                    <span class="headline">{{ title }}</span>
                </v-card-title>
                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validSystemInstance" ref="form-valid" @click.native="clearValid('form-valid')">
                        <v-text-field ref="systemKey" :label="$td('system.key', '시스템키')" v-model.trim="targetSystemInstance.systemKey" required maxlength="12" :disabled="true" />
                        <tb-validator :target="targetSystemInstance.systemIp" :rules="[rules.ipRule]" lazy>
                            <v-text-field ref="systemIp" :label="$td('system.ip', '시스템 IP')" v-model.trim="targetSystemInstance.systemIp" required maxlength="30"></v-text-field>
                        </tb-validator>
                        <v-text-field ref="description" :label="$td('message.description', '설명')" v-model.trim="targetSystemInstance.description" maxlength="500"
                                      class="system-desc"></v-text-field>
                        <v-switch :label="$td('message.use-yn', '사용여부')" v-model="targetSystemInstance.useYn" true-value="Y" false-value="N"></v-switch>
                    </tb-validator>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeInstanceDialog">{{$td('button.cancel', '취소')}}</v-btn>
                    <v-btn primary @click.native="saveInstanceDialog">{{$td('button.save', '저장')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        props: {
            showDialog: {
                type: Boolean,
                default: false,
            },
            mode: {
                type: String,
                required: true,
            },
            propsSystemInstance: {
                type: Object,
                default: {},
            },
        },
        data() {
            return {
                /* target of save */
                targetSystemInstance: {
                    systemKey: '',
                    systemIp: '',
                    description: '',
                    useYn: '',
                },

                /* axios */
                url: {
                    create: '/rest/v1/system/detail/create',
                    update: '/rest/v1/system/detail/update',
                },

                /* validator */
                validSystemInstance: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    systemKey: (v) => /^[a-zA-Z0-9-_]{4,12}$/.test(v) || this.$i18n.td('validate.systemkey', '4~12자의 영문 대소문자, 숫자, 특수문자(-_)를 사용하십시오.'),
                    systemName: v => /^[a-zA-Z가-힣0-9 -_]{1,20}$/.test(v) || this.$i18n.td('validate.fullname', '20자 이내의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                    ipRule: (v) => /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d|\*)(\.|$)){4}$/.test(v) || this.$i18n.td('validate.ip', '유효한 IP를 입력해 주십시오.'),
                },
            };
        },
        computed: {
            title() {
                let prefix = this.$i18n.td('menu-system-user.system-instance', '시스템 인스턴스');
                let postfix = this.mode == 'ADD' ? this.$i18n.td('button.add', '추가') : this.$i18n.td('button.update', '수정');
                return prefix + ' ' + postfix;
            },
        },
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.$refs.systemKey.reset();
                    this.$refs.systemIp.reset();
                    this.$refs.description.reset();
                    Object.assign(this.targetSystemInstance, this.propsSystemInstance);
                }
            },
        },
        methods: {
            clearValid(refs) {
                this.$refs[refs].clear();
            },
            closeInstanceDialog() {
                this.clearValid('form-valid');
                this.$emit('closeInstanceDialog');
            },
            saveInstanceDialog() {
                // step 1. check validation
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.$i18n.td('message.warn', '안내'),
                        text: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        type: 'warn'
                    });
                    return;
                }

                // step 2. save system
                let url = this.mode === 'ADD' ? this.url.create : this.url.update;
                let saveList = [];
                saveList.push(this.targetSystemInstance);

                axios.post(url, saveList)
                .then(res => {
                    this.$emit('saveInstanceDialog');
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                }).catch(e => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        type: 'warn'
                    });
                });
            },
        }
    };
</script>

<style>
    #app #system-instance-cu-dialog .system-desc {
        margin-top: 10px;
    }
</style>
