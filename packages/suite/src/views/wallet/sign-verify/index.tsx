import { useEffect, useState } from 'react';
import { FieldError } from 'react-hook-form';

import styled from 'styled-components';

import {
    Input,
    Button,
    Textarea,
    Card,
    Switch,
    variables,
    SelectBar,
    Tooltip,
} from '@trezor/components';
import { getInputState } from '@suite-common/wallet-utils';
import { spacingsPx } from '@trezor/theme';

import { WalletLayout, WalletSubpageHeading } from 'src/components/wallet';
import { Translation } from 'src/components/suite';
import { useDevice, useDispatch, useSelector, useTranslation } from 'src/hooks/suite';
import { sign, verify } from 'src/actions/wallet/signVerifyActions';
import { goto } from 'src/actions/suite/routerActions';
import { TranslationKey } from 'src/components/suite/Translation';
import { useCopySignedMessage } from 'src/hooks/wallet/sign-verify/useCopySignedMessage';
import {
    useSignVerifyForm,
    SignVerifyFields,
    MAX_LENGTH_MESSAGE,
    MAX_LENGTH_SIGNATURE,
} from 'src/hooks/wallet/sign-verify/useSignVerifyForm';

import { Navigation, NavPages } from './components/Navigation';
import { SignAddressInput } from './components/SignAddressInput';
import { ButtonRow, Row } from './components/ButtonRow';

const SwitchWrapper = styled.label`
    display: flex;
    font-size: ${variables.FONT_SIZE.TINY};
    align-items: center;
    height: 100%;

    & > * + * {
        margin-left: 10px;
    }
`;

const Form = styled.form`
    padding: 42px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 42px 20px;
    }
`;

const FormatDescription = styled.p`
    span {
        font-weight: ${variables.FONT_WEIGHT.BOLD};
    }

    & + & {
        margin-top: 10px;
    }
`;

// eslint-disable-next-line local-rules/no-override-ds-component
const StyledSelectBar = styled(SelectBar)`
    margin: ${spacingsPx.sm} 0 ${spacingsPx.lg};

    @media (min-width: ${variables.SCREEN_SIZE.SM}) {
        width: 320px;
        margin: ${spacingsPx.sm} 0 0 ${spacingsPx.lg};
    }

    @media (min-width: ${variables.SCREEN_SIZE.MD}) and (max-width: ${variables.SCREEN_SIZE.LG}) {
        width: 100%;
        margin: ${spacingsPx.sm} 0 ${spacingsPx.lg};
    }

    @media (min-width: ${variables.SCREEN_SIZE.LG}) {
        width: 320px;
        margin: ${spacingsPx.xs} 0 0 20px;
    }
`;

const Divider = styled.div`
    margin: 15px 0 30px;
    height: 1px;
    background: ${({ theme }) => theme.legacy.STROKE_GREY};
`;

// eslint-disable-next-line local-rules/no-override-ds-component
const CopyButton = styled(Button)`
    position: absolute;
    right: 0;
    top: -2px;
`;

const formatOptions = [
    { value: false, label: <Translation id="TR_BIP_SIG_FORMAT" /> },
    {
        value: true,
        label: <Translation id="TR_COMPATIBILITY_SIG_FORMAT" />,
    },
];

const tooltipContent = (
    <Translation
        id="TR_FORMAT_TOOLTIP"
        values={{
            FormatDescription: chunks => <FormatDescription>{chunks}</FormatDescription>,
            span: chunks => <span>{chunks}</span>,
        }}
    />
);

const MultilineRow = styled(Row)`
    align-items: start;
`;

const SignVerify = () => {
    const [page, setPage] = useState<NavPages>('sign');
    const [isCompleted, setIsCompleted] = useState(false);

    const selectedAccount = useSelector(state => state.wallet.selectedAccount);
    const revealedAddresses = useSelector(state => state.wallet.receive);
    const dispatch = useDispatch();

    const isSignPage = page === 'sign';

    const {
        register,
        isFormDirty,
        isSubmitting,
        resetForm,
        formSubmit,
        formValues,
        formErrors,
        formSetSignature,
        hexField,
        addressField,
        pathField,
        isElectrumField,
    } = useSignVerifyForm(isSignPage, selectedAccount.account!);

    const { isLocked } = useDevice();
    const { translationString } = useTranslation();
    const { canCopy, copy } = useCopySignedMessage(formValues, selectedAccount.network?.name);

    const getErrorMessage = (error?: FieldError) =>
        error ? translationString(error.message as TranslationKey) : undefined;

    const messageError = getErrorMessage(formErrors.message);
    const pathError = getErrorMessage(formErrors.path);
    const addressError = getErrorMessage(formErrors.address);
    const signatureError = getErrorMessage(formErrors.signature);

    const { ref: messageRef, ...messageField } = register('message');
    const { ref: signatureRef, ...signatureField } = register('signature');

    const signatureProps = {
        label: translationString('TR_SIGNATURE'),
        inputState: getInputState(formErrors.signature) as ReturnType<typeof getInputState>,
        bottomText: signatureError,
        'data-testid': '@sign-verify/signature',
        innerRef: signatureRef,
        ...signatureField,
    };

    useEffect(() => {
        if (isSignPage && formValues.signature) return;

        setIsCompleted(false);
    }, [isSignPage, formValues.message, formValues.address, formValues.signature]);

    const onSubmit = async (data: SignVerifyFields) => {
        const { address, path, message, signature, hex, isElectrum } = data;

        if (isSignPage && path !== undefined) {
            const result = await dispatch(sign(path, message, hex, isElectrum));

            if (result) {
                formSetSignature(result);
                setIsCompleted(true);
            }
        } else if (signature !== undefined) {
            const result = await dispatch(verify(address, message, signature, hex));

            if (result) setIsCompleted(true);
        }
    };

    const closeScreen = (withCopy?: boolean) => {
        if (withCopy) {
            copy();
        }
        dispatch(goto('wallet-index', { preserveParams: true }));
    };

    return (
        <WalletLayout title="TR_NAV_SIGN_VERIFY" isSubpage account={selectedAccount}>
            <WalletSubpageHeading title="TR_NAV_SIGN_VERIFY">
                {isFormDirty && (
                    <Button type="button" variant="tertiary" onClick={resetForm}>
                        <Translation id="TR_CLEAR_ALL" />
                    </Button>
                )}
            </WalletSubpageHeading>

            <Card paddingType="none">
                <Navigation page={page} setPage={setPage} />

                <Form onSubmit={formSubmit(onSubmit)}>
                    <Row>
                        <Textarea
                            label={<Translation id="TR_MESSAGE" />}
                            labelRight={
                                <SwitchWrapper>
                                    <Translation id="TR_HEX_FORMAT" />
                                    <Switch {...hexField} />
                                </SwitchWrapper>
                            }
                            inputState={getInputState(formErrors.message)}
                            characterCount={{
                                current: formValues.message?.length,
                                max: MAX_LENGTH_MESSAGE,
                            }}
                            bottomText={messageError || null}
                            rows={4}
                            data-testid="@sign-verify/message"
                            innerRef={messageRef}
                            {...messageField}
                        />
                    </Row>

                    <MultilineRow>
                        {isSignPage ? (
                            <SignAddressInput
                                name="path"
                                label={<Translation id="TR_ADDRESS" />}
                                account={selectedAccount.account}
                                revealedAddresses={revealedAddresses}
                                inputState={getInputState(formErrors.path)}
                                bottomText={pathError || null}
                                data-testid="@sign-verify/sign-address"
                                {...pathField}
                            />
                        ) : (
                            <Input
                                name="address"
                                label={<Translation id="TR_ADDRESS" />}
                                type="text"
                                inputState={getInputState(formErrors.address)}
                                bottomText={addressError || null}
                                data-testid="@sign-verify/select-address"
                                {...addressField}
                            />
                        )}

                        {isSignPage && (
                            <StyledSelectBar
                                label={
                                    <Tooltip maxWidth={330} content={tooltipContent} dashed>
                                        <Translation id="TR_FORMAT" />
                                    </Tooltip>
                                }
                                options={formatOptions}
                                data-testid="@sign-verify/format"
                                {...isElectrumField}
                            />
                        )}
                    </MultilineRow>

                    <Divider />

                    <Row>
                        {isSignPage ? (
                            <>
                                {canCopy && (
                                    <CopyButton
                                        type="button"
                                        variant="tertiary"
                                        onClick={copy}
                                        icon="copy"
                                    >
                                        <Translation id="TR_COPY_SIGNED_MESSAGE" />
                                    </CopyButton>
                                )}

                                <Input
                                    maxLength={MAX_LENGTH_SIGNATURE}
                                    type="text"
                                    readOnly={isSignPage}
                                    isDisabled={!formValues.signature?.length}
                                    placeholder={translationString(
                                        'TR_SIGNATURE_AFTER_SIGNING_PLACEHOLDER',
                                    )}
                                    {...signatureProps}
                                />
                            </>
                        ) : (
                            <Textarea
                                maxLength={MAX_LENGTH_SIGNATURE}
                                characterCount={{
                                    current: formValues.signature?.length,
                                    max: MAX_LENGTH_SIGNATURE,
                                }}
                                rows={4}
                                {...signatureProps}
                            />
                        )}
                    </Row>

                    <ButtonRow
                        isCompleted={isCompleted}
                        isSubmitting={isSubmitting}
                        isSignPage={isSignPage}
                        isTrezorLocked={isLocked()}
                        resetForm={resetForm}
                        closeScreen={closeScreen}
                    />
                </Form>
            </Card>
        </WalletLayout>
    );
};

export default SignVerify;
