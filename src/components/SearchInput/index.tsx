import useDebounce from '@/hooks/useDebounce';
import { Input } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const SearchInput = ({
    placeholderSearch,
    onChangeSearch,
    style,
    defaultValue,
}: {
    placeholderSearch: string;
    onChangeSearch: (search: string) => void;
    style?: React.CSSProperties;
    defaultValue?: any;
}) => {
    const [search, setSearch] = React.useState(undefined);
    const debouncedSearchTerm = useDebounce(search, 300);

    React.useEffect(() => {
        // if (!debouncedSearchTerm) return;
        onChangeSearch && onChangeSearch(debouncedSearchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm]);

    return (
        <InputStyled
            defaultValue={defaultValue}
            style={style}
            onChange={(e: any) => setSearch(e.target.value?.trim() || '')}
            placeholder={placeholderSearch}
            prefix={<SearchOutlined />}
            allowClear
        />
    );
};
const InputStyled = styled(Input)`
    min-width: 300px;
`;

export default SearchInput;
