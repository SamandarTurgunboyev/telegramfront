import { Box, Button, Modal } from "@mui/material";
import { useState } from "react";
import { api } from "../../../../api";
import { addContact } from "../../../../api/url";
import { useSelector } from "react-redux";

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

function ChildModal() {
    const [name, setName] = useState('')
    const [contact, setContact] = useState('')
    const [open, setOpen] = useState(false);
    const phone = useSelector(state => state.user.user.phone)
    // const { user } = useSelector(state => state.user)

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    }

    const addNewContact = async () => {
        try {
            await api.post(addContact, {
                phone, name, contact
            })
            setOpen(false);
            window.location.reload()
        } catch (error) {

        }
    };

    return (
        <>
            <Button onClick={handleOpen} sx={{ textAlign: 'center', width: '100%' }}>Add Contact</Button>
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
                        placeholder='Name'
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        className={
                            'bg-inherit border-b-2 border-sky-900 text-slate-100 h-[6vh] p-2 outline-0'
                        }
                        placeholder='Phone number'
                        onChange={(e) => setContact(e.target.value)}
                    />
                    <Button onClick={addNewContact} sx={{ color: 'white', bgcolor: "blue" }}>Add User</Button>
                </Box>
            </Modal>
        </>
    );
}

export default ChildModal
