import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CdkTableModule} from '@angular/cdk/table';
import {MdSortModule, MdTableModule, MdDialogModule, MdButtonModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../material.module';
import {AppModule} from '../../app.module';

import {CoreModule} from 'ng2-alfresco-core';
import {DataTableModule} from 'ng2-alfresco-datatable';
import {SearchModule} from 'ng2-alfresco-search';
import {DocumentListModule} from 'ng2-alfresco-documentlist';
import {UploadModule} from 'ng2-alfresco-upload';
import {TagModule} from 'ng2-alfresco-tag';
import {LoginModule} from 'ng2-alfresco-login';
import {ViewerModule} from 'ng2-alfresco-viewer';

import {AlfrescoService} from '../../components/alfrescoWorkflow/alfresco.service';
import {AlfrescoWorkflowService} from '../../components/alfrescoWorkflow/alfrescoWorkflow.service';

import {ProductionComponentModule} from '../../components/productionComponentModule/productionComponentModule.module';
import {WorkflowModule} from '../../components/alfrescoWorkflow/workflow.module';

import {MemberNotificationComponent} from '../../components/memberNotification/memberNotification.component';
import {MemberComponent} from './member.component';
import {FirstTimeComponent} from './firsttime.component';
import {ReviewOfferComponent} from './review-offer.component';
import {MemberFilesComponent} from './member-files.component';
import {MemberDashboardComponent} from './member-dashboard.component';
import {MembersRoutingModule} from './members-routing.module';
import {OpportunityComponent} from './opportunity/opportunity.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    MembersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    SearchModule,
    DocumentListModule,
    UploadModule,
    ViewerModule,
    TagModule,
    ProductionComponentModule,
    WorkflowModule
  ],
  declarations: [
    MemberComponent,
    FirstTimeComponent,
    ReviewOfferComponent,
    MemberFilesComponent,
    MemberDashboardComponent,
    MemberNotificationComponent,
    OpportunityComponent
  ],
  exports: [
    CommonModule,
    MaterialModule,
    ProductionComponentModule,
    WorkflowModule
  ],
  entryComponents: [
    FirstTimeComponent
  ],
  providers: [
    AlfrescoService,
    AlfrescoWorkflowService
  ]
})

export class MembersModule {}

