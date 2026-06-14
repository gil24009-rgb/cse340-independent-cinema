const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDateTime(value) {
  return value ? dateTimeFormatter.format(new Date(value)) : "Not available";
}

function formatStatus(status) {
  return typeof status === "string"
    ? status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
    : "Unknown";
}

export function showMemberAccount(req, res) {
  res.render("account/landing", {
    eyebrow: "Member account",
    heading: `Welcome, ${req.currentUser.first_name}.`,
    message: "Your bookings and screening history will appear here.",
    pageDescription: "View your cinema account and bookings.",
    pageTitle: "My Account",
  });
}

export function showStaffAccount(req, res) {
  res.render("account/landing", {
    eyebrow: "Staff operations",
    heading: `Welcome, ${req.currentUser.first_name}.`,
    message: "Today's screenings and booking operations will appear here.",
    pageDescription: "Access cinema staff operations.",
    pageTitle: "Staff",
  });
}

export function showOwnerAccount(req, res) {
  res.render("account/landing", {
    eyebrow: "Owner operations",
    heading: `Welcome, ${req.currentUser.first_name}.`,
    message: "Cinema management tools will appear here.",
    pageDescription: "Access cinema owner operations.",
    pageTitle: "Owner",
  });
}

export function showMemberBookingDetail(req, res) {
  res.render("account/booking-detail", {
    booking: {
      ...req.booking,
      bookedAtDisplay: formatDateTime(req.booking.booked_at),
      cancelledAtDisplay: req.booking.cancelled_at ? formatDateTime(req.booking.cancelled_at) : null,
      startsAtDisplay: formatDateTime(req.booking.starts_at),
      statusDisplay: formatStatus(req.booking.status),
    },
    pageDescription: "View a booking detail and verify ownership-protected access.",
    pageTitle: "Booking Detail",
  });
}

export function showMemberReviewDetail(req, res) {
  res.render("account/review-detail", {
    pageDescription: "View a review detail and verify ownership-protected access.",
    pageTitle: "Review Detail",
    review: {
      ...req.review,
      createdAtDisplay: formatDateTime(req.review.created_at),
      ratingDisplay: `${req.review.rating}/5`,
      visibilityDisplay: req.review.is_visible ? "Visible" : "Hidden",
    },
  });
}
