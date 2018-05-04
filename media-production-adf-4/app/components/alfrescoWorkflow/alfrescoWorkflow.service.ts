import {Injectable, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {TaskVar} from './taskVar';
import {Task} from './task';
import {AlfrescoService} from './alfresco.service';
import {StartWorkflowMessage} from './startWorkflowMessage';
import {StartWorkflowResponse} from './startWorkflowResponse';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AlfrescoWorkflowService {

  private static ECM_PROXY = 'http://localhost:3000/ecm/';
  private static CONTEXT_ROOT = 'alfresco/';
  private static SERVICE_PATH = 'service/';

  private static START_PROCESS_PATH = 'mwt/workflow/process';
  private static PROCESS_PATH = 'api/-default-/public/workflow/versions/1/processes';
  private static LIST_TASKS_PATH = 'api/-default-/public/workflow/versions/1/tasks';
  private static LIST_TASK_VARS = 'api/-default-/public/workflow/versions/1/tasks';
  private static CLAIM_TASK_PATH = 'api/-default-/public/workflow/versions/1/tasks/';
  private static COMPLETE_TASK_PATH = 'api/-default-/public/workflow/versions/1/tasks/';
  private static LIST_PROCESS_PATH = 'api/-default-/public/workflow/versions/1/processes';

  data: any = undefined;
  showError: boolean = false;
  scriptArgs: any = '';
  url: string = '';
  ecmTicket: string = '';


  //    private _defaultRoles: BehaviorSubject<DefaultRole[]> = new BehaviorSubject([]);  
  constructor(private apiService: AlfrescoApiService,
    private logService: LogService,
    private alfService: AlfrescoService,
    private http: Http) {

  }

  /**
   * 
   * ============================================================================
   * PROCESS API
   * ============================================================================
   * 
   */

  /**
   * adds a new item to a process
   * @processId the id of the process
   * @itemId the node id of the item
   * 
   */
  public addProcessItem(processId: number, itemId: string): Observable<StartWorkflowResponse> {

    let url = AlfrescoWorkflowService.PROCESS_PATH + '/' + processId + '/items';
    let vars = {id: itemId};
    let obs: Observable<StartWorkflowResponse> = this.alfService.postHeaderAuth(url, vars);
    return obs;

  }


  /**
   * Start a process instance
   * -- needs to be refactored so it uses existing public REST API
   * 
   */
  public startProcess(processName: string, properties: any): Observable<StartWorkflowResponse> {

    let url: string = this.createURL(AlfrescoWorkflowService.START_PROCESS_PATH);

    // create the json request
    let startMessage = new StartWorkflowMessage(processName, properties);

    let bodyString = JSON.stringify(startMessage);
    let headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
    let options = new RequestOptions({headers: headers}); // Create a request option

    return this.http.post(url, bodyString, options)
      .map(r => r.json())
      .map((d: any) => {
        let response = new StartWorkflowResponse();
        response.status = d.status;
        response.message = d.message;
        response.processId = d.processId;
        response.workflowName = processName;
        response.properties = properties;
        return response;
      })
      .catch(d => {
        console.log(d);
        let response: StartWorkflowResponse = new StartWorkflowResponse();
        response.message = 'Did not start workflow ' + d.message;
        response.status = StartWorkflowResponse.STATUS_FAIL;
        response.properties = properties;
        return Observable.of(response);
      });


  }

  /**
   * Delete an existing process
   * 
   */
  public deleteProcess(processId: number): Observable<any> {

    let url = AlfrescoWorkflowService.PROCESS_PATH + '/' + processId;
    let obs: Observable<TaskVar[]> = this.alfService.deleteHeaderAuth(url);
    return obs;

  }

  /**
   * 
   * send a process a message
   * 
   */
  public sendMessage(processId: number, messageName: string): Observable<any> {

    let url = 's/mwt/workflow/' + processId + '/' + messageName;
    let obs: Observable<any> = this.alfService.post(url, null);
    return obs;

  }

  /**
   * 
   * ============================================================================
   * TASK API
   * ============================================================================
   * 
   */

  /**
   * List tasks for the current authenticated user
   * 
   */
  public getTasks(): Observable<Task[]> {

    let obs: Observable<Task[]> = this.alfService.getListHeaderAuth(AlfrescoWorkflowService.LIST_TASKS_PATH);
    return obs;

  }


  /** 
   * 
   * return a list of variables for a given task 
   * 
   */
  public getTaskVars(taskId: number): Observable<TaskVar[]> {

    let url = AlfrescoWorkflowService.LIST_TASK_VARS + '/' + taskId + '/variables';
    let obs: Observable<TaskVar[]> = this.alfService.getListHeaderAuth(url);
    return obs;

  }

  /**
   * 
   * update the given task with the variable array
   * 
   */
  public setTaskVars(taskId: number, vars: TaskVar[]): Observable<TaskVar[]> {

    let url = AlfrescoWorkflowService.LIST_TASK_VARS + '/' + taskId + '/variables';
    let obs: Observable<TaskVar[]> = this.alfService.postHeaderAuth(url, vars);
    return obs;

  }

  /**
   * 
   * set a task status to completed
   * 
   */
  public completeTask(taskId: number) {

    let url = AlfrescoWorkflowService.COMPLETE_TASK_PATH + '/' + taskId + '?select=state';
    let obs: Observable<TaskVar[]> = this.alfService.putHeaderAuth(url, {'state': 'completed'});
    return obs;

  }

  /**
   * 
   * current authenticated user claims task
   * 
   */
  public claimTask(taskId: number) {

    let url = AlfrescoWorkflowService.COMPLETE_TASK_PATH + '/' + taskId + '?select=state';
    let obs: Observable<TaskVar[]> = this.alfService.putHeaderAuth(url, {'state': 'claimed'});
    return obs;

  }

  /**
   * 
   * unclaim a previously claimed task
   * 
   */
  public unclaimTask(taskId: number) {

    let url = AlfrescoWorkflowService.COMPLETE_TASK_PATH + '/' + taskId + '?select=state';
    let obs: Observable<TaskVar[]> = this.alfService.putHeaderAuth(url, {'state': 'unclaimed'});
    return obs;

  }

  /**
   * 
   * delegate a task to a user
   * 
   */
  public delegateTask(taskId: number, user: string) {

    let url = AlfrescoWorkflowService.COMPLETE_TASK_PATH + '/' + taskId + '?select=state';
    let obs: Observable<TaskVar[]> = this.alfService.putHeaderAuth(url, {'state': 'delegated', 'assignee': user});
    return obs;

  }

  /**
   * 
   * resolve a task, return to previous user
   * 
   */
  public resolveTask(taskId: number) {

    let url = AlfrescoWorkflowService.COMPLETE_TASK_PATH + '/' + taskId + '?select=state';
    let obs: Observable<TaskVar[]> = this.alfService.putHeaderAuth(url, {'state': 'resolved'});
    return obs;

  }

  /**
   * retrieve the current tasks for a given processId
   */
  public getProcessTasks(processId: number): Observable<any> {

    let url = AlfrescoWorkflowService.LIST_PROCESS_PATH + '/' + processId + '/tasks';
    let obs: Observable<Task[]> = this.alfService.getListHeaderAuth(url);
    return obs;

  }


  /** return a full URL to Alfresco workflow API with the ticket in the URL */
  private createURL(service: String): string {

    let ecmTicket = this.apiService.getInstance().ecmAuth.getTicket();

    let url = AlfrescoWorkflowService.ECM_PROXY
      + AlfrescoWorkflowService.CONTEXT_ROOT
      + AlfrescoWorkflowService.SERVICE_PATH
      + service
      + '?alf_ticket=' + ecmTicket;

    return url;
  }

}

