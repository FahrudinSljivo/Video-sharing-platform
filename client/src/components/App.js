import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar";
import Footer from "./views/Footer/Footer"
import UploadVideoPage from "./views/UploadVideoPage/UploadVideoPage"
import DetailVideoPage from "./views/DetailVideoPage/DetailVideoPage"
import SubscriptionPage from "./views/SubscriptionPage/SubscriptionPage"

function App() {
  return (
    ///Suspense komponenta nam omogucuje da imamo nesto na ekranu dok se neke druge definisane unutar nje ne loadaju
    ///Switch komponenta rendera neku rutu i ne rendera neke druge rute koje takodjer zadovoljavaju uslov iz puta (iz URL-a).
    ///Npr. ako je URL /about tada npr. <About>, <User> i <NoMatch> 
    ///ce se svi renderati jer se svi imaju taj path (ako smo na /about, mozda zelimo match-ati /:user) - to je tako
    ///po dizajnu jer nam omogucava da komponujemo rute u aplikacijama na vise nacina - kao tabove, sidebarove itd. Ako zelimo
    ///odabrati samo jednu rutu, onda koristimo switch.
    ///Ispod Switcha imamo popis ruta i komponenti koje ih oslikavaju.
    ///drugi parametar auth metoda je false kod logina i registra, dok je true kod uploada jer logovan user ne moze pristupiti
    ///loginu i registru, ali zato moze uploadu. Slicno, neulogovan user ne moze uploadovat ali moze se loginovat i regist
    ///rovat. Null je vrijednost ako mozes na nesto uci i ulogovan i neulogovan.
    <Suspense fallback={(<div>Pricekajte...</div>)}>
      <NavBar />
      <div style={{ paddingTop: '75px', minHeight: 'calc(100vh - 80px)' }}>
    
        <Switch>
          <Route exact path="/" component={Auth(LandingPage, null)} />
          <Route exact path="/login" component={Auth(LoginPage, false)} />
          <Route exact path="/register" component={Auth(RegisterPage, false)} />
          <Route exact path="/video/upload" component={Auth(UploadVideoPage, true)} />
          <Route exact path="/video/:videoId" component={Auth(DetailVideoPage, null)} />
          <Route exact path="/subscription" component={Auth(SubscriptionPage, null)} />
        </Switch> 
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
