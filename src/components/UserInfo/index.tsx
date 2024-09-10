import { images } from '@/assets/imagesAssets';
import { SET_INFO } from '@/context/types';
import useCallContext from '@/hooks/useCallContext';
import { Avatar, Popover, Row } from 'antd';
import React from 'react';
import Clock from 'react-live-clock';
import styled from 'styled-components';

const UserInfo = () => {
    const { state, dispatch } = useCallContext();
    console.log(state.info.name);

    const userMenuOptions = (
        <ul className="gx-user-popover">
            <li
                className="gx-font-weight-medium"
                onClick={() => dispatch({ type: SET_INFO, payload: { id: 1, name: 'Agency 1', key: 'Agency1' } })}
            >
                Agency 1
            </li>
            <li
                className="gx-font-weight-medium"
                onClick={() => dispatch({ type: SET_INFO, payload: { id: 2, name: 'Agency 2', key: 'Agency2' } })}
            >
                Agency 2
            </li>
            <li
                className="gx-font-weight-medium"
                onClick={() => dispatch({ type: SET_INFO, payload: { id: 3, name: 'Agency 3', key: 'Agency3' } })}
            >
                Agency 3
            </li>
        </ul>
    );

    return (
        <>
            <Row wrap={false} justify="start" className="gx-avatar-row gx-m-0">
                <Popover placement="bottomLeft" content={userMenuOptions}>
                    <Avatar src={images.avatar} className="gx-size-40 gx-pointer gx-mr-3" alt="" />
                    <span className="gx-avatar-name gx-font-weight-bold" style={{ color: 'white' }}>
                        {state.info.name}
                        {/* <DownOutlined className="gx-fs-sm gx-ml-4" /> */}
                    </span>
                </Popover>
            </Row>
            <Row justify="start" align="middle" className="gx-app-nav" style={{ marginTop: '15px' }}>
                <ClockStyled>
                    <Clock format="hh:mm:ss a" ticking />
                </ClockStyled>
            </Row>
        </>
    );
};

const ClockStyled = styled.li`
    border-radius: 10px;
    margin-left: 20px;
    width: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px;
    background: linear-gradient(to right, #2b5876, #4e4376);
    border: 1px dashed #ccc;
    & * {
        font-size: 1.6rem;
        font-weight: 700;
        color: white;
    }
`;

export default React.memo(UserInfo);
