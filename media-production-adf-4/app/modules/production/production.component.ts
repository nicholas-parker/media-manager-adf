import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AlfrescoProductionService} from '../../components/productionComponentModule/alfrescoProduction.service';
import {Production} from '../../components/productionComponentModule/production';
import {ProductionContext} from '../../components/productionComponentModule/productionContext';
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

  /**
   * 
   * a flag which indicates if this production has any crew members
   * 
   */
  public hasCrew: boolean = false;

  constructor(private route: ActivatedRoute,
    private service: AlfrescoProductionService,
    private context: ProductionContext,
    private defaultRoleService: DefaultRoleService,
    private contractTemplateService: ContractTemplateService,
    private roleService: RoleService) {

  }

  /**
   * 
   * subscribe to the routing to get the production Id from the route,
   * when we have the productionId set the context
   * 
   */
  public ngOnInit() {

    this.route.params
      .map((params: any[]) => {
        if (undefined !== params['id']) {

          this.context.setProductionId(params['id']);
          this.defaultRoleService.setContext(params['id']);
          this.roleService.setContext(params['id']);
          this.contractTemplateService.setContext(params['id']);

        } else {
          return Observable.empty();
        }
      })
      .flatMap(d => {
        return this.context.getProduction();
      })
      .subscribe(
      (production: Production) => {
        this.production = production;
        this.loaded = true;
      },
      err => {console.log(err);});

  }


  public gotProduction(res) {

    if (null != res) {

      /** now we know our production context set the context in the service providers */
      console.log('Production component setting context in services...');
    }

  }

  public gotProductionError(err) {
    this.production = null;
    this.loaded = false;
  }

}
