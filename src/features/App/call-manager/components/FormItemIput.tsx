import FormItemComponent from '@/components/FormComponent/FormItemComponent';
import { Input } from 'antd';
import styled from 'styled-components';

export interface FormItemInputOCRType {
    // name: string;
    label: string;
    step: number;
    confidence: number;
    // placeholder: string;
}

const FormOCRItemInput = ({ label, step, confidence }: FormItemInputOCRType) => {
    const placeholder = 'Nhập ' + label.toLowerCase();
    return (
        <div
            style={{
                flexDirection: 'row',
                display: 'flex',
            }}
        >
            <Input
                readOnly={step != 3}
                style={{
                    height: 40,
                    borderColor: confidence >= 0.9 ? 'green' : 'yellow',
                }}
                placeholder={placeholder}
            />
            <TextConfident
                style={{
                    color: confidence >= 0.9 ? 'green' : 'yellow',
                }}
            >
                {confidence > 0 ? (confidence * 100).toString() + '%' : ''}
            </TextConfident>
        </div>
    );
};

export default FormOCRItemInput;

const TextConfident = styled.div`
    height: 40;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    margin-left: 5px;
`;
