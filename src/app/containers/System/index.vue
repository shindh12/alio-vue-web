<template>
    <div>
        <router-view></router-view>
    </div>
</template>

<script>
    import LeftBar from '@/containers/Main/LeftBar';

    export default {
        data() {
            return {
                menus: [
                    {name: this.$i18n.td('menu.system-system', 'System Management'), url: '/system/systemList'},
                    {name: this.$i18n.td('menu.system-code', 'Code Management'), url: '/system/code'},
                    {name: this.$i18n.td('menu.system-configuration', 'Configuration Management'), url: '/system/configuration'},
                    {name: this.$i18n.td('menu.system-message', 'Message Management'), url: '/system/message'}
                ]
            };
        },
        components: {
            LeftBar
        }
    };
</script>

<style scoped>
</style>
