<template>
    <div class="not-found-page">
        <img src="@/assets/images/page-not-found.png"></img>
    </div>
</template>

<style scoped lang="scss">
    @import "styles/color.scss";

    .not-found-page {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: $col-notfound-green;

        img {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
        }
    }
</style>
