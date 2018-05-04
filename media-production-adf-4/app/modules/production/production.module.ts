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
import {ProductionComponentModule} from '../../components/productionComponentModule/productionComponentModule.module';
import {ContractModule} from '../../components/contract/contract.module';

import {ProductionComponent} from './production.component';
import {ProductionDashboardComponent} from './production-dashboard.component';
import {ContractTemplateService} from './defaultRoles/contractTemplate.service';
import {DefaultRoleService} from './defaultRoles/defaultRole.service';
import {DefaultRoleComponent} from './defaultRoles/defaultRole.component';
import {DefaultRoleListComponent} from './defaultRoles/defaultRole-list.component';
import {DefaultRoleFormComponent} from './defaultRoles/defaultRole-form.component';
import {RolePlanningComponent} from './rolePlanning/rolePlanning.component';
import {RoleListComponent} from './rolePlanning/role-list.component';
import {RoleDetailComponent} from './rolePlanning/roleDetail.component';
import {CreateRoleComponent} from './rolePlanning/createRole.component';
import {ProductionFilesComponent} from './productionFiles/productionFiles.component';
import {FileDetailComponent} from './productionFiles/fileDetail.component';
import {RoleService} from './rolePlanning/role.service';
import {RoleManager} from './rolePlanning/roleManager.service';
import {ProductionRoutingModule} from './production-routing.module';
import {CardViewUpdateService} from 'ng2-alfresco-core';
import {AdminComponent} from './admin/admin.component';
import {RoleTagDialog} from './rolePlanning/roleTagDialog.component';
import {RoleFilterDialog} from './rolePlanning/roleFilterDialog.component';
import {RoleDeleteDialog} from './rolePlanning/roleDeleteDialog.component';
import {WithdrawContractDialog} from './rolePlanning/withdrawContractDialog.component';
import {RoleCategoryHeaderComponent} from './rolePlanning/roleCategoryHeader.component';
import {CompanyComponent} from './admin/company/company.component';
import {ProductionPeriodComponent} from './admin/productionPeriod/productionPeriod.component';
import {CategoryRoleDialog} from './rolePlanning/categoryRoleDialog.component';

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
    ChartsModule,
    ProductionComponentModule,
    ContractModule
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
    RoleDetailComponent,
    ProductionFilesComponent,
    FileDetailComponent,
    ProductionRolePieChartsComponent,
    AdminComponent,
    RoleTagDialog,
    RoleFilterDialog,
    RoleDeleteDialog,
    WithdrawContractDialog,
    CompanyComponent,
    ProductionPeriodComponent,
    RoleCategoryHeaderComponent,
    CategoryRoleDialog
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
    ChartsModule,
    ProductionComponentModule,
    ContractModule
  ],
  entryComponents: [
    DefaultRoleFormComponent,
    CreateRoleComponent,
    RoleTagDialog,
    RoleFilterDialog,
    RoleDeleteDialog,
    WithdrawContractDialog,
    CategoryRoleDialog
  ],
  providers: [
    ContractTemplateService,
    DefaultRoleService,
    RoleService,
    AlfrescoProductionService,
    CardViewUpdateService,
    RoleManager
  ]
})

export class ProductionModule {}
