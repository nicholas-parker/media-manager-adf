import { Component, EventEmitter, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { DataSource } from '@angular/cdk/collections';
import { MdList } from '@angular/material';
import { LogService } from 'ng2-alfresco-core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { Production } from './production';
import { AlfrescoProductionService } from './alfrescoProduction.service';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Component({
  selector: 'myproductions-big-list',
  templateUrl : './myProductionsBig.component.html',
  styleUrls: ['./myProductionsBig.component.css'],
  providers: [ AlfrescoProductionService ]
})

export class MyProductionsBigComponent implements OnInit {

  public productions: Observable<Production[]>;
  
  constructor( private productionService: AlfrescoProductionService) {
    
  }
  
  public ngOnInit() {
  
    this.productions = this.productionService.getProductions();
    
  }
}
