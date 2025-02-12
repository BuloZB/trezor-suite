import { Locator, Page, expect } from '@playwright/test';

import { NetworkSymbol } from '@suite-common/wallet-config';

export class WalletActions {
    readonly walletMenuButton: Locator;
    readonly searchInput: Locator;
    readonly accountChevron: Locator;
    readonly cardanoAccountLabels: { [key: string]: Locator };
    readonly walletStakingButton: Locator;
    readonly stakeAddress: Locator;
    readonly accountMenuButton: Locator;
    readonly walletExtraDropDown: Locator;
    readonly coinMarketBuyButton: Locator;
    readonly coinMarketDropdownBuyButton: Locator;

    constructor(private readonly page: Page) {
        this.walletMenuButton = this.page.getByTestId('@suite/menu/wallet-index');
        this.searchInput = this.page.getByTestId('@wallet/accounts/search-icon');
        this.accountChevron = this.page.getByTestId('@account-menu/arrow');
        this.cardanoAccountLabels = {
            normal: this.page.getByTestId('@account-menu/ada/normal/0/label'),
            legacy: this.page.getByTestId('@account-menu/ada/legacy/0/label'),
            ledger: this.page.getByTestId('@account-menu/ada/ledger/0/label'),
        };
        this.walletStakingButton = this.page.getByTestId('@wallet/menu/staking');
        this.stakeAddress = this.page.getByTestId('@cardano/staking/address');
        this.accountMenuButton = this.page.getByTestId('@account-menu/btc/normal/0');
        this.walletExtraDropDown = this.page.getByTestId('@wallet/menu/extra-dropdown');
        this.coinMarketBuyButton = this.page.getByTestId('@wallet/menu/wallet-coinmarket-buy');
        this.coinMarketDropdownBuyButton = this.page
            .getByRole('list')
            .getByTestId('@wallet/menu/wallet-coinmarket-buy');
    }

    async filterTransactions(transaction: string) {
        await this.searchInput.click();
        await this.searchInput.fill(transaction, { force: true });
    }

    async expandAllAccountsInMenu() {
        for (const chevron of await this.accountChevron.all()) {
            await chevron.click();
        }
    }

    async checkStakesOfCardanoAccounts() {
        for (const type in this.cardanoAccountLabels) {
            await this.cardanoAccountLabels[type].click();
            await this.walletStakingButton.click();
            await expect(this.stakeAddress).toBeVisible();
        }
    }

    async getAccountsCount(symbol: NetworkSymbol) {
        return await this.page
            .locator(`[data-testid*="@account-menu/${symbol}"][tabindex]`)
            .count();
    }

    async openCoinMarket() {
        await this.accountMenuButton.click();
        //TODO: #16073 We cannot set resolution for Electron. on CI button is hidden under dropdown due to a breakpoint
        const isBuyButtonHidden = !(await this.coinMarketBuyButton.isVisible());
        if (isBuyButtonHidden) {
            await this.walletExtraDropDown.click();
            await this.coinMarketDropdownBuyButton.click();
        } else {
            await this.coinMarketBuyButton.click();
        }
    }
}
