import { React, useState, useEffect } from 'react'
import { Alert, Form, Button, FormControl, InputGroup } from "react-bootstrap";
import axios from 'axios';
import moment from 'moment';
import './Homepage.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const https = require('https');

function Homepage() {
    const [form, setForm] = useState({ LongURL: '', ShortURL: '' })
    const [errors, setErrors] = useState({})
    const [toDB, setToDB] = useState({})
    const [returnData, setReturnData] = useState({ statusCode: 0, shortedURL: '', errorMessage: '' })

    // API
    const url = process.env.REACT_APP_URL_API
    const agent = new https.Agent({
        rejectUnauthorized: false
    });
    const postURL = () => {
        axios.post(`${url}url`, toDB, {
            agent: agent,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            if (res.status === 200) {
                setReturnData({
                    ...returnData,
                    statusCode: res.status,
                    shortedURL: res.data.ShortURL
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
            } else {
                setReturnData({
                    ...returnData,
                    statusCode: 1,
                    errorMessage: res
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
            }
        }).catch(function (error) {
            if (error.response) {
                if (error.response.status === 520) {
                    setReturnData({
                        ...returnData,
                        statusCode: error.response.status
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
                } else {
                    setReturnData({
                        ...returnData,
                        statusCode: 1,
                        errorMessage: error.response
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

    // Copy Function
    const copyToDevice = () => {
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

    // Form Validation
    const findFormErrors = () => {
        const { ShortURL, LongURL } = form
        const newErrors = {}
        let validLongURL = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
        let validShortURL = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

        // LongURL
        if (!LongURL || LongURL === '') {
            newErrors.LongURL = "Cannot Be Blank"
        }
        else if (LongURL.length > 2048) {
            newErrors.LongURL = "Cannot be more than 2048 Characters"
        }
        else if (!LongURL.match(validLongURL)) {
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

    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    useEffect(() => {
        if (!isEmpty(toDB)) {
            setToDB(toDB => ({ ...toDB }))
            postURL()
            setForm({ LongURL: '', ShortURL: '' })
            setErrors(() => ({}))
        }
    }, [toDB.LongURL])

    const handleSubmit = (e) => {
        e.preventDefault()
        const newErrors = findFormErrors()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
        } else {
            // REGEX Successful

            let { ShortURL, LongURL } = form
            // const TimeCreated = Date.now()
            const TimeCreated = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')

            // If Short URL Empty, Generate a B62 Encoder
            if (!ShortURL) {
                var base62 = require('base62-random');
                ShortURL = base62(8);
            }

            if (!LongURL.match(/^https?:\/\/(.*)/)) {
                LongURL = "http://" + LongURL
            }

            // 30 days expiry
            let TimeExpire = moment().add(30, 'days')
            TimeExpire = TimeExpire.format('YYYY-MM-DD HH:mm:ss')

            const newToDB = {
                ...toDB, ShortURL: ShortURL,
                LongURL: LongURL,
                TimeCreated: TimeCreated,
                TimeExpire: TimeExpire
            }

            setToDB(newToDB)

            // Clear All Boxes
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