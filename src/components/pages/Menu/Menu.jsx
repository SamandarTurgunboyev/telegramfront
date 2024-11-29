import { Button } from "@mui/material";
import AddContact from "./addContact/AddContact"
import MenuIcon from '@mui/icons-material/Menu';
import SettingContact from "./settingUser/SettingContact";
import AddGroup from "./addGroup/AddGroup";

function Menu({ openMenu, setPhone, scrollToBottom, setUserName }) {
    return (
        <div className='w-[100%] bg-slate-950 h-[100vh] m-0 flex flex-col gap-[20px]'>
            <Button onClick={openMenu} sx={{ width: "20%" }}>
                <MenuIcon sx={{ color: "white" }} />
            </Button>
            <AddContact setPhone={setPhone} scrollToBottom={scrollToBottom} setUserName={setUserName} />
            <SettingContact />
            <AddGroup />
        </div >
    )
}

export default Menu