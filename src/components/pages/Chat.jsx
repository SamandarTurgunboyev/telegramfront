import React, { useCallback, useEffect, useRef, useState } from 'react'
import '../../App.css'
import SendIcon from '@mui/icons-material/Send';
import newSocket from '../../socket';
import { api } from '../../api';
import { deleteChat, deleteChatGroup, editChat, getUserChat, getUserChatID, imageUrl } from '../../api/url';
import { useDispatch, useSelector } from 'react-redux';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Box, Button, Card, CardMedia, Modal, styled, TextareaAutosize, Typography } from '@mui/material';
import SelectImages from './SelectImages';
import CircularProgressWithLabel from './Progress';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import User from './User';
import { addUser } from '../../store/userSlice';
import ContextMenu from './Menu/ContextMenu';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import WestIcon from '@mui/icons-material/West';
import VideocamIcon from '@mui/icons-material/Videocam';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    p: 4,
    height: 400
};

function Chat(
    {
        chat,
        phoneRec,
        userChat,
        getUser,
        endOfMessagesRef,
        scrollToBottom,
        handleContextMenu,
        menuPosition,
        menuVisible,
        setMenuVisible,
        setMenuPosition,
        selectChat,
        setSelectChat,
        selectGroup,
        setSelectGroup,
        setchatSelected,
        setGetUser
    }
) {
    const userRef = useRef()
    const { phone, name } = useSelector((state) => state.user.user)
    const fileInputRef = useRef();
    const [open, setOpen] = useState(false);
    const user = useSelector((state) => state.user.user)
    const [chatApi, setChat] = useState([])
    const [socket, setSocket] = useState([])
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [videoChunks, setVideoChunks] = useState([]);
    const audioRef = useRef(null);

    const handleStartRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        const chunks = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioURL(url);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    const handleClearAudio = () => {
        setAudioURL(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Ovozni tozalash
        }
    };

    const dispatch = useDispatch()

    const [socketData, setSocketData] = useState()
    const [uploadProgress, setUploadProgress] = useState(0);
    const [userInfoModal, setUserInfoModal] = React.useState(false);
    const handleOpen = () => setUserInfoModal(true);

    const handleChat = async () => {
        if (uploadProgress === 0) {
            try {
                const response = await api.get(getUserChat, {
                    params: {
                        sender: phone,
                        receiver: phoneRec
                    }
                })
                setChat(response.data.data)
            } catch (error) {
            }
        }
        newSocket.on('upload-progress', (data) => {
            setUploadProgress(data.progress);
        });

        // Listen for upload completion
        newSocket.on('upload-complete', () => {
            setUploadProgress(0)
        })
    };

    const handleFileChange = () => {
        if (fileInputRef.current && fileInputRef.current.files.length > 0) {
            setOpen(true);
        }
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatApi, uploadProgress]);

    const [message, setMessage] = useState(selectChat?.message || '');
    const [groupMessage, setgroupMessage] = useState(false)

    useEffect(() => {
        if (!phoneRec?.includes('+')) {
            setgroupMessage(true)
        } else {
            setgroupMessage(false)
        }
    }, [phoneRec])

    useEffect(() => {
        if (audioChunks.length > 0) {
            const blob = new Blob(audioChunks, { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            setAudioURL(url);
        }
    }, [audioChunks]);
    const chunkSize = 50 * 1024;

    const handleMsg = (e) => {
        e.preventDefault()
        newSocket.on('message', (data) => {
            setSocket(data)
        })
        if (userRef?.current?.value) {
            newSocket.emit('sendMessage',
                {
                    message: userRef.current.value,
                    receiver: phoneRec,
                    sender: phone,
                    senderName: name,
                    fileName: '',
                    typeFile: '',
                    groupMessage
                }
            )
            userRef.current.value = ""
        }
        if (audioURL) {
            uploadAudio()
        }

        setSelectChat('')
        setEdit(false)
        setMessage('')
    }

    const uploadAudio = () => {
        if (!audioURL) return;

        const file = new Blob(audioChunks, { type: 'audio/wav' });
        const uniqueFileName = `${Date.now()}-recording.wav`;
        const totalChunks = Math.ceil(file.size / chunkSize);
        let chunkStart = 0;

        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(chunkStart, chunkStart + chunkSize);
            const reader = new FileReader();

            reader.onload = () => {
                newSocket.emit('file-upload', {
                    buffer: Array.from(new Uint8Array(reader.result)),
                    chunkIndex: i,
                    totalChunks: totalChunks,
                    fileName: uniqueFileName,
                });

                if (i === totalChunks - 1) {
                    newSocket.emit('sendMessage', {
                        fileName: 'uploads/' + uniqueFileName,
                        message: '',
                        receiver: phoneRec,
                        sender: phone,
                        senderName: name,
                        typeFile: file.type,
                        groupMessage,
                    });
                }
            };

            reader.readAsArrayBuffer(chunk);
            chunkStart += chunkSize;
        }

        setAudioChunks([]);
        setAudioURL(null);
    };

    useEffect(() => {
        handleChat()
    }, [phoneRec, user.chat, socket, name, uploadProgress])

    const [userImage, setUserImage] = useState()

    const handleUserID = async () => {
        try {
            const user = await api.get(getUserChatID, {
                params: {
                    userPhone: phoneRec
                }
            })
            setUserImage(user.data.data.userImage);
        } catch (error) {

        }
    }

    useEffect(() => {
        newSocket.on('updateImages', (data) => {
            setSocketData(data.userImage)
        })
    }, [])

    useEffect(() => {
        handleUserID()
    }, [phoneRec, socketData])

    useEffect(() => {
        const contact = user?.contact?.filter((e) => {
            if (e.contact === userChat?.phone) {
                return e
            }
        })
        contact?.map((e) => {
        })
    }, [userChat])

    const handleDelete = async (e) => {
        const { sender, receiver, unique } = selectChat;
        // O'sha ID bo'yicha ma'lumotlarni qayta ishlash lozim

        try {
            const user = await api.put(deleteChat, {
                sender, receiver, unique
            })

            const myData = user.data.data.filter((e) => {
                return e.phone === phone
            })

            dispatch(addUser(myData))
        } catch (error) {
            console.log(error);
        }
        newSocket.emit('deleteMessage', {
            deleting: true
        })
    }
    const [edit, setEdit] = useState(false)

    useEffect(() => {
        if (edit) {
            setMessage(selectChat?.message || '');
        } else {
            setMessage(''); // edit false bo'lganda tozalash
        }
    }, [edit, selectChat]);

    const handleEdit = () => {
        setEdit(true)

    }

    const handeEditMsg = async () => {
        const { sender, receiver, unique } = selectChat;
        selectChat.message = userRef.current.value
        const updateMessage = selectChat
        setEdit(false);
        setSelectChat(''); // chatni tozalash
        try {
            await api.put(editChat, {
                sender, receiver, unique, message: updateMessage
            })

        } catch (error) {
            console.log(error);
        }
        newSocket.emit('deleteMessage', {
            deleting: true
        })
    }

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Oyna o'lchami o'zgarganda chaqiriladigan funksiyani qo'shamiz
        window.addEventListener('resize', handleResize);

        // Komponent o'chirilganda hodisani olib tashlaymiz
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleClose = () => {
        setchatSelected(false)
    }

    const videoRef = useRef(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [videoModal, setVideoModal] = useState(false);
    const [recording, setRecording] = useState(false);
    const [videoURL, setVideoURL] = useState('');
    const streamRef = useRef(null); // Streamni saqlash uchun

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setVideoModal(true);

        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
            setVideoURL(URL.createObjectURL(e.data));
            setVideoChunks((prevChunks) => [...prevChunks, e.data]); // Yangi video qismni qo‘shish
        };

        recorder.onstop = () => {
            console.log("Recording stopped");

            // Full video yaratish uchun videoChunksni yangilash
            const fullVideo = new Blob(videoChunks, { type: 'video/mp4' });
            setVideoURL(URL.createObjectURL(fullVideo)); // Yangilangan URL
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }, 100);
    };

    const stopRecording = async () => {
        if (mediaRecorder) {
            mediaRecorder.stop();

            // Stream treklarini to‘xtatish
            setTimeout(() => {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            }, 100);
        }

        setRecording(false);
        setVideoModal(false);

        // Video qismlarini tozalash va to‘g‘ri URLni olish
        const fullVideo = new Blob(videoChunks, { type: 'video/mp4' });
        setVideoURL(URL.createObjectURL(fullVideo)); // Yangilangan video URL

        // Video qismlarini tozalash faqat yuborilgandan keyin
        setVideoChunks([]);
    };

    const uploadVideo = () => {
        if (!videoURL) return;

        const file = new Blob(videoChunks, { type: 'video/mp4' });
        const uniqueFileName = `${Date.now()}-recording.mp4`;
        const totalChunks = Math.ceil(file.size / chunkSize);
        let chunkStart = 0;

        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(chunkStart, chunkStart + chunkSize);
            const reader = new FileReader();

            reader.onload = () => {
                // Video bo'lagini serverga yuborish
                newSocket.emit('file-upload', {
                    buffer: Array.from(new Uint8Array(reader.result)),
                    chunkIndex: i,
                    totalChunks: totalChunks,
                    fileName: uniqueFileName,
                });

                // Agar oxirgi bo'lak bo'lsa, xabar yuborish
                if (i === totalChunks - 1) {
                    newSocket.emit('sendMessage', {
                        fileName: 'uploads/' + uniqueFileName,
                        message: '',
                        receiver: phoneRec,
                        sender: phone,
                        senderName: name,
                        typeFile: 'video/webm', // Video turi
                        groupMessage,
                    });
                }
            };

            reader.readAsArrayBuffer(chunk);
            chunkStart += chunkSize;
        }

        // Video bo'laklarini tozalash
        setVideoChunks([]);
        setVideoURL(null); // Video URLni tozalash
    };

    useEffect(() => {
        if (videoURL) {
            uploadVideo(); // Video yuborish
        }
    }, [videoURL])

    const [targetVideo, setTargetVideo] = useState()

    const handlePlayVideo = (e) => {

        if (targetVideo && targetVideo !== e.target) {
            targetVideo.pause();
        }

        if (e.target.paused) {
            e.target.play()
            setTargetVideo(e.target);
        }

        else {
            e.target.pause()
            setTargetVideo(null);
        }

        e.target.volume = 1
    }

    useEffect(() => {
        if (targetVideo) {
            targetVideo.pause()
        }
    }, [setTargetVideo])

    return (
        <>
            <div className='bg-slate-700 w-full h-[100vh]'>
                <div className={`w-full h-[100vh] flex flex-col items-center`}>
                    {chat ?
                        <>
                            <div className='bg-slate-800 w-full flex justify-start items-center'>
                                {windowWidth <= 576 &&
                                    <Button sx={{ height: '100%' }} onClick={handleClose}>
                                        <WestIcon />
                                    </Button>
                                }
                                <img className='cursor-pointer rounded-[100%] h-[70px] w-[80px] aspect-square ml-2 max-sm:w-[80px] max-lg:h-[70px] max-lg:w-[100px] max-sm:aspect-square max-lg:aspect-square' alt='userPhoto'
                                    src={getUser?.userImage?.length ? `${imageUrl + getUser?.userImage?.slice(-1)[0]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                    sizes='auto'
                                    onClick={handleOpen}
                                />
                                <Button onClick={handleOpen}>
                                    <p className='text-slate-50 text-xl leading-[10vh] ml-[1vw]'>
                                        {
                                            getUser?.name
                                        }
                                    </p>
                                </Button>
                            </div>
                            <div
                                className='h-[83vh] w-[50%] max-md:w-[90%] max-lg:w-[100%]'
                                style={{
                                    overflow: 'auto',
                                    scrollbarWidth: 'none',
                                    padding: '0 20px',
                                }}
                            >
                                {chatApi?.map((e) =>
                                    <div key={e._id} className={`flex flex-col ${e.sender === phone ? 'items-end' : "items-start"}`} onContextMenu={(event) => handleContextMenu(event, e)}>
                                        <div className={e.sender === phone ? 'w-[50%] max-md:w-[80%] flex items-end flex-col gap-2 pr-2' : "w-[50%] max-md:w-[80%] pl-2 gap-2 flex items-start flex-col"}
                                            style={{
                                                flex: '0 0 auto',
                                                marginTop: "10px",
                                            }}
                                        >
                                            {e.fileName && e.typeFile?.includes('image') ?
                                                <img className='w-full' style={{ borderTopRightRadius: "5px", borderTopLeftRadius: "20px" }} src={`${imageUrl + e.fileName}`}
                                                    alt={e.fileName} />
                                                : e.typeFile?.includes('video') ?
                                                    <>
                                                        {
                                                            e.typeFile?.includes('webm') ?
                                                                <Card sx={{ borderRadius: '100%' }}>
                                                                    <CardMedia
                                                                        component="video"
                                                                        src={`${imageUrl + e.fileName}`}
                                                                        typeof={e.typeFile}
                                                                        onClick={handlePlayVideo}
                                                                    />
                                                                </Card>
                                                                :
                                                                <Card >
                                                                    <CardMedia
                                                                        component="video"
                                                                        src={`${imageUrl + e.fileName}`}
                                                                        controls
                                                                        typeof={e.typeFile}
                                                                    />
                                                                </Card>
                                                        }
                                                    </>
                                                    : e.typeFile?.includes('audio') &&
                                                    <Card style={{ width: '80%' }}>
                                                        <CardMedia>
                                                            <audio controls style={{ width: '100%' }}>
                                                                <source src={`${imageUrl + e.fileName}?${new Date().getTime()}`} type="audio/wav" />
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        </CardMedia>
                                                    </Card>
                                            }
                                            <div className={e.sender === phone ? 'w-[50%] max-md:w-[80%] flex items-end flex-col gap-2 pr-2 myMessage' : "youMessage w-[50%] max-md:w-[80%] pl-2 gap-2 flex items-start flex-col"}>
                                                {e.message &&
                                                    <>
                                                        <ContextMenu target={e} menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuPosition={menuPosition} setMenuPosition={setMenuPosition} >
                                                            <li style={{ padding: '5px', color: "black" }}>
                                                                <Button onClick={() => handleDelete(e.message)}>Delete</Button>
                                                            </li>
                                                            {selectChat?.sender === phone &&
                                                                <li style={{ padding: '5px', color: "black" }}>
                                                                    <Button onClick={() => handleEdit(e.message)}>Edit</Button>
                                                                </li>
                                                            }
                                                        </ContextMenu>
                                                        <p className='p-2'>{e.message}</p>
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {uploadProgress !== 0 &&
                                    <div className='flex flex-col items-end' >
                                        <CircularProgressWithLabel value={uploadProgress} />
                                    </div>
                                }
                                <div ref={endOfMessagesRef} />
                            </div>
                        </>
                        : selectGroup &&
                        <>
                            <div className='bg-slate-800 h-[10vh] w-full flex justify-start items-center'>
                                {windowWidth <= 576 &&
                                    <Button sx={{ height: '100%' }} onClick={handleClose}>
                                        <WestIcon />
                                    </Button>
                                }
                                <img className='cursor-pointer rounded-[100%] h-[70px] w-[80px] aspect-square ml-2 max-sm:w-[80px] max-lg:h-[70px] max-lg:w-[100px] max-sm:aspect-square max-lg:aspect-square' alt='userPhoto'
                                    src={selectGroup?.groupImage?.length ? `${imageUrl + selectGroup?.groupImage?.slice(-1)[0]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                    sizes='auto'
                                    onClick={handleOpen}
                                />
                                <Button onClick={handleOpen}>
                                    <p className='text-slate-50 text-xl leading-[10vh] ml-[1vw] max-sm:text-lg max-md:text-xl'>
                                        {
                                            selectGroup?.name
                                        }
                                    </p>
                                </Button>
                            </div>
                            <div
                                className='h-[83vh] w-[70%] max-md:w-[100%] max-lg:w-[100%] max-sm:w-[100%]'
                                style={{
                                    overflow: 'auto',
                                    scrollbarWidth: 'none',
                                    padding: '0 20px',
                                }}
                            >
                                {selectGroup.chat?.map((e) =>
                                    <div key={e._id} className={`flex flex-col ${e.sender === phone ? 'items-end' : "items-start"}`} onContextMenu={(event) => handleContextMenu(event, e)}>
                                        <div className={e.sender === phone ? 'w-[50%] max-md:w-[80%] flex items-end flex-col gap-2 pr-2' : "w-[50%] max-md:w-[80%] pl-2 gap-2 flex items-start flex-col"}
                                            style={{
                                                flex: '0 0 auto',
                                                marginTop: "10px",
                                            }}
                                        >
                                            {e.fileName && e.typeFile?.includes('image') ?
                                                <img className='w-full' style={{ borderTopRightRadius: "5px", borderTopLeftRadius: "20px" }} src={`${imageUrl + e.fileName}`}
                                                    alt={e.fileName} />
                                                : e.typeFile?.includes('video') ?
                                                    <>
                                                        {
                                                            e.typeFile?.includes('webm') ?
                                                                <Card sx={{ borderRadius: '100%' }}>
                                                                    <CardMedia
                                                                        component="video"
                                                                        src={`${imageUrl + e.fileName}`}
                                                                        typeof={e.typeFile}
                                                                        onClick={handlePlayVideo}
                                                                    />
                                                                </Card>
                                                                :
                                                                <Card >
                                                                    <CardMedia
                                                                        component="video"
                                                                        src={`${imageUrl + e.fileName}`}
                                                                        controls
                                                                        typeof={e.typeFile}
                                                                    />
                                                                </Card>
                                                        }
                                                    </>
                                                    : e.typeFile?.includes('audio') &&
                                                    <Card style={{ width: '80%' }}>
                                                        <CardMedia>
                                                            <audio controls style={{ width: '100%' }}>
                                                                <source src={`${imageUrl + e.fileName}?${new Date().getTime()}`} type="audio/wav" />
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        </CardMedia>
                                                    </Card>
                                            }
                                            <div className={e.sender === phone ? 'w-[100%] max-md:w-[100%] max-sm:w-[100%] flex items-end flex-col gap-2 pr-2 myMessage' : "youMessage w-[100%] max-md:w-[80%] pl-2 gap-2 flex items-start flex-col"}>
                                                {e.message &&
                                                    <>
                                                        <ContextMenu target={e} menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuPosition={menuPosition} setMenuPosition={setMenuPosition} >
                                                            <li style={{ padding: '5px', color: "black" }}>
                                                                <Button onClick={() => handleDelete(e.message)}>Delete</Button>
                                                            </li>
                                                            {selectChat?.sender === phone &&
                                                                <li style={{ padding: '5px', color: "black" }}>
                                                                    <Button onClick={() => handleEdit(e.message)}>Edit</Button>
                                                                </li>
                                                            }
                                                        </ContextMenu>
                                                        <Typography>{e.senderName}</Typography>
                                                        <p className='p-2'>{e.message}</p>
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {uploadProgress !== 0 &&
                                    <div className='flex flex-col items-end' >
                                        <CircularProgressWithLabel value={uploadProgress} />
                                    </div>
                                }
                                <div ref={endOfMessagesRef} />
                            </div>
                        </>
                    }
                    <User setchatSelected={setchatSelected} setSelectGroup={setSelectGroup} open={userInfoModal} setOpen={setUserInfoModal} userInfo={getUser} selectGroup={selectGroup} />
                    <SelectImages groupMessage={groupMessage} scrollToBottom={scrollToBottom} setSocket={setSocket} setUploadProgress={setUploadProgress} fileInputRef={fileInputRef} name={name} phone={phone} phoneRec={phoneRec} modal={open} setModal={setOpen} />
                    {edit &&
                        <div className='bg-neutral-700 w-[50%] flex justify-between'>
                            <p className='pl-2'>Edit</p>
                            <button className='pr-2' onClick={() => { setEdit(false); setSelectChat('') }}>
                                <CancelOutlinedIcon sx={{ color: "white" }} />
                            </button>
                        </div>
                    }
                    <div className='w-[50%] flex gap-2 max-md:w-[90%] max-lg:w-[90%] relative'>
                        {edit ? (
                            <TextareaAutosize
                                placeholder="Message"
                                ref={userRef}
                                minRows={1}
                                maxRows={1}
                                style={{
                                    resize: 'none',
                                    overflow: 'hidden',
                                    width: '100%',
                                    border: '1px solid #ccc',
                                    padding: 4,
                                    borderRadius: '4px',
                                    boxSizing: 'border-box',
                                    scrollbarWidth: "none",
                                    outline: "none",
                                }}
                                required={true}
                                value={message} // value ishlatilmoqda
                                onChange={(e) => setMessage(e.target.value)} // onChange hodisasi
                            />
                        ) : (
                            <>
                                {!audioURL ?
                                    <>
                                        <TextareaAutosize
                                            placeholder="Message"
                                            ref={userRef}
                                            minRows={1}
                                            maxRows={1}
                                            required={true}
                                            style={{
                                                resize: 'none',
                                                overflow: 'hidden',
                                                width: '100%',
                                                border: '1px solid #ccc',
                                                padding: 4,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                scrollbarWidth: "none",
                                                outline: "none",
                                            }}
                                            value={message} // edit false bo'lganda ham message ni boshqaradi
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                        {!userRef?.current?.value &&
                                            <>
                                                <button className='justify-center items-center flex' onClick={isRecording ? handleStopRecording : handleStartRecording}>
                                                    {isRecording ? <StopCircleIcon /> : <KeyboardVoiceIcon />}
                                                </button>
                                            </>
                                        }
                                    </> :
                                    <>
                                        <Button onClick={handleClearAudio} variant='contained' sx={{ borderRadius: '20%' }}>
                                            <DeleteIcon />
                                        </Button>
                                        <audio ref={audioRef} controls src={audioURL} />
                                    </>
                                }
                                {
                                    <>
                                        {!userRef?.current?.value &&
                                            <>
                                                <button
                                                    style={{
                                                        borderRadius: "50%",
                                                        padding: "8px",
                                                        border: "none",
                                                        cursor: "pointer",
                                                    }}
                                                    className='justify-center items-center flex z-10'
                                                    onClick={recording ? stopRecording : startRecording}
                                                >
                                                    {recording ? <StopCircleIcon /> : <VideocamIcon />}
                                                </button>
                                            </>
                                        }
                                        <div>
                                            <Modal
                                                open={videoModal}
                                                sx={{ zIndex: 0 }}
                                                aria-labelledby="modal-modal-title"
                                                aria-describedby="modal-modal-description"
                                            >
                                                <Box sx={{ ...style, borderRadius: "100%", overflow: "hidden" }}>
                                                    <video ref={videoRef} autoPlay style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: '100%' }} muted />
                                                </Box>
                                            </Modal>
                                        </div>
                                    </>
                                }
                            </>

                        )}
                        {audioURL ?
                            <>
                                <button onClick={edit ? handeEditMsg : handleMsg}>
                                    <SendIcon className='h-[7vh] text-cyan-600' fontSize='large' />
                                </button>
                            </> :
                            <>
                                {!userRef?.current?.value &&
                                    <Button
                                        component="label"
                                    >
                                        <FileUploadIcon sx={{ fontSize: "30px" }} />
                                        <VisuallyHiddenInput
                                            type="file"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                }
                                {userRef?.current?.value &&
                                    <button onClick={edit ? handeEditMsg : handleMsg}>
                                        <SendIcon className='h-[7vh] text-cyan-600' fontSize='large' />
                                    </button>
                                }
                            </>
                        }
                    </div>
                </div>
            </div >
        </>
    )
}

export default Chat