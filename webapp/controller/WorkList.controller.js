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
                    expand: "{ticketDetalle},{ticketstatus}",
                    $$updateGroupId: "ticketList"
                },
                // events: {
                //     dataReceived: function(data) {
                //     }.bind(this)
                // }
            });
        },



        onFilterSearch : function() {

            var sTitulo = this.oComponent.getModel("configs").getProperty("/ticketList/queryTitulo");
            var sId = this.oComponent.getModel("configs").getProperty("/ticketList/queryId");
            var sTabKey = this.oComponent.getModel("configs").getProperty("/ticketList/queryEstado");

            var aFilters = [];  

            if (sTitulo !== "") {
                aFilters.push(new Filter("ticketDetalle/titulo", FilterOperator.EQ, sTitulo));
            }
            if (sId !== "") {
                aFilters.push(new Filter("ID", FilterOperator.EQ, sId));
            }

            if (sTabKey !== "all") {

                var sPropPath = "ticketDetalle/ticketstatus_ID";
                var eOperator = FilterOperator.EQ;

                var aFilterEstado = null;

                switch (sTabKey) {

                    case "approved":
                        aFilterEstado = new Filter(sPropPath, eOperator, 2);
                    break;
                        
                    case "inCourse":
                        var oFilterPending = new Filter(sPropPath, eOperator, 1);
                        var oFilterPendingTreatment = new Filter(sPropPath, eOperator, 8);
                        var oFilterPendingApproval = new Filter(sPropPath, eOperator, 7);
                        aFilterEstado = new Filter([oFilterPending, oFilterPendingApproval, oFilterPendingTreatment], false);
                        break;
                        
                    case "negative":
                        var oFilterCancelled = new Filter(sPropPath, eOperator, 5);
                        var oFilterInvalid = new Filter(sPropPath, eOperator, 6);
                        var oFilterRejected = new Filter(sPropPath, eOperator, 3);
                        aFilterEstado = new Filter([oFilterCancelled, oFilterInvalid, oFilterRejected], false);
                    break;
                
                    default:
                        aFilterEstado = [];
                    break;
                }

                aFilters.push(aFilterEstado);
            }

            this.filterTickets(new Filter(aFilters, true));
        },


        filterTickets : function(aFilter = []) {
            var oTicketsTable = this.oView.byId("ticketsTable");
            oTicketsTable.getBinding("items").filter(aFilter);
        },


        onSortByDate : function() {

            var bGroup = false;
            var bDescending = this.oComponent.getModel("configs").getProperty("/ticketList/orderDesc");
            var oSorter = new sap.ui.model.Sorter("ticketDetalle/fecha", bDescending, bGroup);

            var oTicketsTable = this.oView.byId("ticketsTable");
            oTicketsTable.getBinding("items").sort(oSorter);

            this.oComponent.getModel("configs").setProperty("/ticketList/orderDesc", !bDescending);
        },


        resetFields : function () {

            this.oComponent.getModel("configs").setProperty("/ticketList/queryTitulo", "");
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
                    this.oComponent.getModel("configs").setProperty("/ticketList/queryEstado", "approved")
                break;
                    
                case "inCourse":
                    var oFilterPending = new Filter(sPropPath, eOperator, 1);
                    var oFilterPendingTreatment = new Filter(sPropPath, eOperator, 8);
                    var oFilterPendingApproval = new Filter(sPropPath, eOperator, 7);
                    aFilter = new Filter([oFilterPending, oFilterPendingApproval, oFilterPendingTreatment], false);
                    this.oComponent.getModel("configs").setProperty("/ticketList/queryEstado", "inCourse")
                    break;
                    
                case "negative":
                    var oFilterCancelled = new Filter(sPropPath, eOperator, 5);
                    var oFilterInvalid = new Filter(sPropPath, eOperator, 6);
                    var oFilterRejected = new Filter(sPropPath, eOperator, 3);
                    aFilter = new Filter([oFilterCancelled, oFilterInvalid, oFilterRejected], false);
                    this.oComponent.getModel("configs").setProperty("/ticketList/queryEstado", "negative")
                break;
            
                default:
                    aFilter = [];
                    this.oComponent.getModel("configs").setProperty("/ticketList/queryEstado", "all")
                break;
            }

                
                var oListView = this.oView.byId("ticketsTable");
                oListView.getBinding("items").filter(aFilter);
        },


        onCreateTicket : function() {

            // this.oView.setBusy(true);
            
            // var oTicketsTable = this.oView.byId("ticketsTable");
            // var oListBinding = oTicketsTable.getBinding("items");
            // var oTicketsModel = oListBinding.getModel();

            // var sDateToday = new Date().toISOString().substring(0,10);
            // var sDateCreation = new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString();

            // var oNewTicket = oListBinding.create({
            //     cuit: "777",
            //     archivo: "",
            //     usuarioCreador: "",
            //     ticketDetalle: {
            //         nombre: "Sin nombre",
            //         total: 0.0,
            //         fecha: sDateToday,
            //         titulo: "Sin Titulo",
            //         description: "",
            //         usuarioMod: "",
            //         fechaCreacion: sDateCreation,
            //         fechaMod: null,
            //         ticketstatus: {
            //             ID: 1,
            //             estado: "Pending" 
            //         }
            //     }
            // })

            // var sUpdateGroupId = "ticketList";
            
            // oTicketsModel.submitBatch(sUpdateGroupId)

            //     .then((oRes) => {
            //         this.oView.setBusy(false);
            //         this.oRouter.navTo("ticketDetail", {
            //             path: window.encodeURIComponent(oNewTicket.getObject().ID)
            //         });
            //         MessageToast.show("Ticket has been created successfully!");
            //         this.oComponent.getModel("configs").setProperty("/app/layout", "TwoColumnsMidExpanded");
            //     })

            //     .catch((oErr) => {
            //         console.error(oErr);
            //     });

            this.oRouter.navTo("ticketDetail", {
                path: window.encodeURIComponent("/")
            });

            this.oComponent.getModel("configs").setProperty("/app/layout", "TwoColumnsMidExpanded");
        }

    });
});