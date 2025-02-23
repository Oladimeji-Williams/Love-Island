// This assumes that there is an already existing authentication middleware named authMiddleware

router.delete("/delete-user", authMiddleware, deleteUser);
