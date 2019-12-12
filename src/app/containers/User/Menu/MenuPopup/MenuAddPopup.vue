<template>
    <!-- Add, Edit Dialog Area -->
    <div>
        <v-dialog :value="addDialog" @input="closeDialog" max-width="400px">
            <v-card id="menu-add-popup">
                <v-card-title>
                    <span class="headline">{{ $td('menu-menus.add', '메뉴추가') }}</span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <v-card-text class="field-box" ref="form">
                    <tb-validator class="tb-validator-in-dialog" form v-model="isValid" ref="form-valid" @click.native="clearValid">
                        <v-text-field :label="$td('menu-menus.parent-key', '부모키')" v-model.trim="newNode.parentKey" disabled maxlength="100" />
                        <tb-validator :target="newNode.menuKey" :rules="[rules.required, rules.menuKey, rules.nospace]" lazy>
                            <v-text-field :label="$td('menu-menus.menu-key', '메뉴키')" v-model.trim="newNode.menuKey" required maxlength="100" />
                        </tb-validator>
                        <tb-validator :target="newNode.defaultName" :rules="[rules.required, rules.menuName]" lazy>
                            <v-text-field ref="defaultName" :label="$td('menu-menus.menu-name', '메뉴명')" v-model.trim="newNode.defaultName" required maxlength="100" />
                        </tb-validator>
                        <tb-validator :target="newNode.menuUrl" :rules="[rules.required]" lazy>
                            <v-text-field ref="menuUrl" label="URL" v-model.trim="newNode.menuUrl" required />
                        </tb-validator>
                    </tb-validator>
                    <hr>
                    <div class="action-row--mini" @click="clearValid">
                        <!-- <v-btn @click.native="changei18N" >{{ $td('menu-menus.set-i18n', '다국어 설정') }}</v-btn> -->
                        <v-btn @click.native="changei18N">{{ $td('menu.message-mapping', 'Message Mapping') }}</v-btn>
                    </div>
                    <div class="i18n-box">
            <span v-if="newNode.messageGroup">
                {{$td(newNode.messageGroup+'.'+newNode.messageCode, newNode.defaultName)}}
                <small>({{newNode.messageGroup+'.'+newNode.messageCode}})</small></span>
                        <span v-else class="empty-i18n">{{ $td('menu-menus.not-exist-i18n', '다국어가 없습니다.') }}</span>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', '취소') }}</v-btn>
                    <v-btn primary @click.native="saveDialog">{{ $td('button.save', '저장') }}
                    </v-btn>
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
        watch: {
            addDialog(status) {
                if (status === true) {
                    this.$refs.defaultName.reset();
                    this.$refs.menuUrl.reset();

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
            saveDialog() {
                // step 1. check validation
                if (this.validateData() === false) {
                    return;
                }

                // step 2. save menu
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
    #app #menu-add-popup .action-row--mini {
        margin-bottom: 5px;
        height: inherit;
    }

    #app #menu-add-popup .i18n-box {
        border: 1px solid #CCC;
        padding: 10px 15px;
    }

    #app #menu-add-popup .i18n-box small {
        font-size: 1em;
        opacity: 0.5;
    }

    #app #menu-add-popup .empty-i18n {
        opacity: 0.5;
    }
</style>
