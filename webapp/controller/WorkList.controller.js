sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"

], function(Controller, Filter, FilterOperator, MessageToast) {
    'use strict';
    
    return Controller.extend("hexagon.ticketapptestmatibtp.controller.WorkList", {

        onInit : function() {

            this.oComponent = this.getOwnerComponent();
            this.oRouter = this.oComponent.getRouter();
            this.oView = this.getView();
            
            this.fetchTicketsData();
        },


        fetchTicketsData : function(aFilters = []) {

            var oTicketsTable = this.oView.byId("ticketsTable");
            var oTicketTemplate = this.oView.byId("ticketTemplate");

            oTicketsTable.bindAggregation("items", {

                path: "tickets>/ticket",
                template: oTicketTemplate,
                templateShareable: true,
                filters: aFilters,

                parameters: {
                    expand: "{ticketDetalle},{ticketstatus}"
                },
                // events: {
                //     dataReceived: function(data) {
                //     }.bind(this)
                // }
            });
        },



        onFilterSearch : function() {

            var sCuit = this.oComponent.getModel("configs").getProperty("/ticketList/queryCuit");
            var sId = this.oComponent.getModel("configs").getProperty("/ticketList/queryId");

            var aFilters = [];     
            if (sCuit !== "") {
                aFilters.push(new Filter("cuit", FilterOperator.EQ, sCuit));
            }
            if (sId !== "") {
                aFilters.push(new Filter("ID", FilterOperator.EQ, sId));
            }

            this.filterTickets(new Filter(aFilters, true));
        },


        filterTickets : function(aFilter = []) {

            var oTicketsTable = this.oView.byId("ticketsTable");
            oTicketsTable.getBinding("items").filter(aFilter);
        },


        resetFields : function () {

            this.oComponent.getModel("configs").setProperty("/ticketList/queryCuit", "");
            this.oComponent.getModel("configs").setProperty("/ticketList/queryId", "");
            this.onFilterSearch();
        },


        onSeeDetail : function(oControlEvent) {
            
            var oTicket = oControlEvent.getSource();
            var sTicketPath = oTicket.getBindingContext("tickets").getProperty("ID")

            this.oRouter.navTo("ticketDetail", {
                path: window.encodeURIComponent(sTicketPath)
            });
            
            this.oComponent.getModel("configs").setProperty("/app/layout", "TwoColumnsMidExpanded");
        },


        toggleFilters : function () {
            var bShowFilters = this.oComponent.getModel("configs").getProperty("/ticketList/showFilters");
            this.oComponent.getModel("configs").setProperty("/ticketList/showFilters", !bShowFilters);
        },



        onSelectTab : function(oControlEvent) {

            var sKey = oControlEvent.getParameter("selectedKey");
            
            var aFilter = null;

            var sPropPath = "ticketDetalle/ticketstatus_ID";
            var eOperator = FilterOperator.EQ;
            
            switch (sKey) {

                case "approved":
                    aFilter = new Filter(sPropPath, eOperator, 2);
                break;
                    
                case "inCourse":
                    var oFilterPending = new Filter(sPropPath, eOperator, 1);
                    var oFilterPendingTreatment = new Filter(sPropPath, eOperator, 8);
                    var oFilterPendingApproval = new Filter(sPropPath, eOperator, 7);
                    aFilter = new Filter([oFilterPending, oFilterPendingApproval, oFilterPendingTreatment], false);
                break;
                    
                case "negative":
                    var oFilterCancelled = new Filter(sPropPath, eOperator, 5);
                    var oFilterInvalid = new Filter(sPropPath, eOperator, 6);
                    var oFilterRejected = new Filter(sPropPath, eOperator, 3);
                    aFilter = new Filter([oFilterCancelled, oFilterInvalid, oFilterRejected], false);
                break;
            
                default:
                    aFilter = [];
                break;
                }

                var oListView = this.oView.byId("ticketsTable");
                oListView.getBinding("items").filter(aFilter);
        },

        onCreateTicket : function() {
            MessageToast.show("Ticket has been created successfully!")
        }

    });
});