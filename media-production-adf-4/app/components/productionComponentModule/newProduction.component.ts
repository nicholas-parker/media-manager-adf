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
import {ProductionProperties} from './productionProperties';
import {ServicePeriod} from './servicePeriod';

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

  /**
   * 
   * production properties
   * 
   */
  private properties: ProductionProperties;

  /**
   * 
   * production periods
   * 
   */
  private periods: ServicePeriod[];

  constructor(private fb: FormBuilder,
    private service: AlfrescoProductionService,
    private snackBar: MdSnackBar,
    private router: Router) {

    this.productionForm = this.fb.group({

      prod_productionName: '',
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

    /**
     * map form to ProductionProperties
     */
    this.properties = new ProductionProperties();
    this.properties.prod_productionName = this.productionForm.value['prod_productionName'];
    this.properties.prod_productionDescription = this.productionForm.value['prod_productionDescription'];

    this.properties.contract_registeredName = this.productionForm.value['contract_registeredName'];
    this.properties.contract_taxNumber = this.productionForm.value['contract_taxNumber'];
    this.properties.contract_registeredNum = this.productionForm.value['contract_registeredNum'];
    this.properties.contract_formalAddress = this.productionForm.value['contract_formalAddress'];
    this.properties.contract_formalPostCode = this.productionForm.value['contract_formalPostCode'];
    this.properties.contract_orgContactEmail = this.productionForm.value['contract_orgContactEmail'];
    this.properties.contract_orgContactTel = this.productionForm.value['contract_orgContactTel'];

    // Fields not captured in the UI form
    // properties.contract_operatingName = this.productionForm.value['contract_operatingName'];
    // properties.contract_registerOrg = this.productionForm.value['contract_registerOrg'];
    // properties.contract_registerRegion = this.productionForm.value['contract_registerRegion'];
    // properties.prod_productionAddress1 = this.productionForm.value['contract_productionAddress1'];
    // properties.prod_productionAddress2 = this.productionForm.value['contract_productionAddress2'];
    // properties.prod_productionAddress3 = this.productionForm.value['contract_productionAddress3'];
    // properties.prod_productionCountry = this.productionForm.value['contract_productionCountry'];
    // properties.prod_productionPOCode = this.productionForm.value['contract_productionPOCode'];

    /**
     * create the production periods
     */
    this.periods = new Array();

    let preProduction = new ServicePeriod();
    preProduction.contract_serviceName = 'Pre production';
    preProduction.contract_serviceDescription = '';
    preProduction.contract_serviceStart = this.productionForm.value['prod_preProductionStartDate'];
    preProduction.contract_serviceEnd = this.productionForm.value['prod_preProductionEndDate'];
    this.periods.push(preProduction);

    let production = new ServicePeriod();
    production.contract_serviceName = 'Production';
    production.contract_serviceDescription = '';
    production.contract_serviceStart = this.productionForm.value['prod_productionStartDate'];
    production.contract_serviceEnd = this.productionForm.value['prod_productionEndDate'];
    this.periods.push(production);

    let postProduction = new ServicePeriod();
    postProduction.contract_serviceName = 'Post production';
    postProduction.contract_serviceDescription = '';
    postProduction.contract_serviceStart = this.productionForm.value['prod_postProductionStartDate'];
    postProduction.contract_serviceEnd = this.productionForm.value['prod_postProductionEndDate'];
    this.periods.push(postProduction);

    this.snackBar.open('Creating your new production area');
    this.service.createSite(this.properties).subscribe(
      siteName => {

        /*
         * 
         * site created, now create the production periods
         * 
         */
        for (let i = 0; i < this.periods.length; i++) {


          this.service.addProductionPeriod(siteName, this.periods[i]).subscribe(
            ppData => {

              console.log('Added production period ' + this.periods[i].contract_serviceName);


            },
            err => {

              console.log('Error adding production period ');
              console.log(err);

            });
        }

        this.router.navigate(['/production/', this.service.siteInfo.id]);

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
