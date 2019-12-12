<template>
    <button>
        <slot></slot>
    </button>
</template>

<style scoped>
    button {
        display: inline-block;
        box-sizing: border-box;
        height: 30px;
        background-color: #20358C;
        border: solid 1px transparent;
        padding: 5px 20px;
        text-align: center;
        font-size: 12px;
        line-height: 18px;
        color: #FFFFFF;
    }

    button:hover {
        background-color: #192A70;
        border: solid 1px #192A70;
        cursor: pointer;
    }

    button:disabled {
        color: rgba(255, 255, 255, 0.5);
        background-color: rgba(20, 47, 158, 0.3);
        border: solid 1px transparent;
    }

</style>
