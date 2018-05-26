export class ContractModel {

  /** node id */
  public id: string;

  /** core contract date, value and approval properties */
  public contract_contractDate: string;
  public contract_contractCode: string;
  public contract_contractApprovalRole: string;
  public contract_contractApprovalStatus: string;
  public contract_contractApprovalDate: string;
  public contract_contractSignStatus: string;
  public contract_contractSignDate: string;
  public contract_contractValue: string;
  public contract_contractDeliverableType: string;

  /** crew engagement properties */
  public contract_serviceName: string;
  public contract_serviceDescription: string;
  public contract_PAYEstatus: string;
  public contract_ratePeriodSpecifier: string;
  public contract_contractValueCurrency: string;
  public contract_workingWeek: string;
  public contract_paymentPeriodSpecifier: string;
  public contract_overtimePayable: string;
  public contract_overtimeRate: string;
  public contract_holidayRate: string;
  public contract_noticePeriod: string;
  public contract_location: string;

  /** individualSupplier properties */
  public contract_supplierLastName: string;
  public contract_supplierEmail: string;
  public contract_supplierTelephone: string;
  public contract_supplierMobile: string;
  public contract_supplierAddress1: string;
  public contract_supplierAddress2: string;
  public contract_supplierAddress3: string;
  public contract_supplierPostCode: string;

  /** bank account properties, where the money is paid */
  public prod_bankName: string;
  public prod_bankAccountName: string;
  public prod_bankAccountNumber: number;
  public prod_bankBranchSortCode: number;

  /** right to work */
  public contract_dateOfBirth: string;
  public contract_townOfBirth: string;
  public contract_countryOfBirth: string;
  public contract_nationalInsuranceNumber: string;
  public contract_identityDocumentReference: string;
  public contract_identityDocumentType: string;
  public contract_identityDocumentIssuer: string;
  public contract_visaNumber: string;
  public contract_visaExpiryDate: string;

  /** electronic signature */
  public contract_signingTransactionId: string;
  public contract_recipientPublicKey: string;
  public contract_recipientElectronicConfirmation: string;
  public contract_recipientElectronicConfirmationDate: string;
  public contract_supplierPublicKey: string;
  public contract_supplierElectronicConfirmation: string;
  public contract_supplierElectronicConfirmationDate: string;


}
