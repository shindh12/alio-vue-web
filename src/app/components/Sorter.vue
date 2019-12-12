<template>
  <span>
    <sort-icon class="icon" v-bind:direction="direction" v-bind:selected="selected" v-on:click.native="emitSort"></sort-icon>
    <slot></slot>
  </span>
</template>

<script>
    import SortIcon from '@/components/icons/SortIcon';

    export default {
        components: {
            SortIcon
        },
        props: ['sort', 'field'],
        computed: {
            direction() {
                return this.sort && this.sort.direction;
            },
            selected() {
                return this.sort && this.sort.field === this.field;
            }
        },
        methods: {
            emitSort() {
                if (this.field !== this.sort.field) {
                    this.$emit('sort', {field: this.field, direction: 'desc'});
                } else {
                    const direction = this.direction === 'desc' ? 'asc' : 'desc';
                    this.$emit('sort', {field: this.field, direction});
                }
            }
        }
    };
</script>

<style scoped>
    span {
        position: relative;
    }

    span > .icon {
        position: absolute;
        left: -25px;
    }

</style>
