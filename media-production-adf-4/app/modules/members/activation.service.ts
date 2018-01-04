import { Injectable, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AlfrescoApiService, LogService } from 'ng2-alfresco-core';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ActivationService {
    
    private static ECM_PROXY = 'http://localhost:3000/ecm/';
    private static ACCEPT_PATH = 'alfresco/s/api/invite/';
   
    ecmTicket: string = '';
  
      
    /**
     * constructor, calls super
     * data not loaded until siteId is set
     * 
     */
    constructor(private apiService: AlfrescoApiService,
                private logService: LogService,
                private http: Http) {
    }
    
   
  /**
   * A service call to Alfresco to retrieve the default roles for this media production.
   * The call adds a new list to the _defaultRoles behavior subject
   * 
   */
  public accept(activationId, ticket): Observable<any> {
      
  
      let url = ActivationService.ECM_PROXY 
                 + ActivationService.ACCEPT_PATH
                 + activationId
                 + '/'
                 + ticket
                 + '/'
                 + 'accept';
      
      let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
      let options = new RequestOptions({ headers: headers }); // Create a request option
      return this.http.put(url, {}, options);
    
  }
        
    
  
   
  
}
