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


import {CdkTableModule} from '@angular/cdk/table';
import {NgModule} from '@angular/core';
import {MdDialogModule, MdInputModule, MdSelectModule, MdSlideToggleModule, MdSortModule, MdTableModule, MdCardModule, MdButtonModule} from '@angular/material';
import {MdDatepickerModule, MdMenuModule, MdIconModule, MdTabsModule, MdListModule, MdGridListModule, MdProgressSpinnerModule, MdRadioModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

const MATERIAL_MODULES = [
  CdkTableModule,
  MdSlideToggleModule,
  MdInputModule,
  MdSelectModule,
  MdDialogModule,
  MdSortModule,
  MdTableModule,
  MdCardModule,
  MdButtonModule,
  MdSelectModule,
  MdDatepickerModule,
  MdMenuModule,
  MdIconModule,
  MdTabsModule,
  MdGridListModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdListModule,
  BrowserAnimationsModule
];

@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES
})
export class MaterialModule {}
