import { Box, Modal, Button, Card, CardMedia, Typography, Menu, MenuItem, TextField, CardContent, CardActions } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { addContact, deleteContact, getAllGroupUsers, imageUrl } from '../../api/url';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useDispatch, useSelector } from 'react-redux';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { api } from '../../api';
import { addUser } from '../../store/userSlice';
import AddIcon from '@mui/icons-material/Add';
import newSocket from '../../socket';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import '../../App.css'
import { styled } from '@mui/material/styles';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';

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
    bgcolor: 'rgb(15 23 42)',
    boxShadow: 24,
    p: 4,
    height: 450,
    overflow: "scroll",
    scrollbarWidth: 'none'
};

function ChildModal({ setSelectGroup, open, setOpen, userInfo, phone, selectGroup }) {
    const [name, setName] = useState(userInfo?.name)
    const [contact, setContact] = useState(userInfo?.phone)
    const handleClose = () => {
        setOpen(false);
    };

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
        <React.Fragment>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, height: 200, display: 'flex', flexDirection: "column", gap: "20px" }}>
                    <input
                        type="text"
                        className={
                            'bg-inherit border-b-2 border-sky-900 text-slate-100 h-[6vh] p-2 outline-0'
                        }
                        placeholder='Name'
                        onChange={(e) => setName(e.target.value)}
                        defaultValue={name}
                    />
                    <input
                        type="text"
                        className={
                            'bg-inherit border-b-2 border-sky-900 text-slate-100 h-[6vh] p-2 outline-0'
                        }
                        placeholder='Phone number'
                        defaultValue={contact}
                        disabled
                    />
                    <Button sx={{ color: 'white', bgcolor: "blue" }} onClick={addNewContact}>Add User</Button>
                </Box>
            </Modal>
        </React.Fragment>
    );
}

function User({ setchatSelected, setSelectGroup, open, setOpen, userInfo, selectGroup }) {
    const handleClose = () => setOpen(false);
    const [index, setIndex] = useState(0)
    const reversedMassiv = userInfo?.userImage?.slice().reverse();
    const groupImage = selectGroup?.groupImage?.slice().reverse();
    const [media, setMedia] = useState([])
    const [userPhone, setUserPhone] = useState([])
    const { chat, contact, phone, _id } = useSelector((state) => state.user.user)
    const user = useSelector((state) => state.user.user)
    const [type, setType] = useState('')
    const dispatch = useDispatch()
    const [openChild, setOpenChild] = React.useState(false);
    const handleOpenChild = () => {
        setOpenChild(true);
    }

    const [opens, setOpens] = React.useState(false);
    const handleOpens = () => setOpens(true);
    const handleCloses = () => setOpens(false);

    useEffect(() => {
        if (selectGroup) {
            setType('Users')
        }
        else {
            setType('')
        }
    }, [selectGroup])

    const [updateGroup, setUpdateGroup] = useState(null);
    const [leaveGroups, setLeaveGroup] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const handleAddUsersGroup = data => setUpdateGroup(data.data);
        const handleLeaveUsersGroup = data => setUpdateGroup(data.data);

        newSocket.on('leaveUsersGroup', handleLeaveUsersGroup);
        newSocket.on('addUsersGroup', handleAddUsersGroup);

        return () => {
            newSocket.off('addUsersGroup', handleAddUsersGroup);
            newSocket.off('leaveUsersGroup', handleLeaveUsersGroup);
        };
    }, []);

    const getMedia = async () => {
        if (selectGroup) {
            const sorted = selectGroup?.chat?.filter((e) => {
                if (e.fileName !== "" && !e.typeFile.includes('audio')) {
                    return e.typeFile.includes(type)
                }

                if (type === 'audio') {
                    return e.typeFile.includes(type)
                }
            })
            setMedia(sorted)
        }
        else {
            const sorted = chat?.filter((e) => {
                if (e.sender === userInfo?.phone || e.receiver === userInfo?.phone) {
                    if (e.fileName !== "" && !e.typeFile.includes('audio')) {
                        return e.typeFile.includes(type)
                    }
                    if (type === 'audio') {
                        return e.typeFile.includes(type)
                    }
                }
            })
            setMedia(sorted)
        }
        if (type === 'Users') {
            try {
                const data = await api.get(`${getAllGroupUsers}?groupName=${selectGroup?.name}`)
                console.log(data.data.data.groupUsers, 'all Users');
                setMedia(data.data.data.groupUsers)
            } catch (error) {
                console.log(error);
            }
        }
    }

    useEffect(() => {
        getMedia()
    }, [type, userInfo?.phone, updateGroup, isConnected])

    useEffect(() => {
        const user = contact?.filter((e) => {
            return e.contact === userInfo?.phone
        })

        setUserPhone(user)

    }, [userInfo?.phone, contact])


    const deleteUser = async () => {
        try {
            const user = await api.put(deleteContact, {
                phone,
                contact: userInfo.phone
            })
            dispatch(addUser(user.data.data))
        } catch (error) {

        }
    }

    const [selectUsers, setSelectUsers] = useState([])

    const selectUser = (e) => {
        if (!selectUsers.some(user => user.phone === e.contact)) {
            setSelectUsers(state => [...state, { name: e.name, phone: e.contact }]);
        }
    }

    const deleteUsers = (e) => {
        const deleteUser = selectUsers.filter(user => user.phone !== e.phone)
        setSelectUsers(deleteUser);
    }

    useEffect(() => {
        const handleLeaveUsersGroup = (data) => {
            setUpdateGroup(data.data);
        }

        newSocket.on('leaveUsersGroup', handleLeaveUsersGroup);

        return () => {
            newSocket.off('leaveUsersGroup', handleLeaveUsersGroup);
        };
    }, []);

    console.log(selectUsers, 'users');

    const AddUsersGroup = () => {
        selectUsers.forEach((e) => {
            newSocket.emit('groupAddUser', ({ phone: e.phone, groupName: selectGroup.name }))
        })
        setOpen(false)
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const openMenu = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const AddAdminGroup = () => {
        selectUsers.forEach((e) => {
            newSocket.emit('groupAddAdmin', ({ phone: e.phone, groupName: selectGroup.name }))
        })
        setOpen(false)
    }

    const [editGroup, setEditGroup] = useState(false)
    const [addUsersGroup, setAddUsersGroup] = useState(false)

    const [groupImageEdit, setGroupImageEdit] = useState('')
    const [groupNameEdit, setGroupNameEdit] = useState('')

    const handleCloseEditGroup = (event) => {
        // Agar modal tashqarisiga bosilgan bo'lsa, modalni yopamiz
        if (event.target === event.currentTarget) {
            setEditGroup(false);
            setGroupNameEdit('')
            setGroupImageEdit('')
        }
    }

    const handleOpenEditGroup = () => setEditGroup(true)

    const handleCloseAddUsersGroup = () => setAddUsersGroup(false)

    const handleOpenAddUserGroup = () => setAddUsersGroup(true)

    const editGroupButton = async (event) => {
        event.preventDefault();

        // Fayl yuklash
        const formData = new FormData();
        formData.append('groupImage', groupImageEdit?.target?.files[0]);

        try {
            const response = await axios.post('http://localhost:4000/upload', formData);
            if (response.data.success) {
                // Guruhni tahrirlash uchun socket yuborish
                newSocket.emit('groupEdit', {
                    groupName: selectGroup.name,
                    name: groupNameEdit,
                    image: response.data.file.filename, // Yuklangan fayl nomi
                });
            } else {
                console.error('Fayl yuklashda xato:', response.data.error);
            }
        } catch (error) {
            console.error('Xatolik:', error);
        }
    }

    const leaveGroup = () => {
        window.location.reload()
        newSocket.emit('groupLeaveUser', ({ phone: phone, groupName: selectGroup.name }))
    }

    const deleteGroup = () => {
        window.location.reload()
        newSocket.emit('deleteGroup', ({ phone: phone, groupName: selectGroup.name }))
    }

    const [groupUsers, setGroopUsers] = useState([])

    const getAllGroupUser = async () => {
        try {
            const res = await api.get(`${getAllGroupUsers}?groupName=${selectGroup.name}`)
            console.log(res.data.data.groupUsers, 'res users');
            setGroopUsers(res.data.data.groupUsers)
        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        getAllGroupUser()
    }, [selectGroup])
    console.log(selectGroup, 'selecr groups');


    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{ ...style, gap: '10px', display: 'flex', flexDirection: "column" }}>
                <div className='w-full flex justify-end items-center'>
                    <Button
                        id="demo-positioned-button"
                        aria-controls={openMenu ? 'demo-positioned-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        <MoreVertIcon />
                    </Button>
                    <Menu
                        id="demo-positioned-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleCloseMenu}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        {userInfo &&
                            <>
                                {userPhone?.length ?
                                    <MenuItem onClick={deleteUser}>Delete Contact</MenuItem>
                                    :
                                    <MenuItem
                                        onClick={handleOpenChild}>Save Contact</MenuItem>
                                }
                            </>
                        }
                        {selectGroup?.groupAdmin?.includes(_id) &&
                            <>
                                <MenuItem variant='contained' onClick={handleOpenAddUserGroup}>
                                    Add Users
                                </MenuItem>
                                <Modal
                                    open={addUsersGroup}
                                    onClose={handleCloseAddUsersGroup}
                                    aria-labelledby="modal-modal-title"
                                    aria-describedby="modal-modal-description"
                                >
                                    <Box sx={{ ...style, gap: '20px', display: 'flex', flexDirection: 'column', justifyContent: "space-between" }}>
                                        <div className='w-ful'>
                                            {selectUsers.length > 0 &&
                                                <div className='w-full bg-slate-600 text-white p-2 grid grid-cols-3 gap-1'>
                                                    {selectUsers?.map((e) => (
                                                        <div className='bg-blue-500 flex justify-start items-center gap-2 pl-'>
                                                            <button onClick={() => deleteUsers(e)}>
                                                                <HighlightOffIcon />
                                                            </button>
                                                            {e?.name?.toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                            }
                                            {contact.map((e) => (
                                                <Button onClick={() => selectUser(e)} variant='contained' sx={{ width: "100%", marginTop: "10px" }}>{e.name}</Button>
                                            ))}
                                        </div>
                                        <div className='w-full flex justify-center items-center'>
                                            <Button onClick={AddUsersGroup} variant='contained'>Add</Button>
                                        </div>
                                    </Box>
                                </Modal>
                                <MenuItem variant='contained' onClick={handleOpens}>
                                    Add Admin
                                </MenuItem>
                                <Modal
                                    open={opens}
                                    onClose={handleCloses}
                                    aria-labelledby="modal-modal-title"
                                    aria-describedby="modal-modal-description"
                                >
                                    <Box sx={{ ...style, gap: '20px', display: 'flex', flexDirection: 'column', justifyContent: "space-between" }}>
                                        <div className='w-ful'>
                                            {selectUsers.length > 0 &&
                                                <div className='w-full bg-slate-600 text-white p-2 grid grid-cols-3 gap-1'>
                                                    {selectUsers?.map((e) => (
                                                        <div className='bg-blue-500 flex justify-start items-center gap-2 pl-'>
                                                            <button onClick={() => deleteUsers(e)}>
                                                                <HighlightOffIcon />
                                                            </button>
                                                            {e?.name?.toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                            }
                                            {groupUsers.map((e) => (
                                                <Button onClick={() => selectUser(e)} variant='contained' sx={{ width: "100%", marginTop: "10px" }}>{e.name}</Button>
                                            ))}
                                        </div>
                                        <div className='w-full flex justify-center items-center'>
                                            <Button onClick={AddUsersGroup} variant='contained'>Add</Button>
                                        </div>
                                    </Box>
                                </Modal>
                                <MenuItem variant='contained' onClick={handleOpenEditGroup}>
                                    Edit Group
                                </MenuItem>
                                <MenuItem onClick={deleteGroup}>Delete group</MenuItem>
                            </>
                        }
                        {selectGroup &&
                            <MenuItem onClick={leaveGroup}>Leave group</MenuItem>
                        }
                    </Menu>
                </div>
                <Modal
                    open={editGroup}
                    onClose={handleCloseEditGroup}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                >
                    <Card
                        sx={{
                            ...style,
                            display: 'flex',
                            maxWidth: 345,
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div class="avatar-preview flex w-full">
                            {
                                !(selectGroup?.groupImage?.length - 1) === index || index === 0 ?
                                    <Button variant="text" disabled>
                                        <ArrowBackIosNewIcon />
                                    </Button>
                                    :
                                    <Button onClick={() => setIndex(state => state - 1)} variant="text">
                                        <ArrowBackIosNewIcon />
                                    </Button>
                            }
                            <img className='mt-auto' alt='userPhoto'
                                src={selectGroup?.groupImage?.length ? `${imageUrl + groupImage[index]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                sizes='auto'
                            />
                            {(selectGroup?.groupImage?.length - 1) === index || (selectGroup?.groupImage?.length === 0) ?
                                <Button onClick={() => setIndex(state => state + 1)} variant="text" disabled>
                                    <ArrowForwardIosIcon />
                                </Button>
                                :
                                <Button onClick={() => setIndex(state => state + 1)} variant="text">
                                    <ArrowForwardIosIcon />
                                </Button>
                            }
                        </div>
                        <CardContent sx={{ display: 'flex', flexDirection: "column", gap: "20px" }}>
                            <TextField
                                id="outlined-basic"
                                label="New Name"
                                variant="outlined"
                                defaultValue={selectGroup?.name}
                                onChange={(e) => setGroupNameEdit(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: "white",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "blue",
                                            borderWidth: "2px",
                                        },
                                        "&.Mui-focused": {
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "blue",
                                                borderWidth: "3px",
                                            },
                                        },
                                        "&:hover:not(.Mui-focused)": {
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#ccc",
                                            },
                                        },
                                    },
                                    "& .MuiInputLabel-outlined": {
                                        color: "white",
                                        "&.Mui-focused": {
                                            color: "white",
                                            fontWeight: "bold",
                                        },
                                    },
                                }}
                            />
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<ImageIcon />}
                                onChange={(e) => setGroupImageEdit(e)}

                            >
                                New Image
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={(event) => console.log(event.target.files)}
                                    multiple
                                    accept="image/*"
                                />
                            </Button>
                        </CardContent>
                        <CardActions sx={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <Button size="small" variant='contained' onClick={editGroupButton}>Edit</Button>
                            <Button size="small" variant='contained' onClick={handleCloseEditGroup}>Close</Button>
                        </CardActions>
                    </Card>
                </Modal>
                <div className="flex w-[100%]">
                    {userInfo ?
                        <>
                            {

                                !(userInfo?.userImage?.length - 1) === index || index === 0 ?
                                    <Button variant="text" disabled>
                                        <ArrowBackIosNewIcon />
                                    </Button>
                                    :
                                    <Button onClick={() => setIndex(state => state - 1)} variant="text">
                                        <ArrowBackIosNewIcon />
                                    </Button>
                            }
                            <img className='mt-auto' alt='userPhoto'
                                src={userInfo?.userImage?.length ? `${imageUrl + reversedMassiv[index]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                sizes='auto'
                            />
                            {(userInfo?.userImage?.length - 1) === index || (userInfo?.userImage?.length === 0) ?
                                <Button onClick={() => setIndex(state => state + 1)} variant="text" disabled>
                                    <ArrowForwardIosIcon />
                                </Button>
                                :
                                <Button onClick={() => setIndex(state => state + 1)} variant="text">
                                    <ArrowForwardIosIcon />
                                </Button>
                            }
                        </>
                        : selectGroup &&
                        <>
                            {
                                !(selectGroup?.groupImage?.length - 1) === index || index === 0 ?
                                    <Button variant="text" disabled>
                                        <ArrowBackIosNewIcon />
                                    </Button>
                                    :
                                    <Button onClick={() => setIndex(state => state - 1)} variant="text">
                                        <ArrowBackIosNewIcon />
                                    </Button>
                            }
                            <img className='mt-auto' alt='userPhoto'
                                src={selectGroup?.groupImage?.length ? `${imageUrl + groupImage[index]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                sizes='auto'
                            />
                            {(selectGroup?.groupImage?.length - 1) === index || (selectGroup?.groupImage?.length === 0) ?
                                <Button onClick={() => setIndex(state => state + 1)} variant="text" disabled>
                                    <ArrowForwardIosIcon />
                                </Button>
                                :
                                <Button onClick={() => setIndex(state => state + 1)} variant="text">
                                    <ArrowForwardIosIcon />
                                </Button>
                            }
                        </>
                    }
                </div>
                <div className='flex gap-4 flex-col mt-5'>
                    <div className='flex flex-col gap-2 text-slate-100'>
                        <h1>
                            {
                                userInfo ?
                                    "User Name:"
                                    : selectGroup &&
                                    "Group Name:"
                            }
                        </h1>
                        <h1>
                            {userInfo?.name || selectGroup?.name}
                        </h1>
                    </div>
                    {userInfo &&
                        <div className='flex flex-col gap-2 text-slate-100'>
                            <h1>
                                User Phone:
                            </h1>
                            <h1>
                                {userInfo?.phone}
                            </h1>
                        </div>
                    }
                </div>
                <div className='flex flex-row justify-between mt-3 gap-2'>
                    {selectGroup &&
                        <Button variant='contained' onClick={() => setType('Users')}>Users</Button>
                    }
                    <Button variant='contained' onClick={() => setType('')}>Media</Button>
                    <Button variant='contained' onClick={() => setType('video')}>Video</Button>
                    <Button variant='contained' onClick={() => setType('image')}>Image</Button>
                    <Button variant='contained' onClick={() => setType('audio')}>Audio</Button>
                </div>
                {type !== 'audio' ?
                    <div className={media?.length > 0 && type !== 'Users' ? `grid grid-cols-3 gap-2 mt-2 w-full` : "grid grid-cols-1 mt-2 w-full"}>
                        {media?.length > 0 ?
                            <>
                                {media?.map(e => (
                                    <div className='w-full'>
                                        {e.typeFile?.includes('audio') ?
                                            ""
                                            : e.typeFile?.includes('video') ?
                                                <Card>
                                                    <PlayArrowIcon sx={{ position: 'absolute', color: 'rgb(24 24 27)' }} />
                                                    <CardMedia
                                                        component="video"
                                                        src={`${imageUrl + e.fileName}?${new Date().getTime()}`}
                                                        typeof={e.typeFile}
                                                    />
                                                    <CardMedia
                                                        component="video"
                                                        src={`${imageUrl + e.fileName}?${new Date().getTime()}`}
                                                        typeof={e.typeFile}
                                                    />
                                                </Card>
                                                : e.typeFile?.includes('image') &&
                                                <img src={imageUrl + e.fileName} alt='' />
                                        }
                                        {selectGroup &&
                                            <div className='w-full flex flex-col gap-3 pt-[10px]'>
                                                <button style={{ background: "#1976D2", width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px', color: 'white' }}>
                                                    <Typography>
                                                        {e?.name?.toUpperCase()}
                                                    </Typography>
                                                    {selectGroup.groupAdmin.includes(e._id) &&
                                                        <Typography>admin</Typography>
                                                    }
                                                </button>
                                            </div>
                                        }
                                    </div>
                                ))}
                            </>
                            :
                            <div className='text-center w-[100%] text-slate-100'>
                                {type === '' ?
                                    <Typography>
                                        No Media
                                    </Typography> :
                                    <Typography>
                                        No {type}
                                    </Typography>
                                }
                            </div>
                        }
                    </div> :
                    <div className={"grid grid-cols-1 mt-2"}>
                        {media.length > 0 ?
                            <>
                                {media?.map(e => (
                                    <div>
                                        <Card sx={{ maxWidth: 345 }}>
                                            <CardMedia>
                                                <audio controls style={{ background: 'none' }}>
                                                    <source src={`${imageUrl + e.fileName}?${new Date().getTime()}`} typeof={e.typeFile} />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </CardMedia>
                                        </Card>
                                    </div>
                                ))}
                            </>
                            :
                            <div className='text-center w-[100%] text-slate-100'>
                                {type === '' ?
                                    <Typography>
                                        No Media
                                    </Typography> :
                                    <Typography>
                                        No {type}
                                    </Typography>
                                }
                            </div>
                        }
                    </div>
                }
                <ChildModal open={openChild} setOpen={setOpenChild} userInfo={userInfo} phone={phone} selectGroup={selectGroup} />
            </Box>
        </Modal >
    )
}

export default User