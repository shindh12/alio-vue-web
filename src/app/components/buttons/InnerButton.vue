<template>
    <button>
        <slot></slot>
    </button>
</template>

<style scoped>
    button {
        display: inline-block;
        box-sizing: border-box;
        justify-content: center;
        height: 22px;
        border-radius: 1px;
        background-color: #FFFFFF;
        border: solid 1px rgba(0, 0, 0, 0.2);
        padding: 5px 9px;
        text-align: center;
        color: rgba(0, 0, 0, 0.8);
        font-size: 11px;
        line-height: 10px;
    }

    button:hover {
        background-color: rgba(0, 0, 0, 0.1);
        border: solid 1px rgba(0, 0, 0, 0.4);
    }

    button:disabled {
        color: rgba(0, 0, 0, 0.3);
        background-color: #FFFFFF;
        border: solid 1px rgba(0, 0, 0, 0.1);
    }

</style>
