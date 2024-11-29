import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { login } from '../../api/url'

function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const navigation = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await api.post(login, {
        phone, password
      })
      localStorage.setItem('token', user.data.token);
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
          <NavLink
            to={'/'}
            className={`text-2xl text-slate-200 bg-sky-600 max-sm:text-xl`}
          >
            <button>Register</button>
          </NavLink>
          <NavLink to={'/login'} className='text-2xl text-slate-200 bg-sky-600 max-sm:text-xl'>
            <button>Login</button>
          </NavLink>
        </div>
        <div className='grid gap-4 mt-5 mb-5'>
          <input type="text" id='phone' className='border-1 border-black rounded-md w-[50%] p-2 m-auto max-md:w-[70%] max-sm:w-[80%]' placeholder=' phone number' onChange={(e) => setPhone(e.target.value)} />
          <input type="text" id='password' className='border-1 border-black rounded-md w-[50%] m-auto p-2 max-md:w-[70%] max-sm:w-[80%]' placeholder='password' onChange={(e) => setPassword(e.target.value)} />
          <button className='bg-blue-600 w-[50%] m-auto p-2 text-neutral-50'>Submit</button>
        </div>
      </form>
    </div >
  )
}

export default Login