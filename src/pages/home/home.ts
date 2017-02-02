import { Component } from '@angular/core';
import { MenuController, Refresher, NavController, PopoverController, Platform } from 'ionic-angular';
import { CallNumber, InAppBrowser } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { UtilsService } from '../../providers/utils.service';
import { LoginService } from '../../providers/login.service';
import { SchoolService } from '../../providers/school.service';
import { GroupService } from '../../providers/group.service';
import { School } from '../../model/school';
import { Role } from '../../model/role';
import { Group } from '../../model/group';
import { Teacher } from '../../model/teacher';
import { Student } from '../../model/student';
import { SchoolPage } from '../../pages/school/school';
import { PopoverPage } from '../../pages/home/popover/popover';
import { TeachersPage } from '../../pages/teachers/teachers';
import { StudentsPage } from '../../pages/students/students';
import { GroupPage } from '../../pages/group/group';

@Component({
  selector: 'page-home',
  templateUrl: './home.html'
})
export class HomePage {

  public school: School;
  public teachersCount: number;
  public studentsCount: number;
  public groups: Array<Group>;

  public myRole: Role;
  public role = Role;

  constructor(
    public loginService: LoginService,
    public utilsService: UtilsService,
    public groupService: GroupService,
    public schoolService: SchoolService,
    public platform: Platform,
    public translateService: TranslateService,
    public popoverController: PopoverController,
    public menuController: MenuController,
    public navController: NavController) {

    this.myRole = this.utilsService.role;
  }

  /**
   * Fires when the page appears on the screen.
   * Used to get all the data needed in page
   */
  public ionViewDidEnter(): void {

    this.menuController.enable(true);
    this.utilsService.showLoading(this.translateService.instant('APP.WAIT'));

    this.getHomeInfo();
  }

  /**
   * This method returns the school information from the
   * backend. This call is called on the constructor or the
   * refresh event
   * @param {Refresher} Refresher element
   */
  private getHomeInfo(refresher?: Refresher): void {

    // if the user is the SCHOOLADMIN get more information abaout the school
    // and the members
    if (this.myRole === Role.SCHOOLADMIN) {

      this.schoolService.getMySchool().subscribe(
        ((value: School) => {
          this.school = value;

          this.schoolService.getMySchoolTeachersCount().subscribe(
            ((value: number) => {
              this.teachersCount = value;

              this.schoolService.getMySchoolStudentsCount().finally(() => {
                refresher ? refresher.complete() : null;
                this.utilsService.removeLoading();
              }).subscribe(
                ((value: number) => this.studentsCount = value),
                error => this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error));
            }),
            error => this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error));
        }),
        error => this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error));

    } else if (this.myRole === Role.TEACHER) {

      this.schoolService.getMySchool().finally(() => {
        refresher ? refresher.complete() : null;
        this.utilsService.removeLoading();
      }).subscribe(
        ((value: School) => {
          this.school = value;

          this.groupService.getMyGroups().subscribe(
            ((value: Array<Group>) => this.groups = value),
            error => this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error));
        }),
        error => this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error));

    } else if (this.myRole === Role.STUDENT) {

      this.schoolService.getMySchool().finally(() => {
        refresher ? refresher.complete() : null;
        this.utilsService.removeLoading();
      }).subscribe(
        ((value: School) => this.school = value),
        error => this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error));
    }
  }

  /**
   * Method called from the home page to open the list of the
   * teachers of the school of the current user
   */
  public goToTeachers(): void {

    this.utilsService.showLoading(this.translateService.instant('APP.WAIT'));

    this.schoolService.getMySchoolTeachers().subscribe(
      ((value: Array<Teacher>) => this.navController.push(TeachersPage, { teachers: value })),
      error => {
        this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error);
        this.utilsService.removeLoading();
      });
  }

  /**
   * Method called from the home page to open the list of the
   * students of the school of the current user
   */
  public goToStudents(): void {

    this.utilsService.showLoading(this.translateService.instant('APP.WAIT'));

    this.schoolService.getMySchoolStudents().subscribe(
      ((value: Array<Student>) => this.navController.push(StudentsPage, { students: value })),
      error => {
        this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error);
        this.utilsService.removeLoading();
      });
  }

  /**
  * Method called from the home page to open the list of the
  * students of the group of the current user
  */
  public goToGroup(group: Group): void {

    this.utilsService.showLoading(this.translateService.instant('APP.WAIT'));

    this.groupService.getMyGroupStudents(group.id).subscribe(
      ((value: Array<Student>) => this.navController.push(GroupPage, { students: value, group: group })),
      error => {
        this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error);
        this.utilsService.removeLoading();
      });
  }

  /**
   * Method called from the home page to open an external
   * browsser with an url. USer for social links
   * @param url {string} Url to open on an external browser
   */
  public openWebsite(url: string): void {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        new InAppBrowser(url, '_system');
      }
    });
  }

  /**
   * Method called from the home page to open the native
   * phone screen to call a number
   * @param number {string} Number to call with the native phone
   */
  public callNumber(number: string): void {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        CallNumber.callNumber(number, false);
      }
    });
  }

  /**
   * Method called from the home page to open the details of the
   * school of the current user
   */
  public goToSchool(): void {

    this.utilsService.showLoading(this.translateService.instant('APP.WAIT'));

    this.schoolService.getMySchool().subscribe(
      ((value: School) => this.navController.push(SchoolPage, { school: value })),
      error => {
        this.utilsService.showAlert(this.translateService.instant('APP.ERROR'), error);
        this.utilsService.removeLoading();
      });
  }

  /**
   * Thi method presents the more popover on the home
   * page to perform some common methods into the application
   */
  public presentPopover(event: UIEvent): void {

    let popover = this.popoverController.create(PopoverPage, { nav: this.navController });

    popover.present({
      ev: event
    });
  }
}
