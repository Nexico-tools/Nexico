import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButton, MatDialogRef, MAT_DIALOG_DATA, MatRadioButton} from '@angular/material';

@Component({
  selector: 'app-wizardone',
  templateUrl: './wizardone.component.html',
  styleUrls: ['./wizardone.component.css'],
  encapsulation: ViewEncapsulation.None  
  
})
export class WizardoneComponent implements OnInit {

	optionvalue : number;
	optionvalue1 : number;	
	inputurl : string;
	inputregexp : string;
	followlink : boolean;
	urllist = [];
  constructor(
    public dialogRef: MatDialogRef<WizardoneComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any ) {
			console.log(this.optionvalue);
  }

  ngOnInit() {
		this.followlink = false;
	}
	
	onValueChange(){
		this.followlink = (this.optionvalue == 2);
		document.getElementById('radiogroup2').setAttribute('style', (this.followlink == true ? 'margin-left: 20px; display : grid;' :'margin-left: 20px;display : none;'));
	}

	onYesClick(): void {
		if(this.urllist.length == 0){
			alert("Please Add Url");
			return;
		}
		if(this.optionvalue == undefined || (this.optionvalue1 == undefined && this.optionvalue == 2)){
			alert("Please Select One Option");
			return;
		}
		if(this.optionvalue == 2 && this.optionvalue1 == 2 && (this.inputregexp == undefined || this.inputregexp.length == 0)) {
			alert("Please input regular Expression");
			return;
		}
		if(this.optionvalue == 2 && this.optionvalue1 == 2 && !this.validateRegExp()){
			alert("The Regular Expression is not Valid");
			return;
		}
        this.dialogRef.close({
			"option1" : this.optionvalue,
			"option2" : this.optionvalue1,
			"list" : this.urllist,
			"regexp" : this.inputregexp
		});
	}
	
  onNoClick(): void {
    this.dialogRef.close(false);
	}

	onAdd() {
		if(!this.validateUrl()){
			alert("The Url is not valid");
			return;
		} else {
			this.urllist = [...this.urllist, this.inputurl];
		}
	}

	validateUrl() {
		var re=/^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
		return re.test(this.inputurl);
	}
	validateRegExp(){
		var isValid = true;
		try {
				new RegExp(this.inputregexp);
		} catch(e) {
				isValid = false;
		}
		return isValid;
	}
}
