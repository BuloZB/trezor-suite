import { ReactNode } from 'react';

import {
    selectAccountTransactionsWithNulls,
    selectIsLoadingAccountTransactions,
} from '@suite-common/wallet-core';

import { WalletLayout, CoinjoinAccountDiscoveryProgress } from 'src/components/wallet';
import { useSelector } from 'src/hooks/suite';
import { AppState } from 'src/types/suite';

import { NoTransactions } from './components/NoTransactions';
import { AccountEmpty } from './components/AccountEmpty';
import { TransactionList } from './TransactionList/TransactionList';
import { TransactionSummary } from './components/TransactionSummary';
import { CoinjoinExplanation } from './CoinjoinExplanation/CoinjoinExplanation';
import { CoinjoinSummary } from './CoinjoinSummary/CoinjoinSummary';
import { TradeBox } from './TradeBox/TradeBox';

interface LayoutProps {
    selectedAccount: AppState['wallet']['selectedAccount'];
    children?: ReactNode;
}

const Layout = ({ selectedAccount, children }: LayoutProps) => (
    <WalletLayout title="TR_NAV_TRANSACTIONS" account={selectedAccount}>
        {children}
    </WalletLayout>
);

export const Transactions = () => {
    const selectedAccount = useSelector(state => state.wallet.selectedAccount);
    const transactionsIsLoading = useSelector(state =>
        selectIsLoadingAccountTransactions(state, selectedAccount.account?.key || null),
    );
    const accountTransactions = useSelector(state =>
        selectAccountTransactionsWithNulls(state, selectedAccount.account?.key || ''),
    );

    if (selectedAccount.status !== 'loaded') {
        return <Layout selectedAccount={selectedAccount} />;
    }

    const { account } = selectedAccount;

    if (account.backendType === 'coinjoin') {
        const isLoading = account.status === 'out-of-sync' && !!account.syncing;
        const isEmpty = !accountTransactions.length;

        return (
            <Layout selectedAccount={selectedAccount}>
                {isLoading && <CoinjoinAccountDiscoveryProgress />}

                {!isLoading && (
                    <>
                        <CoinjoinSummary accountKey={account.key} />

                        {isEmpty ? (
                            <CoinjoinExplanation />
                        ) : (
                            <TransactionList
                                account={account}
                                transactions={accountTransactions}
                                symbol={account.symbol}
                                isLoading={transactionsIsLoading}
                            />
                        )}
                    </>
                )}
            </Layout>
        );
    }

    if (accountTransactions.length > 0 || transactionsIsLoading) {
        return (
            <Layout selectedAccount={selectedAccount}>
                <TransactionSummary account={account} />
                <TradeBox account={account} />
                <TransactionList
                    account={account}
                    transactions={accountTransactions}
                    symbol={account.symbol}
                    isLoading={transactionsIsLoading}
                />
            </Layout>
        );
    }

    if (account.empty) {
        return (
            <Layout selectedAccount={selectedAccount}>
                <AccountEmpty account={selectedAccount.account} />
                <TradeBox account={account} />
            </Layout>
        );
    }

    return (
        <Layout selectedAccount={selectedAccount}>
            <NoTransactions account={account} />
            <TradeBox account={account} />
        </Layout>
    );
};
