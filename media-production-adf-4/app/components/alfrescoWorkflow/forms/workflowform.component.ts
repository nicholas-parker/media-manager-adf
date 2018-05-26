/**
 * A virtual base class which all workflow form components are based upon
 * 
 * 
 */
import {Observable} from 'rxjs/Observable';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MdTabsModule, MdSelectModule, MdInputModule, MdDialogRef, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {Task} from '../task';
import {TaskVar} from '../taskVar';
import {AlfrescoService} from '../alfresco.service';
import {AlfrescoWorkflowService} from '../alfrescoWorkflow.service';
import {TaskService} from './taskService.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ContentModelConstraints} from '../../alfrescoModel/contentModelConstraints';
import {OpportunityComponent} from './opportunity/opportunity.component';

@Component({
  selector: 'workflow-form',
  templateUrl: './workflowform.component.html',
  styleUrls: ['workflowform.component.css']
})
export class WorkflowFormComponent {

  /*
   * the task in hand
   * TO-DO work out which items we can remove from below now we are using the opportunity component
   * 
   */
  protected taskId: Observable<number>;

  // this is a flag which prevents content being loaded until it is ready, this should be refactored into a promise
  protected loaded: boolean = false;
  public canReasign: boolean = true;

  /**
   * 
   * set the display content for the opportunity component.
   * This is configured for setting up the role details
   *  
   */
  public displayOptions = {role: 'write', financials: 'write', employee: 'write', documents: 'write'};

  /**
   * 
   * reference to the opportunity form
   * 
   */
  @ViewChild(OpportunityComponent)
  public opportunity: OpportunityComponent;

  constructor(private service: AlfrescoWorkflowService,
    private snackBar: MdSnackBar,
    private dialogRef: MdDialogRef<WorkflowFormComponent>) {

  }



  /**
   * 
   * Called by the parent component which opens this dialogue.
   * Sets the taskId, the taskId must refer to an instance of the right task
   * In this component we use the opportunity component to display the information,
   * this component retrieves all the task details itself so all we need to do is pass
   * it the taskId as an observable
   * 
   */
  public setTaskId(taskId: number) {

    this.taskId = Observable.of(taskId);

  }


  /** user closes the form */
  public onCancel() {
    this.dialogRef.close();
  }

  /** user closes the form and wants model updated but is not completed */
  public onSave() {

    this.opportunity.Save().subscribe(
      d => {
        this.snackBar.open('Task details updated', null, {duration: 3000});
        this.dialogRef.close();
      },
      err => {this.snackBar.open('ERROR saving task detials', err.message, {duration: 3000});});
  }

  /** sets the task as complete */
  public onTaskComplete() {

    this.opportunity.sendToCandidate().subscribe(
      d => {
        this.snackBar.open('Details sent to candidate', null, {duration: 3000});
        this.dialogRef.close();
      },
      err => {this.snackBar.open('ERROR completing role', err.message, {duration: 3000});});
  }


}
