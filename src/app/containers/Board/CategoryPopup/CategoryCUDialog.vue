<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="500px">
            <v-card id="category-dialog-popup">
                <v-card-title>
                    <span class="headline"> {{ title }} </span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>

                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validCategory" ref="form-valid" @click.native="clearValid">
                        <tb-validator :target="targetCategory.categoryKey" :rules="[rules.required, rules.categoryKey, rules.nospace]" lazy>
                            <v-text-field ref="categoryKey" :label="td.menuBoard.category + ' ' + td.message.key" :disabled="isUpdateMode" v-model.trim="targetCategory.categoryKey"
                                          required maxlength="100" />
                        </tb-validator>
                        <tb-validator :target="targetCategory.categoryName" :rules="[rules.required]" lazy>
                            <v-text-field ref="categoryName" :label="td.menuBoard.category + ' ' + td.message.name" v-model.trim="targetCategory.categoryName"
                                          @keyup.enter="onClickSave" required maxlength="100" />
                        </tb-validator>
                    </tb-validator>
                    <div class="action-row--mini margin-top-10px">
                        <div class="label">i18N</div>
                        <div class="content">
                            <span v-if="targetCategory.messageGroup" class="read-field">{{targetCategory.messageGroup+'.'+targetCategory.messageCode}}</span>
                            <span v-else class="empty-i18n">{{ $td('menu-menus.not-exist-i18n', '다국어가 없습니다.') }}</span>
                            <v-btn style="margin-left: 8px;margin-right: 8px;" @click.native="openMsgDialog">{{ $td('menu.message-mapping', 'Message Mapping') }}</v-btn>
                        </div>
                    </div>
                    <v-switch class="useable-field" :label=" $td(this.td.message.category, '카테고리')+ ' '+ $td('message.use-yn', '사용여부')" v-model="targetCategory.useYn"
                              true-value="Y" false-value="N" />
                </v-card-text>

                <v-card-actions v-if="this.menuAuth.update">
                    <v-btn @click.native="closeDialog">{{ td.button.cancel }}</v-btn>
                    <v-btn :disabled="false" v-show="this.mode==='ADD'" primary @click.native="isDuplicatedCategoryKey(targetCategory.categoryKey, saveCategory)"> {{ td.button.save
                        }}
                    </v-btn>
                    <v-btn :disabled="false" v-show="this.mode==='UPDATE'" primary @click.native="saveCategory"> {{ td.button.save }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <code-message-dialog :show-dialog="msgDialog" @closeDialog="closeMsgDialog" @applyDialog="applyMsg">
        </code-message-dialog>

    </div>
</template>

<script>
    import axios from 'axios';
    import CodeMessageDialog from '@/containers/System/CodePopup/CodeMessagePopup';
    import CodeService from '@/util/code/CodeService';

    export default {
        name: 'CategoryCUDialog',
        components: {
            CodeMessageDialog,
        },
        props: {
            showDialog: {
                type: Boolean,
                default: false,
            },
            mode: {
                type: String,
                default: 'ADD',
            },
            propsCategory: {
                type: Object,
                default: {},
            }
        },
        data() {
            return {
                msgDialog: false,
                validCategory: false,
                targetCategory: {
                    systemKey: '',
                    categoryKey: '',
                    categoryName: '',
                    useYn: '',
                    i18n: '',
                },
                url: {
                    create: '/rest/v1/category/create',
                    update: '/rest/v1/category/update',
                    duplicate: 'rest/v1/category/duplicate'
                },
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    categoryKey: (v) => /^[a-zA-Z0-9_.]{4,50}$/.test(v) || this.$i18n.td('validate.group-name', '4~50자의 영문 대문자, 소문자, 숫자, 특수문자(_.)를 사용하십시오.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                td: {
                    button: {
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장'),
                        add: this.$i18n.td('button.add', '추가'),
                        update: this.$i18n.td('button.update', '수정'),
                    },
                    message: {
                        key: this.$i18n.td('message.key', '키'),
                        name: this.$i18n.td('message.name', '명'),
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        description: this.$i18n.td('message.description', '설명'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.')
                    },
                    menuBoard: {
                        category: this.$i18n.td('menu-board.category', '카테고리'),
                    },
                    validate: {
                        warn: this.$i18n.td('validate.warn', '실패'),
                        notValidated: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                        canNotChangeUseYn: this.$i18n.td('validate.can-not-change-use-yn', '카테고리를 사용중인 게시판이 있어 변경할 수 없습니다.'),
                    },
                },

                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                },
            };
        },
        computed: {
            title() {
                let prefix = this.td.menuBoard.category;
                let postfix = this.mode == 'ADD' ? this.td.button.add : this.td.button.update;
                return prefix + ' ' + postfix;
            },
            isUpdateMode() {
                return this.mode === 'UPDATE' ? true : false;
            }
        },
        watch: {
            showDialog(value) {
                if (value === true) {
                    if (this.mode === 'ADD') {
                        this.initializeCategory();
                    } else { // mode === 'UPDATE'
                        Object.assign(this.targetCategory, this.propsCategory);
                    }
                } else { /* Nothing to do */ }
            },
            'targetCategory.useYn'(value) {
                if (value === 'N' && this.targetCategory.categoryUseCnt > 0) {
                    this.targetCategory.useYn = 'Y';
                    this.$notify({
                        title: this.td.validate.warn,
                        text: this.td.validate.canNotChangeUseYn,
                        type: 'warn'
                    });
                }
            },
        },
        methods: {
            initializeCategory() {
                this.targetCategory = {
                    systemKey: this.$store.state.loginStore.systemKey,
                    categoryKey: '',
                    categoryName: '',
                    useYn: 'Y',
                    i18n: '',
                };
                this.$refs.categoryKey.reset();
                this.$refs.categoryName.reset();
            },
            clearValid() {
                this.$refs['form-valid'].clear();
            },
            validateData() {
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.td.validate.warn,
                        text: this.td.validate.notValidated,
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
            isDuplicatedCategoryKey(categoryKey, callback) {
                let url = this.url.duplicate;
                let systemKey = this.$store.state.loginStore.systemKey;

                axios.get(url, {
                    params: {
                        systemKey: systemKey,
                        categoryKey: categoryKey
                    }
                }).then(res => {
                    if (res.data !== true) {
                        callback();
                    } else {
                        this.$notify({
                            title: this.td.validate.warn,
                            text: '이미 등록된 게시판 키입니다.',
                            type: 'warn'
                        });
                    }
                })
                .catch(() => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saveFailed,
                        type: 'error'
                    });
                });
            },
            async saveCategory() {
                // step 1. check validation
                if (await this.validateData() === false) {
                    return;
                }

                // step 2. save category
                let url = this.mode === 'ADD' ? this.url.create : this.url.update;
                axios.post(url, this.targetCategory)
                .then(() => {
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
            openMsgDialog() {
                this.msgDialog = true;
            },
            closeMsgDialog() {
                this.msgDialog = false;
            },
            applyMsg(param) {
                this.targetCategory.messageGroup = param.mGroup;
                this.targetCategory.messageCode = param.mCode;
                this.closeMsgDialog();
            },
        }
    };


</script>

<style>
    #app .dialog__content .dialog #category-dialog-popup.card .field-box .input-group--text-field.input-group--select > div.input-group__input {
        width: 100%;
    }

    #app .dialog__content .dialog #category-dialog-popup.card .field-box #category-dialog-popup__option .input-group--text-field.input-group--text-field:not(.input-group--multi-line) .input-group__input {
        width: 100%;
    }

    #app .dialog__content .dialog #category-dialog-popup.card .field-box #category-dialog-popup__option .input-group--text-field > div.input-group__details {
        margin-left: 0px;
        width: 100%;
    }

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

<style scoped>
    #app #category-dialog-popup .useable-field {
        width: 220px;
        margin-top: 10px;
    }
</style>
