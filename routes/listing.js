const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require("multer");
const { cloudinary, storage } = require("../cloudConfig.js"); // Import Cloudinary and storage from cloudConfig.js
const upload = multer({ storage });
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding ({ accessToken: mapToken });


// Validate Listing Middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    console.error("Validation Error:", error);
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing Does Not Exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}));

// Create Route with File Upload
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res) => {
  let response = await geocodingClient.forwardGeocode({
    query :req.body.listing.location,
    limit:1,
  })
  .send();

  let url=req.file.path;
  let filename =req.file.filename;
  const newListing=new Listing(req.body.listing);
  newListing.owner=req.user._id;
  newListing.image={url,filename};
  newListing.geometry=response.body.features[0].geometry;
  let saveListing=await newListing.save();
  console.log(newListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}));
// Create Route with File Upload
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res) => {
 
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    }).send();
  
    let url = req.file.path;
    let filename = req.file.filename;
  
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {  url, filename };
    newListing.geometry= response.body.features[0].geometry;
   
    let saveListing=await newListing.save();
    console.log( saveListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  
}));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing Does Not Exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250"); // corrected the method name from 'replace' to 'replace'
  res.render("listings/edit.ejs", { listing , originalImageUrl });
}));


// Update Route
router.put("/:id", isLoggedIn,upload.single("listing[image]"), validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  let listing =  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  if(typeof req.file !=="undefined"){
    let url =req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

module.exports = router;
