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
            // var batchGroupId  = "ticketDetalle";

            this.getView().setBusy(true);
            
            if (window.decodeURIComponent(sTicketPath).substr(1) === "") {
                
                /*var sModelName = "tickets";
                
                var oTicketsModel = this.oComponent.getModel(sModelName);
                var oListBindingContext  = oTicketsModel.bindList("/ticket", undefined, undefined, undefined, {
                    $expand: "ticketDetalle($expand=ticketstatus)",
                    $$updateGroupId: batchGroupId
                })*/
                
                
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
                        ticketstatus_ID: 1,
                        usuarioMod: "",
                        fechaCreacion: sDateCreation,
                        fechaMod: ""
                    }
                }
                
                // var oNewTicketContext = oListBindingContext.create(oTicketEntity);

                /*this.getView().unbindObject(sModelName);
                this.getView().setBindingContext(oNewTicketContext, sModelName);*/

                this.oComponent.getModel("ticketDetail").setData(oTicketEntity);
                this.getView().setBusy(false)
                this.onEdit();

                /*
                oTicketsModel.submitBatch(batchGroupId)
    
                    .then((oRes) => {
                        this.onEdit();
                        this.getView().setBusy(false)
                        this.oComponent.getModel(sModelName).refresh();
                    })

                    .catch((oErr) => {
                        console.error(oErr);
                    });
                */

                // this.createTicket(oTicketEntity, batchGroupId);
            }

            
            else {

                // this.getView().bindElement({
                //     path: `/ticket(${decodeURIComponent(sTicketPath)})`,
                //     model: "tickets",
                //     parameters: {
                //         expand: "{ticketDetalle},{ticketstatus}",
                //         $$updateGroupId: batchGroupId
                //     },
                //     events: {
                //         dataReceived: function() {
                //             this.getView().setBusy(false);
                //         }.bind(this)
                //     }
                // });

                const URL = `${this.getBaseURL()}/ticketDB/ticket(${decodeURIComponent(sTicketPath)})?$expand=ticketDetalle($expand=ticketstatus)`;
                const METHOD = "GET";

                var settings = { 
                    "url": URL, 
                    "method": METHOD, 
                    "timeout": 0, 
                    "headers": { 
                        "Content-Type": "application/json"
                    }
                }

                $.ajax(settings)
                
                    .done((response) => { 
                        var oDetailModel = this.oComponent.getModel("ticketDetail");
                        oDetailModel.setData(response); 
                        this.getView().unbindElement("ticketDetail");
                        this.getView().bindElement({
                            path: '/',
                            model: 'ticketDetail'
                        });
                        this.getView().setBusy(false);
                    })

                    .fail((error) => {
                        console.error(`Error | Status: ${error.status} | Message: ${error.statusText}`);
                    })

                    this.onDisplay();
            }

        },

        createTicket : async function(oTicketEntity) {
            /*
            const URL = "/ticketDB/ticket"
            const options = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': 'https://ff6b5921trial-dev-tickettrial-srv.cfapps.us10-001.hana.ondemand.com',
                },
                body: JSON.stringify(oTicketEntity)
            }*/

            // Fetch retorna una "Promise" (sin "async await")
            // Se ejecuta de forma "asíncrona". Es decir, se sigue con el resto del codigo, mientras el proceso corre en segundo plano.
            // Una vez se tiene la "response", se ejecutan los meodtodos "resolve" (then(res)) y "reject" (catch(err))
            /*
            let promise = fetch(URL, options);

            promise.then((response) => {
                this.onEdit();
                this.getView().setBusy(false)
                this.oComponent.getModel("tickets").refresh();
                debugger;
            })

            promise.catch((err) => {
                console.error(err);
            });
            */

            // "Async Await" ejecuta codigo hasta encontrarse con la expresion await.
            // Luego, el flujo de instrucciones queda en "espera", dado que la funcion asincrona no se ha completado.
            // Mientras tanto, se continua con la ejecucion del programa.
            // Una vez se recibe la "respuesta" de la "promesa" (es decir, resultado del resolve() o reject()), se continua con el flujo siguiente a la expresion "await".

            /*
            let response = await fetch(URL, options);
            if (response.ok) {
                this.onEdit();
                this.getView().setBusy(false)
                this.oComponent.getModel("tickets").refresh();
                // console.log("Response has been received")
                // console.log("Ticket response: " + response.json());
            }
            else {
                console.error(`Error | Status: ${response.status} | Message: ${response.statusText}`);
            }*/
            
            const URL = this.getBaseURL() + "/ticketDB/ticket";
            const METHOD = "POST";

            var settings = { 
                "url": URL, 
                "method": METHOD, 
                "timeout": 0, 
                "headers": { 
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(oTicketEntity)
            }

            $.ajax(settings)

                .done(response => {

                    console.log(response);
                    console.log("Ticket has been submitted!");
                    
                    this.getView().setBusy(false);
                    this.oComponent.getModel("tickets").refresh();

                    var sHash = this.oRouter.getHashChanger().getHash();
                    var aSplitedHash = sHash.split("/");
                    var sCod = aSplitedHash[1];
                    
                    if (window.decodeURIComponent(sCod) === "/") {
                        this.oRouter.navTo("ticketDetail", {
                            path: window.encodeURIComponent(response.ID)
                        });
                    }

                    this.onDisplay();
                })

                .fail(error => {
                    console.error(`Error | Status: ${error.status} | Message: ${error.statusText}`);
                })
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
            
            // var oBindingContext = this.getView().getBindingContext("tickets");
            // oBindingContext.setProperty("ticketDetalle/fechaMod", sDate);

            var oDetailModel = this.oComponent.getModel("ticketDetail");
            oDetailModel.setProperty("/ticketDetalle/fechaMod", sDate);

            // var oTicketsModel = this.oComponent.getModel("tickets");
            // var bHasChanged = oTicketsModel.hasPendingChanges("ticketDetalle");

            /*if (bHasChanged) {

                oTicketsModel.submitBatch("ticketDetalle")

                    .then((result) => {

                        this.oComponent.getModel("tickets").refresh();
                        this.getView().setBusy(false);
                        oBindingContext.refresh();
                        // this._onExitToolbar();

                        var sHash = this.oRouter.getHashChanger().getHash();
                        var aSplitedHash = sHash.split("/");
                        var sCod = aSplitedHash[1];
                        
                        if (window.decodeURIComponent(sCod) === "/") {

                            var oDetailModel = this.oComponent.getModel("ticketDetail");
                            var oTicketData = oDetailModel.getObject();

                            this.oRouter.navTo("ticketDetail", {
                                path: window.encodeURIComponent(oTicketData.ID)
                            });
                        }
                        
                        this.onDisplay();
                    })

                    .catch((err) => {});
            }*/

            //  Ver si hay cambios o no.
            //      NO ... Avisar y continuar
            //      SI ... Crear
            // application/json-patch+json

            var sHash = this.oRouter.getHashChanger().getHash();
            var aSplitedHash = sHash.split("/");
            var sCod = aSplitedHash[1];
                        
            if (window.decodeURIComponent(sCod) === "/") {

                var oTicketDetail = {
                    cuit: oDetailModel.getProperty("/cuit"),
                    archivo: "",
                    usuarioCreador: oDetailModel.getProperty("/usuarioCreador"),
                    ticketDetalle: {
                        nombre: oDetailModel.getProperty("/ticketDetalle/nombre"),
                        total: parseFloat(oDetailModel.getProperty("/ticketDetalle/total")),
                        fecha: new Date().toISOString().substring(0,10),
                        titulo: oDetailModel.getProperty("/ticketDetalle/titulo"),
                        description: oDetailModel.getProperty("/ticketDetalle/description"),
                        ticketstatus_ID: parseInt(oDetailModel.getProperty("/ticketDetalle/ticketstatus_ID")),
                        usuarioMod: oDetailModel.getProperty("/usuarioCreador"),
                        fechaCreacion: sDate,
                        fechaMod: null
                    }
                }

                this.createTicket(oTicketDetail);
            }

            else {

                var oBindingContext = this.getView().getBindingContext("ticketDetail");
                var oEditedTicket = oBindingContext.getObject();

                const URL = `${this.getBaseURL()}/ticketDB/ticket(${oEditedTicket.ID})`;
                const METHOD = "PATCH";

                var oEditedTicket = {
                    cuit: oDetailModel.getProperty("/cuit"),
                    archivo: oDetailModel.getProperty("/archivo"),
                    usuarioCreador: oDetailModel.getProperty("/usuarioCreador"),
                    ticketDetalle: {
                        nombre: oDetailModel.getProperty("/ticketDetalle/nombre"),
                        total: parseFloat(oDetailModel.getProperty("/ticketDetalle/total")),
                        fecha: oDetailModel.getProperty("/ticketDetalle/fecha"),
                        titulo: oDetailModel.getProperty("/ticketDetalle/titulo"),
                        description: oDetailModel.getProperty("/ticketDetalle/description"),
                        ticketstatus_ID: parseInt(oDetailModel.getProperty("/ticketDetalle/ticketstatus_ID")),
                        usuarioMod: oDetailModel.getProperty("/usuarioCreador"),
                        fechaCreacion: oDetailModel.getProperty("/ticketDetalle/fechaCreacion"),
                        fechaMod: sDate
                    }
                }

                var configs = {
                    "url" : URL,
                    "method" : METHOD,
                    "timeout" : 0,
                    "headers" : {
                        "Content-Type" : "application/json"
                    },
                    "data" : JSON.stringify(oEditedTicket)
                }

                $.ajax(configs)

                    .done(response => {
                        console.log(response)
                        console.log("Ticket has been updated!")
                        this.getView().setBusy(false);
                        this.oComponent.getModel("tickets").refresh();
                    })

                    .fail(error => {
                        console.error(`Error | Status: ${error.status} | Message: ${error.statusText}`);
                    })
            }
        },


        onCancelChanges : function() {
            // this.oComponent.getModel("tickets").resetChanges("ticketDetalle");
            // this._onExitToolbar();
            
            var sHash = this.oRouter.getHashChanger().getHash();
            var aSplitedHash = sHash.split("/");
            var sCod = aSplitedHash[1];
                        
            if (window.decodeURIComponent(sCod) === "/") {
                this.onBackList();
            }

            else {
                //  Ver si hay cambios o no.
                //      Si ... Reiniciar modelo
                //      NO ... Continuar
            }
            
            this.onDisplay();
        },

        _onExitToolbar : function() {

            
            // var sHash = this.oRouter.getHashChanger().getHash();
            // var aSplitedHash = sHash.split("/");
            // var sCod = aSplitedHash[1];
            
            // if (window.decodeURIComponent(sCod) === "/") {

            //     var oDetailModel = this.oComponent.getModel("ticketDetail");
            //     var oTicketData = oDetailModel.getObject();

            //     this.oRouter.navTo("ticketDetail", {
            //         path: window.encodeURIComponent(oTicketData.ID)
            //     });
            // }
            
            // this.onDisplay();
        },



        onBackList : function() {
            
            // var oHistory = History.getInstance();
            // var sPreviousHash = oHistory.getPreviousHash();

            this.oRouter.navTo("ticketList", {}, true);
            this.oComponent.getModel("ticketDetail").setData({});
            this.oComponent.getModel("configs").setProperty("/app/layout", "OneColumn")
        },

        onFullScreen : function() {
            this.oComponent.getModel("configs").setProperty("/app/layout", "MidColumnFullScreen")
        },

        onExitFullScreen : function() {
            this.oComponent.getModel("configs").setProperty("/app/layout", "TwoColumnsMidExpanded")
        },


        getBaseURL: function () {

            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            
            return appModulePath;
        },

    });
});