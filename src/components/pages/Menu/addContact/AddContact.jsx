import { Avatar, Box, Button, Divider, List, ListItem, ListItemAvatar, ListItemText, Modal } from "@mui/material";
import { useState } from "react";
import ChildModal from "./ChildModal";
import { useSelector } from "react-redux";
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import { imageUrl } from "../../../../api/url";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 300, sm: 400 },
    bgcolor: 'rgb(15 23 42)',
    pt: 2,
    px: 4,
    pb: 3,
    overflow: 'scroll',
    scrollbarWidth: "none",
};

function AddContact({ setPhone, scrollToBottom, setUserName }) {
    const { user } = useSelector(state => state.user)

    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleUser = (e) => {
        setOpen(false);
        scrollToBottom()
        setPhone(e.contact || e.sender)

        setUserName(e.name)
    }

    return (
        <div className="ml-4">
            <div className="w-full text-center">
                <PermContactCalendarIcon sx={{ fontSize: "30px" }} />
                <Button className="w-[90%]" onClick={handleOpen}>Contact</Button>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            >
                <Box sx={{ ...style }}>
                    <List sx={{ width: '100%', height: "60vh", maxWidth: 360, overflow: 'scroll', scrollbarWidth: "none" }}>
                        {user?.contact?.length > 0 ?
                            <>
                                {user?.contact?.filter(
                                    (e) => (
                                        user.phone !== e.phone

                                    )
                                ).map(e => (
                                    <div key={e._id}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar alt="Remy Sharp" src={e.userImage?.length ? `${imageUrl + e.userImage.slice(-1)[0]}` : 'https://encrypteds-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'} />
                                            </ListItemAvatar>
                                            <Button sx={{ width: "100vw" }} onClick={() => handleUser(e)}>
                                                <ListItemText
                                                    primary={e.name}
                                                />
                                            </Button>
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </div>
                                ))}
                            </>
                            :
                            <h1 className="text-3xl text-center m-auto text-slate-100">No Contact</h1>
                        }
                    </List>
                    <ChildModal />
                </Box>
            </Modal>
        </div>
    )
}

export default AddContact