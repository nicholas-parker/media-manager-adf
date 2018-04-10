import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Component, OnInit, Input} from '@angular/core';
import {MdProgressSpinnerModule, MdButtonModule, MdDialogRef, MdSnackBar} from '@angular/material';
import {RoleService} from './role.service';
import {Role} from './role';
import {AlfrescoWorkflowService} from '../../../components/alfrescoWorkflow/alfrescoWorkflow.service';
import {AlfrescoService} from '../../../components/alfrescoWorkflow/alfresco.service';


@Component
  ({
    selector: 'contract-withdraw',
    templateUrl: './withdrawContractDialog.component.html',
    styleUrls: ['./withdrawContractDialog.component.css']
  })
export class WithdrawContractDialog implements OnInit {

  /**
   * 
   * the role we are deleting
   * 
   */
  @Input()
  public role: Role;

  /**
   * 
   * UI flags which drive the text displayed
   * 
   */
  public statusSetup: boolean = false;

  /**
   * 
   * subscription to the delete observable
   * 
   */
  public subWithdraw: Subscription;

  constructor(private roleService: RoleService,
    private workflowService: AlfrescoWorkflowService,
    private dialogRef: MdDialogRef<ContractWithdrawDialog>,
    private snackBar: MdSnackBar
  ) {

  }

  ngOnInit(): void {

    if (this.role.nvpList_roleStatus !== 'Setup') {
      this.statusSetup = true;
    }
  }

  ngOnDestroy(): void {

    if (undefined !== this.subWithdraw) {
      this.subWithdraw.unsubscribe();
    }

  }

  /**
   * 
   * withdraws the contract from the current candidate if it is not at Setup status
   * 
   */
  public withdraw(): void {

    if (this.statusSetup === false) {
      this.snackBar.open('unable to withdraw offer because it has not been sent to the candidate', '', {duration: 2000});
      return;
    }

    this.snackBar.open('Withdrawing offer from candidate', '', {duration: 2000});

    this.subWithdraw = this.workflowService.sendMessage(+this.role.nvpList_contractProcessId, 'withdrawCandidateOfferMessage').subscribe(
      data => {
        this.snackBar.open('Offer withdrawn', '', {duration: 2000});
        this.roleService.refresh();
        this.cancel();
      },
      err => {
        this.snackBar.open('There was a problem withdrawing this offer', '', {duration: 2000});
        console.log(err);
      }
    );

  }

  /**
   * 
   * cancel the delete action
   * 
   */
  public cancel() {

    this.dialogRef.close();

  }

}
