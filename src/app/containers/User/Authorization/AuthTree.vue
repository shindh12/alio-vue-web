<template>
    <div class="tree-comp">
        <div class="my-data" :class="{'clickable':!isLeaf }" :style="{'padding-left':calcPadding}" @click.stop="toggleChild()">
            <!-- <v-icon>{{currIcon}}</v-icon> -->

            <div class="node-label">
                <span v-if="!isLeaf" class="node-arrow">
                    <img v-if="showChild" src="~@/assets/images/ico-tree-selected.svg" />
                    <img v-else src="~@/assets/images/ico-tree-normal.svg" />
                </span>
                {{tdata.defaultName || (tdata.messageGroup + tdata.messageCode)}}
            </div>
            <div class="checker-box" @click.stop>
                <div>
                    <v-checkbox @change="clkCallback('aRead')" v-model="tdata.aRead" true-value='Y' false-value='N'></v-checkbox>
                </div>
                <div>
                    <v-checkbox @change="clkCallback('aCreate')" v-model="tdata.aCreate" true-value='Y' false-value='N'></v-checkbox>
                </div>
                <div>
                    <v-checkbox @change="clkCallback('aUpdate')" v-model="tdata.aUpdate" true-value='Y' false-value='N'></v-checkbox>
                </div>
                <div>
                    <v-checkbox @change="clkCallback('aDelete')" v-model="tdata.aDelete" true-value='Y' false-value='N'></v-checkbox>
                </div>
            </div>
        </div>
        <div class="child-area" v-if="showChild">
            <div class="child-iterator" v-for="ch of tdata.children">
                <tree-obj :data="ch"></tree-obj>
            </div>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'tree-obj',
        props: {
            'data': {type: Object, required: true},
            'paddingUnit': {default: 20},
            'rootOffset': {default: 1},
            'initPadding': {default: 10},
            'iconOpened': {default: 'remove_circle_outline'},
            'iconClosed': {default: 'add_circle_outline'},
            'iconLeaf': {default: 'panorama_fish_eye'},
        },
        data: function () {
            return {
                tdata: this.data,
                showChild: false,
                isLeaf: (this.data.isLeaf && this.data.isLeaf === 'Y'),
            };
        },
        computed: {
            calcPadding: function () {
                let me = this;
                return (me.initPadding + me.paddingUnit * (me.data.depth - me.rootOffset)) + 'px';
            },
            currIcon: function () {
                if (this.isLeaf) {
                    return this.iconLeaf;
                }
                return this.showChild ? this.iconOpened : this.iconClosed;
            }
        },
        methods: {
            clkCallback: function (colname) {
                this.tdata.updateYn = 'Y';
                var me = this.tdata;
                var p = me.parent;
                if (me[colname] == 'Y') {
                    if (colname == 'aRead') {
                        // 1. to the root
                        while (p) {
                            console.log(' ^ ', p.defaultName);
                            p[colname] = me[colname];
                            p.updateYn = 'Y';
                            p = p.parent;
                        }
                    } else {
                        me['aRead'] = 'Y';
                        this.clkCallback('aRead');
                    }
                } else {
                    if (colname == 'aRead') {
                        me['aCreate'] = me['aUpdate'] = me['aDelete'] = 'N';
                    }
                }

            },
            toggleChild: function () {
                if (this.isLeaf) {
                    return;
                }
                this.showChild = !this.showChild;
            }
        }
    };
</script>

<style scoped>
    .tree-comp {
        width: 100%;
        position: relative;
    }

    .tree-comp .my-data {
        height: 32px;
    }

    .tree-comp .my-data .node-label {
        width: calc(100% - 281px);
        padding: 0 10px;
        line-height: 32px;
        position: relative;
    }

    .tree-comp .my-data .node-arrow {
        position: absolute;
        left: -5px;
        top: 0;
        bottom: 0;
        vertical-align: middle;
    }

    .tree-comp .my-data .node-arrow img {
        height: 14px;
        width: 14px;
        margin: 8px 0 10px;
    }


    .tree-comp .my-data .checker-box {
        position: absolute;
        top: 0;
        right: 0;
        height: 32px;
        font-size: 0;
    }

    .tree-comp .my-data .checker-box > div {
        width: 70px;
        display: inline-block;
        height: 32px;
        line-height: 32px;
        text-align: center;
    }

    .tree-comp .my-data .checker-box > div .checkbox {
        display: inline-block;
        width: auto;
    }

    .tree-comp .my-data .checker-box > div .checkbox .input-group__details {
        display: none;
    }

    /* .tree-comp .my-data{border-top:1px solid #aaa;border-bottom:1px solid #aaa;
        line-height:40px;margin-bottom:-1px;position:relative;}
    .tree-comp .my-data:hover{background:#c1d7ee;}
    .tree-comp .my-data .icon.material-icons {display:inline-block;width:24px;}
    .tree-comp .my-data .checker-box {position:absolute;top:0;right:0;width:350px;height:40px;font-size:0;}
    .tree-comp .my-data .checker-box > div {width:70px;display:inline-block;line-height:40px;}
    .tree-comp .my-data .checker-box > div .checkbox{height:33px;}
     */
    .tree-comp .child-area {
    }
</style>

<style>
    .tree-comp .my-data .checker-box > div .checkbox.input-group--active i.icon {
        color: #3A43A6;
    }
</style>
