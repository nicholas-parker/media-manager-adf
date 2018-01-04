import { Component, OnInit, Input } from '@angular/core';
import { WorkflowFormComponent } from '../forms/workflowform.component';
import { AlfrescoWorkflowService } from '../alfrescoWorkflow.service';
import { AlfrescoService } from '../alfresco.service';
import { MdDialogRef, MdDialog } from '@angular/material';

@Component({
    selector: 'process-task-assignee',
    templateUrl : './processTaskAssignee.component.html',
    providers: [ AlfrescoWorkflowService, AlfrescoService]
  
})
export class ProcessTaskAssigneeComponent {
  
  public static NOT_AVAILABLE = 'Not available';
   
  
  /** name of current task assignee in the process */
  assignee: string;
  name: string;
  
  /** current task of process */
  task: any;
  
  /** flags to disable buttons */
  private taskDisabled = true;
  private assignDisabled = true;
  
  private loaded = false;
  
  /** dialogue to edit a task */
  dialogRef: MdDialogRef<WorkflowFormComponent>;
  
  constructor(
    private workflowService: AlfrescoWorkflowService,
    private dialog: MdDialog
  ) { }

  public ngOnInit () {
  }
  
  @Input()
  set processId(id) {
    
    console.log('setting process id ' + id);
    
    if(this.loaded) { return; }
    this.loaded = true;
    
    this.processId = id;
    
    this.workflowService.getProcessTasks(id).subscribe(
      data => {console.log(data);
               this.mapResponse(data[0]);},
      err => {this.assignee = ProcessTaskAssigneeComponent.NOT_AVAILABLE;});
    
 }
  
  private mapResponse(task) {
    
    this.task = task;
    
    /** assignee */
    if(task.state === 'unclaimed') {
      this.assignee = 'Unclaimed';
    } else {
      this.assignee = task.assignee;
    }
    
    /** name */
    this.name = task.name;
    
    this.taskDisabled = !this.canLaunch(task);
    
  }
  
  
  /**
   *  
   * logic which works out if we can launch this task to the current user.
   * The Alfresco service only returns the task if the user started the workflow or has task access
   * 
   * 
   */
  private canLaunch(task): boolean {
      
      if(task.activityDefinitionId === 'usertask_setup_role') {
        return true;
      } else {
        return false;
      }
  }
  
  /**
   * 
   * launch the task form in a dialogue
   * 
   */
  private launchTask() {
    console.log(this.task.id);
    this.dialogRef = this.dialog.open(WorkflowFormComponent);
    this.dialogRef.componentInstance.setTask(this.task);
    
  }
  
}

