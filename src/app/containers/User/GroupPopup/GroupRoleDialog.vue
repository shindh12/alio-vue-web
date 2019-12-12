<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" scrollable max-width="450px">
            <v-card id="group-role-dialog-popup">
                <!-- Title Area -->
                <v-card-title>
                    <span class="headline"> {{`${td.message.group} - ${td.message.role} ${td.message.assign} ( ${title} )`}} </span>
                </v-card-title>

                <!-- [SEARCH] Search area -->
                <div class="page-searchbox page-searchbox--col1">
                    <div class="page-searchbox__item-cell">
                        <v-text-field name="searchText" :label="td.message.roleName" v-model.trim="searchRoleName" @keyup.enter="searchGroupRole" maxlength="50"></v-text-field>
                    </div>
                </div>
                <!-- [SEARCH] button -->
                <div class="page-searchbox-action">
                    <v-btn @click.native="searchGroupRole()">{{td.button.search}}</v-btn>
                </div>

                <!-- Grid Area -->
                <v-card-text>
                    <!-- [TABLE] ㅇㅇ area -->
                    <div class="table-area">
                        <!-- [TABLE] 본체 -->
                        <div class="table__body">
                            <v-data-table select-all hide-actions
                                          :loading="loading" :headers="td.headers"
                                          :items="groupRoleList" v-model="selectedRole" item-key="roleId">
                                <template slot="items" slot-scope="props">
                                    <td>
                                        <v-checkbox primary hide-details v-model="props.selected" :key="props.item.roleId"></v-checkbox>
                                    </td>
                                    <td class="text-xs-left">{{ props.item.roleName }}</td>
                                </template>
                            </v-data-table>
                        </div>
                    </div>

                </v-card-text>
                <!-- Cancel, Save Button -->
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click.native="closeDialog">{{ $td('button.cancel', 'Cancel') }}</v-btn>
                    <v-btn primary @click.native="saveGroupRole" v-if="menuAuth.update">{{ $td('button.save', '저장') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'GroupRoleUpdateDialog',
        props: [
            'showDialog',
            'targetGroup',
        ],
        data() {
            return {
                searchRoleName: '',
                td: {
                    message: {
                        group: this.$i18n.td('message.group', '그룹'),
                        role: this.$i18n.td('message.role', '역할'),
                        roleName: this.$i18n.td('message.role-name', '역할명'),
                        assign: this.$i18n.td('message.assign', '할당'),
                        saved: this.$i18n.td('message.saved', '저장되었습니다.'),
                        saveFailed: this.$i18n.td('message.save-failed', '저장에 실패했습니다.')
                    },
                    button: {
                        search: this.$i18n.td('button.search', '조회'),
                        cancel: this.$i18n.td('button.cancel', '취소'),
                        save: this.$i18n.td('button.save', '저장'),
                    },
                    headers: [
                        {text: this.$i18n.td('message.role-name', '역할명'), align: 'center', sortable: false, value: 'roleName'},
                    ],
                },
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
                loading: true,
                selectedRole: [],
                groupRoleList: [],
                url: {
                    searchGroupRole: '/rest/v1/group/{{id}}/role',
                    updateGroupRole: '/rest/v1/group/{{id}}/role/update',
                },
                updateGroupRole: {
                    roleName: '',
                    mappingOkRoleId: []
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
                    this.searchGroupRole();
                } else if (status === false) {
                    setTimeout(() => {
                        this.selectedRole = [];
                        this.groupRoleList = [];
                        this.searchRoleName = '';
                    }, 300);
                }
            },
        },
        methods: {
            searchGroupRole() {
                let url = this.url.searchGroupRole;
                url = url.replace('{{id}}', this.targetGroup.groupId);
                axios.get(url, {
                    params: {
                        roleName: this.searchRoleName,
                        systemKey: this.$store.state.loginStore.systemKey
                    }
                }).then(response => {
                    let content = response.data;
                    this.groupRoleList = content;
                    this.loading = false;
                    for (let i in content) {
                        if (content[i].mappingYn === 'Y') {
                            this.selectedRole.push(content[i]);
                        }
                    }
                });
            },
            saveGroupRole() {
                let url = this.url.updateGroupRole;
                url = url.replace('{{id}}', this.targetGroup.groupId);

                this.updateGroupRole.roleName = this.searchRoleName;
                this.updateGroupRole.mappingOkRoleId = [];
                this.selectedRole = this.removeDuplicatesRoleId(this.selectedRole);

                for (let i in this.selectedRole) {
                    this.updateGroupRole.mappingOkRoleId.push(this.selectedRole[i].roleId);
                }

                axios.post(url, this.updateGroupRole)
                .then(() => {
                    this.loading = false;
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                    this.closeDialog();
                })
                .catch(response => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.error', '저장실패 하었습니다.'), type: 'error'});
                });
            },
            closeDialog() {
                this.$emit('closeDialog');
            },
            removeDuplicatesRoleId(before) {
                let after = [];
                for (let i in before) {
                    if (after.length === 0) {
                        after.push(before[i]);
                    } else {
                        let duplicatesFlag = true;
                        for (let j in after) {
                            if (after[j].roleId === before[i].roleId) {
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
    #app #group-role-dialog-popup .page-searchbox {
        margin-top: 20px;
    }

    #app #group-role-dialog-popup .card__text {
        height: 320px;
    }
</style>
