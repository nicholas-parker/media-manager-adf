import { Observable } from 'rxjs/Observable';
import { Component, OnInit, ViewChild, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MdTableModule, MdSnackBar } from '@angular/material';
import { MdTable } from '@angular/material';
import { MdSort } from '@angular/material';
import { DefaultRole }  from './defaultRole';
import { DefaultRoleService } from './defaultRole.service';
import { BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'defaultrole-list',
  templateUrl : './defaultRole-list.component.html'
})

export class DefaultRoleListComponent implements OnInit {
  
  /**
   * table management items
   */
  displayedColumns = ['name', 'paye', 'budget',,'chargeCode', 'deliverable', 'menu'];
  @ViewChild(MdSort) sort: MdSort;
    
  
  /**
   * event and interface items
   */
  private roleData: DefaultRoleService | null;
  public defaultRole: DefaultRole;
  @Output() editEvent: EventEmitter<DefaultRole> = new EventEmitter<DefaultRole>();
  @Input() siteId;
  @ViewChild(MdTable) table: MdTable<DefaultRole>;
  
  constructor(
    private data: DefaultRoleService,
    private route: ActivatedRoute,
    private router: Router, 
    private changeDetector: ChangeDetectorRef,
    private snackbar: MdSnackBar
  ) {}

  ngOnInit() {
    
    console.log('DFRole list, service context is ' + this.data.getContext());
  
  }

  isSelected(defaultRole: DefaultRole) { return defaultRole.sys_nodedbid === this.defaultRole.sys_nodedbid; }

  
  /**
   * User has selected a role in the list, has same action as edit
   */
  onSelect(defaultRole: DefaultRole) {
    this.defaultRole = defaultRole;
    this.onEdit(this.defaultRole); 
  }
  
  
  /**
   * User has clicked edit from the list context menu
   */
  onEdit(defaultRole: DefaultRole) {
    this.editEvent.emit(defaultRole);
  }
  
  /**
   * 
   * delete menu option triggers this action
   * 
   */
  public onDelete(defaultRole: DefaultRole) {
   
   this.data.deleteRole(defaultRole).subscribe(
      res => {this.snackbar.open('Crew template deleted', null, { duration: 3000});},
      err => {this.snackbar.open('Unable to delete crew template', err.message, { duration: 3000});});
    
  }
}

