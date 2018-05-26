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

    this.haveConsumer = true;
    return this._defaultRoles.asObservable();

  }

  public disconnect() {

  }

  /**
   * access to the role categories via an observable
   * 
   */
  public getCategories(): Observable<string[]> {

    return this._rolesCategories.asObservable();

  }

  /**
   * 
   * return a specific default role by role name
   * 
   */
  public getDefaultRoleByName(roleTypeName: string): Observable<DefaultRole> {

    return this._defaultRoles.asObservable()
      .take(1)
      .map((dr: DefaultRole[]) => {
        return dr.filter((r: DefaultRole) => {return r.nvpList_typeName === roleTypeName;})[0];
      });
  }

  /**
   * Writes a new default role to the back end store and updates the observable list
   * 
   */
  public writeRole(defaultRole: DefaultRole, siteId?: string): Observable<DefaultRole> {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();
    let _siteId: string = null;
    if (undefined !== siteId) {
      _siteId = siteId;
    } else {
      _siteId = this.siteId;
    }

    this.url = DefaultRoleService.ECM_PROXY
      + DefaultRoleService.CONTEXT_ROOT
      + DefaultRoleService.SERVICE_PATH
      + DefaultRoleService.SERVICE_LIST_PATH_1
      + _siteId
      + DefaultRoleService.SERVICE_LIST_PATH_2
      + '?alf_ticket=' + ecmTicket;

    let bodyString = JSON.stringify(defaultRole);
    let headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option

    return this.http.post(this.url, bodyString, options)
      .map((response: Response) => {
        defaultRole.sys_nodedbid = response.json().items['sys_node-uuid'];
        defaultRole['sys_node-uuid'] = response.json().items['sys_node-uuid'];
        return defaultRole;
      })
      .do(resp => {this._getDefaultRoles_Service();});

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

    /** custom service in Alfresco returns the properties of the defaultRoles as an array called items */
    this.http.get(this.url).subscribe(

      (res: Response) => {
        let defaultRoles: DefaultRole[] = res.json().items;
        this._defaultRoles.next(defaultRoles);
        this._rolesCategories.next(this.getRoleCategories(defaultRoles));
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
  private getRoleCategories(defaultRoles: DefaultRole[]): string[] {

    let categories: string[] = defaultRoles
      .map((r: DefaultRole) => {return r.nvpList_typeCategory;});
    return Array.from(new Set(categories));

  }


}
