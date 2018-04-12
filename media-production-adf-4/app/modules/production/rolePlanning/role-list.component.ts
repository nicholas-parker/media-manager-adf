import {Observable} from 'rxjs/Observable';
import {Component, OnInit, ViewChild, EventEmitter, Output, Input} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {CdkTableModule} from '@angular/cdk/table';
import {MdTableModule, MdTable, MdSort, MdButton, MdDialog, MdMenuModule, MdIcon, MdSnackBar, MdDialogRef, MdHeaderRow, MdRow, MdExpansionModule} from '@angular/material';
import {Role} from './role';
import {RoleStatus} from './rolestatus';
import {DefaultRoleService} from './../defaultRoles/defaultRole.service';
import {FilteredRoleStream} from './FilteredRoleStream';
import {RoleService} from './role.service';
import {RoleTagDialog} from './roleTagDialog.component';
import {RoleFilterDialog} from './roleFilterDialog.component';
import {RoleFilter} from './roleFilter';
import {CreateRoleComponent} from './createRole.component';
import {RoleDeleteDialog} from './roleDeleteDialog.component';
import {WithdrawContractDialog} from './withdrawContractDialog.component';
import {RoleCategoryHeaderComponent} from './roleCategoryHeader.component';
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
  planningColumns = ['name', 'tags', 'startDate', 'endDate', 'status', 'currentTask', 'totalBudget', 'menu'];
  financeColumns = ['name', 'tags', 'budget', 'actual', 'variance', 'chargeCode', 'PAYEStatus', 'menu'];
  financeView = false;
  managementView = true;

  displayedColumns = [];
  @ViewChild(MdSort) sort: MdSort;
  @ViewChild(MdTable) table: MdTable<Role>;
  @ViewChild(MdHeaderRow) header: MdHeaderRow;
  @ViewChild(MdRow) rows: MdRow;

  /**
   * event and interface items
   */
  public role: Role;
  @Output() editEvent: EventEmitter<Role> = new EventEmitter<Role>();
  @Input() siteId;


  /**
   * 
   * role tag dialog
   * 
   */
  public roleTagDialogRef: MdDialogRef<RoleTagDialog>;

  /**
   * 
   * role filter dialog
   * 
   */
  public roleFilterDialogRef: MdDialogRef<RoleFilterDialog>;

  /**
   * 
   * role detail dialog
   * 
   */
  public roleDetailDialogRef: MdDialogRef<CreateRoleComponent>;

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

  /**
   * 
   * the filter applied to the role list
   * 
   */
  public roleFilter: RoleFilter = null;

  /**
   * a collection of FilteredRoleStream, each category table uses a filtered role stream
   * @deprecated
   * 
   */
  public streams: FilteredRoleStream[];

  /**
   * 
   */
  public get categories(): Observable<string[]> {

    return this.defaultRoleService.getCategories();

  }

  constructor(
    public defaultRoleService: DefaultRoleService,
    public roleData: RoleService,
    public workflowService: AlfrescoWorkflowService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MdSnackBar,
    private dialog: MdDialog
  ) {

    this.displayedColumns = this.planningColumns;
    this.managementView = true;

  }

  ngOnInit() {
  }

  /**
   * 
   * returns an observable for the roles in the given category
   * 
   */
  public categoryRoles(category: string): FilteredRoleStream {

    let stream: FilteredRoleStream = new FilteredRoleStream();
    stream.category = category;
    stream.dataSource = this.roleData;
    return stream;

  }

  /**
   * 
   * returns true if the provided role is the currently selected role
   * 
   */
  isSelected(role: Role) {

    return role.sys_nodedbid === this.role.sys_nodedbid;

  }

  /**
   * 
   * returns true if the dates have been set for a role,
   * the table row is passed in as the parameter
   * 
   */
  public hasDates(row: Role): boolean {

    if ((row.nvpList_endDate !== undefined)
      &&
      (row.nvpList_endDate !== undefined)) {
      return true;
    }

  }

  /**
   * 
   * refresh the role list. Called by parent container if the list has been updated
   * 
   */
  public refresh() {

    this.roleData.refresh();

  }

  /**
   * 
   * User has selected to delete the role, launch dialog
   * 
   */
  public withdrawRole(role: Role) {

    this.roleDeleteDialogRef = this.dialog.open(RoleDeleteDialog);
    this.roleDeleteDialogRef.componentInstance.role = role;
    // this.roleDeleteDialogRef.afterClosed().subscribe(data => {this.taskData.refresh();});
  }

  /**
   * 
   * User has clicked withdraw offer from the role context menu
   * 
   */
  public withdrawOffer(role: Role) {

    this.withdrawContractDialogRef = this.dialog.open(WithdrawContractDialog);
    this.withdrawContractDialogRef.componentInstance.role = role;

  }

  /**
   * 
   * User has clicked details from the list context menu.
   * Navigate to the roleDetails component
   * 
   */
  public details(role: Role) {

    console.log(role);
    this.router.navigate(['/production/', this.roleData.getContext(), 'roleDetails', role['sys_node-uuid']]);

  }

  /**
   * 
   * open the tag dialog for the given role
   * 
   */
  public tagDialogOpen(role) {

    this.roleTagDialogRef = this.dialog.open(RoleTagDialog);
    this.roleTagDialogRef.componentInstance.setRole(role);

  }

  /**
   * 
   * open the role filter dialog
   * 
   */
  public filterDialogOpen() {

    if (this.roleFilter == null) {
      this.roleFilter = new RoleFilter();
    }

    /**
     * 
     * open filter dialog and pass back existing filter
     * 
     */
    this.roleFilterDialogRef = this.dialog.open(RoleFilterDialog);
    this.roleFilterDialogRef.componentInstance.setFilter(this.roleFilter);

    /**
     * 
     * subscribe to filter updates and apply the filter
     * 
     */
    const filterSub = this.roleFilterDialogRef.componentInstance
      .filterChanged.subscribe(
      filter => {
        this.roleFilter = filter;
        this.roleData.applyFilter(filter);
      });

    /**
     * 
     * subscribe to the close and clean up
     * 
     */
    this.roleFilterDialogRef.afterClosed().subscribe(
      () => {filterSub.unsubscribe();});

  }

  /**
   * 
   * apply the filter to the roles.  This method is called when we
   * receive a new RoleFilter via the filterChanged event from the
   * filter dialog. 
   * 
   */
  private applyFilter(filter: RoleFilter) {

    console.log(filter);

  }

  /**
   * 
   * User hits the create new role button and this method is called,
   * launches the CreateRoleComponent in a dialog
   * 
   */
  onCreateRole() {

    this.roleDetailDialogRef = this.dialog.open(CreateRoleComponent);

  }


  /**
   * 
   * FUNCTIONS WHICH WORK OUT THE CURRENT STATUS OF THE ROLE FROM A UI PERSPECTIVE
   * 
   */

  /**
   * 
   * return true if the given role has been accepted
   * 
   */
  public supplierReview(role: Role): boolean {

    if (role.nvpList_roleStatus === 'Supplier review') {
      return true;
    } else {
      return false;
    }

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
   * returns true if the given role IS FULLY ONBOARDED
   * 
   */
  public approved(role: Role): boolean {

    if (role.nvpList_roleStatus === 'Approved') {
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

  public log(data) {
    console.log(data);
  }

  /**
   * 
   *  UI DISPLAY LOGIC SITS BELOW HERE
   * 
   */

  /**
   * 
   * true if display the budget period range
   * 
   */
  private showBudgetPeriod(role: Role): boolean {

    if (!this.hasDates(role) && role.nvpList_roleStatus === 'Set up') {
      return true;
    } else {
      return false;
    }

  }

  /**
   * 
   * true if display the total budget range
   * 
   */
  private showBudgetTotal(role: Role): boolean {

    if (this.hasDates(role) && role.nvpList_roleStatus === 'Set up') {
      return true;
    } else {
      return false;
    }

  }

  /**
   * 
   * true if display the contract amount
   * 
   */
  private showContractAmount(role: Role): boolean {

    if (this.hasDates(role) && role.nvpList_roleStatus !== 'Set up') {
      return true;
    } else {
      return false;
    }

  }

  /**
   * 
   * set the columns to display
   * 
   */
  public viewChanged(view) {

    /** finance view */
    if (view === 'finance') {

      this.displayedColumns = this.financeColumns;
      this.financeView = true;
      this.managementView = false;
    }

    /** planning view */
    if (view === 'planning') {

      this.displayedColumns = this.planningColumns;
      this.financeView = false;
      this.managementView = true;

    }

  }

  /**
   * 
   * indicates if a withdraw offer menu item should be disabled
   * 
   */
  public withdrawDisabled(role: Role): boolean {

    if (role.nvpList_roleStatus === 'Setup') {
      return true;
    } else {
      return false;
    }

  }

}

