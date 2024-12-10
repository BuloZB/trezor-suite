import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';

import { analytics, DeviceAuthenticityCheckResult, EventType } from '@suite-native/analytics';
import { selectDevice } from '@suite-common/wallet-core';
import { requestPrioritizedDeviceAccess } from '@suite-native/device-mutex';
import { useAlert } from '@suite-native/alerts';
import { Button, IconListItem, Text, VStack } from '@suite-native/atoms';
import { Translation } from '@suite-native/intl';
import {
    DeviceAuthenticityStackParamList,
    DeviceAuthenticityStackRoutes,
    DeviceSettingsStackParamList,
    DeviceStackRoutes,
    StackToStackCompositeNavigationProps,
} from '@suite-native/navigation';
import TrezorConnect from '@trezor/connect';

import { DeviceSettingsCardLayout } from './DeviceSettingsCardLayout';

type NavigationProp = StackToStackCompositeNavigationProps<
    DeviceAuthenticityStackParamList,
    DeviceAuthenticityStackRoutes,
    DeviceSettingsStackParamList
>;

export const DeviceAuthenticityCard = () => {
    const navigation = useNavigation<NavigationProp>();
    const { showAlert } = useAlert();

    const device = useSelector(selectDevice);

    const reportCheckResult = useCallback(
        (result: DeviceAuthenticityCheckResult) =>
            analytics.report({
                type: EventType.DeviceSettingsAuthenticityCheck,
                payload: { result },
            }),
        [],
    );

    const checkAuthenticity = useCallback(async () => {
        navigation.navigate(DeviceStackRoutes.DeviceAuthenticity);

        const result = await requestPrioritizedDeviceAccess({
            deviceCallback: () =>
                TrezorConnect.authenticateDevice({
                    device: {
                        path: device?.path,
                    },
                }),
        });
        if (!result.success) {
            return;
        }

        const { success, payload } = result.payload;
        if (success) {
            const checkResult = payload.valid ? 'successful' : 'compromised';
            navigation.navigate(DeviceAuthenticityStackRoutes.AuthenticitySummary, { checkResult });
            reportCheckResult(checkResult);
        } else {
            const errorCode = payload.code;
            if (errorCode === 'Failure_ActionCancelled' || errorCode === 'Failure_PinCancelled') {
                navigation.goBack();
                reportCheckResult('cancelled');
            } else if (errorCode === 'Method_Interrupted' || errorCode === undefined) {
                // navigation.goBack() already called via the X button (or the device was disconnected)
                reportCheckResult('cancelled');
            } else {
                navigation.navigate(DeviceAuthenticityStackRoutes.AuthenticitySummary, {
                    checkResult: 'compromised',
                });
                reportCheckResult('failed');
            }
        }
    }, [device, navigation, reportCheckResult]);

    const showInfoAlert = useCallback(() => {
        showAlert({
            title: <Translation id="moduleDeviceSettings.authenticity.info.title" />,
            textAlign: 'left',
            appendix: (
                <VStack spacing="sp24">
                    <IconListItem icon="shieldCheck">
                        <Translation id="moduleDeviceSettings.authenticity.info.item1" />
                    </IconListItem>
                    <IconListItem icon="cpu">
                        <Translation id="moduleDeviceSettings.authenticity.info.item2" />
                    </IconListItem>
                    <IconListItem icon="check">
                        <Translation id="moduleDeviceSettings.authenticity.info.item3" />
                    </IconListItem>
                </VStack>
            ),
            primaryButtonTitle: (
                <Translation id="moduleDeviceSettings.authenticity.info.letsDoItButton" />
            ),
            onPressPrimaryButton: checkAuthenticity,
        });
    }, [showAlert, checkAuthenticity]);

    return (
        <DeviceSettingsCardLayout
            icon="shieldCheck"
            title={<Translation id="moduleDeviceSettings.authenticity.title" />}
        >
            <VStack marginTop="sp2" spacing="sp16">
                <Text variant="body" color="textSubdued">
                    <Translation id="moduleDeviceSettings.authenticity.content" />
                </Text>
                <Button
                    size="small"
                    colorScheme="tertiaryElevation0"
                    onPress={showInfoAlert}
                    testID="@device-authenticity/check-button"
                >
                    <Translation id="moduleDeviceSettings.authenticity.checkButton" />
                </Button>
            </VStack>
        </DeviceSettingsCardLayout>
    );
};
