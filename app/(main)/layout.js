import React from 'react'

const MainLayout = ({ children }) => {
    return (
        <div className='max-w-5/6 w-5/6 mx-auto my-32'>{children}</div>
    )
}

export default MainLayout