import { expect, test as setup } from '@playwright/test';
import { AUTH_FILE } from '../src/config';
import { LoginPage } from '../src/pages/login.page';
import { CREDENTIALS } from '../src/data/test-data';

setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: AUTH_FILE });
});
