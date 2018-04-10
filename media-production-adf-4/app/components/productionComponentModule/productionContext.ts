import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Production} from './production';

@Injectable()
export class ProductionContext {

  private producion: BehaviorSubject<Production> = new BehaviorSubject<Production>(null);

  public getProduction(): Observable<Production> {

    return this.producion.asObservable();
  }

  public setProduction(production: Production) {

    this.producion.next(production);

  }

}
