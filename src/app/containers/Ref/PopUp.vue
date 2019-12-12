<template>
    <div>
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->
        <h1>작은 PopUp</h1>

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
        <recipe-role-dialog :showDialog="dialog" :targetRole="targetRoleObj"
                            @closeDialog="closeDialog" @saveDialog="saveDialog"></recipe-role-dialog>

        <br><br>
        <p>v-dialog 사용 </p>

        <h2> 1. PopUp : v-daialog 사용</h2>
        <pre class="code">
          {{rawHtml}}
        </pre>
        <br><br>

        <h2> 2. title : v-card-title 사용</h2>
        <pre class="code">
          {{rawHtmlTitle}}
        </pre>
        <br><br>

        <h2> 3. text : v-card-text 사용</h2>
        <pre class="code">
          {{rawHtmlText}}
        </pre>
        <br><br>

        <h2> 4. switch : v-switch 사용</h2>
        <pre class="code">
          {{rawHtmlSwitch}}
        </pre>
        <br><br>

        <h2> 4. actions : v-card-actions 사용</h2>
        <pre class="code">
          {{rawHtmlActions}}
        </pre>
        <br><br>
    </div>
</template>

<script>
    import axios from 'axios';
    import RecipeRoleDialog from './Popup/RecipeRoleDialog';

    export default {
        components: {
            RecipeRoleDialog
        },

        data() {
            return {
                dialog: false,
                targetRoleObj: {
                    type: Object,
                    default: null
                },
                rawHtml: '<v-dialog :value="showDialog" @input="closeDialog" max-width="400px" > ...  </v-dialog>',
                rawHtmlTitle: '  <v-card-title>\n' +
                    '                    <span class="headline"> {{$td(\'message.role\', \'역할\')}} {{$td(\'button.\'+this.mode , this.mode )}} </span>\n' +
                    '                    <div class="modal-close" @click="closeDialog"><v-icon>close</v-icon></div>\n' +
                    '                </v-card-title>',
                rawHtmlText: '               <v-card-text class="field-box" >\n' +
                    '                    <tb-validator class="tb-validator-in-dialog" form v-model="validRole" ref="form-valid" @click.native="clearValid">\n' +
                    '                        <tb-validator :target="updatedRole.roleName" :rules="[rules.required, rules.roleName,rules.nospace]" lazy>\n' +
                    '                            <v-text-field ref="roleName" :label="$td(\'message.role-name\', \'역할명\')" v-model.trim="updatedRole.roleName"\n' +
                    '                                          @keyup.enter="saveRole" required maxlength="50" ></v-text-field>\n' +
                    '                        </tb-validator>           </v-card> ',
                rawHtmlSwitch: ' <v-switch :label="$td(\'message.use-yn\', \'사용여부\')" v-model="updatedRole.useYn" true-value="Y" false-value="N" ></v-switch>',
                rawHtmlActions: '    <v-card-actions>\n' +
                    '                    <v-btn @click.native="closeDialog">{{ $td(\'button.cancel\', \'취소\') }}</v-btn>\n' +
                    '                    <v-btn primary v-if="saveBtnAuth" @click.native="onClickSave"> {{ $td(\'button.save\', \'저장\') }} </v-btn>\n' +
                    '                </v-card-actions>',

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
