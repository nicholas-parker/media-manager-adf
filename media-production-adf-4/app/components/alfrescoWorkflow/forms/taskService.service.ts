import {Injectable, Component, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
import {FormGroup} from '@angular/forms';
import {Task} from '../task';
import {TaskVar} from '../taskVar';
import {AlfrescoWorkflowService} from '../alfrescoWorkflow.service';

/**
 * 
 * each form instance must have its own task service
 * 
 */
@Injectable()
export class TaskService {

  /**
   * 
   * A reference to a form group in the parent task form component.
   * The parent sets this value in the service.
   * This service will attempt to load the inputs in the form group with
   * values where the name of the input matches a variable name in the task
   * 
   */
  public taskForm: FormGroup = null;

  /**
   * 
   * The id of the task to load
   * 
   */
  public taskId;

  /**
   * 
   * the list of vars relating to the task which was returned from Alfresco
   *  
   */
  protected taskModel: TaskVar[];


  constructor(private service: AlfrescoWorkflowService) {}

  /** 
   * 
   * the parent object calls this method after instantiating the workflow form with the specific task Id
   * [ minimal value above AlfrescoWorkflowService ]
   * 
   */
  public connect(taskId: number): Observable<TaskVar[]> {

    this.taskId = taskId;
    console.log('someone connected');
    return this.service.getTaskVars(taskId);

  }

  /**
   *  
   * callback for when vars have loaded
   * iterate through the form controls, 
   * if var with control name then map value
   *
   * UPDATE- this function called directly by form component to load the form, change parameters and update form component
   * 
   */
  public LoadTaskForm(data) {

    if (null == this.taskForm) {return;}

    console.log('Loading the form with data below');
    console.log(data);

    this.taskModel = data;
    for (let i = 0; i < this.taskModel.length; i++) {

      let controlName = this.taskModel[i].name;
      if (this.taskForm.contains(controlName)) {
        if (undefined !== this.taskModel[i].value) {

          /** 
           * 
           * bodge for datepicker, and field with an End or Start in the name is considered a date,
           * take the string and build a date object which we pass to the datepicker
           * 
           */
          if (controlName.indexOf('Date') > -1 || controlName.indexOf('End') > -1 || controlName.indexOf('Start') > -1) {

            console.log('Date value:' + this.taskModel[i].value);
            let year = this.taskModel[i].value.substring(0, 4);
            let month = this.taskModel[i].value.substring(5, 7) - 1;
            let day = this.taskModel[i].value.substring(8, 10);
            console.log('Date:' + year + ', ' + month + ', ' + day);

            let date = new Date(year, month, day, 0, 0, 0, 0);
            this.taskForm.controls[controlName].patchValue(date);

          } else {
            this.taskForm.controls[controlName].patchValue(this.taskModel[i].value);
          }

        }
      }
    }
  }

  public loadTaskModel(data) {

    this.taskModel = data;

  }

  /** 
   * 
   * informs the user there was an error getting the variables for the task
   *
   */
  private onVarsError(err) {
    console.log('Error retrieving vars for a task ' + err);
  }

  /**
   * 
   *  return the variable object for a given name
   * 
   */
  public getTaskVar(name: string): any {

    if (this.taskModel === undefined) {
      console.log('WARNING: TaskService - attempting to getTaskVar when taskModel is not defined');
      return '';
    }

    let r = this.taskModel.filter(m => m.name === name);
    if (r.length === 0) {
      console.log('WARNING: TaskService - task does not contain variable [' + name + ']');
      return '';
    }

    if (undefined !== r[0].value) {
      return r[0].value;
    } else {
      return '';
    }

  }

  /**
   * 
   * sets the task variable
   * 
   */
  public setTaskVar(name: string, newValue: any) {

    let r = this.taskModel.filter(m => m.name === name);
    if (r.length > 0) {
      r[0].value = newValue;
    } else {
      let newVar: TaskVar = new TaskVar('global', name, newValue, 'd:text');
      this.taskModel.push(newVar);
    }

  }

  /** 
   *  
   * iterate through task model,
   * if form control with same name exists in model 
   * update the model with value in control
   *  
   */
  protected updateModel() {

    if (null == this.taskForm) {return;}

    Object.keys(this.taskForm.controls).forEach(key => {
      this.setTaskVar(key, this.taskForm.controls[key].value);
    });

  }


  /**
   * 
   * Saves the current task data back to Alfresco
   * 
   */
  public Save(): Observable<any> {

    this.updateModel();

    console.log('Model at save');
    console.log(this.taskModel);

    return this.service.setTaskVars(+this.taskId, this.taskModel.filter(m => m.name !== 'initiator').
      filter(m => m.name !== 'contract_productionRole').
      filter(m => m.name !== 'contract_contractSupplier').
      filter(m => m.name !== 'bpm_package').
      filter(m => m.name !== 'nvpList_contractTemplate'));
  }

  /**
   * 
   * Updates the task status to complete
   * Call Save prior to this if the model has changed
   * 
   */
  public TaskComplete(): Observable<any> {

    return this.service.completeTask(+this.taskId);

  }

  /** assign task to another site member, site member must be a member of the workflow group */
  public onTaskAssign() {

  }

  /** returns an array of members who are in the workflow group */
  public assignOptions(): string[] {
    return null;
  }

}
