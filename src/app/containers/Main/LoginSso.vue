<template>
    <div>
        <form id="ssoForm" :action="knoxUrl" method="post">
            <input type="hidden" name="SAMLRequest" v-model="SAMLRequest" />
        </form>
    </div>
</template>

<script>
    import axios from 'axios';
    import {isdpSocket} from '@/util/WebSocket';

    const SESSION_TIME_OUT = '30m';

    export default {
        data() {
            return {
                samlParams: {},
                knoxUrl: '',
                SAMLRequest: '',
                loginId: ''
            };
        },
        mixins: [isdpSocket],
        created() {
            if (Object.keys(this.$route.query).length) {
                this.samlParams = this.$route.query;
                this.knoxUrl = this.$route.query.knoxUrl;
                this.SAMLRequest = this.$route.query.SAMLRequest;
            }
        },
        mounted() {
            if (Object.keys(this.$route.query).length) {
                document.forms[0].submit();
            } else {
                let tokenUrl = '/login/token';
                let that = this;
                axios.get(tokenUrl)
                .then(function (res) {
                    that.loginId = res.data.user.login;
                    that.socketDisconnect();
                    that.socketConnect();
                    that.$store.commit('current', res.data.user);
                    // that.$store.dispatch('systemInfo', res.data.user);
                    that.$emit('refreshMenu', res.data.user);
                    that.$cookie.set('ISDP-TOKEN', res.data.token.token, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                    that.$cookie.set('ISDP-LOGIN', res.data.user.login, {expires: res.data.timeout ? res.data.timeout : SESSION_TIME_OUT});
                }).catch(error => {
                    that.errorMessage = error.response.data;
                });
            }
        },
        methods: {}
    };

</script>

<style scoped>

</style>
