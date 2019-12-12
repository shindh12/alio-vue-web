<template>
    <div class="page-searchbox__item-cell--datepicker-comboset__wrapper">
        <calendar :dateObj="fromDoubleObj"></calendar>
        <calendar :dateObj="endDoubleObj"></calendar>
        <v-btn-toggle v-model="dateTerm" mandatory ref="buttonGroup">
            <v-btn value="1" @click="changeDate(1)"><span>{{ $td('button.today', '오늘') }}</span></v-btn>
            <v-btn value="7" @click="changeDate(7)"><span>{{ $td('button.a-week', '1주일') }}</span></v-btn>
            <v-btn value="30" @click="changeDate(30)"><span>{{ $td('button.a-month', '1개월') }}</span></v-btn>
        </v-btn-toggle>
    </div>
</template>

<script>

    import Calendar from '@/components/Calendar';

    const termArr = [1, 7, 30];

    export default {
        components: {Calendar},
        props: {
            fromDoubleObj: Object,
            endDoubleObj: Object,
            term: {
                type: Number,
                required: true,
                default: 1,
                validator: function (value) {
                    // The value must match one of these items
                    return [1, 7, 30].indexOf(value) !== -1;
                }
            }
        },
        data() {
            return {
                dateTerm: 1
            };
        },

        mounted() {
            this.changeDate(this.term);
        },

        methods: {
            changeDate(date) {

                let selectedButtonIdx, interval;

                if (termArr.indexOf(date) !== -1) {
                    selectedButtonIdx = termArr.indexOf(date);
                    interval = date;
                } else {
                    // prop 이 잘못 넘어온 경우 Default 처리
                    selectedButtonIdx = 0;
                    interval = termArr[0];
                }

                // 버튼 선택되도록
                this.$refs.buttonGroup.updateValue(selectedButtonIdx);

                let today = new Date();
                let mm = today.getMonth() + 1; // getMonth() is zero-based
                let dd = today.getDate();
                let todayString = [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
                // this.endDate.dateText = todayString;
                this.$emit('update:endDoubleObj', todayString);

                let yesterDay = new Date();
                let oneDayTimestamp = 1 * 24 * 60 * 60 * 1000;
                let yesterDayTmp = yesterDay.getTime() - oneDayTimestamp;
                yesterDay.setTime(yesterDayTmp);
                let mm2 = yesterDay.getMonth() + 1; // getMonth() is zero-based
                let dd2 = yesterDay.getDate();
                // let yesterDayString = [yesterDay.getFullYear(), '-', (mm2 > 9 ? '' : '0') + mm2, '-', (dd2 > 9 ? '' : '0') + dd2].join('');

                if (interval == 1) {
                    this.$emit('update:fromDoubleObj', todayString);  // 2019.09.04 1일에 대해 당일로 처리 (요건 변경)
                } else {
                    today = new Date(today.setDate(today.getDate() - interval));
                    mm = today.getMonth() + 1; // getMonth() is zero-based
                    dd = today.getDate();
                    // this.fromDate.dateText = [today.getFullYear(), "-", (mm > 9 ? '' : '0') + mm, "-", (dd > 9 ? '' : '0') + dd].join('');
                    this.$emit('update:fromDoubleObj', [today.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join(''));
                }
            },
        },

    };
</script>
