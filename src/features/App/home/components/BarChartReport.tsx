import RangerPicker from '@/components/RangerPicker';
import { BOX_SHADOW, RADIUS } from '@/config/theme';
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

const BarChartReport = ({ data, label, getDataChartAll }: any) => {
    return (
        <ReportChartStyled>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: 10,
                    marginBottom: 10,
                }}
            >
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{label}</div>
                <RangerPicker
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
                />
            </div>

            <BoxChart style={{ minHeight: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        width={500}
                        height={400}
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                            type="monotone"
                            name="Tổng số cuộc gọi"
                            dataKey="call"
                            stackId="1"
                            stroke="#0088FE"
                            fill="#0088FE"
                        />
                    </AreaChart>
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

export default React.memo(BarChartReport);
