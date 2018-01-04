import {AlfRESTList} from '../alfrescoWorkflow/AlfRESTList';
import {Injectable, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {AlfrescoApiService, LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {AlfrescoService} from '../alfrescoWorkflow/alfresco.service';

// Import RxJs required methods
import 'rxjs/Rx';

export class Production {

  public role;
  public visibility;
  public guid;
  public id;
  public preset;
  public title;

}

@Injectable()
export class AlfrescoProductionService extends AlfrescoService {

  private productions: Production[];

  private siteShortName: string;

  constructor(private _apiService: AlfrescoApiService,
    private _logService: LogService,
    private _http: Http) {
    super(_apiService, _logService, _http);
  }

  /**
   * 
   * given the production id (shortName) returns the full data model
   * This can be extended to provide containers and members
   * 
   */
  public getPrduction(id): Observable<Production> {

    this.siteShortName = id;
    let path = 'api/-default-/public/alfresco/versions/1/sites/' + id;
    let obs: Observable<Production> = this.get(path);
    return obs;

  }

  /**
   * 
   * return the current site short name
   * 
   */
  public getSiteShortName() {

    return this.siteShortName;

  }

  /**
   * 
   * returns an Observable which provides a list of productions which
   * the current user is a member of
   * 
   */
  public getProductions(): Observable<Production[]> {

    let path = 'api/-default-/public/alfresco/versions/1/people/-me-/sites';
    let params = 'where=(visibility%3DPRIVATE)';
    let obs: Observable<Production[]> = this.getList(path, params);
    return obs;

  }

  /**
   * 
   * create a new site
   * 
   */
  createSite(siteName: string, siteDescription: string, productCode: string): Observable<any> {

    let apiServiceInstance = this._apiService.getInstance();

    let opts = {
      'skipConfiguration': false, // {Boolean} Flag to indicate whether the Share-specific (surf) configuration files for the site should not be created.
      'skipAddToFavorites': false // {Boolean} Flag to indicate whether the site should not be added to the user's site favorites.
    };

    let siteBody = new apiServiceInstance.core.SiteBody(); // {SiteBody} The site details
    siteBody.description = siteDescription;
    siteBody.title = siteName;
    siteBody.visibility = 'PRIVATE';

    return Observable.fromPromise(apiServiceInstance.core.sitesApi.createSite(siteBody, opts));

  }

  /**
   * 
   * add the product features to a site, called after createSite
   * 
   */
  applyProduction(siteName: string, productCode: string): Observable<any> {

    let path = 's/mwt/production/setup/' + siteName + '/' + productCode;
    let obs: Observable<Production> = this.get(path);
    return obs;
  }

  /**
   * 
   * delete a site
   * 
   */
  deleteSite(siteName: string): Observable<any> {

    let apiServiceInstance = this._apiService.getInstance();
    return Observable.fromPromise(apiServiceInstance.core.sitesApi.deleteSite(siteName));

  }


}
