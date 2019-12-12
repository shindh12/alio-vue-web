<template>
    <div class="menu-tree">
        <div class="action-row--mini">
            <v-btn @click.native="openALL">{{$td('menu-menus.open-all', '전체열기')}}</v-btn>
            <v-btn @click.native="closeALL">{{$td('menu-menus.close-all', '전체닫기')}}</v-btn>
            <v-btn :disabled="selectedId=='' || !currentMenu.depth || currentMenu.depth > 3 " @click.native="addChild" v-if="menuAuth.create">{{$td('button.add', '추가')}}</v-btn>
        </div>

        <div class="tree-area">
            <div v-for="treeDataNode in treeData">
                <tree-node :node.sync="treeDataNode" :searchText="searchText" @clickTreeIcon="onClickTreeIcon" @clickNodeName="onClickNodeName"
                           @dropDragFrom="onDragFrom" @dropDragTo="onDragTo" @dropDragEnd="onDragEnd" :selectedId.sync="selectedId"></tree-node>
            </div>
        </div>
        <menu-add-popup :addDialog="addDialog" :menuData="newNode" @closeDialog="closeDialog" @saveDialog="saveDialog" />

        <!-- confirm for adding menu -->
        <common-confirm
            :confirm-dialog="confirmDialog"
            :title="'Confirm'"
            :message="confirmMessage"
            @agree="agree"
            @disagree="disagree">
        </common-confirm>

        <!-- Dirty check & confirm dialog -->
        <common-confirm
            :confirm-dialog="dirtyCheckConfirmDialog.showDialog"
            :title="dirtyCheckConfirmDialog.title"
            :message="dirtyCheckConfirmDialog.message"
            @agree="executeMovingFunction"
            @disagree="closeDirtyCheckConfirmDialog"
        />

    </div>
</template>

<script>
    import axios from 'axios';
    import TreeNode from '@/components/tree/TreeNode';
    import MenuAddPopup from '@/containers/User/Menu/MenuPopup/MenuAddPopup';
    import CommonConfirm from '@/containers/Common/CommonConfirm';
    import CommonDirtyChecker from '@/containers/Common/CommonDirtyChecker';

    export default {
        name: 'MenuTree',
        props: ['searchSystemKey', 'updatedMenuData', 'refreshTree', 'searchText'],
        components: {
            TreeNode,
            MenuAddPopup,
            CommonConfirm,
            CommonDirtyChecker,
        },
        data() {
            return {
                sourceId: 0,
                targetId: 0,
                moveCode: '',
                selectedId: '',
                currentMenu: {depth: 100},
                treeData: [],
                treeMap: {},
                addDialog: false,
                confirmDialog: false,
                confirmMessage: '',
                newNode: {},
                menuAuth: {
                    create: this.$store.state.menuStore.currMenu.aCreate === 'Y' ? true : false,
                    update: this.$store.state.menuStore.currMenu.aUpdate === 'Y' ? true : false,
                    delete: this.$store.state.menuStore.currMenu.aDelete === 'Y' ? true : false,
                },
                /* dirty check confirm dialog */
                dirtyCheckConfirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: this.$i18n.td('message.confirm-menu-moving', '작성중인 내용은 저장되지 않습니다. 이동하시겠습니까?'),
                    menuKey: '',
                },
            };
        },
        computed: {},
        watch: {
            refreshTree: function () {
                //console.log("refreshTree")
                this.searchMenu();
            },
            searchSystemKey: function () {
                this.searchMenu();
            },
            updatedMenuData: function () {
                if (this.updatedMenuData != undefined || this.updatedMenuData != null) {
                    let node = this.findNode(this.updatedMenuData.menuKey);
                    if (node != undefined || node != null) {
                        node.defaultName = this.updatedMenuData.defaultName;
                        node.menuUrl = this.updatedMenuData.menuUrl;
                        node.messageGroup = this.updatedMenuData.messageGroup;
                        node.messageCode = this.updatedMenuData.messageCode;
                        node.useYN = this.updatedMenuData.useYn;
                    }
                }
            }
        },

        methods: {
            addChild() {
                this.addDialog = true;
                let parentNode = this.findNode(this.selectedId);
                parentNode.isOpened = true;
                //console.log(parentNode)
                let rankNumber = 1;
                if (parentNode.children) {
                    rankNumber = parentNode.children.length + 1;
                }
                this.newNode = {
                    systemKey: this.searchSystemKey,
                    parentKey: parentNode.menuKey,
                    rankNo: rankNumber,
                    depth: this.currentMenu.depth + 1
                };
            },
            openALL() {
                this.openAction(this.treeData, true);
            },
            closeALL() {
                this.openAction(this.treeData, false);
            },
            openAction(inputData, openBool) {
                for (var i = 0; i < inputData.length; i++) {
                    inputData[i].isOpened = openBool;
                    if (inputData[i].children && inputData[i].children.length > 0) {
                        this.openAction(inputData[i].children, openBool);
                    }
                }
            },
            findNode(menuKey) {
                return this.treeMap[menuKey];
            },
            findParentNode(menuKey) {
                return this.findNode(this.findNode(menuKey).parentKey);
            },
            openSearchText() {
                this.openSearch(this.searchText, this.treeData);
            },
            openSearch(txt, inputData) {
                for (var i = 0; i < inputData.length; i++) {
                    if (inputData[i]['defaultName'].indexOf(txt) >= 0) {
                        let temp = inputData[i];
                        while (!temp.isRoot) {
                            temp = this.findNode(temp.parentKey);
                            temp.isOpened = true;
                        }
                    }
                    if (inputData[i].children && inputData[i].children.length > 0) {
                        this.openSearch(txt, inputData[i].children);
                    }
                }
            },
            onClickTreeIcon(menuKey) {
                let item = this.findNode(menuKey);
                if (item.isOpened) {
                    item.isOpened = !item.isOpened;
                } else {
                    item.isOpened = true;
                }

            },
            onClickNodeName(menuKey) {
                if (this.checkCurrentMenuDirty(menuKey) === true) { return; }
                this.selectedId = menuKey;
                this.currentMenu = this.findNode(menuKey);
                this.$emit('clickNodeName', menuKey);
            },
            onDragFrom(menuKey) {
                //console.log("onDragFrom id:["+menuKey+"]")
                this.sourceId = menuKey;
            },
            onDragTo(menuKey, code) {
                //console.log("inputed menyKey:["+menuKey+"],["+code+"]")
                this.moveCode = code;
                if (menuKey != '' || menuKey != undefined) {
                    this.targetId = menuKey;
                    //console.log("onDragTo id:["+this.targetId+"],["+code+"]")
                }
            },
            onDragEnd() {
                //init - validate
                if (this.targetId == this.sourceId ||
                    this.targetId == '' || this.targetId == undefined ||
                    this.sourceId == '' || this.sourceId == undefined ||
                    this.moveCode == '' || this.moveCode == undefined) {
                    return;
                }
                let source = this.findNode(this.sourceId);
                let target = this.findNode(this.targetId);
                if (source == null || source == undefined || target == null || target == undefined) {
                    return;
                }
                let sourceParent = this.findNode(source.parentKey);
                let targetParent = this.findNode(target.parentKey);
                if (sourceParent == null || sourceParent == undefined ||
                    targetParent == null || targetParent == undefined) {
                    return;
                }
                var message = '';
                if (this.moveCode == 'child') {
                    message = this.$i18n.td('menu-menus.sub-menu', '{0} 메뉴를 {1}의 하위메뉴로 추가하시겠습니까?', [source.defaultName, target.defaultName]);
                    if (target.depth && target.depth > 3) {
                        this.$notify({title: this.$i18n.td('button.save', '이동'), text: '3 Level이상의 메뉴를 추가할 수 없습니다.', type: 'warn'});
                        return;
                    }
                } else {
                    if (this.moveCode == 'up') {
                        message = this.$i18n.td('menu-menus.move', '{0} 메뉴를 {1}의 {2]로 이동하시겠습니까?', [source.defaultName, target.defaultName, '위']);
                    } else {
                        message = this.$i18n.td('menu-menus.move', '{0} 메뉴를 {1}의 {2]로 이동하시겠습니까?', [source.defaultName, target.defaultName, '아래']);
                    }
                }

                this.confirmMessage = message + ' ' + this.$i18n.td('menu-menus.move-save', '이동 후 저장됩니다.');
                this.confirmDialog = true;
            },
            agree() {
                this.confirmDialog = false;
                let source = this.findNode(this.sourceId);
                let target = this.findNode(this.targetId);
                let sourceParent = this.findNode(source.parentKey);
                let targetParent = this.findNode(target.parentKey);
                //remove node
                let r = this.removeItem(sourceParent.children, this.sourceId);
                this.adjustRankNo(sourceParent.children);
                if (r == 0 || r == undefined) {
                    sourceParent.children = null;
                    sourceParent.isLeaf = 'Y';
                    // menu update
                    let url = '/rest/v1/menu/update';
                    axios.post(url, sourceParent).then(res => {
                    }).catch(e => {
                        console.log(e);
                    });
                }

                //add to Child
                if (this.moveCode == 'child') {
                    if (target.children == null || target.children == undefined) {
                        target.children = new Array();
                    }
                    target.isLeaf = 'N';
                    source.parentKey = target.menuKey;
                    target.children.push(source);
                    this.adjustRankNo(target.children);
                    if (target.isOpened == false) {
                        target.isOpened = true;
                    }
                } else {
                    //move to up and down
                    source.parentKey = target.parentKey;
                    if (targetParent.children == null || targetParent.children == undefined) {
                        targetParent.children = new Array();
                        targetParent.isLeaf = 'N';
                    }
                    if (this.moveCode == 'up') {
                        this.insertBefore(targetParent.children, target.rankNo, source);
                    } else {
                        this.insertAfter(targetParent.children, target.rankNo, source);
                    }
                    this.adjustRankNo(targetParent.children);
                }
            },
            disagree() {
                this.confirmDialog = false;
            },
            info(nodeObj) {
                //console.log("["+nodeObj.rankNo+","+nodeObj.defaultName+":"+nodeObj.menuKey+"]parent:"+nodeObj.parentKey+",children:"+nodeObj.children)
            },
            removeItem(arr, menuKey) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i]['menuKey'] == menuKey) {
                        arr.splice(i, 1);
                        return arr.length;
                    }
                }
            },
            adjustRankNo(arr) {
                let requests = new Array();
                let url = '/rest/v1/menu/update';
                for (var i = 0; i < arr.length; i++) {
                    arr[i]['rankNo'] = i + 1;
                    requests.push(axios.post(url, arr[i]));
                }
                axios.all(requests).then(rest => {
                    this.$emit('adjustTree', this.menuData);
                }).catch(e => {
                    console.log(e);
                });
            },
            insertBefore(arr, index, nodeObj) {
                let temp = new Array();
                while (arr.length > 0) {
                    let tempNode = arr.pop();
                    temp.push(tempNode);
                    if (tempNode.rankNo == index) {
                        arr.push(nodeObj);
                        break;
                    }
                }
                while (temp.length > 0) {
                    arr.push(temp.pop());
                }
            },
            insertAfter(arr, index, nodeObj) {
                let temp = new Array();
                while (arr.length > 0) {
                    let tempNode = arr.pop();
                    if (tempNode.rankNo == index) {
                        arr.push(tempNode);
                        arr.push(nodeObj);
                        break;
                    }
                    temp.push(tempNode);
                }
                while (temp.length > 0) {
                    arr.push(temp.pop());
                }
            },

            /**
             * Data 조회
             **/
            searchMenu() {
                this.selectedId = '';
                if (this.searchSystemKey == '') {
                    return;
                }
                let SYSTEM_KEY = this.searchSystemKey;
                const url = '/rest/v1/menu/tree/' + SYSTEM_KEY;
                let that = this;
                axios.get(url).then(res => {
                    that.treeData = res.data;
                    buildMenuTree(that.treeData);
                    if (that.searchText != '') {
                        that.openSearchText();
                    }

                    function buildMenuTree(mlist) {
                        for (var i = 0, ii = mlist.length; i < ii; i++) {
                            var m = mlist[i];
                            that.treeMap[m.menuKey] = m;
                            if (Array.isArray(m.children)) {
                                buildMenuTree(m.children);
                            }
                        }
                    }
                });
            },
            closeDialog() {
                this.addDialog = false;
            },
            saveDialog(newMenuData) {
                this.addDialog = false;
                let newNode = Object.assign({}, newMenuData);
                newNode.depth = this.currentMenu.depth + 1;
                let parentNode = this.findNode(newNode.parentKey);
                let url = '/rest/v1/menu/create';
                axios.post(url, newNode).then(res => {
                    if (!parentNode.children) {
                        parentNode.children = new Array();
                    }
                    parentNode.children.push(newNode);
                    this.treeMap[newNode.menuKey] = newNode;
                    this.$notify({title: this.$i18n.td('button.save', '저장'), text: this.$i18n.td('message.saved', '저장되었습니다.'), type: 'success'});
                }).catch(e => {
                    console.log(e);
                });
            },
            /* dirty check */
            openDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = true;
            },
            closeDirtyCheckConfirmDialog() {
                this.dirtyCheckConfirmDialog.showDialog = false;
            },
            checkCurrentMenuDirty(menuKey) {
                if (this.$store.state.menuStore.currMenuDirty === true) {
                    this.dirtyCheckConfirmDialog.menuKey = menuKey;
                    this.openDirtyCheckConfirmDialog();
                    return true;
                } else {
                    return false;
                }
            },
            executeMovingFunction() {
                this.$store.dispatch('setCurrMenuDirty', false);
                this.onClickNodeName(this.dirtyCheckConfirmDialog.menuKey);
                this.closeDirtyCheckConfirmDialog();
            },

        },
        mounted() {
            this.searchMenu();
        },
    };
</script>

<style scoped lang="scss">
    @import "styles/color.scss";

    .menu-tree {
        height: calc(100% - 10px);

        .action-row--mini {
            margin-bottom: 10px;
        }

        .tree-area {
            height: calc(100% - 32px);
            border-top: 1px solid $col-grey-l1;
            padding: 10px;
            position: relative;
            overflow: auto;
            margin-right: -10px;
        }
    }

</style>
