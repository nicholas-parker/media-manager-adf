import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FirstTimeComponent} from './firsttime.component';
import {MemberComponent} from './member.component';
import {ReviewOfferComponent} from './review-offer.component';
import {MemberFilesComponent} from './member-files.component';
import {MemberDashboardComponent} from './member-dashboard.component';
import {OpportunityComponent} from './opportunity/opportunity.component';
import {AcceptComponent} from './opportunity/accept.component';
import {NewProductionComponent} from '../../components/productionComponentModule/newProduction.component';

const memberRoutes: Routes = [
  {
    path: 'member',
    component: MemberComponent,
    children: [
      {
        path: '',
        children: [
          {
            path: 'first',
            component: FirstTimeComponent
          },
          {
            path: 'offer/:taskId',
            component: ReviewOfferComponent
          },
          {
            path: 'docs',
            component: MemberFilesComponent
          },
          {
            path: '',
            component: MemberDashboardComponent
          },
          {
            path: 'opportunity/:id',
            component: OpportunityComponent
          },
          {
            path: 'accept/:id',
            component: AcceptComponent
          },
          {
            path: 'production',
            component: NewProductionComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(memberRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MembersRoutingModule {}
