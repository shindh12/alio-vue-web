<template>
    <div>
        <v-dialog :value="showDialog" fullscreen hide-overlay @input="closeDialog" max-width="1000px" transition="dialog-bottom-transition">
            <v-card color="beige" id="terms-detail-popup">
                <!-- Title Area -->
                <v-toolbar>
                    <v-toolbar-title>
                        <span class="headline">{{ formTitle }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="closeDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-card-text class="dialog-body">
                    <!-- Create New Group, Code -->
                    <v-form ref="form" v-model="isValid" lazy-validation>
                        <div class="page-searchbox page-searchbox--col2 page-searchbox--looks-like-form">
                            <div class="page-searchbox__row">
                                <!-- [SEARCH] Search items -->
                                <div class="page-searchbox__item-cell">
                                    <v-select :items="systemSearchValues" class="system-key-field"
                                              item-text="systemName"
                                              item-value="systemKey"
                                              v-model="saveData.systemKey"
                                              :label="$td('system.key', '시스템키')"
                                              disabled></v-select>
                                </div>
                                <div class="page-searchbox__item-cell">
                                    <v-text-field v-model.trim="saveData.version" disabled class="version-field"
                                                  :label="$td('message.version', '버전')"></v-text-field>
                                </div>
                            </div>

                            <div class="page-searchbox__row">
                                <div class="page-searchbox__item-cell">
                                    <v-text-field v-model.trim="saveData.termsKey"
                                                  :disabled=!isEditableKey
                                                  :label="$td('menu-terms.terms-key', '약관키')"
                                                  :rules="[ rules.required,rules.termsKey,rules.nospace ]"
                                                  required maxlength="100"></v-text-field>
                                </div>
                                <div class="page-searchbox__item-cell">
                                    <v-select :items="mandatorySelect" class="search-select"
                                              item-text="key"
                                              item-value="value"
                                              v-model="saveData.mandatoryYn"
                                              :label="$td('message.mandatory-yn', '필수여부')"
                                              :disabled=!isEditableName
                                              :rules="[ rules.required ]"
                                              required
                                    ></v-select>
                                </div>
                            </div>
                        </div>
                    </v-form>
                    <div>
                        <v-tabs v-model="active" hide-slider>
                            <v-tab v-for="(item, val, label) in languages" :key="val"> {{ $td('language.'+item , item) }}<span
                                style="color:red;margin-left:3px;vertical-align:sub;">*</span></v-tab>
                            <v-tab-item v-for="(item, val, label) in languages" :key="val">
                                <v-card-text class="field-box">
                                    <div v-show=isEditableName class="input-terms-title-field">
                                        <v-text-field required maxlength="300"
                                                      v-model.trim="termsNameText[item]"
                                                      :disabled=!isEditableName
                                                      :label="$td('menu-terms.terms-name', '약관명') + ' (' + $td('language.'+item, '해당 언어') + ')'"
                                                      :rules="[ rules.required ]" />
                                    </div>
                                    <div v-show=!isEditableName class="terms-title"><h2>{{ termsNameText[item] }}</h2></div>
                                </v-card-text>
                                <v-flex>
                                    <wysiwyg :id="item + '_editor'"
                                             v-if="isEditableName"
                                             v-model="termsDetailText[item]"
                                             :ref="item + '_editor'"
                                             @blur="onBlur($event, item)"
                                             class="vue-editor"
                                    ></wysiwyg>

                                    <div v-if="!isEditableName">
                                        <div v-html="termsDetailText[item]"></div>
                                        <div v-if="!termsDetailText[item]" class="empty-terms-text">{{ $td('message.no-data', '조회된 내용이 없습니다.') }}</div>
                                    </div>
                                </v-flex>
                            </v-tab-item>
                        </v-tabs>
                    </div>
                </v-card-text>

                <!-- Cancel, Save Button -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', 'Cancel') }}</v-btn>
                    <v-btn primary v-bind:disabled="isDisabledSave" v-show="isEditableName" @click.native="saveDialog">{{ $td('button.save', 'Save') }}</v-btn>
                    <v-btn primary v-show="isNotPublished" @click.native="publish">{{ $td('button.publish', 'Publish') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <v-layout row justify-center>
            <v-dialog v-model="closeConfirmDialog" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">{{ $td('button.confirm', '확인') }}</v-card-title>
                    <v-card-text>{{ $td('message.unsave-return-list', '저장하지 않은 내용이 있습니다. 저장하지 않고 목록 화면으로 돌아갑니다.')}}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="disagreeDialog">{{$td('button.no', '아니요')}}</v-btn>
                        <v-btn @click.native="agreeDialog">{{$td('button.yes', '예')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        components: {
            axios
        },
        props: [
            'languages',
            'showDialog',
            'editedItem',
            'editType',
            'publishedYn'
        ],
        watch: {
            showDialog: function () {
                let that = this;
                if (!this.showDialog) {
                    return;
                }
                //form reset 후 다시 세팅
                let reset = Object.assign({}, this.editedItem);
                let resetType = this.editType;

                this.$refs.form.reset();
                this.saveData = reset;
                this.saveType = resetType;
                this.saveLanguages = this.languages;

                //새 약관 추가하는 경우
                if (resetType == '' || resetType == null) {
                    this.saveData.termsKey = '';
                    this.saveData.mandatoryYn = 'Y';
                    this.termsDetailText = {};
                    this.termsNameText = {};
                    /*for(var l=0; l<that.saveLanguages.length; l++){
                        CKEDITOR.instances[that.saveLanguages[l]+"_editor"].setData("")
                    }*/
                } else {
                    this.searchTermsLocale(this.editedItem);
                }
            }
        },
        data() {
            return {
                active: '0',
                url: {
                    searchTermsLocale: '/rest/v1/terms/locale', //약관상세 단건 언어별 조회
                    createTerms: '/rest/v1/terms/create', //약관 단건 신규생성
                    updateTerms: '/rest/v1/terms/update', //약관 단건 수정
                    publishTerms: '/rest/v1/terms/publish', //약관 발행
                },
                saveData: {},
                saveType: '',
                saveLanguages: {},

                closeConfirmDialog: false,
                searchAfterClose: false,
                systemSearchValues: [],
                mandatorySelect: [
                    {key: this.$i18n.td('message.mandatory', '필수'), value: 'Y'},
                    {key: this.$i18n.td('message.optional', '선택'), value: 'N'}
                ],
                // selectedTab: 1,

                termsDetailText: {},
                termsNameText: {},

                systemKey: '',
                termsKey: '',
                version: '',
                termsName: '',
                customToolbar: [
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['image']
                ],
                config: {
                    toolbar: [
                        // { name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
                        // { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
                        // { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
                        //{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
                        '/',
                        {name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat']},
                        {name: 'paragraph',
                            items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight',
                                'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language']
                        },
                        // { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
                        // { name: 'insert', items: [ 'Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
                        '/',
                        {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                        {name: 'colors', items: ['TextColor', 'BGColor']},
                        // { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
                        {name: 'about', items: ['About']}
                    ],
                    height: 300
                },
                rules: {
                    required: (v) => (v ? !!v.trim() : !!v) || this.$i18n.td('message.required', '필수 입력 항목입니다.'),
                    termsKey: v => /^[a-z0-9_.]{4,50}$/.test(v) || '4~50자의 영문 소문자, 숫자, 특수문자(_.)를 사용하십시오.',
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.')
                },
                isValid: false,
                sanitize: '', /* Content sanitizer for XSS */
            };
        },
        mounted() {
            this.initSystemKeySelect();
        },
        computed: {
            formTitle() {
                let title;
                if (this.saveType == 'U') {
                    title = this.$i18n.td('menu.terms-update', '약관 수정');
                } else if (this.saveType == 'C') {
                    title = this.$i18n.td('menu.terms-create-version', '신규 버전 생성');
                } else if (this.saveType == 'D') {
                    title = this.$i18n.td('menu.terms-detail', '약관 상세');
                } else {
                    title = this.$i18n.td('menu.terms-create', '신규 약관 생성');
                }
                return title;
            },
            isEditableKey() {
                //Detail : x
                //CreateNewVersion : x
                //CreateNewTerms : o
                //Edit : x
                if (this.saveType != '') {
                    return false;
                } else {
                    return true;
                }
            },
            isEditableName() {
                //Detail : x
                //CreateNewVersion : o
                //CreateNewTerms : o
                //Edit : o
                if (this.saveType == 'D') {
                    return false;
                } else {
                    return true;
                }
            },
            isNotPublished() {
                if (this.saveType == 'D' && this.saveData.publishedYn == 'N') {
                    return true;
                } else {
                    return false;
                }
            },
            isDisabledSave: {
                cache: false,
                get() {
                    let that = this;
                    //시스템키, 약관키, 버전, 필수여부 체크
                    if (!this.saveData.systemKey
                        || !this.saveData.termsKey
                        || !this.saveData.version
                        || !this.saveData.mandatoryYn
                    ) {
                        return true;
                    }

                    //입력값 validation 체크
                    if (this.isValid == false) {
                        return true;
                    }

                    // 각 언어별 약관명 체크
                    var validValue = false;
                    this.saveLanguages.forEach(
                        function valid(value, index) {
                            if (that.termsNameText[value] == ''
                                || that.termsNameText[value] == null
                                || that.termsNameText[value] == undefined) {
                                validValue = true;
                            }
                        });

                    return validValue;
                }
            }
        },
        methods: {
            onBlur(editor, item) {
                console.log(editor);
                console.log(item);
                this.termsDetailText[item] = editor.innerHTML;
                console.log(this.termsDetailText[item]);
            },
            onFocus(editor) {
                console.log(editor);
            },
            initSystemKeySelect() {
                const url = '/rest/v1/system';
                let that = this;
                axios.get(url).then(res => {
                    that.systemSearchValues = res.data;
                    that.searchSystemKey = that.systemSearchValues[0].systemKey;
                    that.treeSystemKey = that.searchSystemKey;
                });
            },
            agreeDialog() {
                this.closeConfirmDialog = false;
                var searchAfterClose = this.searchAfterClose;
                this.$emit('closeDialog', searchAfterClose);
            },
            disagreeDialog() {
                this.closeConfirmDialog = false;
            },
            makeLanguageString(lang) {
                let str = '';
                for (let i = 0; i < lang.length; i++) {
                    str += '\'' + lang[i] + '\'';
                    if (i != lang.length - 1) {
                        str += ',';
                    }
                }
                return str;
            },
            //약관 언어별 조회
            searchTermsLocale(terms) {
                const url = this.url.searchTermsLocale;
                let that = this;
                axios.get(url,
                    {
                        params:
                            {
                                systemKey: terms.systemKey,
                                termsKey: terms.termsKey,
                                version: terms.version,
                                locale: that.makeLanguageString(that.saveLanguages)
                            }
                    }).then(res => {
                    if (that.saveType == 'C') {
                        that.saveData.version = that.saveData.version + 1;
                    }
                    that.makeTermsMap(res.data);
                });
            },
            makeTermsMap(termsList) {
                let tempTermsNameText = {};
                let tempTermsDetailText = {};
                let that = this;
                for (let i = 0; i < termsList.length; i++) {
                    tempTermsNameText[termsList[i]['locale']] = termsList[i]['termsName'];
                    tempTermsDetailText[termsList[i]['locale']] = termsList[i]['contents'];
//                    if(CKEDITOR.instances.length > 0 ) {
//                        CKEDITOR.instances[termsList[i]['locale']+"_editor"].setData(termsList[i]['contents'])
//                    }
                }

                this.termsNameText = tempTermsNameText;
                this.termsDetailText = tempTermsDetailText;
            },
            //팝업 닫기
            closeDialog() {
                if (this.saveType == 'D') {
                    this.agreeDialog();
                } else {
                    this.closeConfirmDialog = true;
                }
            },
            saveDialog() {
                this.saveTerms();
            },

            saveTerms() {
                var url = this.url.createTerms;
                var that = this;
                if (that.saveType == 'U') {
                    url = that.url.updateTerms;
                }
                that.searchAfterClose = true;
                var itemList = [];

                console.log(this.saveLanguages);
                console.log(this.termsDetailText);
                for (let i = 0; i < this.saveLanguages.length; i++) {
                    itemList[i] = Object.assign({}, this.saveData);
                    itemList[i].locale = this.saveLanguages[i];
                    itemList[i].contents = this.termsDetailText[this.saveLanguages[i]];
                    itemList[i].termsName = this.termsNameText[this.saveLanguages[i]];
                    console.log(this.saveLanguages[i]);
                    console.log(itemList[i].contents);
                }

                axios.post(url, itemList)
                .then(res => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.agreeDialog();
                });
            },

            isEmpty(val) {
                if (val == undefined || val == null || val == '') {
                    return true;
                } else {
                    return false;
                }
            },
            publish() {
                var that = this;
                var url = this.url.publishTerms;
                axios.post(url, that.saveData)
                .then(res => {
                    this.$notify({
                        title: this.$i18n.td('button.publish', '발행'),
                        text: this.$i18n.td('message.published', '발행되었습니다.'),
                        type: 'success'
                    });
                    this.agreeDialog();
                });
            }
        }
    };
</script>

<style scoped>
    #app #terms-detail-popup { /* <= "v-card"*/
    }

    #app #terms-detail-popup .version-field {
        width: 300px
    }

    #app #terms-detail-popup .system-key-field {
        width: 380px
    }

    #app #terms-detail-popup .tabs {
        margin-top: 30px;
    }

    #app #terms-detail-popup .terms-title {
        margin-top: 20px;
    }

    #app #terms-detail-popup .empty-terms-text {
        opacity: 0.5;
    }

    #app #terms-detail-popup .input-terms-title-field {
        margin: 10px 0;
    }

</style>
<style>
    #app #terms-detail-popup .input-terms-title-field {
        width: calc(100% - 100px);
    }

    #app #terms-detail-popup .input-terms-title-field label {
        width: 200px;
    }

    #app #terms-detail-popup .input-terms-title-field div.input-group__input {
        width: calc(100% - 200px);
    }

    #app #terms-detail-popup .input-terms-title-field div.input-group__details {
        width: calc(100% - 200px);
        margin-left: 200px;
    }

    .vue-editor {
        height: 400px;
        overflow: auto;
    }
</style>
