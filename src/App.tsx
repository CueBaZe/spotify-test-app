import { useState } from 'react'
import './App.css'

export default function App() {

  return (
    <section>
      <div className='flex flex-col h-screen w-screen bg-[#232423] items-center gap-[50px]'>
        <h1 className='text-center text-6xl font-bold text-green-300'>Spotify test app</h1>
        <input type='text' placeholder='What do you want to lisen to?' className='border-2 border-[#363636] rounded-2xl w-[350px] text-xl text-white p-2'></input> {/* This is the search bar */}
      </div>
    </section>
  );
}