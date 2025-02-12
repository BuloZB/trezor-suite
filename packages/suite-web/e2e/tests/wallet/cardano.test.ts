// @group_wallet
// @retry=2

import { onModal } from '../../support/pageObjects/modalObject';
import { onSettingsMenu } from '../../support/pageObjects/settings/settingsMenuObject';
import { onNavBar } from '../../support/pageObjects/topBarObject';

describe('Cardano', () => {
    beforeEach(() => {
        cy.task('startEmu', { wipe: true });

        cy.task('setupEmu', {
            // todo: setup emu with 24 words mnemonic so that we can test different cardano derivation and its 'auto-discovery; feature
            // this is not possible at the moment, probably needs to be implemented in trezor-user-env
            // mnemonic: 'clot trim improve bag pigeon party wave mechanic beyond clean cake maze protect left assist carry guitar bridge nest faith critic excuse tooth dutch',
        });
        cy.task('startBridge');

        cy.viewport('macbook-13').resetDb();
        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
        cy.discoveryShouldFinish();
        onNavBar.openSettings();
        onSettingsMenu.openWalletSettings();
    });

    it('Basic cardano walkthrough', () => {
        // go to coin settings and enable cardano
        cy.getTestElement('@settings/wallet/network/tada').click();

        // open advanced coins settings
        cy.hoverTestElement('@settings/wallet/network/tada');
        cy.getTestElement('@settings/wallet/network/tada/advance').click();
        cy.getTestElement('@modal').matchImageSnapshot('cardano-advanced-settings');
        cy.get('body').type('{esc}');

        // go to cardano account #1
        cy.getTestElement('@suite/menu/suite-index').click();
        cy.discoveryShouldFinish();
        cy.getTestElement('@account-menu/tada/normal/0').click();

        // go to cardano account #1 - account details
        cy.getTestElement('@wallet/menu/wallet-details').click();
        cy.getTestElement('@app').matchImageSnapshot('cardano-account-details');

        // show public key modal
        cy.getTestElement('@wallets/details/show-xpub-button').click();
        // todo: matchImageSnapshot producing diff not obvious why.
        cy.getTestElement('@modal').screenshot('cardano-show-xpub');
        onModal.close();

        //  go to cardano account #1 - send
        cy.getTestElement('@wallet/menu/wallet-send').click();
        cy.getTestElement('@account-subpage/back').last().click();

        //  go to cardano account #1 - receive
        cy.getTestElement('@wallet/menu/wallet-receive').click();
        cy.getTestElement('@wallet/receive/reveal-address-button').click();
        cy.getTestElement('@modal').matchImageSnapshot('cardano-receive');
        cy.task('pressYes');
        cy.wait(501);
        cy.getTestElement('@modal/close-button').click();
        cy.getTestElement('@account-subpage/back').last().click();

        // go to cardano account #1 - staking
        cy.getTestElement('@wallet/menu/staking').click();
        cy.getTestElement('@app').matchImageSnapshot('cardano-tokens');

        // lets 'hack' routing
        onNavBar.openSettings();
        cy.getTestElement('@settings/menu/wallet').click();
        cy.getTestElement('@settings/wallet/network/tada').click();
        cy.go('back');
        cy.go('back');
        cy.getTestElement('@app').matchImageSnapshot('staking-not-enabled');
    });
});
