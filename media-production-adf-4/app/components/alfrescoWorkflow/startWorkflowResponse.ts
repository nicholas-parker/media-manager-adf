export class StartWorkflowResponse {

  public static STATUS_OK: string = 'OK';
  public static STATUS_NO_WORKFLOW: string = 'NO_WORKFLOW';
  public static STATUS_FAIL: string = 'FAIL';

  public processId: string;
  public workflowName: string;
  public status: string;
  public message: string;
  public properties: any;

}
