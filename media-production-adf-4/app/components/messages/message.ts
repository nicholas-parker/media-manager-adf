/**
 * A message which is sent from one user to another within the platform
 */
export class UserMessage {
  
  constructor( public id,
               public date,
               public from,
               public to,
               public title,
               public body,
               public attachments: string[],
               public read,
               public deleted,
               public nextMessageId,
               public prevMessageId,
               public type) {
    
  }
               
}
