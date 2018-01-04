import {ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {MdDialog} from '@angular/material';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {AlfrescoContentService, FileUploadCompleteEvent, FolderCreatedEvent, NotificationService, PermissionsEnum, SiteModel, UploadService} from 'ng2-alfresco-core';
import {AlfrescoApiService, CreateFolderDialogComponent} from 'ng2-alfresco-core';
import {DocumentListComponent, DropdownSitesComponent, PermissionStyleModel} from 'ng2-alfresco-documentlist';
import {Subject, Observable, Subscription} from 'rxjs/Rx';
import {MinimalNodeEntity, MinimalNodeEntryEntity} from 'alfresco-js-api';

@Component({
  selector: 'production-files',
  templateUrl: './productionFiles.component.html',
  styleUrls: ['./productionFiles.component.css']
})
export class ProductionFilesComponent {

  /**
   * 
   * production root folder if
   * 
   */
  public productionRootFolderId;

  /** 
   * 
   * version files on update
   * 
   */
  @Input()
  versioning: boolean = false;

  /** 
   * 
   * not sure exactly what this is, other than its about permissions
   * 
   */
  permissionsStyle: PermissionStyleModel[] = [];

  /** 
   * 
   * adf-document-list component in template
   * 
   */
  @ViewChild(DocumentListComponent)
  documentList: DocumentListComponent;

  /** 
   * 
   * how many items user can select at once
   * 
   */
  selectionModes = [
    {value: 'none', viewValue: 'None'},
    {value: 'single', viewValue: 'Single'},
    {value: 'multiple', viewValue: 'Multiple'}
  ];

  /**
   * 
   * selection modes
   * 
   */
  @Input()
  selectionMode = 'multiple';
  @Input()
  multiselect = false;

  /** 
   * 
   * a human error message to show to the user
   * 
   */
  errorMessage: string = null;

  /** 
   * 
   * the file node id of the currently clicked file
   * 
   */
  fileNodeId: any;

  /** 
   * 
   * a flag to indicate if a file has been displayed
   * 
   */
  fileShowed: boolean = false;

  /**
   * 
   * 
   * subscription to routing parameters, obervable for documentLibrary container
   * 
   */
  private routeSub: Subscription;
  private docLibObsv: Subscription;

  /**
   * 
   * the id of the production
   * 
   */
  private productionId;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private apiService: AlfrescoApiService,
    private notificationService: NotificationService,
    private contentService: AlfrescoContentService,
    private dialog: MdDialog) {}

  public ngOnInit() {

    this.contentService.folderCreated.subscribe(value => this.onFolderCreated(value));
    this.routeSub = this.route.params.subscribe(params => {
      this.productionId = params['id'];
      console.log('ProductionFiles starting with id ' + this.productionId);
      this.setRootNode(this.productionId);
    });
  }

  public ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.docLibObsv.unsubscribe();
  }

  /**
   * 
   * sets the productionRootFolderId to the Document Library node for the current production
   * 
   */
  private setRootNode(productionSiteId: string) {

    this.docLibObsv = Observable.fromPromise(
      this.apiService.getInstance().core.sitesApi.getSiteContainer(productionSiteId, 'documentLibrary')
    ).subscribe(response => {
      this.productionRootFolderId = response.entry.id;
      this.documentList.currentFolderId = this.productionRootFolderId;
    },
      err => {console.log(err);});
  }

  public getNodesForPermissionCheck(): MinimalNodeEntity[] {
    if (this.documentList.folderNode) {
      return [{entry: this.documentList.folderNode}];
    } else {
      return [];
    }
  }

  public onUploadSuccess($event) {

    this.documentList.reload();
    this.notificationService.openSnackMessage(
      `File uploaded`,
      4000);
  }

  public onDeleteActionPermissionError(event: any) {
    this.notificationService.openSnackMessage(
      `You don't have the '${event.permission}' permission to do a '${event.action}' operation on the ${event.type}`,
      4000);
  }

  public onCreateFolder($event: Event) {
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

  public onFolderCreated(event: FolderCreatedEvent) {
    if (event && event.parentId === this.documentList.currentFolderId) {
      this.documentList.reload();
    }
  }

  public onFolderDetails(event: any) {
    const entry: MinimalNodeEntryEntity = event.value.entry;
    console.log('RepositoryListPageComponent: Navigating to details page for folder: ' + entry.name);
    this.router.navigate(['./production/', this.productionId, 'repository', entry.id]);
  }

  public onDocumentDetails(event: any) {
    const entry: MinimalNodeEntryEntity = event.value.entry;
    console.log('RepositoryListPageComponent: Navigating to details page for document: ' + entry.name);
    this.router.navigate(['./production/', this.productionId, 'repository', entry.id]);
  }
}

