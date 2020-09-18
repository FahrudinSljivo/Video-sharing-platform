import React, { useState, useEffect } from 'react'
import { Typography, Button, Form, message, Input, Icon } from 'antd';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { useSelector } from "react-redux";

const { Title } = Typography;
const { TextArea } = Input;



const Category = [
    { value: 0, label: "Film" },
    { value: 1, label: "Automobili" },
    { value: 2, label: "Muzika" },
    { value: 3, label: "Edukacija" },
    { value: 4, label: "Sport" },
]

///react redux koristimo samo za user state management i manje vise nista drugo. Dolje ispod smjestamo vrijednosti
///naslova, opisa itd. iz uploadvideopage-a i pratimo njihov state kako bismo ga mogli ocitati kasnije prilikom
///onSubmit eventa.
///U usera kupimo state trenutnog usera pomocu useSelector hook-a. Iz tog statea cemo kasnije moci preuzeti vrijednosti
///kao npr. njegov id i tako dalje sto cemo korisiti prilikom upisivanja nekog videa u bazu koji se uploaduje.
function UploadVideoPage(props) {
    const user = useSelector(state => state.user);

    const [title, setTitle] = useState("");
    const [Description, setDescription] = useState("");
    const [Categories, setCategories] = useState("Film")
    const [FilePath, setFilePath] = useState("")
    const [Duration, setDuration] = useState("")
    const [Thumbnail, setThumbnail] = useState("")


    ///event change handler-i; kada se promijeni vrijednost nekog text fielda, u state pamtimo ono sto je uneseno.
    const handleChangeTitle = (event) => {
        setTitle(event.currentTarget.value)
    }

    const handleChangeDecsription = (event) => {
        setDescription(event.currentTarget.value)
    }


    const handleChangeTwo = (event) => {
        setCategories(event.currentTarget.value)
    }

    const onSubmit = (event) => {

        event.preventDefault();

        if (user.userData && !user.userData.isAuth) {
            return alert('Molimo logujte se prvo')
        }

        if (title === "" || Description === "" ||
            Categories === "" || FilePath === "" 
              || Duration === "" || Thumbnail === ""
            ) {
            return alert('Molimo popunite sva polja');
        }

        const variables = {
            writer: user.userData._id,
            title: title,
            description: Description,
            filePath: FilePath,
            category: Categories,
            duration: Duration,
            thumbnail: Thumbnail
        }

        ///Jednostavan axios post poziv koji ako prodje, javljamo odgovarajucom porukom rezultat korisniku te ga 
        ///preusmjeravamo na home page. Ukoliko nije, obavjestavamo korisnika da upload nije uspjesan. Post ruta
        ///u video.js fileu.
        axios.post('/api/video/uploadVideo', variables)
            .then(response => {
                if (response.data.success) {
                    alert('Video uspjesno uploadovan.')
                    props.history.push('/')
                } else {
                    alert('Upload videa neuspjesan.')
                }
            })

    }

    const onDrop = (files) => {


        ///kada posaljemo file u backend preko http request-a, treba nam ova header konfiguracija u http return-u.
        let formData = new FormData();
        const config = {
            header: { 'content-type': 'multipart/form-data' }
        }
        formData.append("file", files[0])

        ///koristimo axios za post http request
        ///u varijablu kupimo filepath i filename koji smo dobili prilikom samog uploada i ubacivanja fajla u uploads
        ///folder (u video.js fajlu u server dijelu). Potom postavljamo filepath 
        axios.post('/api/video/uploadfiles', formData, config)
            .then(response => {
                if (response.data.success) {

                    let variable = {
                        filePath: response.data.filePath,
                        fileName: response.data.fileName
                    }
                    setFilePath(response.data.filePath)

                    ///napravili smo rutu u video.js router.post('/thumbnail)

                    axios.post('/api/video/thumbnail', variable)
                        .then(response => {
                            if (response.data.success) {
                                setDuration(response.data.fileDuration)
                                setThumbnail(response.data.thumbNailFilePath)
                            } else {
                                alert('Thumbnail neuspjesno generisan');
                            }
                        })


                } else {
                    alert('Neuspjesno snimanje videa na server')
                }
            })

    }

    ///Dropzone je iz reactdropzone library-a i sluzi nam za prozor na koji cemo kliknut kada htjednemo uploadovat
    ///sliku. Inace ovo je sve antdesign.
    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Title level={2} > Upload Video</Title>
            </div>

            <Form onSubmit={onSubmit} encType="multipart/form-data">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Dropzone
                        onDrop={onDrop}
                        multiple={false}
                        maxSize={800000000}>
                        {({ getRootProps, getInputProps }) => (
                            <div style={{ width: '300px', height: '240px', border: '1px solid lightgray', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                <Icon type="plus" style={{ fontSize: '3rem' }} />

                            </div>
                        )}
                    </Dropzone>

                    {Thumbnail !== "" &&
                        <div>
                            <img src={`http://localhost:5000/${Thumbnail}`} alt="nesto drugooo" />
                        </div>
                    }
                </div>

                <br /><br />
                <label>Naziv</label>
                <Input
                    onChange={handleChangeTitle}
                    value={title}
                />
                <br /><br />
                <label>Opis</label>
                <TextArea
                    onChange={handleChangeDecsription}
                    value={Description}
                />
                <br /><br />

                <select onChange={handleChangeTwo}>
                    {Category.map((item, index) => (
                        <option key={index} value={item.label}>{item.label}</option>
                    ))}
                </select>
                <br /><br />

                <Button type="primary" size="large" onClick={onSubmit}>
                    Submit
            </Button>
            </Form>
        </div>
    )
}

export default UploadVideoPage
