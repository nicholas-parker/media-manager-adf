import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ProductionDashboardComponent} from './production-dashboard.component';
import {ProductionComponent} from './production.component';
import {DefaultRoleComponent} from './defaultRoles/defaultRole.component';
import {RolePlanningComponent} from './rolePlanning/rolePlanning.component';
import {ProductionFilesComponent} from './productionFiles/productionFiles.component';
import {FileDetailComponent} from './productionFiles/fileDetail.component';
import {AdminComponent} from './admin/admin.component';

const productionRoutes: Routes = [
  {
    path: 'production/:id',
    component: ProductionComponent,
    children: [
      {
        path: '',
        children: [
          {
            path: ':id/defaultRoles',
            component: DefaultRoleComponent
          },
          {
            path: ':id/rolePlanning',
            component: RolePlanningComponent
          },
          {
            path: '',
            component: ProductionDashboardComponent
          },
          {
            path: ':id/documents',
            component: ProductionFilesComponent
          },
          {
            path: 'repository/:node-id',
            component: FileDetailComponent
          },
          {
            path: 'admin',
            component: AdminComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(productionRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ProductionRoutingModule {}
