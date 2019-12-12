<template>
    <div>
        <v-form ref=form v-model="createValid" lazy-validation>
            <v-dialog :value="showDialog" @input="closeDialog" max-width="500px">
                <v-card>
                    <v-card-title>
                        <span class="headline"> {{title}}</span>
                        <div class="modal-close" @click="closeDialog">
                            <v-icon>close</v-icon>
                        </div>
                    </v-card-title>
                    <v-card-text class="field-box">
                        <tb-validator class="tb-validator-in-dialog" form v-model="createValid" ref="form-valid" @click.native="clearValid">
                            <tb-validator :target="updatedConfiguration.configurationKey" :rules="[rules.required, rules.nospace, rules.configName]" lazy>
                                <v-text-field :label="$td('menu-configuration.key', '키')" @keyup.esc="closeDialog"
                                              @input="adjustKey" v-model.trim="updatedConfiguration.configurationKey" ref="key"
                                              required maxlength="200" />
                            </tb-validator>
                            <tb-validator :target="updatedConfiguration.configurationValue" :rules="[rules.required]" lazy>
                                <v-text-field multi-line :label="$td('menu-configuration.value', '값')" @keyup.esc="closeDialog"
                                              v-model.trim="updatedConfiguration.configurationValue" ref="value"
                                              required maxlength="2000" />
                            </tb-validator>
                            <tb-validator :target="updatedConfiguration.description" :rules="[rules.required]" lazy>
                                <v-text-field multi-line :label="$td('message.description', '설명')" @keyup.esc="closeDialog"
                                              v-model.trim="updatedConfiguration.description" ref="description"
                                              required maxlength="500" />
                            </tb-validator>
                        </tb-validator>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                        <v-btn primary v-if="saveBtnAuth" @click.native="saveConfiguration(mode)">{{ $td('button.save', '저장') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-form>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'ConfigurationDialog',
        props: [
            'showDialog',
            'targetConfiguration',
            'targetSystemKey',
            'mode'
        ],
        computed: {
            saveBtnAuth() {
                return (this.mode === 'ADD' ? this.menuAuth.create : this.menuAuth.update);
            },
            title() {
                return this.mode == 'ADD' ? this.$i18n.td('menu.configuration-create', '환경변수 생성') : this.$i18n.td('menu.configuration-update', '환경변수 수정');
            },
        },
        watch: {
            showDialog(status) {

                if (status === true) {
                    this.$refs.key.reset();
                    this.$refs.value.reset();
                    this.$refs.description.reset();
                    this.updatedConfiguration = this.targetConfiguration;
                    this.updatedConfiguration.systemKey = this.targetSystemKey;
                } else {
                    this.updatedConfiguration.configurationKey = '';
                    this.updatedConfiguration.systemKey = '';
                    this.updatedConfiguration.configurationValue = '';
                    this.updatedConfiguration.description = '';
                }
            }
        },
        data() {
            return {
                updatedConfiguration: {configurationKey: '', systemKey: '', configurationValue: '', description: ''},
                url: {
                    add: '/rest/v1/configuration/add',
                    update: '/rest/v1/configuration/update',
                    duplicate: 'rest/v1/configuration/duplicate'
                },
                createValid: false,
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                    configName: v => /^[a-zA-Z0-9_]{1,200}$/.test(v) || this.$i18n.td('validate.config-name', '200자 이하의 영문 대문자, 소문자, 숫자, 특수문자(_)를 사용하십시오.'),

                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        methods: {
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
            clearValid() {
                this.$refs['form-valid'].clear();
            },
            async saveConfiguration(mode) {
                //Validation 체크
                if (await this.validateData() === false) {
                    return;
                }

                let url;
                if (mode === 'UPDATE') {
                    url = this.url.update;
                } else if (mode === 'ADD') {
                    url = this.url.add;
                }

                axios.post(this.url.duplicate, this.updatedConfiguration).then(
                    res => {
                        if (res.data > 0) {
                            this.$notify({
                                title: this.$i18n.td('button.save', '저장'),
                                text: this.$i18n.td('menu-configuration.duplicated-configuration', '이미 등록된 환경변수가 있습니다.'),
                                type: 'warn'
                            });
                        } else {
                            axios.post(url, this.updatedConfiguration)
                            .then(res => {
                                let content = res.data.content;
                                this.selected = [];
                                this.items = content;
                                this.loading = false;

                                if (mode === 'UPDATE') {
                                    this.$notify({
                                        title: this.$i18n.td('button.add', '수정'),
                                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                                        type: 'success'
                                    });
                                } else if (mode === 'ADD') {
                                    this.$notify({
                                        title: this.$i18n.td('button.add', '생성'),
                                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                                        type: 'success'
                                    });
                                }
                                this.closeDialog();
                            })
                            .catch(response => {
                                this.$notify({
                                    title: this.$i18n.td('button.save', '저장'),
                                    text: this.$i18n.td('message.save-failed', '저장에 실패했습니다 ') + +response,
                                    type: 'error'
                                });
                            });
                        }
                    }).catch(error => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.save-failed', '저장에 실패했습니다 ') + +response,
                        type: 'error'
                    });
                });

            },
            closeDialog() {
                this.clearValid();
                this.$emit('closeDialog');
            },
            adjustKey() {
                if (this.updatedConfiguration.configurationKey !== '' && this.updatedConfiguration.configurationKey !== null) {
                    this.updatedConfiguration.configurationKey = this.updatedConfiguration.configurationKey.trim().toUpperCase();
                }
            }

        }
    };
</script>

<style scoped>
</style>
