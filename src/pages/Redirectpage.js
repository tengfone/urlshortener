import { React, useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from 'react-bootstrap'
import './Redirectpage.css'
import firebase from '../firebase.js'
require('dotenv').config()

function Redirectpage({ ...props }) {

    const [returnData, setReturnData] = useState({ statusCode: 0, LongURL: '', errorMessage: '' })
    const { ShortURL } = props.match.params

    // OnComponent Immediate Load, Fire API
    useEffect(() => {
        getURL()
    }, [])

    const getURL = () => {
        let urlRef = firebase.firestore().collection("urls")
        urlRef.doc(`${ShortURL}`).get().then((doc) => {
            if (doc.exists) {
                // Success!
                setReturnData({
                    ...returnData,
                    statusCode: 200,
                    LongURL: doc.data().LongURL
                })
            } else {
                // No such URL
                setReturnData({
                    ...returnData,
                    statusCode: 404,
                    errorMessage: "No Such Alias"
                })
            }
        }).catch((error) => {
            setReturnData({
                ...returnData,
                statusCode: 1,
                errorMessage: error
            })
        });
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
