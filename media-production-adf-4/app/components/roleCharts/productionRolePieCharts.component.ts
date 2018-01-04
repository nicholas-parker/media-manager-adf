import { Component, OnInit } from '@angular/core';
import { ProductionRoleStatsService } from './productionRoleStatsService.service';
import { ChartsModule } from 'ng2-charts';

@Component({
    selector: 'role-pie-charts',
    templateUrl : './productionRolePieCharts.component.html',
    styleUrls: ['./productionRolePieCharts.component.css'],
    providers: [ ProductionRoleStatsService ]
})
export class ProductionRolePieChartsComponent {

  /**
   * 
   * the data and labels for the roleCompletion chart
   * 
   */
  public roleCompletionData: number[] = [15, 35, 5];
  public roleCompletionLabels: string[] = ['Assured', 'Proposed', 'Pending'];
  
  /**
   * 
   * the data and labels for the roleFinance chart
   * 
   */
  public roleFinanceData: number[] = [175000, 75000, 35000];
  public roleFinanceLabels: string[] = ['Confirmed', 'Unconfirmed', 'Unconfirmed Variance'];
  
  public doughnutChartType: string = 'doughnut';
  
}
