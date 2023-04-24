sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "../model/formatter"

], function(Controller, History, formatter) {
    'use strict';
    
    return Controller.extend("hexagon.ticketapptestmatibtp.controller.TicketDetail", {

        formatter : formatter,

        onInit : function() {

            this.oComponent = this.getOwnerComponent();            
            this.oRouter = this.oComponent.getRouter();

            this.oRouter.getRoute("ticketDetail").attachPatternMatched(this._onRouteMatched, this);
        },


        _onRouteMatched : function(oEvent) {

            var sTicketPath = oEvent.getParameter("arguments").path;
            var batchGroupId  = "ticketDetalle";

            this.getView().setBusy(true);
            
            if (window.decodeURIComponent(sTicketPath).substr(1) === "") {

                // Si ya tengo un listBinding, por qué crear otro?
                // Se sobreescribe el primero? Se crea y luego se borra?
                // Crea un contexto o le asigna un contexto al modelo?
                
                var sModelName = "tickets";
                var oTicketsModel = this.oComponent.getModel(sModelName);
                var oListBindingContext  = oTicketsModel.bindList("/ticket", undefined, undefined, undefined, {
                        $expand: "ticketDetalle($expand=ticketstatus)",
                        $$updateGroupId: batchGroupId
                });

                var sDateToday = new Date().toISOString().substring(0,10);
                var sDateCreation = new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString();
                
                var oTicketEntity = {
                    cuit: "",
                    archivo: "",
                    usuarioCreador: "",
                    ticketDetalle: {
                        nombre: "Sin nombre",
                        total: 0.0,
                        fecha: sDateToday,
                        titulo: "Sin Titulo",
                        description: "",
                        usuarioMod: "",
                        fechaCreacion: sDateCreation,
                        fechaMod: null,
                        ticketstatus: {
                            ID: 14,
                            estado: "Created" 
                        }
                    }
                }

                var oNewTicketContext = oListBindingContext.create(oTicketEntity);

                this.getView().unbindObject(sModelName);
                this.getView().setBindingContext(oNewTicketContext, sModelName);
            
                oTicketsModel.submitBatch(batchGroupId)
    
                    .then((oRes) => {
                        this.onEdit();
                        this.getView().setBusy(false)
                        this.oComponent.getModel(sModelName).refresh();
                    })

                    .catch((oErr) => {
                        console.error(oErr);
                    });
            }

            
            else {
                this.getView().bindElement({
                    path: `/ticket(${decodeURIComponent(sTicketPath)})`,
                    model: "tickets",
                    parameters: {
                        expand: "{ticketDetalle},{ticketstatus}",
                        $$updateGroupId: batchGroupId
                    },
                    events: {
                        dataReceived: function() {
                            this.getView().setBusy(false);
                        }.bind(this)
                    }
                });
            }

            var oDetailPage = this.getView().byId("detailPage");
            oDetailPage.setShowFooter(false);
            
            this.oComponent.getModel("configs").setProperty("/ticketDetail/editMode", false);
        },


        onEdit : function() {
            this.oComponent.getModel("configs").setProperty("/ticketDetail/editMode", true);
            var oDetailPage = this.getView().byId("detailPage");
            oDetailPage.setShowFooter(true);
        },


        onDisplay : function() {
            this.oComponent.getModel("configs").setProperty("/ticketDetail/editMode", false);
            var oDetailPage = this.getView().byId("detailPage");
            oDetailPage.setShowFooter(false);
        },


        onSaveChanges : function() {

            this.getView().setBusy(true);

            var oDetailPage = this.getView().byId("detailPage");
            oDetailPage.setShowFooter(false);

            var sDate = new Date(
                new Date().toString().split('GMT')[0]+' UTC'
            ).toISOString();

            var oBindingContext = this.getView().getBindingContext("tickets");
            oBindingContext.setProperty("ticketDetalle/fechaMod", sDate);

            var oTicketsModel = this.oComponent.getModel("tickets");
            var bHasChanged = oTicketsModel.hasPendingChanges("ticketDetalle");

            if (bHasChanged) {

                oTicketsModel.submitBatch("ticketDetalle")

                    .then((result) => {
                        this.oComponent.getModel("tickets").refresh();
                        this.getView().setBusy(false);
                        oBindingContext.refresh();
                        this._onExitToolbar();
                    })

                    .catch((err) => {});
            }
        },


        onCancelChanges : function() {
            this.oComponent.getModel("tickets").resetChanges("ticketDetalle");
            this._onExitToolbar();
        },

        _onExitToolbar : function() {

            var oTicketContext = this.getView().getBindingContext("tickets");

            var sHash = this.oRouter.getHashChanger().getHash();
            var aSplitedHash = sHash.split("/");
            var sCod = aSplitedHash[1];
            
            if (window.decodeURIComponent(sCod) === "/") {
                this.oRouter.navTo("ticketDetail", {
                    path: window.encodeURIComponent(oTicketContext.getObject().ID)
                });
            }
            
            this.onDisplay();
        },



        onBackList : function() {
            
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            }

            else {
                this.oRouter.navTo("ticketList", {}, true);
            }

            this.oComponent.getModel("configs").setProperty("/app/layout", "OneColumn")
        },

        onFullScreen : function() {
            this.oComponent.getModel("configs").setProperty("/app/layout", "MidColumnFullScreen")
        },

        onExitFullScreen : function() {
            this.oComponent.getModel("configs").setProperty("/app/layout", "TwoColumnsMidExpanded")
        }

    });
});