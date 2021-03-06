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


import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MdDialog } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { AlfrescoContentService, FileUploadCompleteEvent, FolderCreatedEvent, NotificationService, PermissionsEnum, SiteModel, UploadService } from 'ng2-alfresco-core';
import { DocumentListComponent, DropdownSitesComponent, PermissionStyleModel } from 'ng2-alfresco-documentlist';

import { CreateFolderDialogComponent } from '../../dialogs/create-folder.dialog';

@Component({
    selector: 'files-component',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {
  // The identifier of a node. You can also use one of these well-known aliases: -my- | -shared- | -root-
  currentFolderId: string = '-my-';

  errorMessage: string = null;
  fileNodeId: any;
  fileShowed: boolean = false;

  useCustomToolbar = true;
    toolbarColor = 'default';
    useDropdownBreadcrumb = false;

    selectionModes = [
        { value: 'none', viewValue: 'None' },
        { value: 'single', viewValue: 'Single' },
        { value: 'multiple', viewValue: 'Multiple' }
    ];

    @Input()
    selectionMode = 'multiple';

    @Input()
    multiselect = false;

  @Input()
  multipleFileUpload: boolean = false;

  @Input()
  disableWithNoPermission: boolean = false;

  @Input()
  folderUpload: boolean = false;

  @Input()
  acceptedFilesTypeShow: boolean = false;

  @Input()
  versioning: boolean = false;

  @Input()
  acceptedFilesType: string = '.jpg,.pdf,.js';

  @Input()
  enableUpload: boolean = true;

  @ViewChild(DocumentListComponent)
  documentList: DocumentListComponent;

    permissionsStyle: PermissionStyleModel[] = [];

    constructor(private changeDetector: ChangeDetectorRef,
              private notificationService: NotificationService,
                private uploadService: UploadService,
                private contentService: AlfrescoContentService,
                private dialog: MdDialog,
              @Optional() private route: ActivatedRoute) {
    }

    showFile(event) {
        if (event.value.entry.isFile) {
            this.fileNodeId = event.value.entry.id;
            this.fileShowed = true;
        } else {
            this.fileShowed = false;
        }
    }

    toggleFolder() {
        this.multipleFileUpload = false;
        this.folderUpload = !this.folderUpload;
        return this.folderUpload;
    }

  ngOnInit() {
  if (this.route) {
    this.route.params.forEach((params: Params) => {
      if (params['id']) {
        this.currentFolderId = params['id'];
        this.changeDetector.detectChanges();
      }
    });
  }

        // this.uploadService.fileUploadComplete.debounceTime(300).subscribe(value => this.onFileUploadComplete(value)); NVP
        console.log('This wont work, file.component.ts 116 commented by NVP as it gave transpiler error');
        this.contentService.folderCreated.subscribe(value => this.onFolderCreated(value));

        // this.permissionsStyle.push(new PermissionStyleModel('document-list__create', PermissionsEnum.CREATE));
        // this.permissionsStyle.push(new PermissionStyleModel('document-list__disable', PermissionsEnum.NOT_CREATE, false, true));
    }

    onNavigationError(err: any) {
        if (err) {
            this.errorMessage = err.message || 'Navigation error';
        }
    }

    resetError() {
        this.errorMessage = null;
    }

    onFileUploadComplete(event: FileUploadCompleteEvent) {
        if (event && event.file.options.parentId === this.documentList.currentFolderId) {
          this.documentList.reload();
        }
      }

    onFolderCreated(event: FolderCreatedEvent) {
        console.log('FOLDER CREATED');
        console.log(event);
        if (event && event.parentId === this.documentList.currentFolderId) {
            this.documentList.reload();
        }
    }

    handlePermissionError(event: any) {
        this.notificationService.openSnackMessage(
            `You don't have the ${event.permission} permission to ${event.action} the ${event.type} `,
            4000
        );
    }

    onCreateFolderClicked(event: Event) {
        let dialogRef = this.dialog.open(CreateFolderDialogComponent);
        dialogRef.afterClosed().subscribe(folderName => {
            if (folderName) {
                this.contentService.createFolder('', folderName, this.documentList.currentFolderId).subscribe(
                    node => console.log(node),
                    err => console.log(err)
                );
            }
        });
    }

    getSiteContent(site: SiteModel) {
        this.currentFolderId = site && site.guid ? site.guid : '-my-';
    }
}
