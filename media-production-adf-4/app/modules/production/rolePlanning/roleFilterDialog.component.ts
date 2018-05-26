/**
 * Class to manage the role filter dialog
 * 
 */
import {Observable} from 'rxjs/Observable';
import {Component, OnInit, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {MdTabsModule, MdSelectModule, MdInputModule, MdDialogRef, MdCheckboxModule, MdDatepickerModule, MdSnackBar, MdRadioModule} from '@angular/material';
import {MdListModule, MdSelectionList, MdListOption} from '@angular/material';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {RoleFilter} from './roleFilter';
import {AlfrescoApiService} from 'ng2-alfresco-core';

@Component({
  selector: 'role-filter-dialog',
  templateUrl: './roleFilterDialog.component.html',
  styleUrls: ['roleFilterDialog.component.css']
})
export class RoleFilterDialog implements OnInit {

  /**
   * 
   * the filter selected by the user
   * 
   */
  public roleFilter: RoleFilter;

  /**
   * 
   * list of the tags to filter on
   * 
   */
  public listOfTags: Observable<any>;

  /**
   * 
   * the ListSelection UI to render the tags and allow selection
   * 
   */
  // @ViewChild(MdSelectionList)
  // public tags: MdSelectionList;

  @Input()
  public filter: RoleFilter;

  /**
   * 
   * charge code value entered from form in UI
   * 
   */
  @Input() set chargeCode(value) {

    console.log('Code change');
    this.roleFilter.chargeCode = value;
    this.filterChanged.emit(this.roleFilter);

  }

  @Output()
  public filterChanged: EventEmitter<RoleFilter>;


  constructor(
    private dialogRef: MdDialogRef<RoleFilterDialog>,
    private apiService: AlfrescoApiService
  ) {

    this.filterChanged = new EventEmitter<RoleFilter>();

  }

  /**
   * 
   * initialise, get tags list
   * 
   */
  public ngOnInit() {

    /**
     * 
     * get the data for the tags listlet entry of listOfTags | async
     * 
     */
    Observable.fromPromise(this.apiService.getInstance().core.tagsApi.getTags())
      .subscribe(data => {this.listOfTags = Observable.of(data.list.entries);});

    /**
     * 
     * hook up to tags list changes
     */


    // this.tags.selectedOptions.onChange.subscribe(list => {
    //  this.tagChange(list);
    // });

    /**
     * 
     * set up the filter
     * 
     */
    this.roleFilter = new RoleFilter();
    this.roleFilter.tags = new Array<string>();
    this.roleFilter.status = new Array<string>();

  }

  /**
   * 
   * method called by tag selection list when the content change
   * 
   */
  public tagChange(event) {

    let value = event.source.value;
    if (event.checked === true) {

      this.roleFilter.tags.push(value);

    } else {

      this.roleFilter.tags = this.roleFilter.tags.filter(item => item !== value);

    }

    this.filterChanged.emit(this.roleFilter);

  }

  /**
   * 
   * method called by status selection when the status selection changes
   * 
   */
  public statusChange(event) {

    let value = event.source.value;
    if (event.checked === true) {

      this.roleFilter.status.push(value);

    } else {

      this.roleFilter.status = this.roleFilter.status.filter(item => item !== value);

    }

    this.filterChanged.emit(this.roleFilter);

  }

  /**
   * 
   * charge code change event
   * 
   */
  public chargeCodeChange(event) {

    console.log('Code change');
    this.roleFilter.chargeCode = event.source.value;
    this.filterChanged.emit(this.roleFilter);

  }

  /**
   * 
   * set current filter, called from parent list
   * 
   */
  public setFilter(roleFilter: RoleFilter) {

    this.roleFilter = roleFilter;

  }

  /** 
   * 
   * user closes the form
   * 
   */
  public onCancel() {

    this.dialogRef.close();

  }

  /**
   * 
   * handles error when receiving tag list
   * 
   */
  public tagError(err) {

    console.log('Error getting tag list ' + err);

  }
}
