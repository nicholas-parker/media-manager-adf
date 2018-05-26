import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ActivatedRoute} from '@angular/router';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {AlfrescoService} from '../alfrescoWorkflow/alfresco.service';

import {Production} from './production';
import {ProductionProperties} from './productionProperties';


@Injectable()
export class ProductionContext {


  private properties: BehaviorSubject<ProductionProperties> = new BehaviorSubject<ProductionProperties>(null);
  private production: BehaviorSubject<Production> = new BehaviorSubject<Production>(null);

  /**
   * 
   * subject that triggers unsubscriptions, triggered by noOnDestroy
   * 
   */
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  constructor(private alfrescoApi: AlfrescoApiService,
    private alfrescoService: AlfrescoService,
    private route: ActivatedRoute) {
  }

  /** 
   * assumes we are always in a production....naughty
   * 
   * gets the params from the route
   * gets the site parameters using the id from the route
   * maps the parameters into a ProductionProperties object
   * updates the subject
   * 
   */
  public setProductionId(id: string) {

    let path = 'api/-default-/public/alfresco/versions/1/sites/' + id;
    this.alfrescoService.get(path)
      .takeUntil(this.ngUnsubscribe)
      .flatMap((production: Production) => {
        this.production.next(production);
        return Observable.fromPromise(this.alfrescoApi.nodesApi.getNode(production.guid));
      })
      .map((data: any) => {
        return this.mapToObject(data.entry.properties, new ProductionProperties());
      })
      .subscribe((properties: ProductionProperties) => {
        this.properties.next(properties);
      },
      err => {console.log(err);}
      );


  }

  /**
   * 
   * trigger unsubscribes when class is destroyed
   * 
   */
  public ngOnDestroy() {

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  public getProduction(): Observable<Production> {

    return this.production.asObservable()
      .flatMap((production: Production) => {
        return production ? Observable.of(production) : Observable.empty();
      });

  }

  public getProperties(): Observable<ProductionProperties> {

    return this.properties.asObservable()
      .flatMap((production: ProductionProperties) => {
        return production ? Observable.of(production) : Observable.empty();
      });

  }



  /**
   * 
   * take a source object and map the values of properties which exist
   * in the source and target into the target
   * 
   */
  private mapToObject(source: any, target: any) {

    let names = Object.getOwnPropertyNames(target);
    let result = {};
    for (let i = 0; i < names.length; i++) {

      let sourceName = names[i].replace('_', ':');
      if (source.hasOwnProperty(sourceName)) {
        result[names[i]] = source[sourceName];
      }

    }
    return result;

  }


}
