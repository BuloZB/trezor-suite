import { useCoinmarketBuyForm } from 'src/hooks/wallet/coinmarket/form/useCoinmarketBuyForm';
import { CoinmarketFormContext } from 'src/hooks/wallet/coinmarket/form/useCoinmarketCommonForm';
import { UseCoinmarketProps } from 'src/types/coinmarket/coinmarket';
import { CoinmarketContainer } from 'src/views/wallet/coinmarket/common/CoinmarketContainer';
import { CoinmarketOffers } from 'src/views/wallet/coinmarket/common/CoinmarketOffers/CoinmarketOffers';

const CoinmarketBuyOffersComponent = ({ selectedAccount }: UseCoinmarketProps) => {
    const coinmarketBuyFormContextValues = useCoinmarketBuyForm({
        selectedAccount,
        pageType: 'offers',
    });

    return (
        <CoinmarketFormContext.Provider value={coinmarketBuyFormContextValues}>
            <CoinmarketOffers />
        </CoinmarketFormContext.Provider>
    );
};

export const CoinmarketBuyOffers = () => (
    <span data-testid="@coinmarket/buy-offers">
        <CoinmarketContainer SectionComponent={CoinmarketBuyOffersComponent} />
    </span>
);
