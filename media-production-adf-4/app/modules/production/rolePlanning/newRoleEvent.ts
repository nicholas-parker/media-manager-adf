export class NewRoleEvent {

  /**
   * name of the new role
   */
  public roleName: string;

  /**
   * name of the role type the new role was created from
   */
  public roleType: string;

  /**
   * status of creating the new role, OK | FAIL
   */
  public roleStatus: string;

  /**
   * nodeId of the new role
   */
  public roleId: string;

  /**
   * name of the contract document created for the role
   */
  public contractName: string;

  /**
   * nodeId of the new contract document
   */
  public contractId: string;

  /**
   * status of creating the new contract document NONE | OK | FAIL
   */
  public contractStatus: string;

  /**
   * the name of the workflow which was started to manage the contract 
   */
  public workflowName: string;

  /**
   * the process id of the new workflow process
   */
  public processId: string;

  /**
   * the status of starting the workflow process NONE | OK | FAIL
   */
  public workflowStatus: string;

}
