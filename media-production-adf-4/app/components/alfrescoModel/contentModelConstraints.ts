/**
 * this class is the mapping of the alfresco content model constraints into TS arrays
 */
export class ContentModelConstraints {
  
  public static contract_contractApprovalStatusConstraint = [{ 'value': 'APPROVED', 'text': 'Contract approved'},
                                                             { 'value': 'NOT APPROVED', 'text': 'Contract not approved'}];
  
  public static nvp_PAYEStatusConstraint = [{ 'value': 'PAYE', 'text': 'Employed as PAYE'},
                                            { 'value': 'Self Employed', 'text': 'Self Employed basis'}];
  
  public static contract_partyPositionConstraint = ['PENDING','NEGOTIATION','AGREED','DECLINED'];
  
  public static contract_partyRoleConstraint = ['SERVICE PROVIDER','SERVICE RECIPIENT','LEGAL SERVICE'];
  
  public static contract_contractDeliverableTypeConstraint = [{ 'value': 'SERVICE', 'text': 'Provide a service'},
                                                              { 'value': 'PRODUCT', 'text': 'Deliver a product'}];
  
  public static contract_contractCurrencyConstraint = ['GBP','EUR','USD','AUS','KRN'];
  
  public static contract_periodSpecifiedConstraint = [{ 'value': 'Milestone', 'text': 'Paid per milestone'},
                                                      { 'value': 'Daily', 'text': 'Paid daily'},
                                                      { 'value': 'Weekly', 'text': 'Paid weekly'},
                                                      { 'value': 'Monthly', 'text': 'Paid monthly'}];
  
  public static contract_ratePeriodConstraint = ['per hour','per day','per week','per month','fixed price contract'];
  
  public static contract_yesNoConstraint = ['NO', 'YES'];
  
  public static contract_workingWeekConstraint = ['Five (5) days per week','Six (6) days per week','Eleven (11) days per fortnight'];
  
  public static contract_identityDocumentTypeConstraint = ['Passport','Drivers Licence'];
  
  public static contract_workflowNameConstraint = ['Contract management process','Simple reminder','Manual process'];
  
  public static contract_contractAdministrationTeamConstraint = ['Contracts admin team'];
  
}
