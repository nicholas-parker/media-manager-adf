import {Observable} from 'rxjs/Observable';
import {Component, OnInit, ViewChild, EventEmitter, Output, Input} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {CdkTableModule} from '@angular/cdk/table';
import {MdTableModule, MdTable, MdSort, MdButton, MdDialog, MdMenuModule, MdIcon, MdSnackBar} from '@angular/material';
import {Role} from './role';
import {RoleStatus} from './rolestatus';
import {RoleService} from './role.service';

import {AlfrescoWorkflowService} from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {ProcessTaskAssigneeComponent} from '../../../components/alfrescoWorkflow/processComponent/processTaskAssignee.component';
import {CurrentProcessTaskComponent} from '../../../components/alfrescoWorkflow/processComponent/currentProcessTask.component';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['role-list.component.css']
})

export class RoleListComponent implements OnInit {

  /**
   * table management items, status removed till we  work out how to trap HTTP 500 errors in Observable
   */
  displayedColumns = ['name', 'startDate', 'endDate', 'status', 'currentTask', 'budget', 'totalBudget', 'actual', 'chargeCode', 'PAYEStatus', 'menu'];
  @ViewChild(MdSort) sort: MdSort;


  /**
   * event and interface items
   */
  public role: Role;
  @Output() editEvent: EventEmitter<Role> = new EventEmitter<Role>();
  @Input() siteId;
  @ViewChild(MdTable) table: MdTable<Role>;

  constructor(
    public roleData: RoleService,
    public workflowService: AlfrescoWorkflowService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MdSnackBar
  ) {}

  ngOnInit() {

    console.log('Role list,  role service context is ' + this.roleData.getContext());

  }

  isSelected(role: Role) {return role.sys_nodedbid === this.role.sys_nodedbid;}

  /**
   * refresh the role list. Called by parent container if the list has been updated
   */
  public refresh() {
    this.roleData.refresh();
  }

  /**
   * User has selected to view the workflow associated with the role
   */
  public onWorkflow(role: Role) {
    this.role = role;
    console.log(role);
  }


  /**
   * User has clicked delete from the list context menu
   */
  public onWithdraw(role: Role) {
    console.log('withdraw...');
    this.role = role;

    this.roleData.delete(role).subscribe(data => {this.snackBar.open('Offer withdrawn', '', {duration: 2000});},
      err => {this.snackBar.open('Error withdrawing offer', err, {duration: 2000});});

    // this.workflowService.deleteProcess()
  }

  /**
   * User has clicked edit from the list context menu
   * emit an edit event and the edit component, usually containing a form,
   * will handle the editing of the role object
   * 
   */
  public onEdit(role: Role) {


    /** if role has workflow and status is '' then edit the task... */


    /** if role has no workflow then edit the role entity */



  }

  /**
   * 
   * return true if the given role has been accepted
   * 
   */
  public accepted(role: Role): boolean {

    if (role.nvpList_roleStatus === 'Accepted') {
      return true;
    } else {
      return false;
    }

  }

  /**
   * 
   * returns true if the given role has been declined
   * 
   */
  public declined(role: Role): boolean {

    if (role.nvpList_roleStatus === 'Declined') {
      return true;
    } else {
      return false;
    }

  }

  /**
   * 
   * returns true if the given role is in progress
   * 
   */
  public progress(role: Role): boolean {

    if (role.nvpList_roleStatus === 'Set up') {
      return true;
    } else {
      return false;
    }

  }

  /** the person the current workflow role is assigned to */
  public assignedTo(role: Role) {

  }


}

