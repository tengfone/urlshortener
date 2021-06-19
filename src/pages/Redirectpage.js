import { React, useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from 'react-bootstrap'
import './Redirectpage.css'
require('dotenv').config()

function Redirectpage({ ...props }) {

    const [returnData, setReturnData] = useState({ statusCode: 0, LongURL: '', errorMessage: '' })
    const { ShortURL } = props.match.params

    // OnComponent Immediate Load, Fire API
    useEffect(() => {
        getURL()
    }, [])

    // Send a GET request to the API server to check for the alias (ShortURL)
    const url = process.env.REACT_APP_URL_API
    const getURL = () => {
        axios.get(`${url}${ShortURL}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            if (res.status === 200) {
                setReturnData({
                    ...returnData,
                    statusCode: res.status,
                    LongURL: res.data.LongURL
                })
            } else {
                setReturnData({
                    ...returnData,
                    statusCode: 1,
                    errorMessage: res
                })
            }
        }).catch(function (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    setReturnData({
                        ...returnData,
                        statusCode: error.response.status
                    })
                } else {
                    setReturnData({
                        ...returnData,
                        statusCode: 1,
                        errorMessage: error.response
                    })
                }
            } else {
                setReturnData({
                    ...returnData,
                    statusCode: 2,
                    errorMessage: 'Error Connecting to SQL'
                })
            }
        })
    }

    // Redirect to saved Website
    const toRedirected = () => {
        window.location.href = returnData.LongURL
    }

    // If an invalid slug/ShortURL/Alias does not exist, return to HomePage
    const toHomePage = () => {
        setTimeout(function () {
            window.location.href = '/'
        }, 2000)
    }

    return (
        <div className='divContent'>
            {(() => {
                if (returnData.LongURL.length > 1) {
                    return (
                        <div>
                            <Spinner animation="border" />
                            <h1>Redirecting...</h1>
                            {toRedirected()}
                        </div>)
                } else if (returnData.statusCode === 404) {
                    return (
                        <div>
                            <Spinner animation="border" />
                            <h2>Redirected Alias URL Does Not Exist</h2>
                            <p>Redirecting Back to Home Page...</p>
                            {toHomePage()}
                        </div>
                    )
                } else if (returnData.statusCode !== 0) {
                    return (
                        <div>
                            <p>Server Error</p>
                            {toRedirected()}
                        </div>
                    )
                }
            })()}
        </div>
    )
}

export default withRouter(Redirectpage)
