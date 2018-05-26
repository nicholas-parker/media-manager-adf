import {ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {MdDialog} from '@angular/material';
import {ActivatedRoute, Params} from '@angular/router';
import {AlfrescoContentService, FileUploadCompleteEvent, FolderCreatedEvent, NotificationService, PermissionsEnum, SiteModel, UploadService} from 'ng2-alfresco-core';
import {DocumentListComponent, DropdownSitesComponent, PermissionStyleModel} from 'ng2-alfresco-documentlist';
import {Subject} from 'rxjs/Rx';
import {CreateFolderDialogComponent} from 'ng2-alfresco-core';

/**
 * 
 * core member component.  Displays a list of personal tasks & contracts
 * 
 */
@Component({
  selector: 'member-files',
  templateUrl: './member-files.component.html',
  styleUrls: ['./member-files.component.css']
})

export class MemberFilesComponent {

  /**
   *  
   * The identifier of a node. You can also use one of these well-known aliases: -my- | -shared- | -root- 
   * Set to -my- as this is a members listing
   *  
   */
  currentFolderId: string = '-my-';

  /** version files on update */
  @Input()
  versioning: boolean = false;

  /** not sure exactly what this is, other than its about permissions */
  permissionsStyle: PermissionStyleModel[] = [];

  /** adf-document-list component in template */
  @ViewChild(DocumentListComponent)
  documentList: DocumentListComponent;

  /** how many items user can select at once */
  selectionModes = [
    {value: 'none', viewValue: 'None'},
    {value: 'single', viewValue: 'Single'},
    {value: 'multiple', viewValue: 'Multiple'}
  ];
  @Input()
  selectionMode = 'multiple';
  @Input()
  multiselect = false;

  /** a human error message to show to the user */
  errorMessage: string = null;

  /** the file node id of the currently clicked file */
  fileNodeId: any;

  /** a flag to indicate if a file has been displayed */
  fileShowed: boolean = false;


  constructor(private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
    private uploadService: UploadService,
    private contentService: AlfrescoContentService,
    private dialog: MdDialog,
    @Optional() private route: ActivatedRoute) {
  }


  ngOnInit() {

    //
    // This is in the Alfresco original but has been removed becuse we only want users home directory
    //
    // if (this.route) {
    //  this.route.params.forEach((params: Params) => {
    //    if (params['id']) {
    //      this.currentFolderId = params['id'];
    //      this.changeDetector.detectChanges();
    //    }
    //  });
    // }


    // this is the original but doesn't work since 'fileUploadCompleteEvent' is now a subject, 
    // replaced with th two lines below
    //
    // this.uploadService.fileUploadComplete.debounceTime(300).asObservable().subscribe(value => this.onFileUploadComplete(value));
    let subjFUC: Subject<FileUploadCompleteEvent> = this.uploadService.fileUploadComplete;
    subjFUC.asObservable().subscribe(value => this.onFileUploadComplete(value));

    this.contentService.folderCreated.subscribe(value => this.onFolderCreated(value));

    // This was commented out in the original, not sure what it does yet
    //
    // this.permissionsStyle.push(new PermissionStyleModel('document-list__create', PermissionsEnum.CREATE));
    // this.permissionsStyle.push(new PermissionStyleModel('document-list__disable', PermissionsEnum.NOT_CREATE, false, true));

  }

  /**
   * 
   * user hits delete button on toolbar, delete selected items
   * 
   */
  public onDelete() {

  }

  /**
   * 
   * user hits new folder icon on the toolbar, launch the new folder dialog
   * TO-DO: use existing dialogue
   * 
   */
  public onCreateNewFolder() {
    const dialogRef = this.dialog.open(CreateFolderDialogComponent);
    dialogRef.afterClosed().subscribe(folderName => {
      if (folderName) {
        this.contentService.createFolder('', folderName, this.documentList.currentFolderId).subscribe(
          node => console.log(node),
          err => console.log(err)
        );
      }
    });
  }

  /**
   * 
   * file upload is complete, refresh the document list
   * 
   */
  private onFileUploadComplete(event) {
    if (event && event.file.options.parentId === this.documentList.currentFolderId) {
      this.documentList.reload();
    }
  }

  /**
   * 
   * new folder created, refresh the document list
   * 
   */
  private onFolderCreated(event: FolderCreatedEvent) {
    console.log('FOLDER CREATED');
    console.log(event);
    if (event && event.parentId === this.documentList.currentFolderId) {
      this.documentList.reload();
    }
  }

  /**
   * 
   * there was a problem navigating in the file tree, show message to user
   * TODO - change this to toaster
   */
  onNavigationError(err: any) {
    if (err) {
      this.errorMessage = err.message || 'Navigation error';
    }
  }

  /**
   * last navigation was successful, remove any error information
   */
  resetError() {
    this.errorMessage = null;
  }

  showFile(event) {
    if (event.value.entry.isFile) {
      this.fileNodeId = event.value.entry.id;
      this.fileShowed = true;
    } else {
      this.fileShowed = false;
    }
  }

  /**
   * 
   * user tried to do something they ought notta,
   * display the reason why
   * 
   */
  handlePermissionError(event: any) {
    this.notificationService.openSnackMessage(
      `You don't have the ${event.permission} permission to ${event.action} the ${event.type} `,
      4000
    );
  }

}
