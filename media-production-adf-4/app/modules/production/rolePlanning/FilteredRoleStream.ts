import {DataSource, CollectionViewer} from '@angular/cdk/collections';
import {Observable, BehaviorSubject} from 'rxjs/Rx';
import {Role} from './role';

export class FilteredRoleStream extends DataSource<Role> {

  /**
   * 
   * the name of the category registered
   * 
   */
  public category: string;

  /**
   * 
   * the name of the role type
   * 
   */
  public roleType: string;

  /**
   * 
   * an observable on the inbound stream
   * 
   */
  public dataSource: DataSource<Role>;

  /**
   * 
   * the subject which provides a stream of role counts
   * 
   */
  private counts: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * 
   * returns a filtered role stream via the observable.
   * The role stream is sourced from the data source which must be set up before calling this method
   * The role stream is filtered by roleCategory & roleType
   * 
   */
  public connect(obj): Observable<Role[]> {

    return this.dataSource.connect(obj)
      .map((data: Role[]) => data.filter(this.matchCategory, this))
      .map((data: Role[]) => data.filter(this.matchType, this));

    // .do((data: Role[]) => this.counts.next(data.length));

  }

  public disconnect(collectionViewer: CollectionViewer): void {

    this.dataSource.disconnect(collectionViewer);

  }

  /**
   * 
   * provides a stream of the latest role count from the filter,
   * this source only works when the main connect is called and subscribed to
   * 
   */
  public getCount(): Observable<number> {

    return this.dataSource.connect(null)
      .take(1)
      .map((data: Role[]) => data.filter(this.matchCategory, this))
      .map((data: Role[]) => data.filter(this.matchType, this))
      .map((data: Role[]) => {return data.length;});

  }

  // public getRoleCount(): Observable<number> {
  //
  //  return this.roleCount.asObservable();
  //
  // }

  /**
   * 
   * the function which identifies if a role matches a category
   * 
   */
  private matchCategory(role: Role): boolean {


    if (undefined === this.category) {
      return true;
    }

    if ((undefined === role) || (null === role) || (undefined === this)) {
      return false;
    }

    if (undefined === role.nvpList_roleCategory) {
      return false;
    }

    if (role.nvpList_roleCategory === this.category) {
      return true;
    } else {
      return false;
    }

  }


  /**
   * 
   * the function which matches a role type
   * 
   */
  private matchType(role: Role): boolean {


    if (undefined === this.roleType) {
      return true;
    }

    if ((undefined === role) || (null === role) || (undefined === this)) {
      return false;
    }

    if (undefined === role.nvpList_roleType) {
      return false;
    }

    if (role.nvpList_roleType === this.roleType) {
      return true;
    } else {
      return false;
    }

  }



}
