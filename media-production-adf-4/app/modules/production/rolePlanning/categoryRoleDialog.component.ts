import {Observable} from 'rxjs/Observable';
import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {CrewCategorySummaryComponent} from '../../../components/productionComponentModule/CrewCategorySummary/crewCategorySummary.component';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'category-role-dialog',
  templateUrl: './categoryRoleDialog.component.html',
  styleUrls: ['./categoryRoleDialog.component.css']
})
export class CategoryRoleDialog {

  /**
   * 
   * reference to the component which
   *  
   */
  @ViewChild(CrewCategorySummaryComponent)
  public summary: CrewCategorySummaryComponent;

  /**
   * 
   * category to display role summary for
   * 
   */
  @Input()
  public category;

  constructor(private dialogRef: MdDialogRef<CategoryRoleDialog>) {

  }

  /**
   * 
   * close the dialog
   * 
   */
  public close() {

    this.dialogRef.close();

  }



}

