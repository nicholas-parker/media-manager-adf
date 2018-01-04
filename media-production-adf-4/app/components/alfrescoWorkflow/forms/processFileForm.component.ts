/**
 * 
 * A form component for reviewing an assignment offer
 * 
 */
import {Component, OnInit, Input, ViewChild, TemplateRef} from '@angular/core';
import {MdSelectModule, MdDatepickerModule} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AlfrescoContentService, NodesApiService, FileUploadCompleteEvent, UploadService} from 'ng2-alfresco-core';
import {DocumentListComponent, RowFilter, ShareDataRow} from 'ng2-alfresco-documentlist';
import {UploadButtonComponent} from 'ng2-alfresco-upload';

import {Task} from '../task';
import {TaskVar} from '../taskVar';
import {TaskService} from './taskService.service';
import {AlfrescoWorkflowService} from '../alfrescoWorkflow.service';

import {ContentModelConstraints} from '../../alfrescoModel/contentModelConstraints';
import {MdSnackBar} from '@angular/material';

@Component({
  selector: 'process-file',
  templateUrl: './processFileForm.component.html',
  styleUrls: ['processFileForm.component.css', 'workflowform.component.css'],
  providers: [TaskService]
})
export class ProcessFileFormComponent implements OnInit {

  /**
   * 
   * the processId, so we can attach an uploaded file to the package item
   * 
   */
  public processId: number;

  /**
   * 
   *  workflow package nodeId
   *  
   */
  @Input()
  public bpmPackage;


  /**
   * 
   * allow the file delete option
   * 
   */
  @Input()
  public deleteOption: boolean = false;

  /**
   * 
   * file selection option. null, 'single', 'multiple'
   * 
   */
  @Input()
  public selectionOption: string = 'none';

  /**
   * 
   * property the file must have to be listed
   * 
   */
  @Input()
  public fileProperty: string = null;

  /**
   * 
   * a boolean to indicate if we allow file upload
   * 
   */
  @Input()
  public noUpload: boolean = false;

  /**
   * 
   * the maximum number of files to allow in this context
   * 
   */
  @Input()
  public maxFiles: number = 0;

  /**
   * 
   * a flag to indicate if the required file for this process is already part of the workflow package
   * 
   */
  public hasFiles: boolean = false;

  /**
   * 
   * the text to explain to the user why they are uploading file or what file to upload
   * 
   */
  @Input()
  public explainText: string;

  /**
   * the text displayed above the field lists to identify to the user what th files are
   * 
   */
  @Input()
  public fieldDescription: string;

  /**
   * 
   * the aspects to add to the file when uploaded
   * 
   */
  @Input()
  public aspects = null;

  /**
   * 
   * the properties to add to the file when uploaded
   * 
   */
  @Input()
  public properties = null;

  /**
   * 
   * reference to the template to display when no files
   * 
   */
  @Input()
  public noContentText: string = 'Upload content';

  /**
   * 
   * the node where packages are stored, used for the file upload and package list
   * 
   */
  public set packageNodeId(nodeId) {

    this.packageNodeId = nodeId;
    this.uploadButton.rootFolderId = nodeId;

  }

  @ViewChild(DocumentListComponent)
  private documentList: DocumentListComponent;

  @ViewChild(UploadButtonComponent)
  private uploadButton: UploadButtonComponent;

  /**
   * 
   * the function which implements the row filtering based on prod:docCategory
   * 
   */
  private docTypeFilter: RowFilter;

  /**
   * 
   *  the type of document to be listed, prod:docType
   * 
   */
  @Input()
  public docType: string = null;

  constructor(private workflowService: AlfrescoWorkflowService,
    private snackBar: MdSnackBar,
    private nodeService: NodesApiService) {

    /**
     * 
     * a filter which will exclude files which are no of the required prod:docType
     * 
     */
    this.docTypeFilter = (row: ShareDataRow) => {

      console.log(row);

      /**
       * 
       * if no docCategory has been defined then show all rows
       */
      if (this.docType === null) {return true;}

      let node = row.node.entry;

      if (node && node.properties['prod:docType'] === this.docType) {
        return true;
      }

      return false;
    };

  }

  public ngOnInit() {

    console.log(this.uploadButton);

  }

  /**
   *  
   */
  private getProcessPackage() {

  }

  /*
   * 
   * called when the file list is loaded, checks if the singleFile flag is set.
   * If the singleFile flag is set and there is one file then the upload button is removed
   * 
   */
  filesLoaded() {

    this.checkMaxFiles();

  }

  /**
   * 
   * checks the number of files in the file list against the maximum number of files.
   * If it is the same as max then the upload button is disabled
   * 
   */
  checkMaxFiles() {

    console.log('Doclist data');
    console.log(this.documentList.dataTable);

    if (this.maxFiles > 0) {

      if (this.documentList.dataTable.data.rows.length >= this.maxFiles) {

        /**
         * 
         * max files achieved
         * 
         */
        this.uploadButton.disabled = true;

      } else {

        /**
         * 
         * max files still to be reached
         * 
         */
        this.uploadButton.disabled = false;

      }
    }

  }



  /**
   * 
   * this function is called by the upload file component when the file has been successfully uploaded
   * updates the node with the required aspects and aspect values
   * 
   */
  private onFileUploadSuccess(event) {

    let nodeId = event.value.entry.id;

    /**
     * 
     * now added to the process get the properties for the new file
     * 
     */
    this.nodeService.getNode(nodeId).subscribe(

      d1 => {
        /**
         * 
         * update the node properties with the additional properties
         *  
         */
        this.updateNodeProperties(d1);
      },

      err => {
        /**
         * 
         * error retrieving node properties
         * 
         */
        this.snackBar.open('ERROR updating the file properties', err.message, {duration: 3000});
        console.log(err);
      });

    this.documentList.reload();

  }

  /**
   * 
   * this function is called when the file could not be uploaded
   * 
   */
  private onFileUploadError(event) {
    console.log(event);
    this.snackBar.open('ERROR uploading file', event, {duration: 3000});
  }

  /**
   * after uploading a file and associating it with the process set the properties
   */
  private updateNodeProperties(node) {

    console.log('Updating file properties');
    console.log(node);
    let update = {'aspectNames': node.aspectNames, 'properties': node.properties};

    if (null != this.aspects) {
      update.aspectNames = node.aspectNames.concat(this.aspects);
    }

    if (null != this.properties) {
      update.properties = Object.assign(node.properties, this.properties);
    }

    this.nodeService.updateNode(node.id, update).subscribe(
      data => {
        this.snackBar.open('File uploaded', null, {duration: 3000});
        this.listProcessFiles();
      },
      err => {this.snackBar.open('ERROR problem setting file properties', err.message, {duration: 3000});});

  }

  /**
   * 
   */
  private listProcessFiles() {

    this.documentList.reload();

  }


  /**
   * 
   * display the file in the file viewer
   * 
   */
  private showFile(event) {

  }

}
