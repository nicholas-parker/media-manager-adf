/**
 * 
 * A member module component which allows a member to interact with 
 * opportunity tasks using the mwtwf:reviewContractDetailsTask form key
 * 
 */
import {Observable, Subscription} from 'rxjs/Rx';
import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdTabsModule, MdSelectModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Task} from '../../../components/alfrescoWorkflow/task';
import {TaskVar} from '../../../components/alfrescoWorkflow/taskVar';
import {AlfrescoService} from '../../../components/alfrescoWorkflow/alfresco.service';
import {AlfrescoWorkflowService} from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {TaskService} from '../../../components/alfrescoWorkflow/forms/taskService.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ContentModelConstraints} from '../../../components/alfrescoModel/contentModelConstraints';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {ProcessFileFormComponent} from '../../../components/alfrescoWorkflow/forms/processFileForm.component';
import {OpportunityModel} from '../../../components/alfrescoWorkflow/forms/opportunity/opportunityModel';
import {ViewerModule} from 'ng2-alfresco-viewer';
import {NodesApiService} from 'ng2-alfresco-core';
import {ServicePeriodService} from '../../../components/alfrescoWorkflow/forms/servicePeriod/servicePeriod.service';
import {ServicePeriod} from '../../../components/productionComponentModule/servicePeriod';
import {ContractModel} from '../../../components/contract/contractModel';
import {ContractService} from '../../../components/contract/contract.service';
import {RoleService} from '../../production/rolePlanning/role.service';
import {Role} from '../../production/rolePlanning/role';

@Component({
  selector: 'member-opportunity',
  templateUrl: './accept.component.html',
  styleUrls: ['accept.component.css']
})
export class AcceptComponent {

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
  public contract: ContractModel;

  /**
   * 
   * observable of contract dates
   * 
   */
  public dates: ServicePeriod[];

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
   * users public key
   * 
   */
  public userPublicKey: string;

  /**
   * 
   * a flag, a set and a get to indicate that the review by the candidate is underway
   * 
   * IS_REVIEWING | DETAILS_CONFIRMED | CONTRACT_PREPARING | CONTACT_PREPARED | CONTRACT_SIGNING | CONTRACT_SIGNED
   */
  private _action;
  public IS_REVIEWING: string = 'IS_REVIEWING';
  public DETAILS_CONFIRMED: string = 'DETAILS_CONFIRMED';
  public CONTRACT_PREPARING: string = 'CONTRACT_PREPARING';
  public CONTRACT_PREPARED: string = 'CONTRACT_PREPARED';
  public CONTRACT_SIGNING: string = 'CONTRACT_SIGNING';
  public CONTRACT_SIGNED: string = 'CONTRACT_SIGNED';
  public CONTRACT_MANUAL: string = 'CONTRACT_MANUAL';

  /**
   * 
   * set the current action and write to the task
   * 
   */
  public set action(a: string) {

    this._action = a;
    this.service.setTaskVar('action', a, true).subscribe(
      data => {},
      err => {console.log(err);}
    );

  }

  /**
   * 
   * get the current action value
   * 
   */
  public get action(): string {

    return this._action;

  }

  /**
   * 
   * a flag to indicate that the details are complete
   * 
   */
  public get detailsComplete(): boolean {

    return this.taskForm.get('tab1').valid
      && this.taskForm.get('tab2').valid
      && this.taskForm.get('tab3').valid
      && this.taskForm.get('tab4').valid;

  }

  /**
   * 
   * a set of fields which are being updated, used to drive UI display
   * 
   */
  public busy_tab1: boolean = false;
  public busy_tab2: boolean = false;
  public busy_tab3: boolean = false;
  public busy_tab4: boolean = false;

  /** task */
  public task: Task;
  protected taskId: number;
  protected loaded: boolean = false;

  /**
   * a flag to capture the candidates accept / decline of the role, used to route to next task
   */
  private reviewStatusOutcome = 'reviewStatusOutcome';
  public ROLE_ACCEPTED = 'Accepted';  // same as ProductionRoleModel.ROLE_STATUS_APPROVED
  public ROLE_DECLINED = 'Declined';  // same as ProductionRoleModel.ROLE_STATUS_DECLINED

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
    private servicePeriods: ServicePeriodService,
    private contractService: ContractService,
    private roleService: RoleService,
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
     * subscribe to route parameters, 'id' is the task id which contains the opportunity.
     * load the task information
     * get the servicePeriods
     * 
     */
    this.routeParamSub = this.route.params
      .flatMap((params1: any[]) => {
        if (undefined === params1['id']) {return Observable.empty();}
        return Observable.of(params1);
      })
      .flatMap((params2: any[]) => {
        this.taskId = +params2['id']; // (+) converts string 'id' to a number
        return this.service.connect(params2['id']);
      })
      .map((data: any) => {
        /** load the forms */
        this.setContent(data);
      })
      .flatMap((d: any) => {
        /** get the dates */
        return this.servicePeriods.getChildPeriods(this.bpmContractUUID, 'contract:engagementPeriods');
      })
      .flatMap((periods: ServicePeriod[]) => {
        this.dates = periods;
        // dummy user public key
        return Observable.of('xdf67T6ErtYTD67sDSD88876eet64sds');
      })
      .subscribe((key: string) => {
        this.userPublicKey = key;
      },
      err => console.log(err));


  }

  public ngAfterContentInit() {

    /** aspects & properties for the passport document */
    this.passportAspects = ['prod:document'];
    this.passportProperties = {'prod:docType': 'Passport', 'prod:docCategory': 'Proof of identity'};

    /** aspects & properties for the visa documents */
    this.visaAspects = ['prod:document'];
    this.visaProperties = {'prod:docType': 'Visa', 'prod:docCategory': 'Proof of identity'};

    /**
     * 
     * capture tab1 changes and save
     * 
     */
    this.taskForm.get('tab1').valueChanges
      .debounceTime(1200)
      .flatMap((formData: any) => {
        console.log(formData);

        /** fields that have changed */
        let names = Object.getOwnPropertyNames(formData);
        let result = {};
        for (let i = 0; i < names.length; i++) {
          if (this.model.hasOwnProperty(names[i])) {
            if (this.model[names[i]] !== formData[names[i]]) {
              result[names[i]] = formData[names[i]];
              this.model[names[i]] = formData[names[i]];
              this.busy_tab1 = true;
            }
          }
        }

        /** set UI saving indicators */

        /** observables which update each change */
        return this.service.setTaskVars(result, true);
      })
      .flatMap((data: any[]) => {
        return Observable.of(data);
      })
      .subscribe((results: any[]) => {

        /** unset the UI saving indicators */
        this.busy_tab1 = false;
      },
      err => {
        console.log(err);
        this.busy_tab1 = false;
      }
      );

    /**
     * 
     * capture tab2 changes and save
     * 
     */
    this.taskForm.get('tab2').valueChanges
      .debounceTime(1200)
      .flatMap((formData: any) => {
        console.log(formData);

        /** fields that have changed */
        let names = Object.getOwnPropertyNames(formData);
        let result = {};
        for (let i = 0; i < names.length; i++) {
          if (this.model.hasOwnProperty(names[i])) {
            if (this.model[names[i]] !== formData[names[i]]) {
              result[names[i]] = formData[names[i]];
              this.model[names[i]] = formData[names[i]];
              this.busy_tab2 = true;
            }
          }
        }

        /** set UI saving indicators */

        /** observables which update each change */
        return this.service.setTaskVars(result, true);

      })
      .flatMap((data: any[]) => {
        return Observable.of(data);
      })
      .subscribe((results: any[]) => {

        /** unset the UI saving indicators */
        this.busy_tab2 = false;
      },
      err => {
        console.log(err);
        this.busy_tab2 = false;
      }
      );

    /**
     * 
     * capture tab3 changes and save
     * 
     */
    this.taskForm.get('tab3').valueChanges
      .debounceTime(1200)
      .flatMap((formData: any) => {
        console.log(formData);

        /** fields that have changed */
        let names = Object.getOwnPropertyNames(formData);
        let result = {};
        for (let i = 0; i < names.length; i++) {
          if (this.model.hasOwnProperty(names[i])) {
            if (this.model[names[i]] !== formData[names[i]]) {
              result[names[i]] = formData[names[i]];
              this.model[names[i]] = formData[names[i]];
              this.busy_tab3 = true;
            }
          }
        }

        /** set UI saving indicators */

        /** observables which update each change */
        return this.service.setTaskVars(result, true);

      })
      .flatMap((data: any[]) => {
        return Observable.of(data);
      })
      .subscribe((results: any[]) => {

        /** unset the UI saving indicators */
        this.busy_tab3 = false;
      },
      err => {
        console.log(err);
        this.busy_tab3 = false;
      }

      );

    /**
     * 
     * capture tab4 changes and save
     * 
     */
    this.taskForm.get('tab4').valueChanges
      .debounceTime(1200)
      .flatMap((formData: any) => {
        console.log(formData);

        /** fields that have changed */
        let names = Object.getOwnPropertyNames(formData);
        let result = {};
        for (let i = 0; i < names.length; i++) {
          if (this.model.hasOwnProperty(names[i])) {
            if (this.model[names[i]] !== formData[names[i]]) {
              result[names[i]] = formData[names[i]];
              this.model[names[i]] = formData[names[i]];
              this.busy_tab4 = true;
            }
          }
        }

        /** set UI saving indicators */

        /** observables which update each change */
        return this.service.setTaskVars(result, true);

      })
      .flatMap((data: any[]) => {
        return Observable.of(data);
      })
      .subscribe((results: any[]) => {

        /** unset the UI saving indicators */
        this.busy_tab4 = false;
      },
      err => {
        console.log(err);
        this.busy_tab2 = false;
      }

      );

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

    let fields = ['contract_supplierFirstName',
      'contract_supplierLastName',
      'contract_supplierEmail',
      'contract_rightToWorkAsserted',
      'contract_supplierMobile',
      'contract_supplierAddress1',
      'contract_supplierAddress2',
      'contract_supplierAddress3',
      'contract_supplierPostCode',
      'contract_dateOfBirth',
      'contract_townOfBirth',
      'contract_countryOfBirth',
      'contract_nationalInsuranceNumber',
      'contract_identityDocumentReference',
      'contract_viasNumber',
      'contract_viasExpiryDate',
      'prod_bankName',
      'prod_bankAccountName',
      'prod_bankAccountNumber',
      'prod_bankBranchSortCode',
      'signature',
      'candidateReviewOutcome'];

    this.taskForm = this.fb.group({
      tab1: this.fb.group({
        contract_supplierFirstName: ['', [Validators.required, Validators.minLength(2)]],
        contract_supplierLastName: ['', [Validators.required, Validators.minLength(2)]],
        contract_supplierEmail: ['', [Validators.required, Validators.minLength(2)]],
        contract_dateOfBirth: [null, [Validators.required]],
        contract_townOfBirth: ['', [Validators.required, Validators.minLength(2)]],
        contract_countryOfBirth: ['', [Validators.required, Validators.minLength(2)]]
      }),

      tab2: this.fb.group({
        contract_supplierMobile: ['', [Validators.required, Validators.minLength(7)]],
        contract_supplierAddress1: ['', [Validators.required]],
        contract_supplierAddress2: '',
        contract_supplierAddress3: '',
        contract_supplierPostCode: ['', [Validators.required, Validators.minLength(7)]]
      }),

      tab3: this.fb.group({
        contract_rightToWorkAsserted: ['', [Validators.required]],
        contract_nationalInsuranceNumber: ['', [Validators.required]],
        contract_identityDocumentReference: ['', [Validators.required]],
        contract_visaNumber: '',
        contract_visaExpiryDate: null
      }),

      tab4: this.fb.group({
        prod_bankName: ['', [Validators.required, Validators.minLength(2)]],
        prod_bankAccountName: ['', [Validators.required, Validators.minLength(3)]],
        prod_bankAccountNumber: ['', [Validators.required, Validators.minLength(3)]],
        prod_bankBranchSortCode: ['', [Validators.required, Validators.minLength(6)]]
      }),

      signature: '',
      candidateReviewOutcome: ''

    });

    this.service.taskForm = this.taskForm;

  }

  /**
   * 
   * extract the role data from the process data
   * is called once form data is loaded
   * 
   */
  private setContent(data) {

    /** get the current action of this task, returns empty string if not previously set */
    let _a = this.service.getTaskVar('action');
    if (undefined === _a || '' === _a) {

      this.action = this.IS_REVIEWING;

    } else {

      this._action = _a;

    }

    // TO DO - work out if the logic and flage here are still required
    let bpmPackageNodeRef: string = this.service.getTaskVar('bpm_package');
    this.bpmPackage = bpmPackageNodeRef.substring(24, 60);
    this.bpmContractUUID = this.service.getTaskVar('contract_contractDocumentNodeId');
    this.hasContract = true;

    /** 
     * map the task vars into the model 
     */
    this.model = this.service.mapToModel(new OpportunityModel());

    /**
     * 
     * set the flags which drive the UI content for UK/ Not UK national
     * 
     */
    this.model.contract_rightToWorkAsserted = this.service.getTaskVar('contract_rightToWorkAsserted');
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
   * FUNCTIONS WHICH RESOND TO USER INPUT
   */

  /**
   * 
   * UK National, sets the entry form for UK National
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
   * close this window without saving
   * [ common for all task forms ]
   * 
   */
  public onCancel() {

    // this.dialogRef.close();

  }

  /**
   * 
   * user confirms the details are correct
   * 
   */
  public confirm(): void {

    this.action = this.CONTRACT_PREPARING;


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
   * user has agreed to electronically sign
   * 
   */
  public agreeToSign(): void {

    /**
     * 
     * update the contract properties
     * 
     */
    let contract: ContractModel = this.mapModelToContract(this.model);
    let now = new Date();
    contract.contract_supplierElectronicConfirmation = 'YES';
    contract.contract_supplierElectronicConfirmationDate = now.toISOString();
    contract.contract_supplierPublicKey = this.userPublicKey;

    this.contractService.updateContract(contract)
      .flatMap(d => {
        return this.contractService.mergePropertiesIntoContract(this.model.contract_contractDocumentNodeId);
      })
      .subscribe((response: any) => {
        this.action = this.CONTRACT_PREPARED;
      },
      err => {
        console.log(err);
        // TODO - plan how to handle the contract failure - should be handled offline
      });

  }

  /**
   * 
   * User is electronically signing the contract,
   * invoke the back end service to sign the agreement,
   * don't use the action update because we need to chain the subscriptions
   * 
   */
  public sign() {


    this.signature = this.taskForm.controls['signature'].value;
    this.taskForm.controls['signature'].disable();
    this.taskForm.controls['signature'].setValue(this.signature);

    this._action = this.CONTRACT_SIGNING;
    this.service.setTaskVar('action', this.CONTRACT_SIGNING, true)
      .flatMap((d: any) => {
        /** create a contract in blockchain */
        return this.contractService.createBlockchainDocument(this.bpmContractUUID);
      })
      .flatMap((contract: ContractModel) => {
        return this.contractService.getContractRoleId(contract.id);
      })
      .flatMap((roleId: string) => {
        /** update the role status */
        return this.roleService.updateRoleStatus(roleId, Role.ROLE_STATUS_ACCEPTED);
      })
      .flatMap((d: any) => {
        /** update some task variables */
        this._action = this.CONTRACT_SIGNED;
        return this.service.setTaskVar('action', this.CONTRACT_SIGNED, true);
      })
      .flatMap((d: any) => {
        /** set this task as complete */
        return this.service.TaskComplete();
      })
      .subscribe(
      d => {},
      err => {console.log(err);}
      );

  }


  /**
   * 
   * decline role button executes this method
   * 
   */
  public decline() {

    this.service.setTaskVar('candidateReviewOutcome', this.ROLE_DECLINED, true)
      .flatMap((d: any) => {
        return this.service.TaskComplete();
      })
      .flatMap((contract: ContractModel) => {
        return this.contractService.getContractRoleId(this.bpmContractUUID);
      })
      .flatMap((roleId: string) => {
        /** update the role status */
        return this.roleService.updateRoleStatus(roleId, Role.ROLE_STATUS_DECLINED);
      })
      .subscribe((d: any) => {
        this._action = this.ROLE_DECLINED;
      },
      err => {console.log(err);});


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

  /**
   * 
   * map the opportunity model to a contract
   * 
   */
  private mapModelToContract(model: OpportunityModel): ContractModel {

    let now = new Date();
    let contract: ContractModel = new ContractModel();

    contract.id = this.model.contract_contractDocumentNodeId;

    contract.contract_supplierLastName = this.model.contract_supplierLastName;
    contract.contract_supplierEmail = this.model.contract_supplierEmail;
    contract.contract_townOfBirth = this.model.contract_townOfBirth;
    contract.contract_countryOfBirth = this.model.contract_countryOfBirth;
    contract.contract_dateOfBirth = this.model.contract_dateOfBirth;

    contract.contract_identityDocumentIssuer = '';
    contract.contract_identityDocumentReference = this.model.contract_identityDocumentReference;
    contract.contract_identityDocumentType = 'Passport';
    contract.contract_nationalInsuranceNumber = this.model.contract_nationalInsuranceNumber;
    contract.contract_visaExpiryDate = this.model.contract_visaExpiryDate;
    contract.contract_visaNumber = this.model.contract_visaNumber;

    contract.contract_supplierMobile = this.model.contract_supplierMobile;
    contract.contract_supplierAddress1 = this.model.contract_supplierAddress1;
    contract.contract_supplierAddress2 = this.model.contract_supplierAddress2;
    contract.contract_supplierAddress3 = this.model.contract_supplierAddress3;
    contract.contract_supplierPostCode = this.model.contract_supplierPostCode;

    contract.prod_bankName = this.model.prod_bankName;
    contract.prod_bankAccountName = this.model.prod_bankAccountName;
    contract.prod_bankAccountNumber = this.model.prod_bankAccountNumber;
    contract.prod_bankBranchSortCode = this.model.prod_bankBranchSortCode;


    return contract;

  }
}
