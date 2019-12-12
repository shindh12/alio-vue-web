<template>
    <div>
        <v-dialog :value="apiHistoryDetail" @input="closeDialog" max-width="800px">
            <v-card id="api-history-detail-popup">
                <v-card-title>
                    <span class="headline"> Rest이력 상세 조회</span>
                    <div class="modal-close" @click="closeDialog">
                        <v-icon>close</v-icon>
                    </div>
                </v-card-title>
                <br />
                <h3>Description</h3>
                <v-card-text>
                    <v-text-field id="styled-input" multi-line v-model="description" readonly />
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import DialogUtil from '@/util/dialog';

    export default {
        components: {DialogUtil},
        props: [
            'apiHistoryDetail',
            'description'
        ],
        methods: {
            closeDialog() {
                this.$emit('closeDialog');
            }
        },
        mounted() {
            DialogUtil.addWheelEventListener();
        }
    };
</script>

<style>
    #api-history-detail-popup {
        margin-top: 10px;
    }

    #styled-input {
        height: 250px;
    }

</style>
