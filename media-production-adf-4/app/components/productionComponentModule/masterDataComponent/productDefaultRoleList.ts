/**
* a class which represent the master default roles applied to a product
*
*/
import {DefaultRole} from '../../../modules/production/defaultRoles/defaultRole';

export class ProductDefaultRoleList {

  /**
   * 
   * the product class
   * 
   */
  public productClass: string;

  /**
   * 
   * the product in the class this list applies to
   * 
   */
  public applicableProduction: string[];

  /**
   * 
   * the default roles
   * 
   */
  public defaultRoles: DefaultRole[];

}
}