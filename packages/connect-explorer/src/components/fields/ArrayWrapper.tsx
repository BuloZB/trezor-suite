import { ReactNode } from 'react';

import styled from 'styled-components';

import { Icon } from '@trezor/components';

import type { FieldWithBundle } from '../../types';

interface AddButtonProps {
    field: FieldWithBundle<any>;
    onAdd: () => void;
    label: string;
}

const AddBatchButton = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    align-self: flex-start;
`;

const AddButton = ({ field, onAdd, label }: AddButtonProps) => {
    if (field.batch.length > 1) {
        return null;
    }

    return (
        <AddBatchButton title="Add batch" onClick={onAdd}>
            <Icon name="plus" onClick={onAdd} /> {label}
        </AddBatchButton>
    );
};

interface ArrayWrapperProps {
    children: ReactNode;
    field: FieldWithBundle<any>;
    onAdd: () => void;
}

const Array = styled.div`
    display: flex;
    flex-direction: column;
`;

export const ArrayWrapper = ({ children, field, onAdd }: ArrayWrapperProps) => (
    <Array>
        <AddButton field={field} onAdd={onAdd} label={field.name} />
        <div>{children}</div>
    </Array>
);
