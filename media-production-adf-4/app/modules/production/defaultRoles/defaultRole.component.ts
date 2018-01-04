import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MdDialog, MdDialogRef, MdDialogContent } from '@angular/material';

import { DefaultRole }  from './defaultRole';
import { DefaultRoleService } from './defaultRole.service';
import { DefaultRoleListComponent } from './defaultRole-list.component';
import { DefaultRoleFormComponent } from './defaultRole-form.component';

@Component({
  templateUrl : './defaultRole.component.html',
  providers: [ MdDialog ],
  styleUrls: ['../../../standard.css']
}) 
export class DefaultRoleComponent implements OnInit {
  
  public roles: Observable<DefaultRole[]>;
  
  @Output() siteId: string;
  private selectedId: string;
  private defaultRole: DefaultRole;
  private list: DefaultRoleListComponent;
  private dialogRef: MdDialogRef<DefaultRoleFormComponent>;
  
  constructor(
    public service: DefaultRoleService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MdDialog
  ) {}

  public ngOnInit() {
    
  //  let obs: Observable<any> = this.route.params.map( p => p.id);
  //  obs.subscribe( id => { this.siteId = id;
  //                         this.service.setSiteId(id); } );
    
    
  }

  onNew() {
    this._openEditDialog(null);
  }
  
  public onEdit(defaultRole: DefaultRole) {
    console.log('Parent item'  + defaultRole.nvpList_typeName);
    this._openEditDialog(defaultRole);
  }
  
  onDelete() {
    
  }
  
  onSave() {
    let result: Observable<any> = this.service.writeRole(this.defaultRole);
  }
  
  onSaveComplete() {
    
  }
  
  onSaveFail() {
    
  }
  
  private _openEditDialog(defaultRole: DefaultRole) {
    this.dialogRef = this.dialog.open(DefaultRoleFormComponent, {data : {defaultRole}});
    if(null != defaultRole) {
      this.dialogRef.componentInstance.SetDefaultRole(defaultRole); }
  }
  
}
