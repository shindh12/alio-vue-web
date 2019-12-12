<template>
    <div class="dropdown">
        <div class="dropdown-button" @click="toggleItem">
            <div class="dropdown-selected">{{ selectedTitle }}</div>
            <img v-if="isItemShowing" src="~@/assets/images/ico-arrow-up.png">
            <img v-else src="~@/assets/images/ico-arrow-down.png">
        </div>
        <div class="dropdown-items" v-show="isItemShowing">
            <div v-for="(item, index) in items" @click="onClickItem(item.value, index)" :class="{ 'selected': isSelectedItem(index) }">
                {{ item.title }}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['items', 'current'],
        data() {
            return {
                isItemShowing: false,
                currentItem: this.current
            };
        },
        computed: {
            selectedTitle() {
                return this.items[this.currentItem].title;
            }
        },
        methods: {
            onClickItem(value, index) {
                this.$emit('changeItem', value);
                this.currentItem = index;
                this.toggleItem();
            },
            toggleItem() {
                this.isItemShowing = !this.isItemShowing;
            },
            isSelectedItem(index) {
                return index === Number(this.currentItem);
            }
        }
    };
</script>

<style scoped>
    .dropdown-button {
        padding-left: 2px;
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .dropdown-button .dropdown-selected {
        line-height: 1.17;
    }

    .dropdown-button img {
        margin-left: 8px;
        width: 6px;
        height: 4px;
    }

    .dropdown-items {
        margin-top: 6px;
        background-color: #FFFFFF;
        border: solid 1px #EBEBEB;
        line-height: 2.42;
        position: absolute;
        cursor: pointer;
        z-index: 5;
    }

    .dropdown-items div {
        padding: 0 8px;
    }

    .dropdown-items div.selected {
        font-weight: 500;
        color: #356AC3;
    }

    .dropdown-items div:hover {
        background-color: rgba(0, 0, 0, 0.03);
    }

</style>
