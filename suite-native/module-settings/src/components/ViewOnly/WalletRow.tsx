import { useDispatch } from 'react-redux';

import { Button, HStack, Text } from '@suite-native/atoms';
import { Translation } from '@suite-native/intl';
import { toggleRememberDevice } from '@suite-common/wallet-core';
import { useAlert } from '@suite-native/alerts';
import { useToast } from '@suite-native/toasts';
import { Icon } from '@suite-common/icons';
import { AcquiredDevice } from '@suite-common/suite-types';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

const walletRowStyle = prepareNativeStyle(utils => ({
    paddingHorizontal: utils.spacings.medium,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
}));

export const WalletRow = ({ device }: { device: AcquiredDevice }) => {
    const dispatch = useDispatch();
    const { showAlert, hideAlert } = useAlert();
    const { showToast } = useToast();
    const { applyStyle } = useNativeStyles();

    const walletNameLabel = device.useEmptyPassphrase ? (
        <Translation id="moduleSettings.viewOnly.wallet.standard" />
    ) : (
        <Translation
            id="moduleSettings.viewOnly.wallet.defaultPassphrase"
            values={{ index: device.walletNumber }}
        />
    );

    const toggleViewOnly = () => {
        const toastTranslationId =
            device.remember ?? false
                ? 'moduleSettings.viewOnly.toast.disabled'
                : 'moduleSettings.viewOnly.toast.enabled';
        showToast({
            variant: 'default',
            message: <Translation id={toastTranslationId} />,
            icon: 'check',
        });
        dispatch(toggleRememberDevice({ device }));
    };

    const handleDisableViewOnly = () => {
        showAlert({
            title: (
                <Translation
                    id="moduleSettings.viewOnly.disableDialog.title"
                    values={{ name: walletNameLabel }}
                />
            ),
            description: (
                <Translation
                    id="moduleSettings.viewOnly.disableDialog.subtitle"
                    values={{ device: device.label }}
                />
            ),
            primaryButtonTitle: (
                <Translation id="moduleSettings.viewOnly.disableDialog.buttons.primary" />
            ),
            onPressPrimaryButton: () => toggleViewOnly(),
            primaryButtonVariant: 'redBold',
            secondaryButtonTitle: (
                <Translation id="moduleSettings.viewOnly.disableDialog.buttons.secondary" />
            ),
            onPressSecondaryButton: hideAlert,
            secondaryButtonVariant: 'redElevation0',
        });
    };

    return (
        <HStack key={device.instance} style={applyStyle(walletRowStyle)}>
            <HStack spacing={12} alignItems="center">
                <Icon
                    name={device.useEmptyPassphrase ? 'standardWallet' : 'password'}
                    size="mediumLarge"
                />
                <Text>{walletNameLabel}</Text>
            </HStack>
            <Button
                size="extraSmall"
                colorScheme={device.remember ? 'redElevation0' : 'primary'}
                onPress={() => (device.remember ? handleDisableViewOnly() : toggleViewOnly())}
            >
                <Translation
                    id={
                        device.remember
                            ? 'moduleSettings.viewOnly.button.disable'
                            : 'moduleSettings.viewOnly.button.enable'
                    }
                />
            </Button>
        </HStack>
    );
};
