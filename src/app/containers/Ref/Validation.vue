<template>
    <div>
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->
        <h1>Validation 사용법 A to Z</h1>

        <h2>Validation 을 사용할 때에는 tb-validator 모듈을 사용한다.</h2>

        <h2>필요한 Rule 은 공통 Rule 을 사용하고 필요한 경우 각 업무 화면에서 추가 정의 한다.</h2>

        <h2>아래의 Rule 은 공통으로 사용이 가능하다</h2>

        <ul style="padding-left: 20px;padding-top: 20px">
            <li>필수값 체크 : this.$rule.REQUIRED</li>
            <li>로그인 ID</li>
            <li>Password</li>
            <li>이메일: this.$rule.EMAIL</li>
            <li>사용자이름</li>
            <li>공백체크</li>
        </ul>


        <hr />

        <div class="page-content">
            <!-- [TABLE] ㅇㅇ area -->
            <div class="table-area">

                <div class="table__action">
                    <div class="table__action__default">
                        <v-btn @click.native="openDialog()">추가</v-btn>
                    </div>
                </div>

            </div>
        </div>

        <!-- [MODAL] user edit popup(invisible) -->
        <recipe-user-add-edit-popup :userAddEditDialog="dialog" formTitle="사용자 추가" :statusValues="statusValues" :editedItem="editedItem"
                                    @closeDialog="closeDialog" @saveDialog="saveDialog">
        </recipe-user-add-edit-popup>


        <br><br>
        <p>tb-validator 사용 (전체 + 각 input 요소들)</p>
        <pre class="code">
          {{rawHtml}}
     </pre>
        <br><br>
        <p>현재는 팝업 open 시에 데이터를 다 reset 처리함</p>


    </div>
</template>

<script>
    import axios from 'axios';
    import RecipeUserAddEditPopup from './Popup/RecipeUserAddEditPopup';

    export default {
        components: {
            RecipeUserAddEditPopup
        },

        data() {
            return {
                dialog: false,
                statusValues: [
                    {text: this.$i18n.td('message.active', '활성'), value: 1},
                    {text: this.$i18n.td('message.inactive', '비활성'), value: 2},
                    {text: this.$i18n.td('message.lock', '잠김'), value: 3},
                ],
                editedItem: {
                    login: '',
                    name: '',
                    email: '',
                    statusId: 1,
                    statusSelect: 1,
                },
                rawHtml: '<tb-validator class="tb-validator-in-dialog" form v-model="validUser" ref="form-valid" @click.native="clearValid">\n' +
                    '            <tb-validator :target="editedItem.login" :rules="[this.$rule.REQUIRED]" lazy>\n' +
                    '              <v-text-field ref="login" :label="$i18n.td(\'user.id\', \'아이디\')" v-model.trim="editedItem.login" :disabled=isDisabled required maxlength="12" />\n'
                    +
                    '            </tb-validator>\n' +
                    '</tb-validator>'

            };
        },

        computed: {},
        watch: {},

        created() {

        },

        methods: {

            openDialog() {
                this.dialog = true;
            },
            closeDialog() {
                this.dialog = false;
            },
            saveDialog(e) {
                this.closeDialog();
            },

        }

    };
</script>

<style scoped>

    .code {
        border: 2px solid blue;
    }

    #user-list-page table.datatable {
        table-layout: fixed;
    }


    .table__action {
        height: $ table-action-height;
        line-height: calc(#{$table-action-height} - 1px);
        vertical-align: middle;
        position: absolute;
        display: inline-block;
        left: 0px;
        top: 0px;
    }

</style>
