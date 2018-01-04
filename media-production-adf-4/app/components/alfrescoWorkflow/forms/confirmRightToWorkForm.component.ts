/**
 * 
 * A form component for reviewing an assignment offer
 * 
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdTabsModule, MdSelectModule, MdInputModule, MdDialogRef, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdButtonModule } from '@angular/material';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';

import { AlfrescoContentService } from 'ng2-alfresco-core';
import { DocumentListComponent } from 'ng2-alfresco-documentlist';

import { Task } from '../task';
import { TaskVar } from '../taskVar';
import { TaskService } from './taskService.service';
import { AlfrescoWorkflowService } from '../alfrescoWorkflow.service';
import { ContentModelConstraints } from '../../alfrescoModel/contentModelConstraints';
import { ProcessFileFormComponent } from './processFileForm.component';

@Component({
    selector: 'confitm-ritghtowork-form',
    templateUrl : './confirmRightToWorkForm.component.html',
    styleUrls: ['confirmRightToWorkForm.component.css','workflowform.component.css'],
    providers: [ TaskService ]
})
export class ConfirmRightToWorkFormComponent implements OnInit {


  
  /** form */
  public taskForm: FormGroup;
  public fields: string[] = [];
  
  /**
   * 
   * selected tab 
   * 
   */
  public selectedTab: number;
  
  /**
   * 
   * Right To Work status
   * UNKNOWN | YES | NO
   * 
   */
  public RTWStatus: string;
  
  /**
   * 
   * nodeId of the workflow package
   */
  public bpmPackage;
  
  
  /** task */
  public task: Task;
  protected taskId: number;
  protected loaded: boolean = false;
  protected taskModel: TaskVar[];
  private responseField = 'mwtwf_acceptContractOutcome';
  private roleAccepted = 'ACCEPTED';
  private roleDeclined = 'DECLINED';
  
  constructor(private service: TaskService,
              private workflowService: AlfrescoWorkflowService,
              private fb: FormBuilder,
              private snackBar: MdSnackBar,
              private dialogRef: MdDialogRef<ConfirmRightToWorkFormComponent>) {
    this.createForm();
   }
  
  public ngOnInit() {
  
  }
  
  /** 
   * Add the form inputs into the form,
   * Give the form reference to the form service so it can load the data
   */
  private createForm() {
    this.taskForm = this.fb.group( {
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
      contract_overtimePayable: null,
      contract_overtimeRate: '',
      contract_ratePeriodSpecifier: '',
      contract_supplierFirstName: '',
      contract_supplierLastName: '',
      // supplier_UKNational: '',
      contract_supplierMobile: '',
      contract_supplierAddress1: '',
      contract_supplierAddress2: '',
      contract_supplierAddress3: '',
      contract_supplierPostCode: '',
      
      contract_dateOfBirth: null,
      contract_townOfBirth: '',
      contract_countryOfBirth: '',
      contract_nationalInsuranceNumber: '',
      contract_identityDocumentReference: '',
      contract_visaNumber: '',
      contract_visaExpiryDate: null
      
    });
    
    this.service.taskForm = this.taskForm;
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
    this.service.connect(task).subscribe(
      data => { this.service.LoadTaskForm(data);
                this.setContent(data);},
      err  => console.log(err)
      );
  }
  
  /**
   * 
   * extract specific display items from the process data
   * is called once form data is loaded
   * 
   */
  private setContent(data) {
    
    let bpmPackageNodeRef: string = this.service.getTaskVar('bpm_package');
    this.bpmPackage = bpmPackageNodeRef.substring(24,60);
      
  }
  
  /**
   * close this window without saving
   * [ common for all task forms ]
   * 
   */
  public onCancel() {
    
    this.dialogRef.close();
  
  }
 
  /**
   * 
   * save the current data back to the workflow and close the window
   * [ common for all task forms ]
   * 
   */
  public onSave() {
    
    this.service.Save().subscribe(
      data => { this.snackBar.open('Task saved...', null, {duration: 3000});
                this.dialogRef.close();},
      err =>  { this.snackBar.open('ERROR saving task', err.message, {duration: 3000});});
  
  }
  
 /**
  * 
  * Confirm that this person has the right to work in the UK
  * 
  */
 public onConfirmRTW() {
   
    this.service.setTaskVar('contract_RTWdate', new Date());
    this.service.setTaskVar('contract_RTWdecision', 'PASS');
    
    this.service.Save().subscribe( 
        data => {
                this.service.TaskComplete().subscribe(
                       d => { this.snackBar.open('Role completed', null, {duration: 3000});
                                 this.dialogRef.close();},
                       err =>  { this.snackBar.open('ERROR completing role', err.message, {duration: 3000});});
                },
        error => { this.snackBar.open('ERROR comleting role', error.message, {duration: 3000});});
    
 }

 /**
  * 
  * Request more information on right to work
  * 
  */
 public onReqestInfo() {
   
    this.service.setTaskVar('contract_RTWdate', new Date());
    this.service.setTaskVar('contract_RTWdecision', 'PENDING_MORE_INFO');
    
    this.service.Save().subscribe( 
        data => {
                this.service.TaskComplete().subscribe(
                       d => { this.snackBar.open('More information requested', null, {duration: 3000});
                                 this.dialogRef.close();},
                       err =>  { this.snackBar.open('ERROR requesting more information', err.message, {duration: 3000});});
                },
        error => { this.snackBar.open('ERROR requesting more information', error.message, {duration: 3000});});
    
 }
  
 /**
  *
  * Confirm that this person does not have the right to work in the UK
  *   
  */
 public onDeclineRTW() {
   
    this.service.setTaskVar('contract_RTWdate', new Date());
    this.service.setTaskVar('contract_RTWdecision', 'FAIL');
    
    this.service.Save().subscribe( 
        data => {
                this.service.TaskComplete().subscribe(
                       d => { this.snackBar.open('Role declined', null, {duration: 3000});
                                 this.dialogRef.close();},
                       err =>  { this.snackBar.open('ERROR declining role', err.message, {duration: 3000});});
                },
        error => { this.snackBar.open('ERROR declining role', error.message, {duration: 3000});});
   
 }
  
}
