import {Component, EventEmitter, OnInit} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MdSelectModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators, FormArray} from '@angular/forms';
import {LogService} from 'ng2-alfresco-core';
import {Observable, Subscription} from 'rxjs/Rx';
import {Production} from '../../../../components/productionComponentModule/production';
import {AlfrescoProductionService} from '../../../../components/productionComponentModule/alfrescoProduction.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {ServicePeriod} from '../../../../components/productionComponentModule/servicePeriod';

@Component({
  selector: 'production-period-admin',
  templateUrl: './productionPeriod.component.html',
  styleUrls: ['./productionPeriod.component.css'],
  providers: [AlfrescoProductionService]
})
export class ProductionPeriodComponent implements OnInit {

  private routeSubscripton: Subscription;

  /**
   * 
   * the production company form
   * 
   */
  public periodForm: FormGroup;
  public formPeriods: FormArray;

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
  private periods: ServicePeriod[];


  constructor(private fb: FormBuilder,
    private service: AlfrescoProductionService,
    private snackBar: MdSnackBar,
    private router: Router,
    private route: ActivatedRoute) {

    this.periodForm = this.fb.group({
      formPeriods: this.fb.array([this.createFormPeriod()])
    });

  }

  /**
   * 
   * initialise component by loading the production company details
   * 
   */
  public ngOnInit() {

    console.log('production period component onInit');

    this.routeSubscripton = this.route.params
      .flatMap((param: ParamMap) => {
        this.siteShortName = param.id;
        return this.service.getPrduction(param.id);
      })
      .flatMap((site: any) => {
        this.site = site;
        return this.service.getProductionPeriods(site.guid);
      })
      .subscribe(
      (periods: ServicePeriod[]) => {

        console.log(periods);
        for (let i = 0; i < periods.length; i++) {
          console.log('adding period ' + i);
          console.log(periods[i]);
          this.add(periods[i]);
        }

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
   * add a new service period to the form
   * 
   */
  public createFormPeriod(period?: ServicePeriod): FormGroup {

    let formPeriod: FormGroup = this.fb.group({
      contract_serviceName: '',
      contract_serviceDescription: '',
      contract_serviceTypeCode: '',
      contract_serviceStart: '',
      contract_serviceEnd: '',
      id: ''
    });

    if (undefined !== period) {

      formPeriod.patchValue({contract_serviceName: period.contract_serviceName});
      formPeriod.patchValue({contract_serviceDescription: period.contract_serviceDescription});
      formPeriod.patchValue({contract_serviceTypeCode: period.contract_serviceTypeCode});
      formPeriod.patchValue({contract_serviceStart: period.contract_serviceStart});
      formPeriod.patchValue({contract_serviceEnd: period.contract_serviceEnd});
      formPeriod.patchValue({id: period.id});

    }

    return formPeriod;

  }

  /**
   * 
   * add new production period
   * 
   */
  public add(period?: ServicePeriod): void {

    this.formPeriods = <FormArray>this.periodForm.get('formPeriods');
    this.formPeriods.push(this.createFormPeriod(period));

  }

  /**
   * 
   * delete existing production period
   * 
   */
  public delete(periodNodeId: string, index: number): void {

    /**
     * this.service.deleteProductionPeriod(periodNodeId).subscribe(
     *  data => {
     *    this.formPeriods = this.periodForm.get('periods') as FormArray;
     *    this.formPeriods.removeAt(index);
     *  },
     *  err => {}
     * );
     */

  }

  /**
   * 
   * call the remote service to save the production company details
   * 
   */
  public save(periodForm: FormGroup) {

    this.snackBar.open('Saving production company details');

    /**
     * map form to ProductionProperties
     */
    let period = new ServicePeriod();
    period.id = periodForm.value['id'];
    period.contract_serviceName = periodForm.value['contract_serviceName'];
    period.contract_serviceDescription = periodForm.value['contract_serviceDescription'];
    period.contract_serviceStart = periodForm.value['contract_serviceStart'];
    period.contract_serviceEnd = periodForm.value['contract_serviceEnd'];
    period.contract_serviceTypeCode = periodForm.value['contract_serviceTypeCode'];

    if (period.id === undefined) {

      /*
       * no id, so create new period & update form group id
       */
      this.service.addProductionPeriod(this.site.guid, period).subscribe(
        (periodResp: ServicePeriod) => {
          console.log('Created new service period');
        },
        err => {
          console.log('Error creating new service period');
          console.log(err);
        }
      );

    } else {

      /*
       * update existing period
       */
    }
  }


}
