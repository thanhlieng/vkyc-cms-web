import { disabledDate } from '@/utils';
import { DatePicker } from 'antd';
import React from 'react';
const { RangePicker } = DatePicker;
const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY'];
const dateFormat = 'DD/MM/YYYY';

const RangerPicker = ({
    name,
    onChange,
    tooltipTitle = 'Lọc theo ngày tạo',
    placeholderStart = 'Từ ngày',
    placeholderEnd = 'Đến ngày',
    defaultValue,
    style,
}: {
    name: string;
    onChange: any;
    tooltipTitle?: string;
    placeholderStart?: string;
    placeholderEnd?: string;
    defaultValue?: any;
    style?: any;
}) => {
    return (
        <RangePicker
            onChange={(date: any, dateStrings: string[]) => {
                return onChange(
                    name,
                    date
                        ? `${dateStrings[0].split('/').reverse().join('-')},${dateStrings[1]
                              .split('/')
                              .reverse()
                              .join('-')}`
                        : ''
                );
            }}
            style={style}
            placeholder={[placeholderStart, placeholderEnd]}
            defaultValue={defaultValue}
            format={dateFormat}
            disabledDate={disabledDate}
        />
    );
};

export default React.memo(RangerPicker);
