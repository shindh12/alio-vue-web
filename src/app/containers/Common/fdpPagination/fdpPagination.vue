<template>
    <div class="-fdp-pagination">
        <div v-show="showArrowBtn" class="-fdp-pagination__move-left-first" @click.stop="onClickLeftFirst"
             :class="{'-fdp-pagination__icon--disable' : this.isLeftEnd}"></div>
        <div v-show="showArrowBtn" class="-fdp-pagination__move-left" @click.stop="onClickLeft"
             :class="{'-fdp-pagination__icon--disable' : this.isLeftEnd}"></div>
        <span v-for="(n, idx) in range" :key="idx" @click="onClickPage(n)" class="-fdp-pagination__range-area"
              :style="{ 'color': (n === value)? 'blue' : 'black', 'font-weight':( n ===value)? 'bold' : 'normal'}"> {{ n }} </span>
        <div v-show="showArrowBtn" class="-fdp-pagination__move-right" @click.stop="onClickRight"
             :class="{'-fdp-pagination__icon--disable' : this.isRightEnd}"></div>
        <div v-show="showArrowBtn" class="-fdp-pagination__move-right-last" @click.stop="onClickRightEnd"
             :class="{'-fdp-pagination__icon--disable' : this.isRightEnd}"></div>
    </div>
</template>
<script>
    export default {
        name: 'fdp-pagination',
        props: {
            total: {type: Number, default: 0},
            perPage: {type: Number, default: 10}, // TODO 계산식에 perPage 반영 안된듯.. 지금은 10이라 괜츈??
            value: {}
        },
        data() {
            return {
                action: false,
                lastPageIdx: 1,
            };
        },
        computed: {
            isLeftEnd() {
                return (this.value === 1);
            },
            isRightEnd() {
                return (this.value === this.lastPageIdx);
            },
            showArrowBtn() {
                return (this.lastPageIdx > 10);
            },
            range() {
                // let cnt = Math.ceil(this.total/this.perPage)
                let result = [];
                if (this.lastPageIdx <= 10) {
                    for (let i = 1; i <= this.lastPageIdx; i++) {
                        result.push(i);
                    }
                } else if (this.value <= 6) {
                    for (let i = 1; i <= 10; i++) {
                        result.push(i);
                    }
                } else if ((this.lastPageIdx - 4) < this.value) {
                    for (let i = (this.lastPageIdx - 9); i <= this.lastPageIdx; i++) {
                        result.push(i);
                    }
                } else {
                    for (let i = (this.value - 5); i <= (this.value + 4); i++) {
                        result.push(i);
                    }
                }
                return result;
            }
        },
        watch: {
            total() {
                this.lastPageIdx = Math.ceil(this.total / this.perPage);
            },
        },
        methods: {
            onClickPage(n) {
                if (n === this.value) { return; }
                this.$emit('input', n);
            },
            onClickLeftFirst() {
                if (this.isLeftEnd) { return; }
                this.$emit('input', 1);
            },
            onClickLeft() {
                if (this.isLeftEnd) { return; }
                this.$emit('input', (this.value - 1));
            },
            onClickRight() {
                if (this.isRightEnd) { return; }
                this.$emit('input', (Number(this.value) + 1));
            },
            onClickRightEnd() {
                if (this.isRightEnd) { return; }
                this.$emit('input', this.lastPageIdx);
            }
        }
    };
</script>

<style scoped lang="scss">
    $icon-size: 18px;
    /******* fdpPagination start *******/
    .-fdp-pagination {
        text-align: center;
        user-select: none;
    }

    .-fdp-pagination__range-area {
        display: inline-block;
        font-size: 12px;
        height: 12px;
        width: 22px;
        line-height: 12px;
        cursor: pointer;
        margin: 15px 5px;
    }

    .-fdp-pagination__move-right {
        background: url('../img/baseline_keyboard_arrow_right_black_9dp.png') no-repeat;
    }

    .-fdp-pagination__move-left {
        background: url('../img/baseline_keyboard_arrow_left_black_9dp.png') no-repeat;
    }

    .-fdp-pagination__move-right-last {
        background: url('../img/baseline_last_page_black_9dp.png') no-repeat;
        margin-left: 6px;
    }

    .-fdp-pagination__move-left-first {
        background: url('../img/baseline_first_page_black_9dp.png') no-repeat;
        margin-right: 6px;
    }

    .-fdp-pagination__move-right-last,
    .-fdp-pagination__move-right,
    .-fdp-pagination__move-left-first,
    .-fdp-pagination__move-left {
        background-size: $icon-size $icon-size;
        height: $icon-size;
        width: $icon-size;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
    }

    .-fdp-pagination__icon--disable {
        cursor: default;
        opacity: 0.3;
    }

    .-fdp-pagination__icon--disable:not() {
        .-fdp-pagination__move-right-last:hover,
        .-fdp-pagination__move-right:hover,
        .-fdp-pagination__move-left-first:hover,
        .-fdp-pagination__move-left:hover {
            opacity: 0.5;
        }
    }

    /******* fdpPagination end *******/
</style>
