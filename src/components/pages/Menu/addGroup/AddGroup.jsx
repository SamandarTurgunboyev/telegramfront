import { Box, Button, List, Modal, styled } from '@mui/material'
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import React, { useState } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSelector } from 'react-redux';
import { api } from '../../../../api';
import { CreateGroup } from '../../../../api/url';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'rgb(15 23 42)',
    pt: 2,
    px: 4,
    pb: 3,
    overflow: 'scroll',
    scrollbarWidth: "none",
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

function AddGroup() {
    const [name, setName] = useState('')
    const [groupImage, setGroupImage] = useState('')
    const [open, setOpen] = useState(false);
    const phone = useSelector(state => state.user.user.phone)

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const addNewGroup = async () => {
        const formData = new FormData();
        formData.append('groupImage', groupImage); // Fayl
        formData.append('name', name);
        formData.append('phone', phone);

        try {
            await api.post(CreateGroup, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            setOpen(false);
            window.location.reload()
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="ml-4">
            <div className="w-full text-center">
                <GroupAddIcon sx={{ fontSize: "30px" }} />
                <Button className="w-[90%]" onClick={handleOpen}>Add Group</Button>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            >
                <Box sx={{ ...style, width: { xs: 330, sm: 500 }, display: 'flex', flexDirection: 'column', gap: "20px" }}>
                    <input
                        type="text"
                        className={
                            'bg-inherit border-b-2 border-sky-900 text-slate-100 h-[6vh] p-2 outline-0'
                        }
                        placeholder='Group Name'
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        onChange={(event) => setGroupImage(event.target.files[0])}
                    >
                        Group Image
                        <VisuallyHiddenInput
                            type="file"
                            multiple
                        />
                    </Button>
                    <Button sx={{ color: 'white', bgcolor: "blue" }} onClick={addNewGroup}>Add Group</Button>
                </Box>
            </Modal>
        </div>

    )
}

export default AddGroup