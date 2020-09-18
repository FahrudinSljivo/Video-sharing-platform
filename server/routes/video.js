const express = require('express');
const router = express.Router();
const multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');

const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");
const { auth } = require("../middleware/auth");


///smjestamo u uploads folder ono sto uploadujemo i postavljamo mu naziv na dati nacin (kupimo trenutno vrijeme i ubacujemo
///pravi naziv fajla. Ovo je dobra praksa posto na ovaj nacin imamo zagarantovane unikatne nazive fajlova te nece dolaziti
///ni do kakvih konflikata prilikom uploada). Takodjer, dozvoljavamo samo upload mp4 fajla na kraju tako sto provjeravamo
///ekstenziju fajla koji se uploaduje.
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('Samo upload mp4 fajla je dozvoljen.'), false);
        }
        cb(null, true)
    }
})


///zelimo uploadovati samo jedan file.
var upload = multer({ storage: storage }).single("file")


///ruta nije api/video/uploadfiles jer smo u index.js iz servera stavili middleware koje koristimo (21. linija)
///U slucaju da upload ne prodje (bude error), vratimo u responseu json sa parametrima success:false i samim
///errorom koji se desio. U slucaju da prodje, vratimo opet json sa success:true parametrom i nazivom i filepathom
///fajla koji se uploaduje.

router.post("/uploadfiles", (req, res) => {

    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })

});
/*
router.post("/increaseViewCount", (req, res) => {
    Video.findOne({ "_id" : req.body.videoId }).update({ $inc: { views: 1} });
})
*/

router.post("/thumbnail", (req, res) => {

    ///ovaj dio je prekopiran sa dokumentacije za ffmpeg (koristen i stack overflow za ove stvari). Uglavnom,
    ///na pocetku definisemo dvije varijable thumbnailFilePath i fileDuration. U fileDuration odmah smjestamo pomocu
    ///ffprobe metoda iz ffmpega, koji smo skinuli kao dependency projekta, trajanje videa u lokalnu varijablu
    ///fileDuration. 

    let thumbNailFilePath ="";
    let fileDuration ="";

    ffmpeg.ffprobe(req.body.filePath, function(err, metadata){
        fileDuration = metadata.format.duration;
    })

    ///Dalje ubacujemo u thumbnails folder prvi thumbnail koji se generise (posto se generisu 3), vratimo 
    ///za kraj, u slucaju da je uspjesan upload, json sa porukama da je uspjesan upload kao i put do thumbnaila
    ///koji je uploadovan i trajanje samog videa. Pravimo i 3 screenshota, ali koristimo jedan samo, koje smjestamo
    ///u uploads/thumbnails folder, odredjujemo mu velicinu koju ce imat na ekranu.
    
    ffmpeg(req.body.filePath)
        .on('filenames', function (filenames) {
            thumbNailFilePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () {
            return res.json({ success: true, thumbNailFilePath: thumbNailFilePath, fileDuration: fileDuration})
        })
        .screenshots({
            count: 3,
            folder: 'uploads/thumbnails',
            size:'320x240',
            filename:'thumbnail-%b.png'
        });

});



///Pomocu find metoda uzimamo sve elemente iz Video kolekcije u mongoDB bazi i kupimo sve info o osobi koja je 
///uploadovala file. Potom chainamo exec metod koji moze vratiti true ili false u zavisnosti od toga da li je 
///preuzimanje videa proslo.

router.get("/getVideos", (req, res) => {

    Video.find()
        .populate('writer')
        .exec((err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success: true, videos })
        })
});


/// Kupimo iz requesta video koji se uploaduje te pomocu save metoda ga snimamo u bazu. U slucaju da je upload prosao,
/// vracamo status 200 i json sa porukom da je prosao upload. U slucaju da ne, vracamo status 400 (error na client
///strani te vracamo json sa odgovarajucim porukama)

router.post("/uploadVideo", (req, res) => {

    const video = new Video(req.body)

    video.save((err, video) => {
        if(err) return res.status(400).json({ success: false, err })
        return res.status(200).json({
            success: true 
        })
    })
});

///pomocu ove metode se kupi video (njegove informacije iz mongo baze) na osnovu id-a koji se proslijedi iz
///u request body-u (odnosno iz id-a iz URL-a). U slucaju da 
router.post("/getVideo", (req, res) => {

    Video.findOne({ "_id" : req.body.videoId })
    .populate('writer')
    .exec((err, video) => {
        if(err) return res.status(400).send(err);
        res.status(200).json({ success: true, video })
    })
});


router.post("/getSubscriptionVideos", (req, res) => {


    //Pronaci sve usere na koje smo subscribe-ani iz Subscriber kolekcije
    
    Subscriber.find({ 'userFrom': req.body.userFrom })
    .exec((err, subscribers)=> {
        if(err) return res.status(400).send(err);

        let subscribedUser = [];

        subscribers.map((subscriber, i)=> {
            subscribedUser.push(subscriber.userTo)
        })


        //Pokupiti sve videe od usera koje smo pronasli u prethodnom koraku.

        Video.find({ writer: { $in: subscribedUser }})
            .populate('writer')
            .exec((err, videos) => {
                if(err) return res.status(400).send(err);
                res.status(200).json({ success: true, videos })
            })
    })
});

module.exports = router;
