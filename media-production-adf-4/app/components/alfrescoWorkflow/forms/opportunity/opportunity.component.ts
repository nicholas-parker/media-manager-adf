/**
 * 
 * component which displays the data in the opportunity tasks
 * 
 */
import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {FormControl, FormGroup, FormBuilder, FormArray} from '@angular/forms';
import {MdProgressSpinnerModule, MdGridList, MdSnackBar, MdSelectModule, MdInputModule, MdButtonModule, MdDatepickerModule} from '@angular/material';
import {ContentModelConstraints} from '../../../alfrescoModel/contentModelConstraints';
import {OpportunityModel} from './opportunityModel';
import {ProcessFileFormComponent} from '../processFileForm.component';
import {TaskService} from '../taskService.service';
import {NodesApiService} from 'ng2-alfresco-core';
import {AlfrescoWorkflowService} from '../../alfrescoWorkflow.service';
import {ServicePeriodComponent} from '../servicePeriod/servicePeriod.component';
import {ServicePeriodService} from '../servicePeriod/servicePeriod.service';
import {ServicePeriod} from '../../../productionComponentModule/servicePeriod';
import {TaskForm} from '../taskForm';
import {RoleService} from '../../../../modules/production/rolePlanning/role.service';
import {Role} from '../../../../modules/production/rolePlanning/role';
import {ContractService} from '../../../contract/contract.service';

@Component({
  selector: 'opportunity',
  templateUrl: './opportunity.component.html',
  styleUrls: ['./opportunity.component.css']
})
export class OpportunityComponent extends TaskForm implements OnInit {

  /** type lists for form drop lists */
  private deliverableTypeList = ContentModelConstraints.contract_contractDeliverableTypeConstraint;
  private PAYEStatusList = ContentModelConstraints.nvp_PAYEStatusConstraint;
  private workingWeekList = ContentModelConstraints.contract_workingWeekConstraint;
  private paymentPeriodList = ContentModelConstraints.contract_periodSpecifiedConstraint;
  private ratePeriodList = ContentModelConstraints.contract_ratePeriodConstraint;
  private currencyList = ContentModelConstraints.contract_contractCurrencyConstraint;
  private managementProcessList = ContentModelConstraints.contract_workflowNameConstraint;
  private adminTeamList = ContentModelConstraints.contract_contractAdministrationTeamConstraint;

  /** form */
  public opportunityForm: FormGroup;
  public fields: string[] = [];

  /** opportunity */
  public opportunityId;
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
  private passport: ProcessFileFormComponent;
  private passportProperties;
  private passportAspects;

  @ViewChild(ProcessFileFormComponent)
  private visa: ProcessFileFormComponent;
  private visaProperties;
  private visaAspects;

  // @ViewChild(ServicePeriodComponent)
  public servicePeriod: ServicePeriodComponent;

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
  public subTask: Subscription;
  protected loaded: boolean = false;
  @Input()
  public set taskId(id: number) {

    console.log(' opportunity component loading taskid ' + id);

    if (id === 0) {return;}
    this.subTask = this.taskService.connect(id).subscribe(
      data => {

        this.taskService.LoadTaskForm(data);
        this.setContent(data);

      },
      err => console.log(err));

  }

  // protected taskModel: TaskVar[];
  private reviewStatusOutcome = 'reviewStatusOutcome';
  private roleAccepted = 'Accepted';  // same as ProductionRoleModel.ROLE_STATUS_APPROVED
  private roleDeclined = 'Declined';  // same as ProductionRoleModel.ROLE_STATUS_DECLINED
  public signature;
  public signingId = '';

  /**
   * 
   * objects which controls the visibility of the tabs and their read / write  mode
   * 
   */
  public showRole: boolean = false;
  public editRole: boolean = false;

  public showFinancials: boolean = false;
  public editFinancials: boolean = false;

  public showEmployee: boolean = false;

  public showPersonal: boolean = false;
  public editPersonal: boolean = false;

  public showContact: boolean = false;
  public editContact: boolean = false;

  public showRTW: boolean = false;
  public editRTW: boolean = false;

  public showBank: boolean = false;
  public editBank: boolean = false;

  public showContract: boolean = false;
  public editContract: boolean = false;

  @Input('displayOptions')
  public set displayOptions(options) {

    console.log(options);

    /** role display and edit */
    if (undefined !== options.role) {
      this.showRole = true;
      if (options.role === 'write') {
        this.editRole = true;
      }
    }

    /** financials display and edit */
    if (undefined !== options.financials) {
      this.showFinancials = true;
      if (options.financials === 'write') {
        this.editFinancials = true;
      }
    }

    /** enter employee details, only in edit mode, not shown if personal also defined */
    if ((undefined !== options.employee) && (undefined === options.personal)) {
      this.showEmployee = true;
    }

    /** personals display and edit */
    if (undefined !== options.personal) {
      this.showPersonal = true;
      if (options.personal === 'write') {
        this.editPersonal = true;
      }
    }

    /** contact display and edit */
    if (undefined !== options.contact) {
      this.showContact = true;
      if (options.contact === 'write') {
        this.editContact = true;
      }
    }

    /** RTW display and edit */
    if (undefined !== options.rtw) {
      this.showContact = true;
      if (options.contact === 'write') {
        this.editContact = true;
      }
    }

    /** Bank display and edit */
    if (undefined !== options.bank) {
      this.showBank = true;
      if (options.bank === 'write') {
        this.editBank = true;
      }
    }

    /** Contract display and edit */
    if (undefined !== options.contract) {
      this.showContract = true;
      if (options.contract === 'write') {
        this.editContract = true;
      }
    }
  }

  constructor(private roleService: RoleService,
    private contractService: ContractService,
    private nodeService: NodesApiService,
    private workflowService: AlfrescoWorkflowService,
    private servicePeriodService: ServicePeriodService,
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MdSnackBar
  ) {
    super(taskService, snackBar);
    this.servicePeriod = new ServicePeriodComponent(fb, servicePeriodService, this.snackBar);
    this.servicePeriod.serviceTypeCode = ServicePeriod.TYPE_CREW_ENGAGEMENT;
    this.servicePeriod.childRelationshipType = 'contract:engagementPeriods';
    this.createForm();

  }

  public ngOnInit() {

  }

  public ngAfterContentInit() {

    if (this.isReviewing) {

      /** aspects & properties for the passport document */
      this.passportAspects = ['prod:document'];
      this.passportProperties = {'prod:docType': 'Passport', 'prod:docCategory': 'Proof of identity'};

      /** aspects & properties for the visa documents */
      this.visaAspects = ['prod:document'];
      this.visaProperties = {'prod:docType': 'Visa', 'prod:docCategory': 'Proof of identity'};

    }

  }

  public ngOnDestroy() {

    if (this.subTask !== undefined) {
      this.subTask.unsubscribe();
    }

  }

  /**
   * 
   * sets the taskid of the opportunity task we are displaying
   * 
   */

  /** 
   * Add the form inputs into the form,
   * Give the form reference to the form service so it can load the data
   */
  private createForm() {

    console.log('Opportunity component...creating form');

    this.opportunityForm = this.fb.group({
      contract_serviceName: new FormControl(),
      contract_serviceDescription: new FormControl(),
      contract_location: new FormControl(),

      contract_contractValueCurrency: new FormControl(),
      contract_contractValue: new FormControl(),
      contract_ratePeriodSpecifier: new FormControl(),
      contract_PAYEstatus: new FormControl(),
      contract_paymentPeriodSpecifier: new FormControl(),
      contract_contractCode: new FormControl(),
      contract_overtimePayable: new FormControl(),
      contract_overtimeRate: new FormControl(),
      contract_holidayRate: new FormControl(),
      contract_contractDeliverableType: new FormControl(),
      contract_noticePeriod: new FormControl(),

      contract_supplierFirstName: new FormControl(),
      contract_supplierLastName: new FormControl(),
      contract_supplierEmail: new FormControl(),
      contract_rightToWorkAsserted: new FormControl(),
      contract_supplierMobile: new FormControl(),
      contract_supplierAddress1: new FormControl(),
      contract_supplierAddress2: new FormControl(),
      contract_supplierAddress3: new FormControl(),
      contract_supplierPostCode: new FormControl(),

      contract_dateOfBirth: new FormControl(null),
      contract_townOfBirth: new FormControl(),
      contract_countryOfBirth: new FormControl(),
      contract_nationalInsuranceNumber: new FormControl(),
      contract_identityDocumentReference: new FormControl(),
      contract_visaNumber: new FormControl(),
      contract_visaExpiryDate: new FormControl(null),
      prod_bankName: new FormControl(),
      prod_bankAccountName: new FormControl(),
      prod_bankAccountNumber: new FormControl(),
      prod_bankBranchSortCode: new FormControl(),

      signature: new FormControl(),
      candidateReviewOutcome: new FormControl(),

      /** FormArray for the service periods */
      servicePeriods: this.fb.array([])

    });

    // give the service a reference to this form and it will load it with matching variables from the process
    this.taskService.taskForm = this.opportunityForm;
  }


  /**
   * 
   * extract the role data from the process data
   * is called once form data is loaded
   * 
   */
  private setContent(data) {

    // this.passport.processId = this.taskService.getTaskVar('processId');
    let bpmPackageNodeRef: string = this.taskService.getTaskVar('bpm_package');
    this.bpmPackage = bpmPackageNodeRef.substring(24, 60);
    this.bpmContractUUID = this.taskService.getTaskVar('contract_contractDocumentNodeId');
    this.hasContract = true;

    this.model.contract_serviceName = this.taskService.getTaskVar('contract_serviceName');
    this.model.contract_serviceDescription = this.taskService.getTaskVar('contract_serviceDescription');
    this.model.contract_serviceStart = this.taskService.getTaskVar('contract_serviceStart');
    this.model.contract_serviceEnd = this.taskService.getTaskVar('contract_serviceEnd');
    this.model.contract_location = this.taskService.getTaskVar('contract_location');
    this.model.contract_contractCode = this.taskService.getTaskVar('contract_contractCode');
    this.model.contract_PAYEstatus = this.taskService.getTaskVar('contract_PAYEstatus');
    this.model.contract_contractDeliverableType = this.taskService.getTaskVar('contract_contractDeliverableType');
    this.model.contract_paymentPeriodSpecifier = this.taskService.getTaskVar('contract_paymentPeriodSpecifier');
    this.model.contract_contractValueCurrency = this.taskService.getTaskVar('contract_contractValueCurrency');
    this.model.contract_contractValue = this.taskService.getTaskVar('contract_contractValue');
    this.model.contract_holidayRate = this.taskService.getTaskVar('contract_holidayRate');
    this.model.contract_noticePeriod = this.taskService.getTaskVar('contract_noticePeriod');
    this.model.contract_overtimePayable = this.taskService.getTaskVar('contract_overtimePayable');
    this.model.contract_overtimeRate = this.taskService.getTaskVar('contract_overtimeRate');
    this.model.contract_ratePeriodSpecifier = this.taskService.getTaskVar('contract_ratePeriodSpecifier');

    /**
     * 
     * set the flags which drive the UI content for UK/ Not UK national
     * 
     */
    this.model.contract_rightToWorkAsserted = this.taskService.getTaskVar('contract_rightToWorkAsserted');
    if (this.model.contract_rightToWorkAsserted === 'YES') {

      this.isUKNational = true;

    } else {

      this.isNotUKNational = true;

    }

    /**
     * 
     * give the servicePeriod object a reference to the FormArray with the service period components in it
     * now it has that reference get it to load the servicePeriod data into the form
     * 
     */
    this.servicePeriod.servicePeriods = <FormArray>this.opportunityForm.controls['servicePeriods'];
    this.servicePeriod.parentNodeId = this.bpmContractUUID;
    this.servicePeriod.getPeriods();

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

  }

  /**
   * 
   * NON UK National, sets the entry form for a non UK National
   * 
   */
  public nonUKNational() {

    this.isUKNational = false;
    this.isNotUKNational = true;

  }

  /**
   * 
   * save the current data back to the workflow and close the window
   * [ common for all task forms ]
   * 
   */
  public onSave() {

    this.taskService.Save().subscribe(
      data => {
        this.snackBar.open('Task saved...', null, {duration: 3000});
        // this.dialogRef.close();
      },
      err => {this.snackBar.open('ERROR saving task', err.message, {duration: 3000});});

  }

  /**
   * 
   * a contract admin completes the details and submits to candidate
   * 
   */
  public sendToCandidate(): Observable<any> {

    return this.contractService.getContractRoleId(this.bpmContractUUID)
      .flatMap((roleId: string) => {
        return this.roleService.updateRoleStatus(roleId, Role.ROLE_STATUS_SUPPLIER_REVIEW);
      })
      .flatMap((d: any) => {
        return this.taskService.Save();
      })
      .flatMap((d: any) => {
        return this.taskService.TaskComplete();
      });
  }

  /**
   * @deprecated - now in member/accept component
   * 
   * User wants to electronically sign the contract,
   * invoke the back end service to sign the agreement
   * 
   */
  public onSign() {

    this.hasSigned = true;
    this.signature = this.opportunityForm.controls['signature'].value;
    this.opportunityForm.controls['signature'].disable();
    this.opportunityForm.controls['signature'].setValue(this.signature);
    this.signingId = '5b44tg657ffd5d7';

    this.onAccept();

  }


  /**
   * @deprecated - now in member/accept component
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

    this.opportunityForm.controls['candidateReviewOutcome'].setValue(this.roleAccepted);
    this.completeTask();

  }

  /**
   * A contract admin member receives a decline notification via an offline method and declines on behalf of the candidate
   * 
   * decline role button executes this method
   * 
   */
  public onDecline() {

    this.opportunityForm.controls['candidateReviewOutcome'].setValue(this.roleDeclined);
    this.completeTask();

  }

  /**
   * 
   * saves the current model and sets the task status to complete
   * 
   */
  private completeTask() {
    this.taskService.Save().subscribe(

      /**
       * 
       * task information saved to workflow
       * 
       */
      data => {
        this.taskService.TaskComplete().subscribe(

          /**
           * 
           * task marked as complete in workflow
           * 
           */
          d => {
            this.snackBar.open('Assignment accepted...', null, {duration: 3000});
            this.isReviewing = false;
            if (this.opportunityForm.controls['candidateReviewOutcome'].value === this.roleAccepted) {

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

  /** WRAPPER FUNCTIONS FOR servicePeriod */

  public add() {
    this.servicePeriod.add();
  }

  public save(i) {
    this.servicePeriod.save(i);
  }

  public delete(i) {
    this.servicePeriod.delete(i);
  }
}
