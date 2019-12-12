<template>
    <div class="check-grid">
        <div class="info">
            <div>
                Total
                <span>{{ totalElements }}</span>
            </div>
            <dropdown :items="sizeArray" v-bind:current="normalizedSizeArray.indexOf(size)" v-on:changeItem="onSizeChange"></dropdown>
        </div>
        <div class="buttons" v-bind:class="{ selected: selected.length !== 0 }">
            <check-box v-if="selected.length !== 0" v-bind:checked="selected.length !== 0" v-on:click.native="emitSelected([])">
                | {{ selected.length }} item{{ selected.length > 1 ? 's' : '' }} selected
            </check-box>
            <slot v-if="$slots.buttons" name="buttons"></slot>
        </div>
        <div class="body" v-if="rows && rows.length > 0">
            <div class="header">
                <check-box class="row-checkbox" v-bind:checked="selected.length === rows.length" v-on:change="onHeaderCheckBoxChange"></check-box>
                <slot name="header"></slot>
            </div>
            <div class="rows">
                <div class="row" v-for="(row, index) in rows" v-bind:class="{ selected: isSelected(index) }">
                    <check-box class="row-checkbox" v-bind:checked="selected" v-on:input="onCheckBoxInput" v-bind:value="index"></check-box>
                    <slot v-bind:row="row"></slot>
                </div>
            </div>
        </div>
        <div class="body empty" v-if="!rows || rows.length === 0">
            There is no data
        </div>
        <pager v-bind:current="rows.length === 0 ? 1 : page + 1"
               v-bind:total="rows.length === 0 ? 1 : totalPages"
               v-on:changePage="onPageChange"></pager>
    </div>
</template>

<script>
    import Dropdown from '@/components/Dropdown';
    import CheckBox from '@/components/CheckBox';
    import Pager from '@/components/Pager';

    export default {
        components: {
            Dropdown,
            CheckBox,
            Pager
        },
        model: {
            prop: 'selected'
        },
        props: ['totalElements', 'rows', 'sizes', 'size', 'page', 'totalPages', 'selected'],
        computed: {
            normalizedSizeArray() {
                return this.sizes || [10, 30, 50];
            },
            sizeArray() {
                return this.normalizedSizeArray.map(item => ({
                    title: `${item} per page`,
                    value: item
                }));
            }
        },
        methods: {
            isSelected(index) {
                return this.selected.indexOf(index) >= 0;
            },
            onCheckBoxInput(newSelected) {
                this.emitSelected(newSelected);
            },
            onSizeChange(value) {
                this.$emit('size', value);
            },
            onHeaderCheckBoxChange(flag) {
                if (flag) {
                    this.emitSelected(this.rows.map((_, index) => index));
                } else {
                    this.emitSelected([]);
                }
            },
            emitSelected(value) {
                this.$emit('input', value);
            },
            onPageChange(pageIndex) {
                this.$emit('page', pageIndex - 1);
            }
        }
    };
</script>

<style scoped>
    .check-grid {
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
    }

    .check-grid > .info {
        height: 34px;
        display: inline-flex;
        align-items: center;
    }

    .check-grid > .info > div:first-of-type > span {
        margin-left: 5px;
        font-weight: bold;
    }

    .check-grid > .info > div:first-of-type ::after {
        margin: 0 10px;
        content: '';
        display: inline-block;
        width: 1px;
        height: 10px;
        background-color: #D8D8D8;
    }

    .check-grid > .buttons {
        height: 36px;
        box-sizing: border-box;
        border-width: 1px 0;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.2);
        display: inline-flex;
        padding-left: 15px;
        align-items: center;
    }

    .check-grid > .buttons > * + * {
        margin-left: 15px;
    }

    .check-grid > .buttons > button + button {
        margin-left: 5px;
    }

    .check-grid > .buttons > label:first-child {
        display: none;
    }

    .check-grid > .buttons > label:first-child + * {
        display: inline-flex;
    }

    .check-grid > .buttons.selected {
        background-color: rgba(44, 73, 191, 0.2);
        border-color: #8F9AC5;
    }

    .check-grid > .buttons.selected > label:first-child {
        display: inline-flex;
        font-weight: bold;
    }

    .check-grid > .body {
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
    }

    .check-grid > .body .row-checkbox {
        min-width: 42px;
        max-width: 42px;
        justify-content: center;
    }

    .check-grid > .body > .header {
        height: 35px;
        background-color: #F7F7F7;
        box-sizing: border-box;
        border-bottom: solid 1px #E0E0E0;
        display: inline-flex;
        align-items: stretch;
    }

    .check-grid > .body > .header > :first-child ~ * {
        padding: 0 15px;
        border-right: solid 1px #EAEAEA;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
    }

    .check-grid > .body > .header > :first-child ~ *:last-of-type {
        border-right: 0;
    }

    .check-grid > .body > .rows {
        box-sizing: border-box;
        border-bottom: solid 1px #CCCCCC;
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
    }

    .check-grid > .body > .rows > .row {
        flex: 0 0 37px;
        box-sizing: border-box;
        border-bottom: solid 1px #F0F0F0;
        display: inline-flex;
        align-items: stretch;
    }

    .check-grid > .body > .rows > .row:nth-of-type(9) ~ .row:last-of-type {
        flex: 0 0 36px;
        border-bottom: 0;
    }

    .check-grid > .body > .rows > .row > div:nth-child(2) > div:first-child {
        padding-right: 15px;
    }

    .check-grid > .body > .rows > .row > div:nth-child(2) > div {
        flex-grow: 1;
        flex-shrink: 1;
        padding: 0 15px;
        border-right: solid 1px #F0F0F0;
        display: inline-flex;
        align-items: center;
    }

    .check-grid > .body > .rows > .row > div:nth-child(2) > div:last-of-type {
        border-right: 0;
    }

    .check-grid > .body > .rows > .row:hover {
        background-color: #F0F0F0;
    }

    .check-grid > .body > .rows > .row.selected {
        background-color: #F4F6FD;
    }

    .check-grid > .body.empty {
        height: 404px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        line-height: 20px;
    }

    .check-grid > .body + * {
        margin-top: 27px;
        text-align: center;
    }

</style>
