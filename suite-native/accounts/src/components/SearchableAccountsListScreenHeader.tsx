import { useState } from 'react';
import Animated, {
    EntryExitAnimationFunction,
    FadeOut,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

import { Box, IconButton } from '@suite-native/atoms';
import { AddCoinFlowType, ScreenSubHeader } from '@suite-native/navigation';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

import { AccountsSearchForm, SEARCH_INPUT_ANIMATION_DURATION } from './AccountsSearchForm';
import { AddAccountButton } from './AddAccountsButton';

type SearchableAccountsListScreenHeaderProps = {
    title: string;
    onSearchInputChange: (value: string) => void;
    flowType: AddCoinFlowType;
};

const HEADER_ANIMATION_DURATION = 100;

const searchFormContainerStyle = prepareNativeStyle(_ => ({
    height: 48,
}));

export const SearchableAccountsListScreenHeader = ({
    title,
    onSearchInputChange,
    flowType,
}: SearchableAccountsListScreenHeaderProps) => {
    const isFirstRender = useSharedValue(true);
    const { applyStyle } = useNativeStyles();

    const [isSearchActive, setIsSearchActive] = useState(false);

    const handleHideFilter = () => {
        setIsSearchActive(false);
        onSearchInputChange('');
    };

    const enteringFadeInAnimation: EntryExitAnimationFunction = () => {
        'worklet';

        // This fade in animation is not triggered on the first render. Triggered only on
        // subsequent renders while the user is switching between the header and AccountsSearchForm.
        const initialValues = {
            opacity: isFirstRender.value ? 1 : 0,
        };
        isFirstRender.value = false;

        return {
            initialValues,
            animations: {
                opacity: withDelay(
                    // Delayed to start right after the AccountsSearchForm exit animation finishes.
                    SEARCH_INPUT_ANIMATION_DURATION,
                    withTiming(1, { duration: HEADER_ANIMATION_DURATION }),
                ),
            },
        };
    };

    return (
        <Box style={applyStyle(searchFormContainerStyle)}>
            {isSearchActive ? (
                <AccountsSearchForm
                    onPressCancel={handleHideFilter}
                    onInputChange={onSearchInputChange}
                />
            ) : (
                <Animated.View
                    entering={enteringFadeInAnimation}
                    exiting={FadeOut.duration(HEADER_ANIMATION_DURATION)}
                >
                    <ScreenSubHeader
                        content={title}
                        rightIcon={
                            <AddAccountButton
                                flowType={flowType}
                                testID="@myAssets/addAccountButton"
                            />
                        }
                        leftIcon={
                            <IconButton
                                iconName="magnifyingGlass"
                                onPress={() => setIsSearchActive(true)}
                                colorScheme="tertiaryElevation1"
                                size="medium"
                            />
                        }
                    />
                </Animated.View>
            )}
        </Box>
    );
};
