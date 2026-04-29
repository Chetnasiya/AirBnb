module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

// wrapAsync(async (req,res,next)=>{
//         const newListing=  new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
//     })