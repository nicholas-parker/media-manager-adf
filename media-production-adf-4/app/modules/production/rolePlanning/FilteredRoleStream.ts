import {DataSource, CollectionViewer} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Rx';
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
   * an observable on the inbound stream
   * 
   */
  public dataSource: DataSource<Role>;


  /**
   * 
   * the function which identifies if a role matches a category
   * 
   */
  private match(role: Role): boolean {


    console.log(role.nvpList_roleCategory);

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


  public connect(obj): Observable<Role[]> {

    return this.dataSource.connect(obj)
      .map((data: Role[]) => data.filter(this.match, this));

  }


  public disconnect(collectionViewer: CollectionViewer): void {

    this.dataSource.disconnect(collectionViewer);

  }
}
