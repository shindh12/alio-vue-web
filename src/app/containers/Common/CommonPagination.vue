<template>
    <div>
        <fdp-pagination id="common-pagination" :total="pages" :perPage="perPage" v-model="currPage" @input="invokeEvent"></fdp-pagination>
    </div>
</template>
<script>
    import fdpPagination from './fdpPagination/index';

    export default {
        components: {fdpPagination},
        props: ['page', 'pages'],
        watch: {
            page() {
                this.currPage = this.page;
            },
        },
        data() {
            return {
                /**
                 * v-pagination → fdp-pagination 변경으로 인해 추가.
                 * v-pagination은 page수를 받고, fdp-pagination은 전체 row수와 page당 row수를 받음.
                 * 호출부분을 변경하지 않고 사용하기 위해 per Page를 1로 고정함
                 */
                perPage: 1,
                currPage: 0,
            };
        },
        methods: {
            invokeEvent: function (e) {
                this.$emit('eventPagination', e);
            }
        }
    };
</script>

<style>
    #common-pagination .-fdp-pagination__range-area {
        width: auto;
        display: inline-block;
        margin: 15px 10px;
    }
</style>
