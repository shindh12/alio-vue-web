<template>
    <div id="tree-view">
        <div class="tree-area">
            <tree-node :node="treeData" @clickTreeIcon="onClickTreeIcon" @clickTreeName="onClickTreeName" :selectedId="selectedNodeId"></tree-node>
        </div>
    </div>
</template>

<script>
    import TreeNode from '@/components/tree/TreeNode';

    export default {
        components: {
            TreeNode
        },
        props: ['treeData', 'selectedId'],
        data() {
            return {};
        },
        computed: {
            selectedNodeId() {
                return this.selectedId;
            }
        },
        methods: {
            onClickTreeIcon(val) {
                this.$emit('clickTreeIcon', val);
            },
            onClickTreeName(val) {
                this.$emit('clickTreeName', val);
            }
        }
    };
</script>

<style>

</style>
