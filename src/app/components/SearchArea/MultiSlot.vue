<template>
    <div>
        <div id="search-conditions">
            <slot></slot>
        </div>
        <div id="search-buttons">
            <basic-button v-on:click.native="$emit('reset')">Reset</basic-button>
            <primary-solid-button v-on:click.native="$emit('search')">Search</primary-solid-button>
        </div>
    </div>
</template>

<script>
    import PrimarySolidButton from '@/components/buttons/PrimarySolidButton';
    import BasicButton from '@/components/buttons/BasicButton';

    export default {
        components: {
            PrimarySolidButton,
            BasicButton
        }
    };
</script>

<style scoped>
    div {
        width: 100%;
    }

    div > #search-conditions {
        padding: 20px 0;
        background-color: #F7F7F7;
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
    }

    div > #search-conditions > div {
        height: 26px;
        display: inline-flex;
        align-items: center;
    }

    div > #search-conditions > div > label {
        box-sizing: border-box;
        padding-left: 30px;
        flex: 0 0 110px;
        font-size: 12px;
        line-height: 26px;
        font-weight: bold;
    }

    div > #search-conditions > div > label + :not(label) {
        flex: 1 1 0;
        box-sizing: border-box;
        padding-left: 10px;
    }

    div > #search-conditions > div + div {
        margin-top: 16px;
    }

    div > #search-buttons {
        margin-top: 10px;
        display: inline-flex;
        justify-content: flex-end;
    }

    div > #search-buttons > * + * {
        margin-left: 5px;
    }

</style>
