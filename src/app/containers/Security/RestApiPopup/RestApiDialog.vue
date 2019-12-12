<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="450px">
            <v-card id="rest-api-dialog">
                <v-card-title>
                    <span class="headline"> {{ formTitle }} </span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>

                <v-card-text class="field-box">
                    <!--<v-form v-model="restValid" ref="form" lazy-validation >-->
                    <tb-validator class="tb-validator-in-dialog" form v-model="restValid" ref="form-valid" @click.native="clearValid">
                        <tb-validator v-show="this.mode=='ADD'" :target="updatedRestApi.restApiUrl" :rules="[rules.required, rules.rest]" lazy>
                            <v-text-field v-show="this.mode=='ADD'" ref="restApiUrl"
                                          :label="$td('system.rest-url', 'REST URL')" v-model.trim="updatedRestApi.restApiUrl"
                                          @keyup="searchRestApi" :hint="$td('message.rest-api-hint', 'REST API URL을 검색후 선택하거나 입력하세요')" maxlength="200" required />
                        </tb-validator>
                        <tb-validator v-show="this.mode=='UPDATE'" :target="updatedRestApi.restApiUrl" :rules="[rules.required, rules.rest]" lazy>
                            <v-text-field v-show="this.mode=='UPDATE'" ref="url"
                                          :label="$td('system.rest-url', 'REST URL')" v-model.trim="updatedRestApi.restApiUrl"
                                          maxlength="200" required />
                        </tb-validator>
                        <tb-validator :target="updatedRestApi.description" :rules="[rules.required]" lazy>
                            <v-text-field ref="description" :label="$td('message.description', '설명')" v-model.trim="updatedRestApi.description" maxlength="500" required />
                        </tb-validator>
                        <v-switch :label="$td('message.use-yn', '사용여부')" class="labelling useable-field" true-value='Y' false-value='N' v-model="updatedRestApi.useYN"></v-switch>
                    </tb-validator>
                    <!--</v-form>-->
                    <div class="table-area fixed-layout">
                        <div class="table__body">
                            <v-data-table :headers="restApiHeaders" :items="restApiList" item-key="items.resetApiId"
                                          :loading="restApiLoading" v-show="this.mode=='ADD'"
                                          hide-actions>
                                <template slot="items" slot-scope="props">
                                    <tr>
                                        <td class="text-xs-left" @click="updateRestApi(props.item.restApiUrl)">{{ props.item.restApiUrl }}</td>
                                        <td class="text-xs-left" @click="updateRestApi(props.item.restApiUrl)">{{ props.item.description }}</td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-btn @click.native="closeDialog">{{$td('button.cancel', '취소')}}</v-btn>
                    <v-btn primary @click.native="saveRestApi">{{$td('button.save', '저장')}}</v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'RestApiDialog',
        props: [
            'showDialog',
            'mode',
            'targetRestApi',
            'systemKey',
            'formTitle'
        ],
        watch: {
            showDialog(status) {
                if (status === true) {
                    if (this.targetRestApi !== null) {
                        this.updatedRestApi.restApiId = this.targetRestApi.restApiId;
                        this.updatedRestApi.systemKey = this.targetRestApi.systemKey;
                        this.updatedRestApi.restApiUrl = this.targetRestApi.restApiUrl;
                        this.updatedRestApi.description = this.targetRestApi.description;
                        this.updatedRestApi.useYN = this.targetRestApi.useYN;
                        this.copyRestApi.restApiUrl = this.targetRestApi.restApiUrl;
                        this.$refs.url.errorBucket = [];
                        this.$refs.description.errorBucket = [];
                    } else if (this.targetRestApi == null) {
                        this.$refs.restApiUrl.errorBucket = [];
                        this.$refs.description.errorBucket = [];
                        this.updatedRestApi.useYN = 'Y';
                    }

                } else if (status === false) {
                    setTimeout(() => {
                        this.updatedRestApi.systemKey = '';
                        this.updatedRestApi.restApiUrl = '';
                        this.updatedRestApi.description = '';
                        this.updatedRestApi.useYN = 'Y';
                        this.restApiList = [];
                    }, 300);
                }
            },
        },
        data() {
            return {
                updatedRestApi: {
                    restApiId: '',
                    systemKey: '',
                    restApiUrl: '',
                    description: '',
                    useYN: 'Y'
                },
                copyRestApi: {
                    restApiUrl: '',
                },
                restApiHeaders: [
                    {text: this.$i18n.td('system.rest-url', 'REST URL'), align: 'center', sortable: false, value: 'restApiUrl', watch: '40%'},
                    {text: this.$i18n.td('message.description', '설명'), align: 'center', sortable: false, value: 'description', watch: '60%'},
                ],
                restApiList: [],
                useYnValues: ['Y', 'N'],
                restApiLoading: false,
                restValid: false,
                authUrl: {
                    add: '/rest/v1/restapi/create',
                    update: '/rest/v1/restapi/update',
                    duplicate: '/rest/v1/restapi/find/duplication',
                },
                restApiUrl: {
                    search: '/rest/v1/restapi/',
                },
                rules: {
                    required: (value) => !!value || this.$i18n.td('validate.required', '필수항목 입니다.'),
                    rest: v => /^[a-zA-Z0-9/]{1,200}$/.test(v) || this.$i18n.td('validate.rest', '200자 이내의 영문자, 숫자, 특수문자(/)를 사용하십시오.'),
                }
            };
        },

        methods: {
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
            closeDialog() {
                this.clearValid();
                this.$emit('closeDialog');
            },
            updateRestApi(url) {
                this.updatedRestApi.restApiUrl = url;
            },
            saveRestApi() {
                // step 1. check validation
                if (this.validateData() === false) {
                    return;
                }

                // step 2. save rest api
                if (this.copyRestApi.restApiUrl === this.updatedRestApi.restApiUrl) {
                    this.$emit('saveRestApi', this.updatedRestApi);
                } else {
                    this.updatedRestApi.systemKey = this.systemKey;
                    const url = this.authUrl.duplicate;
                    axios.post(url, this.updatedRestApi).then(res => {
                        if (res.data) {
                            this.$notify({title: this.$i18n.td('message.duplication', '중복'), text: res.data + ' ' + this.$i18n.td('message.duplicated', '중복입니다.'), type: 'warn'});
                            return;
                        }
                        this.$emit('saveRestApi', this.updatedRestApi);
                    }).catch(e => {

                    });
                }//else
            },
            searchRestApi: _.debounce(
                function () {
                    if (this.updatedRestApi.restApiUrl.length > 0) {
                        this.restApiLoading = true;
                        const url = this.restApiUrl.search;
                        axios.get(url, {
                            params: {
                                systemKey: this.systemKey,
                                searchText: this.updatedRestApi.restApiUrl,
                            }
                        }).then(res => {
                            let content = res.data.content;
                            this.restApiList = content;
                            this.restApiLoading = false;
                        });
                    }
                }
                , 300
            ),
        }
    };
</script>

<style scoped>
    #rest-api-dialog .table-area {
        margin-top: 10px;
    }

    #rest-api-dialog .useable-field {
        width: 200px;
        margin-top: 10px;
    }
</style>
