<template>
    <div>
        <!-- [TITLE] Title area -->
        <page-title />

        <!-- [SEARCH] Search area -->

        <h1> 기본 검색 영역 (라인 1, 텍스트 + combo box) </h1>
        <p>page-searchbox--col2 클래스 사용</p>
        <p>하나의 컴포넌트로 모듈화 할 수 있을지 확인</p>
        <p>combo box 는 (V-Select) vuetify </p>

        <!-- FixMe-->
        <!--<div v-html="rawHtml"></div>-->

        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col2">
            <div class="page-searchbox__row">
                <!-- [SEARCH] Search items -->
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" label="게시판" v-model.trim="searchCondition.searchText" placeholder="게시판 키" maxlength="50"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{this.td.useYn}}</div>
                    <span class="---has-to-be-span---">
              <v-select item-value="value" :items="useYnCombo" v-model="searchCondition.boardUseYn" class="narrow-search-select" />
            </span>
                </div>
            </div>
        </div>

        <br>
        <br>

        <pre class="code">
          {{rawHtml}}
     </pre>

        <br />
        <br />
        <hr>
        <h1> 검색 영역 (라인 2, 텍스트 + combo box + combo box + Calendar) </h1>
        <p>page-searchbox--col3 클래스 사용</p>
        <p>combo box 는 (V-Select) vuetify </p>
        <p> double-calendar 컴포넌트 사용 </p>


        <!-- FixMe-->
        <!--<div v-html="rawHtml"></div>-->

        <!-- Search Area -->
        <!-- [SEARCH] Search area -->
        <div class="page-searchbox page-searchbox--col3">
            <!-- [SEARCH] 1st row, Search items : System Key / User -->
            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell">
                    <v-text-field name="searchText" label="사용자" v-model.trim="searchCondition.searchText" maxlength="30" placeholder="성명 또는 아이디"></v-text-field>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">시스템</div>
                    <span class="---has-to-be-span---">
                    <v-select :items="systemList" v-model="systemSelected" item-value="systemKey" item-text="systemName" />
          </span>
                </div>
                <div class="page-searchbox__item-cell">
                    <div class="page-searchbox__item-title">{{$td('message.result', '결과')}}</div>
                    <span class="---has-to-be-span---">
                    <v-select :items="statusValues" v-model="loginStatus" item-value="value" class="narrow-search-select" />
          </span>
                </div>
            </div>

            <div class="page-searchbox__row">
                <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">
                    <div class="page-searchbox__item-title">{{ $td('datetime.event', '발생일시') }}</div>
                    <!-- use Calendar Module -->
                    <double-calendar :fromDoubleObj="fromDate" :endDoubleObj="endDate" :term="1"
                                     v-on:update:fromDoubleObj="fromDate.dateText= $event"
                                     v-on:update:endDoubleObj="endDate.dateText= $event">
                    </double-calendar>
                </div>
            </div>


        </div>

        <br>
        <br>

        <pre class="code">
          {{search2Html}}
    </pre>

        <br>
        <br>


    </div>
</template>

<script>

    import CodeService from '@/util/code/CodeService';
    import Calendar from '@/components/Calendar';
    import DoubleCalendar from '@/components/DoubleCalendar';

    export default {

        components: {
            DoubleCalendar,
            Calendar,
        },

        data() {

            return {

                useYnCombo: [],
                searchCondition: {
                    searchText: '',
                    boardUseYn: '',
                },
                td: {
                    board: this.$i18n.td('menu-board.board', '게시판'),
                    useYn: this.$i18n.td('message.use-yn', '사용여부')
                },

                systemSelected: '',
                statusValues: [
                    {text: this.$i18n.td('message.all', '전체'), value: ''},
                    {text: this.$i18n.td('message.login-success', '로그인 성공'), value: 'SUCCESS'},
                    {text: this.$i18n.td('message.login-fail', '로그인 실패'), value: 'FAIL'},
                    {text: this.$i18n.td('system.logout', '로그아웃'), value: 'LOGOUT'}
                ],

                loginStatus: '',
                fromDate: {
                    dateText: '',
                    dateDisplay: false,
                },

                endDate: {
                    dateText: '',
                    dateDisplay: false,
                },

                rawHtml: '<div class="page-searchbox page-searchbox--col2">\n' +
                    '        <div class="page-searchbox__row">\n' +
                    '          <!-- [SEARCH] Search items -->\n' +
                    '          <div class="page-searchbox__item-cell">\n' +
                    '            <v-text-field name="searchText" :label="td.board" :placeholder="123131" maxlength="50"></v-text-field>\n' +
                    '          </div>\n' +
                    '          <div class="page-searchbox__item-cell">\n' +
                    '            <div class="page-searchbox__item-title">{{this.td.useYn}}</div>\n' +
                    '            <span class="---has-to-be-span---">\n' +
                    '              <v-select item-value="value" :items="useYnCombo" v-model="searchCondition.boardUseYn" class="narrow-search-select"/>\n' +
                    '            </span>\n' +
                    '          </div>\n' +
                    '        </div>\n' +
                    '      </div>',

                search2Html: '  <div class="page-searchbox__row">\n' +
                    '            <div class="page-searchbox__item-cell page-searchbox__item-cell--datepicker-comboset page-searchbox__item-cell--colspan2">\n' +
                    '                <div class="page-searchbox__item-title">{{ $td(\'datetime.event\', \'발생일시\') }}</div>\n' +
                    '                <!-- use Calendar Module -->\n' +
                    '                    <double-calendar :fromDoubleObj="fromDate" :endDoubleObj="endDate" :term="30"\n' +
                    '                                     v-on:update:fromDoubleObj="fromDate.dateText= $event"\n' +
                    '                                     v-on:update:endDoubleObj="endDate.dateText= $event">\n' +
                    '                    </double-calendar>\n' +
                    '            </div>\n' +
                    '        </div>'
            };
        },

        created() {
            this.useYnCombo = CodeService.getCodeDetailList('use-yn', true);
        },

        computed: {
            systemList: function () {
                return [{systemKey: '', systemName: this.$i18n.td('message.all', '전체')}].concat(this.$store.state.loginStore.systemInfo);
            }
        },

    };
</script>

<style scoped>

    .code {
        border: 2px solid blue;
    }


</style>
