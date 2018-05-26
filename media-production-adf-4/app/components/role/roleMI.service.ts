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

        roles.map((role: Role) => {

          if (role.nvpList_roleStatus === Role.ROLE_STATUS_SETUP) {_pendingCount++;}
          if (role.nvpList_roleStatus === Role.ROLE_STATUS_SUPPLIER_REVIEW) {_candidateCount++;}
          if (role.nvpList_roleStatus === Role.ROLE_STATUS_ACCEPTED) {_acceptedCount++;}
          if (role.nvpList_roleStatus === Role.ROLE_STATUS_APPROVED) {_approvedCount++;}


        });

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

      },
      err => {console.log(err);}
    );

  }
}
