/**
 * A virtual base class which all workflow form components are based upon
 * 
 * 
 */
import {Observable} from 'rxjs/Observable';
import {Component, OnInit} from '@angular/core';
import {MdTabsModule, MdSelectModule, MdInputModule, MdDialogRef, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {Task} from '../task';
import {TaskVar} from '../taskVar';
import {AlfrescoService} from '../alfresco.service';
import {AlfrescoWorkflowService} from '../alfrescoWorkflow.service';
import {TaskService} from './taskService.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ContentModelConstraints} from '../../alfrescoModel/contentModelConstraints';

@Component({
  selector: 'workflow-form',
  templateUrl: './workflowform.component.html',
  styleUrls: ['workflowform.component.css']
})
export class WorkflowFormComponent {

  /*
   * 
   * the task in hand
   * 
   */
  protected taskModel: TaskVar[];
  public task: Task;
  protected taskId: number;
  protected loaded: boolean = false;
  public canReasign: boolean = true;

  /** 
   * 
   * form items
   * 
   */
  public taskForm: FormGroup;
  public fields: string[] = [];
  public minBudget: number = 0;
  public maxBudget: number = 0;

  /** 
   * 
   * content for the drop downs in the forms
   * 
   */
  deliverableTypeList = ContentModelConstraints.contract_contractDeliverableTypeConstraint;
  PAYEStatusList = ContentModelConstraints.nvp_PAYEStatusConstraint;
  workingWeekList = ContentModelConstraints.contract_workingWeekConstraint;
  paymentPeriodList = ContentModelConstraints.contract_periodSpecifiedConstraint;
  ratePeriodList = ContentModelConstraints.contract_ratePeriodConstraint;
  currencyList = ContentModelConstraints.contract_contractCurrencyConstraint;
  managementProcessList = ContentModelConstraints.contract_workflowNameConstraint;
  adminTeamList = ContentModelConstraints.contract_contractAdministrationTeamConstraint;

  /**
   * 
   * nodeId of the workflow package
   */
  public bpmPackage;

  constructor(private service: AlfrescoWorkflowService,
    private taskService: TaskService,
    private fb: FormBuilder,
    private snackBar: MdSnackBar,
    private dialogRef: MdDialogRef<WorkflowFormComponent>) {
    this.createForm();
  }

  /** 
   * 
   * add the form controls to the form
   * 
   */
  private createForm() {
    this.taskForm = this.fb.group({
      bpm_workflowPriority: '',
      contract_serviceName: '',
      contract_serviceDescription: '',
      contract_serviceStart: null,
      contract_serviceEnd: null,
      contract_location: '',
      contract_contractCode: '',
      contract_PAYEstatus: '',
      contract_contractDeliverableType: '',
      contract_paymentPeriodSpecifier: '',
      contract_contractValueCurrency: '',
      contract_contractValue: '',
      contract_holidayRate: '',
      contract_noticePeriod: '',
      contract_overtimePayable: '',
      contract_overtimeRate: '',
      contract_ratePeriodSpecifier: '',
      contract_supplierFirstName: '',
      contract_supplierLastName: '',
      contract_supplierEmail: ''
    });

    this.taskService.taskForm = this.taskForm;

  }

  /**
   * 
   * extract specific display items from the process data
   * is called once form data is loaded
   * 
   */
  private setContent(data) {

    this.minBudget = this.taskService.getTaskVar('nvpList_budgetMin');
    this.maxBudget = this.taskService.getTaskVar('nvpList_budgetMax');

    let bpmPackageNodeRef: string = this.taskService.getTaskVar('bpm_package');
    this.bpmPackage = bpmPackageNodeRef.substring(24, 60);

  }
  /**
   * 
   * provides the form with the outline task information.
   * The full set of task variables are obtained from the TaskService
   * [ common for all task forms ]
   * 
   */
  public setTask(task: Task) {

    console.log('setting task' + task);
    this.task = task;
    this.taskService.connect(task).subscribe(
      data => {
        this.taskService.LoadTaskForm(data);
        this.setContent(data);
      },
      err => console.log(err)
    );

  }


  /** user closes the form */
  public onCancel() {
    this.dialogRef.close();
  }

  /** user closes the form and wants model updated but is not completed */
  public onSave() {

    this.taskService.Save().subscribe(
      data => {
        this.snackBar.open('Task saved...', null, {duration: 3000});
        this.dialogRef.close();
      },
      err => {this.snackBar.open('ERROR saving task', err.message, {duration: 3000});});

  }

  /** sets the task as complete */
  public onTaskComplete() {

    this.taskService.Save().subscribe(
      data => {
        this.taskService.TaskComplete().subscribe(
          d => {
            this.snackBar.open('Details sent to candidate', null, {duration: 3000});
            this.dialogRef.close();
          },
          err => {this.snackBar.open('ERROR completing role', err.message, {duration: 3000});});
      },
      error => {this.snackBar.open('ERROR comleting role', error.message, {duration: 3000});});



  }


}
