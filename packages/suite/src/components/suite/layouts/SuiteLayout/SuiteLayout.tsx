import { useRef, useState, ReactNode, useEffect, useCallback } from 'react';

import styled from 'styled-components';

import {
    ElevationContext,
    ElevationDown,
    ElevationUp,
    NewModal,
    variables,
} from '@trezor/components';
import { spacingsPx } from '@trezor/theme';

import { SuiteBanners } from 'src/components/suite/banners';
import { Metadata } from 'src/components/suite';
import { GuideRouter, GuideButton } from 'src/components/guide';
import { HORIZONTAL_LAYOUT_PADDINGS, MAX_CONTENT_WIDTH } from 'src/constants/suite/layout';
import { DiscoveryProgress } from 'src/components/wallet';
import { useLayoutSize, useSelector } from 'src/hooks/suite';
import { LayoutContext, LayoutContextPayload } from 'src/support/suite/LayoutContext';
import { useResetScrollOnUrl } from 'src/hooks/suite/useResetScrollOnUrl';
import { useClearAnchorHighlightOnClick } from 'src/hooks/suite/useClearAnchorHighlightOnClick';
import { ModalContextProvider } from 'src/support/suite/ModalContext';
import { MobileAccountsMenu } from 'src/components/wallet/WalletLayout/AccountsMenu/MobileAccountsMenu';
import { selectSelectedAccount } from 'src/reducers/wallet/selectedAccountReducer';
import {
    ResponsiveContextProvider,
    useResponsiveContext,
} from 'src/support/suite/ResponsiveContext';

import { ModalSwitcher } from '../../modals/ModalSwitcher/ModalSwitcher';
import { MobileMenu } from './MobileMenu/MobileMenu';
import { Sidebar } from './Sidebar/Sidebar';
import { CoinjoinBars } from './CoinjoinBars/CoinjoinBars';
import { useAppShortcuts } from './useAppShortcuts';

export const SCROLL_WRAPPER_ID = 'layout-scroll';
export const Wrapper = styled.div`
    display: flex;
    flex: 1;
    flex-direction: row;
    overflow: auto;
`;

export const PageWrapper = styled.div`
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100dvh;
    overflow-x: hidden;
`;

export const Body = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden hidden;
`;

// AppWrapper and MenuSecondary creates own scrollbars independently
export const Columns = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1 0 100%;
    overflow: auto;
    padding: 0;
`;

export const AppWrapper = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: auto scroll;
    width: 100%;
    background: ${({ theme }) => theme.backgroundSurfaceElevation0};
    align-items: center;
    position: relative;

    ${variables.SCREEN_QUERY.BELOW_LAPTOP} {
        overflow-x: hidden;
    }
`;

export const ContentWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    max-width: ${MAX_CONTENT_WIDTH};
    padding: ${spacingsPx.lg} ${HORIZONTAL_LAYOUT_PADDINGS} 134px ${HORIZONTAL_LAYOUT_PADDINGS};

    ${variables.SCREEN_QUERY.MOBILE} {
        padding-bottom: ${spacingsPx.xxxxl};
    }
`;

export const MainContentContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    overflow-x: hidden;
`;

type MainContentProps = {
    children: ReactNode;
};

export const MainContent = ({ children }: MainContentProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { setContentWidth, sidebarWidth } = useResponsiveContext();

    const updateContainerWidth = useCallback(() => {
        if (ref.current) {
            const { current } = ref;
            const boundingRect = current?.getBoundingClientRect();
            const { width } = boundingRect;
            setContentWidth(width);
        }
    }, [setContentWidth]);
    useEffect(() => {
        updateContainerWidth();

        window.addEventListener('resize', updateContainerWidth);
        window.addEventListener('orientationchange', updateContainerWidth);
        window.addEventListener('load', updateContainerWidth);

        return () => {
            window.removeEventListener('resize', updateContainerWidth);
            window.removeEventListener('orientationchange', updateContainerWidth);
            window.removeEventListener('load', updateContainerWidth);
        };
    }, [ref, setContentWidth, sidebarWidth, updateContainerWidth]);

    return <MainContentContainer ref={ref}>{children}</MainContentContainer>;
};

interface SuiteLayoutProps {
    children: ReactNode;
}

export const SuiteLayout = ({ children }: SuiteLayoutProps) => {
    const selectedAccount = useSelector(selectSelectedAccount);
    const sidebarWidthFromRedux = useSelector(state => state.suite.settings.sidebarWidth);

    const [{ title, layoutHeader }, setLayoutPayload] = useState<LayoutContextPayload>({});

    const { isMobileLayout } = useLayoutSize();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { scrollRef } = useResetScrollOnUrl();
    useClearAnchorHighlightOnClick(wrapperRef);

    const isAccountPage = !!selectedAccount;

    useAppShortcuts();

    return (
        <ElevationContext baseElevation={-1}>
            <Wrapper ref={wrapperRef} data-testid="@suite-layout">
                <PageWrapper>
                    <ResponsiveContextProvider sidebarWidthFromRedux={sidebarWidthFromRedux}>
                        <NewModal.Provider>
                            <ModalContextProvider>
                                <Metadata title={title} />

                                <ModalSwitcher />

                                {isMobileLayout && <CoinjoinBars />}

                                {isMobileLayout && <MobileMenu />}

                                <DiscoveryProgress />

                                <LayoutContext.Provider value={setLayoutPayload}>
                                    <Body data-testid="@suite-layout/body">
                                        <Columns>
                                            {!isMobileLayout && (
                                                <ElevationDown>
                                                    <Sidebar />
                                                </ElevationDown>
                                            )}
                                            <MainContent>
                                                {!isMobileLayout && <CoinjoinBars />}
                                                <SuiteBanners />
                                                <AppWrapper
                                                    data-testid="@app"
                                                    ref={scrollRef}
                                                    id={SCROLL_WRAPPER_ID}
                                                >
                                                    <ElevationUp>
                                                        {isMobileLayout && isAccountPage && (
                                                            <MobileAccountsMenu />
                                                        )}
                                                        {layoutHeader}

                                                        <ContentWrapper>{children}</ContentWrapper>
                                                    </ElevationUp>
                                                </AppWrapper>
                                            </MainContent>
                                        </Columns>
                                    </Body>
                                </LayoutContext.Provider>

                                {!isMobileLayout && <GuideButton />}
                            </ModalContextProvider>
                        </NewModal.Provider>
                    </ResponsiveContextProvider>
                </PageWrapper>

                <GuideRouter />
            </Wrapper>
        </ElevationContext>
    );
};
