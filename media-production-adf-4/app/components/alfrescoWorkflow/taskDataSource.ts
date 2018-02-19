import {Injectable} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {AlfrescoWorkflowService} from './alfrescoWorkflow.service';
import {AlfrescoService} from './alfresco.service';
import {Task} from './task';

@Injectable()
export class TaskDataSource extends DataSource<Task> {

  /**
   * 
   * subject which streams the task list back to the subscriber
   * 
   */
  private _tasks: BehaviorSubject<Task[]> = new BehaviorSubject([]);

  /**
   * 
   * the context filter for the task list
   * 
   */
  public contextFilter: string = null;


  constructor(private service: AlfrescoWorkflowService) {
    super();
    this.getTasks();
  }

  /** here because we extend DataSource */
  public ngOnInit() {

  }



  /**
   * obtain access to the data via observable
   */
  public connect(): Observable<Task[]> {
    return this._tasks.asObservable();
  }

  public disconnect() {

  }

  /**
   * 
   * call out to the workflow service to get the tasks,
   * load the tasks into the BehaviourSubject on success
   * 
   */
  private getTasks(): void {

    if (this.contextFilter != null) {

      // this.service.getTasks().filter((task) => task.context === this.contextFilter).subscribe(data => this.onTasks(data));

    } else {

      this.service.getTasks().subscribe(data => this.onTasks(data));

    }

  }

  /**
   * 
   * load the supplied task array into the observable,
   * called by successful getTask
   * 
   */
  private onTasks(data: Task[]): void {
    console.log('Here are some tasks');
    console.log(data);
    this._tasks.next(data);
  }

  /**
   * 
   * refresh the data source, 
   * called by service consumers when they have knowingly altered the task list content
   * 
   */
  public refresh() {
    this.getTasks();
  }
}
