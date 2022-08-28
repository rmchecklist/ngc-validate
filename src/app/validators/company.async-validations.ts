import { create, enforce, group, only, test, omitWhen } from 'vest';

import { AppValidationContext } from './app-validation-context';
import { Company } from '@model';
import {
  FeinValidationResponse,
  isGoodFein,
} from '@services/fein-validation.service';
import {
  ValidationContext,
  ValidationSuite,
  ValidationSuiteFn,
} from '@validation';

export function createCompanyAsyncValidationSuite() {
  return create(
    'CompanyAsyncValidationSuite',
    (
      model: Partial<Company>,
      field?: string,
      groupName?: string,
      context?: ValidationContext
    ) => {
      only(field); // if field defined, limit to tests of this field
      only.group(groupName); // if groupName defined, limit to tests of this group
      group('company', () =>
        companyAsyncValidations(model, field, groupName, context)
      );
    }
  ) as ValidationSuite;
}

export const companyAsyncValidationSuite: ValidationSuite =
  createCompanyAsyncValidationSuite();

/** Company Asynchronous Validation Suite */
export const companyAsyncValidations: ValidationSuiteFn = (
  model: Partial<Company>,
  field?: string,
  groupName?: string,
  context?: ValidationContext
) => {
  model = model ?? {};

  const fvs = (<AppValidationContext>context)?.feinValidationService;
  /** FEIN check function (or FN returning "not found" result) */
  const checkFein = fvs
    ? fvs.check.bind(fvs)
    : // No fvs? This is almost certainly a bug. Remember to provide a context.
      (fein: string) => Promise.resolve<FeinValidationResponse>({ fein });

  omitWhen(!isGoodFein(model.fein), () => {
    // these validations will be completely omitted if the FEIN is not valid

    test('legalName', 'Legal Name must match Federal Tax Name', async () => {
      if (model.legalName) {
        const response = await checkFein(model.fein!);
        // console.log('legal name checkFein response', response);
        const name = response.feinName;

        enforce(name)
          .message(
            `Does not match "${name}", the name registered with the IRS for this tax number`
          )
          .isNotBlank()
          .notEquals('*')
          .notEquals(model.legalName.toUpperCase());
      }
      // All other cases are either OK or the test does not apply
    });

    test('fein', 'Tax Number is not registered with the IRS', async () => {
      const response = await checkFein(model.fein!);
      // console.log('fein checkFein response', response);
      enforce(response.feinName).isNotNullish();
    });
  });
};
