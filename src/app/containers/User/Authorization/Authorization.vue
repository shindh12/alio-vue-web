<template>
    <div class="isdp-body-content">
        <!-- [TITLE] Title area -->
        <page-title />


        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col3">
            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__item-cell">
                <v-select :items="roleValues" label="Role"
                          item-text="roleName" item-value="roleId" v-model="searchRoleId"></v-select>
            </div>
            <!-- [SEARCH] button -->
            <div class="page-searchbox__btn-cell">
                <v-btn @click.native="searchMenu()">Search</v-btn>
            </div>
        </div>


        <div>
            <v-btn small color="primary" class="mb-2" @click.native="save">저장</v-btn>
        </div>
        <div class="tree-content">
            <div class="tree-header">
                <div class="tree-head-info">{{$td('menu-menus.menu-name', '메뉴명')}}</div>
                <div class="tree-head-checker">
                    <div class="tree-head-role">권한</div>
                    <div class="tree-head-ck">읽기</div>
                    <div class="tree-head-ck">쓰기</div>
                    <div class="tree-head-ck">수정</div>
                    <div class="tree-head-ck">삭제</div>
                </div>
            </div>
            <div v-for="tobj of treeData">
                <tree-obj :data='tobj'></tree-obj>
            </div>
            <div class="empty-tree" v-if="!treeData || treeData.length === 0">
                "Empty!!", "Data!!"
            </div>
        </div>
    </div>
</template>

<script>

    import axios from 'axios';
    //import CommonContentTitle from '@/containers/Common/CommonContentTitle'
    import treeObj from './AuthTree';

    export default {
        components: {
            //CommonContentTitle,
            'tree-obj': treeObj
        },
        data() {
            return {
                title: '권한관리',
                path: '사용자/메뉴',
                menu: '권한관리',
                searchText: '',
                searchRoleId: 1,
                roleValues: [],
                treeData: [],
                saveData: []
            };
        },
        computed: {},
        watch: {},
        methods: {
            initRoleSelect() {
                let url = '/rest/v1/role/system/' + this.$store.state.loginStore.systemKey;
                let that = this;
                axios.get(url).then(res => {
                    that.roleValues = res.data;
                    that.searchRoleId = that.roleValues[0].roleId;
                    that.searchMenu();
                });
            },
            searchMenu() {
                this.treeData = [];
                let url = '/rest/v1/auth/' + this.$store.state.loginStore.systemKey + '/role/' + this.searchRoleId;
                let that = this;
                axios.get(url).then(res => {
                    console.log(res.data);
                    var rtnArr = [];
                    convertTree(res.data[0]);
                    that.treeData = res.data;

                    function convertTree(td) {
                        td.updateYn = 'N';
                        if (!td.children) {
                            return;
                        }
                        for (var i = 0, ii = td.children.length; i < ii; i++) {
                            td.children[i].parent = td;
                            convertTree(td.children[i]);
                        }
                    }
                });
            },
            save() {
                var rtnArr = [];
                var requests = [];
                convertResult(this.treeData[0], this.searchRoleId);
                console.log(rtnArr);
                let updateUrl = '/rest/v1/auth/update';
                for (let i = 0; i < rtnArr.length; i++) {
                    requests.push(axios.post(updateUrl, rtnArr[i]));
                }
                axios.all(requests).then(rest => {
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                }).catch(e => {
                    console.log(e);
                });

                function nvl(obj) {
                    if (obj == null) {
                        return 'N';
                    } else {
                        return obj;
                    }
                }

                function convertResult(td, roleId) {
                    if (td.updateYn == 'Y') {
                        rtnArr.push({
                            systemKey: td.systemKey,
                            menuKey: td.menuKey,
                            roleId: roleId,
                            aRead: nvl(td.aRead),
                            aCreate: nvl(td.aCreate),
                            aUpdate: nvl(td.aUpdate),
                            aDelete: nvl(td.aDelete),
                        });
                    }
                    if (!td.children) {
                        return;
                    }
                    for (var i = 0, ii = td.children.length; i < ii; i++) {
                        td.children[i].parent = td;
                        convertResult(td.children[i], roleId);
                    }
                }
            }
        },
        mounted() {
            this.initRoleSelect();
        },
    };
</script>

<style scoped>
    /* search area*/
    .search-area {
        padding: 8px 20px;
        position: relative;
        height: 80px;
        overflow: visible;
        margin: 16px 0;
    }

    .area-items > .input-group {
        float: left;
        width: 250px;
    }

    .area-items > .input-group + .input-group {
        margin-left: 20px;
    }

    .area-action {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        padding-right: 15px;
        line-height: 80px;
    }

    /* content area */
    .content-area {
        position: relative;
        height: calc(100% - 142px);
    }

    /* 상자, 하양, 그림자 */
    .search-area {
        background: #FFF;
        box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
    }

    .tree-header {
        width: 650px;
        height: 60px;
        position: relative;
        border-top: 1px solid #CCC;
        margin-top: 20px;
    }

    .tree-content {
        width: 650px;
    }

    .tree-head-info {
        height: 60px;
        line-height: 60px;
        padding-left: 10px;
    }

    .tree-head-checker {
        width: 350px;
        height: 60px;
        padding-left: 10px;
        position: absolute;
        top: 0;
        right: 0;
        font-size: 0px;
    }

    .tree-head-role {
        height: 30px;
        line-height: 30px;
        font-size: 1rem;
        display: block;
        color: #333;
    }

    .tree-head-ck {
        width: 50px;
        height: 30px;
        line-height: 30px;
        display: inline-block;
        font-size: 0.9rem;
        color: #888;
    }

    .empty-tree {
        text-align: center;
        padding: 20px;
        font-size: 24px;
        border-top: 1px solid #AAA;
        border-bottom: 1px solid #AAA;
    }


</style>
