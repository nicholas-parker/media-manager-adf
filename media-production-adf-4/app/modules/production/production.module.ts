import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CdkTableModule} from '@angular/cdk/table';
import {MdSortModule, MdTableModule, MdDialogModule, MdButtonModule, MdInputModule, MdListModule, MdCheckboxModule, MdDatepickerModule} from '@angular/material';
import {MaterialModule} from '../../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';

import {AlfrescoProductionService} from '../../components/productionComponentModule/alfrescoProduction.service';
import {AlfrescoService} from '../../components/alfrescoWorkflow/alfresco.service';
import {WorkflowModule} from '../../components/alfrescoWorkflow/workflow.module';
import {ProductionRolePieChartsComponent} from '../../components/roleCharts/productionRolePieCharts.component';

import {ProductionComponent} from './production.component';
import {ProductionDashboardComponent} from './production-dashboard.component';
import {ContractTemplateService} from './defaultRoles/contractTemplate.service';
import {DefaultRoleService} from './defaultRoles/defaultRole.service';
import {DefaultRoleComponent} from './defaultRoles/defaultRole.component';
import {DefaultRoleListComponent} from './defaultRoles/defaultRole-list.component';
import {DefaultRoleFormComponent} from './defaultRoles/defaultRole-form.component';
import {RolePlanningComponent} from './rolePlanning/rolePlanning.component';
import {RoleListComponent} from './rolePlanning/role-list.component';
import {CreateRoleComponent} from './rolePlanning/createRole.component';
import {ProductionFilesComponent} from './productionFiles/productionFiles.component';
import {FileDetailComponent} from './productionFiles/fileDetail.component';
import {RoleService} from './rolePlanning/role.service';
import {ProductionRoutingModule} from './production-routing.module';
import {CardViewUpdateService} from 'ng2-alfresco-core';
import {AdminComponent} from './admin/admin.component';

@NgModule({
  imports: [
    CdkTableModule,
    CommonModule,
    MaterialModule,
    ProductionRoutingModule,
    MdSortModule,
    MdTableModule,
    MdDialogModule,
    MdButtonModule,
    MdInputModule,
    MdDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    WorkflowModule,
    ChartsModule
  ],
  declarations: [
    ProductionComponent,
    ProductionDashboardComponent,
    DefaultRoleComponent,
    DefaultRoleListComponent,
    DefaultRoleFormComponent,
    RolePlanningComponent,
    CreateRoleComponent,
    RoleListComponent,
    ProductionFilesComponent,
    FileDetailComponent,
    ProductionRolePieChartsComponent,
    AdminComponent
  ],
  exports: [
    MdSortModule,
    MdTableModule,
    CdkTableModule,
    MaterialModule,
    MdButtonModule,
    MdInputModule,
    MdDatepickerModule,
    WorkflowModule,
    ChartsModule
  ],
  entryComponents: [
    DefaultRoleFormComponent,
    CreateRoleComponent
  ],
  providers: [
    ContractTemplateService,
    DefaultRoleService,
    RoleService,
    AlfrescoProductionService,
    CardViewUpdateService
  ]
})

export class ProductionModule {}
