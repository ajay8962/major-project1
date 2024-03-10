const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");


const MONGO_URL="mongodb://127.0.0.1:27017/wonderlust";

main().then((res)=>{
    console.log("Connected to database..");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
};

const initDB= async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"65e810a34223e69cddc3c982",}));
    await Listing.insertMany(initData.data);
    console.log("Initialize data");
};

initDB();