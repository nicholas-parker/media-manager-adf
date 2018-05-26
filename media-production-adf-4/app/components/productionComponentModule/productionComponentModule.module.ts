import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '../../material.module';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {AlfrescoProductionService} from './alfrescoProduction.service';
import {MyProductionsBigComponent} from './myProductionsBig.component';
import {NewProductionComponent} from './newProduction.component';
import {ProductionContext} from './productionContext';
import {CrewCategorySummaryComponent} from './CrewCategorySummary/crewCategorySummary.component';
import {CrewCategorySummaryService} from './CrewCategorySummary/crewCategorySummary.service';
import {MasterRoleService} from './masterDataComponent/masterRoleService';
import {MasterDocumentService} from './masterDataComponent/masterDocumentService';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    MyProductionsBigComponent,
    NewProductionComponent,
    CrewCategorySummaryComponent
  ],
  exports: [
    MyProductionsBigComponent,
    NewProductionComponent,
    CrewCategorySummaryComponent,
    CommonModule,
    MaterialModule,
    FormsModule
  ],
  providers: [
    MasterDocumentService,
    AlfrescoProductionService,
    ProductionContext,
    CrewCategorySummaryService,
    MasterRoleService
  ]
})
export class ProductionComponentModule {}


