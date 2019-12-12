<template>
    <div class="page-header">
        <div class="page-header__title" v-if="sub">{{sub}}
            <small>{{desc}}</small>
        </div>
        <div class="page-header__title" v-if="!sub">{{getTitle()}}
            <small>{{desc}}</small>
        </div>
        <div class="page-header__breadcrumb" v-if="!sub">{{$store.getters.GNB.children}}
            <span class="page-header__breadcrumb__path" v-for="gm in currPath.slice().reverse()"
                  @click="go(gm.menuUrl)">{{getTitle(gm)}}</span>
            <span class="page-header__breadcrumb__menu">{{getTitle()}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'page-title',
        computed: {
            currMenu: function () {
                var currMenu = this.$store.getters.currMenu;
                return currMenu;
            },
            currPath: function () {return this.$store.getters.currPath;}
        },
        props: ['title', /* title을 대체할 경우 */
            'sub', /* Menu에 등록되지 않은 서브 메뉴에 대한 title(breadcrumb disable)*/
            'desc' /* 메뉴에 설명이 필요한 경우(사전에 i18n 처리 필요) */
        ],
        methods: {
            getTitle: function (item) {
                if (!item && this.title) {return this.title;}
                var cm = item || this.currMenu;
                var mkey = cm.messageGroup + '.' + cm.messageCode;
                return this.$td(mkey, cm.defaultName);
            },
            go: function (url) {
                this.$router.push({path: url});
            }
        }
    };
</script>


<style>
    /* @see common.scss : PAGE - HEADER -> ...*/

</style>
