import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AlfrescoContentService} from 'ng2-alfresco-core';
import {MyProductionsBigComponent} from '../../components/productionComponentModule/myProductionsBig.component';
import {TaskListComponent} from '../../components/alfrescoWorkflow/taskList.component';
import {MemberNotificationComponent} from '../../components/memberNotification/memberNotification.component';

/**
 * 
 * Member dashboard component.  Displays a list of personal tasks & contracts
 * 
 */
@Component({
  selector: 'member-dashboard',
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.css']
})

export class MemberDashboardComponent {

}
