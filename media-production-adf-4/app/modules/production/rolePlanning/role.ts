
/**
 * 
 * productionRole model
 * Maps to the Alfresco model nvpList:productionRole
 * 
 */
export class Role {

  /**
   * 
   * Role status
   * 
   */
  public static ROLE_STATUS_SETUP: string = 'Set up';
  public static ROLE_STATUS_SUPPLIER_REVIEW: string = 'Supplier review';
  public static ROLE_STATUS_ACCEPTED: string = 'Accepted';
  public static ROLE_STATUS_DECLINED: string = 'Declined';
  public static ROLE_STATUS_FINAL_APPROVAL: string = 'Final approval';
  public static ROLE_STATUS_APPROVED: string = 'Approved';
  public static ROLE_STATUS_ACTIVE: string = 'Active';
  public static ROLE_STATUS_COMPLETED: string = 'Completed';
  public static ROLE_STATUS_NEW_SUPPLIER: string = 'New supplier';
  public static ROLE_STATUS_CANCELED: string = 'Canceled';

  /** 
   * 
   * model fields
   * 
   */
  public sys_nodedbid: string;
  public nvpList_roleType: string;
  public nvpList_roleName: string;
  public nvpList_roleDescription: string;
  public nvpList_createdDate: Date;
  public nvpList_offerDate: Date;
  public nvpList_acceptedDate: Date;
  public nvpList_roleStatus: string;
  public nvpList_chargeCode: string;
  public nvpList_PAYEStatus: string;
  public nvpList_workingWeek: string;
  public nvpList_holidayPaidRate: number;
  public nvpList_overtimePaidRate: number;
  public nvpList_noticePeriod: number;
  public nvpList_contractProcessId: string;
  public nvpList_contractProcessName: string;
  public nvpList_contractAdministrationTeam: string;
  public nvpList_startDate: Date;
  public nvpList_endDate: Date;
  public nvpList_ratePeriod: string;
  public nvpList_paymentPeriod: string;
  public nvpList_budgetMin: number;
  public nvpList_budgetMax: number;
  public nvpList_totalBudgetMin: number;
  public nvpList_totalBudgetMax: number;
  public nvpList_currency: string;
  public nvpList_totalContractsAmount: number;
  public nvpList_roleCategory: string;

  /**
   * 
   * nodeId reference to the Word content which is used as the contract template
   * to create the contract document for this role.  In the Alfresco model this is an
   * association with the role node.  This field is used by the workflow to create
   * the contract document.
   * 
   */
  public nvpList_contractTemplate: string;

  public nvpList_location: string;

  /** UI specific fields */
  public mwt_site: string;

  // list of tags
  public tags: object[];


}
