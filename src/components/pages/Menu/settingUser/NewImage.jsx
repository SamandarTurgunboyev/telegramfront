import { Box, Button, Modal, styled } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { editImage, imageUrl } from "../../../../api/url";
import newSocket from "../../../../socket";
import { api } from "../../../../api";
import { addUser } from "../../../../store/userSlice";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'rgb(15 23 42)',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

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

function NewImage() {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0)

    const [selectedFile, setSelectedFile] = useState(null);
    const [file, setFile] = useState()
    const { phone } = useSelector(state => state.user.user)

    const { userImage } = useSelector(state => state.user.user)
    const chunkSize = 70 * 1024; // 70KB chunk size

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    }

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        const file = event.target.files[0];
        const fileUrl = URL.createObjectURL(file);
        setFile(fileUrl)
    };


    const handleSubmit = async (event) => {
        event.preventDefault()
        const file = selectedFile
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
            reader.readAsArrayBuffer(chunk);
            chunkStart += chunkSize;
        }
        newSocket.emit('updateImage', {
            phone, photo: 'uploads/' + uniqueFileName,
        })
    };
    return (
        <>
            <Button onClick={handleOpen} sx={{ textAlign: 'center', width: '100%' }}>New Image</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, width: { xs: 330, sm: 500 }, display: 'flex', flexDirection: 'column', gap: "20px", alignItems: 'center' }}>
                    <div className="flex justify-between w-[100%]">
                        {!(userImage?.length - 1) === index || index === 0 ?
                            <Button variant="text" disabled>
                                <ArrowBackIosNewIcon />
                            </Button>
                            :
                            <Button onClick={() => setIndex(state => state - 1)} variant="text">
                                <ArrowBackIosNewIcon />
                            </Button>
                        }
                        {selectedFile ?
                            <img className='border border-sky-500 rounded-[100%] h-[50%] w-[50%]' src={file} alt="newImage" />
                            :
                            <img className='border border-sky-500 rounded-[100%] h-[50%] w-[50%]' alt='userPhoto'
                                src={userImage?.length ? `${imageUrl + userImage[index]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                sizes='auto'
                            />

                        }
                        {(userImage?.length - 1) === index || (userImage?.length === 0) ?
                            <Button onClick={() => setIndex(state => state + 1)} variant="text" disabled>
                                <ArrowForwardIosIcon />
                            </Button>
                            :
                            <Button onClick={() => setIndex(state => state + 1)} variant="text">
                                <ArrowForwardIosIcon />
                            </Button>
                        }
                    </div>
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                        >
                            Select Image
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                            />
                        </Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </form>
                </Box>
            </Modal>
        </>
    );
}

export default NewImage