<template>
    <div>
        <!-- 수신인 검색 START-->
        <v-dialog :value="isUserSearchDialog" @input="closeUserSearchDialog" max-width="800px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ message['user-list'] }}</span>
                </v-card-title>
                <v-card-text>
                    <div class="aprv__content" style="overflow-y: scroll; height:400px;">
                        <!-- [TABLE] 본체 -->
                        <div class="table__body">
                            <v-data-table
                                :headers="userSearchHeaders"
                                :items="users"
                                item-key="userId"
                                v-model="selected"
                                :total-items="users.length"
                                hide-actions
                            >
                                <!-- Grid Body -->
                                <template slot="items" slot-scope="props">
                                    <tr v-clickable @click="addRecipient(props.item)">
                                        <td class="text-xs-left"> {{ props.item.cn }}({{ props.item.userid }})</td>
                                        <td class="text-xs-left"> {{ props.item.epenorganizationname }}</td>
                                        <td class="text-xs-left"> {{ props.item.department }}</td>
                                        <td class="text-xs-left"> {{ props.item.mail }}</td>
                                    </tr>
                                </template>
                            </v-data-table>

                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="closeUserSearchDialog">{{ message['close'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
    <!-- 수신인 검색 END-->
</template>

<script>

    const CONTEXT_ROOT = '/rest/v1/mail';

    export default {
        props: ['isUserSearchDialog', 'searchText', 'recipientList', 'users'],
        data() {
            return {
                isUserCheck: false,
                selected: [],
                userSearchHeaders: [],
                message: {
                    'registered-user': '',
                    'username': '',
                    'e-mail': '',
                    'user-list': '',
                    'company': '',
                    'department-name': '',
                    'close': ''
                }
            };
        },
        mounted() {
            this.messageLoad();
            this.getGridHeader();
        },
        computed: {},
        methods: {
            addRecipient(item) {
                this.totalItems += 1;
                for (var i = 0; i < this.recipientList.length; i++) {
                    if (this.recipientList[i]['epid'] == item.epid) {
                        this.$notify('[' + item.cn + '(' + item.userid + ')] ' + this.message['registered-user']);
                        return false;
                    }
                }
                this.$emit('addRecipient', item);
                this.closeUserSearchDialog();
            },
            closeUserSearchDialog() {
                this.$emit('closeUserSearchDialog');
            },
            messageLoad() {
                this.message['registered-user'] = this.$i18n.td('menu-mail.registered-user', '이미 수신인에 등록되어 있습니다.');
                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['e-mail'] = this.$i18n.td('user.e-mail', '이메일');
                this.message['user-list'] = this.$i18n.td('message.user-list', '사용자 목록');
                this.message['company'] = this.$i18n.td('message.company', '회사');
                this.message['department-name'] = this.$i18n.td('message.department-name', '부서명');
                this.message['close'] = this.$i18n.td('button.close', '닫기');
            },
            getGridHeader() {
                let newHeaders = [
                    {text: this.message['username'] + '(' + this.$i18n.td('user.id', '아이디') + ')', align: 'center', sortable: false, value: 'fullName'},
                    {text: this.message['company'], align: 'center', sortable: false},
                    {text: this.message['department-name'], align: 'center', sortable: false, value: 'department'},
                    {text: this.message['e-mail'], align: 'center', sortable: false, value: 'email'}
                ];

                this.userSearchHeaders = newHeaders;
            }
        }
    };
</script>


<style>

</style>
