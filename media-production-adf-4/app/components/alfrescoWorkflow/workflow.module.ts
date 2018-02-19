import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {MaterialModule} from '../../material.module';

import {CoreModule} from 'ng2-alfresco-core';
import {DocumentListModule} from 'ng2-alfresco-documentlist';
import {UploadModule} from 'ng2-alfresco-upload';
import {TagModule} from 'ng2-alfresco-tag';
import {ViewerModule} from 'ng2-alfresco-viewer';


import {AlfListEntry} from './alfListEntry';
import {AlfListHeader} from './alfListHeader';
import {AlfrescoService} from './alfresco.service';
import {AlfrescoWorkflowService} from './alfrescoWorkflow.service';
import {AlfRESTList} from './AlfRESTList';
import {AlfSiteEntry} from './alfSiteEntry';
import {Task} from './task';
import {TaskDataSource} from './taskDataSource';
import {TaskVar} from './taskVar';


import {TaskListComponent} from './taskList.component';
import {TaskService} from './forms/taskService.service';
import {WorkflowFormComponent} from './forms/workflowform.component';
import {ReviewOfferFormComponent} from './forms/reviewOfferForm.component';
import {ConfirmRightToWorkFormComponent} from './forms/confirmRightToWorkForm.component';
import {ProcessFileFormComponent} from './forms/processFileForm.component';

import {ProcessTaskAssigneeComponent} from './processComponent/processTaskAssignee.component';
import {CurrentProcessTaskComponent} from './processComponent/currentProcessTask.component';
import {OpportunityComponent} from './forms/opportunity/opportunity.component';
import {OpportunityModel} from './forms/opportunity//opportunityModel';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    DocumentListModule,
    UploadModule,
    TagModule,
    ViewerModule
  ],
  declarations: [
    TaskListComponent,
    ProcessTaskAssigneeComponent,
    WorkflowFormComponent,
    ReviewOfferFormComponent,
    ProcessFileFormComponent,
    ConfirmRightToWorkFormComponent,
    CurrentProcessTaskComponent,
    OpportunityComponent
  ],
  exports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    DocumentListModule,
    UploadModule,
    TagModule,
    ViewerModule,
    TaskListComponent,
    WorkflowFormComponent,
    ReviewOfferFormComponent,
    ProcessTaskAssigneeComponent,
    ProcessFileFormComponent,
    CurrentProcessTaskComponent,
    OpportunityComponent
  ],
  entryComponents: [
    WorkflowFormComponent,
    ReviewOfferFormComponent,
    ConfirmRightToWorkFormComponent
  ],
  providers: [
    AlfrescoService,
    AlfrescoWorkflowService,
    TaskService
  ]
})
export class WorkflowModule {}


