<template>
    <div id="">
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <!-- [SEARCH] Search items -->
            <div class="page-searchbox__item-cell">
                <v-text-field name="searchText" :label="$td('menu-menus.menu-name', '메뉴명')"
                              v-model.trim="searchText" @keyup.13="searchMenu()"
                              :hint="$td('menu-menus.menu-hint', '메뉴명으로 조회하실 수 있습니다.')" maxlength="100"></v-text-field>
            </div>
        </div>
        <!-- [SEARCH] button -->
        <div class="page-searchbox-action">
            <v-btn primary @click.native="searchMenu()">{{ $td('button.search', '조회') }}</v-btn>
        </div>

        <div class="page-content full-height">
            <div class="cont-half">
                <menu-tree :refreshTree.sync="refreshTree"
                           :searchSystemKey.sync="treeSystemKey"
                           :searchText.sync="treeMenuName"
                           :updatedMenuData.sync="updatedMenuData"
                           @clickNodeName="onClickNodeName" @adjustTree="onAdjustTree"></menu-tree>
            </div>
            <div class="cont-half">
                <menu-detail :refreshDetail.sync="refreshDetail"
                             :searchSystemKey.sync="treeSystemKey"
                             :searchMenuKey.sync="treeMenuKey"
                             @updateDetail="onUpdateDone" @deleteMenu="onDeleteMenu"></menu-detail>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import MenuTree from './MenuTree';
    import MenuDetail from './MenuDetail';

    export default {
        components: {
            MenuTree,
            MenuDetail,
        },
        data() {
            return {
                searchText: '',
                searchSystemKey: '',
                treeSystemKey: '',
                treeMenuName: '',
                treeMenuKey: '',
                updatedMenuData: {},
                systemSearchValues: [],
                refreshTree: false,
                refreshDetail: false,
            };
        },
        computed: {},
        watch: {},
        methods: {
            initSystemKeySelect() {
                const url = '/rest/v1/system';
                let that = this;
                axios.get(url).then(res => {
                    that.systemSearchValues = res.data;
                    that.searchSystemKey = that.systemSearchValues[0].systemKey;
                    that.treeSystemKey = that.searchSystemKey;
                });
            },
            searchMenu() {
                this.treeSystemKey = this.$store.state.loginStore.systemKey;
                this.treeMenuName = this.searchText;
                this.refreshTree = !this.refreshTree;
                this.treeMenuKey = '';
                this.updatedMenuData = {};
            },
            onClickNodeName(menuKey) {
                this.treeMenuKey = menuKey;
            },
            onUpdateDone(menuData) {
                this.updatedMenuData = menuData;
            },
            onDeleteMenu() {
                this.searchMenu();
            },
            onAdjustTree() {
                this.refreshDetail = !this.refreshDetail;
            }
        },

        mounted() {
            this.searchMenu();
        },
    };
</script>

<style scoped>
    #app-root .page-content.full-height {
        height: calc(100% - 174px);
    }

    #app-root .cont-half:first-child {
        width: 40%;
    }

    #app-root .cont-half:last-child {
        width: 60%;
    }
</style>
