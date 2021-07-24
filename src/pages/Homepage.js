import { React, useState, useEffect } from 'react'
import { Alert, Form, Button, FormControl, InputGroup } from "react-bootstrap";
import axios from 'axios';
import moment from 'moment';
import './Homepage.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import firebase from '../firebase.js'
const https = require('https');

function Homepage() {

    const [form, setForm] = useState({ LongURL: '', ShortURL: '' })
    const [errors, setErrors] = useState({})
    const [toDB, setToDB] = useState({})
    const [returnData, setReturnData] = useState({ statusCode: 0, shortedURL: '', errorMessage: '' })

    const postURLtoFirebase = () => {
        let urlRef = firebase.firestore().collection("urls")
        urlRef.doc(`${toDB.ShortURL}`).get()
            .then((docSnapshot) => {
                if (docSnapshot.exists) {
                    urlRef.onSnapshot((doc) => {
                        // This URL Already Existed
                        setReturnData({
                            ...returnData,
                            statusCode: 520
                        })
                        toast.warning('❗ Whoops Alias Exists', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    });
                } else {
                    // Create A New Field in FireStore
                    urlRef.doc(`${toDB.ShortURL}`).set({
                        ShortURL: `${toDB.ShortURL}`,
                        LongURL: `${toDB.LongURL}`,
                        TimeCreated: `${toDB.TimeCreated}`,
                        TimeExpire: `${toDB.TimeExpire}`
                    }).then(() => {
                        // Successful!
                        setReturnData({
                            ...returnData,
                            statusCode: 200,
                            shortedURL: toDB.ShortURL
                        })
                        toast.success('🎉 Success', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    }).catch((error) => {
                        // Error
                        setReturnData({
                            ...returnData,
                            statusCode: 1,
                            errorMessage: error
                        })
                        toast.error('❗ Error', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    });
                }
            });
    }

    // Handle Inputs
    const setField = (field, value) => {
        setForm({
            ...form,
            [field]: value
        })
        if (!!errors[field]) setErrors({
            ...errors,
            [field]: null
        })
    }

    // Copy Function - Copy to Clipboard only works on localhost or HTTPS
    const copyToDevice = () => {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            toast.warning('❗ Copy Function Does Not Work on http, please copy manually', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            navigator.clipboard.writeText(window.location.href + returnData.shortedURL)
            toast.success('📋 Copied To Clipboard', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    // Form Validation using REGEX
    const findFormErrors = () => {
        const { ShortURL, LongURL } = form
        const newErrors = {}
        let validIPURL = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)(?:\:(?:\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/
        let validLongURL = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
        let validShortURL = /^[a-zA-Z0-9]+(?:-[A-Za-z0-9]+)*$/

        // LongURL
        if (!LongURL || LongURL === '') {
            newErrors.LongURL = "Cannot Be Blank"
        }
        else if (LongURL.length > 2048) {
            newErrors.LongURL = "Cannot be more than 2048 Characters"
        }
        else if (!LongURL.match(validLongURL) && !LongURL.match(validIPURL)) {
            newErrors.LongURL = "URL Error, Please check if valid URL"
        }

        // ShortUL
        if (ShortURL.length > 20) {
            newErrors.ShortURL = "Cannot be more than 20 Characters"
        }
        else if (!ShortURL.match(validShortURL) && ShortURL) {
            newErrors.ShortURL = "Alias Error, Please check if valid URL"
        } else if (ShortURL === 'about') {
            newErrors.ShortURL = "Path Reserved"
        }

        return newErrors
    }

    // Helper Function to check if an Object is empty
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    // OnComponentMount, once the state of toDB changes, the API is being fired. Prevent double rendering.
    useEffect(() => {
        if (!isEmpty(toDB)) {
            setToDB(toDB => ({ ...toDB }))
            postURLtoFirebase()
            setForm({ LongURL: '', ShortURL: '' })
            setErrors(() => ({}))
        }
    }, [toDB.LongURL])

    // Submitting of Form
    const handleSubmit = (e) => {
        e.preventDefault()
        const newErrors = findFormErrors()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
        } else {
            // REGEX Successful

            let { ShortURL, LongURL } = form
            const TimeCreated = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')

            // If Short URL Empty, Randomly Generate 8 Characters using B62 Encoder
            if (!ShortURL) {
                var base62 = require('base62-random');
                ShortURL = base62(8);
            }

            // Ensure that HTTP is being added before sending to SQL server to allow it to be recognize as a HTML
            if (!LongURL.match(/^https?:\/\/(.*)/)) {
                LongURL = "http://" + LongURL
            }

            // 30 days expiry: to be implemented
            let TimeExpire = moment().add(30, 'days')
            TimeExpire = TimeExpire.format('YYYY-MM-DD HH:mm:ss')

            const newToDB = {
                ...toDB, ShortURL: ShortURL,
                LongURL: LongURL,
                TimeCreated: TimeCreated,
                TimeExpire: TimeExpire
            }

            setToDB(newToDB)

            // Clear All Boxes, States are being cleared in UseEffect.
            e.target.reset();
        }
    }

    return (
        <div>
            <div className="topDiv">
                <h1>URL Shortener</h1>
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Row className="align-items-center">
                        <Form.Label htmlFor="LongURL" srOnly>
                            LongURL
                        </Form.Label>
                        <Form.Control
                            className="mb-2"
                            placeholder="Enter Long URL"
                            type='text'
                            onChange={(e) => setField('LongURL', e.target.value)}
                            isInvalid={!!errors.LongURL}
                        />
                        <Form.Control.Feedback type='invalid' className="mb-2">
                            {errors.LongURL}
                        </Form.Control.Feedback>
                        <Form.Label htmlFor="inlineFormInputGroup" srOnly>
                            ShortURL
                        </Form.Label>
                        <InputGroup className="mb-2">
                            <InputGroup.Prepend>
                                <InputGroup.Text>{window.location.href}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                type='text'
                                onChange={(e) => setField('ShortURL', e.target.value)}
                                isInvalid={!!errors.ShortURL}
                                placeholder="alias"
                            />
                            <Form.Control.Feedback type='invalid'>
                                {errors.ShortURL}
                            </Form.Control.Feedback>
                        </InputGroup>
                        <p className='smallInfo'>*Please Note that if no alias is given, a random alias will be generated</p>
                        <Button type="submit" className="mb-2 col-12 mt-3 mb-4">
                            Make ShortenURL!
                        </Button>
                    </Form.Row>
                </Form>
                {(() => {
                    if (returnData.statusCode === 200) {
                        return (
                            <div>
                                <Alert variant="success">
                                    <Alert.Heading>Success!</Alert.Heading>
                                    <p>
                                        Check out your new shorten URL here!
                                    </p>
                                    <ToastContainer />
                                    <hr />
                                    <a href={window.location.href + returnData.shortedURL}>
                                        <p>{window.location.href + returnData.shortedURL}</p>
                                    </a>
                                    <div className="d-flex justify-content-end">
                                        <Button onClick={copyToDevice} variant="outline-success">
                                            Copy
                                        </Button>
                                        <ToastContainer />
                                    </div>
                                </Alert>
                            </div>)
                    } else if (returnData.statusCode === 520) {
                        return (
                            <Alert variant="warning">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>
                                    This alias already exist!
                                </p>
                                <ToastContainer />
                            </Alert>
                        )
                    } else if (returnData.statusCode !== 0) {
                        return (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>
                                    Ooops, something went wrong! Error: {returnData.errorMessage}
                                </p>
                                <ToastContainer />
                            </Alert>
                        )
                    }
                })()}
            </div>
        </div>
    )
}

export default Homepage