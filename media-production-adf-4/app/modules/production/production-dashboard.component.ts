import { Component, OnInit } from '@angular/core';
import { TaskListComponent } from '../../components/alfrescoWorkflow/taskList.component';
import { ProductionRolePieCharts } from '../../components/roleCharts/productionRolePieCharts.component';


@Component({
  selector: 'production-dashboard',
  templateUrl: './production-dashboard.component.html',
  styleUrls: ['./production.component.css']
})
export class ProductionDashboardComponent implements OnInit {
    
 
  ngOnInit() {
  }
  
}
