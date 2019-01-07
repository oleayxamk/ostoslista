const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const ostoslista = require("./models/ostoslista");

const portti = 1000;

let lista = "";
let kayttaja = "";

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static("./public/"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res)=>{
    if(kayttaja !=""){
        lista = "";
        let tiedot= "";
    
        ostoslista.haeListat(kayttaja, (err, data)=>{
            if(err){
                console.log(err);
            }
            else{
                tiedot = data;
                
                ostoslista.haeJaetut(kayttaja, (err, data)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("index", {"tiedot":tiedot, "jaettu":data, "kayttaja":kayttaja});
                    }
                });
            }
        });
    }
    else{
        res.render("kirjaudu");
    }
});

app.get("/lista/:id", (req, res)=>{
    lista = req.params.id;
    
    ostoslista.haeLista(req.params.id, (err, data)=>{
        if(err){
            console.log(err);
        }
        else{
            
            if(data !=""){
                res.render("lista", {"tiedot":data, "listanId":req.params.id, "listanNimi":""});
            }
            else{
                ostoslista.haeListanNimi(lista, (err, data)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("lista", {"tiedot":"", "listanId":lista, "listanNimi":data[0].nimi});
                    }
                });
            }
        }
    });
});

app.get("/poistaLista/:id", (req, res)=>{
    ostoslista.poistaLista(req.params.id, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
});

app.get("/poista/:id", (req, res)=>{

    ostoslista.poistaListasta(req.params.id, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect(`/lista/${lista}`);
        }
    });
});

app.get("/muokkaaYhta/:id", (req, res)=>{
    
    ostoslista.haeLista(lista, (err, data)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render("muokkaaListassa", {"tiedot":data, "muokattava":req.params.id});
        }
    });
});

app.get("/ostettu/:id", (req, res)=>{
    
    let tiedot={
                "id":req.params.id,
                "ostettu":req.query.ostettu
    };

   ostoslista.muokkaaOstettu(tiedot, (err)=>{
      if(err){
          console.log(err);
      }
      else{
          res.redirect(`/lista/${lista}`);
      } 
   });
});

app.get("/kirjauduUlos", (req, res)=>{
    kayttaja = "";
    lista = "";
    
    res.redirect("/");
});

app.post("/luoKayttaja", (req, res)=>{
    ostoslista.luoKayttaja(req.body, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
});

app.post("/kirjaudu", (req, res)=>{
   ostoslista.kirjaudu(req.body, (err, data)=>{
       if(err){
            console.log(err);
        }
        else{
            kayttaja = data[0].id;
            res.redirect("/");
        }
   });
});

app.post("/uusiLista", (req, res)=>{
    ostoslista.lisaaLista(req.body, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
});


app.post("/lisaaListaan", (req, res)=>{
    
    ostoslista.lisaaListaan(req.body, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect(`/lista/${lista}`);
        }
    });
});

app.post("/tallennaMuokkaus", (req, res)=>{
    
    ostoslista.tallennaMuokkaus(req.body, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect(`/lista/${lista}`);
        }
    });
});

app.post("/jaa", (req, res)=>{
    
    ostoslista.haeListat(kayttaja, (err, data)=>{
            if(err){
                console.log(err);
            }
            else{
                res.render("jaa", {"tiedot":data, "jaettava":req.body.lista});
            }
        });
});

app.post("/jaaLista", (req, res)=>{
    let tiedot = {
        "id":null,
        "lista":req.body.lista
    };
    
    ostoslista.haeKayttaja(req.body.kuka, (err, data)=>{
        if(err){
            console.log(err);
        }
        else{
            tiedot.id = data[0].id;
            
            ostoslista.jaaLista(tiedot, (err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.redirect("/");
                }
            });
        }
    });
});

app.post("/poistaJako", (req, res)=>{
    ostoslista.poistaJako(req.body.lista, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
});

app.listen(portti, ()=>{
    console.log(`Yhteys on avattu porttiin ${portti}`);
});