import {Component, EventEmitter, OnInit} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MdSelectModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {LogService} from 'ng2-alfresco-core';
import {Observable, Subscription} from 'rxjs/Rx';
import {Production} from '../../../../components/productionComponentModule/production';
import {AlfrescoProductionService} from '../../../../components/productionComponentModule/alfrescoProduction.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {ProductionProperties} from '../../../../components/productionComponentModule/productionProperties';

@Component({
  selector: 'production-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css'],
  providers: [AlfrescoProductionService]
})
export class CompanyComponent implements OnInit {

  private routeSubscripton: Subscription;

  /**
   * 
   * the production company form
   * 
   */
  private companyForm: FormGroup;

  /**
   * 
   * the new production site short code, set when site created
   * 
   */
  private siteShortName: string;
  private site: SiteInfo;

  /**
   * 
   * production properties
   * 
   */
  private properties: ProductionProperties;


  constructor(private fb: FormBuilder,
    private service: AlfrescoProductionService,
    private snackBar: MdSnackBar,
    private router: Router,
    private route: ActivatedRoute) {

    this.companyForm = this.fb.group({

      contract_registeredName: '',
      contract_taxNumber: '',
      contract_registeredNum: '',
      contract_formalAddress: '',
      contract_formalPostCode: '',
      contract_orgContactEmail: '',
      contract_orgContactTel: ''

    });

  }

  /**
   * 
   * initialise component by loading the production company details
   * 
   */
  public ngOnInit() {

    console.log('company component onInit');

    this.routeSubscripton = this.route.params
      .flatMap((param: ParamMap) => {
        this.siteShortName = param.id;
        return this.service.getPrduction(param.id);
      })
      .flatMap((site: any) => {
        this.site = site;
        return this.service.getProductionProperties(site.guid);
      })
      .map(properties => {return this.service.unTransform(properties);})
      .subscribe(
      (properties: ProductionProperties) => {

        console.log(properties);

        this.properties = properties;

        this.companyForm.patchValue({contract_registeredName: this.properties.contract_registeredName});
        this.companyForm.patchValue({contract_taxNumber: this.properties.contract_taxNumber});
        this.companyForm.patchValue({contract_registeredNum: this.properties.contract_registeredNum});
        this.companyForm.patchValue({contract_formalAddress: this.properties.contract_formalAddress});
        this.companyForm.patchValue({contract_formalPostCode: this.properties.contract_formalPostCode});
        this.companyForm.patchValue({contract_orgContactEmail: this.properties.contract_orgContactEmail});
        this.companyForm.patchValue({contract_orgContactTel: this.properties.contract_orgContactTel});

      },
      err => {console.log(err);}
      );


  }

  /**
   * 
   * clean up
   * 
   */
  public onDestroy() {

    if (this.routeSubscripton !== undefined) {
      this.routeSubscripton.unsubscribe();
    }

  }


  /**
   * 
   * call the remote service to save the production company details
   * 
   */
  public save() {

    /**
     * map form to ProductionProperties
     */
    this.properties = new ProductionProperties();

    this.properties.contract_registeredName = this.companyForm.value['contract_registeredName'];
    this.properties.contract_taxNumber = this.companyForm.value['contract_taxNumber'];
    this.properties.contract_registeredNum = this.companyForm.value['contract_registeredNum'];
    this.properties.contract_formalAddress = this.companyForm.value['contract_formalAddress'];
    this.properties.contract_formalPostCode = this.companyForm.value['contract_formalPostCode'];
    this.properties.contract_orgContactEmail = this.companyForm.value['contract_orgContactEmail'];
    this.properties.contract_orgContactTel = this.companyForm.value['contract_orgContactTel'];

    this.snackBar.open('Saving production company details');
    this.service.updateSiteProperties(this.site.guid, this.properties).subscribe(
      data => {

        this.snackBar.open('Details updated');

      },
      err => {

        /**
         * 
         * error saving production company details
         * 
         */
        console.log(err);
        this.snackBar.open('Unable to save production company');

      });

  }


}
