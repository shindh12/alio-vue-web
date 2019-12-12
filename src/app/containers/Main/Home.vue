<template>
    <div class="home-page">
        <div class="back"></div>
        <div v-if="contents===''" class="front">
            <h1>Point DP Admin Service</h1>
            <hr>
            <h2>Point DP Admin Service 란?</h2>
            <article>
                Point DP Admin Portal은 시스템에 대하여 전반적인 관리 기능을 제공합니다. <br>
                시스템의 관리나, 관련된 리소스(코드, 메시지)관리, 그리고 각 사용자에 대한 역할과 권한에 대하여
                설정할 수 있습니다.
            </article>
            <ul>
                <li><b>시스템</b> : Point I/F 서버의 설정을 관리합니다.</li>
                <li><b>사용자/메뉴</b> : 각 시스템별 가입된 사용자와 그의 역할 및 메뉴에 대하여 설정합니다.</li>
                <li><b>보안</b> : 상세 기능 단위로 권한을 설정 가능합니다.</li>
                <li><b>이력</b> : 시스템을 사용한 이력을 확인합니다.(개인정보, 로그인, 메뉴, 파일, REST)</li>
                <li><b>메일/결재</b> : 메일과 결재 기능을 사용합니다.(Knox 연계, LEGO 내부)</li>
            </ul>
        </div>
        <div v-if="contents!==''" class="front">
            <p v-html="contents"></p>
        </div>
    </div>
</template>

<script>

    export default {
        components: {},
        data() {
            return {
                contents: '',
                sanitize: '', /* Content sanitizer for XSS */
            };
        },
        mounted() {
            this.$http.get('rest/v1/configuration/get/HOME').then(res => {
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
        background-image: url(../../../app/assets/backs/home-01.jpg);
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
