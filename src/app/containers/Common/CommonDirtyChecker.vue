<template>
</template>

<script>
    export default {
        name: 'CommonDirtyChecker',
        props: {
            beforeTargetObject: {
                type: Object,
                default: () => {},
            },
            currentTargetObject: {
                type: Object,
                default: () => {},
            },
            beforeTargetArray: {
                type: Array,
                default: () => [],
            },
            currentTargetArray: {
                type: Array,
                default: () => [],
            }
        },
        computed: {
            isDirty() {
                return !(_.isEqual(this.beforeTargetArray, this.currentTargetArray) && _.isEqual(this.beforeTargetObject, this.currentTargetObject));
            }
        },
        watch: {
            isDirty() {
                this.setCurrMenuDirty();
            }
        },
        methods: {
            setCurrMenuDirty() {
                this.$store.dispatch('setCurrMenuDirty', this.isDirty);
            }
        }
    };


</script>

<style scoped>
</style>
