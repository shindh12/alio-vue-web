<template>
    <div>
        <!-- [TITLE] Title area -->
        <page-title />

        <h1>Excel 사용법 A to Z</h1>
        <h2>복붙</h2>
        <v-btn small color="normal" @click="exportExcel(templateData)">Template</v-btn>
        <div class="card--search">
            <div class="card__search-comp-area full-area">
                <div class="card__search-comp-area__label">Excel Data</div>
                <div class="card__search-comp-area__comp">
                    <textarea v-model="originalData" @keyup="keyupHandler" placeholder="Header를 제외한 Data를 Clipboard에 복사 후 'Ctrl+V' 키를 통해 붙여넣기 하셈."></textarea>
                </div>
            </div>
        </div>
        <div class="page-content">
            <v-btn small color="normal" :disabled="selectedList.length===0" @click="deleteList(jsonData, selectedList)">삭제</v-btn>
            <div class="table-area">
                <div class="table__body">
                    <!-- 첫번째 Worksheet 만 선택해서 보여줌 -->
                    <v-data-table :headers="headers" :items="jsonData" select-all item-key="No" v-model = "selectedList"
                                  :pagination.sync="pagination" :loading="loading" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details v-model="props.selected" :key="props.item.No"></v-checkbox>
                            </td>
                            <td class="text-xs-center">{{ props.item.No }}</td>
                            <td class="text-xs-center">{{ props.item.EmpNo }}</td>
                            <td class="text-xs-center">{{ props.item.EmpName }}</td>
                            <td class="text-xs-right">{{ props.item.Amount }}</td>
                        </template>
                    </v-data-table>
                </div>
            </div>
        </div>
        <br><hr>
        <h2>1. Copy & Paste로.. 테이블 저장 </h2> <br>
        <p>Template 부분</p>
        <pre class="code">{{rawCopyPasteHTML}}</pre>
        <br>
        <p>Script 부분</p>
        <pre class="code">{{rawCopyPasteScript}}</pre>
        <br><hr><br>
        <!-- [Excel] need to install 'xlsx' component-->
        <h2>Excel Upload</h2>
        <br>
        <p>input file tag 디자인도 생각해봐야함</p>
        <input type="file" id="excelUpload" @change="importExcel" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
        <!-- [CONTENT] Content area -->
        <div class="page-content">
            <div class="table-area">
                <div class="table__body">
                    <!-- 첫번째 Worksheet 만 선택해서 보여줌 -->
                    <v-data-table :headers="headers" :items="items[0]" select-all item-key="No"
                                  :pagination.sync="pagination" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td>
                                <v-checkbox primary hide-details :key="props.item.no"></v-checkbox>
                            </td>
                            <td class="text-xs-center">{{ props.item.No }}</td>
                            <td class="text-xs-center">{{ props.item.EmpNo }}</td>
                            <td class="text-xs-center">{{ props.item.EmpName }}</td>
                            <td class="text-xs-right">{{ props.item.Amount }}</td>
                        </template>
                    </v-data-table>
                </div>
            </div>
        </div>
        <br><hr><br>
        <h2>2. Excel Upload </h2> <br>
        <p>Template 부분</p>
        <pre class="code">{{rawExcelUploadHTML}}</pre>
        <br>
        <p>Script 부분</p>
        <pre class="code">{{rawExcelUploadScript}}</pre>
        <br><hr><br>
        <h2>Excel Download</h2>
        <p>위 Table Data 기준으로 Export 받기</p>
        <v-btn small color="normal" @click="exportExcel(items[0])">Export</v-btn>
        <hr>
        <h2>3. Excel Download </h2> <br>
        <p>Template 부분</p>
        <pre class="code">{{rawExcelDownloadHTML}}</pre>
        <br>
        <p>Script 부분</p>
        <pre class="code">{{rawExcelDownloadScript}}</pre>
        <br><hr><br>
    </div>
</template>

<script>
    import XLSX from 'xlsx';
    import RS from '@/constant/ResponseCode';

    export default {
        data() {
            return {
                items : [],
                templateData: [
                   {"No" : "1", "EmpNo" : "26059", "EmpName" : "킹기훈", "Amount" : "5000"}
                ],
                originalData: '',
                jsonData: [],
                selectedList : [],
                headers : [
                    {text: 'No', width: '10px', align: 'center', sortable: false, value: 'No'},
                    {text: 'EmpNo', width: '120px', align: 'center', sortable: false, value: 'EmpNo'},
                    {text: 'EmpName', width: '120px', align: 'center', sortable: false, value: 'EmpName'},
                    {text: 'Amount', width: '120px', align: 'center', sortable: false, value: 'Amount'},
                ],
                loading : false,
                pagination: {rowsPerPage: 15},

                rawCopyPasteHTML : "<textarea v-model=\"originalData\" @keyup=\"keyupHandler\" placeholder=\"Header를 제외한 Data를 Clipboard에 복사 후 'Ctrl+V' 키를 통해 붙여넣기 하셈.\"></textarea>",
                rawCopyPasteScript: "keyupHandler() {\n"
                    + "\tif(this.originalData === '') return ;\n"
                    + "\tthis.isLoading(true);\n"
                    + "\tthis.convTxtToJson(this.originalData);\n"
                    + "\tthis.originalData = '';\n"
                    + "\tthis.isLoading(false);\n"
                    + "},\n"
                    + "convTxtToJson(str) {\n"
                    + "\tlet rowList = str.split('\\n');\n"
                    + "\tlet convRow = [];\n"
                    + "\trowList.forEach((row, index) => {\n"
                    + "\t\tconvRow = row.split('\\t');\n"
                    + "\t\tif(row.length === 0) return ;\n"
                    + "\t\tlet json = this.generateJson(convRow, index);\n"
                    + "\t\tthis.jsonData.push(json);\n"
                    + "\t})\n"
                    + "},\n"
                    + "generateJson(row, index) {\n"
                    + "\tlet json = {};\n"
                    + "\tjson['index'] = index;\n"
                    + "\tfor (let i in this.headers) {\n"
                    + "\t\tjson[this.headers[i].text] = row[i];\n"
                    + "\t}\n"
                    + "\treturn json;\n"
                    + "},\n"
                    + "deleteList(json, selected) {\n"
                    + "\tlet deleteIndex = [];\n"
                    + "\tfor (let i in selected) { deleteIndex.push(selected[i].index); }\n"
                    + "\tdeleteIndex.sort(function compare(a, b) { return b - a; });\n"
                    + "\tfor (let i in deleteIndex) {\n"
                    + "\t\tlet idx = json.findIndex((item, idx) => {\n"
                    + "\t\t\treturn item.index === deleteIndex[i];\n"
                    + "\t\t});\n"
                    + "\t\tjson.splice(idx, 1);\n"
                    + "\t}\n"
                    + "\tthis.selectedList = [];\n"
                    + "},",
                rawExcelUploadHTML : "<input type=\"file\" id=\"excelUpload\" @change=\"importExcel\" accept=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\"/>",
                rawExcelUploadScript : "importExcel(event) {\n"
                    + "\tconst file = event.target.files[0];\n"
                    + "\tif(!this.beforeUpload(file.size)) return ;\n"
                    + "\tlet reader = new FileReader();\n"
                    + "\treader.onload = (e) => {\n"
                    + "\t\tlet data = reader.result;\n"
                    + "\t\tlet workbook = XLSX.read(data, {type: 'binary'});\n"
                    + "\t\tworkbook.SheetNames.forEach(sheetName => {\n"
                    + "\t\t\tconst roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);\n"
                    + "\t\t\tthis.items.push(roa);\n"
                    + "\t\t});\n"
                    + "\t};\n"
                    + "\treader.readAsBinaryString(file);\n"
                    + "},",
                rawExcelDownloadHTML : "<v-btn small color=\"normal\" @click=\"exportExcel(items[0])\">Export</v-btn>",
                rawExcelDownloadScript: "exportExcel(item) {\n"
                    + "\t// worksheet 하나만 생성해서 파일로 생성\n"
                    + "\tlet ws = XLSX.utils.json_to_sheet(item);\n"
                    + "\tlet wb = XLSX.utils.book_new();\n"
                    + "\tXLSX.utils.book_append_sheet(wb, ws, 'sheet1');\n"
                    + "\tXLSX.writeFile(wb, 'template.xlsx')\n"
                    + "},",
            }
        },
        methods: {
            keyupHandler() {
                if(this.originalData === '') return ;
                this.isLoading(true);
                this.convTxtToJson(this.originalData);
                this.originalData = '';
                this.isLoading(false);
            },
            convTxtToJson(str) {
                let rowList = str.split('\n');
                let convRow = [];
                rowList.forEach((row, index) => {
                    convRow = row.split('\t');
                    if(row.length === 0) return ;
                    let json = this.generateJson(convRow, index);
                    this.jsonData.push(json);
                })
            },
            generateJson(row, index) {
                let json = {};
                json['index'] = index;
                for (let i in this.headers) {
                    json[this.headers[i].text] = row[i];
                }
                return json;
            },
            deleteList(json, selected) {
                let deleteIndex = [];
                for (let i in selected) { deleteIndex.push(selected[i].index); }
                deleteIndex.sort(function compare(a, b) { return b - a; });
                for (let i in deleteIndex) {
                    let idx = json.findIndex((item, idx) => {
                        return item.index === deleteIndex[i];
                    });
                    json.splice(idx, 1);
                }
                this.selectedList = [];
            },
            isLoading(value) {
                this.loading = value;
            },
            // excel file upload 후 json data로 import
            importExcel(event) {
                const file = event.target.files[0];
                if(!this.beforeUpload(file.size)) return ;
                let reader = new FileReader();
                reader.onload = (e) => {
                    let data = reader.result;
                    let workbook = XLSX.read(data, {type: 'binary'});
                    workbook.SheetNames.forEach(sheetName => {
                        const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                        this.items.push(roa);
                    });
                };
                reader.readAsBinaryString(file);
            },
            // upload 된 json data를 excel 파일로 export
            exportExcel(item) {
                // worksheet 하나만 생성해서 파일로 생성
                let ws = XLSX.utils.json_to_sheet(item);
                let wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'sheet1');
                XLSX.writeFile(wb, 'template.xlsx')
            },
            beforeUpload(size) {
                const isLt10M = size / 1024 / 1024 < 10;
                if (isLt10M) {
                    return true
                }
                this.$notify({title: RS.FILE_UPLOAD_SIZE_FAIL.TITLE, text: RS.FILE_UPLOAD_SIZE_FAIL.TEXT, type: 'warning'});
                return false;
            }
        }
    }
</script>

<style scoped>
.card--search {min-height:40px;border:1px solid #888;position:relative;margin-bottom:37px;font-size:0;}
.card__search-comp-area__label {width:120px;float:left;padding-left:20px;font-weight:bold;}
.card__search-comp-area.full-area {width:100%;}
.card__search-comp-area {display:inline-block;position:relative;vertical-align:middle;line-height:40px;height:40px;font-size:13px;border-right:1px solid #ebebeb;}
.card__search-comp-area__comp  {margin-left:120px;height:40px;line-height:40px;vertical-align:middle; width:90%}
.card__search-comp-area__comp textarea {height:26px; line-height:26px; width:100%; border: 1px solid #F7F7F7; background: #f7f7f7; overflow:hidden; padding:0px 4px; resize:none; vertical-align: middle;}
.code {
    border: 2px solid blue;
}

</style>
