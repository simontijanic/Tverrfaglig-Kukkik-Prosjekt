exports.generateOwnerCode = (userUuid) => {
    return userUuid.substring(0, 4).toUpperCase();
}

/**
 * Genererer en flokkserie for en ny flokk basert på eierens kode og antall eksisterende flokker.
 * @param {string} ownerCode - Eierkode, f.eks. "A1B2"
 * @param {number} currentHerdCount - Antall flokker for eieren før opprettelsen.
 * @returns {string} - Eksempel: "A1B2-03" for den tredje flokken.
 */
exports.generateHerdSeries = (ownerCode, currentHerdCount) => {
    const herdNumber = (currentHerdCount + 1).toString().padStart(2, '0');
    return `${ownerCode}-${herdNumber}`;  
}

/**
 * Genererer et individuelt reinsdyrs serienummer basert på flokkserien og antall reinsdyr i flokken.
 * @param {string} herdSeries - Flokkserie, f.eks. "A1B2-03"
 * @param {number} currentReindeerCount - Antall reinsdyr i flokken før opprettelsen.
 * @returns {string} - Eksempel: "A1B2-03-0001" for det første reinsdyret.
 */
exports.generateReindeerSerial = (herdSeries, currentReindeerCount) => {
    const reindeerNumber = (currentReindeerCount + 1).toString().padStart(4, '0');
    return `${herdSeries}-${reindeerNumber}`;  
}
