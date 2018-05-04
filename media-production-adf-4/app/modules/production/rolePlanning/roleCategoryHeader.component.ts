import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Component, OnInit, Input} from '@angular/core';
import {Role} from './role';
import {FilteredRoleStream} from './FilteredRoleStream';
import {MdProgressBarModule, MdDialog, MdDialogRef} from '@angular/material';
import {CategoryRoleDialog} from './categoryRoleDialog.component';

@Component({
  selector: 'role-category-header',
  templateUrl: './roleCategoryHeader.component.html',
  styleUrls: ['./roleCategoryHeader.component.css']
})
export class RoleCategoryHeaderComponent implements OnInit {

  /**
   * 
   * an observable of role array
   *  
   */
  @Input()
  public set roles(r: FilteredRoleStream) {

    this.init(r);

  }
  /**
   * 
   * the name of the role category
   * 
   */
  @Input()
  public category: string;

  /**
   * 
   * a reference to the category role model dialog
   * 
   */
  public categoryRoleDialogRef: MdDialogRef<CategoryRoleDialog>;

  /**
   * 
   * a flag to indicate if we have received our first stream of roles
   * 
   */
  public loaded: boolean = false;

  /**
   * 
   * a flag to indicate if the supplied roles are empty or not
   * 
   */
  public hasRoles: boolean = false;

  /**
   * 
   * total number of roles
   * 
   */
  public roleCount: number = 0;

  /**
   * 
   * roles which are being processed
   * 
   */
  public processing: number = 0;

  /**
   * 
   * roles which are accepted
   * 
   */
  public accepted: number = 0;

  /**
   * 
   * roles which are completed
   * 
   */
  public completed: number = 0;

  /**
   * 
   * percentage of roles complete
   * 
   */
  public percentageComplete: number = 0;

  /**
   * 
   * summary of role status counts
   * 
   */
  public summary: {Set_up: 0, Supplier_review: 0, Accepted: 0, Declined: 0, Approved: 0, Completed: 0};

  /**
   * 
   * a subject which is triggered to unsubuscribe
   * 
   */
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  constructor(private dialog: MdDialog) {

  }

  ngOnInit(): void {
    // NO OP
  }

  /**
   * 
   * onDestroy unsubscribes the subscription
   * 
   */
  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private init(r: FilteredRoleStream): void {

    r.connect(null)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      roles => {
        this.loaded = true;
        this.reset();
        roles.forEach(this.updateSummary, this);
        this.roleCount = roles.length;
        if (this.roleCount > 0) {
          this.hasRoles = true;
        } else {
          this.hasRoles = false;
        }
      },
      err => {});

  }

  private updateSummary(role: Role): void {

    let status = role.nvpList_roleStatus.replace(' ', '_');
    if (undefined === this.summary[status]) {
      this.summary[status] = 1;
    } else {
      this.summary[status] = this.summary[status] + 1;
    }

  }

  /**
   * 
   * resets summary and counters
   * 
   */
  private reset() {

    this.summary = {Set_up: 0, Supplier_review: 0, Accepted: 0, Declined: 0, Approved: 0, Completed: 0};
    this.hasRoles = false;
    this.roleCount = 0;
    this.processing = 0;
    this.accepted = 0;
    this.completed = 0;
    this.percentageComplete = 0;

  }

  /**
   * 
   * open the modal so we can add a new crew member to this category
   * 
   */
  public add(category: string): void {

    this.categoryRoleDialogRef = this.dialog.open(CategoryRoleDialog);
    this.categoryRoleDialogRef.componentInstance.category = category;

  }
}

