import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Box, Button, Modal, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EditName from './EditName';
import NewImage from './NewImage';
import { getUserChatID, imageUrl } from '../../../../api/url';
import newSocket from '../../../../socket';
import { api } from '../../../../api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'rgb(15 23 42)',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

function SettingContact() {
    const [open, setOpen] = React.useState(false);
    const { name, phone, userImage } = useSelector((state => state.user.user))
    // const [userImage, setUserImage] = useState()

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div className='ml-4'>
            <div className="w-full text-center">
                <SettingsIcon sx={{ fontSize: "30px" }} />
                <Button className="w-[90%]" onClick={handleOpen}>Settings</Button>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{ ...style, display: 'flex', flexDirection: 'column', gap: '20px', width: { xs: 300, sm: 400 } }}>
                    <div className='flex gap-[30px] max-sm:flex-col justify-center items-center'>
                        <div>
                            <img className='rounded-[100%] h-[100px] w-[100px] ml-[10px] mt-auto' alt='userPhoto'
                                src={userImage?.length ? `${imageUrl + userImage?.slice(-1)[0]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                sizes='auto'
                            />
                        </div>
                        <div className='text-slate-100 flex flex-col gap-[20px] text-xl'>
                            <p>{name}</p>
                            <p>{phone}</p>
                        </div>
                    </div>
                    <div className='flex flex-col w-[100%] gap-[10px]'>
                        <EditName />
                        <NewImage />
                    </div>
                </Box>
            </Modal>
        </div >
    )
}

export default SettingContact