/**
 * A virtual base class which all workflow form components are based upon
 * 
 * 
 */
import {Observable} from 'rxjs/Observable';
import {Component, OnInit, Input} from '@angular/core';
import {MdTabsModule, MdSelectModule, MdInputModule, MdDialogRef, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {Role} from './role';

@Component({
  selector: 'role-tag',
  templateUrl: './roleTagDialog.component.html',
  styleUrls: ['roleTagDialog.component.css']
})
export class RoleTagDialog {

  @Input()
  public role: Role;

  constructor(
    private dialogRef: MdDialogRef<RoleTagDialog>) {
  }

  /** 
   * 
   * user closes the form
   * 
   */
  public onCancel() {
    this.dialogRef.close();
  }

  /**
   * 
   * set the role we are managing
   * 
   */
  public setRole(role) {

    this.role = role;

  }



}
