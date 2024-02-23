const express = require("express");
const app = express();
// const users=require("./routes/user.js");
// const posts=require("./routes/post.js");

app.get("/getcookies",(req,res)=>{
    res.cookie("greet","hello");    
    res.send("you send some cookies");
})



app.get("/", (req, res) => {
    res.send("Hi, I am root");
  });


// app.use("/users",users);
// app.use("/posts",posts);

app.listen(3000, () => {
    console.log(`Server is listening on port 3000`);
  });