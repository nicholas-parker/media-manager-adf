import {Component, OnInit, Input} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {MdDialogRef, MdInput, MdSelectModule} from '@angular/material';
import {DefaultRole} from './defaultRole';
import {ContentModelConstraints} from '../../../components/alfrescoModel/contentModelConstraints';
import {DefaultRoleService} from './defaultRole.service';
import {ContractTemplateService} from './contractTemplate.service';

@Component({
  selector: 'defaultrole-form',
  templateUrl: './defaultRole-form.component.html',
  styleUrls: ['defaultRole-form.component.css', '../../../standard.css', '../../../components/alfrescoWorkflow/forms/workflowform.component.css']
})
export class DefaultRoleFormComponent implements OnInit {



  submitted = false;

  /**
   * drop list content
   */
  deliverableTypeList = ContentModelConstraints.contract_contractDeliverableTypeConstraint;
  PAYEStatusList = ContentModelConstraints.nvp_PAYEStatusConstraint;
  workingWeekList = ContentModelConstraints.contract_workingWeekConstraint;
  paymentPeriodList = ContentModelConstraints.contract_periodSpecifiedConstraint;
  ratePeriodList = ContentModelConstraints.contract_ratePeriodConstraint;
  currencyList = ContentModelConstraints.contract_contractCurrencyConstraint;
  managementProcessList = ContentModelConstraints.contract_workflowNameConstraint;
  adminTeamList = ContentModelConstraints.contract_contractAdministrationTeamConstraint;


  /**
   * 
   * the default role instance we are editing or creating
   * 
   */
  private defaultRole: DefaultRole = new DefaultRole();

  /**
   * 
   * flag to indicate we are busy with an async service call
   * 
   */
  public busy: boolean = false;

  /**
   * 
   * a message which indicates progress of async service activities,
   * only displayed when busy flag is set
   * 
   */
  public progressMessage: string = null;

  /**
   * 
   * a flag used to drive the create or edit text in the UI
   * 
   */
  public create: boolean = true;

  constructor(
    public service: DefaultRoleService,
    public contractTemplateService: ContractTemplateService,
    public dialog: MdDialogRef<DefaultRoleFormComponent>) {

  }

  ngOnInit() {
    console.log('Default Form component init');
    console.log(this.deliverableTypeList);
  }

  /**
   * 
   * the default role we are managing, set if we are used in an edit scenario
   * 
   */
  SetDefaultRole(role: DefaultRole) {

    this.defaultRole = role;
    this.create = false;

  }

  onSave() {
    this.submitted = true;
    this.service.writeRole(this.defaultRole).subscribe(
      res => {this.dialog.close();},
      err => {console.log(err);});
  }

  onSaveComplete() {

  }

  onSaveFail() {

  }

  onCancel() {
    this.dialog.close();
  }

  onDelete() {

    this.service.deleteRole(this.defaultRole).subscribe(
      res => {this.dialog.close();},
      err => {console.log(err);});

  }


}
