Meteor.loginWithEAPassword = function (selector, EAEmail, password, callback) {
    if (typeof selector === 'string')
        if (selector.indexOf('@') === -1)
            selector = {username: selector};
        else
            selector = {email: selector};

    Accounts.callLoginMethod({
        methodArguments: [{
            user: selector,
            EAEmail: EAEmail,
            EAPassword: hashPassword(password)
        }],
        userCallback: function (error, result) {
            if (error) {
                callback && callback(error);
            } else {
                callback && callback();
            }
        }
    });
};

var hashPassword = function (password) {
    return {
        digest: SHA256(password),
        algorithm: "sha-256"
    };
};

Accounts.changeEAPassword = function(oldPassword, newPassword, callback) {
    if(!Meteor.user()) {
        callback && callback(new Error("Must be logged in to change passwords."));
        return;
    }

    check(newPassword, String);
    if(!newPassword) {
        callback(new Meteor.Error(400, "Password may not be empty"));
        return;
    }

    Accounts.connection.apply(
        'changeEAPassword',
        [oldPassword ? hashPassword(oldPassword) : null, hashPassword(newPassword)],
        function(error, result) {
            if(error || !result) {
                callback && callback(error || new Error("No result from changeEAPassword"));
            } else {
                callback && callback();
            }
        }
    );
};

Accounts.createEALogin = function(options, callback) {
    options = _.clone(options);
    if (typeof options.EAPassword !== 'string')
        throw new Error("Must set options.EAPassword");
    if(!options.EAPassword){
        callback(new Meteor.Error(400, "Password may not be empty"));
        return;
    }

    options.EAPassword = hashPassword(options.EAPassword);

    Accounts.connection.apply(
        'createEALogin',
        [options],
        function(error, result) {
            if(error || !result) {
                callback && callback(error || new Error("No result from createEALogin"));
            } else {
                callback && callback();
            }
        }
    );
};
