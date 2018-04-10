
/**
 * 
 * productionRole model
 * Maps to the Alfresco model nvpList:productionRole
 * 
 */
export class Role {

  /** Alfresco model fields */
  public sys_nodedbid: string;
  public nvpList_roleType: string;
  public nvpList_roleName: string;
  public nvpList_createdDate: Date;
  public nvpList_offerDate: Date;
  public nvpList_acceptedDate: Date;
  public nvpList_roleStatus: string;
  public nvpList_chargeCode: string;
  public nvpList_PAYEStatus: string;
  public nvpList_contractProcessId: string;
  public nvpList_startDate: Date;
  public nvpList_endDate: Date;
  public nvpList_budgetMin: number;
  public nvpList_budgetMax: number;
  public nvpList_totalContractsValue: number;
  public nvpList_roleCategory: string;


  // associations, not sure how to map yet
  // ,public nvpList_assignee,
  // public nvpList_roleContractDocuments: node[]

  /**
   * 
   * nodeId reference to the Word content which is used as the contract template
   * to create the contract document for this role.  In the Alfresco model this is an
   * association with the role node.  This field is used by the workflow to create
   * the contract document.
   * 
   */
  public nvpList_contractTemplate: string;

  // these fields are in the 'service' model which would make sense to put them here
  // contract:serviceDescription
  public nvpList_serviceDescription: string;

  // contract:location
  public nvpList_location: string;

  /** UI specific fields */
  public mwt_site: string;

  // list of tags
  public tags: object[];

}
