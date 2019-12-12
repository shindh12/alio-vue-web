<template>
    <div>
        <!-- 수신인 검색 START-->
        <v-dialog :value="isUserSearchDialog" @input="closeUserSearchDialog" max-width="450px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ message['user-list'] }}</span>
                </v-card-title>
                <v-card-text>
                    <div class="aprv__content" style="overflow-y:auto; max-height:400px;">
                        <!-- [TABLE] 본체 -->
                        <div class="table__body fixed-layout">
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
                                    <tr v-clickable>
                                        <td class="text-xs-left" @click="addRecipient(props.item)"> {{ props.item.fullName }}({{ props.item.login }})</td>
                                        <td class="text-xs-left" @click="addRecipient(props.item)">{{ props.item.email }}</td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>
                    </div>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeUserSearchDialog">{{ message['close'] }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
    <!-- 수신인 검색 END-->
</template>

<script>


    export default {
        props: ['isUserSearchDialog', 'searchText', 'recipientList', 'users'],
        data() {
            return {
                blockerFlag: {},
                isUserCheck: false,
                selected: [],
                userSearchHeaders: [],
                message: {
                    'registered-user': '',
                    'username': '',
                    'e-mail': '',
                    'user-list': '',
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

                if (this.blockerFlag.searchUser) {return;}
                this.blockerFlag.searchUser = true;
                //console.log(">>> ",this.blockerFlag, new Date().getSeconds() + "." + new Date().getMilliseconds());
                setTimeout(() => {
                    //console.log("<<< ",this.blockerFlag, new Date().getSeconds() + "." + new Date().getMilliseconds());
                    this.blockerFlag.searchUser = false;
                }, 1000);

                this.totalItems += 1;
                for (var i = 0; i < this.recipientList.length; i++) {
                    if (this.recipientList[i]['userId'] == item.userId) {
                        this.$notify('[' + item.cn + '(' + item.userid + ')] ' + this.message['registered-user']);
                        return false;
                    }
                }
                this.$emit('addInternalRecipient', item);
                this.closeUserSearchDialog();
            },
            closeUserSearchDialog() {
                this.$emit('closeInternalUserSearchDialog');
            },
            messageLoad() {
                this.message['registered-user'] = this.$i18n.td('menu-mail.registered-user', '이미 수신인에 등록되어 있습니다.');
                this.message['username'] = this.$i18n.td('message.username', '성명');
                this.message['e-mail'] = this.$i18n.td('user.e-mail', '이메일');
                this.message['user-list'] = this.$i18n.td('message.user-list', '사용자 목록');
                this.message['close'] = this.$i18n.td('button.close', '닫기');
            },
            getGridHeader() {
                let newHeaders = [
                    {text: this.message['username'] + '(' + this.$i18n.td('user.id', '아이디') + ')', align: 'center', sortable: false, value: 'fullName', width: '40%'},
                    {text: this.message['e-mail'], align: 'center', sortable: false, value: 'email', width: '60%'}
                ];

                this.userSearchHeaders = newHeaders;
            }
        }
    };
</script>


<style>

</style>
