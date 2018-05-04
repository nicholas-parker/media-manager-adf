import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Production} from './production';
import {AlfrescoProductionService} from './alfrescoProduction.service';
import {ProductionProperties} from './productionProperties';

@Injectable()
export class ProductionContext {

  private producion: BehaviorSubject<Production> = new BehaviorSubject<Production>(null);
  private properties: BehaviorSubject<ProductionProperties> = new BehaviorSubject<ProductionProperties>(null);

  constructor(private productionService: AlfrescoProductionService) {

  }

  public getProduction(): Observable<Production> {

    return this.producion.asObservable();

  }

  public getProperties(): Observable<ProductionProperties> {

    return this.properties.asObservable();

  }

  public setProduction(production: Production) {

    this.productionService.getProductionProperties(production.guid)
      .subscribe((properties: ProductionProperties) => {
        this.properties.next(properties);
        this.producion.next(production);
      },
      err => {console.log(err);});


  }

}
