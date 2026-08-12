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
    const coords = (listing.coordinates && listing.coordinates.lat != null && listing.coordinates.lng != null)
        ? [listing.coordinates.lat, listing.coordinates.lng]
        : [28.6139, 77.2090];
    res.render("listings/show", {
        listing,
        coordinates: coords
    });

}

module.exports.createListing = async (req, res, next) => {
    let url = req.file ? req.file.path : "https://images.unsplash.com/photo-1501785888041-af3ef285b470";
    let filename = req.file ? req.file.filename : "listingimage";

    const newListing = new Listing(req.body.listing);

    newListing.image = { url, filename };
    newListing.owner = req.user._id;

    //convert location → coordinates
    let location = req.body.listing.location;

    try {
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
            if (data && data.length > 0) {
                newListing.coordinates = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            } else {
                newListing.coordinates = { lat: 28.6139, lng: 77.2090 };
            }
        } else {
            newListing.coordinates = { lat: 28.6139, lng: 77.2090 };
        }
    } catch (err) {
        console.log("Geocoding error:", err.message);
        newListing.coordinates = { lat: 28.6139, lng: 77.2090 };
    }

    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let originalImageUrl = (listing.image && listing.image.url) ? listing.image.url : "";
    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing },{ new: true });
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let location = req.body.listing.location;

    if (location) {
        try {
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
                if (data && data.length > 0) {
                    listing.coordinates = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    };
                }
            }
        } catch (err) {
            console.log("Geocoding update error:", err.message);
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