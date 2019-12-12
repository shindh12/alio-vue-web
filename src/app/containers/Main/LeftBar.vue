<template>
    <div class="leftbar">
        <v-navigation-drawer absolute permanent height="calc( 100vh )" width="200">
            <v-list>
                <v-list-tile active-class="blue--text" ripple v-for="(menu, index) in menus" :key="index" v-bind:to="menu.url">
                    <v-list-tile-title>{{menu.name}}</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
    export default {
        props: ['menus'],
        components: {}
    };
</script>

<style scoped>
    .leftbar {
        z-index: 9;
        width: 200px;
        position: absolute;
    }
</style>
