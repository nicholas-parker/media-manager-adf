import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ProductionDashboardComponent} from './production-dashboard.component';
import {ProductionComponent} from './production.component';
import {DefaultRoleComponent} from './defaultRoles/defaultRole.component';
import {RoleListComponent} from './rolePlanning/role-list.component';
import {RoleDetailComponent} from './rolePlanning/roleDetail.component';
import {ProductionFilesComponent} from './productionFiles/productionFiles.component';
import {FileDetailComponent} from './productionFiles/fileDetail.component';
import {AdminComponent} from './admin/admin.component';
import {CompanyComponent} from './admin/company/company.component';

const productionRoutes: Routes = [
  {
    path: 'production/:id',
    component: ProductionComponent,
    children: [
      {
        path: '',
        children: [
          {
            path: 'defaultRoles',
            component: DefaultRoleComponent
          },
          {
            path: 'rolePlanning',
            component: RoleListComponent
          },
          {
            path: 'roleDetails/:roleId',
            component: RoleDetailComponent
          },
          {
            path: '',
            component: ProductionDashboardComponent
          },
          {
            path: 'documents',
            component: ProductionFilesComponent
          },
          {
            path: 'repository/:node-id',
            component: FileDetailComponent
          },
          {
            path: 'admin',
            component: AdminComponent
          },
          {
            path: 'admin/company',
            component: CompanyComponent
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
