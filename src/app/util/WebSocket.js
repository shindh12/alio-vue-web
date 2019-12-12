import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

export const isdpSocket = {
    data() {
        return {
            socket: '',
            stompClient: '',
            socketConnected: false,
            received_messages: []
        };
    },

    methods: {
        socketConnect() {
            this.socket = new SockJS(axios.defaults.baseURL + '/login/socket/endpoint');
            this.stompClient = Stomp.over(this.socket);
            this.stompClient.connect({}, (frame) => {
                this.socketConnected = true;
                console.log('Frame Area');
                console.log(frame);
                this.stompClient.subscribe('/subscribe/login/duplication/' + this.loginId, (tick) => {
                    console.log('Tick Area');
                    console.log(tick);
                    this.$notify({
                        title: '중복로그인으로 인해 로그아웃 됩니다.',
                        text: 'IP : ' + tick.body,
                        type: 'warn'
                    });
                    this.stompClient.disconnect();
                    this.received_messages.push(tick);
                    this.$cookie.set("ISDP-TOKEN", '', { expires: '1s' })
                    this.$store.dispatch('logout');
                    this.$router.push({path : '/login'});
                });
            }, (error) => {
                console.log('Error Area');
                console.log(error);
                this.socketConnected = false;
            });
        },
        socketDisconnect() {
            if (this.stompClient) {
                this.stompClient.socketDisconnect();
            }
            this.socketConnected = false;
        }
    }
};
