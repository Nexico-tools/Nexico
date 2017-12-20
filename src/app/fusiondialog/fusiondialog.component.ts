import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButton, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface hash{
  [ details: string ] : boolean;
}

@Component({
  selector: 'app-fusiondialog',
  templateUrl: './fusiondialog.component.html',
  styleUrls: ['./fusiondialog.component.css'],
  encapsulation: ViewEncapsulation.None  
})


export class FusiondialogComponent implements OnInit {

  isChecked = {};
  fusiondbname : string = "";
  ngOnInit() {
      for(var i = 0; i < this.data.length; i++){
        for(var j = 0; j < this.data[i].length; j++){
          console.log(this.data[i][j].dbname);
          this.isChecked[this.data[i][j].dbname] = false;
        }
      }
  }

  constructor(
    public dialogRef: MatDialogRef<FusiondialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }
  
  onYesClick(): void {
    var i, j;
    var count = 0;
    
    if(this.fusiondbname == ""){
      alert("Input the Database Name");
      return;
    }

    for(i in this.data)
      for(j in this.data[i])
        if(this.isChecked[this.data[i][j].dbname])
          count ++;

    if(count > 1){
      this.isChecked["myfusiondbname"] = this.fusiondbname;
      this.dialogRef.close(this.isChecked);
    }
    else
      alert("Select the Two or more databases");
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
