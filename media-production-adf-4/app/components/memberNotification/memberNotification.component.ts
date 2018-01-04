import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AlfrescoApiService, AlfrescoAuthenticationService} from 'ng2-alfresco-core';
import {Task} from '../alfrescoWorkflow/task';
import {TaskVar} from '../alfrescoWorkflow/taskVar';
import {TaskDataSource} from '../alfrescoWorkflow/taskDataSource';
import {AlfrescoService} from '../alfrescoWorkflow/alfresco.service';
import {AlfrescoWorkflowService} from '../alfrescoWorkflow/alfrescoWorkflow.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Notification} from './notification';
import {MdDialog, MdDialogRef} from '@angular/material';

/**
 * 
 * task forms
 * 
 */
import {ReviewOfferFormComponent} from '../alfrescoWorkflow/forms/reviewOfferForm.component';

@Component({
  selector: 'member-notification',
  templateUrl: './memberNotification.component.html',
  styleUrls: ['./memberNotification.component.css'],
  providers: [AlfrescoWorkflowService, AlfrescoService, TaskDataSource, AlfrescoAuthenticationService]
})
export class MemberNotificationComponent implements OnInit {

  public tasks: Observable<Task[]>;
  public userName: string;
  public notification: Notification;
  public dialogRef: MdDialogRef<any>;

  /**
   * 
   * a flag to indicate that there is a notification
   * 
   */
  public hasNotification: boolean;

  /**
   * 
   * An array of form keys which trigger notifications
   * 
   */
  private notifyTaskList: string[] = ['mwtwf:reviewContractDetailsTask'];
  private REVIEW_ROLE_FRMKEY = 'mwtwf:reviewContractDetailsTask';

  constructor(private taskData: TaskDataSource,
    private authService: AlfrescoAuthenticationService,
    private dialog: MdDialog) {
    this.hasNotification = false;
  }

  public ngOnInit() {

    // this.userName = this.authService.getEcmUsername();
    this.userName = 'charlie_saunders';
    this.tasks = this.taskData.connect();
    this.tasks.subscribe(data => {this.setNotifications(data);});

  }

  /**
   * 
   * receives a task list from the subscribed observable
   * filters the task list for task which are assigned to the user and have a taskKey which is in the alert list
   * 
   */
  private setNotifications(taskList: Task[]) {

    console.log(taskList);
    for (let task of taskList) {

      // if (task.assignee === this.userName) {

      if (this.notifyTaskList.indexOf(task.formResourceKey) > -1) {

        this.notification = new Notification();
        this.notification.title = 'New job opportunity';
        this.notification.task = task;
        this.hasNotification = true;
      }

      // }

    }
  }

  public selectTask(): void {


    /** REVIEW_ROLE_FRMKEY */
    if (this.notification.task.formResourceKey === this.REVIEW_ROLE_FRMKEY) {
      this.dialogRef = this.dialog.open(ReviewOfferFormComponent);
      this.dialogRef.componentInstance.setTask(task);
      return;
    }


  }


}
