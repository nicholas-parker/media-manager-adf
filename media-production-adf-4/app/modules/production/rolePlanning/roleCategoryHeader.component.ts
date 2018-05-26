import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Component, OnInit, Input} from '@angular/core';
import {Role} from './role';
import {FilteredRoleStream} from './FilteredRoleStream';
import {MdProgressBarModule, MdDialog, MdDialogRef} from '@angular/material';
import {CategoryRoleDialog} from './categoryRoleDialog.component';
import {RoleMIService} from '../../../components/role/roleMI.service';

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

    this.stats.init(r.connect(null)
      .takeUntil(this.ngUnsubscribe));

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
  public loaded: boolean = true;

  /**
   * 
   * a flag to indicate if the supplied roles are empty or not
   * 
   */
  public get hasRoles(): boolean {

    if (this.stats.roleCount > 0) {
      return true;
    } else {
      return false;
    }

  }

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
  public stats: RoleMIService = new RoleMIService();

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


  /**
   * 
   * resets summary and counters
   * 
   */
  private reset() {


    this.hasRoles = false;

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

