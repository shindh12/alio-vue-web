<template>
    <div id="left-box"
         :class="{'void-left':!$menu.gnbMenu.children || !$menu.gnbMenu.children.length,
               'left-box--collapsed':collapse}">
        <div class="left__title">
            <h1>{{getItemName($menu.gnbMenu)}}</h1>
            <span class="left__collapse" @click="collapse=true;">
        <v-icon>chevron_left</v-icon>
      </span>
            <span class="left__expand" @click="collapse=false;">
        <v-icon>chevron_right</v-icon>
      </span>
        </div>
        <div class="left__menu">
            <div v-for="m in $menu.gnbMenu.children"> <!-- $gets.currLMenu -->
                <left-menu :menu="m"></left-menu>
            </div>
        </div>
    </div>
</template>

<script>
    import leftMenu from './LeftMenu';

    export default {
        components: {leftMenu},
        data: function () {
            return {
                collapse: false
            };
        },
        computed: {
            $menu: function () { return this.$store.state.menuStore; },
            $gets: function () { return this.$store.getters; }
        },
        methods: {
            getItemName: function (item) {
                if (!item) {return '';}
                if (!item.messageGroup || !item.messageCode) {
                    return item.defaultName;
                }
                return this.$td(item.messageGroup + '.' + item.messageCode, item.defaultName);
            }
        }
    };
</script>


<style lang="scss">
    @import 'styles/color.scss';

    $default-left-size: 200px; /* @see also common.scss */
    $left-title-height: 55px;
    $left-menu-height: 50px;
    $left-border-col: rgba(0, 0, 0, 0.2);


    /* variable for css*/
    $col_top-navi: #EBEBEB;
    $col_left-body: #F6F6F6;
    $col_left-title: #767676;

    #left-box {
        transition: left 1s; /* for collapse */
        background: $col_left-body;

        .left__title {
            height: $left-title-height;
            line-height: $left-title-height;
            padding: 0 20px;
            background: $col_top-navi;

            h1 {
                height: 100%;
                color: #767676;
                font-size: 14px;
            }
        }

        .left__collapse, .left__expand {
            position: absolute;
            cursor: pointer;

            i.icon {
                color: rgba(0, 0, 0, 0.3);
            }
        }

        .left__collapse {
            top: 0;
            right: 0;
            width: 30px;
            height: $left-title-height;

            i.icon {
                font-size: 26px;
                line-height: $left-title-height;
            }

            i.icon:hover {
                color: #000000;
            }
        }

        .left__expand {
            top: 0px;
            left: 100%;
            height: $left-title-height;
            width: 0px;
            border: 1px solid $left-border-col;
            opacity: 0;
            /* box-shadow:3px 5px 6px $col-shadow, 3px 0px 8px $col-shadow; */
            transition: 1s;

            i.icon {
                font-size: 20px;
                line-height: 57px;
            }

            i.icon:hover {
                color: #000000;
            }
        }

        &.left-box--collapsed {
            left: -$default-left-size;

            .left__expand {
                width: 22px;
                opacity: 1;
            }
        }

        &.void-left {
            display: none;
            width: 0px;
        }

        /**/
        &.void-left + .contents-wrapper,
        &.left-box--collapsed + .contents-wrapper {
            left: 0px;
            transition-delay: 0.6s;
        }

        .left__menu {
            margin-top: 15px;
        }
    }


</style>
