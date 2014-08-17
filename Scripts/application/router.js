var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Application;
(function (Application) {
    var $ = jQuery;
    var Router = (function (_super) {
        __extends(Router, _super);
        function Router() {
            _super.apply(this, arguments);

        }
        //Router.prototype.report = function () {
        //    this.activate(this.reportView, 'report');
        //};
        Router.prototype.home = function () {
            if (sessionStorage.getItem('userData') !== null) {
                this.activate(this.homeView, 'home');

                document.getElementById("btnLogOff").style.display = 'block';
            }
            else {
                this.activate(this.notAuthenticatedView, 'home');

            }
        };
        //Router.prototype.membership = function () {
        //    this.activate(this.membershipView, 'membership');
        //};
        Router.prototype.notFound = function () {
            this.activate(this.notFoundView);
        };
        Router.prototype.activate = function (view, menu) {
            if (this.currentView) {
                if (this.currentView == view) {
                    return;
                }
                this.currentView.deactivate();
            }
            if (menu) {
                this.navigationView.select(menu);
            } else {
                try {
                    this.navigationView.deselectAll();
                } catch (e) {

                }
            }
            this.currentView = view;
            this.currentView.activate();
        };
        Router.prototype.initialize = function () {
            this.navigationView = new Application.Views.Navigation();

            this.homeView = new Application.Views.Page({
                className: 'page',
                model: new Backbone.Model({
                    idAttribute: 'ID',
                    urlRoot: '/api/timesheets'
                }),
                template: _.template($('#tempHome').html())
            });
            this.notAuthenticatedView = new Application.Views.Page({
                className: 'page',
                template: _.template($('#tempHome').html()),
                model: new Backbone.Model({
                    idAttribute: 'ID',
                    urlRoot: '/api/timesheets'
                }),
            });

            if (sessionStorage.getItem('userData') !== null) {
                $('#container').prepend(this.homeView.render().$el);
            }
            else {
                $('#container').prepend(this.homeView.render().$el, this.notAuthenticatedView.render().$el.html('<h3>Login or register to access your timesheets.</h3>'));
            }

            var timesheets = Backbone.Model.extend({
                urlRoot: "/api/timesheets",
                idAttribute: "ID"

            });

            var timesheets_collection = Backbone.Collection.extend({
                model: timesheets,
                url: "/api/timesheets",
                idAttribute: "ID"
            });

            _vNotAuthenticated = this.notAuthenticatedView;
            _vHome = this.homeView;

            var timesheet_list_view = Backbone.View.extend({
                el: $('#timesheetTable'),
                initialize: function () {
                    this.model.bind("add", this.render, this);
                },
                silent: true,
                render: function () {
                    var that = this;
                    that.$el.html('<thead style="background-color:lightgray;">' +
                    '<tr>' +
                        '<td><strong>Date</strong></td>' +
                        '<td><strong>Total time</strong></td>' +
                        '<td><strong>Notes</strong></td>' +
                        '<td><strong>Edit</strong></td>' +
                        '<td><strong>Delete</strong></td>' +
                    '</tr>' +
               ' </thead>');
                    _.each(this.model.models, function (data)
                    { this.$el.append(new timesheet_view({ model: data }).render().el); }, this);
                    return this;
                }
            });

            var timesheet_view = Backbone.View.extend({
                tagName: "tr",
                idAttribute: "ID",
                template0: _.template($('#timesheetTableRows').html()),
                template1: _.template($('#timesheetTableRows1').html()),
                events: {
                    'click #btnDeleteTimesheet': "deleteTimesheet",
                    'click #btnEditTimesheet': "editTimesheet"
                },
                initialize: function (options) {
                    if (Number(this.model.toJSON().TotalTime) > Number(sessionStorage.getItem("userDataPreferredWorkingHours"))) {
                        console.log(sessionStorage.getItem("userDataPreferredWorkingHours"));
                        this.template = this['template' + '1'];
                    } else
                    {
                        this.template = this['template' + '0'];
                    }

                      
                        
                    
                },
                deleteTimesheet: function () {
                    var self = this;
                    this.model.destroy({
                        success: function () {
                            self.remove();
                            self.render();
                            $.showInfobar('You have successfully deleted timesheet.');
                        },
                        error: function () { alert('delete error'); }
                    });
                },
                editTimesheet: function () {
                    var self = this;
                    var view = new EditTimesheetView();

                    view.render().showModal(
                        {
                        });
                    document.getElementById("txtIDEdit").value = this.model.get('ID');
                    document.getElementById("txtEditTimesheetDate").value = $.format.date(new Date(this.model.get('DateOfSheet')), 'dd/MM/yyyy');
                    document.getElementById("txtEditTotalTime").value = this.model.get('TotalTime');
                    document.getElementById("txtEditNotes").value = this.model.get('Notes');
                    
                },
                render: function () {
                    var that = this;
                    that.$el.html("");
                    that.$el.html(that.template(that.model.toJSON()));
                    return this;
                }
            });
            var user = Backbone.Model.extend({
                urlRoot: "/api/users",
                idAttribute: "ID"
            });

            var users_collection = Backbone.Collection.extend({
                model: user,
                url: "/api/users"
            });

            membershipView = Backbone.ModalView.extend(
   {
       name: "membershipView",
       model: user,
       template: _.template($("#tempMembership").html()),
       render:
       function () {
           _view = this;
           $(this.el).html(this.template());
           window.sessionStorage.clear();
           return this;
       },
       events: {
           'click #btnSignIn': "signIn",
           'click #btnCloseUserDialog': "closeModalDialog",
           'click #btnSignUp': "saveUser"

       },
       signIn: function (event) {

           var email = this.$el.find("#tboxSignInEmail").val();
           var pass = this.$el.find("#tboxSignInPassword").val();
           var chboxrememberMe = $('#checkbox').prop('checked');
           var that = this;
           var u = new users_collection();
           u.fetch({
               headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
               success: function () {

                   var AuthenticatedUser = u.findWhere({ 'Email': email, 'Password': pass });
                   if (typeof AuthenticatedUser === 'undefined') {
                       document.getElementById("wrongAuthenticationData").style.display = 'block';
                   } else {

                       sessionStorage.setItem('userID', AuthenticatedUser.id);
                       sessionStorage.setItem('userData', AuthenticatedUser.toJSON().Email);
                       sessionStorage.setItem('userDataPassword', AuthenticatedUser.toJSON().Password);
                       sessionStorage.setItem('userDataPreferredWorkingHours', AuthenticatedUser.toJSON().PreferredWorkingHours);
                       if (chboxrememberMe == true) {
                           alert("cookie created");
                           $.cookie("username", u, { expires: 365 })
                       }
                       _view.closeModalDialog();
                       document.getElementById("btnLogOff").style.display = 'block';
                       Router.prototype.activate(_vHome);
                       _vNotAuthenticated.remove();
                       var d = new timesheets_collection();
                       d.fetch({
                           headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                           success: function () {
                               var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                               var view = new timesheet_list_view({ model: dfilteredByUser }).render();
                           }
                       });
                   }

                   var logged = sessionStorage.getItem('userData');
                   document.getElementById("loggedInUser").innerHTML = 'Logged in: ' + logged;
               }
           });
       },
       saveUser: function () {
           document.getElementById("wrongAuthenticationData").style.display = 'none';
           document.getElementById("lblrequiredFields").style.display = 'none';
           document.getElementById("lblpasswordConfirm").style.display = 'none';
           document.getElementById("lblEmailVal").style.display = 'none';
           document.getElementById("lblUserExists").style.display = 'none';
           var email = this.$el.find("#sign-up-email").val();
           var password = this.$el.find("#sign-up-password").val();
           var passwordConfirm = this.$el.find("#sign-up-confirm-password").val();
           var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;

           var emailtbox = this.$el.find("#sign-up-email");
           var passtbox = this.$el.find("#sign-up-password");
           var conpasstbox = this.$el.find("#sign-up-confirm-password");

           if (email == '' || password == '') {
               document.getElementById("lblrequiredFields").style.display = 'block';
           } else if (password != passwordConfirm) {
               document.getElementById("lblpasswordConfirm").style.display = 'block';
           } else if (!re.test(email)) {
               document.getElementById("lblEmailVal").style.display = 'block';
           }
           else {

               var u = new users_collection();

               u.fetch({
                   headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                   success: function () {
                       var checkExistingUser = u.where({ 'Email': email });
                       try {
                           sessionStorage.setItem('UserEmail', checkExistingUser.toJSON().Email);
                       }
                       catch (err) { }
                       if (checkExistingUser.length > 0) {
                           document.getElementById("lblUserExists").style.display = 'block';
                       } else {
                           var usertmp = new user({ Password: password, Email: email,PreferredWorkingHours:8, IsDeleted: 0, CreatedDate: Date.now });
                           usertmp.save({}, {
                               success: function () {
                                   emailtbox.val('');
                                   passtbox.val('');
                                   conpasstbox.val('');
                                   document.getElementById("lblRegistrationSuccessfull").style.display = 'block';
                               },
                               error: function () { alert('add error'); }
                           });

                       }
                   }
               });
           }
       },
       closeModalDialog: function () {
           this.hideModal();
       }
   });

            AddTimesheetView = Backbone.ModalView.extend(
          {
              name: "AddTimesheetView",
              model: timesheets,
              template: _.template($("#tempAddTimesheet").html()),


              render:
              function () {
                  $(this.el).html(this.template());
                  return this;
              },
              events: {
                  'click #btnSave': "saveTimesheet",
                  'click #btnCancel': "cancelSave",
                  'click #btnClose': "closeModalDialog"
              },
              cancelSave: function (event) {
                  event.preventDefault();
                  this.hideModal();

                  var d = new timesheets_collection();
                  d.fetch({
                      headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                      success: function () {
                          var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                          var view = new timesheet_list_view({ model: dfilteredByUser }).render();
                      }
                  });

              },
              saveTimesheet: function () {

                
                  var TimesheetDateOfSheet = this.$el.find("#txtAddTimesheetDate").val();
                  var TimesheetTotalTime = this.$el.find("#txtAddTotalTime").val();
                  var TimesheetNotes = this.$el.find("#txtAddNotes").val();
                  var TimesheetUserID = sessionStorage.getItem('userID');
                  var year = TimesheetDateOfSheet.toString().substring(6, 10);
                  var month = TimesheetDateOfSheet.toString().substring(3, 5);
                  var day = TimesheetDateOfSheet.toString().substring(0, 2);
                  var dateForSQL = year + '/' + month + '/' + day;
                  if (TimesheetDateOfSheet == '') {
                      document.getElementById("lblAddTimesheetSuccess").style.display = 'none';
                      document.getElementById("lblAddTimesheetRequiredFields").style.display = 'none';
                      document.getElementById("lblAddTimesheetTotalTimeInteger").style.display = 'none';
                      document.getElementById("lblAddTimesheetRequiredFields").style.display = 'block';
                  } else if (TimesheetTotalTime == '') {
                      document.getElementById("lblAddTimesheetSuccess").style.display = 'none';
                      document.getElementById("lblAddTimesheetRequiredFields").style.display = 'none';
                      document.getElementById("lblAddTimesheetTotalTimeInteger").style.display = 'none';
                      document.getElementById("lblAddTimesheetTotalTimeInteger").style.display = 'block';
                  }
                  else {
                      var timesheettmp = new timesheets({ DateOfSheet: dateForSQL, TotalTime: TimesheetTotalTime, Notes: TimesheetNotes, UserID: TimesheetUserID });
                      timesheettmp.save({}, {
                          success: function () {
                              $("#txtAddTimesheetDate").val('');
                              $("#txtAddTotalTime").val('');
                              $("#txtAddNotes").val('');
                              document.getElementById("lblAddTimesheetSuccess").style.display = 'none';
                              document.getElementById("lblAddTimesheetRequiredFields").style.display = 'none';
                              document.getElementById("lblAddTimesheetTotalTimeInteger").style.display = 'none';
                              document.getElementById("lblAddTimesheetRequiredFields").style.display = 'none';
                              $.showInfobar('You have successfully added timesheet.');
                              document.getElementById("lblAddTimesheetSuccess").style.display = 'block';
                              $("#txtAddTimesheetDate").focus();
                          },
                          error: function () { alert('add error'); }
                      });
                  }
              },
              closeModalDialog: function (event) {
                  event.preventDefault();
                  this.hideModal();
                  var d = new timesheets_collection();
                  d.fetch({
                      headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                      success: function () {
                          var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                          var view = new timesheet_list_view({ model: dfilteredByUser }).render();
                      }
                  });
              }
          });

            EditTimesheetView = Backbone.ModalView.extend(
         {
             name: "EditTimesheetView",
             model: user,
             template: _.template($("#tempEditTimesheet").html()),
             render:
             function () {
                 $(this.el).html(this.template());
                 return this;
             },
             events: {
                 'click #btnSaveEdit': "saveTimesheet",
                 'click #btnCancelEdit': "cancelSave",
                 'click #btnCloseEdit': "closeModalDialog"
             },
             cancelSave: function (event) {
                 event.preventDefault();
                 this.hideModal();

                 var d = new timesheets_collection();
                 d.fetch({
                     headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                     success: function () {
                         var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                         var view = new timesheet_list_view({ model: dfilteredByUser }).render();

                     }
                 });

             },
             saveTimesheet: function () {

                 var TimesheetDateOfSheet = this.$el.find("#txtEditTimesheetDate").val();
                // console.log(this.$el.find("#txtEditTimesheetDate").val());
                 var TimesheetID = this.$el.find("#txtIDEdit").val();
                 var TimesheetTotalTime = this.$el.find("#txtEditTotalTime").val();
                 var TimesheetNotes = this.$el.find("#txtEditNotes").val();
                 var TimesheetUserID = sessionStorage.getItem('userID');
                 var year = TimesheetDateOfSheet.toString().substring(6, 10);
                 var month = TimesheetDateOfSheet.toString().substring(3, 5);
                 var day = TimesheetDateOfSheet.toString().substring(0, 2);
                 var dateForSQL = year + '/' + month + '/' + day;

                 if (TimesheetDateOfSheet == '') {
                     document.getElementById("lblEditTimesheetRequiredFields").style.display = 'none';
                     document.getElementById("lblEditTimesheetAmountInteger").style.display = 'none';
                     document.getElementById("lblEditTimesheetRequiredFields").style.display = 'block';
                 } else if (TimesheetTotalTime == '') {
                     document.getElementById("lblEditTimesheetRequiredFields").style.display = 'none';
                     document.getElementById("lblEditTimesheetAmountInteger").style.display = 'none';
                     document.getElementById("lblEditTimesheetAmountInteger").style.display = 'block';
                 } else {
                         var timesheettmp = new timesheets({ ID: TimesheetID, DateOfSheet: dateForSQL, TotalTime: TimesheetTotalTime, Notes: TimesheetNotes, IsDeleted: 0, UserID: TimesheetUserID, CreatedDate: new Date()});
                         var that = this;
                         
                     timesheettmp.save(null, {
                         type: 'put',
                         error: function (m, r) {
                             //console.log(r.statusText);
                             if (r.status != 200) {
                                 that.closeModalDialog();
                                 $.showInfobar('Error editing timesheet. Timesheet not found.');
                                 //console.log(r.status+' '+r.statusText);
                             }
                             else {
                                 that.closeModalDialog();
                                 $.showInfobar('You have successfully edited timesheet.');
                             }
                         }
                     });
                 }
             },
             closeModalDialog: function (event) {
                 //event.preventDefault();
                 this.hideModal();
                 var d = new timesheets_collection();
                 d.fetch({
                     headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                     success: function () {
                         var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                         var view = new timesheet_list_view({ model: dfilteredByUser }).render();
                     }
                 });
             }
         });
            EditSettingsView = Backbone.ModalView.extend(
        {
            name: "EditSettingsView",
            model: user,
            template: _.template($("#tempEditSettings").html()),


            render:
            function () {
                $(this.el).html(this.template());
               
                return this;
            },
            events: {
                'click #btnSave': "saveTimesheet",
                'click #btnCancel': "cancelSave",
                'click #btnClose': "closeModalDialog"
            },
            cancelSave: function (event) {
                event.preventDefault();
                this.hideModal();

                var d = new timesheets_collection();
                d.fetch({
                    headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                    success: function () {
                        var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                        var view = new timesheet_list_view({ model: dfilteredByUser }).render();
                    }
                });

            },
            saveTimesheet: function () {


                var PreferredWokingHours = this.$el.find("#txtEditWorkingHours").val();
                if (PreferredWokingHours === '' || Number(PreferredWokingHours) > 24 || Number(PreferredWokingHours) < 1) {
                    $.showInfobar('Preferred working hours setting is mandatory and cannot be more than 24h and less that 1h.');
                } else
                {
                    var usertmp = new user({ ID: Number(sessionStorage.getItem('userID')),Email:sessionStorage.getItem('userData'),Password:sessionStorage.getItem('userDataPassword'), PreferredWorkingHours: PreferredWokingHours,IsDeleted:0,CreatedDate:new Date() });
                    usertmp.save({ }, {
                        success: function () {
                            sessionStorage.setItem('userDataPreferredWorkingHours', PreferredWokingHours);
                            $.showInfobar('You have successfully edited preferred working hours per day setting.');
                        },
                        error: function () { alert('edit error'); }
                    });
                }
                   
                
            },
            closeModalDialog: function (event) {
                event.preventDefault();
                this.hideModal();
                var d = new timesheets_collection();
                d.fetch({
                    headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                    success: function () {
                        var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                        var view = new timesheet_list_view({ model: dfilteredByUser }).render();
                    }
                });
            }
        });
            if (sessionStorage.getItem('userData') !== null) {
                var d = new timesheets_collection();
                d.fetch({
                    headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                    success: function () {
                        var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                        var view = new timesheet_list_view({ model: dfilteredByUser }).render();
                    }
                });
                var logged = sessionStorage.getItem('userData');
                document.getElementById("loggedInUser").innerHTML = 'Logged in: ' + logged;
            }

            $("#btnMembership").click(
                        function (event) {
                            var view = new membershipView();
                            view.render().showModal({});
                        });
            $("#txtSearch").on("keydown", function (event) {
                if (event.which == 13) {
                    searchTimesheet();
                }
            });

            function searchTimesheet() {
                var d = new timesheets_collection();
                d.fetch({
                    headers: { 'Authorization': 'Basic ' + sessionStorage.getItem('userData') },
                    success: function () {
                        var search = $("#txtSearch").val();
                        var fromValue = $("#txtFrom").val();
                        var toValue = $("#txtTo").val();
                        var dfilteredByUser = new timesheets_collection(d.where({ UserID: Number(sessionStorage.getItem('userID')) }));
                        if ((fromValue === '' || toValue === '')) {

                            var filter = dfilteredByUser.filter(function (model) {
                                return _.some(
                                  [String(model.get('TotalTime')), model.get('Notes')],
                                  function (value) {
                                      return value.toLowerCase().indexOf(search) != -1;
                                  });
                            });

                            var dfiltered = new timesheets_collection(filter);
                            var view = new timesheet_list_view({ model: dfiltered }).render();
                        } else {

                            var filter = dfilteredByUser.filter(function (model) {
                                return _.some(
                                    [String(model.get('TotalTime')), model.get('Notes')],
                                    function (value1) {

                                        return value1.toLowerCase().indexOf(search) != -1;
                                    });
                            });

                            var filter2 = dfilteredByUser.filter(function (model) {
                                return _.some(
                                    [model.get('DateOfSheet')],
                                    function (value2) {

                                        if (($.format.date(new Date(value2), 'dd/MM/yyyy') >= fromValue) && ($.format.date(new Date(value2), 'dd/MM/yyyy') <= toValue)) {
                                            return value2;
                                        }
                                    });
                            });
                            var dfiltered = new timesheets_collection(filter);
                            var dfiltered2 = new timesheets_collection(filter2);
                            if (search == '') {
                                var view = new timesheet_list_view({ model: dfiltered2 }).render();
                            } else {
                                var view = new timesheet_list_view({ model: dfiltered2.set(filter) }).render();
                            }
                        }
                    }
                });
            }

            $("#btnSearch").click(
                   function () {
                       searchTimesheet();

                   }
                      );

            $("#btnAddNewTimesheet").click(
           function (event) {
               var view = new AddTimesheetView();
               view.render().showModal(
               {
                   x: event.pageX,
                   y: event.pageY
               });
           });
            $("#btnSettings").click(
                      function (event) {
                          if (sessionStorage.getItem('userData') === null) {
                              event.preventDefault();
                          } else {
                              var view = new EditSettingsView();
                              view.render().showModal(
                              {
                                  x: event.pageX,
                                  y: event.pageY
                              });
                              document.getElementById("txtEditWorkingHours").value = sessionStorage.getItem("userDataPreferredWorkingHours");
                          }
                      });
            $("#btnSearchPH").click(
           function () {
               var divresult = document.getElementById("divSearch").style.display;
               if (divresult == 'none') {
                   document.getElementById("divSearch").style.display = 'block';
                   document.getElementById("btnSearchPH").className = 'btn btn-info';
               } else if (divresult == 'block') {
                   document.getElementById("divSearch").style.display = 'none';
                   document.getElementById("btnSearchPH").className = 'btn';
               }


           });
            $("#btnLogOff").click(
                     function () {
                         sessionStorage.clear();
                         document.getElementById("btnLogOff").style.display = 'none';
                         document.getElementById("loggedInUser").value = '';
                     });
            $("#btndtFrom").click(
                    function () {
                        $('#dtFrom').datepicker();
           

                    });
            $("#btndtTo").click(
                   function () {
                       $('#dtTo').datepicker();

                   });
            $('#dtFrom').datepicker().on('changeDate', function (ev) {
                $("#txtFrom").val($.format.date(new Date(ev.date.valueOf()), 'dd/MM/yyyy'));
               // var val = "senad";
                //$.post('<%= Url.Action("Foo") %>', { value: val }, function (result) {
                //    // TODO: handle the success
                //    alert('the value was successfully sent to the server');
                
                //});
                //$.post('#', { value: val }, function (result) {
                //    // TODO: handle the success
                //    //alert('the value was successfully sent to the server');

                  
                //});
                searchTimesheet();
               
        
            });
            $('#dtTo').datepicker().on('changeDate', function (ev) {
                $("#txtTo").val($.format.date(new Date(ev.date.valueOf()), 'dd/MM/yyyy'));
                searchTimesheet();
            });




            $("#lnkReport").click(
                  function (event) {
                      if (sessionStorage.getItem('userData') === null) {
                          event.preventDefault();
                      } else {
                          event.preventDefault;
                          var url = "Report" + "?";
                          url += "fromDate=" + $("#txtFrom").val();
                          url += "&toDate=" + $("#txtTo").val();
                          url += "&searchString=" + $("#txtSearch").val();
                          document.location.href = url;
                      }
                  });
            this.notFoundView = new Application.Views.NotFound();

        };
        return Router;
    })(Backbone.Router);
    Application.Router = Router;
    Router.prototype.routes = {
        '!/report': 'report',
        '!/': 'home',
        '*path': 'notFound'
    };
})(Application || (Application = {}));
