export class OpportunityModel {


  public contract_serviceName: string;
  public contract_serviceDescription: string;
  public contract_serviceStart: string;
  public contract_serviceEnd: string;
  public contract_location: string;
  public contract_contractCode: string;
  public contract_PAYEstatus: string;
  public contract_contractDeliverableType: string;
  public contract_paymentPeriodSpecifier: string;
  public contract_contractValueCurrency: string;
  public contract_contractValue: string;
  public contract_holidayRate: string;
  public contract_noticePeriod: string;
  public contract_overtimePayable: string;
  public contract_overtimeRate: string;
  public contract_ratePeriodSpecifier: string;

  // personal details
  public contract_supplierFirstName: string;
  public contract_supplierLastName: string;
  public contract_supplierEmail: string;
  public contract_dateOfBirth: string;
  public contract_townOfBirth: string;
  public contract_countryOfBirth: string;

  // contact details
  public contract_supplierMobile: string;
  public contract_supplierAddress1: string;
  public contract_supplierAddress2: string;
  public contract_supplierAddress3: string;
  public contract_supplierPostCode: string;

  // right to work
  public contract_rightToWorkAsserted: string;
  public contract_nationalInsuranceNumber: string;
  public contract_identityDocumentReference: string;
  public contract_visaNumber: string;
  public contract_visaExpiryDate: string;

  // bank details
  public prod_bankName: string;
  public prod_bankAccountName: string;
  public prod_bankAccountNumber: number;
  public prod_bankBranchSortCode: number;


}
