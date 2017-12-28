import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { PouchdbService } from './pouchdb.service';
import { Ng4FilesStatus, Ng4FilesSelected } from './angular4-files-upload';
import { DbnamedialogComponent } from './dbnamedialog/dbnamedialog.component';
import { FusiondialogComponent } from './fusiondialog/fusiondialog.component';
import { WizardoneComponent } from './wizardone/wizardone.component';
import { MatDialog, MatTableDataSource, MatSort, MatMenu } from '@angular/material';
import { DbStructure, TableDataStructure, AnalysisDataStructure, ConcordancerStructure } from './dbstructure';

import {Subscription} from "rxjs";
import {TimerObservable} from "rxjs/observable/TimerObservable";

import { Stat } from './config/Stat';
// import * as Crawler from 'js-crawler';
// import { htmlToPlainText } from './config/textversion';
import { WizardtwoComponent } from './wizardtwo/wizardtwo.component';
// const toFile = require('data-uri-to-file');

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild('analysissort') analysissort: MatSort;

    @ViewChild('filesort') filesort: MatSort;

    @ViewChild('concordancersort') concordancersort: MatSort;

    public people: Array<any>;
    public selectedFiles;

    public indexDbList:Array<Array<any>>;
    public dataTypeStatus : boolean;
    public indexDbLength : number = 0;
    public indexDbName : string = "AAAA";
    selectedIndexDbName : string = "";
    indexDbHeader : any;
    public indexDbContent : DbStructure;  // temporary index Db Content

    analysisStructure : Array<AnalysisDataStructure>;
    analysisdataSource : any;
    analysisColumns = ['form','freq','total','spec'];

    tableStructure : TableDataStructure[];
    filedataSource : any;
    displayedColumns = ['url', 'type', 'token', 'content', 'date'];
    selectedRow : TableDataStructure;
    selectedAnalysisRow : AnalysisDataStructure;
    flag : boolean = false;
    dbfullcontent : any;

    // SectionMap tag variable
    mouseFlag : boolean = false;
    checkBoxValue = [];
    countPage : number;

    // Concordancer Tab Variable
    searchterm : string;
    concordancerStructure : ConcordancerStructure[];
    concordancerdataSource : any;
    concordancerColumns = ['url', 'left_context', 'search_terms', 'right_context'];
    concordancerSelectedRow : ConcordancerStructure;
    exportProgress : number;
    exportProgressFileName : string;
    //Export Tab Variable
    optionvalue1 : any;
    optionvalue2 : any;
    optionvalue3 : any;
    selectedIndexDb : any;
    // Timer

    private subscription: Subscription;

    public constructor(private database: PouchdbService, private zone: NgZone, public dialog : MatDialog, public fusiondialog:MatDialog, private ref:ChangeDetectorRef) {
        this.indexDbContent = new DbStructure();
        this.dbfullcontent = [];
        this.analysisStructure = [];
        this.indexDbList = [];
        this.indexDbLength = 0;
        this.people = [];
        this.countPage = 0;
        this.indexDbHeader = {
            "pages" : 0,
            "types": 0,
            "tokens" : 0,
            "date" : "2017-01-01"
        };

        this.concordancerdataSource = new MatTableDataSource<ConcordancerStructure>(this.concordancerStructure);
        this.exportProgress = 0;
        this.exportProgressFileName = "";
    }

    public ngOnInit() {
        // this.database.sync("http://localhost:4984/extension");
        this.database.getChangeListener().subscribe(data => {
            let ii = this.indexDbLength;
            for(let i = 0; i < data.change.docs.length; i++) {
                this.zone.run(() => {
                    if(ii % 4 == 0) this.indexDbList.push([]);
                    this.indexDbList[Math.floor(ii / 4)].push(data.change.docs[i]);
                    ii++;
                });
            }
        });
        this.database.fetch().then(result => {
            for(let i = 0; i < result.rows.length; i++) {
                if(i % 4 == 0) this.indexDbList.push([]);
                this.indexDbList[Math.floor(i / 4)].push(result.rows[i].doc);
            }
            this.indexDbLength = result.rows.length;
            if(this.indexDbLength != 0){
                this.selectedIndexDbName = this.indexDbList[0][0].dbname;
                this.dataTypeStatus = this.indexDbList[0][0].datatype;
                this.getTableStructure(this.indexDbList[0][0]);
            }
        },
        error => {
            console.error(error);
        });
    }

    public onAnalysisTableRowSelect(event){
        console.log("AnalysisTable");
    }

    public onConcordancer(row: any){
        this.concordancerSelectedRow = row;
    }

    public onTableRowSelect(row : any, mode: boolean){
        this.selectedRow = row;
        this.analysisStructure = [];
        var stat : any;
        let res = this.selectedRow.fullcontent;
        // console.log(res);
        var resstring = this.utf16to8(res);
        // console.log(resstring);
        this.selectedRow.fullcontent = "" + resstring;

        let selection = [];
        
        stat = new Stat(this.dbfullcontent, 5);
        if(mode){
            let tempfullcontent=[];
            tempfullcontent.push(this.selectedRow.fullcontent);
            let pagestat = new Stat(tempfullcontent, 5);
            this.selectedRow.type = pagestat.nbtypes;
            this.selectedRow.token = pagestat.nbtokens;

            let count = 0, i, j = 0;
            /* gael : merged with the following loop to speed up
            for(i in this.checkBoxValue){
                if(this.checkBoxValue[i])
                    count++;
            }
            console.log("Count"+count);*/
            this.countPage = count;
            selection = new Array<number>(count); // selection=[0,1];  
            for(i in this.checkBoxValue){
                if(this.checkBoxValue[i]){
                    selection[j++] = i;
                    count++;
                }
            }
            console.log("AAAA"+selection);
        }
        else {
            selection=[row.id-1];
            this.countPage = 1;
        }

        var specobjects = stat.selectiontypes(selection).map(function(ty){ 
		    return Object.assign({type:ty}, stat.selectionSpec(selection,ty)); 
        });
        // console.log(specobjects);
        specobjects.sort(function(a, b) {return b.specInSel - a.specInSel;})
       
        for(var i = 0; i < specobjects.length; i++){
            let temp : AnalysisDataStructure;
            temp = new AnalysisDataStructure();
            // if(specobjects[i]["freqInSel"] != 0){
                if(specobjects[i]["type"].length > 10)
                    temp.form = specobjects[i]["type"].slice(0,10) + '...';
                else
                    temp.form = specobjects[i]["type"];
                temp.freq = specobjects[i]["freqInSel"];
                temp.total = specobjects[i]["totalFreqOfTok"];
                let num = specobjects[i]["specInSel"];
                temp.spec = num.toPrecision(6);
                this.analysisStructure = [...this.analysisStructure, temp];
            // }
        }

        // Get the Analysis Table Data.

        this.analysisdataSource = new MatTableDataSource<AnalysisDataStructure>(this.analysisStructure);
        this.analysisdataSource.sortingDataAccessor = (data: AnalysisDataStructure, property: string) => {
            switch (property) {
              case 'form': return data.form;
              case 'spec': return +data.spec;
              case 'total': return +data.total;
              case 'freq': return +data.freq;
              default: return '';
            }
        };
        this.analysisdataSource.sort = this.analysissort;
        // console.log(this.analysisStructure);
    }

    public getTableStructure(temp : DbStructure) {
        // console.log("Table Structure Function");

        // Clear TableStructure Data
        this.tableStructure = [];
        this.dbfullcontent = [];
        this.checkBoxValue = [];
        this.flag = false;
        let types = 0;
        let token = 0;
        let length = temp.datauri.length;
        let count = length;
        for(var i = 0; i < length; i++) {
            let item;
            item = new TableDataStructure();
            
            if(temp.filename[i].length < 80)
                item.url = temp.filename[i];
            else
                item.url = temp.filename[i].slice(0,39) + '......' + temp.filename[i].slice(temp.filename[i].length - 40, temp.filename[i].length);
            item.date = temp.date[i];
            item.datauri = temp.datauri[i];
            item.htmldata = temp.htmldata[i];
            const dataURI = temp.datauri[i];
            const fileReader = new FileReader();
            fileReader.onload = () => {
                count--;
                var res;
                res = fileReader.result;
                item.fullcontent = res;
                let tempstat : any;
                tempstat = new Stat(res.replace(/\/?\<.*\>/g," ").replace(/\s+/g," ").split(/§/), 5);
                item.type = tempstat.nbtypes;
                item.token= tempstat.nbtokens;
                item.id = length - count;
                this.dbfullcontent.push(res.replace(/\/?\<.*\>/g," ").replace(/\s+/g," "));
                if(res.length < 20){
                    item.content = res;
                } else {
                    item.content = res.slice(0, 19) + "....";
                }
                if( count != 0) this.tableStructure.push(item);
                else if(count == 0){
                    let stat : any;
                    stat = new Stat(this.dbfullcontent, 5);
                    this.indexDbHeader["types"] = stat.nbtypes;
                    this.indexDbHeader["token"] =stat.nbtokens;
                    this.tableStructure = [...this.tableStructure, item];
                    // console.log(this.tableStructure);
                    this.filedataSource = new MatTableDataSource<TableDataStructure>(this.tableStructure);
                    this.filedataSource.sortingDataAccessor = (data: TableDataStructure, property: string) => {
                        switch (property) {
                            case 'url': return data.url;
                            case 'type': return +data.type;
                            case 'token': return +data.token;
                            case 'content': return data.content;
                            case 'date': return data.date;
                            default: return '';
                        }
                    };
                    this.filedataSource.sort = this.filesort;

                    if(!this.flag )
                        this.selectedRow = this.tableStructure[0];
                    this.onTableRowSelect(this.selectedRow, false);
                   
                    // console.log(this.filedataSource);
                }
                // console.log(...this.tableStructure);
                if(!this.flag){
                    this.selectedRow = this.tableStructure[0];
                }
                this.flag = true;
            }
            this.indexDbHeader["pages"] = length;
            fileReader.readAsText(this.dataURItoBlob(dataURI, true));
            this.checkBoxValue.push(false);
        }
        this.indexDbHeader = {
            types,
            token,
            length,
            date : this.timestampToDate(Date.now())
        }
        console.log(this.checkBoxValue);
    }

    openDialog(): void {
        let dialogRef = this.dialog.open(DbnamedialogComponent, {
          width: '350px',
          data: { dbname: this.indexDbName }
        });
    
        dialogRef.afterClosed().subscribe(result => {
            if(!result) return;
            
            if(this.isDbNameTaken(result) == true){
                if(confirm("Database Name is Already Taken. Please provide a different name"))
                    this.openDialog();
                return;
            }
            this.indexDbName = result;
            console.log(this.indexDbName);

            //Save to Database

            if(this.indexDbLength % 4 == 0)
                this.indexDbList.push([]);
            console.log("Count of Row: ",Math.floor(this.indexDbLength / 4));

            this.indexDbContent.dbname = this.indexDbName;

            let temp : DbStructure;
            temp = new DbStructure();
            this.CopyDbStructure(this.indexDbContent, temp);
            this.database.put(temp.dbname, temp);
            this.indexDbList[Math.floor(this.indexDbLength / 4)].push(temp);

            this.indexDbLength += 1;
            this.selectedIndexDbName = this.indexDbName;

            this.indexDbHeader = {
                "pages" : 0,
                "types": 0,
                "tokens" : 0,
                "date" : "2017-01-01"
            };
            this.getTableStructure(temp);
        });
    }

    CopyDbStructure(from : DbStructure, copyTo: DbStructure){
        copyTo.datatype = from.datatype;
        copyTo.dbname = from.dbname;
        for(var i = 0; i < from.datauri.length; i++){
            copyTo.filename.push(from.filename[i]);
            copyTo.datauri.push(from.datauri[i]);
            copyTo.date.push(from.date[i]);
            copyTo.htmldata.push(from.htmldata[i]);
        }
    }

    public ClearIndexDbContent(){
        this.indexDbContent.dbname = '';
        this.indexDbContent.datauri = [];
        this.indexDbContent.filename = [];
        this.dbfullcontent = [];
    }

    public onIndexDbDelete(){
        if(confirm("Are you sure want to delete your Database?")){
            if(this.indexDbLength == 0){
                alert("You didn't have any Database");
            } else {
                let result : Array<Array<any>>;
                let i = 0, j = 0, ii = 0;
                result = [];
                for(i = 0; i < this.indexDbList.length; i++){
                    for(j = 0; j < this.indexDbList[i].length; j++){
                        if(ii % 4 == 0) result.push([]);
                        if(this.indexDbList[i][j].dbname != this.selectedIndexDbName){
                            result[Math.floor(ii / 4)].push(this.indexDbList[i][j]);
                            ii ++;
                        }
                    }
                }
                console.log('======================');
                console.log(result);
                this.indexDbList = result;
                this.indexDbLength -= 1;
                this.database.remove(this.selectedIndexDbName);            
                if(this.indexDbLength != 0)
                    this.selectedIndexDbName = result[0][0].dbname;
            }
        }
    }

    public filesSelect(selectedFiles: Ng4FilesSelected): void {
        if (selectedFiles.status !== Ng4FilesStatus.STATUS_SUCCESS) {
            this.selectedFiles = selectedFiles.status;
            return;
            // Hnadle error statuses here
        }
        this.ClearIndexDbContent();
        this.dataTypeStatus = false;

        for(var i = 0; i < selectedFiles.files.length; i++)
        {
            if(selectedFiles.files[i].type == "text/plain" && selectedFiles.files[i].webkitRelativePath.split('/').length == 2){
                console.log(selectedFiles.files[i])
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    // console.log(fileReader.result);
                    let dataURI = fileReader.result;
                    // console.log(this.dataURItoBlob(dataURI, true));
                    this.indexDbContent.datauri.push(dataURI);
                }
                this.indexDbContent.date.push(this.timestampToDate(selectedFiles.files[i].lastModifiedDate));
                this.indexDbContent.filename.push(selectedFiles.files[i].name);
                this.indexDbContent.htmldata.push("");
                // console.log(fileReader.readAsDataURL(selectedFiles.files[i]));
                // fileReader.readAsText(selectedFiles.files[i]);
                fileReader.readAsDataURL(selectedFiles.files[i]);
            }
        }
        console.log('=================', this.indexDbContent);
        this.selectedFiles = Array.from(selectedFiles.files).map(file => file.webkitRelativePath);
        // console.log(this.selectedFiles);
    
        //The Db name dialog open.
        this.indexDbName = this.selectedFiles[0].split('/')[0];

        this.concordancerStructure = [];
        this.concordancerdataSource = new MatTableDataSource<ConcordancerStructure>(this.concordancerStructure);
        this.concordancerdataSource.sort = this.concordancersort;
        this.openDialog();
    }
    
    public onFromWeb(){
        let dialogRef = this.dialog.open(WizardoneComponent, {
            width: '700px',
            height: '600px',
            data: this.indexDbList
        });
        dialogRef.afterClosed().subscribe(result => {
            if(!result) return;
            
            let dialogTwo = this.dialog.open(WizardtwoComponent,{
                width: '700px',
                height: '150px',
                data: result
            });
            dialogTwo.afterClosed().subscribe(res => {
                if(!res) return;
                console.log(res);
                this.openNameDialog(res);
            });
        });
    }
    openNameDialog(res) {
        let dialogName = this.dialog.open(DbnamedialogComponent, {
            width: '350px',
            data: { dbName : "From Web" }
        });
        dialogName.afterClosed().subscribe(resname => {
            if(!resname) return;
            if(this.isDbNameTaken(resname) == true){
                if(confirm("Database Name is Already Taken. Please provide a different name"))
                    this.openNameDialog(res);
                return;
            }
            res.dbname = resname;
            if(this.indexDbLength % 4 == 0)
                this.indexDbList.push([]);
            this.indexDbList[Math.floor(this.indexDbLength / 4)].push(res);
            this.indexDbLength += 1;
            this.database.put(res.dbname, res);
            this.concordancerStructure = [];
            this.concordancerdataSource = new MatTableDataSource<ConcordancerStructure>(this.concordancerStructure);
            this.concordancerdataSource.sort = this.concordancersort;
        });
    }
    public onIndexDbClick(item : any) {
        this.selectedIndexDb = item;
        this.selectedIndexDbName = item.dbname;
        this.dataTypeStatus = item.datatype;
        this.getTableStructure(item);
        console.log(item);
    }

    public onFusionDb(){
        let dialogRef = this.dialog.open(FusiondialogComponent, {
            width: '350px',
            height: '450px',
            data: this.indexDbList
        });
        dialogRef.afterClosed().subscribe(result => {
            if(!result) return;
            var i, j;
            var resarray = [];
            for(i = 0; i < this.indexDbList.length; i++){
                for(j = 0; j < this.indexDbList[i].length; j++){
                    if(result[this.indexDbList[i][j].dbname]){
                        let temp : any;
                        temp = new DbStructure();
                        this.CopyDbStructure(this.indexDbList[i][j], temp);
                        resarray.push(temp);
                    }
                }
            }
            var newitem: any;
            newitem = new DbStructure();
            newitem.dbname = result["myfusiondbname"];
            for(i in resarray){
                if(resarray[i].datatype)
                    this.dataTypeStatus = true;
                for(j in resarray[i].datauri){
                    newitem.datauri.push(resarray[i].datauri[j]);
                    newitem.date.push(resarray[i].date[j]);
                    newitem.filename.push(resarray[i].filename[j]);
                    newitem.htmldata.push(resarray[i].htmldata[j]);
                }
            }
            newitem.datatype = this.dataTypeStatus;
            this.database.put(newitem.dbname, newitem);
            this.indexDbList[Math.floor(this.indexDbLength / 4)].push(newitem);
            this.indexDbLength += 1;
            console.log(newitem);
        });
    }
    public onIndexDbDuplicate() {
        let dialogRef = this.dialog.open(DbnamedialogComponent, {
            width: '350px',
            data: { dbname: this.selectedIndexDbName + '.bak' }
        });

        dialogRef.afterClosed().subscribe(result => {
            var i, j;
            var temp : any;
            console.log(result);
            if(!result) return;

            if(this.isDbNameTaken(result) == true) {
                if(confirm("Database Name is Already Taken. Are you sure want to continue?"))
                    this.onIndexDbDuplicate();
                return;
            }
            temp = new DbStructure();
            for(i = 0; i < this.indexDbList.length; i++){
                for(j = 0; j < this.indexDbList[i].length; j++){
                    if(this.indexDbList[i][j].dbname == this.selectedIndexDbName){
                        this.CopyDbStructure(this.indexDbList[i][j], temp);
                        temp.dbname = result;
                        console.log(this.indexDbList[i][j]);
                        if(this.indexDbLength % 4 == 0){
                            this.indexDbList.push([]);
                        }

                        this.database.put(temp.dbname, temp);

                        this.indexDbList[Math.floor(this.indexDbLength / 4)].push(temp);
                        this.indexDbLength += 1;

                        break;
                    }
                }
            }
        });
    }

    formmouseover(event){
        if(this.mouseFlag && event.shiftKey){
            console.log(event);
            event.srcElement.checked =! event.srcElement.checked;
            let num = +event.srcElement.id;
            console.log(num - 1);
            if(num != 0){
                this.checkBoxValue[num - 1] = event.srcElement.checked;
                this.handleChange(event);
            }
        }
    }
    formmousedown(event){
        this.mouseFlag = true;
        console.log("this mousedown", this);
    }
    formmouseup(e){
        if(e.ctrlKey){
            // var content : string= "";
            // var count = 0;
            // for(let i in this.checkBoxValue)
            //     if(this.checkBoxValue[i]) {
            //         content += this.tableStructure[i].fullcontent.toString();
            //         count++;
            //     }
            // let temptable = new TableDataStructure();
            // temptable.fullcontent = content;
            // this.onTableRowSelect(temptable, true);
        }else{
            // console.log("handlechange", this);
            let num = e.srcElement.id;
            let state = this.checkBoxValue[num -1];
            // console.log("state", state);
            var content : string= "";
            var count = 0;
            for(let i in this.checkBoxValue)
                this.checkBoxValue[i] = false;
             
            console.log("checkboxvalue", this.checkBoxValue[num-1], e.srcElement);
        }
        console.log("this.checkBoxValue",this.checkBoxValue, "event", e);
    }

    handleChange(e){
        var content : string= "";
        var count = 0;
        for(let i in this.checkBoxValue)
            if(this.checkBoxValue[i]) {
                content += this.tableStructure[i].fullcontent.toString();
                count++;
            }
        let temptable = new TableDataStructure();
        temptable.fullcontent = content;
        this.onTableRowSelect(temptable, true);
        
        console.log("this.checkBoxValue",this.checkBoxValue, "event", e);
    }
    onsearchterm(event){
        if(event.keyCode == 13){
            this.concordancerStructure = [];
            for(let i in this.tableStructure){
                var temp = -1;
                console.log(this.tableStructure[i].url);
                do{
                    temp = this.tableStructure[i].fullcontent.indexOf(this.searchterm, temp + 1);
                    if(temp != -1){
                        console.log('AAAA');
                        let tempcon = new ConcordancerStructure;
                        let tablefullcontent = this.tableStructure[i].fullcontent;
                        tempcon.url = this.tableStructure[i].url;
                        tempcon.left_context = ( temp - 10 ) >= 0 
                                                ? "..." + tablefullcontent.substr(temp-10, 10) 
                                                : tablefullcontent.substr(0, temp);
                        tempcon.right_context = ( temp + this.searchterm.length + 10) <= tablefullcontent.length 
                                                ? tablefullcontent.substr(temp+this.searchterm.length, 10) + "..."
                                                : tablefullcontent.substr(temp+this.searchterm.length, tablefullcontent.length - temp-this.searchterm.length);
                        tempcon.search_terms = this.searchterm;
                        tempcon.datauri = this.tableStructure[i].datauri;
                        tempcon.htmldata = this.tableStructure[i].htmldata;
                        this.concordancerStructure.push(tempcon);
                    }
                }while(temp >= 0);
            }
            this.concordancerdataSource = new MatTableDataSource<ConcordancerStructure>(this.concordancerStructure);
            this.concordancerdataSource.sort = this.concordancersort;
        }
    }

    onstop(){
        if(this.subscription == undefined){
            alert("Not Exporting");
        } else if(this.subscription.closed) {
            alert("Not Exporting");
        } else {
            this.subscription.unsubscribe();
            console.log(this.subscription);
        }
    }

    onexport(){
        // if(this.subscription != undefined)
        //     this.subscription.unsubscribe();
        if(this.optionvalue1 == undefined || this.optionvalue2 == undefined || this.optionvalue3 == undefined){
            alert("Check all the selections!");
            return;
        }
        if(this.selectedIndexDbName == "") {
            alert( "No Index DB, Please Add Index DB");
            return;
        }

        this.exportProgress = 0;
        console.log(this.selectedIndexDbName);

        var datauriformat = ["data:text/plain;base64,", "data:text/html;charset=utf-8;base64,", "data:text/csv;charset=utf-8;base64,", ]
        var blobcontenttype = ["text/plain", "text/html", "text/csv"];
        var extensiontype = [".txt", ".html", ".csv"];

        var datauri, i;
        var selectedDb = this.selectedIndexDb;
        console.log(selectedDb);
        if(this.optionvalue1 == 1) {   // all
            if(this.optionvalue3 == 1) {  // combined file
                var dbcontent = "";
                var mimeType = "plain/text";
                if(this.optionvalue2 == 2) {
                    console.log(selectedDb.htmldata);
                    for(let i in selectedDb.htmldata){
                        dbcontent += selectedDb.htmldata[i];
                    }
                } else {
                    for(let i in this.dbfullcontent){
                        dbcontent += this.dbfullcontent[i];
                    }
                }
                var byteNumbers = new Array(dbcontent.length);
                for (i = 0; i < dbcontent.length; i++) {
                    byteNumbers[i] = dbcontent.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], {type: blobcontenttype[this.optionvalue2 - 1]});
                var a = new FileReader();
                a.onload = () => {
                    console.log(a.result);
                    this.downloadURI(a.result, this.selectedIndexDbName + extensiontype[this.optionvalue2 - 1], 100);
                }
                a.readAsDataURL(blob);
            } else if(this.optionvalue3 == 2) { // 1 file per url
                let length = selectedDb.datauri.length;
                let timer = TimerObservable.create(2000, 200);
                this.subscription = timer.subscribe(t => {
                    console.log(t);
                    if(t == length){
                        this.exportProgress = 100;
                        this.subscription.unsubscribe();
                        console.log("BREAK");
                        return;
                    }
                    let progvalue =  Math.ceil(t * (100 / length));

                    if(this.optionvalue2 == 2){
                        var byteNumbers = new Array(selectedDb.htmldata[t].length);
                        for (i = 0; i < selectedDb.htmldata[t].length; i++) {
                            byteNumbers[i] = selectedDb.htmldata[t].charCodeAt(i);
                        }
                        var byteArray = new Uint8Array(byteNumbers);
                        var blob = new Blob([byteArray], { type: blobcontenttype[this.optionvalue2 - 1]});
                        var a = new FileReader();
                        a.onload = () => {
                            this.downloadURI(a.result, selectedDb.filename[t] + '.html', progvalue);
                        }
                        a.readAsDataURL(blob);
                    } else {
                        this.downloadURI(selectedDb.datauri[t], selectedDb.filename[t] + extensiontype[this.optionvalue2 - 1], progvalue);
                    }
                });
            }
        } else {
            var filename;
            var selectedhtmldata;
            var isPassed = false;
            if(this.optionvalue1 ==  2 && this.selectedRow.datauri != undefined){ // 
                selectedhtmldata = this.selectedRow.htmldata;
                datauri = this.selectedRow.datauri;
                filename = this.selectedRow.url;
                isPassed = true;
            } else if(this.optionvalue1 == 3 && this.concordancerSelectedRow.datauri != undefined){
                selectedhtmldata = this.concordancerSelectedRow.htmldata;
                datauri = this.concordancerSelectedRow.datauri;
                filename = this.concordancerSelectedRow.url;
                isPassed = true;
            }
            if(isPassed){
                if(this.optionvalue2 == 2){
                    var byteNumbers = new Array(selectedhtmldata.length);
                    for (i = 0; i < selectedhtmldata.length; i++) {
                        byteNumbers[i] = selectedhtmldata.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    var blob = new Blob([byteArray], { type: blobcontenttype[this.optionvalue2 - 1]});
                    var a = new FileReader();
                    a.onload = () => {
                        console.log('++++++++++++++++++++');
                        console.log(a.result);
                        this.downloadURI(a.result, filename + extensiontype[this.optionvalue2 - 1] , 100);
                    }
                    a.readAsDataURL(blob);
                } else {
                    console.log(datauri);
                    datauri = datauri.split("data:text/plain;base64,").join("");
                    datauri = datauriformat[this.optionvalue2 - 1] + datauri;
                    this.downloadURI(datauri, filename + extensiontype[this.optionvalue2 - 1], 100);
                }
            }
        }
    }

    downloadURI(uri, name, progvalue) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.exportProgress = progvalue;
        this.exportProgressFileName = name;
        console.log(name);
    }

    dataURItoBlob(dataURI, toFile) {
        // get the base64 data
        var data = dataURI.split(',')[1];

        // user may provide mime type, if not get it from data URI
        var mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // default to plain/text if data URI has no mimeType
        if (mimeType == null) {
          mimeType = 'plain/text';
        }
        var binary = atob(data);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }

        // Convert to a File?
        if (toFile) {
          return new File([new Uint8Array(array)], '', { type: mimeType });
        }
        return new Blob([new Uint8Array(array)], { type: mimeType });
    }

    timestampToDate(timestamp) :string{
        var t = new Date(timestamp);
        return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate();
    }

    isDbNameTaken(name: string){
        var i, j;
        var isTaked : boolean = false;
        for(i = 0; i < this.indexDbList.length; i++){
            for(j = 0; j < this.indexDbList[i].length; j++){
                if(this.indexDbList[i][j].dbname == name){
                    isTaked = true;
                    break;
                }
            }
        }
        return isTaked;
    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    utf16to8(str) {
        var out, i, len, c;

        out = "";
        len = str.length;
        for(i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        }
        }
        return out;
    }
}
