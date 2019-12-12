<template>
    <div>
    <span class="table__info__counter__total">
      {{$td('message.total', '총')}} <b>{{totalCount}}</b>
    </span>
    </div>
</template>


<script>

    export default {
        props: ['totalCount'],
    };
</script>


<style>
    /* @see common.scss */
</style>
