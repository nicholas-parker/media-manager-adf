import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {TaskListComponent} from '../../components/alfrescoWorkflow/taskList.component';
// import {ProductionRolePieCharts} from '../../components/roleCharts/productionRolePieCharts.component';
import {ProductionContext} from '../../components/productionComponentModule/productionContext';
import {Production} from '../../components/productionComponentModule/production';
import {RoleService} from './rolePlanning/role.service';
import {Role} from './rolePlanning/role';

@Component({
  selector: 'production-dashboard',
  templateUrl: './production-dashboard.component.html',
  styleUrls: ['./production.component.css']
})
export class ProductionDashboardComponent implements OnInit {

  /**
   * 
   * id of the current production context
   * 
   */
  public productionId: string;

  /**
   * 
   * flag to indicate if we have roles, used to drive the display of 'add roles card'
   * 
   */
  public hasRoles: boolean = false;

  /**
   * 
   * subject fired on destruction, used to remove subscriptions
   * 
   */
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  constructor(private context: ProductionContext,
    private roleService: RoleService) {


  }

  /**
   * 
   * connect up to the data....
   * 
   */
  public ngOnInit(): void {

    /**
     * 
     * get routing so the dashboard navigation links contain this production id
     *  
     */
    this.context.getProduction()
      .takeUntil(this.ngUnsubscribe)
      .subscribe((prod: Production) => {
        console.log(prod);
        if (null !== prod) {
          this.productionId = prod.id;
        }
      });

    /**
     * 
     * get roles so we can do the logic which controls what we display to the user,
     * for example if no roles then show the 'add roles' card
     * 
     */
    this.roleService.connect(null)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      (roles: Role[]) => {

        /** if we have roles set the flag */
        if (roles.length) {
          this.hasRoles = true;
        } else {
          this.hasRoles = false;
        }

      },
      err => {}
      );
  }

  /**
   * 
   * destroy subscription to context
   * 
   */
  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
