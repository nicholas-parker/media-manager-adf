import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Component, OnInit, Input} from '@angular/core';
import {MdProgressSpinnerModule, MdButtonModule, MdDialogRef, MdSnackBar} from '@angular/material';
import {RoleService} from './role.service';
import {Role} from './role';
import {AlfrescoWorkflowService} from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {AlfrescoService} from '../../../components/alfrescoWorkflow/alfresco.service';


@Component
  ({
    selector: 'role-delete',
    templateUrl: './roleDeleteDialog.component.html',
    styleUrls: ['./roleDeleteDialog.component.css']
  })
export class RoleDeleteDialog implements OnInit {

  /**
   * 
   * the role we are deleting
   * 
   */
  @Input()
  public role: Role;

  /**
   * 
   * UI flags which drive the text displayed
   * 
   */
  public statusNotSetup: boolean = false;

  /**
   * 
   * subscription to the delete observable
   * 
   */
  public subDelete: Subscription;

  constructor(private roleService: RoleService,
    private workflowService: AlfrescoWorkflowService,
    private dialogRef: MdDialogRef<RoleDeleteDialog>,
    private snackBar: MdSnackBar
  ) {

  }

  ngOnInit(): void {

    if (this.role.nvpList_roleStatus !== 'Setup') {
      this.statusNotSetup = true;
    }
  }

  ngOnDestroy(): void {

    if (undefined !== this.subDelete) {
      this.subDelete.unsubscribe();
    }

  }

  /**
   * 
   * deletes the role
   * 
   */
  public delete(): void {

    this.snackBar.open('Deleting role', '', {duration: 2000});

    this.subDelete = Observable.forkJoin(


      /** delete the process */
      this.workflowService.deleteProcess(+this.role.nvpList_contractProcessId),

      /** delete the role item & associated contracts */
      this.roleService.delete(this.role)

    ).subscribe(
      data => {
        this.snackBar.open('Role deleted', '', {duration: 2000});
        this.roleService.refresh();
        this.cancel();
      },
      err => {
        this.snackBar.open('There was a problem deleting this role', '', {duration: 2000});
        console.log(err);
      }
      );


  }

  /**
   * 
   * cancel the delete action
   * 
   */
  public cancel() {

    this.dialogRef.close();

  }

}
