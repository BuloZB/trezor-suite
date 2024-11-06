/* eslint-disable @typescript-eslint/no-unused-expressions */
// @group_settings
// @retry=2

import { EventType } from '@trezor/suite-analytics';

import { ExtractByEventType, Requests } from '../../support/types';
import { onNavBar } from '../../support/pageObjects/topBarObject';
import { onSettingGeneralPage } from '../../support/pageObjects/settings/settingsGeneralObject';
import { Currency } from '../../support/enums/currency';
import { Language } from '../../support/enums/language';
import { Theme } from '../../support/enums/theme';

let requests: Requests;

describe('General settings', () => {
    beforeEach(() => {
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', { needs_backup: false });
        cy.task('startBridge');
        cy.viewport('macbook-13').resetDb();
        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
        cy.discoveryShouldFinish();

        requests = [];
        cy.interceptDataTrezorIo(requests);
    });

    it('Change settings on "general settings" page', () => {
        // usd is default currency
        cy.getTestElement('@dashboard/index').should('contain', '$0.00');

        // go to settings
        onNavBar.openSettings();

        // close desktop banner
        cy.getTestElement('@banner/install-desktop-suite/close-button').click({
            scrollBehavior: false,
        });

        // change fiat
        onSettingGeneralPage.changeFiatCurrency(Currency.EUR);

        cy.findAnalyticsEventByType<ExtractByEventType<EventType.SettingsGeneralChangeFiat>>(
            requests,
            EventType.SettingsGeneralChangeFiat,
        ).then(settingsGeneralChangeFiatEvent => {
            expect(settingsGeneralChangeFiatEvent.fiat).to.equal('eur');
        });

        // go to dashboard and check currency
        cy.getTestElement('@suite/menu/suite-index').click();
        cy.getTestElement('@dashboard/index').should('contain', '€0.00');

        // go to settings
        onNavBar.openSettings();

        // change dark mode
        onSettingGeneralPage.changeTheme(Theme.Dark);

        cy.findAnalyticsEventByType<ExtractByEventType<EventType.SettingsGeneralChangeTheme>>(
            requests,
            EventType.SettingsGeneralChangeTheme,
        ).then(settingsGeneralChangeThemeEvent => {
            expect(settingsGeneralChangeThemeEvent.platformTheme).to.not.be.undefined;
            expect(settingsGeneralChangeThemeEvent.previousTheme).to.not.be.undefined;
            expect(settingsGeneralChangeThemeEvent.previousAutodetectTheme).to.equal('true');
            expect(settingsGeneralChangeThemeEvent.autodetectTheme).to.equal('false');
            expect(settingsGeneralChangeThemeEvent.theme).to.equal('dark');
        });

        // there is suite version also listed
        cy.contains('Suite version');
        cy.contains('Current version');

        // change language
        onSettingGeneralPage.changeLanguage(Language.Spanish);

        cy.findAnalyticsEventByType<ExtractByEventType<EventType.SettingsGeneralChangeLanguage>>(
            requests,
            EventType.SettingsGeneralChangeLanguage,
        ).then(settingsGeneralChangeLanguageEvent => {
            expect(settingsGeneralChangeLanguageEvent.language).to.equal('es');
            expect(settingsGeneralChangeLanguageEvent.previousLanguage).to.equal('en');
            expect(settingsGeneralChangeLanguageEvent.autodetectLanguage).to.equal('false');
            expect(settingsGeneralChangeLanguageEvent.previousAutodetectLanguage).to.equal('true');
            expect(settingsGeneralChangeLanguageEvent.platformLanguages).to.not.be.undefined;
        });

        // toggle analytics
        cy.getTestElement('@analytics/toggle-switch').find('input').should('be.checked');
        cy.getTestElement('@analytics/toggle-switch').click({ force: true });
        cy.getTestElement('@analytics/toggle-switch').find('input').should('not.be.checked');

        cy.findAnalyticsEventByType<ExtractByEventType<EventType.SettingsAnalytics>>(
            requests,
            EventType.SettingsAnalytics,
        ).then(settingsAnalyticsEvent => {
            expect(settingsAnalyticsEvent.value).to.equal('false');
        });

        // TODO: enable this after https://github.com/trezor/trezor-suite/issues/13262 is fixed
        // // and reset app button - wipes db, reloads app, shows onboarding again
        // cy.getTestElement('@settings/reset-app-button').click({ force: true });
        // cy.getTestElement('@onboarding/welcome', { timeout: 20000 }).should('be.visible');
    });
});
