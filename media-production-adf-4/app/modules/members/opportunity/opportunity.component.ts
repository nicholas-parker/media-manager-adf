/**
 * 
 * A member module component which allows a member to interact with 
 * opportunity tasks using the mwtwf:reviewContractDetailsTask form key
 * 
 */
import {Observable, Subscription} from 'rxjs/Rx';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MdTabsModule, MdSelectModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {Task} from '../../../components/alfrescoWorkflow/task';
import {TaskVar} from '../../../components/alfrescoWorkflow/taskVar';
import {AlfrescoService} from '../../../components/alfrescoWorkflow/alfresco.service';
import {AlfrescoWorkflowService} from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {TaskService} from '../../../components/alfrescoWorkflow/forms/taskService.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ContentModelConstraints} from '../../../components/alfrescoModel/contentModelConstraints';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {ProcessFileFormComponent} from '../../../components/alfrescoWorkflow/forms/processFileForm.component';
import {OpportunityModel} from './opportunityModel';
import {ViewerModule} from 'ng2-alfresco-viewer';
import {NodesApiService} from 'ng2-alfresco-core';

@Component({
  selector: 'member-opportunity',
  templateUrl: './opportunity.component.html',
  styleUrls: ['opportunity.component.css']
})
export class OpportunityComponent {

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
  public model: OpportunityModel = new OpportunityModel();

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
  private documents: ProcessFileFormComponent;
  private passportProperties;
  private passportAspects;

  /**
   * 
   * manage the non UK national right to work documents
   * 
   */
  private isUKNational: boolean = false;
  private isNotUKNational: boolean = false;

  /**
   * 
   * node URL of the workflow package
   * 
   */
  public bpmPackage;

  /**
   * 
   * node ID of the 'Contract document' in the bpmPackage
   * 
   */
  public bpmContractUUID;

  /**
   * 
   * a flag which indicates this task has a contract
   * 
   */
  private hasContract: boolean = false;


  /**
   * 
   * node URL of the contract, displayed in viewer
   * 
   */
  public nodeId;


  /**
   * 
   * flag to indicate if the contract has been signed
   * 
   */
  public hasSigned: boolean = false;

  /**
   * 
   * a flag to indicate that the review by the candidate is underway
   * 
   */
  private isReviewing: boolean = true;

  /**
   * 
   * a flag to indicate the candidate has completed the review and has accepted
   * 
   */
  private completeAccepted: boolean = false;

  /**
   * 
   * a flag to indicate the candidate has completed the review and has rejected
   * 
   */
  private completeRejected: boolean = false;

  /** task */
  public task: Task;
  protected taskId: number;
  protected loaded: boolean = false;
  protected taskModel: TaskVar[];
  private reviewStatusOutcome = 'reviewStatusOutcome';
  private roleAccepted = 'Accepted';  // same as ProductionRoleModel
  private roleDeclined = 'Declined';  // same as ProductionRoleModel
  public signature;
  public signingId = '';

  /**
   * 
   * Observable to the route parameters
   * 
   */
  private routeParamSub: Subscription;

  constructor(private service: TaskService,
    private nodeService: NodesApiService,
    private workflowService: AlfrescoWorkflowService,
    private fb: FormBuilder,
    private snackBar: MdSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
  }

  /**
   * 
   * initialise the child file components
   * 
   */
  public ngOnInit() {

    /**
     * 
     * subscribe to route parameters
     * 
     */
    this.routeParamSub = this.route.params.subscribe(params => {
      this.taskId = +params['id']; // (+) converts string 'id' to a number
      this.setTask(this.taskId);
    });
  }

  public ngAfterContentInit() {

    if (this.isReviewing) {

      /** aspects & properties for the passport document */
      this.passportAspects = ['prod:document'];
      this.passportProperties = {'prod:docType': 'Passport', 'prod:docCategory': 'Proof of identity'};

    }

  }
  /**
   * 
   * we only have on observable to destroy
   * 
   */
  public ngOnDestroy() {

    this.routeParamSub.unsubscribe();

  }

  /** 
   * Add the form inputs into the form,
   * Give the form reference to the form service so it can load the data
   */
  private createForm() {

    this.taskForm = this.fb.group({
      contract_supplierFirstName: '',
      contract_supplierLastName: '',
      contract_supplierEmail: '',
      contract_rightToWorkAsserted: '',
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
      prod_bankBranchSortCode: '',

      signature: '',
      candidateReviewOutcome: ''

    });

    this.service.taskForm = this.taskForm;
  }

  /**
   * 
   * provides the form with the outline task information.
   * The full set of task variables are obtained from the TaskService
   * [ common for all task forms ]
   */
  public setTask(id: number) {
    console.log('setting taskid ' + id);

    this.service.connect(id).subscribe(
      data => {
        this.service.LoadTaskForm(data);
        this.setContent(data);
      },
      err => console.log(err)
    );
  }

  /**
   * 
   * extract the role data from the process data
   * is called once form data is loaded
   * 
   */
  private setContent(data) {

    // this.passport.processId = this.service.getTaskVar('processId');
    let bpmPackageNodeRef: string = this.service.getTaskVar('bpm_package');
    this.bpmPackage = bpmPackageNodeRef.substring(24, 60);
    let bpmPackageChildren_obs = this.nodeService.getNodeChildren(this.bpmPackage);
    bpmPackageChildren_obs.subscribe(

      results => {
        for (let item of results.list.entries) {

          if (item.entry.properties['prod:docName'] === 'Employment contract') {
            this.bpmContractUUID = item.entry.id;
            this.hasContract = true;
            console.log('Employment UUID is ' + this.bpmContractUUID);
          }

        }

      },

      err => {

      }
    );



    this.model.contract_serviceName = this.service.getTaskVar('contract_serviceName');
    this.model.contract_serviceDescription = this.service.getTaskVar('contract_serviceDescription');
    this.model.contract_serviceStart = this.service.getTaskVar('contract_serviceStart');
    this.model.contract_serviceEnd = this.service.getTaskVar('contract_serviceEnd');
    this.model.contract_location = this.service.getTaskVar('contract_location');
    this.model.contract_contractCode = this.service.getTaskVar('contract_contractCode');
    this.model.contract_PAYEstatus = this.service.getTaskVar('contract_PAYEstatus');
    this.model.contract_contractDeliverableType = this.service.getTaskVar('contract_contractDeliverableType');
    this.model.contract_paymentPeriodSpecifier = this.service.getTaskVar('contract_paymentPeriodSpecifier');
    this.model.contract_contractValueCurrency = this.service.getTaskVar('contract_contractValueCurrency');
    this.model.contract_contractValue = this.service.getTaskVar('contract_contractValue');
    this.model.contract_holidayRate = this.service.getTaskVar('contract_holidayRate');
    this.model.contract_noticePeriod = this.service.getTaskVar('contract_noticePeriod');
    this.model.contract_overtimePayable = this.service.getTaskVar('contract_overtimePayable');
    this.model.contract_overtimeRate = this.service.getTaskVar('contract_overtimeRate');
    this.model.contract_ratePeriodSpecifier = this.service.getTaskVar('contract_ratePeriodSpecifier');


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
   * 
   * UK National, sets the entry f  orm for UK National
   * 
   */
  public UKNational() {

    this.isUKNational = true;
    this.isNotUKNational = false;
    this.documents.explainText = 'Upload a scan of your passport';
    this.documents.maxFiles = 1;

  }

  /**
   * 
   * NON UK National, sets the entry form for a non UK National
   * 
   */
  public nonUKNational() {

    this.isUKNational = false;
    this.isNotUKNational = true;
    this.documents.explainText = 'Upload a scan of your passport and visa';
    this.documents.maxFiles = 2;

  }

  /**
   * close this window without saving
   * [ common for all task forms ]
   * 
   */
  public onCancel() {

    // this.dialogRef.close();

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
        // this.dialogRef.close();
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
    this.signature = this.taskForm.controls['signature'].value;
    this.taskForm.controls['signature'].disable();
    this.taskForm.controls['signature'].setValue(this.signature);
    this.signingId = '5b44tg657ffd5d7';

    this.onAccept();

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

    this.taskForm.controls['candidateReviewOutcome'].setValue(this.roleAccepted);
    this.completeTask();

  }

  /**
   * 
   * decline role button executes this method
   * 
   */
  public onDecline() {

    this.taskForm.controls['candidateReviewOutcome'].setValue(this.roleDeclined);
    this.completeTask();

  }

  /**
   * 
   * saves the current model and sets the task status to complete
   * 
   */
  private completeTask() {
    this.service.Save().subscribe(

      /**
       * 
       * task information saved to workflow
       * 
       */
      data => {
        this.service.TaskComplete().subscribe(

          /**
           * 
           * task marked as complete in workflow
           * 
           */
          d => {
            this.snackBar.open('Assignment accepted...', null, {duration: 3000});
            this.isReviewing = false;
            if (this.taskForm.controls['candidateReviewOutcome'].value === this.roleAccepted) {

              this.completeAccepted = true;

            } else {

              this.completeRejected = true;

            }
          },

          /**
           * 
           * error marking task complete in workflow
           * 
           */
          err => {this.snackBar.open('ERROR accepting assignment', err.message, {duration: 3000});});
      },

      /**
       * 
       * error saving task data to workflow
       * 
       */
      error => {this.snackBar.open('ERROR accepting assignment', error.message, {duration: 3000});});

  }


}
