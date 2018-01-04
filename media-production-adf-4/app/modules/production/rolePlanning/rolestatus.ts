/**
 * This class represents the status which a role entity can exist in.
 */
export class RoleStatus {
  
  /** role is just created, the details must be added */
  public static created = 'CREATED';
  
  /** role is waiting approval */
  public static waitApproval = 'WAIT_APPROVAL';
  
  /** role is approved but not yet offered */
  public static approved = 'APPROVED';
  
  /** role is offered but not accepted */
  public static offered = 'OFFERED';
  
  /** role has been rejected by candidate */
  public static rejected = 'REJECTED';
  
  /** role has been withdrawn */
  public static withdrawn = 'WITHDRAWN';
  
  /** role is in negotiation, action rests with production company */
  public static negotiateProd = 'NEGOTIATE_PROD';
  
  /** role is in negotiation, action rests with candidate */
  public static negotiateCand = 'NEGOTIATE_CAND';
    
  /** role has been accepted by candidate, waiting final approval */
  public static finalApproval = 'FINAL_APPROVAL';
  
  /** candidate has accepted, role approved */
  public static complete = 'COMPLETE';
  
}
