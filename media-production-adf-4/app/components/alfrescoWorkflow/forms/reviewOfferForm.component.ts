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

import {AlfrescoContentService, FileUploadCompleteEvent, UploadService} from 'ng2-alfresco-core';
import {DocumentListComponent} from 'ng2-alfresco-documentlist';

import {Task} from '../task';
import {TaskVar} from '../taskVar';
import {TaskService} from './taskService.service';
import {AlfrescoWorkflowService} from '../alfrescoWorkflow.service';
import {ContentModelConstraints} from '../../alfrescoModel/contentModelConstraints';
import {ProcessFileFormComponent} from './processFileForm.component';

@Component({
  selector: 'review-offer-form',
  templateUrl: './reviewOfferForm.component.html',
  styleUrls: ['reviewOfferForm.component.css', 'workflowform.component.css'],
  providers: [TaskService]
})
export class ReviewOfferFormComponent implements OnInit {

  /** type lists for form drop lists */
  /** CUSTOM PER FORM */
  private deliverableTypeList = ContentModelConstraints.contract_contractDeliverableTypeConstraint;
  private PAYEStatusList = ContentModelConstraints.nvp_PAYEStatusConstraint;
  private workingWeekList = ContentModelConstraints.contract_workingWeekConstraint;
  private paymentPeriodList = ContentModelConstraints.contract_periodSpecifiedConstraint;
  private ratePeriodList = ContentModelConstraints.contract_ratePeriodConstraint;
  private currencyList = ContentModelConstraints.contract_contractCurrencyConstraint;
  private managementProcessList = ContentModelConstraints.contract_workflowNameConstraint;
  private adminTeamList = ContentModelConstraints.contract_contractAdministrationTeamConstraint;

  /** form */
  public taskForm: FormGroup;
  public fields: string[] = [];

  /**
   * 
   * the selected tab in the tab component
   * 
   */
  public selectedTab;

  /**
   * 
   * manage the passport associated with this process
   * 
   */
  @ViewChild(ProcessFileFormComponent)
  private passport: ProcessFileFormComponent;

  /**
   * 
   * manage the non UK national right to work documents
   * 
   */

  /**
   * 
   * nodeId of the workflow package
   */
  public bpmPackage;

  /**
   * 
   * flag to indicate if the contract has been signed
   * 
   */
  public hasSigned: boolean = false;

  /** task */
  public task: Task;
  protected taskId: number;
  protected loaded: boolean = false;
  protected taskModel: TaskVar[];
  private reviewStatusOutcome = 'reviewStatusOutcome';
  private roleAccepted = 'Accepted';  // same as ProductionRoleModel
  private roleDeclined = 'Declined';  // same as ProductionRoleModel

  constructor(private service: TaskService,
    private workflowService: AlfrescoWorkflowService,
    private fb: FormBuilder,
    private snackBar: MdSnackBar,
    private dialogRef: MdDialogRef<ReviewOfferFormComponent>) {
    this.createForm();
  }

  /**
   * 
   * initialise the child file components
   * 
   */
  public ngOnInit() {

    /** aspects & properties for the passport document */
    this.passport.aspects = ['prod:document'];
    this.passport.properties = {'prod:docType': 'Passport', 'prod:docCategory': 'Proof of identity'};

  }

  /** 
   * Add the form inputs into the form,
   * Give the form reference to the form service so it can load the data
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
      contract_overtimePayable: null,
      contract_overtimeRate: '',
      contract_ratePeriodSpecifier: '',
      contract_supplierFirstName: '',
      contract_supplierLastName: '',
      contract_supplierEmail: '',
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
      contract_visaExpiryDate: null,
      prod_bankName: '',
      prod_bankAccountName: '',
      prod_bankAccountNumber: '',
      prod_bankBranchSortCode: ''

    });

    this.service.taskForm = this.taskForm;
  }

  /**
   * 
   * provides the form with the outline task information.
   * The full set of task variables are obtained from the TaskService
   * [ common for all task forms ]
   */
  public setTask(task: Task) {
    console.log('setting task' + task);
    this.task = task;
    this.service.connect(task).subscribe(
      data => {
        console.log('subscribe callback');
        this.service.LoadTaskForm(data);
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

    this.passport.processId = + this.task.processId;
    let bpmPackageNodeRef: string = this.service.getTaskVar('bpm_package');
    this.bpmPackage = bpmPackageNodeRef.substring(24, 60);

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
   * User wants to electronically sign the contract,
   * invoke the back end service to sign the agreement
   * 
   */
  public onSign() {

    this.hasSigned = true;

  }


  /**
   * 
   * user accepts the role, update the response value and complete the task
   * 
   */
  public onAccept() {

    // TODO - check form is validated


    if (this.hasSigned === false) {
      this.snackBar.open('Please sign the contract before accepting the role', null, {duration: 5000});
      this.selectedTab = 4;
      return;
    }

    this.service.setTaskVar(this.reviewStatusOutcome, this.roleAccepted);
    this.completeTask();

  }

  /**
   * 
   * decline role button executes this method
   * 
   */
  public onDecline() {

    this.service.setTaskVar(this.reviewStatusOutcome, this.roleDeclined);
    this.completeTask();

  }

  /**
   * 
   * saves the current model and sets the task status to complete
   * 
   */
  private completeTask() {
    this.service.Save().subscribe(
      data => {
        this.service.TaskComplete().subscribe(
          d => {
            this.snackBar.open('Assignment accepted...', null, {duration: 3000});
            this.dialogRef.close();
          },
          err => {this.snackBar.open('ERROR accepting assignment', err.message, {duration: 3000});});
      },
      error => {this.snackBar.open('ERROR accepting assignment', error.message, {duration: 3000});});

  }


}
