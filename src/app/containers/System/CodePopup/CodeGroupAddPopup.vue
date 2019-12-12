<template>
    <!-- Add, Edit Dialog Area -->
    <div>
        <v-dialog :value="addDialog" @input="closeDialog" max-width="400px">
            <v-card id="code-add-popup">
                <v-card-title>
                    <span class="headline">메뉴생성</span>
                </v-card-title>
                <v-card-text class="field-box">
                    <v-form v-model="isValid" ref="form" lazy-validation>
                        <v-text-field label="그룹키" v-model.trim="newNode.menuKey" :rules="[rules.required, rules.menuKey, rules.nospace]" required maxlength="100"></v-text-field>
                        <v-text-field label="메뉴명" v-model.trim="newNode.defaultName" :rules="[rules.required, rules.menuName]" required maxlength="100"></v-text-field>
                    </v-form>

                    <hr>

                    <div class="action-row--mini">
                        <v-btn @click.native="changei18N">i18N설정</v-btn>
                    </div>
                    <div class="i18n-box">
            <span v-if="newNode.messageGroup">
                {{$td(newNode.messageGroup+'.'+newNode.messageCode, newNode.defaultName)}}
                <small>({{newNode.messageGroup+'.'+newNode.messageCode}})</small></span>
                        <span v-else class="empty-i18n">No i18n.</span>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">취소</v-btn>
                    <v-btn primary @click.native="saveDialog" :disabled="isDisabled">저장</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <code-message-dialog :show-dialog="msgDialog" @closeDialog="closeMsgDialog" @applyDialog="applyDialog">
        </code-message-dialog>

    </div>
</template>

<script>

    import axios from 'axios';
    import CodeMessageDialog from '@/containers/System/CodePopup/CodeMessagePopup';

    export default {
        name: 'MenuAddPopup',
        components: {
            CodeMessageDialog,
        },
        props: ['addDialog', 'menuData'],
        data() {
            return {
                msgDialog: false,
                newNode: {
                    systemKey: this.menuData.systemKey,
                    defaultName: '',
                    isLeaf: 'Y',
                    isOpened: false,
                    isRoot: false,
                    menuKey: '',
                    menuUrl: '',
                    messageCode: '',
                    messageGroup: '',
                    parentKey: '',
                    rankNo: 0,
                    useYn: 'Y',
                    children: [],
                    depth: 0
                },
                isValid: false,
                rules: {
                    required: v => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    menuKey: v => /^[a-zA-Z0-9_.]{4,100}$/.test(v) || this.$i18n.td('validate.menukey', '4~100자의 영문 대소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    menuName: v => /^[a-zA-Z가-힣Z0-9-_]{1,20}$/.test(v) || this.$i18n.td('validate.menuname', '20자 이내의 영문 대소문자, 한글, 숫자, 특수문자(_-)의 유효한 이름을 입력해 주십시오'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                }
            };
        },
        computed: {
            isDisabled() {
                if (!this.newNode.menuKey || !this.newNode.defaultName) {
                    return true;
                }
                if (this.isValid == false) {
                    return true;
                }
                return false;
            }
        },
        watch: {
            addDialog: function (statu) {
                if (statu == true) {
                    this.$refs.form.reset();
                    this.newNode.systemKey = this.menuData.systemKey;
                    this.newNode.parentKey = this.menuData.parentKey;
                    this.newNode.rankNo = this.menuData.rankNo;
                    this.newNode.menuKey = this.newNode.parentKey + '.submenu';
                    this.newNode.messageCode = '';
                    this.newNode.messageGroup = '';
                }
            }
        },
        methods: {
            closeDialog() {
                this.$emit('closeDialog');
            },
            saveDialog() {
                this.isValid = false;
                const url = '/rest/v1/menu/' + this.$store.state.loginStore.systemKey + '/menu/' + this.newNode.menuKey;
                let that = this;
                axios.get(url).then(res => {
                    console.log(res.data);
                    console.log('[' + res.data + ']');
                    if (res.data.menuKey) {
                        this.$notify({
                            title: this.$i18n.td('message.duplication', '중복'),
                            text: '[' + this.newNode.menuKey + '] Menu Key' + this.$i18n.td('message.duplicated', '중복입니다.'),
                            type: 'warn'
                        });
                        return;
                    }
                    this.$emit('saveDialog', this.newNode);
                });
            },
            changei18N() {
                this.msgDialog = true;
            },
            closeMsgDialog() {
                this.msgDialog = false;
            },
            applyDialog(param) {
                this.newNode.messageGroup = param.mGroup;
                this.newNode.messageCode = param.mCode;
                this.newNode.defaultName = this.$i18n.td(this.newNode.messageGroup + '.' + this.newNode.messageCode, '');
                this.msgDialog = false;
            },
        }
    };
</script>

<style>
    #app #code-add-popup .action-row--mini {
        margin-bottom: 5px;
        height: inherit;
    }

    #app #code-add-popup .i18n-box {
        border: 1px solid #CCC;
        padding: 10px 15px;
    }

    #app #code-add-popup .i18n-box small {
        font-size: 1em;
        opacity: 0.5;
    }

    #app #code-add-popup .empty-i18n {
        opacity: 0.5;
    }
</style>
