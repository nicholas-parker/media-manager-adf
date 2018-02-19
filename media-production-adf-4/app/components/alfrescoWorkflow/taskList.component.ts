/**
 * component which displays user tasks.
 * tasks can be filtered depending on their status and process
 * 
 */
import {Observable} from 'rxjs/Observable';
import {Component, OnInit} from '@angular/core';
import {MdCard, MdCardHeader, MdCardTitleGroup, MdCardTitle, MdCardContent, MdCardActions, MdList, MdDialog, MdDialogRef, MdButton, MdIcon} from '@angular/material';
import {AlfrescoWorkflowService} from './alfrescoWorkflow.service';
import {AlfrescoService} from './alfresco.service';
import {TaskDataSource} from './taskDataSource';
import {Task} from './task';
import {WorkflowFormComponent} from './forms/workflowform.component';
import {ReviewOfferFormComponent} from './forms/reviewOfferForm.component';
import {ConfirmRightToWorkFormComponent} from './forms/confirmRightToWorkForm.component';

@Component({
  selector: 'task-list',
  templateUrl: './taskList.component.html',
  styleUrls: ['./taskList.component.css'],
  providers: [AlfrescoWorkflowService, AlfrescoService, TaskDataSource]
})
export class TaskListComponent implements OnInit {

  public tasks: Observable<Task[]>;

  /**
   * 
   * A list of form keys.
   * Add new form keys into this list and update the switch in onSelectTask
   * 
   */
  private SETUP_ROLE_FRMKEY = 'mwtwf:setupContractDetailsTask';
  private REVIEW_ROLE_FRMKEY = 'mwtwf:reviewContractDetailsTask';
  private RTW_ROLE_FRMKEY = 'mwtwf:approveContractDetailsTask';

  dialogRef: MdDialogRef<any>;

  constructor(private taskData: TaskDataSource,
    private dialog: MdDialog) {}

  public ngOnInit(): void {
    this.tasks = this.taskData.connect();
  }

  public onSelectTask(task: Task): void {

    console.log(task);

    /** SETUP_ROLE_FRMKEY */
    if (task.formResourceKey === this.SETUP_ROLE_FRMKEY) {
      this.dialogRef = this.dialog.open(WorkflowFormComponent);
      this.dialogRef.componentInstance.setTask(task.id);
      this.dialogRef.afterClosed().subscribe(data => {this.taskData.refresh();});
      return;
    }

    /** REVIEW_ROLE_FRMKEY */
    if (task.formResourceKey === this.REVIEW_ROLE_FRMKEY) {
      this.dialogRef = this.dialog.open(ReviewOfferFormComponent);
      this.dialogRef.componentInstance.setTask(task.id);
      this.dialogRef.afterClosed().subscribe(data => {this.taskData.refresh();});
      return;
    }

    /** REVIEW_RTW_FRMKEY */
    if (task.formResourceKey === this.RTW_ROLE_FRMKEY) {
      this.dialogRef = this.dialog.open(ConfirmRightToWorkFormComponent);
      this.dialogRef.componentInstance.setTask(task.id);
      this.dialogRef.afterClosed().subscribe(data => {this.taskData.refresh();});
      return;
    }

  }

  /**
   * given the state / assignee / dueDate of a task returns the task icon
   */
  public taskIcon(task: Task): string {

    if (task.state === Task.STATE_UNCLAIMED) {
      return 'event_note';
    }

    if (task.state === Task.STATE_UNCLAIMED) {
      return 'mail_outline';
    }

  }
}


