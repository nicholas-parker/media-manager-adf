import {Injectable, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {DataSource} from '@angular/cdk/collections';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {DefaultRole} from './defaultRole';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class DefaultRoleService extends DataSource<DefaultRole> {

  /**
   * 
   * route to the ECM Proxy the web client uses
   * 
   */
  private static ECM_PROXY = 'http://localhost:3000/ecm/';

  /**
   * 
   * generic path to data list management service
   * 
   */
  private static SERVICE_LIST_PATH_1 = 'nvp/datalist/';

  /*
   * 
   * the name of the data list this service manages
   * 
   */
  private static SERVICE_LIST_PATH_2 = '/defaultRoles';

  private static SERVICE_UPDATE_SCRIPT = '';
  private static CONTEXT_ROOT = 'alfresco/';
  private static SERVICE_PATH = 'service/';

  /**
   * the Alfresco siteId to get default items for
   */
  siteId: string = undefined;

  /**
   * 
   */
  data: any = undefined;
  showError: boolean = false;
  scriptArgs: any = '';
  url: string = '';
  ecmTicket: string = '';

  private defaultRoles: DefaultRole[];
  private _defaultRoles: BehaviorSubject<DefaultRole[]> = new BehaviorSubject([]);
  private _rolesCategories: BehaviorSubject<string[]> = new BehaviorSubject([]);
  private haveConsumer = false;

  /**
   * constructor, calls super
   * data not loaded until siteId is set
   * 
   */
  constructor(private apiService: AlfrescoApiService,
    private logService: LogService,
    private http: Http) {
    super();
    // this.siteId = 'mwt2';
    // this._getDefaultRoles_Service();
  }

  /**
   * 
   * sets the current siteId,
   * loads data for the siteId
   * 
   */
  public setContext(id) {
    console.log('DefaultRoleService: setting context ' + id);
    this.siteId = id;
    this._getDefaultRoles_Service();
  }


  public getContext() {
    return this.siteId;
  }

  /**
   * The DataSource interface which gives access to the default roles vai an observable
   * 
   * @return Observable<DefaultRole[]>
   */
  public connect(obj): Observable<DefaultRole[]> {
    console.log('someone is connecting...', obj);
    this.haveConsumer = true;
    return this._defaultRoles.asObservable();
  }

  /**
   * access to the role categories via an observable
   * 
   */
  public getCategories(): Observable<string[]> {

    return this._rolesCategories.asObservable();

  }

  public gotData(d) {
    console.log('DefaultRole observable new data [' + d + ']');
  }

  public disconnect() {

  }

  /**
   * Writes a new default role to the back end store and updates the observable list
   * 
   */
  public writeRole(defaultRole: DefaultRole): Observable<any> {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    this.url = DefaultRoleService.ECM_PROXY
      + DefaultRoleService.CONTEXT_ROOT
      + DefaultRoleService.SERVICE_PATH
      + DefaultRoleService.SERVICE_LIST_PATH_1
      + this.siteId
      + DefaultRoleService.SERVICE_LIST_PATH_2
      + '?alf_ticket=' + ecmTicket;

    let bodyString = JSON.stringify(defaultRole);
    let headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option

    let obs: Observable<any> = this.http.post(this.url, bodyString, options).do(resp => {this._getDefaultRoles_Service();});
    return obs;
  }


  /**
   * delete role
   */
  public deleteRole(defaultRole: DefaultRole): Observable<any> {

    console.log(defaultRole);

    // this.http.delete
    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    this.url = DefaultRoleService.ECM_PROXY
      + DefaultRoleService.CONTEXT_ROOT
      + DefaultRoleService.SERVICE_PATH
      + DefaultRoleService.SERVICE_LIST_PATH_1
      + this.siteId
      + DefaultRoleService.SERVICE_LIST_PATH_2
      + '/'
      + defaultRole.sys_nodedbid
      + '?alf_ticket=' + ecmTicket;

    let obs: Observable<any> = this.http.delete(this.url).do(resp => {this._getDefaultRoles_Service();});
    return obs;
  }

  /**
   * A service call to Alfresco to retrieve the default roles for this media production.
   * The call adds a new list to the _defaultRoles behavior subject
   * 
   */
  private _getDefaultRoles_Service() {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    this.url = DefaultRoleService.ECM_PROXY
      + DefaultRoleService.CONTEXT_ROOT
      + DefaultRoleService.SERVICE_PATH
      + DefaultRoleService.SERVICE_LIST_PATH_1
      + this.siteId
      + DefaultRoleService.SERVICE_LIST_PATH_2
      + '?alf_ticket=' + ecmTicket;

    this.http.get(this.url).subscribe(

      (res: Response) => {
        this.defaultRoles = (<DefaultRole[]>res.json().items).map((item: any) =>
          new DefaultRole(
            item['sys_node-uuid'],
            item.nvpList_typeName,
            item.nvpList_typeDescription,
            item.nvpList_typeDeliverableType,
            item.nvpList_typeChargeCode,
            item.nvpList_typePAYEStatus,
            item.nvpList_typeWorkingWeek,
            item.nvpList_typeBudgetMin,
            item.nvpList_typeBudgetMax,
            item.nvpList_typePaymentPeriod,
            item.nvpList_typeRatePeriod,
            item.nvpList_typeCurrency,
            item.nvpList_typeProcessName,
            item.nvpList_typeAdministrationTeam,
            item.nvpList_typeContractTemplate,
            item.nvpList_typeCategory
          ));
        this._defaultRoles.next(this.defaultRoles);
        this.setCategories();
        console.log('DefaultRoleService... updated defaultRoles  consumer is ' + this.haveConsumer);
        console.log(this._defaultRoles);
      },

      err => {
        console.log('Error receiveing DefaultRoles list' + err);
      }

    );
  }


  /**
   * 
   * create a list of categories from the defaultRoles
   * 
   */
  private setCategories(): void {

    let categories: string[] = this.defaultRoles
      .map((r: DefaultRole) => {return r.nvpList_typeCategory;});
    let unique = Array.from(new Set(categories));
    this._rolesCategories.next(unique);

  }


}
