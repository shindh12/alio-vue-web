<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" scrollable max-width="450px">
            <v-card id="group-user-dialog-popup">
                <!-- Title Area -->
                <v-card-title>
                    <span class="headline"> {{`${td.message.group} - ${td.message.user} ${td.message.assign} ( ${title} )` }} </span>
                </v-card-title>

                <!-- [SEARCH] Search area -->
                <div class="page-searchbox page-searchbox--col1">
                    <!-- [SEARCH] Search items -->
                    <div class="page-searchbox__item-cell">
                        <v-text-field name="searchText" :label="td.message.user" v-model.trim="searchText" @keyup.enter="searchGroupUser"
                                      :placeholder="td.system.login+'ID/'+td.menuUser.name" maxlength="30"></v-text-field>
                    </div>
                </div>
                <!-- [SEARCH] button -->
                <div class="page-searchbox-action">
                    <v-btn @click.native="searchGroupUser()">{{td.button.search}}</v-btn>
                </div>

                <!--Grid Area in Group-User Dialog-->
                <v-card-text>
                    <!-- [TABLE] ㅇㅇ area -->
                    <div class="table-area">
                        <!-- [TABLE] 본체 -->
                        <div class="table__body">
                            <v-data-table select-all hide-actions
                                          :headers="td.headers" :items="groupUserList"
                                          :loading="loading" item-key="userId" v-model="selectedUser">
                                <template slot="items" slot-scope="props">
                                    <td>
                                        <v-checkbox primary hide-details v-model="props.selected" :key="props.item.userId"></v-checkbox>
                                    </td>
                                    <td class="text-xs-left">{{ props.item.login }}</td>
                                    <td class="text-xs-left">{{ props.item.fullName }}</td>
                                </template>
                            </v-data-table>
                        </div>
                    </div>

                </v-card-text>

                <!-- Cancel, Save Button in Group-Role Dialog -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeDialog">{{ td.button.cancel }}</v-btn>
                    <v-btn primary @click.native="saveGroupUser" v-if="menuAuth.update">{{ td.button.save }}</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </div>

</template>

<script>
    import axios from 'axios';

    export default {
        name: 'GroupUserDialog',
        props: ['showDialog', 'targetGroup'],
        data() {
            return {
                searchText: '',
                td: {
                    message: {
                        group: this.$i18n.td('message.group', '그룹'),
                        user: this.$i18n.td('message.user', '사용자'),
                        assign: this.$i18n.td('message.assign', '할당'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.')
                    },
                    menuUser: {
                        name: this.$i18n.td('message.username', '성명'),
                    },
                    system: {
                        login: this.$i18n.td('system.login', '로그인')
                    },
                    button: {
                        search: this.$i18n.td('button.search', '조회'),
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장'),
                    },
                    headers: [
                        {text: this.$i18n.td('user.id', '아이디'), align: 'center', sortable: false, value: 'login'},
                        {text: this.$i18n.td('message.username', '성명'), align: 'center', sortable: false, value: 'fullName'},
                    ],
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
                loading: true,
                selectedUser: [],
                groupUserList: [],
                url: {
                    searchGroupUser: '/rest/v1/group/{{id}}/user',
                    updateGroupUser: '/rest/v1/group/{{id}}/user/update'
                },
                updatedGroupUser: {
                    userName: '',
                    mappingOkUserId: [],
                },
            };
        },
        computed: {
            title() {
                if (this.showDialog === true) {
                    return this.targetGroup.groupName;
                } else {
                    return '';
                }
            }
        },
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.searchGroupUser();
                } else if (status === false) {
                    setTimeout(() => {
                        this.selectedUser = [];
                        this.groupUserList = [];
                        this.searchText = '';
                    }, 300);
                }
            },
        },
        methods: {
            searchGroupUser() {
                this.loading = true;
                let url = this.url.searchGroupUser;
                url = url.replace('{{id}}', this.targetGroup.groupId);
                axios.get(url, {
                    params: {
                        login: this.searchText,
                        userName: this.searchText,
                        systemKey: this.$store.state.loginStore.systemKey
                    }
                }).then(response => {
                    let content = response.data;
                    this.groupUserList = content;
                    for (let i in content) {
                        if (content[i].mappingYn === 'Y') {
                            this.selectedUser.push(content[i]);
                        }
                    }
                });
                this.loading = false;
            },
            saveGroupUser() {
                this.loading = true;
                let url = this.url.updateGroupUser;
                url = url.replace('{{id}}', this.targetGroup.groupId);

                this.updatedGroupUser.userName = '';
                this.updatedGroupUser.mappingOkUserId = [];
                this.selectedUser = this.removeDuplicatesUserId(this.selectedUser);

                for (let i in this.selectedUser) {
                    this.updatedGroupUser.mappingOkUserId.push(this.selectedUser[i].userId);
                }

                axios.post(url, this.updatedGroupUser)
                .then(() => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saved,
                        type: 'success'
                    });
                    this.closeDialog();
                })
                .catch(response => {
                    this.$notify({
                        title: this.td.button.save,
                        text: this.td.message.saveFailed,
                        type: 'error'
                    });
                });
                this.loading = false;
            },
            closeDialog() {
                this.$emit('closeDialog');
            },
            removeDuplicatesUserId(before) {
                let after = [];
                for (let i in before) {
                    if (after.length === 0) {
                        after.push(before[i]);
                    } else {
                        let duplicatesFlag = true;
                        for (let j in after) {
                            if (after[j].userId === before[i].userId) {
                                duplicatesFlag = false;
                                break;
                            }
                        }
                        if (duplicatesFlag) {
                            after.push(before[i]);
                        }
                    }
                }
                return after;
            }
        }
    };
</script>

<style scoped>
    #app #group-user-dialog-popup .page-searchbox {
        margin-top: 20px;
    }

    #app #group-user-dialog-popup .card__text {
        height: 320px;
    }
</style>
