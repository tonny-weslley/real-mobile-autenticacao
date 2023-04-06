import React from "react";

export const currencyMask = (e) => {
    var value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d)(\d{2})$/, "$1,$2");
    value = value.replace(/(?=(\d{3})+(\D))\B/g, ".");
    e.target.value = value;
    return e;
};

export const arimeticaMask = (e) => {
    var value = e;
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d)(\d{2})$/, "$1,$2");
    value = value.replace(/(?=(\d{3})+(\D))\B/g, ".");
    if( value != ''){
        e = 'R$ ' + value;
    }else{
        e = value;
    }
    return e;
};

export const numericMask = (e) => {
    var value = e;
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d)(\d{3})$/, "$1.$2");
    if( value != ''){
        e = 'Km ' + value;
    }else{
        e = value;
    }
    return e;
};

export const cpfMask = (e) => {
    var value = e;
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e = value;
    return e;
};
