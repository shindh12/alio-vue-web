<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="500px">
            <v-card id="license-dialog-popup">
                <v-card-title>
                    <span class="headline"> {{ td.menu.license }} </span>
                </v-card-title>

                <v-card-text class="field-box">
                    <div>
                        <table>
                            <colgroup>
                                <col width="40%" />
                                <col width="60%" />
                            </colgroup>
                            <tr>
                                <td rowspan="4"><img src="@/assets/images/lego-head.png" style="width:80%; display:block;"></img></td>
                                <td>{{ licenseInform.releaseVersion }}</td>
                            </tr>
                            <tr>
                                <td>{{ licenseInform.currentProject }}</td>
                            </tr>
                            <tr>
                                <td>{{ licenseInform.description }}</td>
                            </tr>
                            <tr>
                                <td>{{ licenseInform.information }}</td>
                            </tr>
                        </table>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ td.button.close }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    export default {
        props: {
            showDialog: {
                type: Boolean,
                default: false,
            },
            licenseInform: {
                type: Object,
                default: {}
            }
        },
        data() {
            return {

                td: {
                    menu: {
                        license: this.$i18n.td('menu.license', '라이센스'),
                    },
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
                        close: this.$i18n.td('button.close', '닫기'),
                        save: this.$i18n.td('button.save', '저장')
                    },
                },
            };
        },
        methods: {
            closeDialog() {
                this.$emit('closeDialog');
            },
        },
        computed: {
            formTitle() {
                return this.targetGroup == null ? 'Add Group' : 'Edit Group';
            },
        },
    };
</script>

<style scoped>
    #app #group-dialog-popup .useable-field {
        width: 220px;
        margin-top: 10px;
    }
</style>
