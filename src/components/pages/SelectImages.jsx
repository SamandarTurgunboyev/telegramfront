import { Box, Modal, Button, TextareaAutosize, Typography, CircularProgress, Card, CardMedia } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import newSocket from '../../socket';
import PropTypes from 'prop-types';
import '../../../node_modules/video-react/dist/video-react.css'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'rgb(15 23 42)',
    border: '1px solid #000',
    boxShadow: 24,
    p: 4,
};

function CircularProgressWithLabel(props) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color: 'text.secondary' }}
                >
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}

CircularProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
};

function SelectImages({ name, fileInputRef, phone, modal, setModal, phoneRec, scrollToBottom, groupMessage }) {
    const textRef = useRef()
    const [img, setImg] = useState()
    const chunkSize = 70 * 1024; // 70KB chunk size

    useEffect(() => {
        if (fileInputRef.current && fileInputRef.current.files.length > 0) {
            const file = fileInputRef.current.files[0];
            const fileUrl = URL.createObjectURL(file);
            setImg(fileUrl);

            // To'g'ri tozalash
            return () => {
                URL.revokeObjectURL(fileUrl); // Memory leak oldini olish uchun
            };
        }
    }, []);
    const handleClose = () => {
        setModal(false);
        fileInputRef.current.value = ''
    }

    const handleMsg = () => {
        scrollToBottom()
        const file = fileInputRef.current.files[0];
        if (!file) return;

        const uniqueFileName = `${Date.now()}-${file.name}`;
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
            };
            setModal(false);
            fileInputRef.current.value = ''
            reader.readAsArrayBuffer(chunk);
            chunkStart += chunkSize;
        }
        newSocket.emit('sendMessage',
            {
                fileName: 'uploads/' + uniqueFileName,
                message: textRef.current.value,
                receiver: phoneRec,
                sender: phone,
                senderName: name,
                typeFile: file?.type,
                groupMessage
            }
        );
    };

    return (
        <div>
            <Modal
                open={modal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{ ...style, display: "flex", alignItems: "center", flexDirection: "column", gap: "30px" }}>
                    <div>
                        {fileInputRef.current?.files[0]?.type.includes('image') ?
                            <img className='border border-sky-500' src={img} alt="newImage" style={{ width: 'auto', height: "50vh" }} />
                            :

                            fileInputRef.current?.files[0]?.type.includes('video') ?
                                <video controls>
                                    <source src={img} />
                                </video>
                                : fileInputRef.current?.files[0]?.type.includes('audio') &&
                                <Card sx={{ maxWidth: 345 }}>
                                    <CardMedia>
                                        <audio controls>
                                            <source src={img} />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </CardMedia>
                                </Card>
                        }
                    </div>
                    <div className='w-full'>
                        <TextareaAutosize
                            placeholder="Message"
                            ref={textRef}
                            minRows={1}
                            maxRows={1}
                            style={{
                                resize: 'none',
                                overflow: 'hidden',
                                width: '100%',
                                border: '1px solid #ccc',
                                padding: '10px',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                                scrollbarWidth: "none",
                                outline: "none"
                            }}
                        />
                    </div>
                    <div className='flex gap-[10px]'>
                        <Button variant='contained' onClick={handleClose}>Canel</Button>
                        <Button variant='contained' onClick={handleMsg}>Send</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default SelectImages