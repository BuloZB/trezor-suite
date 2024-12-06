import { RefObject } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

import {
    AccountKey,
    FeeLevelLabel,
    ReviewOutput,
    ReviewOutputState,
    TokenAddress,
} from '@suite-common/wallet-types';
import type { NetworkSymbol } from '@suite-common/wallet-config';

export type StatefulReviewOutput = ReviewOutput & { state: ReviewOutputState };

export type NativeSupportedFeeLevel = Exclude<FeeLevelLabel, 'low'>;

export type SendAmountInputProps = {
    recipientIndex: number;
    symbol: NetworkSymbol;
    inputRef: RefObject<TextInput>;
    scaleValue: SharedValue<number>;
    translateValue: SharedValue<number>;
    accountKey?: AccountKey;
    tokenContract?: TokenAddress;
    isDisabled?: boolean;
    onPress?: TextInputProps['onPress'];
    onFocus?: () => void;
};

export type FeeLevelsMaxAmount = Record<FeeLevelLabel, string | undefined>;
