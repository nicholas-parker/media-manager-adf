/**
 * 
 * a base class for all components which provide a UI for a workflow form.
 * This class is never instantiated and does not provide  UI.
 * UI is provided by extending this class.
 * 
 */

import {Observable} from 'rxjs/Observable';
import {MdSnackBar} from '@angular/material';
import {Component} from '@angular/core';
import {TaskService} from './taskService.service';

export class TaskForm {


  constructor(private _taskService: TaskService,
    private _snackBar: MdSnackBar) {

  }

  /**
   *  
   * updates the form model with values from with values from the child UI
   * 
   */
  public Save(): Observable<any> {

    return this._taskService.Save();

  }

  /** 
   * 
   * updates the for model with the current values and sets the task as complete
   * 
   */
  public TaskSaveComplete(): Observable<any> {

    return this._taskService.Save()
      .flatMap(d => {return this._taskService.TaskComplete();})
      .catch(err => {
        this._snackBar.open('Something went wrong and the task could not be completed.  Please try again in a minute', null, {duration: 3000});
        return Observable.of(null);
      });

  }

}
