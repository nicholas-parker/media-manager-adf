/**
 * This component provides the functionality to setup a role.
 * It is normally launched by 
 * 
 * 1 - selecting a 'setup role' task from a users task list
 * 2 - selecting 'setup' from the task in the planner when the task has not completed the setup ohase
 *
 * This component must be launched in an MdDialog
 *  
 * When the task is edited the component updates the process variables associated with this task.
 * When the task setup is complete the associated task is marked as complete
 * 
 */

import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';
import { DefaultRoleService } from '../defaultRoles/defaultRole.service';
import { DefaultRole } from '../defaultRoles/defaultRole'; 
import { Role } from './role';
import { AlfrescoWorkflowService } from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import { MdDialogRef } from '@angular/material';

@Component({
    selector: 'setup-role',
    templateUrl : './setupRole.component.html'
})
export class SetupRoleComponent implements OnInit {
  
  constructor(private workflowService: AlfrescoWorkflowService,
              private dialogRef: MdDialogRef<SetupRoleComponent>) {
    
  }
  
  public ngOnInit() {
    
   
  }
  
  /** a set of interface methods so that the workflow form launcher can set form content */
  public setTaskParameters() {
  
      
  }

}

