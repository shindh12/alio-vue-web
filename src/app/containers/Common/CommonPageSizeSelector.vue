<template>
    <div>
    <span class="table__info__counter__total">
      {{$td('message.total', '총')}} <b>{{totalCount}}</b>
    </span>
        <hr class="table__info__counter__divider" v-if="pagination && pagination.rowsPerPage">
        <span class="table__info__counter__size" v-if="pagination && pagination.rowsPerPage">
      <v-select :items="[15,20,30]" v-model.number="pagination.rowsPerPage"></v-select>
            <!--{{$td('system.per-page', '개씩 보기')}} -->
    </span>
    </div>
</template>


<script>
    const DEFAULT_COUNT = 15;
    export default {
        data: function () {
            return {
                pageArray: [15, 20, 30]
            };
        },
        props: ['totalCount', 'pagination'],
        /* data : function() {return {
          'pagination.rowsPerPage' : 10
        }}, */
        created: function () {
            /*this.pagination.rowsPerPage = DEFAULT_COUNT;
            /*/
            var rpp = this.pagination.rowsPerPage;
            if (!rpp || this.pageArray.indexOf(rpp) < 0) {
                this.pagination.rowsPerPage = DEFAULT_COUNT;
            }/**/
        },
        mounted: function () {
            this.emitChange(this.row);

        },
        watch: {
            'pagination.rowsPerPage': function () {
                this.emitChange(this.row);
            }
        },
        methods: {
            onChange: function (e) {this.$emit('callbackPage', e);},
            emitChange: function (num) {this.$emit('eventPageSizeSelector', this.pagination.rowsPerPage);}
        }
    };
</script>


<style>
    /* @see common.scss */
</style>
