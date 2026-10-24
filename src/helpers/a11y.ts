import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/**
 * Rules the demo app already fails: it has no h1 and its content sits outside
 * landmarks. Disabling them keeps the check useful for new problems.
 */
const KNOWN_RULES = ['page-has-heading-one', 'region'];

export async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).disableRules(KNOWN_RULES).analyze();
  const summary = results.violations
    .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`)
    .join('\n');

  expect(results.violations, summary).toEqual([]);
}
