<template>
    <div class="home-page">
        <div class="back"></div>
        <div v-if="contents===''" class="front">
            <h1>방문자관리 시스템</h1>
            <hr>
            <h2>방문자관리 시스템은?</h2>
            <article>
                <p>
                    LEGO에서 <b>사업장 방문자관리 시스템</b>을 예시로 제작되었고
                    주요 제공 서비스는 아래와 같습니다.
                </p>
                <p>
                    <b>업무적으로는,</b>
                <ul>
                    <li>회원가입, ID/PW 로그인 및 찾기, SSO 로그인</li>
                    <li>방문예약 신청, 조회, 승인</li>
                    <li>신청결과 메일전송</li>
                </ul>
                </p>
                <p>
                    <b>기능적으로는,</b>
                <ul>
                    <li>다국어 처리, 사용자 및 시스템 관리</li>
                    <li>사용자 권한에 따른 메뉴 구성</li>
                    <li>보안을 위한 IP 및 REST 리소스 관리</li>
                    <li>시스템 사용이력 관리</li>
                </ul>
                </p>
                <p>
                    이러한 서비스는 순차적인 업무를 관리하는 System 개발 시 유용하게 활용하실 수 있습니다.
                </p>
                <p>
                    출입 신청 시스템의 구조를 파악하고 나면 방문자 차량등록 및 허가에 대한 예시를 직접 제작해 볼 수 있습니다.<br>
                </p>
            </article>
        </div>
        <div v-if="contents!==''" class="front">
            <p v-html="contents"></p>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        components: {},
        data() {
            return {
                contents: '',
                sanitize: '', /* Content sanitizer for XSS */
            };
        },
        mounted() {
            axios.get('rest/v1/configuration/get/HOME').then(res => {
                if (res.data.configurationValue) {
                    this.contents = res.data.configurationValue;
                }
            }).catch(e => {
                console.error(e);
            });
        },
        methods: {
            go: function (url) {
                this.$router.push({path: url});
            }
        }
    };
</script>

<style scoped lang="scss">
    @import "styles/color.scss";

    #app .home-page {
        padding: 0;
    }

    #app .home-page .back {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 0;
        overflow: hidden;
        filter: blur(4px) opacity(.7);
        background-image: url(../../../app/assets/backs/home-02.jpg);
        background-size: cover;
    }

    #app .home-page .front {
        margin: 0px calc(50% - 500px);
        z-index: 10;
        position: relative;
        background: rgba(0, 0, 0, 0.6);
        color: #FFF;
        padding: 20px 40px;
    }

    #app .home-page .front h1 {
        font-size: 36px;
    }

    #app .home-page .front h2 {
        margin-top: 20px;
        font-size: 24px;
        border-left: 10px solid $col-primary;
        padding-left: 10px;
    }

    #app .home-page .front article {
        font-size: 18px;
    }

    #app .home-page .front article,
    #app .home-page .front ul {
        margin-top: 10px;
    }

    #app .home-page .front li {
        list-style: none;
        margin-left: 20px;
        font-size: 16px;
        margin-top: 10px;
    }
</style>
