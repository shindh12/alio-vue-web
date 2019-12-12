<template>
    <div v-bind:class="{ asc: direction === 'asc', desc: direction === 'desc', selected: selected }">
    </div>
</template>

<script>
    export default {
        props: ['direction', 'selected']
    };
</script>

<style scoped>
    div {
        display: inline-block;
        width: 18px;
        height: 18px;
        background-image: url("~@/assets/images/ico-sort-normal-down.svg");
        cursor: pointer;
    }

    div.asc.selected {
        background-image: url("~@/assets/images/ico-sort-selected-down.svg");
    }

    div.desc.selected {
        background-image: url("~@/assets/images/ico-sort-selected-up.svg");
    }

</style>
