import {Injectable, Component, EventEmitter, Input, OnChanges, Output, OnInit} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable, Subscription} from 'rxjs/Rx';
import {ServicePeriod} from '../../../../components/productionComponentModule/servicePeriod';
import {ProductionContext} from '../../../../components/productionComponentModule/productionContext';
import {AlfrescoService} from '../../alfresco.service';

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
export class ServicePeriodService implements OnInit {

  private static ServicePeriodContainerName: string = 'ServicePeriods';
  private production: Production;
  private siteSubscription: Subscription;
  private servicePeriodContainerId: string;


  constructor(private _apiService: AlfrescoApiService,
    private _logService: LogService,
    private _http: Http,
    private context: ProductionContext,
    private alfrescoService: AlfrescoService
  ) {

    this.siteSubscription = this.context.getProduction().subscribe(
      p => {
        console.log(p);

        if (null !== p) {
          this.production = p;
          let obs = Observable.fromPromise(this._apiService.sitesApi.getSiteContainer(p.id, ServicePeriodService.ServicePeriodContainerName))
            .catch(e => {
              console.log(e);
              if (e.status === 404) {
                return this.createServicePeriodContainter();
              } else {
                return Observable.of({entry: {id: '', folderId: ''}});
              }
            }).subscribe((c: any) => {
              this.servicePeriodContainerId = c.entry.id;
              console.log('ServicePeriodService: obtained sites container');
            },
            err => {
              console.log(err);
              if (err.statusCode === '404') {

              }

            });
        }
      },
      err => {console.log(err);});



  }

  /**
   * 
   * load the site servicePeriod container id so we can use it
   * 
   */
  ngOnInit(): void {

  }

  ngOnDestroy(): void {

    if (this.siteSubscription) {
      this.siteSubscription.unsubscribe();
    }

  }

  /**
   * 
   * return an Observable to an array of servicePeriods which are the children of the parentNode.
   * @parentId  node UUID for parent node
   * @linkName  the name of the link in the data model between parent and child
   * 
   */
  public getChildPeriods(parentId: string, linkName: string): Observable<any> {

    let opts = {where: "(assocType='" + linkName + "')"};

    // get a list of children
    return Observable.fromPromise(this._apiService.nodesApi.getSecondaryChildren(parentId, opts))
      // return just array of the children entries
      .map((res: any) => {
        return res.list.entries;
      })
      // return the nodeId from each child as an array
      .map((id: any) => {
        return Observable.from(id.map(a => a.entry.id));
      })
      // split the array into individual observables
      .flatMap((ar: any) => {
        return ar;
      })
      // use the nodeId in the observable to get the actual servicePeriod node
      .flatMap((entry_id: any) => {
        return Observable.fromPromise(this._apiService.nodesApi.getNode(entry_id));
      })
      // map the node into a servicePeriod object
      .map((result: any) => {
        let sp = new ServicePeriod();
        sp.contract_servicePeriodId = result.entry.id;
        sp.contract_servicePeriodName = result.entry.properties['contract:servicePeriodName'];
        sp.contract_servicePeriodDescription = result.entry.properties['contract:servicePeriodDescription'];
        sp.contract_serviceStart = result.entry.properties['contract:serviceStart'].substr(0, 10);
        sp.contract_serviceEnd = result.entry.properties['contract:serviceEnd'].substr(0, 10);
        sp.contract_servicePeriodType = result.entry.properties['contract:servicePeriodType'];
        sp.contract_serviceTypeCode = result.entry.properties['contract:serviceTypeCode'];
        return sp;
      });




  }

  /**
   * 
   * create a new serviePeriod entity in the production servicePeriods folder and create a child relationship
   * from the logical parent to the new entity.
   * @return { "entry": { "childId": "string", "assocType": "string"}}
   * 
   */
  public createServicePeriod(parentNode: string, period: ServicePeriod, serviceTypeCode: string, childRelationType: string): Observable<any> {

    if (undefined === parentNode) {
      console.log('ERROR: attempting to add a servicePeriod child node when parent not provided');
    }

    if (undefined === serviceTypeCode) {
      console.log('ERROR: attempting to add a servicePeriod child node when serviceTypeCode not provided');
    }
    console.log('adding new servicePeriod child to parent node [' + parentNode + ']');

    /**
     * 
     * create the production period
     * 
     */
    let bodyProps = {};
    bodyProps['contract:servicePeriodName'] = period.contract_servicePeriodName;
    bodyProps['contract:servicePeriodDescription'] = period.contract_servicePeriodDescription;
    bodyProps['contract:serviceTypeCode'] = period.contract_serviceTypeCode;
    bodyProps['contract:servicePeriodType'] = period.contract_servicePeriodType;
    bodyProps['contract:serviceStart'] = period.contract_serviceStart;
    bodyProps['contract:serviceEnd'] = period.contract_serviceEnd;

    let body = {};
    body['name'] = period.contract_servicePeriodName + this.getRandomInt();
    body['nodeType'] = 'contract:servicePeriod';
    body['properties'] = bodyProps;

    let p: ServicePeriod;

    return Observable.fromPromise(this._apiService.nodesApi.addNode(this.servicePeriodContainerId, body, null))
      .map(res => {
        console.log(res);
        p = new ServicePeriod();
        p.contract_servicePeriodId = res.entry.id;
        p.contract_servicePeriodName = res.entry.properties['contract:servicePeriodName'];
        p.contract_serviceStart = res.entry.properties['contract:contractServiceStart'];
        p.contract_serviceEnd = res.entry.properties['contract:contractServiceEnd'];
        p.contract_servicePeriodDescription = res.entry.properties['contract:servicePeriodDescription'];
        p.contract_servicePeriodType = res.entry.properties['contract:servicePeriodType'];
        p.contract_serviceTypeCode = res.entry.properties['contract:serviceTypeCode'];
        return p;
      })
      .flatMap((p1: ServicePeriod) => {
        return this.alfrescoService.createChildAssociation(parentNode, p1.contract_servicePeriodId, childRelationType);
      });
  }

  /**
   * 
   * update an existing servicePeriod
   * 
   */
  public updateServicePeriod(period: ServicePeriod): Observable<any> {

    let bodyProps = {};
    bodyProps['contract:servicePeriodName'] = period.contract_servicePeriodName;
    bodyProps['contract:servicePeriodDescription'] = period.contract_servicePeriodDescription;
    bodyProps['contract:serviceTypeCode'] = period.contract_serviceTypeCode;
    bodyProps['contract:servicePeriodType'] = period.contract_servicePeriodType;
    bodyProps['contract:serviceStart'] = period.contract_serviceStart;
    bodyProps['contract:serviceEnd'] = period.contract_serviceEnd;

    let body = {};
    body['properties'] = bodyProps;

    return Observable.fromPromise(this._apiService.nodesApi.updateNode(period.contract_servicePeriodId, body));

  }

  /**
   * 
   * delete a service period
   * 
   */
  public deleteServicePeriod(period: ServicePeriod): Observable<any> {

    return Observable.from(this._apiService.nodesApi.deleteNode(period.contract_servicePeriodId));

  }
  /**
   * 
   * returns the nodeId of the service period container for the current site context
   * @return nodeId of the servie period container for the current site context
   * 
   */
  private getServicePeriodContainer(): Observable<any> {

    if (this.servicePeriodContainerId) {
      return Observable.of(this.servicePeriodContainerId);
    }



  }

  /**
   * 
   * creates a service period container for the current site context
   * @return nodeId of the servie period container for the current site context
   * 
   */
  private createServicePeriodContainter(): Observable<any> {

    /**
     * 
     * create the production period container
     * 
     */
    let bodyProps = {};
    bodyProps['st:componentId'] = ServicePeriodService.ServicePeriodContainerName;

    let body = {};
    body['name'] = ServicePeriodService.ServicePeriodContainerName;
    body['nodeType'] = 'cm:folder';
    body['properties'] = bodyProps;

    return Observable.fromPromise(this._apiService.nodesApi.addNode(this.production.guid, body, null))
      .map(res => {
        let p = {entry: {id: '', folderId: ''}};
        p.entry.id = res.entry.id;
        p.entry.folderId = res.entry.name;
        console.log(p);
        return Observable.of(p);
      });

  }

  private getRandomInt() {
    let min = Math.ceil(0);
    let max = Math.floor(100000);
    return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
  }
}
