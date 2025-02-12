import { Button, Row } from '@trezor/components';
import { spacings } from '@trezor/theme';

import { Translation } from 'src/components/suite';

interface CoinmarketFractionButtonsProps {
    onFractionClick: (divisor: number) => void;
    onAllClick: () => void;
    disabled?: boolean;
    className?: string;
}

export const CoinmarketFractionButtons = ({
    disabled,
    onFractionClick,
    onAllClick,
}: CoinmarketFractionButtonsProps) => {
    const buttons = [
        { label: '1/4', value: 4 },
        { label: '1/3', value: 3 },
        { label: '1/2', value: 2 },
        { label: <Translation id="TR_FRACTION_BUTTONS_ALL" />, value: null },
    ];

    return (
        <Row gap={spacings.xs} data-testid="@coinmarket/form/fraction-buttons">
            {buttons.map((button, index) => (
                <Button
                    variant="tertiary"
                    type="button"
                    size="small"
                    key={index}
                    isDisabled={disabled}
                    onClick={() => (!button.value ? onAllClick() : onFractionClick(button.value))}
                >
                    {button.label}
                </Button>
            ))}
        </Row>
    );
};
