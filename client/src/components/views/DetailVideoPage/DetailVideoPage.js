import React, { useEffect, useState } from 'react'
import { List, Avatar, Row, Col } from 'antd';
import axios from 'axios';
import SideVideo from './Sections/SideVideo';
import Subscriber from './Sections/Subscriber';
import Comments from './Sections/Comments'
import LikeDislikes from './Sections/LikeDislikes';
function DetailVideoPage(props) {

    /*function incViewCount() {
        axios.post('/api/video/increaseViewCount', videoVariable).then(response => {
            if (response.data.success) console.log("Uspjesno povecanje view counta");
            else console.log("Neupjesno povecanje view counta");
        }).catch(console.error("Sto necee..."))
    }*/

    ///Video koji smo pokupili (njegove podatke) (video.js /getVideo ruta) smjestamo tako sto mu uzmemo id i smjestimo
    ///u lokalnu varijablu te definisemo state za video i liste komentara. 
    const videoId = props.match.params.videoId
    const [Video, setVideo] = useState([])
    const [CommentLists, setCommentLists] = useState([])

    const videoVariable = {
        videoId: videoId
    }

    ///useEffect metod nam sluzi da pokupimo podatke iz mongoDB-a, odnosno informacije o videima. 
    useEffect(() => {
        axios.post('/api/video/getVideo', videoVariable)
            .then(response => {
                if (response.data.success) {
                    setVideo(response.data.video)
                } else {
                    alert('Preuzimanje podataka o videu neuspjesno.')
                }
            })

        axios.post('/api/comment/getComments', videoVariable)
            .then(response => {
                if (response.data.success) {
                    setCommentLists(response.data.comments)
                } else {
                    alert('Preuzimanje podataka o videu neuspjesno.')
                }
            })


    }, [])

    const updateComment = (newComment) => {
        setCommentLists(CommentLists.concat(newComment))
    }

    

///sa antdesigna je template kopiran. 
    if (Video.writer) {
        return (
            <Row>
                <Col lg={18} xs={24}>
                    <div className="postPage" style={{ width: '100%', padding: '3rem 4em' }}>
                        <video style={{ width: '100%' }} src={`http://localhost:5000/${Video.filePath}`} controls></video>

                        <List.Item
                            actions={[<LikeDislikes video videoId={videoId} userId={localStorage.getItem('userId')}  />, 
                                       <Subscriber userTo={Video.writer._id} userFrom={localStorage.getItem('userId')} />]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={Video.writer && Video.writer.image} />}
                                title={<a href="https://ant.design">{Video.title}</a>}
                                description={Video.description}
                            />
                        </List.Item>

                        <Comments CommentLists={CommentLists} postId={Video._id} refreshFunction={updateComment} />
                    </div>
                </Col>
                <Col lg={6} xs={24}>

                    <SideVideo />

                </Col>
            </Row>
        )

    } else {
        return (
            <div>Pricekajte...</div>
        )
    }
}

export default DetailVideoPage

