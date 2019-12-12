<template>
    <div>
        <!-- [MID] 컨텐츠 영역 -->
        <div>
            <router-view></router-view>
        </div>
        <!-- [MID] 컨텐츠 영역 END -->
    </div>
</template>
<script>
    import axios from 'axios';

    export default {
        components: {},
        data() {
            return {};
        },
        computed: {},
        mounted() {
            console.log('popup!!!!');
        },
        methods: {}
    };
</script>

<style scoped lang="scss">
    @import 'styles/color.scss';

</style>
