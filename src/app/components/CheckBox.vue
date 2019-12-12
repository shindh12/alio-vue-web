<template>
    <label>
        <input type="checkbox"
               v-bind:checked="isChecked"
               v-bind:value="value"
               v-bind:disabled="!!disabled"
               v-on:change="emit($event.target.checked)">
        <span></span>
        <slot v-if="slotExists && !slotHasOnlyText"></slot>
        <span v-if="slotExists && slotHasOnlyText">
      <slot></slot>
    </span>
    </label>
</template>

<script>
    export default {
        model: {
            prop: 'checked'
        },
        props: ['checked', 'value', 'disabled'],
        computed: {
            inputIsArray() {
                return this.checked instanceof Array;
            },
            isChecked() {
                if (this.inputIsArray) {
                    return this.checked.reduce((pre, item) => pre || item === this.value, false);
                } else {
                    return this.checked;
                }
            },
            slotExists() {
                return !!this.$slots.default;
            },
            slotHasOnlyText() {
                return this.$slots.default && this.$slots.default.length === 1 && !!this.$slots.default[0].text;
            }
        },
        methods: {
            emit(flag) {
                // for v-model
                if (this.inputIsArray) {
                    if (flag) {
                        this.$emit('input', this.checked.concat(this.value));
                    } else {
                        this.$emit('input', this.checked.filter(item => item !== this.value));
                    }
                } else {
                    this.$emit('input', flag);
                }
                // for change handler
                this.$emit('change', flag);
            }
        }
    };
</script>

<style scoped>
    label {
        display: inline-flex;
        align-items: center;
    }

    label > input {
        display: none;
    }

    label > input + span {
        display: inline-block;
        width: 14px;
        height: 14px;
        box-sizing: border-box;
        border: 2px solid rgba(0, 0, 0, 0.5);
        background-color: #FFFFFF;
    }

    label > input + span::after {
        display: none;
    }

    label > input:hover + span {
        border-color: #2C49BF;
    }

    label > input:checked + span {
        background-color: #20358C;
        border-color: #20358C;
    }

    label > input:checked + span::after {
        margin-top: 1px;
        margin-left: 3px;
        content: '';
        display: block;
        width: 3px;
        height: 6px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
    }

    label > input:disabled + span {
        background-color: rgba(0, 0, 0, 0.1);
        border-color: transparent;
    }

    label > input:checked:disabled + span {
        background-color: #FFFFFF;
        border-color: rgba(0, 0, 0, 0.1);
    }

    label > input + span + * {
        margin-left: 7px;
    }

    label > input + span ~ * {
        line-height: 14px;
    }

    label > input:checked + span ~ * {
        color: #2C49BF;
    }

    label > input:disabled + span ~ * {
        color: rgba(0, 0, 0, 0.3);
    }

</style>
