import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AlfrescoProductionService} from '../../components/productionComponentModule/alfrescoProduction.service';
import {Production} from '../../components/productionComponentModule/production';
import {ContractTemplateService} from './defaultRoles/contractTemplate.service';
import {DefaultRoleService} from './defaultRoles/defaultRole.service';
import {RoleService} from './rolePlanning/role.service';
import {TaskListComponent} from '../../components/alfrescoWorkflow/taskList.component';

@Component({
  selector: 'production-manager',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.css']
})
export class ProductionComponent implements OnInit {

  public productionId: Observable<string>;
  public production: Production;
  public loaded = false;

  constructor(private route: ActivatedRoute,
    private service: AlfrescoProductionService,
    private defaultRoleService: DefaultRoleService,
    private contractTemplateService: ContractTemplateService,
    private roleService: RoleService) {

  }

  public ngOnInit() {

    this.productionId = this.route.params.map(p => p.id);
    this.productionId.subscribe(id => this.getProduction(id));

  }

  private getProduction(id) {

    let obs: Observable<Production> = this.service.getPrduction(id);
    obs.subscribe(res => this.gotProduction(res),
      err => this.gotProductionError(err));

  }

  public gotProduction(res) {

    this.production = res;
    this.loaded = true;

    /** now we know our production context set the context in the service providers */
    console.log('Production component setting context in services...');
    this.defaultRoleService.setContext(this.production.id);
    this.roleService.setContext(this.production.id);
    this.contractTemplateService.setContext(this.production.id);

  }

  public gotProductionError(err) {
    this.production = null;
    this.loaded = false;
  }

}
