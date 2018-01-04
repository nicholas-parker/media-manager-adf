/**
 * A class which represents the properties passed to the 'create role' workflow
 * when it starts
 * 
 */
export class CreateRoleProcessProperties {
     
  
  
  public static PROP_ROLE_TYPE = 'roleType';
  public static PROP_ROLE_NAME = 'roleName';
  public static PROP_CREATED_DATE = 'createdDate';
  public static PROP_OFFER_DATE= 'offerDate';
  public static PROP_ACCEPTED_DATE = 'acceptedDate';
  public static PROP_ROLE_STATUS = 'roleStatus';
  public static PROP_CONTRACT_PROCESS_ID = 'contractProcessId';
  public static PROP_ASSIGNEE = 'assignee';
  public static PROP_START_DATE = 'startDate';
  public static PROP_END_DATE = 'endDate';
  public static PROP_CHARGE_CODE = 'chargeCode';
  public static PROP_CONTRACT_DOCUMENTS = 'roleContractDocuments';
  public static PROP_MIN_BUDGET = 'budgetMin';
  public static PROP_MAX_BUDGET = 'budgetMax';
  public static PROP_CURRENCY = 'currency';
  public static PROP_PAYE_STATUS = 'PAYEStatus';
  
  public contract_contractApprovalRole: string = 'GROUP_site_mwt2_SiteManager';
  
  constructor(
       
        public mwt_site: string,
        public nvpList_roleName: string,
        public nvpList_roleType: string,
        public nvpList_startDate: Date,
        public nvpList_endDate: Date
  ) {
    
    
      
        
  }
}
