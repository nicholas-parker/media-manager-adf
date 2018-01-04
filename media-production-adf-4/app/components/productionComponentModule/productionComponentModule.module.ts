import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '../../material.module';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AlfrescoProductionService} from './alfrescoProduction.service';
import {MyProductionsBigComponent} from './myProductionsBig.component';
import {NewProductionComponent} from './newProduction.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule
  ],
  declarations: [
    MyProductionsBigComponent,
    NewProductionComponent
  ],
  exports: [
    MyProductionsBigComponent,
    NewProductionComponent,
    CommonModule,
    MaterialModule
  ]
})
export class ProductionComponentModule {}


