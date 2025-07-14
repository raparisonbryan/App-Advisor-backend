const avisModel = require("../Models/Avis");

const cleanupOrphanedAvis = async () => {
    try {
        const orphanedAvis = await avisModel.find({
            outils: { $exists: true }
        }).populate('outils');

        const avisToDelete = orphanedAvis.filter(avis => !avis.outils);

        if (avisToDelete.length > 0) {
            const idsToDelete = avisToDelete.map(avis => avis._id);
            await avisModel.deleteMany({ _id: { $in: idsToDelete } });
            console.log(`${avisToDelete.length} avis orphelins supprimés`);
        }

        return { deletedCount: avisToDelete.length };
    } catch (error) {
        console.error("Erreur lors du nettoyage:", error);
        throw error;
    }
};

module.exports = { cleanupOrphanedAvis };