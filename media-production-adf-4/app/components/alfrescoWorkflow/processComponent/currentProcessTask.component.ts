import { Component, OnInit, Input } from '@angular/core';
import { WorkflowFormComponent } from '../forms/workflowform.component';
import { AlfrescoWorkflowService } from '../alfrescoWorkflow.service';
import { AlfrescoService } from '../alfresco.service';
import { MdDialogRef, MdDialog } from '@angular/material';

@Component({
    selector: 'current-process-task',
    templateUrl : './currentProcessTask.component.html',
    providers: [ AlfrescoWorkflowService, AlfrescoService]
  
})
export class CurrentProcessTaskComponent {
  
  public static NOT_AVAILABLE = 'Not available';
   
  
  
  /** 
   * 
   * name of current task assignee in the process
   * 
   */
  public assignee: string;
  
  /**
   * 
   * flag to show the assignee
   * 
   */
  public showAssignee: boolean = true;
  
  /**
   * 
   * name of the current task
   * 
   */
  public taskName: string;
  
  /** 
   * 
   * current task of process
   *
   */
  public task: any;
  
  /**
   * 
   * flag to indicate the process and task are loaded in this component instance
   * 
   */
  private loaded = false;
  
  
  constructor(
    private workflowService: AlfrescoWorkflowService,
    private dialog: MdDialog
  ) { }

  public ngOnInit () {
  }
  
  /**
   * 
   * id of the process component is mapped to
   * 
   */
  @Input()
  set processId(id) {
    
    console.log('setting process id ' + id);
    
    if(this.loaded) { return; }
    this.loaded = true;
    
    this.processId = id;
    
    this.workflowService.getProcessTasks(id).subscribe(
      data => {console.log(data);
               this.mapResponse(data[0]);},
      err => {this.assignee = CurrentProcessTaskComponent.NOT_AVAILABLE;});
    
  }
  
  /**
   * 
   * need to upgrade to manage multiple tasks at some point
   * 
   */
  private mapResponse(task) {
    
    if(undefined === task) {
      this.showAssignee = false;
      this.taskName = 'No tasks';
    }
    
    this.task = task;
    
    /** assignee */
    if(task.state === 'unclaimed') {
      this.assignee = 'Unclaimed';
    } else {
      this.assignee = task.assignee;
    }
    
    /** name */
    this.taskName = task.name;
    
  }
  
  
  
  
}
