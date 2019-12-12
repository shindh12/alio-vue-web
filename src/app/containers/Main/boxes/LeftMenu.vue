<template>
    <div id="left-menu">
        <div class="menu" @click.stop="onClickMenuName" :class="{'menu--selected':menu.menuUrl==$menu.currUrl}" v-ripple>
            <span class="menu__arrow" v-if="menu.children" @click.stop="onClickTreeIcon()">
                <img class="menu__arrow-img" v-if="!menu.isOpened" src="~@/assets/images/ico-tree-selected.svg" />
                <img class="menu__arrow-img" v-else src="~@/assets/images/ico-tree-normal.svg" />
            </span>
            <span class="blank" v-else></span>
            <span :id="menu.menuKey">  {{ $td(menu.messageGroup+'.'+menu.messageCode,menu.defaultName) }} </span>
        </div>
        <div class="children" v-if="menu.children" v-show="!menu.isOpened">
            <left-menu v-for="child in menu.children" :menu.sync="child" :key="child.menuKey"></left-menu>
        </div>

        <!-- [MODAL] Confirm Dialog Area -->
        <common-confirm
            :confirm-dialog="confirmDialog.showDialog"
            :title="confirmDialog.title"
            :message="confirmDialog.message"
            @agree="executeMovingFunction"
            @disagree="closeConfirmDialog"
        />
    </div>
</template>

<script>
    import CommonConfirm from '@/containers/Common/CommonConfirm';

    export default {
        name: 'LeftMenu',
        components: {
            CommonConfirm,
        },
        props: ['menu'],
        data() {
            return {
                confirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: '저장되지 않은 변경사항이 있습니다. 이동하시겠습니까?',
                },
            };
        },
        computed: {
            $menu: function () {
                return this.$store.state.menuStore;
            }
        },
        methods: {
            onClickTreeIcon: function () {
                if (this.menu.children) {
                    this.menu.isOpened = !this.menu.isOpened;
                }
            },
            onClickMenuName: function () {
                if (this.menu.children) { this.menu.isOpened = !this.menu.isOpened; }
                if (this.checkCurrentMenuDirty()) { return; }
                this.$router.push({path: this.menu.menuUrl});
            },
            checkCurrentMenuDirty() {
                if (this.$store.state.menuStore.currMenuDirty === true) {
                    this.openConfirmDialog();
                    return true;
                } else {
                    return false;
                }
            },
            openConfirmDialog() {
                this.confirmDialog.showDialog = true;
            },
            closeConfirmDialog() {
                this.confirmDialog.showDialog = false;
            },
            executeMovingFunction() {
                this.$store.dispatch('setCurrMenuDirty', false);
                this.onClickMenuName();
                this.closeConfirmDialog();
            },

        },

    };
</script>

<style scoped lang="scss">
    @import 'styles/color.scss';
    @import 'styles/util.scss';

    $col_active-menu: #3A43A6;
    $menu-height: 44px;

    #left-menu {
        width: 100%;
        line-height: $menu-height;
        font-size: 0;
        padding-left: 20px;

        .menu {
            @extend .unselectable;
            position: relative;
            margin-left: -20px;
            padding-left: 20px;

            height: $menu-height;
            width: calc(100% + 20px);
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            overflow: hidden;
            /* opacity:0.5; */
            &:hover {
                color: #FFF;
                background: $col-prim-l1;
            }

            /* .arrow {display: inline-block;width: 18px;height: 18px;cursor: pointer;} */
        }

        .menu--selected {
            color: $col_active-menu;
        }

        .menu__arrow {
            position: absolute;
            right: calc(100% - 20px);
            display: inline-block;
            height: 100%;
            width: 20px;
            text-align: center;
        }
    }


</style>
