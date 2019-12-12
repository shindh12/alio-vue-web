import Vue from 'vue';
import Router from 'vue-router';
import axios from 'axios';
import store from '@/store';
import Main from '@/containers/Main';
import Popup from '@/containers/Common/popup.vue';
// System
import System from '@/containers/System';
import SystemList from '@/containers/System/System';
import SystemUserDetail from '@/containers/System/SystemUserDetail';
import Code from '@/containers/System/Code';
import Configuration from '@/containers/System/Configuration';
import Message from '@/containers/System/Message';
import Terms from '@/containers/System/Terms';
import TermsDetail from '@/containers/System/TermsDetail';
// User
import User from '@/containers/User';
import UserList from '@/containers/User/UserList';
import SystemUserList from '@/containers/User/System/SystemUserList.vue';
import UserDetail from '@/containers/User/UserDetail';
import Group from '@/containers/User/Group';
import Role from '@/containers/User/Role';
import RoleDetail from '@/containers/User/RoleDetail.vue';
import Menu from '@/containers/User/Menu/Menu.vue';
import Authorization from '@/containers/User/Authorization/Authorization.vue';
import Instance from '@/containers/User/Instance';
import RegistUser from '@/containers/User/RegistUser';

// Security
import Security from '@/containers/Security';
import RestApi from '@/containers/Security/RestApi';
//Mail
import Mail from '@/containers/Mail';
import InternalInboxMailList from '@/containers/Mail/InternalInboxMailList';
import InternalSentMailList from '@/containers/Mail/InternalSentMailList';
import ExternalSentMailList from '@/containers/Mail/ExternalSentMailList';
import MailMonitoring from '@/containers/Mail/Monitoring';
import InternalMailWritePopup from '@/containers/Mail/mailPopup/InternalMailWritePopup.vue';
// History
import History from '@/containers/History';
import LoginHistory from '@/containers/History/LoginHistory';
import FileHistory from '@/containers/History/FileHistory';
import MenuHistory from '@/containers/History/MenuHistory';
import RestHistory from '@/containers/History/RestHistory';

import PageNotFound from '@/containers/Main/PageNotFound';
import Login from '@/containers/Main/Login';
import Home from '@/containers/Main/Home';
import HomeCake from '@/containers/Main/HomeCake';
import Profile from '@/containers/Main/Profile';
import ResetAuthCode from '@/containers/Main/ResetAuthCode';

import LoginSso from '@/containers/Main/LoginSso';
// Approval
import Approval from '@/containers/Approval';
import Approved from '@/containers/Approval/Approved';
import Notification from '@/containers/Approval/Notification';
import Pending from '@/containers/Approval/Pending';
import Preliminary from '@/containers/Approval/Preliminary';
import Submission from '@/containers/Approval/Submission';
import ExternalSubmission from '@/containers/Approval/ExternalSubmission';
import ApprovalMonitoring from '@/containers/Approval/Monitoring';
// Board
import Board from '@/containers/Board/Board';
import BoardDetail from '@/containers/Board/BoardDetail';
import Category from '@/containers/Board/Category';
import CategoryDetail from '@/containers/Board/CategoryDetail';
// Recipe (Demo Page)
import Recipe from '@/containers/Ref';
import RecipeMain from '@/containers/Ref/Main';
import RecipeGrid from '@/containers/Ref/Grid';
import RecipeValidation from '@/containers/Ref/Validation';
import RecipePopup from '@/containers/Ref/PopUp';
import Excel from '@/containers/Ref/Excel';
//
import Api from '@/containers/Api';
import Secret from '@/containers/Api/Secret';
import ApiHistory from '@/containers/Api/ApiHistory';
import ApiResources from '@/containers/Api/ApiResources';

import Std from '@/containers/Std';
import Notice from '@/containers/Std/Notice';
// import NoticeDetail from '@/containers/Std/NoticeDetail';
import Help from '@/containers/Std/Help';
import Agreement from '../containers/Std/Agreement';

// popup


// Admin
import PointHistory from '@/containers/Admin/PointHistory';
import WalletUser from '@/containers/Admin/WalletUser';
import UseStatus from '@/containers/Admin/UseStatus';

Vue.use(Router);

let router = new Router({
    routes: [
        {path: '/', redirect: '/home'},
        {
            path: '/pop', component: Popup,
            children: [
                {path: 'mail', component: InternalMailWritePopup, name: 'mailPop'}
            ]
        },
        {
            path: '/login', component: Main,
            children: [{path: '', component: Login}]
        },
        {
            path: '/regist', component: Main, children: [
                {path: '', component: RegistUser}
            ]
        },
        {
            path: '/sso', component: Main,
            children: [
                {path: '', component: LoginSso}
            ]
        },
        {
            path: '/home', component: Main,
            children: [
                {path: '', component: Home}
            ]
        },
        {
            path: '/home/cake', component: Main,
            children: [
                {path: '', component: HomeCake}
            ]
        },
        {
            path: '/profile', component: Main,
            children: [
                {path: '', component: Profile}
            ]
        },
        {
            path: '/reset/auth/code', component: Main,
            children: [
                {path: '', component: ResetAuthCode}
            ]
        },
        {
            path: '/system', component: Main,
            children: [
                {
                    path: '', component: System,
                    children: [
                        {path: '/', redirect: 'code'},
                        {path: 'systemList', component: SystemList},
                        {path: 'detail', component: SystemUserDetail, name: 'systemDetail'},
                        {path: 'code', component: Code},
                        {path: 'configuration', component: Configuration},
                        {path: 'message', component: Message},
                        {path: 'terms', component: Terms},
                        {path: 'terms/detail/:termsKey', component: TermsDetail, name: 'termsDetail'},
                        {path: 'terms/new', component: TermsDetail, name: 'termsNew'}
                    ]
                },
            ]
        },
        {
            path: '/user', component: Main,
            children: [
                {
                    path: '', component: User,
                    children: [
                        {path: '/', redirect: 'userList'},
                        {path: 'userList', component: UserList},
                        {path: 'system', component: SystemUserList},
                        {path: 'detail/:login', component: UserDetail, name: 'userDeatil'},
                        {path: 'group', component: Group},
                        {path: 'role', component: Role},
                        {path: 'menu', component: Menu},
                        {path: 'authority', component: Authorization},
                        {path: 'instance', component: Instance},
                        {path: 'role/detail/:roleId', component: RoleDetail, name: 'roleDeatil'},
                    ]
                }
            ]
        },
        {
            path: '/security', component: Main,
            children: [
                {
                    path: '', component: Security,
                    children: [
                        {path: '/', redirect: 'resource'},
                        {path: 'access', component: Instance},
                        {path: 'resource', component: RestApi},
                    ]
                },
            ]
        },

        {
            path: '/recipe', component: Main,
            children: [
                {
                    path: '', component: Recipe,
                    children: [
                        {path: '/', redirect: 'main/search'},
                        {path: 'main', redirect: 'main/search'},
                        {path: 'main/search', component: RecipeMain},
                        {path: 'main/grid', component: RecipeGrid},
                        {path: 'main/validation', component: RecipeValidation},
                        {path: 'main/popup', component: RecipePopup},
                        {path: 'special/excel', component: Excel},
                    ]
                },
            ]
        },

        {
            path: '/api', component: Main,
            children: [
                {
                    path: '', component: Api,
                    children: [
                        {path: '/', redirect: 'history'},
                        {path: 'secret', component: Secret},
                        {path: 'history', component: ApiHistory},
                        {path: 'resource', component: ApiResources}
                    ]
                },
            ]
        },

        {
            path: '/std', component: Main,
            children: [
                {
                    path: '', component: Std,
                    children: [
                        {path: '/', redirect: 'notice'},
                        {path: 'notice', component: Notice},
                        // {path: 'notice/detail/:noticeId', component: NoticeDetail, name: 'noticeDetail'},
                        {path: 'help', component: Help},
                        {path: 'agreement', component: Agreement},
                    ]
                },
            ]
        },
        {
            path: '/history', component: Main,
            children: [
                {
                    path: '', component: History,
                    children: [
                        {path: '/', redirect: 'login'},
                        {path: 'login', component: LoginHistory},
                        {path: 'file', component: FileHistory},
                        {path: 'menu', component: MenuHistory},
                        {path: 'rest', component: RestHistory},
                    ]
                },
            ]
        },
        {
            path: '/mail', component: Main,
            children: [
                {
                    path: '', component: Mail,
                    children: [
                        {path: '/', redirect: 'i/inbox'},
                        {path: 'i/', redirect: 'i/inbox'},
                        {path: 'i/inbox', component: InternalInboxMailList},
                        {path: 'i/sent', component: InternalSentMailList},
                        {path: 'e', redirect: 'e/sent'},
                        {path: 'e/sent', component: ExternalSentMailList},
                        {path: 'monitoring', component: MailMonitoring}
                    ]
                }
            ]
        },
        {
            path: '/approval', component: Main,
            children: [
                {
                    path: '', component: Approval,
                    children: [
                        {path: '/', redirect: 'i/pending'},
                        {path: 'i', redirect: 'i/pending'},
                        {path: 'i/pending', component: Pending},
                        {path: 'i/approved', component: Approved},
                        {path: 'i/notification', component: Notification},
                        {path: 'i/preliminary', component: Preliminary},
                        {path: 'i/submission', component: Submission},
                        {path: 'e', redirect: 'e/submission'},
                        {path: 'e/submission', component: ExternalSubmission},
                        {path: 'monitoring', component: ApprovalMonitoring}

                    ]
                }
            ]
        },
        {
            path: '/board', component: Main,
            children: [
                {path: '/', redirect: 'board'},
                {path: 'board', component: Board},
                {path: 'board/detail', component: BoardDetail, name: 'boardDetail'},
                {path: 'category', component: Category},
                {path: 'category/detail', component: CategoryDetail, name: 'categoryDetail'},
            ]
        },
        {
            path: '/admin', component: Main,
            children: [
                {
                    path: '', component: Std,
                    children: [
                        {path: '/', redirect: 'pointHistory'},
                        {path: 'pointHistory', component: PointHistory, name: 'pointHistory'},
                        {path: 'walletUser', component: WalletUser},
                        {path: 'useStatus', component: UseStatus},
                    ]
                },
            ]
        },
        {path: '/notfound', component: PageNotFound},
        {
            path: '*', component: Main,
            children: [
                {path: '', component: PageNotFound}
            ]
        }
    ]
});

let detailsMap = {
    'userDeatil': {path: '/user/userList'},
    'roleDeatil': {path: '/user/role'},
    'systemDetail': {path: '/system/systemList'},
    'termsDetail': {path: '/system/terms'},
    'termsNew': {path: '/system/terms'},
    'popTest': {path: '/'},
    'mailPop': {path: '/'},
    'boardDetail': {path: '/board/board'},
    'categoryDetail': {path: '/board/category'},
    'refMain': {path: '/recipe/main'},
    'pointHistory': {path: '/admin/pointHistory'},
    // 'noticeDetail': {path: '/std/notice'},
};

function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length == 2) {
        return parts.pop().split(';').shift();
    }
}

function isPath(str) {
    if (str == '/login' || str == '/regist' || str == '/home/cake' || str == '/home' || str == '/profile' || str == '/sso' || str == '/reset/auth/code' || str.startsWith('/pop')) {
        return true;
    } else {
        return false;
    }
}

router.beforeEach(function (to, from, next) {

    if (from.params.test === false) {
        return;
    }

    console.log('move route : ', from.path + ' -> ' + to.path);
    if (isPath(to.path)) {
    } else {
        if (!getCookie('ISDP-TOKEN') || store.state.loginStore.currentUser.login == 'guest') {
            console.log('로그인 하지 않았습니다.(' + to.path + ')');
            store.dispatch('logout');
            next({path: '/login'});
            return;
        } else {
            var token = {
                tokenKey: getCookie('ISDP-LOGIN'),
                token: getCookie('ISDP-TOKEN')
            };
            axios.post('/certification/check', token).then(function (res, status, xhr) {
                if (res.data.isAvailable === false) {
                    console.log('로그인 하지 않았습니다.(' + to.path + ')');
                    store.dispatch('logout');
                    next({path: '/login'});
                    return;
                }
            });
        }
        if (from.path !== '/' && !(to.name !== undefined && detailsMap[to.name] !== undefined) && (!store.state.menuStore.menuMap[to.path]
            || store.state.menuStore.menuMap[to.path].aRead != 'Y')) {
            console.log('해당 메뉴에 권한이 없습니다.(' + to.path + ')');
            next({path: '/home',});
            return;
        }
    }

    if (store.state.loginStore.isResetAuthCode > 0 && to.path !== '/reset/auth/code') {
        next({path: '/reset/auth/code',});
        return;
    }

    if (to.name !== undefined && detailsMap[to.name] !== undefined) {
        store.dispatch('moveRoute', detailsMap[to.name].path);
    } else {
        store.dispatch('moveRoute', to.path);
    }/**/

    const url = '/rest/v1/history/menu/create';
    let menuHistory = {
        systemKey: 'ISDP',
        beforeMenuUrl: from.path,
        menuUrl: to.path
    };
    axios.post(url, menuHistory).then(function () {}).catch(function () {});
    next();
});

export default router;
