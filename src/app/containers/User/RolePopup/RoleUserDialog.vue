<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" scrollable max-width="450px" max-height="530px" id="role-user-dialog-popup-dialog">
            <v-card id="role-user-dialog-popup">
                <v-card-title>
                    <span class="headline"> {{td.message.role}}-{{td.message.user}} {{td.message.assign}} ( {{ title }} ) </span>
                </v-card-title>

                <!-- [SEARCH] Search area -->
                <div class="page-searchbox page-searchbox--col1">
                    <!-- [SEARCH] Search items -->
                    <div class="page-searchbox__item-cell">
                        <v-text-field name="searchText" :label="td.message.user" v-model.trim="searchText"
                                      :placeholder="td.message.login+'ID/'+td.menuUser.name" @keyup.13="searchRoleUser" maxlength="30"></v-text-field>
                    </div>
                </div>
                <!-- [SEARCH] button -->
                <div class="page-searchbox-action">
                    <v-btn @click.native="searchRoleUser()">{{ td.button.search }}</v-btn>
                </div>

                <!--Grid Area in Group-User Dialog-->
                <v-card-text>
                    <!-- [TABLE] ㅇㅇ area -->
                    <div class="table-area">
                        <!-- [TABLE] 본체 -->
                        <div class="table__body">
                            <v-data-table
                                :headers="headers"
                                :items="roleUserList"
                                v-model="selectedUser"
                                :loading="loading" item-key="userId"
                                select-all hide-actions>
                                <template slot="items" slot-scope="props">
                                    <td>
                                        <v-checkbox primary hide-details v-model="props.selected" :key="props.item.userId"></v-checkbox>
                                    </td>
                                    <td class="text-xs-left">{{ props.item.login }}</td>
                                    <td class="text-xs-left">{{ props.item.fullName }}</td>
                                </template>
                            </v-data-table>
                        </div>
                        <!-- [TABLE] 본체 끝-->
                    </div>

                </v-card-text>

                <!-- Cancel, Save Button in Group-Role Dialog -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="closeDialog">{{ td.button.cancel }}</v-btn>
                    <v-btn primary v-if="menuAuth.update" @click.native="saveRoleUser">{{ td.button.save }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'RoleUserDialog',
        props: [
            'showDialog', 'targetRole'

        ],
        data() {
            return {
                searchText: '',
                headers: [
                    {text: this.$i18n.td('user.id', '아이디'), align: 'center', sortable: false, value: 'login'},
                    {text: this.$i18n.td('message.username', '성명'), align: 'center', sortable: false, value: 'fullName'},
                ],
                loading: true,
                selectedUser: [],
                updatedRoleUser: {
                    userName: '',
                    mappingOkUserId: [],
                },
                roleUserList: [],
                url: {
                    searchRoleUser: '/rest/v1/role/{{id}}/user',
                    updateRoleUser: '/rest/v1/role/{{id}}/user/update'
                },
                td: {
                    button: {
                        save: this.$i18n.td('button.save', '저장'),
                        search: this.$i18n.td('button.search', '조회'),
                        cancel: this.$i18n.td('button.cancel', '취소'),
                    },
                    message: {
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.'),
                        role: this.$i18n.td('message.role', '역할'),
                        user: this.$i18n.td('message.user', '사용자'),
                        assign: this.$i18n.td('message.assign', '할당'),
                        login: this.$i18n.td('system.login', '로그인'),
                    },
                    menuUser: {
                        name: this.$i18n.td('message.username', '성명')
                    },
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
            };
        },
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.searchRoleUser();
                } else if (status === false) {
                    setTimeout(() => {
                        this.selectedUser = [];
                        this.roleUserList = [];
                        this.searchText = '';
                    }, 300);
                }
            },
        },
        computed: {
            title() {
                if (this.showDialog === true) {
                    return this.targetRole.roleName;
                } else {
                    return '';
                }
            }
        },
        methods: {
            searchRoleUser() {
                this.loading = true;
                let url = this.url.searchRoleUser;
                url = url.replace('{{id}}', this.targetRole.roleId);
                axios.get(url, {
                    params: {
                        searchText: this.searchText,
                        systemKey: this.$store.state.loginStore.systemKey
                    }
                }).then(response => {
                    let content = response.data;
                    this.roleUserList = content;
                    for (let i in content) {
                        if (content[i].mappingYn === 'Y') {
                            this.selectedUser.push(content[i]);
                        }
                    }
                });
                this.loading = false;
            },
            saveRoleUser() {
                this.loading = true;
                let url = this.url.updateRoleUser;
                url = url.replace('{{id}}', this.targetRole.roleId);

                this.updatedRoleUser.userName = '';
                this.updatedRoleUser.mappingOkUserId = [];
                this.selectedUser = this.removeDuplicatesUserId(this.selectedUser);

                for (let i in this.selectedUser) {
                    this.updatedRoleUser.mappingOkUserId.push(this.selectedUser[i].userId);
                }

                axios.post(url, this.updatedRoleUser)
                .then(() => {
                    this.$notify({
                        title: `${this.td.button.save}`,
                        text: this.td.message.saved,
                        type: 'success'
                    });
                    this.closeDialog();
                })
                .catch(error => {
                    this.$notify({
                        title: `${this.td.button.save}`,
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
            },
        }
    };
</script>

<style scoped>
    #app #role-user-dialog-popup { /* page prefix */
    }

    #app #role-user-dialog-popup .page-searchbox {
        margin-top: 20px;
    }

    #app #role-user-dialog-popup .card__text {
        height: 320px;
    }
</style>

<style>

</style>
