<template>
    <div :class="wrapperClass">
        <slot></slot>
        <div v-show="!(form||noMessage||disabled||errorMessage=='')" :class="messageClass">{{errorMessage}}</div>
    </div>
</template>

<script>
    export default {
        name: 'tb-validator',
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            form: {
                type: Boolean,
                default: false
            },
            lazy: {
                type: Boolean,
                default: false
            },
            noMessage: {
                type: Boolean,
                default: false
            },
            noShake: {
                type: Boolean,
                default: false
            },
            messagePosition: {
                type: String,
                default: 'bottom'
            },
            rules: {
                type: Array,
            },
            strict: {
                type: Boolean,
                default: false
            },
            target: {
                type: [String, Array, Number, Boolean],
            },
            value: {
                type: Boolean
            },
            dataReset: {
                type: Function
            }
        },
        data: function () {
            return {
                hasError: null,
                /**STATE : [valid, beforeValidate, error]
                 * v-model value(= !hasError) will be following T/F value according to state & strict
                 * *****************************************
                 * | state            | strict | non-strict|
                 * |------------------+--------+-----------|
                 * | valid            | true   | true      |
                 * | beforeValidate   | false  | true      |
                 * | error            | false  | false     |
                 * *****************************************
                 **/
                state: '',
                errorMessage: '',
                watchObjs: [],
                shakeToggle: false
            };
        },
        mounted() {
            if (this.form) {
                this.watchObjs = this.search(this.$children);
            }
            this.state = 'beforeValidate';
        },
        watch: {
            value: function (val) {
                // if(val == before) {return;}
                this.hasError = !val;
            },
            state: function (val) {
                if (val == 'error') {
                    this.hasError = true;
                } else if (val == 'valid') {
                    this.hasError = false;
                } else if (this.strict) {
                    this.hasError = true;
                } else {
                    this.hasError = false;
                }
            },
            hasError: function (val) {
                this.$emit('input', !val);
            },
            target: function () {
                if (!this.lazy) {
                    this.validate(this, false);
                }
            },
            watchErrors: {
                handler(arr) {
                    if (arr.includes(true)) {
                        this.state = 'error';
                    } else {
                        this.state = 'valid';
                    }
                },
            },
            shakeTrigger: function (val) {
                if (val) {
                    setTimeout(() => {this.shakeToggle = false;}, 500);
                }
            }
        },
        computed: {
            watchErrors: function () {
                var ret = [];
                this.watchObjs.forEach((obj) => {
                    ret.push(obj.hasError);
                });
                return ret;
            },
            wrapperClass: function () {
                return [
                    '-tb-validator',
                    {'-tb-validator--error': !this.form && this.hasError && !this.disabled},
                    {'-tb-validator--shake': this.shakeTrigger}
                ];
            },
            messageClass: function () {
                return [
                    '-tb-validator__error-message',
                    `-tb-validator__error-message--${this.messagePosition}`
                ];
            },
            shakeTrigger: function () {
                return !this.noShake && this.shakeToggle && (!this.form && this.hasError && !this.disabled);
            }
        },
        methods: {
            search: function (children, depth = 0) {
                let results = [];
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    if (child.validate !== undefined) {
                        if (!child.disabled) {
                            results.push(child);
                        }
                    } else {
                        results.concat(this.search(child.$children, depth + 1));
                    }
                }
                return results;
            },
            validate: function (target = this, ST = true) {
                if (this.disabled) {
                    return true;
                }
                var tmp, ret;
                if (Array.isArray(target)) {
                    ret = [];
                    for (var i = 0; i < target.length; i++) {
                        ret = ret.concat(target[i].validate());
                    }
                    return ret;
                } else if (typeof (target) == 'object') {
                    if (target.form) {
                        this.watchObjs = this.search(target.$children);
                        ret = this.validate(this.watchObjs);
                        target.state = ret.length == 0 ? 'valid' : 'error';
                        return ret;
                    } else {
                        target.errorMessage = '';
                        for (var i = 0; i < target.rules.length; i++) {
                            tmp = target.rules[i](target.target);
                            if (tmp != true) {
                                target.errorMessage = tmp;
                                target.state = 'error';
                                target.shakeToggle = ST;
                                return [tmp];
                            }
                        }
                        target.state = 'valid';
                        return [];
                    }
                }
            },
            isValid: function (target = this) {
                // console.log(this.validate(target).length);
                // console.log(this.validate(target));

                for (let result in this.validate(target)) {
                    if (this.validate(target)[result] !== true) {
                        return false;
                    }
                }

                return true;

                /* 원본 */
                // if( this.validate(target).length == 0 ){
                //     return true;
                // } else {
                //     return false;
                // }
            },
            clearValidation: function (target = this) {
                if (Array.isArray(target)) {
                    for (var i = 0; i < target.length; i++) {
                        if (target[i].clearValidation) {
                            target[i].clearValidation();
                        }
                    }
                } else if (typeof (target) == 'object') {
                    if (target.form) {
                        this.watchObjs = this.search(target.$children);
                        this.clearValidation(this.watchObjs);
                        target.state = 'beforeValidate';
                    } else {
                        target.errorMessage = '';
                        target.state = 'beforeValidate';
                        target.shakeToggle = true;
                    }
                }
            },
            clear: function (target = this) {
                if (this.dataReset !== undefined) {
                    this.dataReset();
                    this.$nextTick(() => {
                        this.clearValidation(target);
                    });
                } else {
                    this.clearValidation(target);
                }
            },
        },
    };
</script>

<style>
    @keyframes shake {
        10%, 90% {
            transform: translate3d(-1px, 0, 0);
        }
        20%, 80% {
            transform: translate3d(1px, 0, 0);
        }
        30%, 50%, 70% {
            transform: translate3d(-1px, 0, 0);
        }
        40%, 60% {
            transform: translate3d(1px, 0, 0);
        }
    }

    .-tb-validator {
        position: relative;
    }

    .-tb-validator--shake > *:not(.-tb-validator__error-message) {
        animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
    }

    .-tb-validator__error-message {
        position: absolute;
        width: max-content;
        color: red;
        font-size: 0.8em;
    }

    .-tb-validator__error-message--top {
        top: 0px;
        left: 0px;
        transform: translateY(-100%);
    }

    .-tb-validator__error-message--bottom {
        bottom: 0px;
        left: 0px;
        transform: translateY(100%);
    }

    .-tb-validator__error-message--left {
        top: 50%;
        left: 0px;
        transform: translate(-100%, -50%);
    }

    .-tb-validator__error-message--right {
        top: 50%;
        right: 0px;
        transform: translate(100%, -50%);
    }

    .-tb-validator--error .-tb-text-field__input {
        outline-color: red;
    }

    .-tb-validator--error .-tb-radio {
        color: red;
    }
</style>
