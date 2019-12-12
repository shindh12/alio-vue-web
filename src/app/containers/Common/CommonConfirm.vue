<template>
    <v-layout row justify-center @input="closeDialog">
        <v-dialog v-model="confirmDialog" persistent max-width="390" @keyup.esc="closeDialog">
            <v-card>
                <v-card-title class="headline">{{ title }}</v-card-title>
                <v-card-text> {{ message }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="disagree">{{$td('button.no', '아니요')}}</v-btn>
                    <v-btn @click.native="agree">{{$td('button.yes', '예')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script>
    export default {
        props: ['title', 'message', 'confirmDialog'],
        watch: {
            confirmDialog(status) {
                if (status === true) {
                    if (this.title == undefined) {
                        this.title = 'Confirm';
                    }
                }
            }
        },
        methods: {
            closeDialog() {
                this.$emit('disagree');
            },
            disagree() {
                this.$emit('disagree');
            },
            agree() {
                this.$emit('agree');
            },
        }
    };
</script>
