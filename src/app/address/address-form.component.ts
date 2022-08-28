import { Component, Input } from '@angular/core';

import { Address } from '@model';
import { formContainerViewProvider } from '@core';
import { FORMS } from '@imports';
import { toSelectOptions } from '@app/widgets';
import { UsStates } from '@model';

const states = toSelectOptions(UsStates, 'name', 'abbreviation');

@Component({
  selector: 'app-address-form',
  standalone: true,
  templateUrl: './address-form.component.html',
  viewProviders: [formContainerViewProvider],
  imports: [FORMS],
})
export class AddressFormComponent {
  @Input() vm?: Address

  /** Name for the formGroup when added to the parent form. Defaults to 'address'. */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('name') ngModelGroupName = 'address';

  states = states;
}
