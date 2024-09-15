import { images } from '@/assets/imagesAssets';
import CardComponent from '@/components/CardComponent';
import FormComponent from '@/components/FormComponent';
import FormItemComponent from '@/components/FormComponent/FormItemComponent';
import IconAntd from '@/components/IconAntd';
import TopBar from '@/components/TopBar';
import useCallContext from '@/hooks/useCallContext';
import Container from '@/layout/Container';
import { supabase } from '@/supabaseClient';
import { Notification } from '@/utils';
import { isEqualTrackRef } from '@livekit/components-core';
import {
    CarouselLayout,
    ControlBar,
    FocusLayout,
    FocusLayoutContainer,
    GridLayout,
    LayoutContextProvider,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useCreateLayoutContext,
    useParticipants,
    useRoomContext,
    useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Button, Col, Form, Image, Input, Modal, Radio, Row, Spin, Steps } from 'antd';
import axios from 'axios';
import { Track } from 'livekit-client';
import _ from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useLocation, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import styled from 'styled-components';
import CameraButton, { onclickProps } from '../components/Camera.Button';
const { Step } = Steps;

const CallDetailPage = () => {
    const { state } = useCallContext();
    const axiosInstance = axios.create({
        baseURL: 'http://139.180.188.61:5112',
    });
    const location = useLocation();
    const [form] = Form.useForm();
    const { id } = useParams();
    const [frontImage, setFrontImage] = useState({ src: '', status: false });
    const [arrayFrontImage, setArrayFrontImage] = useState<any>([]);
    const arrayFrontImageRef = useRef<any>([]);
    const [arrayBackImage, setArrayBackImage] = useState<any>([]);
    const arrayBackImageRef = useRef<any>([]);
    const [arrayFaceImage, setArrayFaceImage] = useState<any>([]);
    const arrayFaceImageRef = useRef<any>([]);
    const [backImage, setBackImage] = useState({ src: '', status: false });
    const [face, setFace] = useState({ src: '', status: false, similarity: 0 });
    const [step, setStep] = useState(0);
    const [egressId, setEgressId] = useState(location.state.egress_id);
    const [description, setDescription] = useState('');
    const [isLivestream, setIsLiveStream] = useState(location.state.status);
    const [isDisplayLiveStream, setIsDisplayLiveStream] = useState(false);
    const [isDisplayVideo, setIsDisplayVideo] = useState(!location.state.status ? true : false);
    const [isVideoAvailable, setIsVideoAvailable] = useState('loading');
    const [isLoading, setIsLoading] = useState(true);
    const [urlVideo, setUrlVideo] = useState(location.state.video ? location.state.video : '');
    const [modalVisible, setModalVisible] = useState(false);
    const [isShowConfirm, setIsShowConfirm] = useState(location.state.post_inspection == 'true' ? false : true);
    const [dataRoom, setDataRoom] = useState<any>({ status: true, post_inspection: '' });
    const [isShowReason, setIsShowReason] = useState(false);
    const [isShowCloseRoom, setIsShowCloseRoom] = useState(true);
    const [token, setToken] = useState('');
    const [radioValue, setRadioValue] = useState(1);
    const inputReason = useRef<string>('');
    const frontImageRef = useRef('');
    const backImageRef = useRef('');
    const sessionIdRef = useRef('');
    const confidenceScore = useRef<{
        name: number;
        birthday: number;
        gender: number;
        address: number;
        documentType: number;
        documentNumber: number;
        issueDate: number;
        issueAddress: number;
    }>({
        name: 0,
        birthday: 0,
        gender: 0,
        address: 0,
        documentType: 0,
        documentNumber: 0,
        issueDate: 0,
        issueAddress: 0,
    });

    const getDataRoom = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('room')
                .select(
                    `id, room, status, user, is_occupied, video, created_at, updated_at,is_success,post_inspection,egress_id,
            agency(id, name)`
                )
                .eq('id', id);
            if (data) {
                setEgressId(data[0].egress_id);
                setIsLiveStream(data[0].status);
                setIsDisplayVideo(!data[0].status ? true : false);
                setUrlVideo(`http://139.180.188.61:5112/file/${data[0].video}`);
                setIsShowConfirm(data[0].post_inspection == 'true' ? false : true);
                setDataRoom(data[0]);
                getDataDetailCallChecked(data[0]);
                getDataDetailCall(data[0]);
            }

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }, []);

    const getDataDetailCallChecked = async (data: { post_inspection: string }) => {
        if (data.post_inspection == 'true') {
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('user_ocr_data')
                    .select(`*`)
                    .eq('room_id', id)
                    .eq('is_changed', true);
                form.setFieldsValue({
                    name: data ? data[0].data.name : '',
                    birthday: data ? data[0].data.birthday : '',
                    gender: data ? data[0].data.gender : '',
                    address: data ? data[0].data.address : '',
                    documentType: data ? data[0].data.documentType : '',
                    documentNumber: data ? data[0].data.documentNumber : '',
                    issueDate: data ? data[0].data.issueDate : '',
                    issueAddress: data ? data[0].data.issueAddress : '',
                });
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        }
    };

    const getDataDetailCall = async (dataRoom: { post_inspection: string | null }) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('request')
                .select(`*`)
                .eq('room_id', id)
                .order('created_at', { ascending: true });
            if (data && data.length > 0) {
                const findItemSession = data?.find((item) => item.url == '/session');
                if (findItemSession) {
                    form.setFieldValue('idSession', findItemSession.response.output.id);
                    sessionIdRef.current = findItemSession.response.output.id;
                }
                const arraydataOcrFront = data?.filter((item) => item.url === '/ocr-FR');
                const arraydataOcrBack = data?.filter((item) => item.url === '/ocr-BA');
                const arraydataFace = data?.filter((item) => item.url === '/face-compare');

                const arrayImageFront = arraydataOcrFront.map((item) => {
                    return {
                        src: item.image ? `${item.image}` : images.id_card,
                        msg: item.response.error ? item.response.error : item.response.msg,
                    };
                });
                setArrayFrontImage(arrayImageFront);
                arrayFrontImageRef.current = arrayImageFront;

                const arrayImageBack = arraydataOcrBack.map((item) => {
                    return {
                        src: item.image ? `${item.image}` : images.id_card_back,
                        msg: item.response.error ? item.response.error : item.response.msg,
                    };
                });
                setArrayBackImage(arrayImageBack);
                arrayBackImageRef.current = arrayImageBack;

                const arrayImageFace = arraydataFace.map((item) => {
                    return {
                        src: item.image ? `${item.image}` : images.portrait,
                        msg: item.response.error ? item.response.error : item.response.msg,
                    };
                });
                setArrayFaceImage(arrayImageFace);
                arrayFaceImageRef.current = arrayImageFace;

                const dataOcrFront = arraydataOcrFront[arraydataOcrFront.length - 1];
                const dataOcrBack = arraydataOcrBack[arraydataOcrBack.length - 1];
                const dataCompareFace = arraydataFace[arraydataFace.length - 1];

                if (
                    dataOcrFront &&
                    (dataOcrFront.response.code === 'SUCCESS' || dataOcrFront.response.code === 'Thành công')
                ) {
                    if (
                        dataOcrBack &&
                        (dataOcrBack.response.code === 'SUCCESS' || dataOcrBack.response.code === 'Thành công')
                    ) {
                        if (
                            dataCompareFace &&
                            (dataCompareFace.response.code === 'SUCCESS' ||
                                dataCompareFace.response.code === 'Thành công')
                        ) {
                            if (dataRoom.post_inspection !== null) {
                                setStep(4);
                            } else {
                                setStep(3);
                                setDescription('Waiting');
                            }
                        } else {
                            setStep(2);
                            setDescription(dataCompareFace ? dataCompareFace.response.error : '');
                        }
                    } else {
                        console.log('alo');
                        setStep(1);
                        setDescription(dataOcrBack ? dataOcrBack.response.error : '');
                    }
                } else {
                    setStep(0);
                    setDescription(dataOcrFront ? dataOcrFront.response.error : '');
                }

                if (
                    dataOcrFront.response.output &&
                    !dataOcrFront.response.error &&
                    dataRoom.post_inspection !== 'true'
                ) {
                    const resultOcrFront = dataOcrFront.response.output;
                    const dataConfidence = {
                        name: resultOcrFront.result.ho_ten.confidence,
                        birthday: resultOcrFront.result.ngay_sinh.confidence,
                        gender: resultOcrFront.result.gioi_tinh.confidence,
                        address: resultOcrFront.result.ho_khau_thuong_tru.confidence,
                        documentType: resultOcrFront.result.class_name.confidence,
                        documentNumber: resultOcrFront.result.id.confidence,
                        issueDate: 0,
                        issueAddress: 0,
                    };
                    confidenceScore.current = dataConfidence;
                    form.setFieldsValue({
                        name: resultOcrFront.name,
                        birthday: resultOcrFront.card_date_of_birth_normalized,
                        gender: resultOcrFront.card_gender == 'MA' ? 'Nam' : 'Nữ',
                        address: resultOcrFront.card_address,
                        documentType: resultOcrFront.card_type.includes('CC') ? 'Căn cước công dân' : '',
                        documentNumber: resultOcrFront.card_id,
                    });
                }

                if (dataOcrFront) {
                    setFrontImage({
                        src: dataOcrFront.image ? `${dataOcrFront.image}` : images.id_card,
                        status: dataOcrFront.response.error ? false : true,
                    });
                    frontImageRef.current = `${dataOcrFront.image}`;
                }
                if (dataOcrBack.response.output && !dataOcrBack.response.error && dataRoom.post_inspection !== 'true') {
                    const resultOcrBack = dataOcrBack.response.output;
                    confidenceScore.current = {
                        ...confidenceScore.current,
                        issueDate: resultOcrBack.result.ngay_cap.confidence,
                        issueAddress: resultOcrBack.result.noi_cap.confidence,
                    };
                    form.setFieldsValue({
                        issueDate: resultOcrBack.card_issued_date_normalized,
                        issueAddress: resultOcrBack.card_place_of_issue,
                    });
                }
                if (dataOcrBack) {
                    setBackImage({
                        src: dataOcrBack.image ? `${dataOcrBack.image}` : images.id_card_back,
                        status: dataOcrBack.response.error ? false : true,
                    });
                    backImageRef.current = `${dataOcrBack.image}`;
                }
                if (dataCompareFace) {
                    setFace({
                        src: dataCompareFace.image ? `${dataCompareFace.image}` : images.portrait,
                        status: dataCompareFace.response.error ? false : true,
                        similarity: dataCompareFace.response.output.similarity * 100,
                    });
                }
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
            if (error) {
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    };

    const getToken = useCallback(() => {
        if (isLivestream) {
            const apiUrl = 'http://139.180.188.61:5112/room/agent';
            const data = {
                roomId: id,
                agentName: state.info.key,
            };

            axios
                .post(apiUrl, data)
                .then((response) => {
                    setToken(response.data.data.token);
                })
                .catch((error) => {});
        }
    }, [isLivestream]);

    const handleDataDetailInsert = (payload: {
        new: { room_id: string; url: string; response: any; image: string };
        eventType: string;
    }) => {
        if (payload.new.room_id == id) {
            Notification('info', 'Thông tin cuộc gọi đang được cập nhật');
            const newItemImage = {
                src: payload.new.image ? `${payload.new.image}` : images.id_card,
                msg: payload.new.response.error ? payload.new.response.error : payload.new.response.msg,
            };

            if (payload.new.url == '/session') {
                form.setFieldValue('idSession', payload.new.response.output.id);
                sessionIdRef.current = payload.new.response.output.id;
                return;
            }
            if (payload.new.url == '/ocr-FR') {
                if (!form.getFieldValue('idSession')) {
                    getDataDetailCall(dataRoom);
                    return;
                }
                const newArrayImageFront = [...arrayFrontImageRef.current];
                newArrayImageFront.push(newItemImage);
                setArrayFrontImage(newArrayImageFront);
                arrayFrontImageRef.current = newArrayImageFront;
                if (payload.new.response.code == 'SUCCESS' || payload.new.response.code == 'Thành công') {
                    setStep(1);
                    setDescription('');
                } else {
                    setDescription(payload.new.response.error);
                }
                if (payload.new.image) {
                    console.log(payload.new.image);
                    setFrontImage({
                        src: `${payload.new.image}`,
                        status: payload.new.response.error ? false : true,
                    });
                    frontImageRef.current = `${payload.new.image}`;
                } else {
                    setFrontImage({
                        src: images.id_card,
                        status: payload.new.response.error ? false : true,
                    });
                    frontImageRef.current = images.id_card;
                }
                if (payload.new.response.output && !payload.new.response.error) {
                    form.setFieldsValue({
                        name: payload.new.response.output.name,
                        birthday: payload.new.response.output.card_date_of_birth_normalized,
                        gender: payload.new.response.output.card_gender == 'MA' ? 'Nam' : 'Nữ',
                        address: payload.new.response.output.card_address,
                        documentType: payload.new.response.output.card_type.includes('CC') ? 'Căn cước công dân' : '',
                        documentNumber: payload.new.response.output.card_id,
                    });
                }
                return;
            }
            if (payload.new.url == '/ocr-BA') {
                if (frontImageRef.current == '') {
                    getDataDetailCall(dataRoom);
                    return;
                }
                const newArrayImageBack = [...arrayBackImageRef.current];
                newArrayImageBack.push(newItemImage);
                setArrayBackImage(newArrayImageBack);
                arrayBackImageRef.current = newArrayImageBack;
                if (payload.new.response.code == 'SUCCESS' || payload.new.response.code == 'Thành công') {
                    setStep(2);
                    setDescription('');
                } else {
                    setDescription(payload.new.response.error);
                }

                if (payload.new.image) {
                    setBackImage({
                        src: `${payload.new.image}`,
                        status: payload.new.response.error ? false : true,
                    });
                    backImageRef.current = `${payload.new.image}`;
                } else {
                    setBackImage({
                        src: images.id_card_back,
                        status: payload.new.response.error ? false : true,
                    });
                    backImageRef.current = images.id_card_back;
                }
                if (payload.new.response.output && !payload.new.response.error) {
                    form.setFieldsValue({
                        issueDate: payload.new.response.output.card_issued_date_normalized,
                        issueAddress: payload.new.response.output.card_place_of_issue,
                    });
                }

                return;
            }
            if (payload.new.url == '/face-compare') {
                if (backImageRef.current == '') {
                    getDataDetailCall(dataRoom);
                    return;
                }
                const newArrayImageFace = [...arrayFaceImageRef.current];
                newArrayImageFace.push(newItemImage);
                setArrayFaceImage(newArrayImageFace);
                arrayFaceImageRef.current = newArrayImageFace;
                if (payload.new.response.code == 'SUCCESS' || payload.new.response.code == 'Thành công') {
                    if (step != 4) {
                        setStep(3);
                        setDescription('Waiting');
                    }
                } else {
                    setDescription(payload.new.response.error);
                }

                setTimeout(() => {
                    if (payload.new.image) {
                        setFace({
                            src: `${payload.new.image}`,
                            status: payload.new.response.error ? false : true,
                            similarity: payload.new.response.output.similarity * 100,
                        });
                    } else {
                        setFace({
                            src: images.portrait,
                            status: false,
                            similarity: payload.new.response.output.similarity * 100,
                        });
                    }
                }, 500);
            }
        }
    };

    const handleDataRoomUpdate = (payload: {
        new: { id: string; video: string; status: boolean; egress_id: string };
        eventType: string;
    }) => {
        if (payload.new.id == id) {
            setTimeout(() => {
                console.log(payload.new.status);
                setEgressId(payload.new.egress_id);
                setIsLiveStream(payload.new.status);
                setUrlVideo(`http://139.180.188.61:5112/file/${payload.new.video}`);
            }, 3000);
            if (!payload.new.status) {
                Notification('info', 'Cuộc gọi đã kết thúc');
            }
        }
    };

    const upadateAgency = async () => {
        const { error } = await supabase.from('agency').update({ is_available: true }).eq('id', state.info.id);
    };

    useEffect(() => {
        getToken();
        const myChannel = supabase
            .channel('request-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'request' }, handleDataDetailInsert)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'room' }, handleDataRoomUpdate)
            .subscribe();

        return () => {
            supabase.removeChannel(myChannel);
            upadateAgency();
        };
    }, [getToken]);

    useEffect(() => {
        getDataRoom();
    }, [getDataRoom]);

    const ocrImage = async (key: string, urlBase64: string) => {
        try {
            fetch(urlBase64)
                .then((res) => res.blob())
                .then(async (blob) => {
                    const fd = new FormData();
                    const file = new File([blob], 'filename.jpg');
                    if (key !== 'portrait_image') {
                        fd.append('isFront', key == 'front_image' ? 'true' : 'false');
                    }

                    fd.append('sessionId', sessionIdRef.current);
                    fd.append('image', file);

                    switch (key) {
                        case 'front_image':
                            try {
                                const res = await axiosInstance.post('/vkyc/ocr', fd, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                });
                                setIsLoading(false);
                            } catch (error) {
                                setIsLoading(false);
                            }

                            break;
                        case 'back_image':
                            try {
                                await axiosInstance.post('/vkyc/ocr', fd, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                });
                                setIsLoading(false);
                            } catch (error) {
                                setIsLoading(false);
                            }

                            break;
                        case 'portrait_image':
                            try {
                                const res = await axiosInstance.post('/vkyc/face-compare', fd, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                });

                                if (!res.data.error) {
                                    await axiosInstance.post('/cms/room/confirm', {
                                        roomId: id,
                                    });
                                }

                                setIsLoading(false);
                            } catch (error) {
                                setIsLoading(false);
                            }

                            break;

                        default:
                            break;
                    }
                });
        } catch (error) {}
    };

    const captureScreenShot = (value: onclickProps, typeImage?: string) => {
        if (value.track.mediaStream) {
            setIsLoading(true);
            const videoStream = value.track.mediaStream;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const stream = new MediaStream(videoStream);
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.play().then().catch();
            videoElement.onloadedmetadata = () => {
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                //ctx.translate(videoElement.videoWidth, 0);
                // ctx.scale(-1, 1);
                if (ctx) {
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                }

                const imageDataURL = canvas.toDataURL('image/jpeg');

                switch (value?.type) {
                    case 'front':
                        ocrImage('front_image', imageDataURL);

                        break;
                    case 'back':
                        ocrImage('back_image', imageDataURL);
                        break;
                    case 'face':
                        ocrImage('portrait_image', imageDataURL);
                        break;

                    default:
                        break;
                }
            };
        }
    };

    const closeRoom = async () => {
        setIsLoading(true);
        try {
            await axiosInstance.post(`/cms/room/closed`, {
                roomId: id,
                egressId,
            });
            setIsShowCloseRoom(false);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        setIsLoading(true);
        try {
            await axiosInstance.post('/cms/room/join', {
                roomId: id,
                agencyId: state.info.id.toString(),
            });
            if (!sessionIdRef.current) {
                const res = await axiosInstance.post('/vkyc/session', {
                    roomId: id,
                });
                setIsLoading(false);
                sessionIdRef.current = res.data.output.id;
                setIsDisplayLiveStream(true);
            } else {
                setIsLoading(false);
                setIsDisplayLiveStream(true);
            }
        } catch (error) {
            setIsLoading(false);
        }
    };

    const checkVideoAvailable = async () => {
        setIsDisplayVideo(true);
        const room = await supabase.from('room').select().eq('id', id);
        if (!room.data || !room.data[0]) {
            return;
        }

        const intervalGetVideo = setInterval(async () => {
            try {
                const response = await axiosInstance.post('/cms/check/video', {
                    egressId: room.data[0].egress_id,
                });

                if (response.data.code == 200) {
                    setIsVideoAvailable('play');
                    clearInterval(intervalGetVideo);
                }
                if (response.data.code == 206 || response.data.code == 202) {
                    setIsVideoAvailable('loading');
                }
                if (response.data.code != 200 && response.data.code != 206) {
                    setIsVideoAvailable('error');
                    clearInterval(intervalGetVideo);
                }
            } catch (err) {
                clearInterval(intervalGetVideo);
                setIsVideoAvailable('error');
            }
        }, 2000);
    };

    useEffect(() => {
        if (isDisplayVideo) {
            checkVideoAvailable();
        }
    }, [isDisplayVideo]);

    const confirmPostInspection = async () => {
        if (radioValue == 2 && inputReason.current == '') {
            return;
        }
    };

    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            await axiosInstance.post(`/cms/room/ocr/${id}`, {
                dataOCR: values,
                confirm: radioValue == 1 ? 'true' : inputReason.current ? inputReason.current : '',
            });
            setIsShowConfirm(false);
            setIsShowReason(true);
            setIsLoading(false);
            setStep(4);
        } catch (error) {
            setIsLoading(false);
        }
    };

    return (
        <Spin spinning={isLoading} size="large" style={{ marginTop: 200, height: '100vh' }}>
            <div style={{ height: '100vh' }}>
                <TopBar title={`Thông tin cuộc gọi ${id}`} />
                <Container>
                    <CardComponent>
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#2A8CCC',
                                marginBottom: 15,
                                marginTop: 20,
                            }}
                        >
                            Quy trình thực hiện
                        </div>

                        <Steps style={{ marginBottom: 20 }} size="small" current={step}>
                            <Step
                                description={
                                    step === 0 ? <div style={{ color: 'red', fontSize: 13 }}>{description}</div> : ''
                                }
                                title="OCR Mặt trước"
                            />
                            <Step
                                description={
                                    step === 1 ? <div style={{ color: 'red', fontSize: 13 }}>{description}</div> : ''
                                }
                                title="OCR Mặt sau"
                            />
                            <Step
                                description={
                                    step === 2 ? <div style={{ color: 'red', fontSize: 13 }}>{description}</div> : ''
                                }
                                title="So sánh khuôn mặt"
                            />
                            <Step
                                description={
                                    step === 3 ? <div style={{ color: 'red', fontSize: 13 }}>{description}</div> : ''
                                }
                                title="Hậu kiểm"
                            />
                        </Steps>
                        <Row>
                            <Col xs={24} sm={24} lg={11}>
                                <FormComponent form={form} onSubmit={handleSubmit}>
                                    <div
                                        style={{ fontSize: 16, fontWeight: '600', color: '#2A8CCC', marginBottom: 15 }}
                                    >
                                        Thông tin người đại diện
                                    </div>

                                    <Row>
                                        <FormItemComponent
                                            name="name"
                                            label="Họ và tên"
                                            inputField={
                                                <Input
                                                    readOnly={step != 3}
                                                    style={{ height: 40 }}
                                                    placeholder="Nhập họ tên"
                                                />
                                            }
                                        />
                                        {!isShowConfirm ? (
                                            <Image
                                                style={{ marginTop: 5 }}
                                                preview={false}
                                                width={25}
                                                src={images.check}
                                            />
                                        ) : (
                                            <TextConfident
                                                style={{
                                                    color: confidenceScore.current.name >= 0.9 ? 'green' : 'yellow',
                                                    height: 40,
                                                }}
                                            >
                                                {confidenceScore.current.name > 0
                                                    ? (confidenceScore.current.name * 100).toString() + '%'
                                                    : ''}
                                            </TextConfident>
                                        )}

                                        <FormItemComponent
                                            name="birthday"
                                            label="Ngày sinh"
                                            inputField={
                                                <Input
                                                    readOnly={step != 3}
                                                    style={{ height: 40 }}
                                                    placeholder="Nhập ngày sinh"
                                                />
                                            }
                                        />

                                        {!isShowConfirm ? (
                                            <Image
                                                style={{ marginTop: 5 }}
                                                preview={false}
                                                width={25}
                                                src={images.check}
                                            />
                                        ) : (
                                            <TextConfident
                                                style={{
                                                    color: confidenceScore.current.birthday >= 0.9 ? 'green' : 'yellow',
                                                    height: 40,
                                                }}
                                            >
                                                {confidenceScore.current.birthday > 0
                                                    ? (confidenceScore.current.birthday * 100).toString() + '%'
                                                    : ''}
                                            </TextConfident>
                                        )}

                                        <FormItemComponent
                                            name="gender"
                                            label="Giới tính"
                                            inputField={
                                                <Input
                                                    readOnly={step != 3}
                                                    style={{ height: 40 }}
                                                    placeholder="Nhập giới tính"
                                                />
                                            }
                                        />

                                        {!isShowConfirm ? (
                                            <Image
                                                style={{ marginTop: 5 }}
                                                preview={false}
                                                width={25}
                                                src={images.check}
                                            />
                                        ) : (
                                            <TextConfident
                                                style={{
                                                    color: confidenceScore.current.gender >= 0.9 ? 'green' : 'yellow',
                                                    height: 40,
                                                }}
                                            >
                                                {confidenceScore.current.gender > 0
                                                    ? (confidenceScore.current.gender * 100).toString() + '%'
                                                    : ''}
                                            </TextConfident>
                                        )}

                                        <FormItemComponent
                                            name="address"
                                            label="Địa chỉ"
                                            inputField={
                                                <Input
                                                    readOnly={step != 3}
                                                    style={{ height: 40 }}
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            }
                                        />

                                        {!isShowConfirm ? (
                                            <Image
                                                style={{ marginTop: 5 }}
                                                preview={false}
                                                width={25}
                                                src={images.check}
                                            />
                                        ) : (
                                            <TextConfident
                                                style={{
                                                    color: confidenceScore.current.address >= 0.9 ? 'green' : 'yellow',
                                                    height: 40,
                                                }}
                                            >
                                                {confidenceScore.current.address > 0
                                                    ? (confidenceScore.current.address * 100).toString() + '%'
                                                    : ''}
                                            </TextConfident>
                                        )}

                                        <FormItemComponent
                                            name="documentNumber"
                                            label="Số giấy tờ"
                                            inputField={
                                                <Input
                                                    readOnly={step != 3}
                                                    style={{ height: 40 }}
                                                    placeholder="Nhập số giấy tờ"
                                                />
                                            }
                                        />

                                        {!isShowConfirm ? (
                                            <Image
                                                style={{ marginTop: 5 }}
                                                preview={false}
                                                width={25}
                                                src={images.check}
                                            />
                                        ) : (
                                            <TextConfident
                                                style={{
                                                    color:
                                                        confidenceScore.current.documentType >= 0.9
                                                            ? 'green'
                                                            : 'yellow',
                                                    height: 40,
                                                }}
                                            >
                                                {confidenceScore.current.documentType > 0
                                                    ? (confidenceScore.current.documentType * 100).toString() + '%'
                                                    : ''}
                                            </TextConfident>
                                        )}

                                        <FormItemComponent
                                            name="issueDate"
                                            label="Ngày cấp"
                                            inputField={
                                                <Input
                                                    readOnly={step != 3}
                                                    style={{ height: 40 }}
                                                    placeholder="Nhập ngày cấp"
                                                />
                                            }
                                        />

                                        {!isShowConfirm ? (
                                            <Image
                                                style={{ marginTop: 5 }}
                                                preview={false}
                                                width={25}
                                                src={images.check}
                                            />
                                        ) : (
                                            <TextConfident
                                                style={{
                                                    color:
                                                        confidenceScore.current.issueDate >= 0.9 ? 'green' : 'yellow',
                                                    height: 40,
                                                }}
                                            >
                                                {confidenceScore.current.issueDate > 0
                                                    ? (confidenceScore.current.issueDate * 100).toString() + '%'
                                                    : ''}
                                            </TextConfident>
                                        )}

                                        <FormItemComponent
                                            name="issueAddress"
                                            label="Nơi cấp"
                                            inputField={
                                                <Input
                                                    readOnly={step != 3}
                                                    style={{ height: 40 }}
                                                    placeholder="Nhập nơi cấp"
                                                />
                                            }
                                        />

                                        {!isShowConfirm ? (
                                            <Image
                                                style={{ marginTop: 5 }}
                                                preview={false}
                                                width={25}
                                                src={images.check}
                                            />
                                        ) : (
                                            <TextConfident
                                                style={{
                                                    color:
                                                        confidenceScore.current.issueAddress >= 0.9
                                                            ? 'green'
                                                            : 'yellow',
                                                    height: 40,
                                                }}
                                            >
                                                {confidenceScore.current.issueAddress > 0
                                                    ? (confidenceScore.current.issueAddress * 100).toString() + '%'
                                                    : ''}
                                            </TextConfident>
                                        )}

                                        <FormItemComponent
                                            name="idSession"
                                            label="Mã cuộc gọi"
                                            inputField={
                                                <Input readOnly style={{ height: 40 }} placeholder="Mã cuộc gọi" />
                                            }
                                        />
                                    </Row>
                                    {isShowConfirm && step === 3 && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                                marginBlock: 15,
                                            }}
                                        >
                                            <p>Xác nhận thông tin khách hàng</p>
                                            <Radio.Group
                                                onChange={(value) => setRadioValue(value.target.value)}
                                                value={radioValue}
                                            >
                                                <Radio value={2}>Không hợp lệ</Radio>
                                                <Radio value={1}>Hợp lệ</Radio>
                                            </Radio.Group>
                                            {radioValue == 2 ? (
                                                <Row
                                                    gutter={16}
                                                    style={{
                                                        marginTop: 16,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Input
                                                        placeholder="Nhập lý do"
                                                        onChange={(e) => (inputReason.current = e.target.value)}
                                                        allowClear
                                                        style={{}}
                                                    ></Input>
                                                </Row>
                                            ) : null}
                                            <Button
                                                type="primary"
                                                style={{
                                                    marginTop: 15,
                                                }}
                                                htmlType="submit"
                                                onClick={confirmPostInspection}
                                            >
                                                Xác nhận
                                            </Button>
                                        </div>
                                    )}
                                </FormComponent>
                            </Col>

                            <Col xs={24} sm={24} lg={6}>
                                <ImageComponent
                                    preview={frontImage.src ? true : false}
                                    src={frontImage.src ? frontImage.src : images.id_card}
                                    msg={!frontImage.src ? '' : frontImage.status ? 'Pass' : 'Fail'}
                                    label={'Chứng minh nhân dân mặt trước'}
                                />

                                <ImageComponent
                                    preview={backImage.src ? true : false}
                                    src={backImage.src ? backImage.src : images.id_card_back}
                                    msg={!backImage.src ? '' : backImage.status ? 'Pass' : 'Fail'}
                                    label={'Chứng minh nhân dân mặt sau'}
                                />

                                <ImageComponent
                                    preview={face.src ? true : false}
                                    src={face.src ? face.src : images.portrait}
                                    msg={
                                        !face.src
                                            ? ''
                                            : face.status
                                            ? `Độ chính xác: ${face.similarity.toFixed()}%`
                                            : 'Fail'
                                    }
                                    label={'Ảnh chân dung'}
                                />

                                {(frontImage.src || backImage.src || face.src) && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Button
                                            onClick={() => {
                                                setModalVisible(true);
                                            }}
                                            style={{ marginTop: 10 }}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                )}
                            </Col>

                            {isLivestream ? (
                                <Col xs={24} sm={24} lg={7}>
                                    {isDisplayLiveStream ? (
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    color: '#2A8CCC',
                                                    marginBottom: 15,
                                                }}
                                            >
                                                Cuộc gọi VKYC
                                            </div>
                                            <LiveKitRoom
                                                video={true}
                                                audio={true}
                                                token={token}
                                                connectOptions={{ autoSubscribe: true }}
                                                serverUrl={'wss://test-lr2tmegs.livekit.cloud'}
                                                data-lk-theme="default"
                                                style={{ height: '100%' }}
                                            >
                                                <>
                                                    <MyVideoConference setIsLiveStream={setIsLiveStream} />
                                                    <RoomAudioRenderer />
                                                    <LayoutButtonCamera
                                                        closeRoom={_.debounce(closeRoom, 500)}
                                                        step={step}
                                                        egressId={egressId}
                                                        isShowCloseRoom={isShowCloseRoom}
                                                        captureScreenShot={_.debounce(captureScreenShot, 500)}
                                                    />
                                                </>
                                            </LiveKitRoom>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {step < 3 && (
                                                <Button
                                                    type="primary"
                                                    className="gx-mb-0"
                                                    style={{ display: 'flex', alignItems: 'center' }}
                                                    onClick={handleJoinRoom}
                                                    icon={<IconAntd icon="PhoneOutlined" />}
                                                >
                                                    Tham gia hỗ trợ
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </Col>
                            ) : (
                                <Col xs={24} sm={24} lg={7}>
                                    {isDisplayVideo ? (
                                        <>
                                            {isVideoAvailable == 'loading' && (
                                                <div
                                                    style={{
                                                        flexDirection: 'column',
                                                        alignSelf: 'center',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        display: 'flex',
                                                        width: '100%',
                                                    }}
                                                >
                                                    <ClipLoader
                                                        color="rgba(3,143,222,1)"
                                                        size={60}
                                                        speedMultiplier={0.8}
                                                    />
                                                    <p style={{ marginTop: 10 }}>Đang tải video, vui lòng đợi</p>
                                                </div>
                                            )}
                                            {isVideoAvailable == 'error' && (
                                                <div
                                                    style={{
                                                        flexDirection: 'column',
                                                        alignSelf: 'center',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        display: 'flex',
                                                        width: '100%',
                                                    }}
                                                >
                                                    <p>Error loading video. Please try again later.</p>
                                                </div>
                                            )}
                                            {isVideoAvailable == 'play' && (
                                                <ReactPlayer
                                                    width="100%"
                                                    url={urlVideo}
                                                    playing={false}
                                                    controls={true}
                                                    onError={(e) => setIsVideoAvailable('error')}
                                                />
                                            )}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: 30,
                                                }}
                                            >
                                                {dataRoom.post_inspection == 'true' ||
                                                (isShowReason && radioValue == 1) ? (
                                                    <div
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: '600',
                                                            color: 'green',
                                                        }}
                                                    >{`Thông tin đã được Admin xác nhận là HỢP LỆ`}</div>
                                                ) : (dataRoom.post_inspection != null &&
                                                      dataRoom.post_inspection != 'true') ||
                                                  (isShowReason && radioValue != 1) ? (
                                                    <>
                                                        <div
                                                            style={{
                                                                fontSize: 16,
                                                                fontWeight: '600',
                                                                color: 'red',
                                                            }}
                                                        >{`Thông tin đã được Admin xác nhận là KHÔNG HỢP LỆ`}</div>
                                                        <div
                                                            style={{
                                                                fontSize: 16,
                                                                fontWeight: '600',
                                                                color: 'red',
                                                                marginTop: 10,
                                                            }}
                                                        >{`Lý do: ${dataRoom.post_inspection}`}</div>
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Button
                                                type="primary"
                                                className="gx-mb-0"
                                                style={{ display: 'flex', alignItems: 'center' }}
                                                onClick={() => {
                                                    setIsDisplayVideo(true);
                                                }}
                                                //icon={<IconAntd icon="PhoneOutlined" />}
                                            >
                                                Video VKYC
                                            </Button>
                                        </div>
                                    )}
                                </Col>
                            )}
                        </Row>
                    </CardComponent>
                </Container>
            </div>
            <ModalStyled
                width={1000}
                centered
                footer={false}
                title="Chi tiết"
                open={modalVisible}
                onOk={() => {
                    setModalVisible(false);
                }}
                onCancel={() => {
                    setModalVisible(false);
                }}
            >
                {arrayFrontImage.length <= 1 && arrayBackImage.length <= 1 && arrayFaceImage.length <= 1 ? (
                    <>
                        <Row style={{ justifyContent: 'center' }}>
                            {arrayFrontImage.length > 0 && (
                                <ImageComponent
                                    src={arrayFrontImage[0].src}
                                    msg={arrayFrontImage[0].msg}
                                    label={'Chứng minh nhân dân mặt trước'}
                                />
                            )}
                            {arrayBackImage.length > 0 && (
                                <ImageComponent
                                    src={arrayBackImage[0].src}
                                    msg={arrayBackImage[0].msg}
                                    label={'Chứng minh nhân dân mặt sau'}
                                />
                            )}
                            {arrayFaceImage.length > 0 && (
                                <ImageComponent
                                    src={arrayFaceImage[0].src}
                                    msg={arrayFaceImage[0].msg}
                                    label={'Ảnh chân dung'}
                                />
                            )}
                        </Row>
                    </>
                ) : (
                    <Col>
                        {arrayFrontImage.length > 0 && (
                            <Col>
                                <div
                                    style={{
                                        marginBottom: 15,
                                        fontSize: 14.5,
                                        fontWeight: '600',
                                    }}
                                >
                                    Chứng minh nhân dân mặt trước
                                </div>
                                <Row>
                                    {arrayFrontImage.map((item: any, index: number) => {
                                        return (
                                            <ViewImageStyled key={index}>
                                                <Image src={item.src} />
                                                <div
                                                    style={{
                                                        marginTop: 10,
                                                        fontWeight: 'bold',
                                                        color:
                                                            item.msg == 'SUCCESS' || item.msg == 'Thành công'
                                                                ? 'green'
                                                                : 'red',
                                                    }}
                                                >
                                                    {item.msg == 'SUCCESS' ? 'Pass' : item.msg}
                                                </div>
                                            </ViewImageStyled>
                                        );
                                    })}
                                </Row>
                            </Col>
                        )}
                        {arrayBackImage.length > 0 && (
                            <Col>
                                <div
                                    style={{
                                        marginBottom: 15,
                                        fontSize: 14.5,
                                        fontWeight: '600',
                                        marginTop: 10,
                                    }}
                                >
                                    Chứng minh nhân dân mặt sau
                                </div>
                                <Row>
                                    {arrayBackImage.map((item: any, index: number) => {
                                        return (
                                            <ViewImageStyled key={index}>
                                                <Image src={item.src} />
                                                <div
                                                    style={{
                                                        marginTop: 10,
                                                        fontWeight: 'bold',
                                                        color:
                                                            item.msg == 'SUCCESS' || item.msg == 'Thành công'
                                                                ? 'green'
                                                                : 'red',
                                                    }}
                                                >
                                                    {item.msg == 'SUCCESS' ? 'Pass' : item.msg}
                                                </div>
                                            </ViewImageStyled>
                                        );
                                    })}
                                </Row>
                            </Col>
                        )}
                        {arrayFaceImage.length > 0 && (
                            <Col>
                                <div
                                    style={{
                                        marginBottom: 15,
                                        fontSize: 14.5,
                                        marginTop: 10,
                                        fontWeight: '600',
                                    }}
                                >
                                    Ảnh chân dung
                                </div>
                                <Row>
                                    {arrayFaceImage.map((item: any, index: number) => {
                                        return (
                                            <ViewImageStyled key={index}>
                                                <Image src={item.src} />
                                                <div
                                                    style={{
                                                        marginTop: 10,
                                                        fontWeight: 'bold',
                                                        color:
                                                            item.msg == 'SUCCESS' || item.msg == 'Thành công'
                                                                ? 'green'
                                                                : 'red',
                                                    }}
                                                >
                                                    {item.msg == 'SUCCESS' ? 'Pass' : item.msg}
                                                </div>
                                            </ViewImageStyled>
                                        );
                                    })}
                                </Row>
                            </Col>
                        )}
                    </Col>
                )}
            </ModalStyled>
        </Spin>
    );
};

const MyVideoConference = ({ setIsLiveStream }: { setIsLiveStream: Dispatch<SetStateAction<boolean>> }) => {
    const roomContext = useRoomContext();
    const layoutContext = useCreateLayoutContext();
    const num = useParticipants();
    const prevNumParticipants = useRef(0);

    // `useTracks` returns all camera and screen share tracks. If a user
    // joins without a published camera track, a placeholder track is returned.
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    );
    const trackReferences = useTracks([Track.Source.Camera]);
    const trackRemote = trackReferences.find((item) => !item.participant.identity.includes('Agency'));
    const focusTrack = trackRemote;
    //const focusTrack = trackReferences[0];
    const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

    useEffect(() => {
        if (prevNumParticipants.current == 0 && num.length == 2) {
            prevNumParticipants.current = 2;
        }
        if (prevNumParticipants.current == 2 && num.length == 1) {
            setIsLiveStream(false);
        }
    }, [num.length]);

    return (
        <LayoutContextProvider value={layoutContext}>
            {!focusTrack ? (
                <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
                    <ParticipantTile />
                </GridLayout>
            ) : (
                <div className="lk-focus-layout-wrapper">
                    <FocusLayoutContainer>
                        <CarouselLayout tracks={carouselTracks}>
                            <ParticipantTile />
                        </CarouselLayout>
                        {focusTrack && <FocusLayout trackRef={focusTrack} />}
                    </FocusLayoutContainer>
                </div>
            )}
            <ControlBar controls={{ leave: false, screenShare: false }} style={{ marginTop: 10 }} />
        </LayoutContextProvider>
    );
};

const LayoutButtonCamera = ({
    step,
    captureScreenShot,
    closeRoom,
    isShowCloseRoom,
    egressId,
}: {
    step: number;
    captureScreenShot: (value: onclickProps, typeImage?: string) => void;
    closeRoom: () => void;
    isShowCloseRoom: boolean;
    egressId: string;
}) => {
    return (
        <div
            style={{
                paddingTop: 10,
                paddingBottom: 10,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {step !== 3 && (
                <CameraButton
                    title={step == 0 ? 'Chụp CMND Mặt trước' : step == 1 ? 'Chụp CMND Mặt sau' : 'Chụp chân dung'}
                    onClick={(data) => {
                        captureScreenShot(data, 'image/jpeg');
                    }}
                    type={step == 0 ? 'front' : step == 1 ? 'back' : 'face'}
                />
            )}
            {/* {isShowCloseRoom && egressId && ( */}
            <Button
                type="danger"
                className="gx-mb-0"
                onClick={closeRoom}
                style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}
                icon={<IconAntd icon="RollbackOutlined" />}
            >
                Đóng phòng
            </Button>
            {/* )} */}
        </div>
    );
};

const ImageComponent = ({ label, src, msg, preview }: any) => {
    return (
        <>
            <ViewImageStyled>
                <div style={{ marginBottom: 15, fontSize: 14.5, fontWeight: '600' }}>{label}</div>

                <Image preview={preview} src={src} />
                <div
                    style={{
                        marginTop: 10,
                        fontWeight: 'bold',
                        color:
                            msg == 'SUCCESS' || msg == 'Thành công' || msg == 'Pass' || msg.includes('Độ chính xác')
                                ? 'green'
                                : 'red',
                    }}
                >
                    {msg}
                </div>
            </ViewImageStyled>
        </>
    );
};

const ViewImageStyled = styled.div`
    margin-left: 15px;
    margin-right: 20px;
    max-width: 230px;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    align-items: center;
`;

const ModalStyled = styled(Modal)`
    & .ant-modal-title {
        text-align: center;
        font-weight: 700;
        font-size: 18px;
    }
`;

const TextConfident = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    margin-left: 5px;
`;

export default CallDetailPage;
