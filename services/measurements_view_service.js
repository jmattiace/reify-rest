'use strict';

function getSelectedGenericSize (size) {
    switch (size) {
        case 'S': return { is_small: true };
        case 'M': return { is_medium: true };
        case 'L': return { is_large: true };
        case 'XL': return { is_xlarge: true };
        case 'XXL': return { is_xxlarge: true };
        default: return { is_small: true };
    }
}

function getPreferredShirtFit (preferredFit) {
    switch (preferredFit) {
        case 'classic': return { is_classic: true };
        case 'regular': return { is_regular: true };
        case 'trim': return { is_trim: true };
        case 'xtrim': return { is_xtrim: true };
        default: return { is_classic: true };
    }
}

function getPreferredBrandSize (preferredBrand, preferredSize) {
    if (preferredBrand === 'jcrew') {
        switch (preferredSize) {
            case 'small': return { is_jcrew_small: true };
            case 'medium': return { is_jcrew_medium: true };
            case 'large': return { is_jcrew_large: true };
            case 'xlarge': return { is_jcrew_xlarge: true };
            case 'xxlarge': return { is_jcrew_xxlarge: true };
            default: return { is_jcrew_small: true };
        }
    } else if (preferredBrand === 'br') {
        switch (preferredSize) {
            case 'small': return { is_br_small: true };
            case 'medium': return { is_br_medium: true };
            case 'large': return { is_br_large: true };
            case 'xlarge': return { is_br_xlarge: true };
            case 'xxlarge': return { is_br_xxlarge: true };
            default: return { is_br_small: true };
        }
    } else if (preferredBrand === 'monaco') {
        switch (preferredSize) {
            case 'small': return { is_monaco_small: true };
            case 'medium': return { is_monaco_medium: true };
            case 'large': return { is_monaco_large: true };
            case 'xlarge': return { is_monaco_xlarge: true };
            case 'xxlarge': return { is_monaco_xxlarge: true };
            default: return { is_monaco_small: true };
        }
    } else if (preferredBrand === 'uniqlo') {
        switch (preferredSize) {
            case 'small': return { is_uniqlo_small: true };
            case 'medium': return { is_uniqlo_medium: true };
            case 'large': return { is_uniqlo_large: true };
            case 'xlarge': return { is_uniqlo_xlarge: true };
            case 'xxlarge': return { is_uniqlo_xxlarge: true };
            default: return { is_uniqlo_small: true };
        }
    } else if (preferredBrand === 'levis') {
        switch (preferredSize) {
            case 'small': return { is_levis_small: true };
            case 'medium': return { is_levis_medium: true };
            case 'large': return { is_levis_large: true };
            case 'xlarge': return { is_levis_xlarge: true };
            case 'xxlarge': return { is_levis_xxlarge: true };
            default: return { is_levis_small: true };
        }
    }
}

function getOneInchRangePreference (preference) {
    switch (preference) {
        case '-1': return { is_minus_one: true };
        case '-0.5': return { is_minus_half: true };
        case '0': return { is_same: true };
        case '0.5': return { is_plus_half: true };
        case '1': return { is_plus_one: true };
        default: return { is_same: true };
    }
}

function getTwoInchRangePreference (preference) {
    switch (preference) {
        case '-2': return { is_minus_two: true };
        case '-1': return { is_minus_one: true };
        case '0': return { is_same: true };
        case '1': return { is_plus_one: true };
        case '2': return { is_plus_two: true };
        default: return { is_same: true };
    }
}

function getPreferredPantFit (preferredFit) {
    switch (preferredFit) {
        case 'relaxed': return { is_relaxed: true };
        case 'straight': return { is_straight: true };
        case 'slim': return { is_slim: true };
        case 'skinny': return { is_skinny: true };
        default: return { is_relaxed: true };
    }
}

module.exports = {
    name: 'MeasurementsViewService',
    getSelectedGenericSize: getSelectedGenericSize,
    getPreferredShirtFit: getPreferredShirtFit,
    getPreferredBrandSize: getPreferredBrandSize,
    getOneInchRangePreference: getOneInchRangePreference,
    getTwoInchRangePreference: getTwoInchRangePreference,
    getPreferredPantFit: getPreferredPantFit
};