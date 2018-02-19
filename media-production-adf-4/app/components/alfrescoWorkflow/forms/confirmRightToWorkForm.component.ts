/**
 * 
 * A form component for reviewing an assignment offer
 * 
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import {MdTabsModule, MdSelectModule, MdInputModule, MdDialogRef, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdButtonModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Observable} from 'rxjs/Observable';

import {AlfrescoContentService} from 'ng2-alfresco-core';
import {DocumentListComponent} from 'ng2-alfresco-documentlist';

import {Task} from '../task';
import {TaskVar} from '../taskVar';
import {TaskService} from './taskService.service';
import {AlfrescoWorkflowService} from '../alfrescoWorkflow.service';
import {ContentModelConstraints} from '../../alfrescoModel/contentModelConstraints';
import {ProcessFileFormComponent} from './processFileForm.component';

// move this class to a better location and add all the fields
import {OpportunityModel} from './opportunity/opportunityModel';

@Component({
  selector: 'confitm-ritghtowork-form',
  templateUrl: './confirmRightToWorkForm.component.html',
  styleUrls: ['confirmRightToWorkForm.component.css', 'workflowform.component.css'],
  providers: [TaskService]
})
export class ConfirmRightToWorkFormComponent implements OnInit {



  /** form */
  public taskForm: FormGroup;
  public fields: string[] = [];
  public model: OpportunityModel = new OpportunityModel();

  /**
   * 
   * selected tab 
   * 
   */
  public selectedTab: number;

  /**
   * 
   * nodeId of the workflow package
   */
  public bpmPackage;


  /**
   * flags that indicate if the supplier is a UK national
   * they are set after the task data is loaded
   * 
   */
  public isUKNational: boolean = false;
  public isNotUKNational: boolean = false;

  /** task */
  public task: Task;
  protected taskId: number;
  protected loaded: boolean = false;
  protected taskModel: TaskVar[];
  private responseField = 'mwtwf_RTWReviewOutcome';
  private RTWAccepted = 'ACCEPTED';
  private RTWDeclined = 'DECLINED';

  constructor(private service: TaskService,
    private workflowService: AlfrescoWorkflowService,
    private fb: FormBuilder,
    private snackBar: MdSnackBar,
    private dialogRef: MdDialogRef<ConfirmRightToWorkFormComponent>) {

  }

  public ngOnInit() {

  }

  /** 
   * Add the form inputs into the form,
   * Give the form reference to the form service so it can load the data
   */
  private createForm() {

    this.taskForm = this.fb.group({


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
  public setTask(taskId: number) {
    console.log('setting task ' + taskId);
    this.taskId = taskId;
    this.service.connect(taskId).subscribe(
      data => {
        this.service.loadTaskModel(data);
        this.setContent(data);
      },
      err => console.log(err)
    );
  }

  /**
   * 
   * extract specific display items from the process data
   * is called once form data is loaded
   * 
   */
  private setContent(data) {

    console.log('Review task loading the model');
    console.log(data);

    /**
     * 
     * get the bpmPackage node id so we can list the document associated with this workflow instance
     * 
     */
    let bpmPackageNodeRef: string = this.service.getTaskVar('bpm_package');
    this.bpmPackage = bpmPackageNodeRef.substring(24, 60);

    // role
    this.model.contract_serviceName = this.service.getTaskVar('contract_serviceName');
    this.model.contract_serviceDescription = this.service.getTaskVar('contract_serviceDescription');
    this.model.contract_serviceStart = this.service.getTaskVar('contract_serviceStart');
    this.model.contract_serviceEnd = this.service.getTaskVar('contract_serviceEnd');
    this.model.contract_location = this.service.getTaskVar('contract_location');
    this.model.contract_contractCode = this.service.getTaskVar('contract_contractCode');
    this.model.contract_contractDeliverableType = this.service.getTaskVar('contract_contractDeliverableType');
    this.model.contract_overtimeRate = this.service.getTaskVar('contract_overtimeRate');

    // financials
    this.model.contract_contractValueCurrency = this.service.getTaskVar('contract_contractValueCurrency');
    this.model.contract_contractValue = this.service.getTaskVar('contract_contractValue');
    this.model.contract_ratePeriodSpecifier = this.service.getTaskVar('contract_ratePeriodSpecifier');
    this.model.contract_PAYEstatus = this.service.getTaskVar('contract_PAYEstatus');
    this.model.contract_paymentPeriodSpecifier = this.service.getTaskVar('contract_paymentPeriodSpecifier');
    this.model.contract_holidayRate = this.service.getTaskVar('contract_holidayRate');
    this.model.contract_overtimePayable = this.service.getTaskVar('contract_overtimePayable');
    this.model.contract_noticePeriod = this.service.getTaskVar('contract_noticePeriod');

    // personal details
    this.model.contract_supplierFirstName = this.service.getTaskVar('contract_supplierFirstName');
    this.model.contract_supplierLastName = this.service.getTaskVar('contract_supplierLastName');
    this.model.contract_supplierEmail = this.service.getTaskVar('contract_supplierEmail');
    this.model.contract_dateOfBirth = this.service.getTaskVar('contract_dateOfBirth');
    this.model.contract_townOfBirth = this.service.getTaskVar('contract_townOfBirth');
    this.model.contract_countryOfBirth = this.service.getTaskVar('contract_countryOfBirth');

    // contact details
    this.model.contract_supplierMobile = this.service.getTaskVar('contract_supplierMobile');
    this.model.contract_supplierAddress1 = this.service.getTaskVar('contract_supplierAddress1');
    this.model.contract_supplierAddress2 = this.service.getTaskVar('contract_supplierAddress2');
    this.model.contract_supplierAddress3 = this.service.getTaskVar('contract_supplierAddress3');
    this.model.contract_supplierPostCode = this.service.getTaskVar('contract_supplierPostCode');

    // right to work
    this.model.contract_rightToWorkAsserted = this.service.getTaskVar('contract_rightToWorkAsserted');
    this.model.contract_nationalInsuranceNumber = this.service.getTaskVar('contract_nationalInsuranceNumber');
    this.model.contract_identityDocumentReference = this.service.getTaskVar('contract_identityDocumentReference');
    this.model.contract_visaNumber = this.service.getTaskVar('contract_visaNumber');
    this.model.contract_visaExpiryDate = this.service.getTaskVar('contract_visaExpiryDate');

    // bank details
    this.model.prod_bankName = this.service.getTaskVar('prod_bankName');
    this.model.prod_bankAccountName = this.service.getTaskVar('prod_bankAccountName');
    this.model.prod_bankAccountNumber = this.service.getTaskVar('prod_bankAccountNumber');
    this.model.prod_bankBranchSortCode = this.service.getTaskVar('prod_bankBranchSortCode');

    /**
     * 
     * set the flags which drive the UI content for UK/ Not UK national
     * 
     */
    if (this.model.contract_rightToWorkAsserted === 'YES') {

      this.isUKNational = true;

    } else {

      this.isNotUKNational = true;

    }


  }

  /**
   * 
   * sets the displayed tab, provide the tab index
   * 
   */
  public setTab(index) {

    this.selectedTab = index;

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
      data => {
        this.snackBar.open('Task saved...', null, {duration: 3000});
        this.dialogRef.close();
      },
      err => {this.snackBar.open('ERROR saving task', err.message, {duration: 3000});});

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
          d => {
            this.snackBar.open('Role completed', null, {duration: 3000});
            this.dialogRef.close();
          },
          err => {this.snackBar.open('ERROR completing role', err.message, {duration: 3000});});
      },
      error => {this.snackBar.open('ERROR comleting role', error.message, {duration: 3000});});

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
          d => {
            this.snackBar.open('More information requested', null, {duration: 3000});
            this.dialogRef.close();
          },
          err => {this.snackBar.open('ERROR requesting more information', err.message, {duration: 3000});});
      },
      error => {this.snackBar.open('ERROR requesting more information', error.message, {duration: 3000});});

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
          d => {
            this.snackBar.open('Role declined', null, {duration: 3000});
            this.dialogRef.close();
          },
          err => {this.snackBar.open('ERROR declining role', err.message, {duration: 3000});});
      },
      error => {this.snackBar.open('ERROR declining role', error.message, {duration: 3000});});

  }

}
