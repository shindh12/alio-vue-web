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
        background-color: #FFFFFF;
        border: solid 1px rgba(0, 0, 0, 0.2);
        padding: 5px 20px;
        text-align: center;
        color: rgba(0, 0, 0, 0.8);
        font-size: 12px;
        line-height: 18px;
    }

    button:hover {
        background-color: rgba(0, 0, 0, 0.1);
        border: solid 1px rgba(0, 0, 0, 0.4);
        cursor: pointer;
    }

    button:disabled {
        color: rgba(0, 0, 0, 0.3);
        background-color: #FFFFFF;
        border: solid 1px rgba(0, 0, 0, 0.1);
    }
</style>
