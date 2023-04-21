sap.ui.define([

], function() {
    'use strict';
    
    return {

        estado : function(sEstado) {

            var positives = ["Approved"];
            var pendings  = ["Pending", "Pending approval", "Pending treatment"];
            var negatives  = ["Rejected", "Invalid", "Cancelled"];

            if (positives.includes(sEstado)) {
                return "Success";
            } 
            else if (pendings.includes(sEstado)) {
                return "Warning"
            }
            else if (negatives.includes(sEstado)) {
                return "Error"
            }
            return "None";
        }

    }
});