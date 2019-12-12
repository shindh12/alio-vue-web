<template>
    <div class="pager">
    <span class="disable" v-if="isLeftPageEnd">
      <img src="~@/assets/images/btn-leftend-disable.png">
    </span>
        <span v-else @click="onClickPage(1)">
      <img src="~@/assets/images/btn-leftend-enable.png">
    </span>
        <span class="disable" v-if="isLeftMoveEnd">
      <img src="~@/assets/images/btn-leftmove-disable.png">
    </span>
        <span v-else @click="onClickPage(current-1)">
      <img src="~@/assets/images/btn-leftmove-enable.png">
    </span>
        <span v-for="n in range" @click="onClickPage(n)" :class="{ 'page-number': true, highlight: n === current }">
      {{ n }}
    </span>
        <span class="disable" v-if="isRightMoveEnd">
      <img src="~@/assets/images/btn-rightmove-disable.png">
    </span>
        <span v-else @click="onClickPage(current+1)">
      <img src="~@/assets/images/btn-rightmove-enable.png">
    </span>
        <span class="disable" v-if="isRightPageEnd">
      <img src="~@/assets/images/btn-rightend-disable.png">
    </span>
        <span v-else @click="onClickPage(total)">
      <img src="~@/assets/images/btn-rightend-enable.png">
    </span>
    </div>
</template>

<script>
    export default {
        props: ['total', 'current'],
        computed: {
            range() {
                let arr = [];
                let current = this.current;
                let total = this.total;
                let start = current - 9;
                if (start < 1) {
                    start = 1;
                }
                let end = current + 9;
                if (end > total) {
                    end = total;
                }
                for (let i = start; i <= end; i++) {
                    arr.push(i);
                }
                for (let i = arr.length - 1; arr[i] > current + 4 && arr.length > 10; i--) {
                    arr.pop();
                }
                if (arr.length > 10) {
                    arr.splice(0, arr.length - 10);
                }
                return arr;
            },
            isLeftPageEnd() {
                return this.current <= 6 || this.total <= 10;
            },
            isLeftMoveEnd() {
                return this.current <= 1;
            },
            isRightPageEnd() {
                return (this.total - this.current < 5) || this.total <= 10;
            },
            isRightMoveEnd() {
                return this.current >= this.total;
            }
        },
        methods: {
            onClickPage(n) {
                if (n === this.current) {
                    return;
                }
                this.$emit('changePage', n);
            }
        }
    };
</script>

<style scoped>
    .pager > span {
        width: 20px;
        padding-left: 10px;
        padding-right: 10px;
        cursor: pointer;
    }

    .pager > span > img {
        margin-top: -3px;
    }

    .pager > span.disable {
        cursor: default;
    }

    .pager > span.page-number {
        font-size: 12px;
        font-weight: bold;
        line-height: 1.17;
        text-align: center;
        color: #000000;
        opacity: 0.5;
    }

    .pager > span.page-number.highlight {
        opacity: 1;
        color: #356AC3;
        cursor: default;
    }

</style>
