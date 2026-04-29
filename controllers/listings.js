const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    // res.render("listings/show", { listing });
    res.render("listings/show", {
        listing,
        coordinates: [
            listing.coordinates.lat,
            listing.coordinates.lng
        ]
    });

}

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.image = { url, filename };
    newListing.owner = req.user._id;

    //convert location → coordinates
    let location = req.body.listing.location;

    // delay to avoid blocking
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`,
        {
            headers: {
                "User-Agent": "WanderlustApp/1.0 (chetnasiya80@gmail.com)",
                "Accept": "application/json"
            }
        }
    );

    console.log("Status:", response.status);

    if (!response.ok) {
        req.flash("error", "Location fetch failed");
        return res.redirect("/listings/new");
    }

    let data = await response.json();

    // safety check
    // console.log(data);
    if (!data || data.length === 0) {
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }

    newListing.coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };
    // console.log(typeof fetch);  

    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing },{ new: true });

    // 🟢 NEW CODE: update coordinates when location changes
    let location = req.body.listing.location;

    // delay to avoid blocking
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`,
        {
            headers: {
                "User-Agent": "WanderlustApp/1.0 (chetnasiya80@gmail.com)",
                "Accept": "application/json"
            }
        }
    );

    if (response.ok) {
        let data = await response.json();

        if (data.length > 0) {
            listing.coordinates = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    }

    // image update (already correct)
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
}