/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Editor3DModule} from 'ng2-3d-editor';
import {MdSortModule, MdTableModule} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from './material.module';
import {NgxChartsModule} from '@swimlane/ngx-charts';

import {CoreModule} from 'ng2-alfresco-core';
import {DataTableModule} from 'ng2-alfresco-datatable';
import {SearchModule} from 'ng2-alfresco-search';
import {DocumentListModule} from 'ng2-alfresco-documentlist';
import {UploadModule} from 'ng2-alfresco-upload';
import {TagModule} from 'ng2-alfresco-tag';
import {LoginModule} from 'ng2-alfresco-login';
import {ViewerModule} from 'ng2-alfresco-viewer';


import {CreateFolderDialogComponent} from './dialogs/create-folder.dialog';
import {AppComponent} from './app.component';

/** feature modules */
import {ProductionComponentModule} from './components/productionComponentModule/productionComponentModule.module';
import {WorkflowModule} from './components/alfrescoWorkflow/workflow.module';
import {ProductionModule} from './modules/production/production.module';
import {StartModule} from './modules/start/start.module';
import {MembersModule} from './modules/members/members.module';
import {routing} from './app.routes';

import {
  HomeComponent,
  SettingsComponent,
  SearchComponent,
  SearchBarComponent,
  FilesComponent,
  LoginDemoComponent,
  AppLoginComponent,
  ProductionRolePieChartsComponent
} from './components/index';

let appConfigFile = 'app.config-dev.json';
if (process.env.ENV === 'production') {
  appConfigFile = 'app.config-prod.json';
}

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    ReactiveFormsModule,
    DataTableModule,
    SearchModule,
    DocumentListModule,
    MaterialModule,
    UploadModule,
    ViewerModule,
    LoginModule,
    Editor3DModule,
    TagModule,
    ProductionComponentModule,
    WorkflowModule,
    ProductionModule,
    StartModule,
    MembersModule,
    NgxChartsModule,
    routing
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    SearchBarComponent,
    SearchComponent,
    FilesComponent,
    CreateFolderDialogComponent,
    LoginDemoComponent,
    SettingsComponent,
    AppLoginComponent
  ],
  exports: [
    ProductionComponentModule,
    WorkflowModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateFolderDialogComponent
  ]

})
export class AppModule {}
