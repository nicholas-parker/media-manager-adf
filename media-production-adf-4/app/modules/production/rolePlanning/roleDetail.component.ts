/**
 * 
 * manages the viewing and editing of a role & associated offer
 * 
 * Process status         Features
 * --------------         --------
 * Set up                 Edit all items in the Role & Finance tab, no need to change documentation as documentation not created till end
 */
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {MdProgressSpinnerModule, MdList, MdDialogRef, MdDialog, MdSnackBar, MdSelectModule, MdInputModule, MdButtonModule, MdDatepickerModule} from '@angular/material';
import {RoleService} from './role.service';
import {Role} from './role';
import {ContentModelConstraints} from '../../../components/alfrescoModel/contentModelConstraints';
import {AlfrescoWorkflowService} from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {AlfrescoService} from '../../../components/alfrescoWorkflow/alfresco.service';
import {OpportunityComponent} from '../../../components/alfrescoWorkflow/forms/opportunity/opportunity.component';
import {RoleDeleteDialog} from './roleDeleteDialog.component';
import {WithdrawContractDialog} from './withdrawContractDialog.component';

@Component({
  selector: 'role-detail',
  templateUrl: './roleDetail.component.html',
  styleUrls: ['./roleDetail.component.css', '../../../standard.css']
})
export class RoleDetailComponent implements OnInit {

  /**
   * 
   * observable for the role we are looking at
   * 
   */
  private roleId: string;
  private role: Role = new Role();

  /**
   * 
   * taskId for the current task in the process and a flag to set if this is valid task to display
   * 
   */
  private currentTask;
  private taskId: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private validTask: boolean;
  public displayOptions = {};

  /**
   * 
   * subscription to the route parameters & role
   * 
   */
  private routeSubscripton: Subscription;
  private roleSubscription: Subscription;

  /**
   * 
   * flag to disable the withdraw button
   * 
   */
  public withdrawDisabled: boolean = true;

  /**
   * 
   * role delete dialog
   * 
   */
  public roleDeleteDialogRef: MdDialogRef<RoleDeleteDialog>;

  /**
   * 
   * role withdraw dialog
   * 
   */
  public withdrawContractDialogRef: MdDialogRef<WithdrawContractDialog>;

  constructor(private roleService: RoleService,
    private route: ActivatedRoute,
    private workflowService: AlfrescoWorkflowService,
    private dialog: MdDialog) {
  }

  /**
   * 
   * get the role id from the route parameters
   * retrieve the role details
   * 
   */
  public ngOnInit() {

    this.routeSubscripton = this.route.params.subscribe(

      param => {
        console.log(param);
        this.roleId = param.roleId;
        this.roleService.setContext(param.id);
        this.roleSubscription = this.roleService.getRole(param.roleId).subscribe(
          r => {
            console.log('Here is our role');
            console.log(r);
            this.role = r;
            this.loadCurrentTask(+r.nvpList_contractProcessId);
            this.setViewOptions(r.nvpList_roleStatus);
          },
          err => {console.log('Error subscribing to role');}
        );
      },
      err => {}
    );

  }

  /**
   * 
   * unsubscribe from the route and the role service
   * 
   */
  public ngOnDestroy() {

    if (this.routeSubscripton !== undefined) {
      this.routeSubscripton.unsubscribe();
    }

    if (this.roleSubscription !== undefined) {
      this.roleSubscription.unsubscribe();
    }
  }

  /**
   * 
   * loads the current task for the role, if there is one
   * 
   */
  private loadCurrentTask(processId: number) {

    this.workflowService.getProcessTasks(processId).subscribe(
      data => {
        console.log(data);
        if (undefined === data[0]) {
          this.validTask = false;
          return;
        }
        this.validTask = true;
        this.currentTask = data[0];
        this.taskId.next(this.currentTask.id);
      },
      err => {
        this.validTask = false;
        console.log(err);
      });

  }

  /**
   * 
   * accessor for taskId as an observable
   * 
   */
  public getTaskId(): Observable<number> {

    return this.taskId.asObservable();

  }

  /**
   * 
   * given the role status sets the view options
   * 
   */
  private setViewOptions(roleStatus: string) {

    console.log('Role status is ' + roleStatus);

    /** setup - role:edit, financials:edit, personals:edit */
    if (roleStatus === 'Set up') {
      this.displayOptions = {role: 'write', financials: 'write', personal: 'write'};
      this.withdrawDisabled = true;
    }

    /** supplier review - role:view, financials:view, personals:view, contact:view, rtw:view */
    if (roleStatus !== 'Set up') {
      this.displayOptions = {role: 'read', financials: 'read', personal: 'read', contact: 'read', rtw: 'read'};
      this.withdrawDisabled = false;
    }

  }

  /**
   * 
   * withdraw the current contract for this role
   * 
   */
  public withdraw() {

    this.withdrawContractDialogRef = this.dialog.open(WithdrawContractDialog);
    this.withdrawContractDialogRef.componentInstance.role = this.role;

  }

  /**
   * 
   * delete the current role position
   * 
   */
  public delete() {

    this.roleDeleteDialogRef = this.dialog.open(RoleDeleteDialog);
    this.roleDeleteDialogRef.componentInstance.role = this.role;

  }

}
