function createNotFoundError(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

export function createOwnedResourceLoader(options) {
  const {
    findResourceById,
    ownerField = "user_id",
    paramName,
    requestKey,
    resourceLabel = "Resource",
  } = options;

  return async function loadOwnedResource(req, res, next) {
    const rawId = req.params?.[paramName];
    const resourceId = Number(rawId);

    if (!Number.isInteger(resourceId) || resourceId < 1) {
      return next(createNotFoundError(`${resourceLabel} not found.`));
    }

    try {
      const resource = await findResourceById(resourceId);

      if (!resource || resource[ownerField] !== req.currentUser.user_id) {
        return next(createNotFoundError(`${resourceLabel} not found.`));
      }

      req[requestKey] = resource;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
