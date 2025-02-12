import { useState, useEffect } from 'react';

import TrezorConnect, { BlockchainLink } from '@trezor/connect';
import { NetworkSymbol } from '@suite-common/wallet-config';

export const useDefaultUrls = (
    symbol: NetworkSymbol,
): { defaultUrls: string[]; isLoading: boolean } => {
    const [link, setLink] = useState<BlockchainLink>();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        TrezorConnect.getCoinInfo({ coin: symbol }).then(result => {
            if (result.success) {
                setLink(result.payload.blockchainLink);
            }
            setIsLoading(false);
        });
    }, [symbol]);

    return { defaultUrls: link?.url ?? [], isLoading };
};
