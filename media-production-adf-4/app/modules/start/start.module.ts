import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { MdSortModule, MdTableModule,  MdDialogModule } from '@angular/material';

import { ProductionComponentModule } from '../../components/productionComponentModule/productionComponentModule.module';
import { StartComponent } from './start.component';
import { StartRoutingModule } from './start-routing.module';

@NgModule({
  imports: [
    CdkTableModule,
    CommonModule, 
    FormsModule, 
    StartRoutingModule,
    MdSortModule,
    MdTableModule,
    MdDialogModule,
    ProductionComponentModule
  ],
  declarations: [
    StartComponent
  ],
  exports: [
    MdSortModule,
    MdTableModule,
    CdkTableModule
  ],
  entryComponents: [
  ],
  providers: [
  ]
}) 
  
export class StartModule {}
