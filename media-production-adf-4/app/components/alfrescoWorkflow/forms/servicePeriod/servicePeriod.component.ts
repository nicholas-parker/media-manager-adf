import {Component, EventEmitter, OnInit, Input} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MdSelectModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators, FormArray} from '@angular/forms';
import {LogService} from 'ng2-alfresco-core';
import {Observable, Subscription} from 'rxjs/Rx';
import {Production} from '../../../../components/productionComponentModule/production';
import {ServicePeriodService} from './servicePeriod.service';
import {ServicePeriod} from '../../../../components/productionComponentModule/servicePeriod';

// @Component({
//  selector: 'service-periods',
//  templateUrl: './servicePeriod.component.html',
//  styleUrls: ['./servicePeriod.component.css'],
//  providers: [ServicePeriodService]
// })
export class ServicePeriodComponent implements OnInit {


  /**
   * 
   * The id for the parent node which has child ServicePeriod nodes
   * 
   */
  @Input()
  public parentNodeId;

  /**
   * 
   * the form array which holds the service period controls
   * 
   */
  @Input()
  public servicePeriods: FormArray;

  /**
   * 
   * the serviceTypeCode for the servicePeriods that are being managed
   * 
   */
  @Input()
  public serviceTypeCode: string;

  /**
   * 
   * the relationship type between parent and child service period
   * 
   */
  @Input()
  public childRelationshipType: string;

  /**
   * 
   * servicePeriods we are managing in this component
   * 
   */
  private periods: Array<ServicePeriod> = new Array<ServicePeriod>();


  constructor(private fb: FormBuilder,
    private service: ServicePeriodService,
    private snackBar: MdSnackBar) {

  }

  public ngOnInit() {}

  /**
   * 
   * initialise component by loading the child servicePeriod nodes
   * 
   */
  public getPeriods() {

    this.service.getChildPeriods(this.parentNodeId, this.childRelationshipType).subscribe(

      (data: ServicePeriod) => {

        this.periods.push(data);
        let servicePeriodForm = this.createFormPeriod(data);
        this.addServicePeriodFormGroup(servicePeriodForm);
      },

      err => {
        console.log(err);
      });

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
   * create a new set of form controls for the given servicePeriod
   * 
   */
  public createFormPeriod(period?: ServicePeriod): FormGroup {

    let formPeriod: FormGroup = this.fb.group({
      contract_servicePeriodName: '',
      contract_servicePeriodDescription: '',
      contract_serviceTypeCode: '',
      contract_serviceStart: null,
      contract_serviceEnd: null,
      id: ''
    });

    if (undefined !== period) {

      formPeriod.patchValue({contract_servicePeriodName: period.contract_servicePeriodName});
      formPeriod.patchValue({contract_servicePeriodDescription: period.contract_servicePeriodDescription});
      formPeriod.patchValue({contract_serviceTypeCode: period.contract_serviceTypeCode});
      formPeriod.patchValue({contract_serviceStart: new Date(period.contract_serviceStart)});
      formPeriod.patchValue({contract_serviceEnd: new Date(period.contract_serviceEnd)});

    }

    return formPeriod;

  }


  /**
   * 
   * add a new form group to the servicePeriod 
   * 
   */
  public addServicePeriodFormGroup(formGroup: FormGroup): void {

    if (this.servicePeriods) {

      this.servicePeriods.push(formGroup);

    } else {

      console.log('Unable to add service period to form, array not set');

    }

  }


  /**
   * 
   * delete existing production period
   * 
   */
  public delete(index: number): void {

    if (index < this.periods.length) {

      // remove the item from Alfresco and then remove the form
      this.service.deleteServicePeriod(this.periods[index]).subscribe(
        data => {
          this.snackBar.open('Service period deleted', null, {duration: 3000});
          this.servicePeriods.removeAt(index);
          this.periods.splice(index, 1);
        },
        err => {
          console.log(err);
          this.snackBar.open('Error deleting service period', null, {duration: 3000});
        }
      );
    } else {

      // just remove the form
      this.servicePeriods.removeAt(index);

    }



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
   * add a new service period into the form
   * 
   */
  public add(): void {

    this.servicePeriods.push(this.createFormPeriod());

  }
  /**
   * 
   * call the remote service to save the production company details,
   * this.periods must have been initialised;
   * 
   */
  public save(i: number) {

    // this.snackBar.open('Saving production company details');

    if (i + 1 > this.periods.length) {

      /** new service period */
      let period: ServicePeriod = new ServicePeriod();
      period.contract_servicePeriodName = this.servicePeriods.controls[i].controls.contract_servicePeriodName.value;
      period.contract_servicePeriodDescription = this.servicePeriods.controls[i].controls.contract_servicePeriodDescription.value;
      period.contract_serviceStart = this.servicePeriods.controls[i].controls.contract_serviceStart.value;
      period.contract_serviceEnd = this.servicePeriods.controls[i].controls.contract_serviceEnd.value;
      period.contract_serviceTypeCode = this.serviceTypeCode;
      period.contract_servicePeriodType = ServicePeriod.PERIOD;

      this.service.createServicePeriod(this.parentNodeId, period, this.serviceTypeCode, this.childRelationshipType).subscribe(
        periodResp => {
          period.contract_servicePeriodId = periodResp.entry.childId;
          console.log('Created new service period');
          this.snackBar.open('Service period updated', null, {duration: 3000});
          this.periods.push(period);
        },
        err => {
          this.snackBar.open('Error updating service period', null, {duration: 3000});
          console.log('Error creating new service period');
          console.log(err);
        });

    } else {

      /** update existing period */
      let period: ServicePeriod = this.mergeFormServicePeriod(i);
      this.service.updateServicePeriod(period).subscribe((periodResp: ServicePeriod) => {
        console.log('Created new service period');
        this.periods[i] = period;
        this.snackBar.open('Service period updated');
      },
        err => {
          this.snackBar.open('There was a problem updating the service period');
          console.log('Error creating new service period');
          console.log(err);
        });
    }
  }

  /**
   * 
   * map a specific servicePeriod in the form to a servicePeriod object
   * 
   */
  private mergeFormServicePeriod(i: number): ServicePeriod {

    let period = this.periods[i];
    period.contract_servicePeriodName = this.servicePeriods.controls[i].controls.contract_servicePeriodName.value;
    period.contract_servicePeriodDescription = this.servicePeriods.controls[i].controls.contract_servicePeriodDescription.value;
    period.contract_serviceStart = this.servicePeriods.controls[i].controls.contract_serviceStart.value;
    period.contract_serviceEnd = this.servicePeriods.controls[i].controls.contract_serviceEnd.value;
    return period;

  }

}
