import { test, expect } from '../../support/fixtures';

test.describe('T1B1 - Device settings', { tag: ['@group=settings'] }, () => {
    test.use({ emulatorStartConf: { model: 'T1B1', version: '1-main', wipe: true } });
    test.beforeEach(async ({ onboardingPage, settingsPage, dashboardPage }) => {
        await onboardingPage.completeOnboarding();
        // Initiating pin change is not stable when discovery is not yet finished
        await dashboardPage.discoveryShouldFinish();
        await settingsPage.navigateTo();
        await settingsPage.deviceTabButton.click();
    });

    test('enable pin', async ({ page, trezorUserEnvLink, settingsPage }) => {
        await page.getByTestId('@settings/device/pin-switch').click();
        await expect(page.getByTestId('@prompts/confirm-on-device')).toBeVisible();
        await trezorUserEnvLink.pressYes();

        const pinEntryNumber = '1';
        await settingsPage.enterPinOnBlindMatrix(pinEntryNumber);
        await expect(page.getByTestId('@pin/input/1')).toBeVisible();
        await settingsPage.enterPinOnBlindMatrix(pinEntryNumber);
        await expect(page.getByTestId('@toast/pin-changed')).toBeVisible();
    });

    test('pin mismatch', async ({ page, trezorUserEnvLink }) => {
        await page.getByTestId('@settings/device/pin-switch').click();
        await expect(page.getByTestId('@prompts/confirm-on-device')).toBeVisible();
        await trezorUserEnvLink.pressYes();

        await test.step('First input with one number', async () => {
            await page.getByTestId('@pin/input/1').click();
            await page.getByTestId('@pin/submit-button').click();
        });
        await test.step('Second input with two numbers', async () => {
            await page.getByTestId('@pin/input/1').click();
            await page.getByTestId('@pin/input/1').click();
            await page.getByTestId('@pin/submit-button').click();
        });
        await expect(page.getByTestId('@pin-mismatch')).toBeVisible();
        await page.getByTestId('@pin-mismatch/try-again-button').click();
        await expect(page.getByTestId('@prompts/confirm-on-device')).toBeVisible();
        await trezorUserEnvLink.pressYes();
    });

    test('Change homescreen', async ({ settingsPage }) => {
        await settingsPage.changeDeviceBackground('nyancat');
    });

    // TODO: pin caching immediately after it is set
    // TODO: keyboard handling
    // TODO: set auto-lock (needs pin)
});
