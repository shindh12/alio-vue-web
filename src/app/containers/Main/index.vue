<template>
    <div class="main">
        <!-- [TOP] 메뉴 바 -->
        <div class="gnb-wrapper">
            <!-- [TOP] System name -->
            <div class="home-icon">
                <span @click="goHome()"> Point DP</span>
            </div>
            <!-- [TOP] System name END -->

            <!--<div class="system-list">-->
            <!--<v-select v-model="selectedSystem" :items="systemList" @change="onChangeSystemKey(selectedSystem)" item-value="value" class="search-select" style="border:solid 3px black; height:100%;"></v-select>-->
            <!--</div>-->

            <!-- [TOP] Menus(navigator) -->
            <div class="my-tab-navi">
                <ul id="menu-list">
                    <li v-for="(item) in storeGNB" :key="item.menuKey"
                        :class="{'active':item.menuKey===$menu.gnbMenu.menuKey}"
                        @click="tabRoute(item.menuUrl)">{{getItemName(item)}}
                    </li>
                </ul>
            </div>
            <!-- [TOP] Menus(navigator) END -->

            <!-- [TOP] Utility 영역 -->
            <div class="info-content">
                <div class="menu-scroller">
                    <v-icon @click="moveMenu(-100)" :disabled="menuOffsetFlag==-1">keyboard_arrow_left</v-icon>
                    <v-icon @click="moveMenu(+100)" :disabled="menuOffsetFlag==1">keyboard_arrow_right</v-icon>
                </div>

                <!-- [ALIOOLIO-78] To Remove system list in GNB 2019.04.24 -->
                <!-- [TOP] system list -->
                <!-- <div class="system-list" v-if="storeSystemLength">
                  <v-menu offset-y>
                    <div slot="activator">
                      <span> {{$login.systemName}} </span>
                      <i aria-hidden="true" class="icon material-icons input-group__append-icon input-group__icon-cb" >arrow_drop_down</i>
                    </div>

                    <v-list style="margin-top:-15px">
                      <v-list-tile @click="onChangeSystemKey(item)" v-for="(item, index) in storeSystemList" :key="index">
                        <v-list-tile-title>{{item.systemName}}</v-list-tile-title>
                        <v-divider/>
                      </v-list-tile>
                    </v-list>
                  </v-menu>
                </div> -->
                <!-- [TOP] system list END -->
                <ul v-if="$login.currentUser.login!='guest'">
                    <li>
                        <v-menu offset-y>
            <span slot="activator">
              <v-icon>account_circle</v-icon>
              <span v-if="$login.currentUser.login!='guest'">
                <span class="user-name">{{$login.currentUser.fullName}}</span>
              </span>
            </span>
                            <v-list style="margin-top:-5px;">
                                <v-list-tile @click="tabRoute('/profile')">
                                    <v-list-tile-title> {{ $td('message.personal-info-setting', '개인정보 설정') }} &nbsp;
                                    </v-list-tile-title>
                                </v-list-tile>
                                <!-- <v-divider/> -->
                                <v-list-tile @click="logout">
                                    <v-list-tile-title>{{ $td('message.logout', '로그아웃') }}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </li>
                    <li v-if="$login.currentUser.login=='guest'" @click="goLogin()">
                        <!-- <v-icon>fas fa-sign-in-alt</v-icon> -->
                        <v-icon>fas fa-sign-in-alt</v-icon>
                        <!-- <v-icon>input</v-icon> -->
                    </li>
                    <li v-if="$login.currentUser.login!='guest'">
                        <v-menu offset-y>
                            <span slot="activator"><v-icon>more_vert</v-icon></span>
                            <v-list style="margin-top:-5px;">
                                <v-list-tile @click="openServiceDialog()">
                                    <v-list-tile-title>{{ $td('', '서비스 사용 동의') }}</v-list-tile-title>
                                </v-list-tile>
                                <!-- <v-divider/> -->
                                <v-list-tile @click="openAdvertisingDialog()">
                                    <v-list-tile-title>{{ $td('', '광고성 정보 활용 동의') }}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </li>
                </ul>
            </div>
            <!-- [TOP] Utility 영역 END -->
        </div>
        <!-- [TOP] 메뉴 바 END -->

        <!-- [LEFT] 서브 메뉴 바 -->
        <left-box class="lnb-wrapper"></left-box>
        <!-- [LEFT] 서브 메뉴 바 END -->

        <!-- [MID] 컨텐츠 영역 -->
        <div class="contents-wrapper">
            <router-view @refreshMenu="onRefreshMenu" class="isdp-page"></router-view>
        </div>
        <!-- [MID] 컨텐츠 영역 END -->

        <!-- [MODAL] Add, Edit Dialog Area -->
        <terms-dialog :terms-inform='serviceTerms'
                      :show-dialog='serviceDialog'
                      @closeDialog="closeServiceDialog"
        />

        <terms-dialog :terms-inform='advertisingTerms'
                      :show-dialog='advertisingDialog'
                      @closeDialog="closeAdvertisingDialog"
        />
        <!-- [MODAL] Confirm Dialog Area -->
        <common-confirm
                :confirm-dialog="confirmDialog.showDialog"
                :title="confirmDialog.title"
                :message="confirmDialog.message"
                @agree="executeMovingFunction"
                @disagree="closeConfirmDialog"
        />

    </div>
</template>
<script>
    import axios from 'axios';
    import leftBox from '@/containers/Main/boxes/LeftBox';
    import LicenseDialog from '@/containers/Main/dialog/LicenseDialog';
    import PolicyDialog from '@/containers/Main/dialog/PolicyDialog';
    import CommonConfirm from '@/containers/Common/CommonConfirm';
    import TermsDialog from "@/containers/Main/dialog/TermsDialog";

    export default {
        components: {
            TermsDialog,
            leftBox,
            LicenseDialog,
            PolicyDialog,
            CommonConfirm,
        },
        data() {
            return {
                menuOffsetFlag: 0,
                defaultSystemName: 'LEGO Admin Service',
                defaultHomePath: '/admin/pointHistory',
                serviceDialog: false,
                advertisingDialog: false,
                confirmDialog: {
                    showDialog: false,
                    title: 'Confirm',
                    message: this.$i18n.td('message.confirm-menu-moving', '작성중인 내용은 저장되지 않습니다. 이동하시겠습니까?'),
                    nextFunction: '',
                    nextUrl: '',
                },
                serviceTerms: {},
                advertisingTerms: {},
                selectedSystem: '',
                systemList: [],
                searchSystemKey: this.$store.state.loginStore.systemKey,
                searchText: '',
                publishedYn: '',
            };
        },
        computed: {
            getSystemKey: function () {
                return this.$store.state.loginStore.systemKey;
            },
            $menu: function () {
                return this.$store.state.menuStore;
            },
            $login: function () {
                return this.$store.state.loginStore;
            },
            storeGNB: function () {
                return this.$store.getters.GNB;
            },
        },
        mounted() {
            axios.get('prop/name').then(res => {
                this.defaultSystemName = res.data;
            }).catch(e => {
                console.error(e);
            });
        },
        methods: {

            moveMenu: function (offset) {
                const MENU_ID = 'menu-list'
                    , menuList = document.getElementById(MENU_ID);
                var lmargin = menuList.style.marginLeft ? parseInt(menuList.style.marginLeft.replace('px', '')) : 0;
                this.menuOffsetFlag = 0;
                lmargin += offset;
                if (lmargin > 0) {
                    lmargin = 0;
                    this.menuOffsetFlag = 1;
                }
                if (lmargin + menuList.offsetWidth < 300) {
                    this.menuOffsetFlag = -1;
                    return;
                }
                menuList.style.marginLeft = lmargin + 'px';
            },
            getItemName: function (item) {
                if (!item.messageGroup || !item.messageCode) {
                    return item.defaultName;
                }
                return this.$td(item.messageGroup + '.' + item.messageCode, item.defaultName);
            },
            tabRoute: function (url) {
                if (this.checkCurrentMenuDirty(this.tabRoute, url)) {
                    return;
                }
                this.$router.push({path: url});
            },
            getOpenSourceLicenceNotice: function (url) {
                window.open('LEGO_V11_AdminService_LicenseText.doc');
            },
            getPrivacy: function (data) {
                let q = {
                    editType: 'D',
                    version: data[0].version
                };

                this.$router.push({
                    path: '/system/terms/detail/' + data[0].termsKey,
                    query: q
                });
            },

            goHome: function () {
                if (this.checkCurrentMenuDirty(this.goHome)) {
                    return;
                }
                this.tabRoute(this.defaultHomePath);
            },
            goLogin: function () {
                if (this.checkCurrentMenuDirty(this.goLogin)) {
                    return;
                }
                if (this.$login.currentUser.login == 'guest') {
                    this.tabRoute('/login');
                } else {
                    this.tabRoute(this.defaultHomePath);
                }
            },
            getMenu: function () {
                this.$store.dispatch('menuLoad', this.$login.currentUser);
            },
            onRefreshMenu: function () {
                // 1. 현재 설정된 언어와 비교
                if (this.$i18n.locale != this.$login.currentUser.locale) {
                    this.$i18n.locale = this.$login.currentUser.locale;
                }
                // 2. 메뉴가 홈으로 감
                this.getMenu();
                // this.tabRoute(this.defaultHomePath);
            },
            logout: function () {
                let logoutUrl = '/logout';
                let that = this;
                axios.post(logoutUrl, {'ISDP-TOKEN': this.$cookie.get('ISDP-TOKEN')})
                    .then(function (res) {
                        that.onLogout();
                    }).catch(function (err) {
                    if (navigator.userAgent.toLowerCase().indexOf('edge') != -1) {
                        axios.post(
                            '/certification/check',
                            {tokenKey: that.$login.currentUser.login, token: JSON.parse(err.config.data)['ISDP-TOKEN']}
                        ).then(function (res) {
                            if (!res.data.isAvailable) {
                                that.onLogout();
                            }
                        }).catch(function (err) {
                        });
                    }
                });
            },
            onLogout: function () {
                this.$cookie.set('ISDP-TOKEN', '', {expires: '1s'});
                this.$store.dispatch('logout');
                this.getMenu();
                this.tabRoute('/login');
            },

            /** [ALIOOLIO-78] To Remove system list in GNB 2019.04.24 */
            // onChangeSystemKey : function(item){
            //   this.$store.commit("systemSelect", item)

            //   // x. i18n message refresh
            //   if(item.systemKey!='ISDP'){
            //     axios.get('rest/v1/message/all', {
            //         params: {
            //                 systemKey: 'ISDP,'+item.systemKey
            //             }
            //         }).then(res => {
            //         var langs = res.data;
            //         for(let k in langs) {
            //             this.$i18n.setLocaleMessage(k,langs[k]);
            //         }
            //     }).catch(e => {
            //         console.error(e);
            //     });
            //       this.defaultHomePath = '/home/cake';
            //       this.defaultSystemName = '방문자관리 시스템';
            //   }else {
            //       this.defaultHomePath = '/home';
            //       this.defaultSystemName = 'LEGO Admin Service';
            //   }
            //   this.goHome();
            // },
            fullNameCheck: function () {
                var fullnameUrl = '/login/fullname';
                axios.get(fullnameUrl, {withCredentials: true})
                    .then(res => {
                        // RouterProvider.navigate("/"); // 화면 네비게이션
                    }).catch(e => {
                    console.warn('Full Name Fail');
                });
            },

            openServiceDialog() {
                const url = '/rest/v1/terms';
                axios.get(url, {
                    params: {
                        systemKey: this.searchSystemKey,
                        termsText: 'terms1',
                        publishedYn: this.publishedYn
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.serviceTerms = content[0];
                    this.serviceDialog = true;
                });
            },

            closeServiceDialog() {
                this.serviceDialog = false;
            },

            openAdvertisingDialog() {
                const url = '/rest/v1/terms';
                axios.get(url, {
                    params: {
                        systemKey: this.searchSystemKey,
                        termsText: 'terms2',
                        publishedYn: this.publishedYn
                    }
                }).then(res => {
                    let content = res.data.content;
                    this.advertisingTerms = content[0];
                    this.advertisingDialog = true;
                });
            },

            closeAdvertisingDialog() {
                this.advertisingDialog = false;
            },
            openConfirmDialog() {
                this.confirmDialog.showDialog = true;
            },
            closeConfirmDialog() {
                this.confirmDialog.showDialog = false;
            },
            checkCurrentMenuDirty(nextFunction, nextUrl) {
                if (this.$store.state.menuStore.currMenuDirty === true) {
                    this.confirmDialog.nextFunction = nextFunction;
                    this.confirmDialog.nextUrl = (nextUrl !== undefined) ? nextUrl : '';
                    this.openConfirmDialog();
                    return true;
                } else {
                    return false;
                }
            },
            executeMovingFunction() {
                this.$store.dispatch('setCurrMenuDirty', false);
                if (this.confirmDialog.nextUrl === '') {
                    this.confirmDialog.nextFunction();
                } else {
                    this.confirmDialog.nextFunction(this.confirmDialog.nextUrl);
                }
                this.confirmDialog.nextFunction = '';
                this.confirmDialog.nextUrl = '';
                this.closeConfirmDialog();
            },
        }
    };
</script>

<style scoped lang="scss">
    @import 'styles/color.scss';

    $gnb-height: 70px; /* @see also common.scss */
    $menu-padding: 20px;

    /* variable for css*/
    $col_top-navi: #EBEBEB;

    /*box-shadow:2px 2px 4px $col-shadow;*/
    .gnb-wrapper {
        padding-left: 20px;
        vertical-align: middle;
        background: $col_top-navi;
        white-space: nowrap;
    }

    /* [TOP] system list 및 ICON */
    .gnb-wrapper .system-list {
        font-size: 12px;
        display: inline-block;
        margin-left: 5px;
        padding: 0px 0px;
        border: 1px solid $col-grey-l1;
        width: 170px;
        background-color: #FAFAFA;
        position: absolute;
        right: 100%;
        top: 20px;
        height: 30px;
        line-height: 30px;
    }

    .gnb-wrapper .system-list .menu__activator.menu__activator--active i {
        color: #1976D2;
        transform: rotate(-180deg);
        position: absolute;
        right: 3px;
        top: 3px;
    }

    .gnb-wrapper .system-list .menu__activator i {
        position: absolute;
        right: 3px;
        top: 3px;
    }

    /*.gnb-wrapper .system-list i:hover { transform: skewX(180deg); }*/
    /*{font-size:100px;font-size:17px;display:inline-block;margin-right:5px;}*/

    .gnb-wrapper .page-searchbox {
        font-size: 0;
        border: 1px solid $col-grey-l1;
    }

    /* [TOP] System logo */
    .gnb-wrapper .home-icon {
        display: inline-block;
        font-size: 22px;
        cursor: pointer;
        font-weight: 700;
        /* background:linear-gradient(to right,$col-white calc(100% - 20px), $col-trans); */
        vertical-align: middle;
        height: $gnb-height;
        line-height: $gnb-height;
        position: relative;
        z-index: 1;
    }

    .gnb-wrapper .home-icon span {
        line-height: $gnb-height;
    }

    /* [TOP] Menus */
    .gnb-wrapper .my-tab-navi {
        display: inline-block;
        margin-left: $menu-padding*2;
        overflow: hidden;
        vertical-align: middle;
        height: $gnb-height;
        line-height: $gnb-height;
    }

    .gnb-wrapper .my-tab-navi ul {
        font-size: 0;
        transition: .3s;
    }

    .gnb-wrapper .my-tab-navi li {
        font-size: 16px;
        display: inline-block;
        padding: 0 $menu-padding;
        cursor: pointer;
        height: $gnb-height;
        line-height: $gnb-height;
        opacity: 0.5;
    }

    .gnb-wrapper .my-tab-navi ul li:hover {
        color: $col-prim-d3;
        background: $col-prim-l5;
    }

    .gnb-wrapper .my-tab-navi ul li.active {
        border-bottom: 5px solid $col-primary;
        opacity: 1;
        border-top: 3px solid $col-transparent;
        font-weight: bold;
        line-height: $gnb-height - 6;
    }

    /* [TOP] Utility bar */
    .gnb-wrapper .info-content {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        padding: 0 20px;
    }

    .gnb-wrapper .info-content ul {
        font-size: 0;
    }

    .gnb-wrapper .info-content ul li {
        display: inline-block;
        min-width: 20px;
        cursor: pointer;
        line-height: $gnb-height;
        text-align: center;
        font-size: 16px;
    }

    .gnb-wrapper .info-content ul li + li {
        margin-left: 10px;
        color: blue;
    }

    .gnb-wrapper .info-content ul .menu__activator {
        color: blue;
        font-weight: bold;
    }

    /* [TOP] Menu scroller */
    .gnb-wrapper .menu-scroller {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 100%;
        border-left: 1px solid $col-lgrey;
        border-right: 1px solid $col-lgrey;
        background: #EBEBEB;
        display: none;
        transition: 0.5s;
    }

    .gnb-wrapper .menu-scroller .icon {
        display: block;
        cursor: pointer;
        height: 25px;
        user-select: none;
    }

    .gnb-wrapper .menu-scroller .icon:hover {
        background: $col-lgrey;
    }

    .gnb-wrapper .menu-scroller .icon--disabled {
        opacity: 0.2;
    }


    @media (max-width: 1200px) {
        .gnb-wrapper .menu-scroller {
            display: block;
        }
    }

    @media (min-width: 1200px) {
        .gnb-wrapper #menu-list {
            margin-left: 0 !important;
        }
    }

    .user-name {
        font-size: 12px;
    }
</style>

<style>
    .gnb-wrapper .info-content ul .menu__activator {
        line-height: normal;
    }

    .gnb-wrapper .info-content .system-list > .menu {
        display: block !important;
    }

    .gnb-wrapper .info-content .system-list .menu__activator span {
        padding-left: 10px;
    }
</style>
