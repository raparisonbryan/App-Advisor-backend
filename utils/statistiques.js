const avisModel = require("../Models/Avis");
const outilModel = require("../Models/Outil");

const calculerMoyennesOutil = async (outilId) => {
    try {
        const avisOutil = await avisModel.find({ outils: outilId });

        if (avisOutil.length === 0) {
            await outilModel.findByIdAndUpdate(outilId, {
                moyenneNote: 0,
                moyenneDifficulte: 0,
                moyennePerformance: 0,
                moyenneFlexibilite: 0,
                nombreAvis: 0
            });
            return;
        }

        const totaux = avisOutil.reduce((acc, avis) => {
            acc.note += avis.note || 0;
            acc.difficulte += avis.difficulte || 0;
            acc.performance += avis.performance || 0;
            acc.flexibilite += avis.flexibilite || 0;
            return acc;
        }, { note: 0, difficulte: 0, performance: 0, flexibilite: 0 });

        const nombreAvis = avisOutil.length;

        await outilModel.findByIdAndUpdate(outilId, {
            moyenneNote: Math.round((totaux.note / nombreAvis) * 100) / 100,
            moyenneDifficulte: Math.round((totaux.difficulte / nombreAvis) * 100) / 100,
            moyennePerformance: Math.round((totaux.performance / nombreAvis) * 100) / 100,
            moyenneFlexibilite: Math.round((totaux.flexibilite / nombreAvis) * 100) / 100,
            nombreAvis: nombreAvis
        });

    } catch (error) {
        console.error("Erreur lors du calcul des moyennes:", error);
        throw error;
    }
};

module.exports = { calculerMoyennesOutil };