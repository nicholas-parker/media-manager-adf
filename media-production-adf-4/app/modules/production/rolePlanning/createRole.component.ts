import {Observable} from 'rxjs/Observable';
import {Component, OnInit} from '@angular/core';
import {MdProgressSpinnerModule, MdSnackBar, MdSelectModule, MdInputModule, MdButtonModule, MdDatepickerModule} from '@angular/material';
import {DefaultRoleService} from '../defaultRoles/defaultRole.service';
import {DefaultRole} from '../defaultRoles/defaultRole';
import {ContractTemplateService} from '../defaultRoles/contractTemplate.service';
import {Role} from './role';
import {AlfrescoService} from '../../../components/alfrescoWorkflow/alfresco.service';
import {AlfrescoProductionService} from '../../../components/productionComponentModule/alfrescoProduction.service';
import {AlfrescoWorkflowService} from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'create-role',
  templateUrl: './createRole.component.html',
  styleUrls: ['../../../components/alfrescoWorkflow/forms/workflowform.component.css', '../../../standard.css'],
  providers: [AlfrescoService]
})
export class CreateRoleComponent implements OnInit {

  private static CREATE_ROLE_PROCESS: string = 'activiti$role-offer-contract_v0-1';

  public defaultRoles: DefaultRole[];
  public role: Role = new Role();

  /**
   * 
   * flag to indicate we are busy waiting for a service, shows spinner
   * 
   */
  public busy: boolean = false;

  private workflowResponse;

  constructor(private defaultRoleService: DefaultRoleService,
    private contractTemplateService: ContractTemplateService,
    private workflowService: AlfrescoWorkflowService,
    private dialogRef: MdDialogRef<CreateRoleComponent>,
    private snackBar: MdSnackBar,
    private productionService: AlfrescoProductionService) {

    this.role.nvpList_contractTemplate = '44a0f707-052a-4404-934a-7e023a488286';

  }

  public ngOnInit() {

    let obs: Observable<DefaultRole[]> = this.defaultRoleService.connect(this);
    obs.subscribe(data => this.defaultRoles = data);

  }

  /**
   * 
   * fired when the user selects the default role, updates the template
   * 
   */
  public selectDefaultRole(event) {

    let selectedRole: DefaultRole[] = this.defaultRoles.filter(currentItem => currentItem.nvpList_typeName === event);
    console.log(selectedRole);
    this.role.nvpList_contractTemplate = selectedRole[0].nvpList_typeContractTemplate;
    this.role.nvpList_roleName = '1st ' + selectedRole[0].nvpList_typeName;
    this.role.nvpList_roleType = selectedRole[0].nvpList_typeName;

  }

  /**
   * 
   * launches the workflow to create a new role with the provided properties
   * TODO - get site from somewhere
   * 
   */
  private onCreate() {

    this.busy = true;

    // TODO - get site from somewhere
    this.role.mwt_site = this.productionService.getSiteShortName();
    this.snackBar.open('Creating role...', null, {duration: 3000});
    this.workflowService.startProcess(CreateRoleComponent.CREATE_ROLE_PROCESS, this.role).subscribe(
      data => {this.onCreateOK(data);},
      data => {this.onCreateFAIL(data);}
    );

  }

  private onCreateOK(result: any) {

    console.log('Workflow started OK');
    this.snackBar.open('Role created', null, {duration: 3000});
    this.busy = false;
    this.workflowResponse = result;
    console.log(result);
    this.dialogRef.close();

  }

  private onCreateFAIL(result: any) {

    this.busy = false;
    this.snackBar.open('There was a problem creating the role', result, {duration: 3000});
    console.log('ERROR could not start Workflow');

  }

  private onCancel() {

    this.dialogRef.close();

  }

  /**
   * 
   * public function to create a default role.
   * This is achieved by calling the back end defaultRole process
   * 
   */
  public createRole(defaultRoleName: String, startDate?: Date, endDate?: Date) {

  }

}
