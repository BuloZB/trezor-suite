import styled, { useTheme } from 'styled-components';

import { Column, getIconSize, Icon, IconSize, iconSizes } from '@trezor/components';
import { spacings } from '@trezor/theme';
import { TranslationKey } from '@suite-common/intl-types';
import { getFirmwareVersion } from '@trezor/device-utils';
import { isDesktop } from '@trezor/env-utils';
import { mapTrezorModelToIcon } from '@trezor/product-components';

import { Translation } from '../../../../../Translation';
import {
    mapUpdateStatusToIcon,
    mapUpdateStatusToVariant,
    UpdateStatus,
    UpdateStatusDevice,
    UpdateStatusSuite,
} from './updateQuickActionTypes';
import { useDevice, useSelector } from '../../../../../../../hooks/suite';
import { TooltipRow } from '../TooltipRow';

const SuiteIconRectangle = styled.div<{ $size: IconSize }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 0.5px;
    width: ${({ $size }) => getIconSize($size)}px;
    height: ${({ $size }) => getIconSize($size)}px;

    border-radius: 6px;
    background-color: ${({ theme }) => theme.iconDefault};
`;

const mapUpdateStatusToTranslation: Record<UpdateStatus, TranslationKey> = {
    disconnected: 'TR_QUICK_ACTION_TOOLTIP_DEVICE_DISCONNECTED',
    'update-downloaded-manual': 'TR_QUICK_ACTION_TOOLTIP_UPDATE_AVAILABLE',
    'update-downloaded-auto-restart-to-update': 'TR_QUICK_ACTION_TOOLTIP_RESTART_TO_UPDATE',
    'up-to-date': 'TR_QUICK_ACTION_TOOLTIP_UP_TO_DATE',
    'update-available': 'TR_QUICK_ACTION_TOOLTIP_UPDATE_AVAILABLE',
    'just-updated': 'TR_QUICK_ACTION_TOOLTIP_JUST_UPDATED',
};

type DeviceRowProps = {
    updateStatus: UpdateStatusDevice;
    onClick?: () => void;
};

const DeviceRow = ({ updateStatus, onClick }: DeviceRowProps) => {
    const { device } = useDevice();

    if (device?.features === undefined) {
        return null;
    }

    const firmwareCurrentVersion = getFirmwareVersion(device);
    const firmwareNewVersion = device.firmwareRelease?.release?.version?.join('.');

    return (
        <TooltipRow
            onClick={onClick}
            leftItem={
                <Icon
                    name={mapTrezorModelToIcon[device.features.internal_model]}
                    size={iconSizes.medium}
                />
            }
            circleIconName={mapUpdateStatusToIcon[updateStatus]}
            variant={mapUpdateStatusToVariant[updateStatus]}
            header={<Translation id="TR_QUICK_ACTION_TOOLTIP_TREZOR_DEVICE" />}
        >
            <Translation
                id={mapUpdateStatusToTranslation[updateStatus]}
                values={{
                    currentVersion: firmwareCurrentVersion,
                    newVersion: firmwareNewVersion,
                }}
            />
        </TooltipRow>
    );
};

type SuiteRowProps = {
    updateStatus: UpdateStatusSuite;
    onClick?: () => void;
};

const SuiteRow = ({ updateStatus, onClick }: SuiteRowProps) => {
    const theme = useTheme();

    const { desktopUpdate } = useSelector(state => state);

    const suiteCurrentVersion = process.env.VERSION || '';
    const suiteNewVersion = desktopUpdate.latest?.version;

    return (
        <TooltipRow
            onClick={onClick}
            leftItem={
                <SuiteIconRectangle $size="medium">
                    <Icon name="trezor" size={iconSizes.small} color={theme.iconDefaultInverted} />
                </SuiteIconRectangle>
            }
            circleIconName={mapUpdateStatusToIcon[updateStatus]}
            variant={mapUpdateStatusToVariant[updateStatus]}
            header={<Translation id="TR_QUICK_ACTION_TOOLTIP_TREZOR_SUITE" />}
        >
            <Translation
                id={mapUpdateStatusToTranslation[updateStatus]}
                values={{ currentVersion: suiteCurrentVersion, newVersion: suiteNewVersion }}
            />
        </TooltipRow>
    );
};

type UpdateTooltipProps = {
    updateStatusDevice: UpdateStatusDevice;
    onClickDevice?: () => void;
    updateStatusSuite: UpdateStatusSuite;
    onClickSuite?: () => void;
};

export const UpdateTooltip = ({
    updateStatusDevice,
    onClickDevice,
    updateStatusSuite,
    onClickSuite,
}: UpdateTooltipProps) => {
    const isDesktopSuite = isDesktop();

    return (
        <Column gap={spacings.md} alignItems="start">
            <DeviceRow updateStatus={updateStatusDevice} onClick={onClickDevice} />
            {isDesktopSuite && <SuiteRow updateStatus={updateStatusSuite} onClick={onClickSuite} />}
        </Column>
    );
};
