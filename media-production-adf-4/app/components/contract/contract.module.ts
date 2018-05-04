import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {MaterialModule} from '../../material.module';

import {CoreModule} from 'ng2-alfresco-core';
import {UploadModule} from 'ng2-alfresco-upload';
import {TagModule} from 'ng2-alfresco-tag';
import {ViewerModule} from 'ng2-alfresco-viewer';

import {ContractService} from './contract.service';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    UploadModule,
    TagModule,
    ViewerModule
  ],
  declarations: [
  ],
  exports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    UploadModule,
    TagModule,
    ViewerModule
  ],
  entryComponents: [
  ],
  providers: [
    ContractService
  ]
})
export class ContractModule {}
