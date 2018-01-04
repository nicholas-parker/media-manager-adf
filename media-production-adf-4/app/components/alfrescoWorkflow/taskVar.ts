/**
 * A class which represents a variable associated with an Activiti task
 * 
 */
export class TaskVar {

  constructor(
    public scope: string,
    public name: string,
    public value: any,
    public type: string) {}
  
}
