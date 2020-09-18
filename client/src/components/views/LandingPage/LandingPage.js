import React, { useEffect, useState } from 'react'
import { FaCode } from "react-icons/fa";
import { Card, Avatar, Col, Typography, Row } from 'antd';
import axios from 'axios';
import moment from 'moment';
const { Title } = Typography;
const { Meta } = Card;
function LandingPage() {

    const [Videos, setVideos] = useState([])


    ///useEffect je hook pomocu kojeg povlacimo videe i smjestamo ih state. U slucaju da preuzimanje nije proslo
    ///ispisujemo odgovarajucu poruku (video.js router.get(/getVideos))
    useEffect(() => {
        axios.get('/api/video/getVideos')
            .then(response => {
                if (response.data.success) {
                    setVideos(response.data.videos)
                } else {
                    alert('Preuzimanje videa neuspjesno.')
                }
            })
    }, [])

    let styles = {
        marginLeft: '48px',
      };




///Pravimo renderCards varijablu koja je reusable i koristit ce se onoliko puta koliko ima videa u state-u odnosno u bazi.
///Za svaki video u Videos listi racunamo njegovu vrijednost u minutama i sekundma i potom dole ubacujemo njegov naziv, avatara,
///autora, datum ubacivanja te trajanje videa. Ovdje nema narocito sta da se objasnjava te je sve stvar stila i dizajna.
///ant design koristen

    const renderCards = Videos.map((video, index) => {

        var minutes = Math.floor(video.duration / 60);
        var seconds = Math.floor(video.duration - minutes * 60);

        return <Col lg={6} md={8} xs={24}>
            <div style={{ position: 'relative' }}>
                <a href={`/video/${video._id}`} >
                <img style={{ width: '100%' }} alt="thumbnail" src={`http://localhost:5000/${video.thumbnail}`} />
                <div className=" duration"
                    style={{ bottom: 0, right:0, position: 'absolute', margin: '4px', 
                    color: '#fff', backgroundColor: 'rgba(17, 17, 17, 0.8)', opacity: 0.8, 
                    padding: '2px 4px', borderRadius:'2px', letterSpacing:'0.5px', fontSize:'12px',
                    fontWeight:'500', lineHeight:'12px' }}>
                    <span>{minutes} : {seconds}</span>
                </div>
                </a>
            </div><br />
            <Meta
                avatar={
                    <Avatar src={video.writer.image} />
                }
                title={video.title}
            />
            <span>{video.writer.name} </span><br />
            {/* <span style={{ marginLeft: '3rem' }}> {video.views} </span> */} 
        <span style={styles}>{moment(video.createdAt).format("MMM Do YY")} </span>
        </Col>

    })



    return (
        <div style={{ width: '85%', margin: '3rem auto' }}>
            <Title level={2} > All videos </Title>
            <hr />

            <Row gutter={16}>
                {renderCards}
            </Row>
        </div>
    )
}

export default LandingPage
