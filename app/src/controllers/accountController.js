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
