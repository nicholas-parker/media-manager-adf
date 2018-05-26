/**
 * 
 * This service provides the default roles which are applied to a production at setup
 * Also provide functions to manage the default roles for each production type
 * 
 */
import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject, Subject} from 'rxjs/Rx';
import {ProductDefaultRoleList} from './productDefaultRoleList';
import {DefaultRole} from '../../../modules/production/defaultRoles/defaultRole';
import {DataSource, CollectionViewer} from '@angular/cdk/collections';

import {BackendDummy} from './backendDummy';


@Injectable()
export class MasterRoleService extends DataSource<DefaultRole> {


  /**
   * 
   * 
   */
  private masterDefaultRoles: BehaviorSubject<DefaultRole[]> = new BehaviorSubject<DefaultRole[]>([]);

  /**
   * 
   * dummy back end service, replace eventually by mongo
   * 
   */
  private service: BackendDummy = new BackendDummy();

  /**
   * 
   * a subject which triggers unsubscription
   * 
   */
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  /**
   * 
   * subscribe to default roles from store and update the subject
   * 
   */
  constructor() {
    super();
    this.getProductionDefaultRoles(null, null)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((roles: DefaultRole[]) => {
        this.masterDefaultRoles.next(roles);
      },
      err => {console.log(err);});
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


  public connect(collectionViewer: CollectionViewer): Observable<DefaultRole[]> {

    return this.masterDefaultRoles.asObservable();

  }

  public disconnect(collectionViewer: CollectionViewer): void {
    // NO OP
  }

  public getProductionDefaultRoles(productClass: string, product): Observable<DefaultRole[]> {

    return this.service.getLists().
      map((data: ProductDefaultRoleList[]) => {
        return data.map(d => {return d.defaultRoles;});
      })
      .map((roleArray: DefaultRole[][]) => {
        let result = new Array();
        roleArray.forEach(r => {result = result.concat(r);});
        return result;
      });

  }

}
