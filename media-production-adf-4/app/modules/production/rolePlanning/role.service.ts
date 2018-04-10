import {Injectable, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {DataSource, CollectionViewer} from '@angular/cdk/collections';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {Role} from './role';
import {RoleFilter} from './roleFilter';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';



@Injectable()
export class RoleService extends DataSource<Role> {

  /**
   * 
   * no create path because its all done by workflow
   * 
   */
  private static ECM_PROXY = 'http://localhost:3000/ecm/';
  private static SERVICE_PATH_1 = 'nvp/datalist/';
  private static SERVICE_PATH_2 = '/productionRoles';
  private static CONTEXT_ROOT = 'alfresco/';
  private static SERVICE_PATH = 'service/';

  /**
   * 
   * the Alfresco siteId we are working in
   * 
   */
  siteId: string = undefined;

  /**
   * 
   * the filter to apply to the results
   * 
   */
  private roleFilter: RoleFilter;
  private filterOnTags: boolean = false;
  private filterOnStatus: boolean = false;

  /**
   * 
   */
  showError: boolean = false;

  private _roles: BehaviorSubject<Role[]> = new BehaviorSubject([]);

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
   * loads data for the site
   * 
   */
  public setContext(id) {
    console.log('RoleService: setting context ' + id);
    this.siteId = id;
    this._getRoles_Service();
  }

  public getContext() {
    return this.siteId;
  }

  /**
   * The DataSource interface which gives access to a list of production roles for the
   * production set in the context
   * 
   * @return Observable<DefaultRole[]>
   */
  public connect(obj): Observable<Role[]> {

    return this._roles.asObservable();

  }

  public disconnect(collectionViewer: CollectionViewer) {

  }

  /**
   * 
   * returns an observable for a singular role instance based on the role node-id
   * has no tags
   * 
   */
  public getRole(nodeId: string): Observable<Role> {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    let url = RoleService.ECM_PROXY
      + RoleService.CONTEXT_ROOT
      + RoleService.SERVICE_PATH
      + RoleService.SERVICE_PATH_1
      + this.siteId
      + RoleService.SERVICE_PATH_2
      + '?alf_ticket=' + ecmTicket;

    let obs: Observable<Role> = Observable.fromPromise(this.apiService.nodesApi.getNode(nodeId)).map(
      (node: any) => {
        let role = new Role();
        role.nvpList_acceptedDate = node.entry.properties['nvpList:acceptedDate'];
        role.nvpList_budgetMax = node.entry.properties['nvpList:budgetMax'];
        role.nvpList_budgetMin = node.entry.properties['nvpList:budgetMin'];
        role.nvpList_chargeCode = node.entry.properties['nvpList:chargeCode'];
        role.nvpList_contractProcessId = node.entry.properties['nvpList:contractProcessId'];
        role.nvpList_contractTemplate = node.entry.properties['nvpList.contractTemplate'];
        role.nvpList_createdDate = node.entry.properties['nvpList.createdDate'];
        role.nvpList_endDate = node.entry.properties['nvpList.endDate'];
        role.nvpList_location = node.entry.properties['nvpList:location'];
        role.nvpList_offerDate = node.entry.properties['nvpList.offerDate'];
        role.nvpList_roleName = node.entry.properties['nvpList:roleName'];
        role.nvpList_PAYEStatus = node.entry.properties['nvpList:PAYEStatus'];
        role.nvpList_roleStatus = node.entry.properties['nvpList:roleStatus'];
        role.nvpList_roleType = node.entry.properties['nvpList:roleType'];
        role.nvpList_serviceDescription = node.entry.properties['nvpList:serviceDescription'];
        role.nvpList_startDate = node.entry.properties['nvpList:startDate'];
        role.nvpList_totalContractsValue = node.entry.properties['nvpList:totalContractsValue'];
        role.sys_nodedbid = node.entry.id;
        return role;
      },
      err => {console.log('ERROR: unable to retrieve role node');}
    );
    return obs;

  }

  /**
   * 
   * Writes a new default role to the back end store and updates the observable list
   * 
   */
  public writeRole(role: Role): Observable<any> {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    let url = RoleService.ECM_PROXY
      + RoleService.CONTEXT_ROOT
      + RoleService.SERVICE_PATH
      + RoleService.SERVICE_PATH_1
      + this.siteId
      + RoleService.SERVICE_PATH_2
      + '?alf_ticket=' + ecmTicket;

    let bodyString = JSON.stringify(role);
    let headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option


    let obs: Observable<any> = this.http.post(url, bodyString, options);
    obs.subscribe(
      res => {
        this._getRoles_Service();
      }
    );
    return obs;
  }

  /**
   * 
   * public method to update the production role list from the store
   * 
   */
  public refresh() {

    this._getRoles_Service();

  }

  /**
   * 
   * updates the production role list and applies the filter,
   * production role list is reduced by the filter and a new observable is produced
   * 
   */
  public applyFilter(roleFilter: RoleFilter) {

    this.roleFilter = roleFilter;

    if (this.roleFilter.tags === undefined || this.roleFilter.tags.length === 0) {
      this.filterOnTags = false;
    } else {
      this.filterOnTags = true;
    }

    this._getRoles_Service();

  }

  /**
   * 
   * clear filter
   * 
   */
  public clearFilter() {

    this.roleFilter = null;
    this._getRoles_Service();

  }

  /**
   * 
   * returns true if role matches the current roleFilter
   * 
   */
  public matchesFilter(role: Role): boolean {

    if (this.roleFilter === undefined) {return true;}

    // tags
    let tagMatch = false;
    if (this.roleFilter.tags === undefined || this.roleFilter.tags.length === 0) {

      console.log('No filter tags to match');
      tagMatch = true;

    } else {

      console.log('Role for filter');
      if (role.tags !== undefined) {
        let roleTags: string[] = role.tags.map(entry => entry.entry.tag);
        if (roleTags.length === 0) {

          /**
           * role has no tags, no match
           */
          tagMatch = false;

        } else {

          /**
           * iterate through the required tags, if role has tag then a match
           */
          for (let i = 0; i < this.roleFilter.tags.length; i++) {

            if (roleTags.indexOf(this.roleFilter.tags[i]) > -1) {
              tagMatch = true;
            }

          }

        }
        console.log(roleTags);
      }
    }

    // role status
    let statusMatch = false;
    if (this.roleFilter.status === undefined || this.roleFilter.status.length === 0) {

      console.log('No status tags to match');
      statusMatch = true;

    } else {

      if (role.nvpList_roleStatus !== undefined) {

        /**
         * iterate through the required status, if role has status then a match
         */
        for (let i = 0; i < this.roleFilter.status.length; i++) {

          if (this.roleFilter.status.indexOf(role.nvpList_roleStatus) > -1) {
            statusMatch = true;
          }

        }

      }

    }



    // name like


    // charge code
    let chargeCodeMatch = false;
    if (this.roleFilter.chargeCode === undefined || this.roleFilter.chargeCode.length === 0) {

      chargeCodeMatch = true;

    } else {

      let i = this.roleFilter.chargeCode.length;
      let roleCode = role.nvpList_chargeCode.substr(0, i);
      console.log(roleCode);
      if (roleCode === this.roleFilter.chargeCode) {

        chargeCodeMatch = true;

      }
    }

    // result
    if (tagMatch === true && statusMatch === true && chargeCodeMatch === true) {
      return true;
    } else {
      return false;
    }

  }

  /**
   * A service call to Alfresco to retrieve the default roles for this media production.
   * The call adds a new list to the _defaultRoles behavior subject
   * 
   */
  private _getRoles_Service() {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    let url = RoleService.ECM_PROXY
      + RoleService.CONTEXT_ROOT
      + RoleService.SERVICE_PATH
      + RoleService.SERVICE_PATH_1
      + this.siteId
      + RoleService.SERVICE_PATH_2
      + '?alf_ticket=' + ecmTicket;

    this.http.get(url).subscribe(

      (res: Response) => {
        let roles: Role[] = res.json().items;
        if (this.filterOnTags) {

          roles.forEach(entry => this.addTags(entry));
          this._roles.next([]);

        } else {

          roles = roles.filter((entry: Role) => this.matchesFilter(entry) === true);
          this._roles.next(roles);
          console.log(this._roles.value);

        }
      },

      err => {
        console.log('Error receiveing DefaultRoles list' + err);
      }

    );

  }

  /**
   * 
   * delete a role, any associated workflow & documentation must be deleted separately
   * 
   */
  public delete(role: Role): Observable<any> {

    // this.http.delete
    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    let url = RoleService.ECM_PROXY
      + RoleService.CONTEXT_ROOT
      + RoleService.SERVICE_PATH
      + RoleService.SERVICE_PATH_1
      + this.siteId
      + RoleService.SERVICE_PATH_2
      + '/'
      + role['sys_node-uuid']
      + '?alf_ticket=' + ecmTicket;

    let obs: Observable<any> = this.http.delete(url).do(resp => {this._getRoles_Service();});
    return obs;

  }

  /**
   * 
   * delete the role documentation
   * 
   */
  public deleteRoleDocumentation(role: Role) {


  }


}
