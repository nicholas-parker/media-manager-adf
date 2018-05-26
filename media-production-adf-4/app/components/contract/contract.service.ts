import {Injectable, OnInit, OnDestroy, Optional} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {DataSource, CollectionViewer} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/Rx';

import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {AlfrescoService} from '../../components/alfrescoWorkflow/alfresco.service';
import {AlfrescoWorkflowService} from '../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {StartWorkflowResponse} from '../../components//alfrescoWorkflow/startWorkflowResponse';
import {RoleService} from '../../modules/production/rolePlanning/role.service';
import {Role} from '../../modules/production/rolePlanning/role';
import {ProductionContext} from '../productionComponentModule/productionContext';
import {Production} from '../productionComponentModule/production';
import {ProductionProperties} from '../productionComponentModule/productionProperties';

import {ContractModel} from './contractModel';
import {ContractDocument} from './contractDocument';
import {ContractDocumentCreateResult} from './contractDocumentCreateResult';
import {MasterDocumentService} from '../productionComponentModule/masterDataComponent/masterDocumentService';

@Injectable()
export class ContractService implements DataSource<ContractDocument>, OnDestroy {

  /**
   * 
   * name of the workflow which manages the contract
   * 
   */
  private static CREATE_ROLE_PROCESS: string = 'activiti$role-offer-contract_v0-1';

  /**
   * 
   * subject that triggers unsubscriptions, triggered by noOnDestroy
   * 
   */
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  /**
   * 
   * the current production context items we need to manage contracts
   * retrieved from the production context
   */
  private siteId;
  private siteDocumentLibraryContainer: string = 'documentLibrary';
  private contractFolderName: string = 'Contracts';
  private contractFolderId: string;

  private contractTemplateFolderName: string = 'Contract Templates';
  private contractTemplateFolderId: string;

  constructor(private alfrescoApi: AlfrescoApiService,
    private alfrescoService: AlfrescoService,
    private context: ProductionContext,
    private roleService: RoleService,
    private masterDocuments: MasterDocumentService,
    private workflowService: AlfrescoWorkflowService) {

    this.context.getProduction()
      .takeUntil(this.ngUnsubscribe)
      .flatMap((prod: Production) => {
        if (null === prod) {throw {message: 'ContractService - production is null'};}
        this.siteId = prod.id;
        return this.getSiteContractContainers(prod.id);
      })
      .subscribe((nodes: any) => {
        this.contractFolderId = nodes.contractNodeId;
        this.contractTemplateFolderId = nodes.templateNodeId;
      },
      err => {
        console.log(err);
      });

  }

  public ngOnDestroy() {

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  connect(collectionViewer: CollectionViewer): Observable<ContractDocument[]> {
    throw new Error('Method not implemented.');
  }

  disconnect(collectionViewer: CollectionViewer): void {
    throw new Error('Method not implemented.');
  }

  /**
   * 
   * get site contract template and contract folder id
   * 
   */
  private getSiteContractContainers(siteId: string): Observable<any> {

    return Observable.fromPromise(this.alfrescoApi.sitesApi.getSiteContainer(siteId, this.siteDocumentLibraryContainer))
      .flatMap((data: any) => {
        return Observable.fromPromise(this.alfrescoApi.nodesApi.getNodeChildren(data.entry.id));
      })
      .flatMap((data: any) => {
        let nodes: any = {contractNodeId: '', templateNodeId: ''};
        nodes.contractNodeId = data.list.entries.filter(child => {
          return child.entry.name === this.contractFolderName;
        })[0].entry.id;
        nodes.templateNodeId = data.list.entries.filter(child => {return child.entry.name === this.contractTemplateFolderName;})[0].entry.id;
        return Observable.of(nodes);
      })
      .catch(err => {
        console.log(err.message);
        return Observable.of({contractNodeId: '', templateNodeId: ''});
      });

  }

  /**
   * 
   * create a sites contract templates by copying the master contracts into the sites Contract Template folder
   * 
   */
  public applyMasterContracts(siteName: string, productCategory: string, product: string): Observable<any[]> {

    return Observable.forkJoin([this.masterDocuments.getMasterContracts(productCategory, product),
    this.getSiteContractContainers(siteName)])
      .flatMap((data: any[]) => {

        if (data[0].list.entries.length > 0) {
          return Observable.forkJoin(

            data[0].list.entries.map((node: any) => {

              let copyBody = {targetParentId: '', name: ''};
              copyBody.targetParentId = data[1].templateNodeId;
              copyBody.name = node.entry.name;

              return Observable.fromPromise(this.alfrescoApi.nodesApi.copyNode(node.entry.id, copyBody))
                .map((targetNode: any) => {
                  node.targetId = targetNode.entry.id;
                  return node;
                });
            })
          );
        }
        return Observable.of([]);
      });

  }

  /**
   * 
   * create a new blank contract document for a given role using a template
   * create a link between role and contract
   * does not merge data into contract
   * 
   * @templateId the nodeId for the template
   * @roleId the nodeId for the role
   * 
   * @return the nodeId of the new contract
   * 
   */
  public createBlankContractFromTemplateForRole(contractName: string, templateId: string, roleId: string,
    pubKey: string, processName?: string): Observable<ContractDocumentCreateResult> {

    let copyBody = {targetParentId: '', name: ''};
    copyBody.targetParentId = this.contractFolderId;
    copyBody.name = contractName;


    /** create the new node by copying the template */
    /** get the properties for this production, add them to the new contract node in the next function */
    return Observable.fromPromise(this.alfrescoApi.nodesApi.copyNode(templateId, copyBody))

      /** create association between contract and role, return the targetId which is the contract nodeId */
      .mergeMap((data: any) => {
        return Observable.forkJoin([
          this.alfrescoService.createTargetAssociation(roleId, data.entry.id, 'nvpList:roleContractDocuments'),
          this.context.getProperties().take(1),
          this.roleService.getRole(roleId)]);
      })

      /** add the properties onto the new contract node, start document workflow */
      .mergeMap((data: any) => {
        let role: Role = data[2];
        let body = {
          aspectNames: ['prod:mediaProduction', 'contract:registeredOrg', 'prod:document',
            'contract:contractDocument', 'contract:electronicSignature', 'contract:crewEngagement'], properties: ''
        };
        body.properties = this.transform(data[1]);

        /** map these role properties into contract:crewEngagement */
        body.properties['contract:serviceName'] = role.nvpList_roleName;
        body.properties['contract:serviceDescription'] = role.nvpList_roleDescription;
        body.properties['contract:PAYEstatus'] = role.nvpList_PAYEStatus;
        body.properties['contract:ratePeriodSpecifier'] = role.nvpList_ratePeriod;
        body.properties['contract:contractValueCurrency'] = role.nvpList_currency;
        body.properties['contract:workingWeek'] = role.nvpList_workingWeek;
        body.properties['contract:paymentPeriodSpecifier'] = role.nvpList_paymentPeriod;
        body.properties['contract:overtimeRate'] = role.nvpList_overtimePaidRate;
        body.properties['contract:holidayRate'] = role.nvpList_holidayPaidRate;
        body.properties['contract:noticePeriod'] = role.nvpList_noticePeriod;
        body.properties['contract:location'] = role.nvpList_location;
        body.properties['contract:recipientPublicKey'] = pubKey;
        body.properties['contract:recipientElectronicConfirmation'] = 'YES';
        let d = new Date();
        body.properties['contract:recipientElectronicConfirmationDate'] = d.toISOString();
        body.properties['contract:contractSignStatus'] = 'PENDING';

        return Observable.fromPromise(this.alfrescoApi.nodesApi.updateNode(data[0].entry.targetId, body, null));
      })
      .flatMap((data: any) => {
        return this.startContractManagementWorkflow(data.entry.id);
      })
      /** build the response */
      .flatMap((workflowResult: StartWorkflowResponse) => {
        let result = new ContractDocumentCreateResult();
        result.contractName = contractName;
        result.contractNodeId = workflowResult.properties.contract_contractDocumentNodeId;
        result.contractStatus = 'OK';
        result.contractWorkflowName = workflowResult.workflowName;
        result.contractProcessId = workflowResult.processId;
        result.contractProcessStatus = workflowResult.status;
        return Observable.of(result);
      });
  }

  /**
   * 
   * return a contract's model by contract id
   * 
   */
  public getContractById(nodeRef: string): Observable<ContractModel> {

    return Observable.fromPromise(this.alfrescoApi.nodesApi.getNode(nodeRef))
      .flatMap((d: any) => {
        let contract: ContractModel = new ContractModel();
        contract.id = d.entry.id;
        contract = this.mapNodePropertiesToObject(d.entry.properties, contract);
        return Observable.of(contract);
      });
  }

  /**
   * 
   * get the roleId for the role a contract fulfills
   * 
   */
  public getContractRoleId(contractId: string): Observable<string> {

    return this.alfrescoService.getSourceAssociation(contractId)
      /** filter the right association type */
      .map((response: any) => {
        return response.list.entries.filter(item => {
          return item.entry.association.assocType === 'nvpList:roleContractDocuments';
        });
      })
      .map((entries: any) => {
        if (entries.length > 0) {
          return entries[0].entry.id;
        } else {
          return Observable.empty();
        }
      });

  }

  /**
   * Start a contract management workflow which will drive the contract management process.
   * The contract must have a source association with a productionRole and that productionRole
   * must have a property, nvpList:contractProcessName, that defines the workflow to be executed
   * 
   */
  public startContractManagementWorkflow(contractId: string): Observable<StartWorkflowResponse> {

    return this.alfrescoService.getSourceAssociation(contractId)
      /** filter the right association type */
      .map((response: any) => {
        return response.list.entries.filter(item => {
          return item.entry.association.assocType === 'nvpList:roleContractDocuments';
        });
      })
      .flatMap((entries: any) => {

        let properties = {mwt_site: '', nvpList_roleId: '', contract_contractDocumentNodeId: ''};
        properties.mwt_site = this.siteId;
        properties.nvpList_roleId = entries[0].entry.id;
        properties.contract_contractDocumentNodeId = contractId;
        if (entries[0].entry.properties.hasOwnProperty('nvpList:contractProcessName')) {
          let workflowName = entries[0].entry.properties['nvpList:contractProcessName'];
          return this.workflowService.startProcess(ContractService.CREATE_ROLE_PROCESS, properties);
        } else {
          let response: StartWorkflowResponse = new StartWorkflowResponse();
          response.message = 'Did not start workflow, no workflow for the role associated with this contract';
          response.status = StartWorkflowResponse.STATUS_NO_WORKFLOW;
          response.properties = properties;
          return Observable.of(response);
        }
      });


  }

  /**
   * 
   * update an existing contract
   * 
   */
  public updateContract(contract: ContractModel): Observable<ContractModel> {

    let bodyProps = this.mapToProperties(contract);
    let body = {};
    body['properties'] = bodyProps;
    delete body['id'];

    return Observable.from(this.alfrescoApi.nodesApi.updateNode(contract.id, body))
      .flatMap((d: any) => {
        let contractOut: ContractModel = new ContractModel();
        contractOut.id = d.entry.id;
        contractOut = this.mapNodePropertiesToObject(d.entry.properties, contractOut);
        return Observable.of(contractOut);
      });

  }

  /**
   * 
   * merge the existing contract properties into the contract content
   * 
   */
  public mergePropertiesIntoContract(nodeId: any): Observable<any> {

    const path = 'service/mwt/contract/merge/' + nodeId + '/true';
    return this.alfrescoService.get(path, null);

  }

  /**
   * 
   * Create and sign a blockchain assset which is the contract signed by both parties
   * 
   */
  public createBlockchainDocument(nodeRef: string): Observable<ContractModel> {

    return this.getContractById(nodeRef)
      .flatMap((contract: ContractModel) => {
        // TODO - create a real block transaction
        contract.contract_signingTransactionId = 'Weyrt67YSDT834fjdjhgkj77777sjFRT879dfdfd';
        contract.contract_contractSignStatus = 'SIGNED';
        contract.contract_contractSignDate = new Date().toISOString();
        return this.updateContract(contract);
      });

  }

  /**
   * 
   * transform 'x_x' notation to 'x:x'
   * 
   */
  public transform(source: any): any {

    let names = Object.getOwnPropertyNames(source);
    let result = {};
    for (let i = 0; i < names.length; i++) {

      let newName = names[i].replace('_', ':');
      result[newName] = source[names[i]];
    }
    return result;
  }

  /**
   * 
   * take a source object and map the values of properties which exist
   * in the source and target into the target
   * 
   */
  public mapToObject(source: any, target: any) {

    let names = Object.getOwnPropertyNames(target);
    let result = {};
    for (let i = 0; i < names.length; i++) {

      if (source.hasOwnProperty(names[i])) {
        result[names[i]] = source[names[i]];
      }

    }
    return result;

  }

  /**
   * 
   * take an object and map to an Alfresco node properties object.
   * The response object contains the same properties but the '_' is mapped to ':'
   * 
   */
  public mapToProperties(source: any): any {

    let bodyProps = {};
    let names = Object.getOwnPropertyNames(source);
    for (let i = 0; i < names.length; i++) {

      if (names[i].includes('_')) {
        bodyProps[names[i].replace('_', ':')] = source[names[i]];
      }
    }

    return bodyProps;

  }

  /**
   * 
   * map a node properties to an object
   * 
   */
  public mapNodePropertiesToObject(properties: any, target: any): any {

    let names = Object.getOwnPropertyNames(target);
    for (let i = 0; i < names.length; i++) {

      /** _ -> : */
      let sourceName = names[i];
      if (sourceName.includes('_')) {
        sourceName.replace('_', ':');
      }

      /** copy the value, manage dates */
      if (properties.hasOwnProperty(sourceName)) {

        if (names[i].includes('Date')) {

          if (properties[sourceName] !== undefined ||
            properties[sourceName] !== '' ||
            properties[sourceName] !== ' ' ||
            properties[sourceName] !== null) {
            target[name] = new Date(properties[sourceName]);
          }

        } else {
          target[name] = properties[sourceName];
        }
      }
    }
    return target;
  }

}
