import {AlfrescoAuthenticationService, AlfrescoSettingsService, StorageService, LogService} from 'ng2-alfresco-core';
import {Component, OnInit, ViewChild} from '@angular/core';
import {Validators} from '@angular/forms';
import {Router} from '@angular/router';

declare var document: any;

@Component({
  selector: 'production-app',
  templateUrl: './applogin.component.html',
  styleUrls: ['./applogin.component.css']
})
export class AppLoginComponent {

  @ViewChild('alfrescologin')
  alfrescologin: any;

  providers: string = 'ECM';
  customValidation: any;

  disableCsrf: boolean = false;
  isECM: boolean = true;
  isBPM: boolean = false;
  showFooter: boolean = true;
  customMinLenght: number = 2;

  constructor(private router: Router,
    private storage: StorageService,
    private logService: LogService) {
    this.customValidation = {
      username: ['', Validators.compose([Validators.required, Validators.minLength(this.customMinLenght)])],
      password: ['', Validators.required]
    };
  }

  ngOnInit() {
    // this.alfrescologin.addCustomValidationError('username', 'required', 'LOGIN.MESSAGES.USERNAME-REQUIRED');
    // this.alfrescologin.addCustomValidationError('username', 'minlength', 'LOGIN.MESSAGES.USERNAME-MIN', {minLenght: this.customMinLenght});
    // this.alfrescologin.addCustomValidationError('password', 'required', 'LOGIN.MESSAGES.PASSWORD-REQUIRED');

    // if (this.storage.hasItem('providers')) {
    //    this.providers = this.storage.getItem('providers');
    // }

    this.initProviders();
  }

  private initProviders() {
    this.isECM = true;
    this.isBPM = false;
  }

  private onLogin($event) {
    this.router.navigate(['/member']);
  }

  private onError($event) {
    this.logService.error($event);
  }

}
