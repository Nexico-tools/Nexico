import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButton, MatDialogRef, MAT_DIALOG_DATA, MatProgressBar} from '@angular/material';
import * as Crawler from 'js-crawler';
import { htmlToPlainText } from '../config/textversion';
import { async } from '@angular/core/testing';
import { DbStructure } from '../dbstructure';

@Component({
  selector: 'app-wizardtwo',
  templateUrl: './wizardtwo.component.html',
  styleUrls: ['./wizardtwo.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WizardtwoComponent implements OnInit {
	urltaking : string = "Wait for a few sec";
    crawlProgress : number = 0;
    flag : boolean = false;
    dbItem : DbStructure;
	constructor(
		public dialogRef: MatDialogRef<WizardtwoComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any ) {
    }
    
    addToDbItem(page, plainText){
        var styleConfig: {
            headingStyle: "indention",
            uIndentionChar: ".";
            listIndentionTabs: 2;
        };
        var plainText;
        plainText = htmlToPlainText(page.content, styleConfig);
        console.log(plainText);
        var byteNumbers = new Array(plainText);
        for (let i = 0; i < plainText.length; i++) {
            byteNumbers[i] = plainText.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], {type: "data:text/plain;"});
        var a = new FileReader();
        a.onload = () => {
            this.dbItem.datauri.push(a.result.replace("data:data:text/plain;;", "data:text/plain;"));
        }
        this.dbItem.filename.push(page.url);
        this.dbItem.htmldata.push(page.content);
        this.dbItem.date.push(this.timestampToDate(Date.now()))
        a.readAsDataURL(blob);
    }

    loadURLs( index ) {
        let crawler : any;
        crawler = new Crawler().configure({ ignoreRelative: true, depth: 1 });
        crawler.crawl({
            url: this.data.list[index],
            success: function(page) {
                console.log(page.url);
                let temp = this.crawlProgress + Math.ceil(100 / Number(this.data.maxnumber));
                console.log("Temp:" + temp);
                if(temp > 100) {
                    this.urltaking = "Crawl Finished(Limited MaxURL)";
                    this.crawlProgress = 95;
                    console.log("return");
                    return;
                }
                this.urltaking = "Currently Taking " + page.url;
                this.crawlProgress = temp;
                this.addToDbItem(page);                
            }.bind(this),
            failure: function(page) {
                console.log(page.status);
            },
            finished: function(crawledUrls) {
                console.log(crawledUrls);
                console.log('--arguments--');
                console.log(arguments);
                const index = Number(arguments[0][0].index) + 1;
                console.log('index:' + index);
                if (index >= this.data.list.length) {
                    if(this.data.option1 == 2 && !this.flag) {
                        console.log('+++++++++++++');
                        this.flag = true;
                        this.loadSubURLs( 0 );
                    } else {
                        this.crawlProgress = 100;
                        this.urltaking = "Crawl Finished Successfully!";
                        console.log("RETURN");
                        this.dialogRef.close(this.dbItem);
                        return;
                    }
                } else {
                    this.loadURLs(index);
                }
            }.bind(this, [ {index} ])
        });
    }

    loadSubURLs( index ){
        let crawler = new Crawler().configure({ ignoreRelative: true, depth: 2 });
        crawler.crawl({
            url: this.data.list[index],
            success: function(page) {
                // var plainText = htmlToPlainText(page.content, styleConfig);
                // console.log(plainText);

                if(page.url == this.data.list[index] || page.url == (this.data.list[index] + "/"))
                    return;
                console.log(page.url);
                let regex;
                if(this.data.option2 == 2){
                    regex = new RegExp(this.data.regexp);
                }
                if(this.data.option2 == 1 || ( this.data.option2 ==2 && regex.test(page.url) )){
                    let temp = this.crawlProgress + Math.ceil(100 / Number(this.data.maxnumber));
                    console.log("Temp:" + temp);
                    if(temp > 100) {
                        this.urltaking = "Merging data, please wait...";//"Crawl Finished(Limited MaxURL)";
                        this.crawlProgress = 95;
                        console.log("return");
                        return;
                    }
                    this.urltaking = "Currently Taking " + page.url;
                    this.crawlProgress = temp;
                    this.addToDbItem(page);
                }
            }.bind(this),
            failure: function(page) {
                console.log(page.status);
            },
            finished: function(crawledUrls) {
                console.log(crawledUrls);
                console.log('--arguments--');
                console.log(arguments);
                const index = Number(arguments[0][0].index) + 1;
                console.log('index:' + index);
                if (index >= this.data.list.length) {
                    console.log("RETURN");
                    this.crawlProgress = 100;
                    this.urltaking = "Crawl Finished Successfully!";
                    console.log(this.dbItem);
                    this.dialogRef.close(this.dbItem);                    
                    return;
                }
                this.loadSubURLs( index );
            }.bind(this, [ {index} ])
        });
    }

	ngOnInit() {
        this.dbItem = new DbStructure();
		console.log(this.data);
		var styleConfig: {
			headingStyle: "indention",
			uIndentionChar: ".";
			listIndentionTabs: 2;
        };
        this.dbItem.datatype = true;
        this.loadURLs( 0 );
	}
	onStop(){
		console.log("stop");
		this.dialogRef.close(false);
    }
    timestampToDate(timestamp) :string{
        var t = new Date(timestamp);
        return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate();
    }
}
