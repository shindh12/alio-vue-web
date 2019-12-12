<template>
    <div>
        <v-select :items="items" v-model="selectedItem" :label="label" single-line
                  item-text="codeName"
                  item-value="codeKey"
                  @change="onChange"
        ></v-select>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        components: [axios],
        data() {
            return {
                items: [],
                selectedItem: ''
            };
        },
        props: {
            'color': {type: String}
            , 'combobox': {type: Boolean, default() {return false;}}
            , 'dark': {type: Boolean, default() {return false;}}
            , 'disabled': {type: Boolean, default() {return false;}}
            , 'groupKey': {type: String, required: true}
            , 'label': {type: String, default() {return '';}}
            , 'editable': {type: Boolean, default() {return false;}}
            , 'hint': {type: String}
            , 'itemDisabled': {type: String, default() {return 'disabled';}}
            , 'required': {type: Boolean, default() {return false;}}
            , 'rules': {type: Array, default() {return [];}}

        },

        mounted() {
            this.findCodeList();
        },
        methods: {
            findCodeList() {
                axios
                .get('/rest/v1/code/detail/' + this.groupKey)
                .then(response => {
                    response.data.forEach(element => {
                        console.log(' m :  ' + element.messageGroup + '.' + element.messageCode + '   ,  ' + element.defaultName);
                        element.codeName = this.$i18n.td(element.messageGroup + '.' + element.messageCode, element.defaultName);
                    });
                    this.items = response.data;
                })
                .catch(error => {
                    this.$notify(
                        {title: error.message, text: error.response ? this.$i18n.td(error.response.data.errMsgKey, error.response.data.errMsg) : error.message, type: 'error'});
                });
            },
            onChange(value) {
                this.$emit('input', value);
            }
        }
    };

</script>
