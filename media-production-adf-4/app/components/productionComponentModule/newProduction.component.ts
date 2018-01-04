import {Component, EventEmitter, OnInit} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {DataSource} from '@angular/cdk/collections';
import {MdTabsModule, MdSelectModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {LogService} from 'ng2-alfresco-core';
import {BehaviorSubject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {Production} from './production';
import {AlfrescoProductionService} from './alfrescoProduction.service';
import {Router} from '@angular/router';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/fromPromise';


@Component({
  selector: 'new-production',
  templateUrl: './newProduction.component.html',
  styleUrls: ['./newProduction.component.css'],
  providers: [AlfrescoProductionService]
})
export class NewProductionComponent implements OnInit {

  /**
   * 
   * the new production form
   * 
   */
  private productionForm: FormGroup;

  /**
   * 
   * the selected product code
   * 
   */
  private productCode: string;

  /**
   * 
   * the new production site short code, set when site created
   * 
   */
  private siteShortName: string;

  /**
   * 
   * a flag to indicate if this production support pre-production
   * 
   */
  private preProduction = true;

  /**
   * 
   * a flag to indicate if this production supports post-production
   * 
   */
  private postProduction = true;

  /**
   * 
   * the selected tab
   * 
   */
  private selectedTab;

  constructor(private fb: FormBuilder,
    private service: AlfrescoProductionService,
    private snackBar: MdSnackBar,
    private router: Router) {

    this.productionForm = this.fb.group({

      prod_productionTitle: '',
      prod_productionDescription: '',

      prod_preProductionStartDate: null,
      prod_preProductionEndDate: null,
      prod_productionStartDate: null,
      prod_productionEndDate: null,
      prod_postProductionStartDate: null,
      prod_postProductionEndDate: null,

      contract_registeredName: '',
      contract_taxNumber: '',
      contract_registeredNum: '',
      contract_formalAddress: '',
      contract_formalPostCode: '',
      contract_orgContactEmail: '',
      contract_orgContactTel: ''

      // terms: ''

    });

  }

  /**
   * 
   * initialise component
   * 
   */
  public ngOnInit() {

  }

  /**
   * 
   * clean up
   * 
   */
  public onDestroy() {

  }

  /**
   * 
   * capture the product the user has selected
   * 
   */
  setProduct(productionType: string) {

    this.productCode = productionType;
    this.selectedTab = 1;

  }

  /**
   * 
   * set the selected tab
   * 
   */
  public setTab(tabIndex) {

    console.log(tabIndex);
    this.selectedTab = tabIndex;

  }

  /**
   * 
   * call the remote service to create the production
   * 
   */
  public createProduction() {

    console.log(this.productionForm);

    this.snackBar.open('Creating your new production area');
    this.service.createSite(this.productionForm.value.prod_productionTitle,
      this.productionForm.value.prod_productionTitle,
      null).subscribe(
      data => {

        console.log(data);
        this.snackBar.open('Applying product settings');

        /*
         * 
         * site created, now apply the product settings
         * 
         */
        this.siteShortName = data.entry.id;
        this.service.applyProduction(this.siteShortName, this.productCode).subscribe(
          prodData => {

            /**
             * 
             * site created, product settings applied, add aspects
             * 
             */
            this.snackBar.open('Production area created');
            this.router.navigate(['/production', this.siteShortName]);

          },
          prodErr => {

            /**
             * 
             * error applying the product settings
             * 
             */
            this.snackBar.open('Unable to apply the product settings');

          }
        );

      },

      err => {

        /**
         * 
         * error creating the site
         * 
         */
        console.log(err);
        this.snackBar.open('Unable to create your production area', '{ duration: 500}');

      });

  }


}
