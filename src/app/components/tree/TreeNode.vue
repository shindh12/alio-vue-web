<template>
    <div class="tree-node">
        <!-- 1. 위로 올라가는 node frame -->
        <!-- 1. 위로 올라가는 node frame END -->
        <!-- 2. 내 노드 본문 -->
        <div class="node" :class="classObject" @click.stop="onClickMenuName" :id="node.menuKey" :key="node.menuKey"
        >
            <div class="nodeFrame before-node-frame" v-if="!node.isRoot && node.rankNo == 1" :id="node.menuKey" @dragover='dragOverUp' @dragleave='dragLeave'></div>

            <div class="node-body" :class="{'has-child':hasChildren}"
                 @dragstart='dragStart' @dragover='dragOver' @dragenter='dragEnter' @dragleave='dragLeave' @drop='drop' @dragend='dragEnd' draggable=true>
            <span class="arrow" :class="{'hide-icon':!hasChildren}" @click="onClickTreeIcon(node.menuKey)">
                <img class="img" v-if="node.isOpened" src="~@/assets/images/ico-tree-selected.svg" />
                <img class="img" v-else src="~@/assets/images/ico-tree-normal.svg" />
            </span>
                <span :id="node.menuKey" class="ellipsis">
                {{ node.defaultName }} : {{node.menuKey}}
            </span>
            </div>
            <div class="nodeFrame after-node-frame" v-if="!node.isRoot" :id="node.menuKey" @dragover='dragOverDown' @dragleave='dragLeave'></div>
        </div>
        <!-- 2. 내 노드 본문 END -->
        <!-- 3. 밑으로 떨어지는 node frame 일까? -->
        <!-- 3. 밑으로 떨어지는 node frame 일까? -->
        <div class="children" v-if="hasChildren" v-show="node.isOpened">
            <tree-node v-for="child in node.children" :node.sync="child" :key="child.menuKey" @clickTreeIcon="onClickTreeIcon" @clickNodeName="onClickNodeName"
                       @dropDragFrom="onDragFrom" @dropDragTo="onDragTo" @dropDragEnd="onDragEnd" :selectedId="selectedNodeId" :searchText="searchText">
            </tree-node>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'TreeNode',
        props: {
            node: {
                default: function () {
                    return {
                        defaultName: 'ROOT',
                        isOpened: false
                    };
                }
            },
            selectedId: '',
            searchText: ''
        },
        computed: {
            selectedNodeId() {
                return this.selectedId;
            },
            hasChildren() {
                if (!this.node) {
                    return false;
                }
                if (!this.node.children) {
                    return false;
                }
                return this.node.children.length > 0;
            },
            classObject() {
                return {
                    'active': this.selectedId === this.node.menuKey,
                    'selected': this.searchText != '' && this.node.defaultName.indexOf(this.searchText) >= 0
                };
            }
        },
        methods: {
            onClickTreeIcon(id) {
                this.$emit('clickTreeIcon', id);
            },
            onClickNodeName(menuKey) {
                console.log(menuKey);
                this.$emit('clickNodeName', menuKey);
            },
            onClickMenuName(e) {
                if (this.node != undefined) {
                    this.$emit('clickNodeName', this.node.menuKey);
                }
            },
            dragStart(e) {
                console.log(this.node.name);
                console.log('start! id:[' + this.node.menuKey + ']');
                this.$emit('dropDragFrom', this.node.menuKey);
                this.node.isOpened = false;
                return true;
            },
            dragEnd(e) {
                this.$emit('dropDragEnd', this.node.menuKey);
            },
            dragOver(e) {
                e.currentTarget.classList.add('hover');
                this.$emit('dropDragTo', e.target.id, 'child');
                return true;
            },
            dragOverUp(e) {
                e.currentTarget.classList.add('hover');
                this.$emit('dropDragTo', e.target.id, 'up');
                return true;
            },
            dragOverDown(e) {
                e.currentTarget.classList.add('hover');
                this.$emit('dropDragTo', e.target.id, 'down');
                return true;
            },

            dragEnter(e) {
                this.$emit('dropDragTo', e.target.id, 'child');
            },
            dragLeave(e) {
                e.currentTarget.classList.remove('hover');
            },
            drop(e) {
                e.currentTarget.classList.remove('hover');
            },
            onDragFrom(menuKey) {
                this.$emit('dropDragFrom', menuKey);
            },
            onDragTo(menuKey, code) {
                this.$emit('dropDragTo', menuKey, code);
            },
            onDragEnd() {
                this.$emit('dropDragEnd');
            },
        }
    };
</script>
<style lang="scss">
    @import "styles/color.scss";

    .tree-node {
        .node {
            cursor: pointer;
            height: 31px;
            line-height: 31px;
            min-width: 210px;
            display: inline-block;
            position: relative;

            &:hover {
                background: $col-prim-l5;
            }
        }

        /* .node-body {background:red;} */
        /* .nodeFrame {background:green;}
        .node-body + .nodeFrame {background:blue;} */
        /* .before-node-frame {background:red;}
        .after-node-frame {background:blue;} */

        .node-body {
            padding-right: 30px;
            padding-left: 20px;
        }

        .node-body.has-child {
            font-weight: bold;
        }

        .arrow {
            display: inline-block;
            width: 18px;
            height: 18px;
            cursor: pointer;
            position: absolute;
            left: 1px;
        }

        .img {
            margin: 0 0 2px 2px;
            width: 14px;
            height: 14px;
            vertical-align: middle;
        }

        .arrow.hide-icon {
            opacity: 0;
            cursor: inherit;
        }

        .nodeFrame {
            height: 5px;
            min-width: 180px;
            position: absolute;
            lefT: 0;
            right: 0;
            z-index: 1;
        }

        .before-node-frame {
            top: 0;
        }

        .after-node-frame {
            bottom: 0;
        }

        .nodeFrame.hover {
        }

        .before-node-frame.hover {
            border-top: 1px dashed #333;
        }

        .after-node-frame.hover {
            border-bottom: 1px dashed #333;
        }

        .hover {
            border: 1px dotted $col-grey;
            background: $col-prim-l5;
        }

        /*  */

        .disableDrag {
            background-color: gray;
        }


        .children {
            margin-left: 25px;
        }

        .active {
            color: #2C49BF;
            font-weight: bold;
        }

        .selected {
            color: #4C4911;
            font-weight: bold;
        }
    }
</style>
