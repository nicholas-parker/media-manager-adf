/**
 * 
 * DefaultRole model.  Maps to DefaultRoleType model in Alfresco
 * 
 */
export class DefaultRole {
  
    
  constructor(
    
    public sys_nodedbid?: string,
    public nvpList_typeName?: string,
    public nvpList_typeDescription?: string,
    public nvpList_typeDeliverableType?: string,
    public nvpList_typeChargeCode?: string,
    public nvpList_typePAYEStatus?: string,
    public nvpList_typeWorkingWeek?: string,
    public nvpList_typeBudgetMin?: string,
    public nvpList_typeBudgetMax?: string,
    public nvpList_typePaymentPeriod?: string,
    public nvpList_typeRatePeriod?: string,
    public nvpList_typeCurrency?: string,
    public nvpList_typeProcessName?: string,
    public nvpList_typeAdministrationTeam?: string,
    public nvpList_typeContractTemplate?: string
    
  ) { 
  
  
  
  }
  
  
    
}
