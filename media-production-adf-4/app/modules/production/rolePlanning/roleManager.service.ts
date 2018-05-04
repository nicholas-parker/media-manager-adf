/**
 * 
 * This class contains the business services which manage roles.
 * It is contained by the high level components and services.
 * This class utilises the underlying defaultRole and Role services.
 * Many of the business functions are simple wrappers on services.
 * Components which need read data access should go direct to the services.
 * 
 */
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {DefaultRoleService} from '../defaultRoles/defaultRole.service';
import {DefaultRole} from '../defaultRoles/defaultRole';
import {RoleService} from './role.service';
import {FilteredRoleStream} from './FilteredRoleStream';
import {Role} from './role';
import {ContractService} from '../../../components/contract/contract.service';
import {NewRoleEvent} from './newRoleEvent';
import {ContractDocumentCreateResult} from '../../../components/contract/contractDocumentCreateResult';


export class DefaultRoleSummary {

  public defaultRole: DefaultRole;
  public crewCount: number;

}

@Injectable()
export class RoleManager {

  constructor(
    private defaultRoleService: DefaultRoleService,
    private roleService: RoleService,
    private contractService: ContractService) {
  }

  /**
   * 
   * Create a new role from a default role and automatically assign the new role name.
   * create the contract document if defined in the default role,
   * start a workflow for contract management if defined in the default role
   * 
   * The automatic calculation of roleName is not thread safe.  If creating multiple new roles
   * at the same time then provide the role name
   * 
   */
  public createFromDefault(defaultRoleName: string, newRoleName?: string): Observable<NewRoleEvent> {

    let filteredRole: FilteredRoleStream = new FilteredRoleStream();
    filteredRole.roleType = defaultRoleName;
    filteredRole.dataSource = this.roleService;

    let templateId: string;
    let processName: string;

    return Observable
      .forkJoin([this.defaultRoleService.getDefaultRoleByName(defaultRoleName),
      filteredRole.getCount()])
      .map((data: any[]) => {

        let result: DefaultRoleSummary = new DefaultRoleSummary();
        result.defaultRole = data[0];
        result.crewCount = data[1];
        templateId = result.defaultRole.nvpList_typeContractTemplate;
        processName = result.defaultRole.nvpList_typeProcessName;
        console.log(result);
        return result;

      })
      .flatMap((dr: DefaultRoleSummary) => {

        /** logic to create the new role name */
        if (undefined === newRoleName) {
          newRoleName = defaultRoleName + ' ' + (+dr.crewCount + 1);
        }

        /** create the role object from the default role */
        let role = new Role();
        role.nvpList_budgetMax = dr.defaultRole.nvpList_typeBudgetMax;
        role.nvpList_budgetMin = dr.defaultRole.nvpList_typeBudgetMin;
        role.nvpList_chargeCode = dr.defaultRole.nvpList_typeChargeCode;
        role.nvpList_contractTemplate = dr.defaultRole.nvpList_typeContractTemplate;
        role.nvpList_currency = dr.defaultRole.nvpList_typeCurrency;
        role.nvpList_PAYEStatus = dr.defaultRole.nvpList_typePAYEStatus;
        role.nvpList_roleCategory = dr.defaultRole.nvpList_typeCategory;
        role.nvpList_roleName = newRoleName;
        role.nvpList_roleStatus = Role.ROLE_STATUS_SETUP;
        role.nvpList_roleType = dr.defaultRole.nvpList_typeName;
        role.nvpList_roleDescription = dr.defaultRole.nvpList_typeDescription;
        role.nvpList_contractProcessName = dr.defaultRole.nvpList_typeProcessName;
        role.nvpList_contractAdministrationTeam = dr.defaultRole.nvpList_typeAdministrationTeam;
        role.nvpList_paymentPeriod = dr.defaultRole.nvpList_typePaymentPeriod;
        role.nvpList_ratePeriod = dr.defaultRole.nvpList_typeRatePeriod;
        role.nvpList_holidayPaidRate = dr.defaultRole.nvpList_typeHolidayPaidRate;
        role.nvpList_noticePeriod = dr.defaultRole.nvpList_typeNoticePeriod;

        return this.roleService.writeRole(role);

      })
      .mergeMap((role: Role) => {

        // create the contract document from the template
        if (undefined !== templateId) {
          let contractName: string = role.nvpList_roleName + ' contract.docx';
          return Observable.forkJoin([Observable.of(role),
          this.contractService.createBlankContractFromTemplateForRole(contractName, templateId, role['sys_node-uuid'])
          ]);
        } else {
          let contract = new ContractDocumentCreateResult();
          contract.contractStatus = 'NO_CONTRACT';
          return Observable.forkJoin([Observable.of(role), Observable.of(contract)]);
        }
      })
      .mergeMap((data: any[]) => {
        console.log(data);
        let role: Role = data[0];
        let contract: ContractDocumentCreateResult = data[1];
        let response: NewRoleEvent = new NewRoleEvent();
        response.roleId = role.sys_nodedbid;
        response.roleName = role.nvpList_roleName;
        response.roleType = role.nvpList_roleType;
        response.roleStatus = 'OK';
        response.contractId = contract.contractNodeId;
        response.contractName = contract.contractName;
        response.contractStatus = contract.contractStatus;
        response.workflowName = contract.contractWorkflowName;
        response.processId = contract.contractProcessId;
        response.workflowStatus = contract.contractProcessStatus;
        return Observable.of(response);
      });

  }

  /**
   * 
   * create a new role from a default role, set the role name
   * 
   */


  /**
   * 
   * retrieve a specific role
   * 
   */

  /**
   * 
   * remove the contract offer from a specific role
   * 
   */

  /**
   * 
   * create a new contract offer for a specific role
   * 
   */

  /**
   * 
   * remove the role from the production
   * 
   */

  /**
   * 
   * reduce the headcount for a specific role.
   * Can only reduce the headcount where the associated contract has not been accepted
   * 
   */

}

