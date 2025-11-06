/**
 * Validate BON DE COULAGE request
 */
exports.validateBonRequest = (req, res, next) => {
    console.log(req.body);

    const { file, att_reference, reference_2, date, proprietaire, projet, adresse ,documentType} = req.body;
     
    const errors = [];
    // TODO FIX IT 
    // if(documentType==='BCLG' && !file ) {
    //     errors.push('etage est requis')
    // };

    if(documentType==='ATT' && (!date || !att_reference)  ){ errors.push('date est requis')};


    // Required fields
    // if (!reference) errors.push('reference est requis');
    if (!reference_2) errors.push('reference_2 est requis');
    if (!proprietaire) errors.push('proprietaire est requis');
    if (!projet) errors.push('projet est requis');
    if (!adresse) errors.push('adresse est requis');
    
    // Validate date format (DD/MM/YYYY)
    // if (date && !/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    //     errors.push('date doit être au format DD/MM/YYYY');
    // }
    
    // Validate etage type
    // const validEtages = [
    //     'FONDATIONS',
    //     'PL.HT. S/SOL',
    //     'SOUPENTE',
    //     'PL.HT. R.D.CH',
    //     'PL.HT. 1° ETAGE',
    //     'PL.HT. 2° ETAGE',
    //     'PL.HT. 3° ETAGE'
    // ];
    
    // if (etage && !validEtages.some(valid => etage.toUpperCase().includes(valid.replace(/[°\s]/g, '')))) {
    //     errors.push(`etage doit être l'un des types valides: ${validEtages.join(', ')}`);
    // }
    
    // Validate notes (if provided)
    if (req.body.notes && !Array.isArray(req.body.notes)) {
        errors.push('notes doit être un tableau de strings');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation échouée',
            details: errors
        });
    }
    
    next();
};

/**
 * Validate template type parameter
 */
exports.validateTemplateType = (req, res, next) => {
    const { type } = req.params;
    
    const validTypes = ['FONDATIONS', 'SSOL', 'SOUPENTE', 'RDCH', 'ETAGE1', 'ETAGE2', 'ETAGE3'];
    
    if (!validTypes.includes(type.toUpperCase())) {
        return res.status(400).json({
            error: 'Type de template invalide',
            valid_types: validTypes
        });
    }
    
    next();
};