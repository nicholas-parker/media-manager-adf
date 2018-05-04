import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {DataSource, CollectionViewer} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/Rx';

import {Role} from '../../../modules/production/rolePlanning/role';
import {RoleService} from '../../../modules/production/rolePlanning/role.service';
import {FilteredRoleStream} from '../../../modules/production/rolePlanning/FilteredRoleStream';
import {RoleManager} from '../../../modules/production/rolePlanning/roleManager.service';
import {DefaultRole} from '../../../modules/production/defaultRoles/defaultRole';
import {DefaultRoleService} from '../../../modules/production/defaultRoles/defaultRole.service';
import {CrewCategoryRoleSummary} from './crewCategorySummaryItem';
import {NewRoleEvent} from '../../../modules/production/rolePlanning/newRoleEvent';

@Injectable()
export class CrewCategorySummaryService extends DataSource<CrewCategoryRoleSummary> {

  /**
   * 
   * the category name which this instance will get the crew summary data
   * 
   */
  private _category: string;

  public set category(category: string) {

    this._category = category;
    this.subscribe();

  }

  /**
   * 
   * a list of default roles for this category
   * 
   */
  public types: DefaultRole[];

  /**
   * 
   * subject which will give the UI the list of CrewCateogrySummaryItems to display
   * 
   */
  private categoryItems: BehaviorSubject<CrewCategoryRoleSummary[]> = new BehaviorSubject<CrewCategoryRoleSummary[]>([]);

  /**
   * 
   * a subject which emits new role create events to the user of the service
   * 
   */
  private newRoleEventStream: Subject<NewRoleEvent> = new Subject<NewRoleEvent>();
  public get newRoleEvents(): Observable<NewRoleEvent> {

    return this.newRoleEventStream.asObservable();

  }

  /**
   * 
   * a subject which triggers unsubscription
   * 
   */
  private ngUnsubscribe: Subject<any> = new Subject<any>();


  constructor(
    private defaultRoleService: DefaultRoleService,
    private roleService: RoleService,
    private roleManager: RoleManager) {
    super();
  }

  /**
   * 
   * category summary data available as an observable
   * 
   */
  public connect(obj): Observable<CrewCategoryRoleSummary[]> {

    return this.categoryItems.asObservable();

  }

  public disconnect(collectionViewer: CollectionViewer): void {
    // NO OP
  }

  /**
   * 
   * sets the headcount of the given role types for the production
   * headcount can only be reduced if role status is still at setup
   * 
   * headcount is a name:value object where name is the role type and value is the headcount
   * 
   */
  public setHeadcount(headcount: any): void {

    let newRoles: NewRoleEvent[] = [];
    let addCrew: any = {};
    let deleteCrew: any = {};

    /** calculate the difference between new value and existing */
    Object.keys(headcount).forEach(key => {

      let summary = this.categoryItems.value.filter((s: CrewCategoryRoleSummary) => {return s.roleName === key;});
      let movement = headcount[key] - summary[0].roleCount;

      /** add new roles, one by one */
      if (movement > 0) {

        while (movement > 0) {

          let newRoleName = key + ' ' + (+summary[0].roleCount + movement);

          this.roleManager.createFromDefault(key, newRoleName).subscribe(
            (event: NewRoleEvent) => {
              console.log('createFromDefault subscription result ');
              console.log(event);
              this.newRoleEventStream.next(event);
            },
            err => console.log(err)
          );
          movement--;
        }

      }

      /** reduce each role, one by one.  Only remove roles that are at setup, alert if can't delete enough */
      if (movement < 0) {

      }

    });
    // end of for each


  }

  /**
   * 
   * trigger the unsubscriptions
   * 
   */
  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * 
   * subscribes to the data services, called once cateogry is set
   * 
   */
  private subscribe() {

    /**
     * 
     * subscribe to the default roles for this category
     * 
     */
    this.defaultRoleService.connect(null)
      .takeUntil(this.ngUnsubscribe)
      .map((defaults: DefaultRole[]) => {return defaults.filter(this.matchCategory, this);})
      .subscribe(
      (defaults: DefaultRole[]) => {
        this.categoryItems.next(this.buildSummary(defaults));
      });


  }

  /**
   * 
   * takes a defaultRole and returns true if it matches the category
   * 
   */
  private matchCategory(defaultRole: DefaultRole): boolean {

    if (undefined === this._category) {return false;}

    if (null === defaultRole) {return false;}
    if (undefined === defaultRole.nvpList_typeCategory) {return false;}
    if (defaultRole.nvpList_typeCategory === this._category) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 
   * builds the summary for each default role
   * 
   */
  private buildSummary(defaults: DefaultRole[]): CrewCategoryRoleSummary[] {

    let items: CrewCategoryRoleSummary[] = [];
    let roles: FilteredRoleStream = new FilteredRoleStream();
    roles.category = this.category;
    roles.dataSource = this.roleService;


    if ((undefined === defaults) || (undefined === roles)) {
      return null;
    }

    defaults.forEach((d: DefaultRole) => {

      let item = new CrewCategoryRoleSummary();
      item.roleName = d.nvpList_typeName;
      item.category = this._category;
      item.currency = d.nvpList_typeCurrency;
      item.roleBudgetMin = d.nvpList_typeBudgetMin;
      item.roleBudgetMax = d.nvpList_typeBudgetMax;
      item.ratePeriod = d.nvpList_typeRatePeriod;
      item.contractTemplateName = d.nvpList_typeContractTemplate;

      roles.roleType = d.nvpList_typeName;
      roles.connect(null)
        .subscribe((r: Role[]) => {
          item.roleCount = r.length;
          items.push(item);
        });

    });

    return items;

  }


}
