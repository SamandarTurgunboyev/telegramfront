import { Box, Button, Modal } from '@mui/material';
import React, { useRef, useState } from 'react'
import { api } from '../../../../api';
import { editName } from '../../../../api/url';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../../../../store/userSlice';
import newSocket from '../../../../socket';

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

function EditName() {
    const { token } = useSelector(state => state.user)

    const [open, setOpen] = useState(false);
    const nameRef = useRef()
    const { name } = useSelector(state => state.user.user)
    const { phone } = useSelector(state => state.user.user)
    const dispatch = useDispatch()

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    }

    const nameEdit = async () => {
        try {
            const user = await api.put(editName,
                {
                    phone,
                    name: nameRef.current.value
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            dispatch(addUser(user.data.data))
        } catch (error) {
        }
        newSocket.emit('updateUser', ({
            name: nameRef.current.value,
            phone
        }))
    }

    return (
        <>
            <Button onClick={handleOpen} sx={{ textAlign: 'center', width: '100%' }}>Edit Name</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, width: { xs: 330, sm: 500 }, display: 'flex', flexDirection: 'column', gap: "20px" }}>
                    <input
                        type="text"
                        className={
                            'bg-inherit border-b-2 border-sky-900 text-slate-100 h-[6vh] p-2 outline-0'
                        }
                        defaultValue={name}
                        ref={nameRef}
                    />
                    <Button sx={{ color: 'white', bgcolor: "blue" }} onClick={nameEdit}>Edit</Button>
                </Box>
            </Modal>
        </>
    );
}

export default EditName