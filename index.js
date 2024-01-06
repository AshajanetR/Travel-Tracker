import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"world",
  password:"@Asha1310",
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkvisited(){
  const result= await db.query("select country_code from visited_countries");
  let countries=[];
   result.rows.forEach((country)=>{
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  //Write your code here.
  const countries= await checkvisited();
  res.render("index.ejs",{
    countries:countries,total:countries.length,
  })
  });


  app.post("/add",async(req,res)=>{
    const input=req.body["country"];

    try{
      const result=await db.query("select country_code from countries where LOWER(country_name) LIKE '%'||$1||'%';",[input.toLowerCase()]);
    
   


      const data =result.rows[0];
      const countrycode=data.country_code;
    try{
      await db.query("insert into visited_countries (country_code) values ($1)",[countrycode]);
      res.redirect("/");
    }
    catch(err){
      console.log(err);
      const countries=await checkvisited();
      res.render("index.ejs",{
        countries:countries,total:countries.length,error:'country has already been added,try again.',
      });
    }
  }catch(err){
    console.log(err);
    const countries=await checkvisited();
    res.render("index.ejs",{
      countries:countries,total:countries.length,error:'country does not exist,try again.',
    });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
