import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ActivationService } from './activation.service';
/**
 * 
 * Implements the behaviour when a new member arrives after recieving their first role offer.
 * A membership will have been created prior to arriving here by the issuing work flow.
 * This component activates the membership and prompts the member to change their password
 * After changing the password the member navigates to the offer review component
 * 
 */
@Component({
  selector: 'first-time-landing',
  templateUrl: './firsttime.component.html',
  styleUrls: ['./firsttime.component.css'],
  providers: [ ActivationService ]
})
export class FirstTimeComponent implements OnInit {
  
  
  /** indicates that the pending membership has been activated */
  public membershipActivated = false;
  public membershipActivationProblem= false;
  public membershipActivationMessage = '';
  
  /** the password data */
  public password1 = '';
  public password2 = '';
  
  constructor(private activatedRoute: ActivatedRoute,
              private activationService: ActivationService) {}
  
  /**
   * 
   *  accept the pending membership
   * 
   */
  ngOnInit() {
    
    let inviteId, ticket;
    
    this.activatedRoute.queryParams.subscribe((params: Params) => {
        inviteId = params['inviteId'];
        ticket = params['inviteTicket'];
      });
    
    this.activationService.accept(inviteId, ticket).subscribe(
       (res: Response) => {
          this.membershipActivated = true;
          this.membershipActivationMessage = 'Your membership has been activated';
          console.log(res);
          },
        err => {
          this.membershipActivationMessage = 'There was a problem activating your membership';
          console.log(err);
          }
    );
  }
  
  /**
   * 
   * Update the members password, if OK navigate to offer review component
   * 
   */
  onPasswordUpdate() {
    
  }
  
  /**
   * 
   * indicates password strength and that both values are the same
   * 
   */
  
}


