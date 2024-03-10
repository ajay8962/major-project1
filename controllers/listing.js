const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async(req,res)=>{
    const allListing=await Listing.find({});
    res.render("listing/index.ejs",{allListing});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listing/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"review",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exit!");
        res.redirect("/listing");
    }
    res.render("listing/show.ejs",{listing});
};

module.exports.createListing=async(req,res,next)=>{
   let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

   let url=req.file.path;
   let filename=req.file.filename;

   const newListing=new Listing(req.body.listing);
   newListing.owner=req.user._id;
   newListing.image={url,filename};

   newListing.geometry=response.body.features[0].geometry;

   await newListing.save();
   req.flash("success", "New Listing Created!");
   res.redirect("/listing");
};

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exit!");
        res.redirect("/listing");
    };
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_200");
    res.render("listing/edit.ejs", { listing ,originalImageUrl});
};

module.exports.updateListing=async (req, res) => {
    if(!req.body.listing){
        throw new expressError(400,"Send valid data for listing");
    }
    let { id } = req.params;
    let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listing/${id}`);
};

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
};