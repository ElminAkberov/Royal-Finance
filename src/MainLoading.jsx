import React from 'react'
import { BeatLoader } from 'react-spinners'

const Loading = () => {
    return (
        <div className='flex h-[100vh] items-center justify-center bg-white'>
            <BeatLoader  color='#2E70F5' />
        </div>
    )
}

export default Loading