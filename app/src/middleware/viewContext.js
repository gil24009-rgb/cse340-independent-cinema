import { env } from "../config/env.js";

const publicNavigation = [
  { href: "/", label: "Now Showing", match: (path) => path === "/" },
  { href: "/films", label: "Films", match: (path) => path.startsWith("/films") },
  { href: "/screenings", label: "Screenings", match: (path) => path.startsWith("/screenings") },
  { href: "/visit", label: "Visit", match: (path) => path.startsWith("/visit") },
];

const roleDestinations = {
  member: { href: "/account", label: "My Bookings" },
  owner: { href: "/admin", label: "Admin" },
  staff: { href: "/staff", label: "Staff" },
};

export function buildNavigation(currentPath, currentUser = null) {
  const primary = publicNavigation.map((item) => ({
    active: item.match(currentPath),
    href: item.href,
    label: item.label,
  }));

  const accountDestination = currentUser
    ? roleDestinations[currentUser.role] || roleDestinations.member
    : { href: "/login", label: "Sign In" };

  return {
    account: {
      ...accountDestination,
      active: currentPath === accountDestination.href
        || currentPath.startsWith(`${accountDestination.href}/`),
    },
    primary,
  };
}

export function addViewContext(req, res, next) {
  const currentUser = req.currentUser || null;

  res.locals.currentPath = req.path;
  res.locals.currentUser = currentUser;
  res.locals.environment = env.nodeEnv;
  res.locals.navigation = buildNavigation(req.path, currentUser);
  res.locals.year = new Date().getFullYear();
  next();
}
