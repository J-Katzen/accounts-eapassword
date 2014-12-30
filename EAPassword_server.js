var bcrypt = NpmModuleBCrypt;
var bcryptHash = Meteor.wrapAsync(bcrypt.hash);
var bcryptCompare = Meteor.wrapAsync(bcrypt.compare);

Accounts._bcryptRounds = 10;

var getPasswordString = function (password) {
    if (typeof password === "string") {
        password = SHA256(password);
    } else { // 'password' is an object
        if (password.algorithm !== "sha-256") {
            throw new Error("Invalid password hash algorithm. " +
            "Only 'sha-256' is allowed.");
        }
        password = password.digest;
    }
    return password;
};

var hashPassword = function (password) {
    password = getPasswordString(password);
    return bcryptHash(password, Accounts._bcryptRounds);
};

Accounts._checkEAPassword = function(user, EAEmail, password) {
    var result = {
        userId: user._id;
    };

    password = getPasswordString(password);

    if(!bcryptCompare(password, user.service.EAPassword.bcrypt)) {
        result.error = new Meteor.Error(403, "Incorrect password");
    }

    if(!user.managedByEA || user.managedByEA.email !== EAEmail) {
        result.error = new Meteor.Error(403, "Incorrect EA Email");
    }

    return result;
};
var checkPassword = Accounts._checkEAPassword;

var selectorFromUserQuery = function (user) {
    if (user.id)
        return {_id: user.id};
    else if (user.username)
        return {username: user.username};
    else if (user.email)
        return {"emails.address": user.email};
    throw new Error("shouldn't happen (validation missed something)");
};

var findUserFromUserQuery = function (user) {
    var selector = selectorFromUserQuery(user);

    var user = Meteor.users.findOne(selector);
    if (!user)
        throw new Meteor.Error(403, "User not found");

    return user;
};

// XXX maybe this belongs in the check package
var NonEmptyString = Match.Where(function (x) {
    check(x, String);
    return x.length > 0;
});

var userQueryValidator = Match.Where(function (user) {
    check(user, {
        id: Match.Optional(NonEmptyString),
        username: Match.Optional(NonEmptyString),
        email: Match.Optional(NonEmptyString)
    });
    if (_.keys(user).length !== 1)
        throw new Match.Error("User property must have exactly one field");
    return true;
});

var passwordValidator = Match.OneOf(
    String,
    { digest: String, algorithm: String }
);

Accounts.registerLoginHandler("EAPassword", function (options) {
    if (!options.EAPassword)
        return undefined; // don't handle

    check(options, {
        user: userQueryValidator,
        EAEmail: String,
        EAPassword: passwordValidator
    });

    var user = findUserFromUserQuery(options.user);

    if (!user.services || !user.services.EAPassword ||
        !(user.services.EAPassword.bcrypt))
        throw new Meteor.Error(403, "User has no password set");

    return checkPassword(
        user,
        options.EAEmail,
        options.EAPassword
    );
});

Meteor.methods({changeEAPassword: function(oldPassword, newPassword) {
    check(oldPassword, passwordValidator);
    check(newPassword, passwordValidator);

    if(!this.userId)
        throw new Meteor.Error(401, "Must be logged in");

    var user = Meteor.users.findOne(this.userId);
    if(!user)
        throw new Meteor.Error(403, "User not found");

    if(!user.services || !user.services.EAPassword ||
     !user.services.EAPassword.bcrypt)
        throw new Meteor.Error(403, "User has no EAPassword set");

    var result = checkPassword(user, oldPassword);
    if(result.error)
        throw result.error;

    var hashed = hashPassword(newPassword);
    Meteor.users.update({_id: this.userId},
        {$set: {'services.EAPassword.bcrypt': hashed}});
    return {passwordChanged: true};
}});

Accounts.setEAPassword = function(userId, newPlaintextPassword) {
    var user = Meteor.users.findOne(userId);
    if(!user)
        throw new Meteor.Error(403, "User not found");

    Meteor.users.update({_id: user._id},
        {$set: {'services.EAPassword.bcrypt': hashPassword(newPlaintextPassword)}});
};

var createEALogin = function(userId, options) {
    check(options, Match.ObjectIncluding({
        EAEmail: String,
        EAPassword: String
    }));
    var email = options.EAEmail;
    if(!email)
        throw new Meteor.Error(400, "Need to set an email adderss");

    var user = Meteor.users.findOne(userId);
    if(!user)
        throw new Meteor.Error(403, "User not found");

    var hashed = hashPassword(options.EAPassword);
    return Meteor.users.update({_id: userId}, {$set: {'services.EAPassword.bcrypt': hashed}});;
};

Meteor.methods({createEALogin: function(options) {
    check(options, Object);

    if(!this.userId)
        throw new Meteor.Error(401, "Must be logged in");

    var updated = createEALogin(this.userId, options);
    if(updated === 0)
        throw new Error("createEALogin failed to register the login");

    return {EALoginCreated: true};
}});

Accounts.createEALogin = function(userId, options) {
    options = _.clone(options);
    return createEALogin(userId, options);
};
