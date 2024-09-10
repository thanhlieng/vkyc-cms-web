import SearchInput from '@/components/SearchInput';
import { DefaultSelectStyled } from '@/config/global.style';
import { Space } from 'antd';

const Filter = ({ returnFilter }: { returnFilter: (filter: any) => void }) => {
    const handleChangeStatus = (value: any) => {
        returnFilter({ status: value });
    };
    const handleChangeInspection = (value: any) => {
        returnFilter({ inspection: value });
    };
    const handleChangeVKYC = (value: any) => {
        returnFilter({ vkyc: value });
    };
    return (
        <Space size="middle" wrap>
            <SearchInput
                onChangeSearch={(search) => returnFilter({ room: search })}
                placeholderSearch="Nhập cuộc gọi vKYC "
            />
            <DefaultSelectStyled
                placeholder="Trạng thái phòng"
                allowClear
                style={{ width: '250px' }}
                onChange={handleChangeStatus}
            >
                <DefaultSelectStyled.Option value={1}>Đã đóng</DefaultSelectStyled.Option>
                <DefaultSelectStyled.Option value={2}>Đang mở</DefaultSelectStyled.Option>
            </DefaultSelectStyled>
            <DefaultSelectStyled
                placeholder="Trạng thái VKYC"
                allowClear
                style={{ width: '250px' }}
                onChange={handleChangeVKYC}
            >
                <DefaultSelectStyled.Option value={1}>Thành công</DefaultSelectStyled.Option>
                <DefaultSelectStyled.Option value={2}>Thất bại</DefaultSelectStyled.Option>
                <DefaultSelectStyled.Option value={3}>Đang diễn ra</DefaultSelectStyled.Option>
            </DefaultSelectStyled>
            <DefaultSelectStyled
                placeholder="Trạng thái hậu kiểm"
                allowClear
                style={{ width: '250px' }}
                onChange={handleChangeInspection}
            >
                <DefaultSelectStyled.Option value={1}>Hợp lệ</DefaultSelectStyled.Option>
                <DefaultSelectStyled.Option value={2}>Không hợp lệ</DefaultSelectStyled.Option>
            </DefaultSelectStyled>
        </Space>
    );
};

export default Filter;
