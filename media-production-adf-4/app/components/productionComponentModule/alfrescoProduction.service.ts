import {AlfRESTList} from '../alfrescoWorkflow/AlfRESTList';
import {Injectable, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable, Subscription} from 'rxjs/Rx';
import {AlfrescoService} from '../alfrescoWorkflow/alfresco.service';
import {ProductionProperties} from './productionProperties';
import {ServicePeriod} from './servicePeriod';

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
  private siteInfo;

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
    private _logService: LogService,
    private _http: Http) {
    super(_apiService, _logService, _http);
  }

  /**
   * 
   * given the production id (shortName) returns the full data model
   * This can be extended to provide containers and members
   * 
   */
  public getPrduction(id): Observable<Production> {

    this.siteShortName = id;
    let path = 'api/-default-/public/alfresco/versions/1/sites/' + id;
    let obs: Observable<Production> = this.get(path);
    return obs;

  }

  /**
   * 
   * returns the production properties for a give production short name
   * 
   */
  public getProductionProperties(id): Observable<ProductionProperties> {

    console.log('service:getProductionProperties [' + id + ']');

    if (undefined === this.siteInfo || this.siteInfo.id !== id) {

      console.log('service:getProductionProperties getting site info');

      return this.getPrduction(id)
        .map((data: any) => {return data.entry.guid;})
        .flatMap(guid => {return Observable.fromPromise(this._apiService.nodesApi.getNode(guid));})
        .map((data: any) => {return data.entry.properties;});

    } else {

      console.log('service:getProductionProperties getting node info');

      return Observable.fromPromise(this._apiService.nodesApi.getNode())
        .map((data: any) => {return data.entry.properties;});

    }


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
      });

  }

  /**
   * 
   * add or update properties to an existing site
   * NOT TESTED
   * 
   */
  public updateSiteProperties(site: string, properties: ProductionProperties): Observable<any> {

    return Observable.fromPromise(this._apiService.nodesApi.getNode(site))
      .flatMap((node: any) => {
        let update = {'aspectNames': '', 'properties': ''};
        update.aspectNames = node.entry.aspectNames.concat(this.productionAspects);

        let mapped = this.transform(this.productionProperties);
        console.log(mapped);
        update.properties = Object.assign(node.entry.properties, mapped);
        return Observable.fromPromise(this._apiService.nodesApi.updateNode(node.entry.guid, update));
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
     * create the production period
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
   * NOT USED
   * add the product features to a site, called after createSite
   * 
   */
  // applyProduction(siteName: string, productCode: string): Observable<any> {
  // 
  //  let path = 's/mwt/production/setup/' + siteName + '/' + productCode;
  //  let obs: Observable<Production> = this.get(path);
  //  return obs;
  //
  // }

  /**
   * 
   * delete a site
   * 
   */
  deleteSite(siteName: string): Observable<any> {

    let apiServiceInstance = this._apiService.getInstance();
    return Observable.fromPromise(apiServiceInstance.core.sitesApi.deleteSite(siteName));

  }


}
