import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject, Subject} from 'rxjs/Rx';
import {ProductDefaultRoleList} from './productDefaultRoleList';
import {DefaultRole} from '../../../modules/production/defaultRoles/defaultRole';
import {DataSource, CollectionViewer} from '@angular/cdk/collections';
import {MinimalNodeEntity, MinimalNodeEntryEntity} from 'alfresco-js-api';
import {AlfrescoApiService, CreateFolderDialogComponent} from 'ng2-alfresco-core';

@Injectable()
export class MasterDocumentService {

  constructor(private alfrescoApi: AlfrescoApiService) {

  }

  public getMasterContracts(productCategory: string, product: string): Observable<any> {

    return this.getMasterContractContainer()
      .flatMap((masterContainerId: string) => {
        return Observable.fromPromise(this.alfrescoApi.nodesApi.getNodeChildren(masterContainerId));
      });

  }

  private getMasterContractContainer(): Observable<string> {

    let ContainerNodeId = '8f008191-ea51-46d1-b21c-9a5b2db60265';
    return Observable.of(ContainerNodeId);

  }

}
