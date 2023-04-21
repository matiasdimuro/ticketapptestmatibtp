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
            
            this.getView().bindElement({
                path: `/ticket(${decodeURIComponent(sTicketPath)})`,
                model: "tickets",
                parameters: {
                    expand: "{ticketDetalle},{ticketstatus}",
                    $$updateGroupId: "ticketDetalle"
                }
            });

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

                        this.onDisplay();
                        this.getView().setBusy(false);
                        
                        oBindingContext.refresh();
                        this.oComponent.getModel("tickets").refresh();
                    })

                    .catch((err) => {});
            }
        },


        onCancelChanges : function() {
            this.oComponent.getModel("tickets").resetChanges("ticketDetalle");
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