module.exports = function(app){
    var SplitForm = Object.getPrototypeOf(app).SplitForm = new app.Component("splitForm");
    // SplitForm.debug = true;
    SplitForm.createdAt      = "2.0.0";
    SplitForm.lastUpdate     = "2.0.0";
    SplitForm.version        = "1";
    // SplitForm.factoryExclude = true;
    // SplitForm.loadingMsg     = "This message will display in the console when component will be loaded.";
    // SplitForm.requires       = [];

    // SplitForm.prototype.onCreate = function(){
    // do thing after element's creation
    // }
    return SplitForm;
}