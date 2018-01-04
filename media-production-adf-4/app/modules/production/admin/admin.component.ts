import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {MdSnackBar} from '@angular/material';
import {LogService} from 'ng2-alfresco-core';
import {Observable, Subscription} from 'rxjs/Rx';
import {AlfrescoProductionService} from '../../../components/productionComponentModule/alfrescoProduction.service';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/fromPromise';


@Component({
  selector: 'admin-production',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [AlfrescoProductionService]
})
export class AdminComponent {

  /**
   * 
   * short name of the site we are administering
   * 
   */
  private siteName: string;

  /**
   * 
   * a subcription to get the route parameters
   * 
   */
  private routeParamSub: Subscription;

  constructor(private service: AlfrescoProductionService,
    private snackBar: MdSnackBar,
    private route: ActivatedRoute,
    private router: Router) {
  }

  /**
   * 
   * setup site name
   * 
   */
  public ngOnInit() {

    this.routeParamSub = this.route.params.subscribe(params => {
      this.siteName = params['id'];
    });
  }

  /**
   * 
   * remove subscription
   * 
   */
  public ngOnDestroy() {

    this.routeParamSub.unsubscribe();

  }
  /**
   * 
   * delete the current site and its contents, cant be undone
   * 
   */
  public delete() {

    if (this.siteName == null || this.siteName === '') {
      return;
    }

    this.service.deleteSite(this.siteName).subscribe(
      data => {
        console.log('Deleted site ' + this.siteName);
        this.snackBar.open('Site deleted');
        this.router.navigate(['/member']);
      },
      err => {
        console.log(err);
        this.snackBar.open('Site could not be deleted');
      }
    );

  }

}
