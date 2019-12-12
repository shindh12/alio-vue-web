<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="400px">
            <v-card id="group-dialog-popup">
                <v-card-title>
                    <span class="headline"> {{ td.message.group + ' ' + this.title }} </span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>

                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validGroup" ref="form-valid" @click.native="clearValid">
                        <tb-validator :target="updatedGroup.groupName" :rules="[rules.required, rules.groupName, rules.nospace]" lazy>
                            <v-text-field ref="groupName" :label="$td('code.group-name', '그룹명')" v-model.trim="updatedGroup.groupName" required maxlength="100" />
                        </tb-validator>
                        <tb-validator :target="updatedGroup.description" :rules="[rules.required]" lazy>
                            <v-text-field ref="description" :label="$td('message.description', '설명')" v-model.trim="updatedGroup.description" @keyup.enter="onClickSave" required
                                          maxlength="500" />
                        </tb-validator>
                        <v-switch class="useable-field" :label="$td('message.use-yn', '사용여부')" v-model="updatedGroup.useYn" true-value="Y" false-value="N"></v-switch>
                    </tb-validator>
                </v-card-text>

                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ td.button.cancel }}</v-btn>
                    <v-btn primary @click.native="onClickSave" v-if="this.menuAuth.update">
                        {{ td.button.save }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'GroupAddUpdateDialog',
        props: [
            'showDialog',
            'targetGroup',
            'targetSystemKey',
            'mode'
        ],
        data() {
            return {
                title: this.$i18n.td('button.add', '추가'),
                updatedGroup: {groupName: '', description: '', useYn: 'Y', groupId: 0},
                validGroup: false,
                useYnValues: [
                    {text: 'Y'},
                    {text: 'N'}
                ],
                url: {
                    add: '/rest/v1/group/create',
                    update: '/rest/v1/group/update',
                    checkCreatedGroup: '/rest/v1/group/{systemKey}/{groupName}',
                },
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    groupName: v => /^[a-zA-Z0-9_.]{4,50}$/.test(v) || this.$i18n.td('validate.group-name', '4~50자의 영문 대문자, 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                td: {
                    message: {
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        group: this.$i18n.td('message.group', '그룹'),
                        description: this.$i18n.td('message.description', '설명'),
                        unuseConfirm: this.$i18n.td('message.unuse-confirm', '선택한 항목을 미사용으로 변경하시겠습니까?'),
                        unused: this.$i18n.td('message.unused', '미사용으로 변경되었습니다.'),
                        unusedFail: this.$i18n.td('message.unused-fail', '미사용으로 변경하는데 실패했습니다.'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.')
                    },
                    code: {
                        groupName: this.$i18n.td('code.group-name', '그룹명')
                    },
                    button: {
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장')
                    },
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        computed: {
            formTitle() {
                return this.targetGroup == null ? 'Add Group' : 'Edit Group';
            },
        },
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.$refs.groupName.reset();
                    this.$refs.description.reset();
                    this.updatedGroup.systemKey = this.targetSystemKey;
                    if (this.mode === 'UPDATE') {
                        this.updatedGroup.groupId = this.targetGroup.groupId;
                        this.updatedGroup.groupName = this.targetGroup.groupName;
                        this.updatedGroup.description = this.targetGroup.description;
                        this.updatedGroup.useYn = this.targetGroup.useYn;
                        this.title = this.$i18n.td('button.update', '수정');
                    } else if (this.mode === 'ADD') {
                        this.updatedGroup.groupId = null;
                        this.updatedGroup.groupName = '';
                        this.updatedGroup.description = '';
                        this.updatedGroup.useYn = 'Y';
                        this.title = this.$i18n.td('button.add', '추가');
                    }
                }
            },
        },
        methods: {
            onClickSave() {

                // check validation
                if (this.validateData() === false) {
                    return;
                }

                // check duplication
                if (this.mode === 'ADD' || this.updatedGroup.groupName !== this.targetGroup.groupName) {
                    let url = this.url.checkCreatedGroup;
                    url = url.replace('{systemKey}', this.targetSystemKey);
                    url = url.replace('{groupName}', this.updatedGroup.groupName);
                    axios.get(url)
                    .then(res => {
                        if (res.data.groupId === undefined) {
                            this.saveGroup();
                        } else {
                            this.$notify({
                                title: this.$i18n.td('button.save', '저장'),
                                text: this.$i18n.td('menu-group.duplicated-group', '이미 등록된 그룹명입니다'),
                                type: 'error'
                            });
                            return false;
                        }
                    });
                } else {
                    this.saveGroup();
                }
            },
            saveGroup() {
                let url;
                if (this.mode === 'UPDATE') {
                    url = this.url.update;
                } else if (this.mode === 'ADD') {
                    url = this.url.add;
                }
                axios.post(url, this.updatedGroup)
                .then(res => {
                    let content = res.data.content;
                    this.selected = [];
                    this.items = content;
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saved,
                        type: 'success'
                    });
                    this.closeDialog();
                })
                .catch(() => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saveFailed,
                        type: 'error'
                    });
                });
            },
            closeDialog() {
                this.clearValid();
                this.$emit('closeDialog');
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

<style scoped>
    #app #group-dialog-popup .useable-field {
        width: 220px;
        margin-top: 10px;
    }
</style>
