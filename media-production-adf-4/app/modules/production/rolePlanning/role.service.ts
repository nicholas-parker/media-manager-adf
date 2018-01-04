import { Injectable, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AlfrescoApiService, LogService } from 'ng2-alfresco-core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { Role } from './role';

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
     * the Alfresco siteId we are working in
     */
    siteId: string = undefined;
    
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
     * The DataSource interface which gives access to the default roles vai an observable
     * 
     * @return Observable<DefaultRole[]>
     */
    public connect(obj): Observable<Role[]> {
      console.log('Role Service: someone is connecting...');
      return this._roles.asObservable();
    }
  
    public disconnect(collectionViewer: CollectionViewer) {
      
    }
  
    /**
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
      let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
      let options = new RequestOptions({ headers: headers }); // Create a request option

     
      let obs: Observable<any> = this.http.post(url, bodyString, options);
      obs.subscribe(
        res => { this._roles.getValue().push(role);
                 this._roles.next(this._roles.getValue()); }
      );
      return obs; 
    }
  
    /**
     * public method to update the role list from the store
     */
    public refresh() {
      this._getRoles_Service();
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
          this._roles.next(<Role[]>res.json().items);
          console.log(this._roles.value);
        },
        
        err => { 
          console.log('Error receiveing DefaultRoles list' + err);
        }
      
      );
      
      /**
       * 
       * delete a role, any associated workflow must be deleted separately
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
}
