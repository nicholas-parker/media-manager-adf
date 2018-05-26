import {AlfRESTList} from '../alfrescoWorkflow/AlfRESTList';
import {Injectable, Component, EventEmitter, Input, OnChanges, Output, Optional} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable, Subscription} from 'rxjs/Rx';
import {AlfrescoService} from '../alfrescoWorkflow/alfresco.service';
import {ProductionProperties} from './productionProperties';
import {ServicePeriod} from './servicePeriod';
import {MasterRoleService} from './masterDataComponent/masterRoleService';
import {DefaultRoleService} from '../../modules/production/defaultRoles/defaultRole.service';
import {DefaultRole} from '../../modules/production/defaultRoles/defaultRole';
import {ContractService} from '../contract/contract.service';
// import {MasterDocumentService} from './masterDataComponent/masterDocumentService';

// Import RxJs required methods
import 'rxjs/Rx';

export class Production {

  public role;
  public visibility;
  public guid;
  public id;
  public preset;
  public title;

}

@Injectable()
export class AlfrescoProductionService extends AlfrescoService {

  private productions: Production[];

  private siteShortName: string;
  public siteInfo;

  /**
   * 
   * subscription to the create service
   * 
   */
  private subCreate: Subscription;

  /**
   * 
   * the array of aspect names we add to a new production site
   * 
   */
  private productionAspects = new Array('contract:registeredOrg', 'prod:mediaProduction');

  /**
   * 
   * an object representing the properties we need to set on the new production site
   * 
   */
  private productionProperties: ProductionProperties;

  /**
   * 
   * the current production period which is in scope
   */
  private period: ServicePeriod;

  private newSite;

  constructor(private _apiService: AlfrescoApiService,
    private masterRoles: MasterRoleService,
    @Optional() private contracts: ContractService,
    private defaultRoles: DefaultRoleService,
    private _logService: LogService,
    private _http: Http) {
    super(_apiService, _logService, _http);
  }



  /**
   * 
   * return the current site short name
   * 
   */
  public getSiteShortName() {

    return this.siteShortName;

  }

  /**
   * 
   * returns an Observable which provides a list of productions which
   * the current user is a member of
   * 
   */
  public getProductions(): Observable<Production[]> {

    let path = 'api/-default-/public/alfresco/versions/1/people/-me-/sites';
    let params = 'where=(visibility%3DPRIVATE)';
    let obs: Observable<Production[]> = this.getList(path, params);
    return obs;

  }

  /**
   * 
   * create a new site
   * 
   */
  public createSite(properties: ProductionProperties): Observable<any> {

    this.productionProperties = properties;

    let apiServiceInstance = this._apiService.getInstance();

    let opts = {
      'skipConfiguration': false, // {Boolean} Flag to indicate whether the Share-specific (surf) configuration files for the site should not be created.
      'skipAddToFavorites': false // {Boolean} Flag to indicate whether the site should not be added to the user's site favorites.
    };

    let siteBody = new apiServiceInstance.core.SiteBody(); // {SiteBody} The site details
    siteBody.description = properties.prod_productionDescription;
    siteBody.title = properties.prod_productionName;
    siteBody.visibility = 'PRIVATE';

    return Observable.fromPromise(apiServiceInstance.core.sitesApi.createSite(siteBody, opts))
      .flatMap((siteInfo: any) => {
        this.siteInfo = siteInfo.entry;
        let update = {'properties': ''};
        update.properties = this.transform(this.productionProperties);
        return Observable.fromPromise(this._apiService.nodesApi.updateNode(siteInfo.entry.guid, update));
      })
      .flatMap((data: any) => {
        return this.applyProduct(this.siteInfo.id, this.productionProperties.prod_productCode);
      })
      .flatMap(d => {
        return this.applyDefaultRoles(this.siteInfo.id, 'TV_PRODUCTION', properties.prod_productCode);
      })
      .flatMap((roles: any) => {
        console.log(roles);
        return Observable.of(roles);
      });

  }

  /**
   * 
   * add or update properties to an existing site
   * @siteNodeId: string the node id for the site
   * @properties: the ProductionProperties object 
   * 
   */
  public updateSiteProperties(siteNodeId: string, properties: ProductionProperties): Observable<any> {

    this.productionProperties = properties;

    return Observable.fromPromise(this._apiService.nodesApi.getNode(siteNodeId))
      .flatMap((node: any) => {
        let update = {'aspectNames': '', 'properties': ''};
        update.aspectNames = node.entry.aspectNames.concat(this.productionAspects);

        let mapped = this.transform(this.productionProperties);
        console.log(mapped);
        update.properties = Object.assign(node.entry.properties, mapped);
        return Observable.fromPromise(this._apiService.nodesApi.updateNode(node.entry.id, update));
      });

  }


  /**
   * 
   * add a production period to the currently scoped production
   * 
   */
  public addProductionPeriod(shortName: string, period: ServicePeriod): Observable<any> {

    if (undefined === this.siteInfo) {
      console.log('ERROR: attempting to add a production period when production not set');
    }
    console.log('adding new production period to production [' + this.siteInfo.id + ']');

    /**
     * 
     * create the production period
     * 
     */
    let bodyProps = {};
    bodyProps['contract:serviceName'] = period.contract_serviceName;
    bodyProps['contract:serviceDescription'] = '';
    bodyProps['contract:serviceTypeCode'] = 'PRODUCTIONPERIOD';
    bodyProps['contract:serviceStart'] = period.contract_serviceStart;
    bodyProps['contract:serviceEnd'] = period.contract_serviceEnd;

    let body = {};
    body['name'] = period.contract_serviceName;
    body['nodeType'] = 'cm:content';
    body['properties'] = bodyProps;

    return Observable.fromPromise(this._apiService.nodesApi.addNode(this.siteInfo.guid, body, null))
      .flatMap(subPeriod => {

        /**
         * create the relationship by adding a secondary child
         */
        console.log('created the period, creating the relationship');
        console.log(subPeriod);

        // let core = this._apiService.getInstance().core;
        // let assoc = new core.AssocChildBody();
        let assoc = {'assocType': '', 'childId': ''};
        assoc.assocType = 'prod:subProjects';
        assoc.childId = subPeriod.entry.id;
        return Observable.fromPromise(this._apiService.getInstance().core
          .childAssociationsApi.addSecondaryChildAssoc(this.siteInfo.guid, assoc));
      });
  }


  /**
   * 
   * get production periods for a production
   * 
   */
  public orig_getProductionPeriods(siteNodeId: string): Observable<any> {

    let opts = {'assocType': 'prod:subProjects'};
    return Observable.fromPromise(this._apiService.getInstance().core.childAssociationsApi.listSecondaryChildAssociations(siteNodeId, opts))
      .map((list: any) => {
        let periods = [];
        for (let i = 0; i < list.entries.length; i++) {
          let period = new ServicePeriod();
          period = this.transform(list.entries[i].entry.properties);
          period.id = list.entries[i].entry.id;
          periods.push(period);
        }
        return Observable.from(periods);
      });

  }

  /**
   * 
   * given a nodeId returns the ServicePeriod class for the service period at that node
   * 
   */
  public getProductionPeriod(nodeId: string): Observable<ServicePeriod> {

    return Observable.fromPromise(this._apiService.nodesApi.getNode(nodeId))
      .map(res => {
        let sp = new ServicePeriod();
        sp = this.unTransform(res.entry.properties);
        sp.id = res.entry.id;
        console.log(sp);
        return sp;
      });

  }

  public getProductionPeriods(siteNodeId: string): Observable<any> {

    let opts = {'assocType': 'prod:subProjects'};
    return Observable.fromPromise(this._apiService.getInstance().core.childAssociationsApi.listSecondaryChildAssociations(siteNodeId, opts))
      .map((periodRefs: any) => {
        let ids = [];
        for (let i = 0; i < periodRefs.list.entries.length; i++) {
          ids.push(periodRefs.list.entries[i].entry.id);
        }
        return ids;
      })
      .flatMap((ids: []) => {
        if (ids.length > 0) {
          return Observable.forkJoin(ids.map(id => {return this.getProductionPeriod(id);}));
        }
        return Observable.of([]);
      })
      .catch(err => {
        console.log('ERROR servie error retrieveinf periods');
        console.log(err);
      });

  }


  /**
   * 
   * applies the master default roles to a production
   * copies over the master contracts into the production Contract Template folder
   * copies over the master default roles into the production defaultRole list, updates each role with the new contract template id
   * returns the number of defaultRoles created
   * 
   */
  public applyDefaultRoles(siteName: string, productCategory: string, product: string): Observable<DefaultRole[]> {

    return this.contracts.applyMasterContracts(siteName, productCategory, product)
      .flatMap((contracts: any) => {

        return this.masterRoles.connect(null)
          .flatMap((defaultRoles: DefaultRole[]) => {
            let roleObs: Array<Observable<DefaultRole>> = defaultRoles.map((r: DefaultRole) => {
              const filtered = contracts.filter(contract => {return contract.entry.id === r.nvpList_typeContractTemplate;});
              if (filtered.length > 0) {
                r.nvpList_typeContractTemplate = filtered[0].targetId;
              }
              return this.defaultRoles.writeRole(r, siteName);
            });
            return Observable.forkJoin(roleObs);
          });
      });

  }

  /**
   * 
   * iterates through a list of nodes to find the node with the provided nodeId, returns the new target node
   * 
   */
  private findNewContractDocumentNode(list: any, sourceId: string): string {


  }

  /**
   * 
   * add the product features to a site, called after createSite
   * returns the siteName upon success
   * 
   */
  public applyProduct(siteName: string, productCode: string): Observable<any> {

    let path = 's/mwt/production/setup/' + siteName + '/' + productCode;
    let obs: Observable<string> = this.get(path);
    return obs;

  }

  /**
   * 
   * delete a site
   * 
   */
  public deleteSite(siteName: string): Observable<any> {

    let apiServiceInstance = this._apiService.getInstance();
    return Observable.fromPromise(apiServiceInstance.core.sitesApi.deleteSite(siteName));

  }

  /**
   * 
   * take a source object and map the values of properties which exist
   * in the source and target into the target
   * 
   */
  private mapToObject(source: any, target: any) {

    let names = Object.getOwnPropertyNames(target);
    let result = {};
    for (let i = 0; i < names.length; i++) {

      let sourceName = names[i].replace('_', ':');
      if (source.hasOwnProperty(sourceName)) {
        result[names[i]] = source[sourceName];
      }

    }
    return result;

  }

}
