<template>
    <div>
        <v-dialog :value="showDialog" @input="closeDialog" max-width="400px">
            <v-card>
                <!-- Title Area -->
                <v-card-title>
                    <span class="headline"> {{ title }} </span>
                </v-card-title>

                <!-- Grid Area -->
                <v-card-text>
                    <!-- [SEARCH] Search area -->
                    <div class="page-searchbox page-searchbox--col1">
                        <div class="page-searchbox__item-cell">
                            <v-text-field :label="$td('message.role-name', '역할명')" v-model.trim="searchText" @keyup.enter="searchRole" @keyup.esc="closeDialog"
                                          maxlength="50"></v-text-field>
                        </div>
                    </div>
                    <!-- [SEARCH] button -->
                    <div class="page-searchbox-action">
                        <v-btn primary @click.native="searchRole()">{{$td('button.search', '조회')}}</v-btn>
                    </div>

                    <div class="table-area">
                        <div class="table__body">
                            <v-data-table
                                select-all hide-actions :loading="loading"
                                :headers="headers" :items="roleList" v-model="selectedRole" item-key="roleId">
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
                    <v-btn @click.native="emitRole">{{ $td('button.save', '저장') }}</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'RolePicker',
        props: [
            'title',
            'showDialog',
            'exceptRoleList',
        ],
        data() {
            return {
                searchText: '',
                headers: [
                    {text: '역할명', align: 'center', sortable: false, value: 'roleName'},
                ],
                loading: true,
                selectedRole: [],
                roleList: [],
                url: {
                    searchRole: '/rest/v1/role',
                    updateGroupRole: '/rest/v1/group/{{id}}/role/update',
                },
            };
        },
        computed: {},
        watch: {
            showDialog(status) {
                if (status === true) {
                    this.searchRole();
                } else if (status === false) {
                    setTimeout(() => {
                        this.selectedRole = [];
                        this.searchRoleName = '';
                    }, 300);
                }
            },
        },
        methods: {
            searchRole() {
                this.roleList = [];
                let url = this.url.searchRole;

                console.log('exceptRoleList');
                console.log(this.exceptRoleList);

                axios.get(url, {
                    params: {
                        page: 0,
                        size: 2000,
                        searchText: this.searchText,
                        searchSystemKey: this.$store.state.loginStore.systemKey,
                    }
                }).then(response => {
                    let content = response.data.content;
                    this.loading = false;
                    for (let i = 0; i < content.length; i++) {
                        let b = true;
                        if (this.exceptRoleList != undefined) {
                            for (let j = 0; j < this.exceptRoleList.length; j++) {
                                if (content[i].roleId == this.exceptRoleList[j].roleId) {
                                    b = false;
                                }
                            }
                        }
                        if (b) {
                            this.roleList.push(content[i]);
                        }
                    }
                });
            },
            emitRole() {
                this.searchText = '';
                this.$emit('selectedRole', this.selectedRole);
            },
            closeDialog() {
                this.searchText = '';
                this.$emit('closeDialog');
            },
        }
    };
</script>

<style scoped>
    .table-area {
        margin-top: 10px;
    }
</style>
