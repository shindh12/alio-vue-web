<template>
    <div id="search-area">
        <single-slot v-if="thereIsSingleLabel" v-on:search="onSearch" v-on:reset="onReset">
            <slot></slot>
        </single-slot>
        <multi-slot v-if="!thereIsSingleLabel" v-on:search="onSearch" v-on:reset="onReset">
            <slot></slot>
        </multi-slot>
    </div>
</template>

<script>
    import SingleSlot from './SingleSlot';
    import MultiSlot from './MultiSlot';

    export default {
        components: {
            SingleSlot,
            MultiSlot
        },
        computed: {
            thereIsSingleLabel() {
                if (!this.$slots.default) {
                    return false;
                }
                if (this.$slots.default.length === 0) {
                    return false;
                }
                if (this.$slots.default[0].tag !== 'label') {
                    return false;
                }

                return true;
            }
        },
        methods: {
            onSearch() {
                this.$emit('search');
            },
            onReset() {
                this.$emit('reset');
            }
        }
    };
</script>

<style scoped>
    #search-area {
        width: 100%;
    }
</style>
