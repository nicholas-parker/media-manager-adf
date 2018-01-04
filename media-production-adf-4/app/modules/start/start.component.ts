import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MdDialog, MdDialogRef, MdDialogContent } from '@angular/material';
import { MyProductionsBigComponent } from '../../components/productionComponentModule/myProductionsBig.component';


@Component({
  templateUrl : './start.component.html'
}) 
export class StartComponent implements OnInit {
  
  private productions: MyProductionsBigComponent;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    
    // this.roles = this.route.paramMap
    //  .switchMap((params: ParamMap) => {
    //    // (+) before `params.get()` turns the string into a number
    //    this.selectedId = params.get('id');
    //    return this.service.getDefaultRoles();
    //  });
    
    
    
  }

  
  /**
   * 
   * User has asked to create a new production
   * 
   */
  onNewProduction() {
    
  }
  
  
}
