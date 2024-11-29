import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { register } from '../../api/url'

function Register() {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const navigation = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const user = await api.post(register, {
                name, phone, password
            })
            localStorage.setItem('token', user.data.token)
            navigation('/home')
            window.location.reload()
        } catch (error) {

        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form
                className={`w-[50%] border-stone-700 border-[1px] bg-slate-900 text-center max-md:w-[70%] max-sm:w-[100%]`}
                onSubmit={handleSubmit}
            >
                <div className='mt-3 grid grid-cols-2 gap-2 w-[50%] m-auto max-md:w-[70%] max-sm:w-[80%]'>
                    <NavLink to={'/'} className='text-xl text-slate-200 bg-sky-600 max-sm:text-xl'>
                        <button className='active'>Register</button>
                    </NavLink>
                    <NavLink to={'/login'} className='text-2xl text-slate-200 bg-sky-600 max-sm:text-xl'>
                        <button>Login</button>
                    </NavLink>
                </div>
                <div className='grid gap-4 mt-5 mb-5'>
                    <input onChange={(e) => setName(e.target.value)} type="text" id='Name' className='border-1 border-black rounded-md w-[50%] p-2 m-auto max-md:w-[70%] max-sm:w-[80%]' placeholder='name' />
                    <input onChange={(e) => setPhone(e.target.value)} type="text" id='phone' className='border-1 border-black rounded-md w-[50%] p-2 m-auto max-md:w-[70%] max-sm:w-[80%]' placeholder=' phone number' />
                    <input onChange={(e) => setPassword(e.target.value)} type="text" id='password' className='border-1 border-black rounded-md w-[50%] m-auto p-2 max-md:w-[70%] max-sm:w-[80%]' placeholder='pasword' />
                    <button className='bg-blue-600 w-[50%] m-auto p-2 text-neutral-50'>Submit</button>
                </div>
            </form>
        </div>
    )
}

export default Register