import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PouchdbService } from "./pouchdb.service";
import { Ng4FilesModule } from './angular4-files-upload';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataTableModule, SharedModule } from 'primeng/primeng';
import { MatTabsModule, MatDialogModule, MatButtonModule, MatInputModule, MatTableModule, MatSortModule, MatCheckboxModule, MatRadioModule, MatProgressBarModule, MatMenuModule, MatIconModule, MatListModule } from '@angular/material';
import { DbnamedialogComponent } from './dbnamedialog/dbnamedialog.component';
import { FusiondialogComponent } from './fusiondialog/fusiondialog.component';
import { WizardoneComponent } from './wizardone/wizardone.component';
import { WizardtwoComponent } from './wizardtwo/wizardtwo.component';

@NgModule({
  declarations: [
    AppComponent,
    DbnamedialogComponent,
    FusiondialogComponent,
    WizardoneComponent,
    WizardtwoComponent
  ],
  entryComponents: [
    DbnamedialogComponent,
    FusiondialogComponent,
    WizardoneComponent,
    WizardtwoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng4FilesModule,
    BrowserAnimationsModule,
    DataTableModule,
    SharedModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule, 
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressBarModule,
    MatMenuModule,
    MatIconModule,
    MatListModule
  ],
  exports: [ MatTabsModule, MatDialogModule, MatButtonModule, MatInputModule, MatTableModule, MatSortModule, MatCheckboxModule, MatRadioModule, MatProgressBarModule, MatMenuModule, MatIconModule, MatListModule ],
  providers: [PouchdbService],
  bootstrap: [AppComponent]
})

export class AppModule { }
