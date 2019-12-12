<template>
    <div class="isdp-body-content">
        <!--  Title Area -->
        <page-title :sub="formTitle"></page-title>

        <div class="detail-page__contents" id="terms-detail">

            <tb-validator class="tb-validator-in-table" form v-model="isValid" ref="form-valid" @click.native="clearValid" lazy> <!-- isValid -->
                <v-divider />
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
                            <v-text-field v-model="saveData.version" disabled class="version-field"
                                          :label="$td('message.version', '버전')"></v-text-field>
                        </div>
                    </div>
                    <v-divider />
                    <div class="page-searchbox__row" style="margin-bottom: 15px;">
                        <div class="page-searchbox__item-cell">
                            <tb-validator id="terms-key" :target="saveData.termsKey" :rules="[ rules.required,rules.termsKey,rules.nospace ]" lazy
                                          style="margin-top:18px;line-height:20px;">
                                <v-text-field v-model.trim="saveData.termsKey"
                                              :disabled=isEditableKey
                                              :label="$td('menu-terms.terms-key', '약관키')"
                                              required maxlength="100"></v-text-field>
                            </tb-validator>
                        </div>
                        <div class="page-searchbox__item-cell">
                            <div class="page-searchbox__item-title">{{$td('message.mandatory-yn', '필수여부')}}</div>
                            <span class="---has-to-be-span---">
                              <v-select :items="mandatorySelect" class="narrow-search-select"
                                        item-text="key"
                                        item-value="value"
                                        v-model="saveData.mandatoryYn"
                                        :disabled=!isEditableName
                                        :rules="[ rules.required ]"
                                        required />
                            </span>
                        </div>
                    </div>
                </div>
                <v-divider />
                <div class="my-tab-wrapper">
                    <!-- TAB Navigation -->
                    <div class="my-tab-navi">
                        <div class="-tb-validator">
                            <ul id="tab">
                                <tb-validator :target="termsNameText.ko" :rules="[rules.required]" :noMessage="currentTab.selTab===1" lazy
                                              style="display:inline-block;line-height:20px;font-size:12px;">
                                    <li @click="currentTab.selTab=1" :class="{'active':currentTab.selTab===1}" class="visitor-error-focused" required>{{$td('language.ko',
                                        '한국어')}}
                                    </li>
                                </tb-validator>
                                <tb-validator :target="termsNameText.en" :rules="[rules.required]" :noMessage="currentTab.selTab===2" lazy
                                              style="display:inline-block;line-height:20px;font-size:12px;">
                                    <li @click="currentTab.selTab=2" :class="{'active':currentTab.selTab===2}" class="visitor-error-focused" required>{{$td('language.en', '영어')}}
                                    </li>
                                </tb-validator>
                            </ul>
                        </div>
                    </div>
                    <!-- TAB Contents -->
                    <div class="my-tab-cont" :class="{'active':currentTab.selTab===1}">
                        <v-card-text class="field-box">
                            <div v-show=isEditableName class="input-terms-title-field">
                                <tb-validator :target="termsNameText.ko" :rules="[rules.required]" lazy style="display:inline-block;width:100%;">
                                    <v-text-field required maxlength="300"
                                                  v-model.trim="termsNameText.ko"
                                                  :disabled=!isEditableName
                                                  :label="$td('menu-terms.terms-name', '약관명') + ' ( ' + $td('language.ko', '한국어') + ' ) '"
                                    />
                                </tb-validator>
                            </div>
                            <div v-show=!isEditableName class="terms-title"><h2>{{ termsNameText.ko }}</h2></div>
                        </v-card-text>
                        <v-flex>
                            <wysiwyg id="ko_editor"
                                     v-if="isEditableName"
                                     v-model="termsDetailText.ko"
                                     @blur="onBlur($event, 'ko')"
                                     class="vue-editor"
                            ></wysiwyg>

                            <div v-if="!isEditableName">
                                <div v-html="termsDetailText.ko"></div>
                                <div v-if="!termsDetailText.ko" class="empty-terms-text">{{ $td('message.no-data', '조회된 내용이 없습니다.') }}</div>
                            </div>
                        </v-flex>
                    </div>
                    <div class="my-tab-cont" :class="{'active':currentTab.selTab===2}">
                        <v-card-text class="field-box">
                            <div v-show=isEditableName class="input-terms-title-field">
                                <tb-validator :target="termsNameText.en" :rules="[rules.required]" lazy style="display:inline-block;width:100%;">
                                    <v-text-field required maxlength="300"
                                                  v-model.trim="termsNameText.en"
                                                  :disabled=!isEditableName
                                                  :label="$td('menu-terms.terms-name', '약관명') + ' ( ' + $td('language.en', '영어') + ' ) '"
                                    />
                                </tb-validator>
                            </div>
                            <div v-show=!isEditableName class="terms-title"><h2>{{ termsNameText.en }}</h2></div>
                        </v-card-text>
                        <v-flex>
                            <wysiwyg id="en_editor"
                                     v-if="isEditableName"
                                     v-model="termsDetailText.en"
                                     @blur="onBlur($event, 'en')"
                                     class="vue-editor"
                            ></wysiwyg>
                            <div v-if="!isEditableName">
                                <div v-html="termsDetailText.en"></div>
                                <div v-if="!termsDetailText.en" class="empty-terms-text">{{ $td('message.no-data', '조회된 내용이 없습니다.') }}</div>
                            </div>
                        </v-flex>
                    </div>

                </div>


                <!--<v-tabs v-model="active" hide-slider>
                     <v-tab v-for="(item, val, label) in languages" :key="val"> {{ $td('language.'+item , item) }}<span style="color:red;margin-left:3px;vertical-align:sub;">*</span> </v-tab>
                     <v-tab-item v-for="(item, val, label) in languages" :key="val" >
                         <v-card-text class="field-box">
                             <div v-show=isEditableName class="input-terms-title-field">

                                     <v-text-field required maxlength="300"termsNameText
                                                   v-model.trim="termsNameText[item]"
                                                   :disabled=!isEditableName
                                                   :label="$td('menu-terms.terms-name', '약관명') + ' (' + $td('language.'+item, '해당 언어') + ')'"
                                                   :rules="[ rules.required ]"
                                                   @keyup="test"
                                                   />

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
                                 <div v-html="sanitize(termsDetailText[item])"></div>
                                 <div v-if="!termsDetailText[item]" class="empty-terms-text">{{ $td('message.no-data', '조회된 내용이 없습니다.') }}</div>
                             </div>
                         </v-flex>
                     </v-tab-item>
                 </v-tabs>-->
            </tb-validator>
            <div class="cont-half__upper action-row--mini--right">
                <v-btn @click.native="toList">{{ $td('button.cancel', 'Cancel') }}</v-btn>
                <v-btn primary v-show="isEditableName" @click.native="saveTerms">{{ $td('button.save', 'Save') }}</v-btn>
                <v-btn primary v-show="this.saveType == 'D' && this.saveData.publishedYn == 'N'" @click.native="publish">{{ $td('button.publish', 'Publish') }}</v-btn>
            </div>
            <v-divider />

        </div>


    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        components: {
            axios
        },
        data() {
            return {
                active: '0',
                url: {
                    lang: '/rest/v1/message/lang',
                    detail: '/rest/v1/terms/',
                    searchTermsLocale: '/rest/v1/terms/locale', //약관상세 단건 언어별 조회
                    createTerms: '/rest/v1/terms/create', //약관 단건 신규생성
                    updateTerms: '/rest/v1/terms/update', //약관 단건 수정
                    publishTerms: '/rest/v1/terms/publish', //약관 발행
                },
                editorSettings: {},
                languages: [],
                termsDetailText: [],
                termsConfig: {},
                currentTab: {selTab: 1},
                isValid: false,
                rules: {
                    required: (v) => (v ? !!v.trim() : !!v) || this.$i18n.td('message.required', '필수 입력 항목입니다.'),
                    termsKey: v => /^[a-z0-9_.]{4,50}$/.test(v) || '4~50자의 영문 소문자, 숫자, 특수문자(_.)를 사용하십시오.',
                    nospace: v => /[\s]/g.test(v) == false || this.$i18n.td('validate.nospace', '공백은 입력할 수 없습니다.'),
                },
                saveData: {
                    systemKey: '',
                    termsKey: '',
                    version: '',
                    mandatoryYn: '',
                },
                saveType: 'C',
                saveLanguages: [],
                termsNameText: {},
                sanitize: '', /* Content sanitizer for XSS */
                closeConfirmDialog: false,
                searchAfterClose: false,
                systemSearchValues: [],
                mandatorySelect: [
                    {key: this.$i18n.td('message.mandatory', '필수'), value: 'Y'},
                    {key: this.$i18n.td('message.optional', '선택'), value: 'N'}
                ],
            };
        },
        created() {
            this.initSystemKeySelect();
            this.saveData.systemKey = this.$store.state.loginStore.systemKey;
            if (this.$route.path === '/system/terms/new') {
                this.saveType = 'N';
                this.saveData.termsKey = '';
                this.saveData.mandatoryYn = 'Y';
                this.saveData.version = 1;
                this.termsDetailText = {};
                // this.termsNameText = {}
            } else {
                this.saveType = this.$route.query.editType;
                this.saveData.termsKey = this.$route.params.termsKey;
            }

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
                } else if (this.saveType == 'N') {
                    title = this.$i18n.td('menu.terms-create', '신규 약관 생성');
                }
                return title;
            },
            isEditableKey() {
                //Detail : x
                //CreateNewVersion : x
                //CreateNewTerms : o
                //Edit : x
                if (this.saveType == 'N') {
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
                    this.languages.forEach(
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
        watch: {},
        methods: {
            validateData() {
                console.log(this.termsNameText);
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
            //약관 언어별 조회
            searchTermsLocale() {
                const url = this.url.searchTermsLocale;
                let that = this;
                axios.get(url,
                    {
                        params:
                            {
                                systemKey: that.$store.state.loginStore.systemKey,
                                termsKey: that.$route.params.termsKey,
                                version: that.$route.query.version,
                                locale: that.makeLanguageString(that.languages)
                            }
                    }).then(res => {
                    that.saveData.version = res.data[0].version;
                    that.saveData.mandatoryYn = res.data[0].mandatoryYn;
                    that.saveData.publishedYn = res.data[0].publishedYn;
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
                    // tempTermsDetailText[termsList[i]['locale']] = termsList[i]['contents'];
                }
                this.termsNameText = tempTermsNameText;
                this.termsDetailText = tempTermsDetailText;
            },

            initSystemKeySelect() {
                const url = '/rest/v1/system';
                let that = this;
                axios.get(url).then(res => {
                    that.systemSearchValues = res.data;
                    that.searchLanguageList();
                });
            },
            searchLanguageList() {
                const url = this.url.lang;
                var that = this;
                axios.get(url).then(res => {
                    var langList = res.data;
                    langList.forEach(function (value) {
                        that.languages.push(value.lang);
                    });
                    if (that.saveType != 'N') {
                        that.searchTermsLocale();
                    }
                }).catch(e => {
                    that.errors.push(e);
                });
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

            toList() {
                this.$router.push({
                    path: '/system/terms',
                    query: this.$route.query
                });
            },
            saveTerms() {
                if (this.validateData() === false) {
                    console.log('###');
                    return;
                }

                var url = this.url.createTerms;
                var that = this;
                if (that.saveType == 'U') {
                    url = that.url.updateTerms;
                }
                that.searchAfterClose = true;
                var itemList = [];
                for (let i = 0; i < this.languages.length; i++) {
                    itemList[i] = Object.assign({}, this.saveData);
                    itemList[i].locale = this.languages[i];
                    itemList[i].contents = this.termsDetailText[this.languages[i]];
                    itemList[i].termsName = this.termsNameText[this.languages[i]];
                }

                axios.post(url, itemList)
                .then(res => {
                    this.$notify({
                        title: this.$i18n.td('button.save', '저장'),
                        text: this.$i18n.td('message.saved', '저장되었습니다.'),
                        type: 'success'
                    });
                    this.toList();
                });
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
                    this.toList();
                });
            },
            onBlur(editor, item) {
                this.termsDetailText[item] = editor.innerHTML;
            },
        }
    };
</script>

<style scoped>
    #app #terms-detail { /* <= "v-card"*/
    }

    #app #terms-detail .version-field {
        width: 300px
    }

    #app #terms-detail .system-key-field {
        width: 380px
    }

    #app #terms-detail .tabs {
        margin-top: 30px;
    }

    #app #terms-detail .tabs__item {
        border: 1px solid #999;
        padding: 0px 30px;
    }

    #app #terms-detail .terms-title {
        margin-top: 20px;
    }

    #app #terms-detail .empty-terms-text {
        opacity: 0.5;
    }

    #app #terms-detail .input-terms-title-field {
        margin: 10px 0;
    }

    /* [COMP] "TAB! myTab!" */
    .my-tab-wrapper {
        width: 100%;
        position: relative;
        margin-top: 15px;
    }

    /* [COMP] "TAB! myTab!" :: 상단 tab 영역 */
    .my-tab-navi {
        border-bottom: 1px solid #999;
    }

    .my-tab-navi ul {
        font-size: 0;
    }

    .my-tab-navi ul li {
        display: inline-block;
        padding: 0px 30px;
        cursor: pointer;
        margin-bottom: -1px;
        background: #EBEBEB;
        height: 35px;
        line-height: 35px;
        text-align: center;
        font-size: 14px;
        border: 1px solid #999;
        position: relative;
    }

    .my-tab-navi ul li[required]::after {
        content: '*';
        color: red;
        padding-left: 3px;
    }

    .my-tab-navi ul li + li {
        margin-left: -1px;
    }

    .my-tab-navi ul li.active {
        border-bottom-color: #FFF;
        background: #FFF;
    }

    .my-tab-navi ul li.active:before {
        content: ' ';
        position: absolute;
        top: -1px;
        height: 5px;
        left: -1px;
        right: -1px;
        background: #2A96FD;
    }

    /* #root .my-tab-navi ul li:hover {color:#2196F3;background:rgba(42,150,253,0.1);}
    #root .my-tab-navi ul li.active:hover {background:none;} */
    /* #root .my-tab-navi ul li.active {border-bottom:5px solid #2196F3;border-top:5px solid rgba(0,0,0,0);font-weight:bold;line-height:40px;} */
    .my-tab-navi .tabidx {
        position: absolute;
        top: 0px;
        right: 0px;
        bottom: 0px;
    }

    .my-tab-navi .tabidx button {
        height: 26px;
        line-height: 24px;
    }

    .my-tab-navi .tabidx button[disabled] {
        cursor: default;
        color: #A6A6A6;
    }

    /* [COMP] "TAB! myTab!" :: 아래 Conetent 영역 */
    .my-tab-cont {
        position: relative;
        width: 100%;
        min-height: 200px;
        display: none;
    }

    .my-tab-cont.active {
        display: block;
    }

    .my-tab-cont.cont-empty {
        font-size: 24px;
        text-align: center;
        padding-top: 30px;
        color: #AAA;
    }

    .-tb-validator--error .visitor-error-focused {
        box-shadow: 0px 0px 6px rgba(255, 0, 0, 0.8) inset;
    }

    .-tb-validator--error ul li.active.visitor-error-focused:before {
        background: rgba(255, 0, 0, 0.5);
    }

    .-tb-validator--error li.visitor-error-focused.active:before {
        background: rgba(255, 0, 0, 0.5);
    }
</style>

<style lang="scss">
    @import "styles/mixins.scss";

    #app #terms-detail .card__text {
        padding: 0px 10px;
    }

    #app #terms-detail .page-searchbox.page-searchbox--looks-like-form {
        border: none; /* border-top:1px solid #333; border-bottom:1px solid #333; */
    }

    #app #terms-detail hr.divider {
        background-color: #CCC;
    }

    #app #terms-detail .page-searchbox.page-searchbox--looks-like-form hr.divider {
        margin: 10px 0px;
        background-color: #F7F7F7;
    }

    #app #terms-detail .my-tab-navi {
        border-bottom: 1px solid #CCC;
    }

    #app #terms-detail .input-group--text-field {
        @include override-vuetify;
        @include labeled-textfield(120px);
    }

    #app #terms-detail.detail-page__contents {
        border-top: none;
        border-bottom: none;
    }

    .vue-editor {
        min-height: 400px;
    }


    #terms-key .-tb-validator__error-message.-tb-validator__error-message--bottom {
        width: calc(100% - 120px - 40px);
        margin-left: 120px;
        transform: translateY(calc(100% + 18px));
    }

    #tab .-tb-validator__error-message.-tb-validator__error-message--bottom {
        width: 150px;
    }

    .my-tab-cont .-tb-validator__error-message.-tb-validator__error-message--bottom {
        margin-left: 120px;
        width: calc(100% - 120px);
    }

</style>
