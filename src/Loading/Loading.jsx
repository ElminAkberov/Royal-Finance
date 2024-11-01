import React from 'react'
import { BeatLoader } from 'react-spinners'

const Loading = () => {
    return (
        <div className='flex justify-center my-32'>
            <BeatLoader  color='#2E70F5' />
        </div>
    )
}

export default Loading