<template>
    <v-menu :close-on-content-click="false"
            v-model="dateObj.dateDisplay"
            nudge-right="0"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px">
        <v-text-field class="search-datepicker"
                      slot="activator"
                      v-model.trim="dateObj.dateText"
                      prepend-icon="event"
                      readonly
                      @blur="dateObj.dateText = parseDate(dateObj.dateText)" />
        <v-date-picker v-model="dateObj.dateText" no-title @input="dateObj.dateDisplay = false" />
    </v-menu>
</template>

<script>

    export default {
        props: [
            'dateObj'
        ],

        methods: {
            parseDate(date) {
                if (!date) {
                    return null;
                }
                let dateArray = date.split('-');
                let month = dateArray[1];
                let day = dateArray[2];
                let year = dateArray[0];
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            },
        }

    }
</script>
