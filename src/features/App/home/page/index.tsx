import { images } from '@/assets/imagesAssets';
import CardComponent from '@/components/CardComponent';
import TableComponent from '@/components/TableComponent';
import { BOX_SHADOW, RADIUS } from '@/config/theme';
import { supabase } from '@/supabaseClient';
import { Notification, momentToStringDate } from '@/utils';
import { Col, Image, Row, Skeleton } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { columns } from '../../call-manager/components/Customer.Config';
import AreaChartReport from '../components/AreaChartReport';
import BarChartReport from '../components/BarChartReport';
import ChartReport from '../components/ChartReport';

const textNote = { fontSize: '18px', fontWeight: 'bold', color: 'black', flex: 1 };

const HomePage = () => {
    const [dataChartAll, setDataChartAll] = useState<any>([]);
    const [dataChartToday, setDataChartToday] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataCall, setDataCall] = useState<any>([]);
    const [total, setTotal] = useState(0);
    const [totalRoomClosed, setTotalRoomClosed] = useState(0);
    const [totalSuccess, setTotalSuccess] = useState(0);
    const [totalSuccessTDV, setTotalSuccessTDV] = useState(0);
    const [totalFail, setTotalFail] = useState(0);
    const [totalFailTDV, setTotalFailTDV] = useState(0);
    const [totalInspection, setTotalInspection] = useState(0);
    const [totalInspectionFail, setTotalInspectionFail] = useState(0);
    const dataCallRef = useRef<any>([]);
    const dataAgencyRef = useRef<any>([]);
    const dataChartAllRef = useRef<any>([]);
    const dataChartTodayRef = useRef<any>([]);
    const totalRef = useRef<number>(0);
    const totalRoomClosedRef = useRef(0);
    const totalSuccessRef = useRef<number>(0);
    const totalSuccessTDVRef = useRef<number>(0);
    const totalFailRef = useRef<number>(0);
    const totalFailTDVRef = useRef<number>(0);
    const totalInspectionRef = useRef<number>(0);
    const totalInspectionFailRef = useRef<number>(0);

    const navigate = useNavigate();

    const getData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error, count } = await supabase.from('room').select(
                `id, room, status, user, is_occupied, video, created_at, updated_at,is_success,post_inspection,
            agency(id, name)`,
                { count: 'exact' }
            );

            if (data && data.length > 0) {
                setTotal(count ? count : 0);
                totalRef.current = count ? count : 0;

                const dataRoomClosed = data?.filter((item) => !item.status);
                setTotalRoomClosed(dataRoomClosed.length);
                totalRoomClosedRef.current = dataRoomClosed.length;

                const dataSuccess = data?.filter((item) => item.is_success);
                setTotalSuccess(dataSuccess.length);
                totalSuccessRef.current = dataSuccess.length;

                const dataSuccessTDV = data?.filter((item) => item.is_success && item.agency);
                setTotalSuccessTDV(dataSuccessTDV.length);
                totalSuccessTDVRef.current = dataSuccessTDV.length;

                const dataFail = data?.filter((item) => !item.is_success && !item.status);
                setTotalFail(dataFail.length);
                totalFailRef.current = dataFail.length;

                const dataFailTDV = data?.filter((item) => !item.is_success && !item.status && item.agency);
                setTotalFailTDV(dataFailTDV.length);
                totalFailTDVRef.current = dataFailTDV.length;

                const dataInspection = data?.filter((item) => item.post_inspection != null);

                setTotalInspection(dataInspection.length);
                totalInspectionRef.current = dataInspection.length;

                const dataInspectionFail = data?.filter(
                    (item) => item.post_inspection != null && item.post_inspection != 'true'
                );
                setTotalInspectionFail(dataInspectionFail.length);
                totalInspectionFailRef.current = dataInspectionFail.length;
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
            if (error) {
                Notification('error', error);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    }, []);

    const getDataChartAll = useCallback(async (startDate: any, endDate: any) => {
        try {
            const { data, error } = await supabase
                .from('room')
                .select(`created_at,is_success, status`)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at', { ascending: true });
            console.log(data);
            if (data && data.length > 0) {
                const dataChart = data.reduce((acc: any, obj) => {
                    const date = obj.created_at;
                    const existingItem = acc.find(
                        (item: { name: string }) => item.name === momentToStringDate(date, 'daymonth')
                    );

                    if (existingItem) {
                        if (obj.is_success) {
                            existingItem.callSuccess++;
                        } else if (!obj.is_success && !obj.status) {
                            existingItem.callFail++;
                        }
                        existingItem.call++;
                    } else {
                        const newItem = {
                            name: momentToStringDate(date, 'daymonth'),
                            call: 1,
                            callSuccess: obj.is_success ? 1 : 0,
                            callFail: !obj.is_success && !obj.status ? 1 : 0,
                        };
                        acc.push(newItem);
                    }

                    return acc;
                }, []);
                console.log(dataChart);
                dataChartAllRef.current = dataChart;
                setDataChartAll(dataChart);
            } else {
                dataChartAllRef.current = [];
                setDataChartAll([]);
            }
            if (error) {
                Notification('error', error);
            }
        } catch (error) {}
    }, []);

    const getDataChartToday = useCallback(
        async (day: {
            setHours: (arg0: number, arg1: number, arg2: number, arg3: number) => void;
            toISOString: () => any;
        }) => {
            day.setHours(0, 0, 0, 0);
            const startOfToday = day.toISOString();
            const endOfToday = new Date(startOfToday);
            endOfToday.setHours(23, 59, 59, 999);
            const endOfTodayString = endOfToday.toISOString();
            try {
                const { data, error } = await supabase
                    .from('room')
                    .select(`created_at, is_success, status`)
                    .gte('created_at', startOfToday)
                    .lte('created_at', endOfTodayString)
                    .order('created_at', { ascending: true });

                const dataSuccess = data?.filter((item) => item.is_success);
                const dataFail = data?.filter((item) => !item.is_success && !item.status);
                const dataProcess = data?.filter((item) => !item.is_success && item.status);

                setDataChartToday([
                    { name: 'Cuộc gọi thành công', value: dataSuccess?.length },
                    { name: 'Cuộc gọi thất bại', value: dataFail?.length },
                    { name: 'Cuộc gọi đang diễn ra', value: dataProcess?.length },
                ]);
                dataChartTodayRef.current = [
                    { name: 'Cuộc gọi thành công', value: dataSuccess?.length },
                    { name: 'Cuộc gọi thất bại', value: dataFail?.length },
                    { name: 'Cuộc gọi đang diễn ra', value: dataProcess?.length },
                ];
                if (error) {
                    Notification('error', error);
                }
            } catch (error) {}
        },
        []
    );

    const getDataCall = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error, count } = await supabase
                .from('room')
                .select(
                    `id, room, status, user, is_occupied, video, created_at, updated_at,is_success,post_inspection,egress_id,
                agency(id, name)`,
                    { count: 'exact' }
                )
                .order('updated_at', { ascending: false })
                .order('created_at', { ascending: false })
                .range(0, 4);

            const { data: dataAgency, error: errorAgency } = await supabase.from('agency').select();

            if (dataAgency && dataAgency.length > 0) {
                dataAgencyRef.current = dataAgency;
            }

            if (data && data.length > 0) {
                const newData = data?.map((item: any) => {
                    return {
                        ...item,
                        reciever: item.agency ? item.agency?.name.toString() : !item.is_occupied ? 'BOT' : '',
                        updated_at: !item.status ? item.updated_at : '',
                        statusVKYC: item.is_success ? 1 : !item.is_success && !item.status ? 2 : 0,
                    };
                });
                totalRef.current = count ? count : 0;
                setTotal(count ? count : 0);
                dataCallRef.current = newData;
                setDataCall(newData);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                dataCallRef.current = data;
                setDataCall(data);
            }
            if (error || errorAgency) {
                setIsLoading(false);
                Notification('error', error);
            }
        } catch (error) {
            setIsLoading(false);
        }
    }, []);

    const handleRealtimeChartAll = (payload: { new: any; eventType?: string }) => {
        const newDataChartAll = [...dataChartAllRef.current];
        const existingItemChartAll = newDataChartAll.find(
            (item: { name: any }) => item.name === momentToStringDate(payload.new.created_at, 'daymonth')
        );
        if (existingItemChartAll) {
            existingItemChartAll.call += 1;
        } else {
            newDataChartAll.push({
                name: momentToStringDate(payload.new.created_at, 'daymonth'),
                call: 1,
                callSuccess: 0,
                callFail: 0,
            });
        }
        dataChartAllRef.current = newDataChartAll;
        setDataChartAll(newDataChartAll);
    };

    const handleRealtimeChartToday = (payload: { new: { created_at: string; is_success: boolean } }) => {
        if (new Date(payload.new.created_at).toDateString() === new Date().toDateString()) {
            const newDataChartToday = [...dataChartTodayRef.current];
            newDataChartToday[2].value += 1;
            dataChartTodayRef.current = newDataChartToday;
            setDataChartToday(newDataChartToday);
        }
    };

    const handleInsertDataRealtime = (data: any) => {
        const newDataCall = [...dataCallRef.current];
        newDataCall.unshift(data);
        newDataCall.pop();
        dataCallRef.current = newDataCall;
        setDataCall(newDataCall);
    };

    const handleUpdateDataChartAll = (payload: { new: any }) => {
        const newDataChartAll = [...dataChartAllRef.current];
        const existingItemChartAll = newDataChartAll.find(
            (item: { name: any }) => item.name === momentToStringDate(payload.new.created_at, 'daymonth')
        );
        if (existingItemChartAll) {
            if (payload.new.is_success) {
                existingItemChartAll.callSuccess += 1;
            } else if (!payload.new.is_success && !payload.new.status) {
                existingItemChartAll.callFail += 1;
            }
        } else {
            newDataChartAll.push({
                name: momentToStringDate(payload.new.created_at, 'daymonth'),
                call: 1,
                callSuccess: 0,
                callFail: 0,
            });
        }
        dataChartAllRef.current = newDataChartAll;
        setDataChartAll(newDataChartAll);
    };

    const handleUpdateDataChartToday = (payload: any) => {
        if (new Date(payload.new.created_at).toDateString() === new Date().toDateString()) {
            const newDataChartToday = [...dataChartTodayRef.current];
            if (payload.new.is_success) {
                newDataChartToday[0].value += 1;
                newDataChartToday[2].value -= 1;
            } else if (!payload.new.is_success && !payload.new.status) {
                newDataChartToday[1].value += 1;
                newDataChartToday[2].value -= 1;
            }

            dataChartTodayRef.current = newDataChartToday;
            setDataChartToday(newDataChartToday);
        }
    };

    const handleUpdateDateRealtime = (data: any, id: any) => {
        const newDataCall = [...dataCallRef.current];
        const index = newDataCall.findIndex((item) => item.id === id);
        if (index !== -1) {
            newDataCall.splice(index, 1)[0];
            newDataCall.unshift(data);
        } else {
            newDataCall.unshift(data);
            newDataCall.pop();
        }
        dataCallRef.current = newDataCall;
        setDataCall(newDataCall);
    };

    const handleUpdateData = (payload: any) => {
        if (!payload.new.status) {
            setTotalRoomClosed(totalRoomClosedRef.current + 1);
            totalRoomClosedRef.current += 1;
        }
        if (payload.new.is_success) {
            setTotalSuccess(totalSuccessRef.current + 1);
            totalSuccessRef.current += 1;
            if (payload.new.agency_id) {
                setTotalSuccessTDV(totalSuccessTDVRef.current + 1);
                totalSuccessTDVRef.current += 1;
            }
        } else if (!payload.new.is_success && !payload.new.status) {
            setTotalFail(totalFailRef.current + 1);
            totalFailRef.current += 1;
            if (payload.new.agency_id) {
                setTotalFailTDV(totalFailTDVRef.current + 1);
                totalFailTDVRef.current += 1;
            }
        }
        if (payload.new.post_inspection != null) {
            setTotalInspection(totalInspectionRef.current + 1);
            totalInspectionRef.current += 1;
            if (payload.new.post_inspection != 'true') {
                setTotalInspectionFail(totalInspectionFailRef.current + 1);
                totalInspectionFailRef.current += 1;
            }
        }
    };
    const findNameAgency = (id: any) => {
        const itemAgency = dataAgencyRef.current.find((item: { id: any }) => item.id == id);
        return itemAgency.name;
    };

    const handleDataChanged = async (payload: {
        new: {
            id: number;
            created_at: string;
            agency_id: number;
            status: boolean;
            updated_at: string;
            is_success: boolean;
            is_occupied: boolean;
            post_inspection: string;
        };
        eventType: string;
    }) => {
        const newRow = {
            ...payload.new,
            reciever: payload.new.agency_id
                ? findNameAgency(payload.new.agency_id)
                : !payload.new.is_occupied
                ? 'BOT'
                : '',
            updated_at: !payload.new.status ? payload.new.updated_at : '',
            statusVKYC: payload.new.is_success ? 1 : !payload.new.is_success && !payload.new.status ? 2 : 0,
        };

        if (payload.eventType === 'INSERT') {
            Notification('info', 'Có cuộc gọi mới');
            handleRealtimeChartAll(payload);
            handleRealtimeChartToday(payload);
            handleInsertDataRealtime(newRow);
            setTotal(totalRef.current + 1);
            totalRef.current += 1;
        } else if (payload.eventType === 'UPDATE') {
            Notification('info', `Cuộc gọi ${payload.new.id} đã được cập nhật`);
            handleUpdateDateRealtime(newRow, payload.new.id);
            handleUpdateDataChartToday(payload);
            handleUpdateDataChartAll(payload);
            handleUpdateData(payload);
        }
    };

    useEffect(() => {
        const currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(new Date().getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        getDataChartAll(sevenDaysAgo.toISOString(), currentDate.toISOString());
        getDataChartToday(new Date());
        getDataCall();
        getData();
        const myChannel = supabase
            .channel('database-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room' }, handleDataChanged)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'room' }, handleDataChanged)
            .subscribe();

        return () => {
            supabase.removeChannel(myChannel);
        };
    }, [getData, getDataChartAll, getDataChartToday, getDataCall]);

    return (
        <ContainerStyled style={{ backgroundColor: 'white' }}>
            <TitleHomeStyled>Tổng quan</TitleHomeStyled>
            <RowStyled className="gx-m-0 gx-p-0 gx-mb-3" justify="center">
                <ViewReport
                    isLoading={isLoading}
                    label={'Tổng'}
                    total={total}
                    number={totalRoomClosed}
                    title1={'Đang diễn ra:'}
                    title2={'Kết thúc:'}
                    color={'#0088FE'}
                    image={images.phone}
                />
                <ViewReport
                    isLoading={isLoading}
                    label={'VKCY thành công'}
                    total={totalSuccess}
                    number={totalSuccessTDV}
                    title1={'KH - BOT:'}
                    title2={'KH - TDV:'}
                    color={'#00C49F'}
                    image={images.success}
                />
                <ViewReport
                    isLoading={isLoading}
                    label={'VKCY thất bại'}
                    total={totalFail}
                    number={totalFailTDV}
                    title1={'KH - BOT:'}
                    title2={'KH - TDV:'}
                    color={'red'}
                    image={images.fail}
                />
                <ViewReport
                    isLoading={isLoading}
                    label={'VKCY hậu kiểm'}
                    total={totalInspection}
                    number={totalInspectionFail}
                    title1={'Hợp lệ:'}
                    title2={'Không hợp lệ:'}
                    color={'#FFBB28'}
                    image={images.shield}
                />
            </RowStyled>

            <div className="gx-m-0 row_home gx-mt-3 gx-mb-5 " style={{ display: 'flex' }}>
                <div className="home_right" style={{ flex: 1, height: '100%', width: 1 }}>
                    <BarChartReport
                        getDataChartAll={getDataChartAll}
                        data={dataChartAll}
                        label="Biển đồ tổng số cuộc gọi"
                    />
                </div>
            </div>

            <div className="gx-m-0 row_home gx-mt-3 gx-mb-5 " style={{ display: 'flex' }}>
                <div className="home_right" style={{ flex: 1, height: '100%', marginRight: 20, width: 1 }}>
                    <AreaChartReport
                        getDataChartAll={getDataChartAll}
                        data={dataChartAll}
                        label="Biểu đồ trạng thái cuộc gọi"
                    />
                </div>
                <div className="home_right" style={{ flex: 1, height: '100%', width: 1 }}>
                    <ChartReport
                        getDataChartToday={getDataChartToday}
                        type="today"
                        data={dataChartToday}
                        label="Biểu đồ thống kê cuộc gọi hôm nay"
                    />
                </div>
            </div>

            <CardComponent title="Cuộc gọi VKYC gần nhất">
                <TableComponent
                    page={1}
                    loading={isLoading}
                    rowSelect={false}
                    onChangePage={(_page) => {}}
                    onRowClick={(record: {
                        id: number;
                        room: string;
                        video: string;
                        status: boolean;
                        post_inspection: string;
                        egress_id: string;
                    }) =>
                        navigate('/call-manager/detail' + '/' + record.id, {
                            state: {
                                roomName: record.room,
                                video: `http://0.0.0.0:5112/file/${record.video}`,
                                status: record.status,
                                post_inspection: record.post_inspection,
                                egress_id: record.egress_id,
                            },
                        })
                    }
                    dataSource={dataCall ? dataCall : []}
                    columns={columns(1)}
                    total={5}
                />
            </CardComponent>

            <TitleHomeStyled />
        </ContainerStyled>
    );
};

const ViewReport = ({ isLoading, label, total, number, title1, title2, color, image }: any) => {
    return (
        <Col xxl={6} xl={6} lg={12} md={12} sm={24} xs={24} className="gx-col-full gx-p-0 gx-px-2 gx-py-2">
            {/* <TooltipAntd color="#0088FE" title="Tổng số VKYC"> */}
            <ColStyled>
                <div
                    style={{
                        display: 'flex',
                        flex: 1,
                        alignItems: 'center',
                    }}
                >
                    <div style={textNote}>{label}</div>
                    <Image preview={false} width={23} src={image} />
                </div>
                {isLoading ? (
                    <Skeleton.Input active />
                ) : (
                    <div style={{ fontWeight: 'bold', fontSize: '25px', marginTop: 10, color: `${color}` }}>
                        {total}
                    </div>
                )}

                <div
                    style={{
                        marginTop: 5,
                        fontWeight: '600',
                        display: 'flex',
                        fontSize: 14,
                        alignItems: 'center',
                    }}
                >
                    {title1}
                    {isLoading ? (
                        <Skeleton.Input style={{ marginLeft: 10 }} size="small" active />
                    ) : (
                        <div style={{ color: 'black', marginLeft: 10, fontSize: 14 }}>{`${total - number} - (${(
                            ((total - number) / total) *
                            100
                        ).toFixed()}%)`}</div>
                    )}
                </div>
                <div
                    style={{
                        marginTop: 5,
                        fontWeight: '600',
                        display: 'flex',
                        fontSize: 14,
                        alignItems: 'center',
                    }}
                >
                    {title2}
                    {isLoading ? (
                        <Skeleton.Input style={{ marginLeft: 10 }} size="small" active />
                    ) : (
                        <div style={{ color: 'black', marginLeft: 10, fontSize: 14 }}>{`${number} - (${(
                            (number / total) *
                            100
                        ).toFixed()}%)`}</div>
                    )}
                </div>
            </ColStyled>
            {/* </TooltipAntd> */}
        </Col>
    );
};

const ContainerStyled = styled.div`
    width: 100%;
    height: 100%;
    flex: 1;
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    max-height: 100vh;

    @media (max-width: 992px) {
        & .row_home {
            flex-direction: column;
        }
        & .home_left {
            flex: 1;
            width: 100%;
        }

        & .home_right {
            flex: 1;
            flex-direction: row !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-top: 13px;
        }
        & .date_picker {
            margin-right: 20px;
        }
    }
`;

const TopBoxStyled = styled.div`
    background-color: #fff;
    box-shadow: ${BOX_SHADOW};
    padding: 20px;
    border-radius: ${RADIUS};
`;

const RowStyled = styled(Row)`
    padding: 0 40px;
    margin: 30px 0;
`;

const ColStyled = styled(Col)`
    padding: 14px;
    border-radius: ${RADIUS};
    position: relative;
    box-shadow: ${BOX_SHADOW};
`;

const TitleColStyled = styled.div`
    position: absolute;
    top: -10px;
    background-color: white;
    padding: 0 20px;
    font-weight: bold;
`;

const TitleHomeStyled = styled.h2`
    font-weight: 700;
    font-size: 22px;
    padding: 10px 0;
    margin: 0;
`;

export default HomePage;
