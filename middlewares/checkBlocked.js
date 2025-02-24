const checkBlocked = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.isBlocked) {
        return res.status(403).json({ message: "Votre compte est bloqué. Contactez l'administrateur." });
    }
    
    next(); // Continuer si l'utilisateur n'est pas bloqué
};
