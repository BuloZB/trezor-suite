import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal as RNModal, Platform } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import { getWindowWidth, getWindowHeight } from '@trezor/env-utils';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

type SheetProps = {
    children: ReactNode;
    isVisible: boolean;
    onClose: () => void;
    ExtraProvider?: React.ComponentType;
};

const ContentWrapperStyle = prepareNativeStyle(_ => ({
    flex: 1,
    width: getWindowWidth(),
    height: getWindowHeight(),
}));

/**
 * On Android RNGH does not work by default because modals are not located under React Native Root view in native hierarchy.
 * To fix that, components need to be wrapped with gestureHandlerRootHOC (it's no-op on iOS and web).
 * See more details: https://docs.swmansion.com/react-native-gesture-handler/docs/installation/#usage-with-modals-on-android
 */
const BottomSheetGestureHandler = gestureHandlerRootHOC<{ children: ReactNode }>(({ children }) => (
    <>{children}</>
));

export const BottomSheetContainer = ({
    children,
    isVisible,
    onClose,
    ExtraProvider,
}: SheetProps) => {
    const { applyStyle } = useNativeStyles();

    return (
        <RNModal transparent visible={isVisible} onRequestClose={onClose}>
            <>
                <BottomSheetGestureHandler>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={applyStyle(ContentWrapperStyle)}
                    >
                        {children}
                    </KeyboardAvoidingView>
                </BottomSheetGestureHandler>

                {ExtraProvider && <ExtraProvider />}
            </>
        </RNModal>
    );
};
