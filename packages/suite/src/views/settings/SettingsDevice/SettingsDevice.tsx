import { isDeviceRemembered, isDeviceWithButtons } from '@suite-common/suite-utils';
import type { TransportInfo } from '@trezor/connect';
import { isBitcoinOnlyDevice } from '@trezor/device-utils';

import { DeviceBanner, SettingsLayout, SettingsSection } from 'src/components/settings';
import { Translation } from 'src/components/suite';
import { useDevice, useSelector } from 'src/hooks/suite';
import type { TrezorDevice } from 'src/types/suite';
import { isRecoveryInProgress } from 'src/utils/device/isRecoveryInProgress';

import { AuthenticateDevice } from './AuthenticateDevice';
import { AutoLock } from './AutoLock';
import { BackupFailed } from './BackupFailed';
import { BackupRecoverySeed } from './BackupRecoverySeed';
import { ChangePin } from './ChangePin';
import { CheckRecoverySeed } from './CheckRecoverySeed';
import { CustomFirmware } from './CustomFirmware';
import { DeviceAuthenticityOptOut } from './DeviceAuthenticityOptOut';
import { DeviceLabel } from './DeviceLabel';
import { DisplayRotation } from './DisplayRotation';
import { FirmwareTypeChange } from './FirmwareTypeChange';
import { FirmwareVersion } from './FirmwareVersion';
import { Homescreen } from './Homescreen';
import { MultiShareBackup } from './MultiShareBackup';
import { Passphrase } from './Passphrase';
import { PinProtection } from './PinProtection';
import { SafetyChecks } from './SafetyChecks';
import { WipeCode } from './WipeCode';
import { WipeDevice } from './WipeDevice';
import { ChangeLanguage } from './ChangeLanguage';
import { HapticFeedback } from './HapticFeedback';
import { Brightness } from './Brightness';
import { DefaultWalletLoading } from './DefaultWalletLoading';
import { FirmwareRevisionCheck } from './FirmwareRevisionCheck';
import { FirmwareHashCheck } from './FirmwareHashCheck';
import { SUPPORTS_DEVICE_AUTHENTICITY_CHECK } from '../../../constants/suite/device';

const deviceSettingsUnavailable = (device?: TrezorDevice, transport?: Partial<TransportInfo>) => {
    const noTransportAvailable = transport && !transport.type;
    const wrongDeviceType = device?.type && ['unacquired', 'unreadable'].includes(device.type);
    const wrongDeviceMode =
        (device?.mode && ['seedless'].includes(device.mode)) ||
        (device?.features !== undefined && isRecoveryInProgress(device?.features));
    const firmwareUpdateRequired = device?.firmware === 'required';

    return noTransportAvailable || wrongDeviceType || wrongDeviceMode || firmwareUpdateRequired;
};

export const SettingsDevice = () => {
    const { device, isLocked } = useDevice();
    const transport = useSelector(state => state.suite.transport);
    const deviceUnavailable = !device?.features;
    const isDeviceLocked = isLocked();
    const bootloaderMode = device?.mode === 'bootloader';
    const initializeMode = device?.mode === 'initialize';
    const isNormalMode = !bootloaderMode && !initializeMode;
    const deviceRemembered = isDeviceRemembered(device) && !device?.connected;
    const bitcoinOnlyDevice = isBitcoinOnlyDevice(device);
    const isPassphraseProtectionOn = Boolean(device?.features?.passphrase_protection);

    if (deviceSettingsUnavailable(device, transport)) {
        return (
            <SettingsLayout>
                <DeviceBanner
                    title={<Translation id="TR_SETTINGS_DEVICE_BANNER_TITLE_UNAVAILABLE" />}
                    description={
                        <Translation id="TR_SETTINGS_DEVICE_BANNER_DESCRIPTION_UNAVAILABLE" />
                    }
                />
            </SettingsLayout>
        );
    }

    if (deviceUnavailable) {
        return (
            <SettingsLayout>
                <DeviceBanner
                    title={<Translation id="TR_SETTINGS_DEVICE_BANNER_TITLE_DISCONNECTED" />}
                />
            </SettingsLayout>
        );
    }

    const {
        unfinished_backup: unfinishedBackup,
        pin_protection: pinProtection,
        safety_checks: safetyChecks,
    } = device.features;

    const deviceModelInternal = device.features.internal_model;

    const supportsDeviceAuthentication = SUPPORTS_DEVICE_AUTHENTICITY_CHECK[deviceModelInternal];

    return (
        <SettingsLayout>
            {bootloaderMode && (
                <DeviceBanner
                    title={<Translation id="TR_SETTINGS_DEVICE_BANNER_TITLE_BOOTLOADER" />}
                    description={
                        <Translation
                            id={
                                deviceModelInternal && isDeviceWithButtons(deviceModelInternal)
                                    ? 'TR_DEVICE_CONNECTED_BOOTLOADER_RECONNECT_IN_NORMAL_NO_BUTTON'
                                    : 'TR_DEVICE_CONNECTED_BOOTLOADER_RECONNECT_IN_NORMAL_NO_TOUCH'
                            }
                        />
                    }
                />
            )}

            {deviceRemembered && (
                <DeviceBanner
                    title={<Translation id="TR_SETTINGS_DEVICE_BANNER_TITLE_REMEMBERED" />}
                />
            )}

            {isNormalMode && (
                <SettingsSection title={<Translation id="TR_BACKUP" />} icon="newspaper">
                    {unfinishedBackup ? (
                        <BackupFailed />
                    ) : (
                        <>
                            <BackupRecoverySeed isDeviceLocked={isDeviceLocked} />
                            <MultiShareBackup isDeviceLocked={isDeviceLocked} />
                            <CheckRecoverySeed isDeviceLocked={isDeviceLocked} />
                        </>
                    )}
                </SettingsSection>
            )}

            {isPassphraseProtectionOn && (
                <SettingsSection
                    title={<Translation id="TR_DEVICE_SETTINGS_WALLET_LOADING" />}
                    icon="app"
                >
                    <DefaultWalletLoading />
                </SettingsSection>
            )}

            <SettingsSection title={<Translation id="TR_FIRMWARE" />} icon="puzzlePiece">
                <FirmwareVersion isDeviceLocked={isDeviceLocked} />
                {(!bootloaderMode || bitcoinOnlyDevice) && (
                    <FirmwareTypeChange isDeviceLocked={isDeviceLocked} />
                )}
                <ChangeLanguage isDeviceLocked={isDeviceLocked} />
            </SettingsSection>

            {isNormalMode && (
                <>
                    <SettingsSection
                        title={<Translation id="TR_DEVICE_SECURITY" />}
                        icon="shieldCheck"
                    >
                        <PinProtection isDeviceLocked={isDeviceLocked} />
                        {pinProtection && <ChangePin isDeviceLocked={isDeviceLocked} />}
                        <Passphrase isDeviceLocked={isDeviceLocked} />
                        {safetyChecks && <SafetyChecks isDeviceLocked={isDeviceLocked} />}
                        {supportsDeviceAuthentication && (
                            <AuthenticateDevice isDeviceLocked={isDeviceLocked} />
                        )}
                    </SettingsSection>

                    <SettingsSection title={<Translation id="TR_PERSONALIZATION" />} icon="palette">
                        <DeviceLabel isDeviceLocked={isDeviceLocked} />
                        <Homescreen isDeviceLocked={isDeviceLocked} />
                        <DisplayRotation isDeviceLocked={isDeviceLocked} />
                        <Brightness isDeviceLocked={isDeviceLocked} />
                        <HapticFeedback isDeviceLocked={isDeviceLocked} />
                        {pinProtection && <AutoLock isDeviceLocked={isDeviceLocked} />}
                    </SettingsSection>
                </>
            )}

            <SettingsSection title={<Translation id="TR_ADVANCED" />} icon="ghost">
                <WipeDevice isDeviceLocked={isDeviceLocked} />
                {isNormalMode && <WipeCode isDeviceLocked={isDeviceLocked} />}
                <CustomFirmware />
                {supportsDeviceAuthentication && <DeviceAuthenticityOptOut />}
                <FirmwareRevisionCheck />
                <FirmwareHashCheck />
            </SettingsSection>
        </SettingsLayout>
    );
};
