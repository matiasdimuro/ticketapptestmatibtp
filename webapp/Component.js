/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "hexagon/ticketapptestmatibtp/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("hexagon.ticketapptestmatibtp.Component", {
            
            metadata: {
                manifest: "json"
            },

            init: function () {

                UIComponent.prototype.init.apply(this, arguments);

                this.getRouter().initialize();
                this.getRouter().navTo("ticketList", {}, true);
                
                var oModel = {
                    app : {
                        layout : "OneColumn",
                    },
                    ticketList: {
                        showFilters: true,
                        queryTitulo : "",
                        queryId : "",
                        orderDesc: true,
                        queryEstado: "all"
                    },
                    ticketDetail: {
                        editMode: false
                    }
                }
    
                this.getModel("configs").setData(oModel);
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);