/**
 * model of a task which is provided by the Alfresco REST workflow API
 * 
 */
export class Task {

  public static STATE_UNCLAIMED = 'unclaimed';
  public static STATE_CLAIMED = 'claimed';

  constructor(
    public id: string,
    public processId: string,
    public processDefinitionId: string,
    public activityDefinitionId: string,
    public name: string,
    public description: string,
    public dueAt: Date,
    public startedAt: Date,
    public endedAt: Date,
    public durationInMs: number,
    public priority: number,
    public owner: string,
    public assignee: string,
    public formResourceKey: string,
    public state: string,
    public variables

  ) {}
}
