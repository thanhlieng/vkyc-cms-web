import RangerPicker from '@/components/RangerPicker';
import { BOX_SHADOW, RADIUS } from '@/config/theme';
import { Col, Row } from 'antd';
import React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import styled from 'styled-components';

const AreaChartReport = ({ data, label, getDataChartAll }: any) => {
    return (
        <ReportChartStyled>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                    marginBottom: 10,
                }}
            >
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{label}</div>
                {/* <RangerPicker
                    style={{ height: 40, marginLeft: 'auto' }}
                    name="dateFilter"
                    onChange={(name: string, value: string) => {
                        if (value) {
                            const startDate = new Date(value.split(',')[0]);
                            startDate.setHours(0, 0, 0, 0);
                            const endDate = new Date(value.split(',')[1]);
                            endDate.setHours(23, 59, 59, 999);
                            getDataChartAll(startDate.toISOString(), endDate.toISOString());
                        } else {
                            const currentDate = new Date();
                            currentDate.setHours(23, 59, 59, 999);
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(new Date().getDate() - 7);
                            sevenDaysAgo.setHours(0, 0, 0, 0);
                            getDataChartAll(sevenDaysAgo.toISOString(), currentDate.toISOString());
                        }
                    }}
                /> */}
            </div>
            <BoxChart style={{ minHeight: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        width={500}
                        height={300}
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="callSuccess" name="Cuộc gọi thành công" stackId="a" fill="#00C49F" />
                        <Bar name="Cuộc gọi thất bại" dataKey="callFail" stackId="a" fill="#FFBB28" />
                    </BarChart>
                </ResponsiveContainer>
            </BoxChart>
            {/* </div> */}
        </ReportChartStyled>
    );
};

const ReportChartStyled = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0px 30px 20px 10px;
    box-shadow: ${BOX_SHADOW};
    background-color: white;
    border-radius: ${RADIUS};
`;

const BoxChart = styled.div``;

export default React.memo(AreaChartReport);
