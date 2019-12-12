<template>
    <v-layout row justify-center @input="closeDialog">
        <v-dialog v-model="noticeDialog" persistent max-width="390" @keyup.esc="closeDialog">
            <v-card>
                <v-card-title class="headline">{{ title }}</v-card-title>
                <v-card-text> {{ message }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="ok">{{ $td('button.confirm', '확인') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script>
    export default {
        props: ['title', 'message', 'noticeDialog'],
        watch: {
            confirmDialog(status) {
                if (status === true) {
                    if (this.title == undefined) {
                        this.title = 'Notice';
                    }
                }
            }
        },
        methods: {
            closeDialog() {
                this.$emit('ok');
            },
            ok() {
                this.$emit('ok');
            }
        }
    };
</script>
