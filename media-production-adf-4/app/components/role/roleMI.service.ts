/**
 * 
 * a service which provides MI summary info on a group of roles
 * A unique instance must be created for each component since the service contains specific filters
 * 
 */
import {Observable} from 'rxjs/Observable';
import {Role} from '../../modules/production/rolePlanning/role';

export class RoleMIService {

  /**
   * 
   * the role stream to provide simple statistics from
   * 
   */
  public roles: Observable<Role[]>;

  /**
   * 
   *  STATS
   * 
   *  count of the current roles in the stream
   */
  public roleCount: number = 0;

  /**
   * 
   * count of the roles which have not been sent to candidates, are pending
   * 
   */
  public pendingCount: number = 0;

  /**
   * 
   * count of the roles which are with the candidate
   * 
   */
  public candidateCount: number = 0;

  /**
   * 
   * count of the roles which candidate has accepted and need to be approved
   * 
   */
  public acceptedCount: number = 0;

  /**
   * 
   * count of the roles which are approved and complete
   * 
   */
  public approvedCount: number = 0;

  /**
   * 
   * percentage of the roles which are approved and complete
   * 
   */
  public completePercent: number = 0;

  /**
   * categoryCount
   */
  public categoryCount = new Array();

  /**
   * 
   * statusArrau
   * 
   */
  public statusSummary = new Array();

  /** 
   * 
   * subscribe to roles stream
   * 
   */
  public init(_roles: Observable<Role[]>) {

    this.roles = _roles;
    this.roles.subscribe(
      (roles: Role[]) => {

        let _pendingCount = 0;
        let _candidateCount = 0;
        let _acceptedCount = 0;
        let _approvedCount = 0;
        let _category = [];

        roles.map((role: Role) => {

          /** status summary */
          if (role.nvpList_roleStatus === Role.ROLE_STATUS_SETUP) {_pendingCount++;}
          if (role.nvpList_roleStatus === Role.ROLE_STATUS_SUPPLIER_REVIEW) {_candidateCount++;}
          if (role.nvpList_roleStatus === Role.ROLE_STATUS_ACCEPTED) {_acceptedCount++;}
          if (role.nvpList_roleStatus === Role.ROLE_STATUS_APPROVED) {_approvedCount++;}

          /** role category summary */
          if (undefined === _category[role.nvpList_roleCategory]) {
            _category[role.nvpList_roleCategory] = 1;
          } else {
            _category[role.nvpList_roleCategory]++;
          }

        });

        /** set the public values */
        this.roleCount = roles.length;
        this.pendingCount = _pendingCount;
        this.candidateCount = _candidateCount;
        this.acceptedCount = _acceptedCount;
        this.approvedCount = _approvedCount;
        if (this.roleCount > 0) {
          this.completePercent = Math.floor((this.approvedCount / this.roleCount) * 100);
        } else {
          this.completePercent = 0;
        }


        this.categoryCount = new Array();
        Object.getOwnPropertyNames(_category)
          .map((name: string) => {
            let c = {name: '', value: ''};
            c.name = name;
            c.value = _category[name];
            this.categoryCount.push(c);
          });

        /** status counts for summary graphs */
        this.statusSummary = [
          {name: 'Pending', value: _pendingCount},
          {name: 'Candidate Review', value: _candidateCount},
          {name: 'Accepted', value: _acceptedCount},
          {name: 'Approved', value: _approvedCount}
        ];


      },
      err => {console.log(err);}
    );

  }
}
