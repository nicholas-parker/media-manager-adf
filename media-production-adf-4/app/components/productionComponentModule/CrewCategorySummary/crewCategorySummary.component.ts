import {Component, EventEmitter, OnInit, Input} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MdInput, MdSnackBar} from '@angular/material';
import {LogService} from 'ng2-alfresco-core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {CrewCategorySummaryService} from './crewCategorySummary.service';
import {FormsModule, FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import {NewRoleEvent} from '../../../modules/production/rolePlanning/newRoleEvent';

@Component({
  selector: 'crew-category-summary',
  templateUrl: './crewCategorySummary.component.html',
  styleUrls: ['./crewCategorySummary.component.css']
})

/**
 * 
 * This component displays a list of all the roles in the category and also the  number of each roles in the crew.
 * The user may add and delete roles but not set any of the role specifics
 * The context of the component is understood by the services used
 *  
 */
export class CrewCategorySummaryComponent implements OnInit {

  /**
   * 
   *  The category to display the summary for
   * 
   */
  @Input()
  public set category(category: string) {

    this.summary.category = category;

  }

  /**
   * 
   * an array of messages (string) which are created when the headcount is adjusted
   * 
   */
  public headcountMessage: string[] = [];

  /**
   * 
   * subject fired on destruction, used to remoCrewCategorySummaryServiceve subscriptions
   * 
   */
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  /**
   * 
   * columns displayed in the table
   * 
   */
  public displayedColumns = ['name', 'roleBudget', 'roleCountInput', 'menu'];

  /**
   * 
   * reference to the form in the UI which contains input fields to ammend the number of roles for a given type
   * 
   */
  public form: FormGroup;

  constructor(public summary: CrewCategorySummaryService,
    private snackBar: MdSnackBar) {

    /** subscribe to new role events and update the display */
    this.summary.newRoleEvents.subscribe(
      (event: NewRoleEvent) => {
        let msg: string;
        /** role pass or fail */
        if (event.roleStatus === 'OK') {
          msg = 'New role ' + event.roleName + ' created.';

          /** role contract */
          if (event.contractStatus === 'OK') {
            msg = msg + ' New contract document ' + event.contractName + ' has been created in the contracts folder';
          }
          if (event.contractStatus === 'NO_CONTRACT') {
            msg = msg + ' No contract was created as no template defined in the default role';
          }
          if (event.contractStatus === 'FAIL') {
            msg = msg + ' ERROR creating contract: ';
          }

          /** contract workflow */
          if (event.workflowStatus === 'OK') {
            msg = msg + ' Workflow was started, task assigned to team.';
          }
          if (event.workflowStatus === 'NO_WORKFLOW') {
            msg = msg + ' Workflow not defined for this role.';
          }
          if (event.workflowStatus === 'FAIL') {
            msg = msg + ' ERROR starting workflow.';
          }

        } else {

          msg = 'Error creating role ' + event.roleName;

        }

        console.log(msg);
        this.headcountMessage.push(msg);

      },
      err => {
        this.headcountMessage.push('There was a problem updating the crew role');
        console.log(err);
      }

    );

  }

  public ngOnInit(): void {
    // NO OP
  }

  /**
   * 
   * destroy subscriptions
   * 
   */
  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * 
   * update the roles in the production with the number of roles for each role type entered in the form
   *  
   */
  public updateRoles(form) {

    this.headcountMessage = [];
    this.summary.setHeadcount(this.getDirtyValues(form));

  }

  /**
   * 
   * gets the role count changes a user has made for each role type
   * 
   */
  private getDirtyValues(form: any): any {

    let dirtyValues = {};

    Object.keys(form.controls)
      .forEach(key => {
        let currentControl = form.controls[key];

        if (currentControl.dirty) {
          if (currentControl.controls) {
            dirtyValues[key] = this.getDirtyValues(currentControl);
          } else {
            dirtyValues[key] = currentControl.value;
          }
        }
      });

    return dirtyValues;
  }

}
