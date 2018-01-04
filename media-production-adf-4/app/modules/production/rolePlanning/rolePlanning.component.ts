import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MdDialog,  MdDialogRef, MdDialogContent, MdButton } from '@angular/material';
import { Role }  from './role';
import { RoleService } from './role.service';
import { RoleListComponent } from './role-list.component';
import { CreateRoleComponent } from './createRole.component';

@Component({
  templateUrl : './rolePlanning.component.html',
  styleUrls: ['rolePlanning.component.css','../../../standard.css'],
  providers: [ MdDialog ]
}) 
export class RolePlanningComponent implements OnInit {
  
  dialogRef: MdDialogRef<CreateRoleComponent>;
  
  constructor(private dialog: MdDialog) {
    
  }
  
  ngOnInit() {
    
  } 
  
  /**
   * 
   * User hits the create new role button and this method is called,
   * launches the CreateRoleComponent in a dialog
   * 
   */
  onCreateRole() {
    this.dialogRef = this.dialog.open(CreateRoleComponent);
  }
  
}
