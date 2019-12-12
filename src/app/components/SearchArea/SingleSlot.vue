<template>
    <div id="search-conditions">
        <slot></slot>
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
    #search-conditions {
        width: 100%;
        padding: 18px 0;
        background-color: #F7F7F7;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
    }

    #search-conditions > label {
        box-sizing: border-box;
        padding-left: 30px;
        flex: 0 0 110px;
        font-size: 12px;
        line-height: 26px;
        font-weight: bold;
    }

    #search-conditions > label + :not(label) {
        flex: 1 1 0;
        box-sizing: border-box;
        padding-left: 10px;
    }

    #search-conditions > #search-buttons {
        display: inline-flex;
        justify-content: flex-end;
        padding-right: 30px;
    }

    #search-conditions > #search-buttons > * + * {
        margin-left: 5px;
    }

</style>
