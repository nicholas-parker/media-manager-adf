import {Injectable, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {DataSource} from '@angular/cdk/collections';
import {AlfrescoService} from '../../../components/alfrescoWorkflow/alfresco.service';
import {LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {ContractTemplate} from './contractTemplate';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ContractTemplateService extends DataSource<ContractTemplate> {


  /**
   * the Alfresco siteId to get contract template items for
   */
  siteId: string = undefined;

  /**
   * hope all these can go!
   */
  data: any = undefined;
  url: string = 's/mwt/contract/template';

  private templateSubject: BehaviorSubject<ContractTemplate[]> = new BehaviorSubject([]);
  private haveConsumer = false;

  /**
   * constructor, calls super
   * data not loaded until siteId is set
   * 
   */
  constructor(private service: AlfrescoService,
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
    console.log('ContractTemplateService: setting context ' + id);
    this.siteId = id;
    this._getContractTemplate_Service();
  }


  public getContext() {
    return this.siteId;
  }

  /**
   * The DataSource interface which gives access to the default roles vai an observable
   * 
   * @return Observable<DefaultRole[]>
   */
  public connect(obj): Observable<ContractTemplate[]> {
    console.log('someone is connecting to the ContractTemplateService...', obj);
    this.haveConsumer = true;
    return this.templateSubject.asObservable();
  }

  public gotData(d) {
    console.log('ContractTemplate observable new data [' + d + ']');
  }

  public disconnect() {

  }


  /**
   * 
   * A service call to Alfresco to retrieve the contract templates for this media production.
   * 
   */
  private _getContractTemplate_Service() {

    let path = this.url + '/' + this.siteId;

    this.service.getList2(path).subscribe(

      (res) => {

        console.log('Here are the contract templates');
        console.log(res);
        this.templateSubject.next(res);

      },

      err => {
        console.log('Error receiveing ContractTemplate list' + err);
      }

    );
  }

}
