<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="400px">
            <v-card id="category-item-cu-dialog-popup">
                <v-card-title>
                    <span class="headline"> {{ title }} </span>
                </v-card-title>

                <v-card-text class="field-box">
                    <tb-validator class="tb-validator-in-dialog" form v-model="validCategory" ref="form-valid" @click.native="clearValid">
                        <!-- 카테고리 아이템 키 -->
                        <tb-validator :target="targetItemCategory.categoryItemKey" :rules="[rules.required, rules.nospace]" lazy>
                            <v-text-field ref="categoryItemKey" :label="td.menuBoard.category + ' ' + td.message.item + ' ' + td.message.key" :disabled="isUpdateMode"
                                          v-model.trim="targetItemCategory.categoryItemKey" required maxlength="100" />
                        </tb-validator>
                        <!-- 카테고리 항목 명 -->
                        <tb-validator :target="targetItemCategory.categoryItemName" :rules="[rules.required]" lazy>
                            <v-text-field ref="categoryItemName" :label="td.menuBoard.category + ' ' + td.message.item + ' ' + td.message.name"
                                          v-model.trim="targetItemCategory.categoryItemName" @keyup.enter="onClickSave" required maxlength="100" />
                        </tb-validator>
                    </tb-validator>
                    <!-- i18N -->
                    <div class="action-row--mini margin-top-10px">
                        <div class="label">i18N</div>
                        <div class="content">
                            <span v-if="targetItemCategory.messageGroup" class="read-field">{{targetItemCategory.messageGroup+'.'+targetItemCategory.messageCode}}</span>
                            <span v-else class="empty-i18n">{{ $td('menu-menus.not-exist-i18n', '다국어가 없습니다.') }}</span>
                            <v-btn style="width: 80px;margin-left: 8px;" @click.native="openMsgDialog">{{ $td('menu.message-mapping', 'Message Mapping') }}</v-btn>
                        </div>
                    </div>
                    <!-- 카테고리 사용여부 -->
                    <v-switch class="useable-field" :label=" $td(this.td.message.category, '카테고리')+ ' '+ $td('message.use-yn', '사용여부')" v-model="targetItemCategory.useYn"
                              true-value="Y" false-value="N" />
                </v-card-text>

                <v-card-actions v-if="this.menuAuth.update">
                    <v-btn @click.native="closeDialog">{{ td.button.cancel }}</v-btn>
                    <v-btn :disabled="false" v-show="this.mode==='ADD'" primary @click.native="saveCategoryItem(targetItemCategory)"> {{ td.button.save }}</v-btn>
                    <v-btn :disabled="false" v-show="this.mode==='UPDATE'" primary @click.native="saveCategoryItem"> {{ td.button.save }}</v-btn>
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
                targetItemCategory: {
                    i18n: '',
                    flag: 'C',
                    categoryId: '',
                    categoryKey: '',
                    categoryItemKey: '',
                    categoryItemOrder: '',
                    useYn: 'Y',
                    categoryItemName: '',
                    messageGroup: '',
                    messageCode: '',
                    updateUserId: this.$store.state.loginStore.currentUser.userId,
                    createUserId: this.$store.state.loginStore.currentUser.userId,
                    categoryItemDuplicate: false
                },
                url: {
                    create: '/rest/v1/category/detail/create',
                    update: '/rest/v1/category/detail/update',
                },
                rules: {
                    required: (v) => !!v || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                td: {
                    message: {
                        item: this.$i18n.td('message.item', '항목'),
                        key: this.$i18n.td('message.key', '키'),
                        name: this.$i18n.td('message.name', '명'),
                        useYn: this.$i18n.td('message.use-yn', '사용여부'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        add: this.$i18n.td('button.add', '추가'),
                        update: this.$i18n.td('button.update', '수정'),
                        warn: this.$i18n.td('message.warn', '안내'),
                    },
                    button: {
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장')
                    },
                    menuBoard: {
                        category: this.$i18n.td('menu-board.category', '카테고리'),
                    },
                    validate: {
                        notValidated: this.$i18n.td('validate.not-validated', '유효하지 않은 내용이 있습니다. 확인해주세요.'),
                    }
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                },
            };
        },
        computed: {
            title() {
                let prefix = `${this.td.menuBoard.category} ${this.td.message.item}`;
                let postfix = this.mode == 'ADD' ? this.td.message.add : this.td.message.update;
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
                        Object.assign(this.targetItemCategory, this.propsCategory);
                    } else { // mode === 'UPDATE'
                        Object.assign(this.targetItemCategory, this.propsCategory);
                    }
                } else {

                }
            }
        },
        methods: {
            clearValid() {
                this.$refs['form-valid'].clear();
            },
            validateData() {
                if (!this.$refs['form-valid'].isValid()) {
                    this.$notify({
                        title: this.td.message.warn,
                        text: this.td.validate.notValidated,
                        type: 'warn'
                    });
                    return false;
                }
                return true;
            },
            saveCategoryItem() {
                // step 1. check validation
                if (this.validateData() === false) {
                    return;
                }

                // step 2. save category
                let url = this.mode === 'ADD' ? this.url.create : this.url.update;

                axios.post(url, this.targetItemCategory)
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
                this.targetItemCategory.messageGroup = param.mGroup;
                this.targetItemCategory.messageCode = param.mCode;
                this.targetItemCategory.categoryItemName = this.$i18n.td(this.targetItemCategory.messageGroup + '.' + this.targetItemCategory.messageCode, '');
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
