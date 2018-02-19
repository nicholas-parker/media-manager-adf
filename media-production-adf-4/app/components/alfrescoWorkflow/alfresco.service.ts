import {Injectable, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {AlfRESTList} from './AlfRESTList';
import {AlfListEntry} from './alfListEntry';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class AlfrescoService {

  private static ECM_PROXY = 'http://localhost:3000/ecm/';
  private static CONTEXT_ROOT = 'alfresco/';

  constructor(private apiService: AlfrescoApiService,
    private logService: LogService,
    private http: Http) {

  }

  /**
   * 
   * provides access to the core serivce API provided by Alfresco
   * 
   */
  public getCoreApi(): AlfrescoApiService {
    return this.apiService;
  }

  /**
   * posts the message as a JSON body to the /alfresco/<servicePath>
   * 
   * @returns Observable which resolves to an object posted back in the response
   * 
   */
  public post(servicePath: string, message: any): Observable<any> {

    let url = this.createURL(servicePath);
    let bodyString = JSON.stringify(message);
    let headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option
    let result: Observable<any> = this.http.post(url, bodyString, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    return result;

  }

  /**
   * calls the service URL and expects to receive a single object
   */
  public get(servicePath: string, ParamURL?: string): Observable<any> {
    let url = this.createURL(servicePath, ParamURL);
    let result: Observable<any> = this.http.get(url)
      .map((res: Response) => res.json())
      .map(response => response.entry)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    return result;

  }



  /**
   * calls the service URL with the supplied GET path.
   * expects to get a list of objects 
   * @returns Observable which resolves to an object posted in the GET response
   * 
   */
  public getList(servicePath: string, ParamURL?: string): Observable<any> {

    let url = this.createURL(servicePath, ParamURL);

    let result: Observable<any> = this.http.get(url)
      .map((res: Response) => res.json())
      .mergeMap(response => Observable.from(response.list.entries))
      .map((item: AlfListEntry) => item.entry.site)
      .toArray();

    return result;

  }

  /**
   * calls the service URL with the supplied GET path.
   * expects to get a list of objects 
   * @returns Observable which resolves to an object posted in the GET response
   * 
   */
  public getList2(servicePath: string, ParamURL?: string): Observable<any> {

    let url = this.createURL(servicePath, ParamURL);

    let result: Observable<any> = this.http.get(url)
      .map((res: Response) => res.json())
      .map(res => res.list.entries);

    return result;

  }

  public getListHeaderAuth(servicePath: string): Observable<any> {

    let url = this.createURL_noTicket(servicePath);
    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();
    let headers = new Headers({'Authorization': 'Basic ' + btoa(ecmTicket)}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option

    let result: Observable<AlfRESTList> = this.http.get(url, options)
      .map((res: Response) => res.json())
      .mergeMap(response => Observable.from(response.list.entries))
      // .do(item => console.log(item))
      .map((item: AlfListEntry) => item.entry)
      .toArray()
      .catch((error: any) => {
        console.log(error);
        return Observable.throw(error.json().error || 'Server error');
      });

    return result;
  }

  /**
   * posts the message as a JSON body to the /alfresco/<servicePath>
   * 
   * @returns Observable which resolves to an object posted back in the response
   * 
   */
  public postHeaderAuth(servicePath: string, message: any): Observable<any> {

    let url = this.createURL_noTicket(servicePath);
    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();
    let headers = new Headers({'Authorization': 'Basic ' + btoa(ecmTicket)}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option

    let bodyString = JSON.stringify(message);

    let result: Observable<any> = this.http.post(url, bodyString, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    return result;

  }

  /**
   * deletes the message as a JSON body to the /alfresco/<servicePath>
   * 
   * @returns Observable which resolves to an object posted back in the response
   * 
   */
  public deleteHeaderAuth(servicePath: string): Observable<any> {

    let url = this.createURL_noTicket(servicePath);
    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();
    let headers = new Headers({'Authorization': 'Basic ' + btoa(ecmTicket)}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option

    let result: Observable<any> = this.http.delete(url, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    return result;

  }

  /**
   * puts the message as a JSON body to the /alfresco/<servicePath>
   * 
   * @returns Observable which resolves to an object posted back in the response
   * 
   */
  public putHeaderAuth(servicePath: string, message: any): Observable<any> {

    let url = this.createURL_noTicket(servicePath);
    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();
    let headers = new Headers({'Authorization': 'Basic ' + btoa(ecmTicket)}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option

    let bodyString = JSON.stringify(message);

    let result: Observable<any> = this.http.put(url, bodyString, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    return result;

  }

  /**
   * 
   *  given the service path creates the full target URL to call
   * 
   */
  private createURL(service: string, ParamURL?: string): string {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    let url = AlfrescoService.ECM_PROXY
      + AlfrescoService.CONTEXT_ROOT
      + service
      + '?alf_ticket=' + ecmTicket;

    if (ParamURL) {
      url = url + '&' + ParamURL;
    }

    return url;
  }

  /**
   * 
   * Given a path returns the URL with no 'alf_ticket' parameter.
   * This is used with the Alfresco REST api
   * Use createURL to get an alf_ticket parameter, matches the legacy script service authorisation interface
   * 
   */
  private createURL_noTicket(service: string) {

    return AlfrescoService.ECM_PROXY
      + AlfrescoService.CONTEXT_ROOT
      + service;

  }

  public transform(source: any): any {

    let names = Object.getOwnPropertyNames(source);
    let result = {};
    for (let i = 0; i < names.length; i++) {

      let newName = names[i].replace('_', ':');
      result[newName] = source[names[i]];
    }
    return result;
  }
}
